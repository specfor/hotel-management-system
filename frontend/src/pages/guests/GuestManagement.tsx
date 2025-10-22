import React, { useState, useEffect, useCallback } from "react";
import { Plus, Search, Edit, Trash2, Eye, User, CreditCard } from "lucide-react";
import Table from "../../components/primary/Table";
import Button from "../../components/primary/Button";
import Input from "../../components/primary/Input";
import Badge from "../../components/primary/Badge";
import Modal from "../../components/Modal";
import ConfirmationModal from "../../components/ConfirmationModal";
import { useAlert } from "../../hooks/useAlert";
import { useModal } from "../../hooks/useModal";
import GuestDetailsModal from "./GuestDetailsModal";
import type { Guest, GuestFilters, GuestFormData } from "../../types/guest";
import type { TableColumn } from "../../types/table";

// API integration ready - import and use:
import { getGuests, createGuest, updateGuest, deleteGuest, sendPasswordReset } from "../../api_connection/guests";
import type { CreateGuestRequest, UpdateGuestRequest, SendPasswordResetRequest } from "../../api_connection/guests";

const GuestManagement: React.FC = () => {
  const { showSuccess, showError } = useAlert();
  const { openModal, closeModal } = useModal();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [filters, setFilters] = useState<GuestFilters & { search: string }>({
    search: "",
    name: "",
    nic: "",
    email: "",
    contact_number: "",
    age_min: undefined,
    age_max: undefined,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [formData, setFormData] = useState<GuestFormData>({
    nic: "",
    name: "",
    age: "",
    contact_number: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [sendPasswordLoading, setSendPasswordLoading] = useState(false);

  // Load guests from API
  const loadGuests = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getGuests({
        page: 1,
        pageSize: 50, // Get more records for demo
      });

      if (response.success && response.data) {
        setGuests(response.data);
      } else {
        showError(response.message || "Failed to load guests");
      }
    } catch (error: unknown) {
      console.error("Error loading guests:", error);
      console.log(error);

      const errorMessage = error instanceof Error ? error.message : "Failed to connect to server";
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadGuests();
  }, [loadGuests]);

  const filteredGuests = guests.filter((guest) => {
    return (
      (!filters.search ||
        guest.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        guest.email.toLowerCase().includes(filters.search.toLowerCase()) ||
        guest.nic.includes(filters.search) ||
        guest.contact_number.includes(filters.search)) &&
      (!filters.nic || guest.nic.toLowerCase().includes(filters.nic.toLowerCase())) &&
      (!filters.age_min || guest.age >= filters.age_min) &&
      (!filters.age_max || guest.age <= filters.age_max)
    );
  });

  const getBookingStatusBadgeVariant = (status?: string) => {
    if (!status) return "secondary";
    switch (status) {
      case "checked_in":
        return "success";
      case "confirmed":
        return "primary";
      case "checked_out":
        return "secondary";
      case "cancelled":
        return "error";
      default:
        return "secondary";
    }
  };

  const formatBookingStatus = (status?: string) => {
    if (!status) return "No Booking";
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const validateForm = (): string | null => {
    if (!formData.nic.trim()) return "NIC is required";
    if (!formData.name.trim()) return "Name is required";
    if (!formData.age.trim()) return "Age is required";
    if (!formData.contact_number.trim()) return "Contact number is required";
    if (!formData.email.trim()) return "Email is required";

    // NIC validation (basic format check)
    const nicRegex = /^[0-9]{9}[vVxX]$|^[0-9]{12}$/;
    if (!nicRegex.test(formData.nic)) {
      return "Please enter a valid NIC number (9 digits + V/X or 12 digits)";
    }

    // Age validation
    const ageValue = parseInt(formData.age);
    if (isNaN(ageValue) || ageValue < 1 || ageValue > 120) {
      return "Please enter a valid age (1-120)";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return "Please enter a valid email address";
    }

    // Phone validation (basic)
    const phoneRegex = /^[+]?[\d\s\-()]+$/;
    if (!phoneRegex.test(formData.contact_number)) {
      return "Please enter a valid contact number";
    }

    // Check for duplicate NIC
    const isDuplicateNIC = guests.some(
      (guest) => guest.nic === formData.nic.toUpperCase() && guest.guest_id !== editingGuest?.guest_id
    );

    if (isDuplicateNIC) {
      return "NIC already exists in the system";
    }

    // Check for duplicate email
    const isDuplicateEmail = guests.some(
      (guest) => guest.email.toLowerCase() === formData.email.toLowerCase() && guest.guest_id !== editingGuest?.guest_id
    );

    if (isDuplicateEmail) {
      return "Email address already exists";
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validationError = validateForm();
      if (validationError) {
        showError(validationError);
        return;
      }

      if (editingGuest) {
        // Update existing guest
        const updateData: UpdateGuestRequest = {
          guest_id: editingGuest.guest_id,
          nic: formData.nic,
          name: formData.name,
          age: parseInt(formData.age),
          contact_no: formData.contact_number,
          email: formData.email,
        };

        const response = await updateGuest(updateData);
        if (response.success) {
          showSuccess("Guest updated successfully!");
          await loadGuests(); // Reload the list
        } else {
          showError(response.message || "Failed to update guest");
        }
      } else {
        // Create new guest
        const createData: CreateGuestRequest = {
          nic: formData.nic,
          name: formData.name,
          age: parseInt(formData.age),
          contact_no: formData.contact_number,
          email: formData.email,
        };

        const response = await createGuest(createData);
        if (response.success) {
          showSuccess("Guest created successfully!");
          await loadGuests(); // Reload the list
        } else {
          showError(response.message || "Failed to create guest");
        }
      }

      resetForm();
    } catch (error: unknown) {
      console.error("Error saving guest:", error);
      const errorMessage = error instanceof Error ? error.message : "An error occurred while saving guest";
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (guest: Guest) => {
    setEditingGuest(guest);
    setFormData({
      nic: guest.nic,
      name: guest.name,
      age: guest.age.toString(),
      contact_number: guest.contact_number,
      email: guest.email,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (guestId: number) => {
    const guest = guests.find((g) => g.guest_id === guestId);
    const guestName = guest ? guest.name : "this guest";

    const modalId = openModal({
      component: (
        <ConfirmationModal
          title="Delete Guest"
          message={`Are you sure you want to delete "${guestName}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
          onConfirm={() => {
            closeModal(modalId);
            performDeleteGuest(guestId);
          }}
          onCancel={() => closeModal(modalId)}
        />
      ),
      size: "sm",
      showCloseButton: false,
    });
  };

  const performDeleteGuest = async (guestId: number) => {
    try {
      const response = await deleteGuest(guestId);
      if (response.success) {
        showSuccess("Guest deleted successfully!");
        await loadGuests(); // Reload the list
      } else {
        showError(response.message || "Failed to delete guest");
      }
    } catch (error: unknown) {
      console.error("Error deleting guest:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to delete guest";
      showError(errorMessage);
    }
  };

  const handleViewDetails = (guest: Guest) => {
    setSelectedGuest(guest);
    setIsDetailsModalOpen(true);
  };

  const handleSendPassword = async (guestId: number) => {
    setSendPasswordLoading(true);
    try {
      const guest = guests.find((g) => g.guest_id === guestId);
      if (!guest) {
        showError("Guest not found");
        return;
      }

      const request: SendPasswordResetRequest = {
        guest_id: guestId,
        email: guest.email,
      };

      const response = await sendPasswordReset(request);
      if (response.success) {
        showSuccess(`New password sent to ${guest.email}`);
      } else {
        showError(response.message || "Failed to send password reset email");
      }
    } catch (error: unknown) {
      console.error("Error sending password reset:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to send password reset email";
      showError(errorMessage);
    } finally {
      setSendPasswordLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nic: "",
      name: "",
      age: "",
      contact_number: "",
      email: "",
    });
    setEditingGuest(null);
    setIsModalOpen(false);
  };

  const columns: TableColumn<Guest>[] = [
    {
      key: "name",
      title: "Guest Information",
      render: (_, guest) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-gray-500" />
            </div>
          </div>
          <div>
            <p className="font-medium text-gray-900">{guest.name}</p>
            <p className="text-sm text-gray-500">{guest.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "nic",
      title: "NIC",
      render: (_, guest) => (
        <div className="flex items-center">
          <CreditCard className="h-4 w-4 text-gray-500 mr-2" />
          <span className="font-mono text-gray-900">{guest.nic}</span>
        </div>
      ),
    },
    {
      key: "age",
      title: "Age",
      render: (_, guest) => <span className="text-gray-900">{guest.age} years</span>,
    },
    {
      key: "contact_number",
      title: "Contact",
      render: (_, guest) => <span className="text-gray-900">{guest.contact_number}</span>,
    },
    {
      key: "current_booking",
      title: "Current Booking",
      render: (_, guest) => (
        <div>
          {guest.current_booking ? (
            <div className="space-y-1">
              <div className="flex items-center text-sm">
                <span className="font-medium">Room {guest.current_booking.room_number}</span>
              </div>
              <Badge variant={getBookingStatusBadgeVariant(guest.current_booking.status)} size="sm">
                {formatBookingStatus(guest.current_booking.status)}
              </Badge>
            </div>
          ) : (
            <Badge variant="secondary" size="sm">
              No Booking
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      render: (_, guest) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewDetails(guest)}
            className="text-blue-600 hover:text-blue-800"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(guest)}
            className="text-green-600 hover:text-green-800"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(guest.guest_id)}
            className="text-red-600 hover:text-red-800"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Guest Management</h1>
          <p className="text-gray-600 mt-1">Manage guest profiles and information</p>
        </div>
        <Button variant="primary" onClick={() => setIsModalOpen(true)} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add Guest</span>
        </Button>
      </div>

      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-4">
          <div className="relative max-w-[600px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search guests..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="pl-10 w-64"
            />
          </div>

          <div className="relative">
            <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by NIC..."
              value={filters.nic || ""}
              onChange={(e) => setFilters({ ...filters, nic: e.target.value })}
              className="pl-10 w-48"
            />
          </div>

          <div className="w-32">
            <Input
              type="number"
              placeholder="Min age"
              value={filters.age_min?.toString() || ""}
              onChange={(e) =>
                setFilters({ ...filters, age_min: e.target.value ? parseInt(e.target.value) : undefined })
              }
              className="w-10"
            />
          </div>

          <div className="w-32">
            <Input
              type="number"
              placeholder="Max age"
              value={filters.age_max?.toString() || ""}
              onChange={(e) =>
                setFilters({ ...filters, age_max: e.target.value ? parseInt(e.target.value) : undefined })
              }
              className="w-24"
            />
          </div>
        </div>

        <div className="flex items-end">
          <Button
            variant="outline"
            onClick={() =>
              setFilters({
                search: "",
                name: "",
                nic: "",
                email: "",
                contact_number: "",
                age_min: undefined,
                age_max: undefined,
              })
            }
            className="w-full"
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Guests Table */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600">Loading guests...</p>
          </div>
        </div>
      ) : filteredGuests.length === 0 && guests.length === 0 ? (
        <div className="text-center py-12">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No guests found</h3>
          <p className="text-gray-600 mb-4">Get started by adding your first guest.</p>
          <Button variant="primary" onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Guest
          </Button>
        </div>
      ) : filteredGuests.length === 0 ? (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No matching guests</h3>
          <p className="text-gray-600">Try adjusting your search criteria.</p>
        </div>
      ) : (
        <Table
          data={filteredGuests as unknown as Record<string, unknown>[]}
          columns={columns as unknown as TableColumn<Record<string, unknown>>[]}
          pagination={{
            current: 1,
            pageSize: 10,
            total: filteredGuests.length,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: true,
            pageSizeOptions: [5, 10, 20, 50],
          }}
        />
      )}

      {/* Guest Form Modal */}
      <Modal isOpen={isModalOpen} onClose={resetForm} title={editingGuest ? "Edit Guest" : "Add New Guest"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">NIC Number *</label>
            <Input
              value={formData.nic}
              onChange={(e) => setFormData({ ...formData, nic: e.target.value })}
              placeholder="199012345678 or 199012345678V"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter full name"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age *</label>
              <Input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                placeholder="25"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number *</label>
              <Input
                value={formData.contact_number}
                onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                placeholder="+1-555-0123"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="guest@email.com"
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={resetForm} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? "Saving..." : editingGuest ? "Update Guest" : "Create Guest"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Guest Details Modal */}
      <GuestDetailsModal
        guest={selectedGuest}
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedGuest(null);
        }}
        onSendPassword={handleSendPassword}
        loading={sendPasswordLoading}
      />
    </div>
  );
};

export default GuestManagement;
