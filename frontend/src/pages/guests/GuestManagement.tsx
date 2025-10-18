import React, { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, Eye, User, CreditCard } from "lucide-react";
import Table from "../../components/primary/Table";
import Button from "../../components/primary/Button";
import Input from "../../components/primary/Input";
import Badge from "../../components/primary/Badge";
import Modal from "../../components/Modal";
import { useAlert } from "../../hooks/useAlert";
import GuestDetailsModal from "./GuestDetailsModal";
import type { Guest, GuestFilters, GuestFormData } from "../../types/guest";
import type { TableColumn } from "../../types/table";

// API integration ready - import and use:
// import { getGuests, createGuest, updateGuest, deleteGuest, sendPasswordReset } from "../../api_connection/guests";

const GuestManagement: React.FC = () => {
  const { showSuccess, showError } = useAlert();
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

  // Mock data - Replace with API calls
  useEffect(() => {
    // Mock guests data
    setGuests([
      {
        guest_id: 1,
        nic: "199012345678",
        name: "Alice Johnson",
        age: 34,
        contact_number: "+1-555-0201",
        email: "alice.johnson@email.com",
        created_at: "2024-01-10T08:00:00Z",
        updated_at: "2024-01-10T08:00:00Z",
        current_booking: {
          booking_id: 1001,
          room_number: "205",
          check_in_date: "2024-10-15T14:00:00Z",
          check_out_date: "2024-10-20T11:00:00Z",
          status: "checked_in",
        },
      },
      {
        guest_id: 2,
        nic: "198567891234",
        name: "Robert Chen",
        age: 39,
        contact_number: "+1-555-0202",
        email: "robert.chen@email.com",
        created_at: "2024-02-05T09:00:00Z",
        updated_at: "2024-02-05T09:00:00Z",
        current_booking: {
          booking_id: 1002,
          room_number: "304",
          check_in_date: "2024-10-18T14:00:00Z",
          check_out_date: "2024-10-22T11:00:00Z",
          status: "confirmed",
        },
      },
      {
        guest_id: 3,
        nic: "199298765432",
        name: "Emma Davis",
        age: 32,
        contact_number: "+1-555-0203",
        email: "emma.davis@email.com",
        created_at: "2024-01-25T10:00:00Z",
        updated_at: "2024-01-25T10:00:00Z",
        // No current booking
      },
      {
        guest_id: 4,
        nic: "198876543210",
        name: "Michael Brown",
        age: 36,
        contact_number: "+1-555-0204",
        email: "michael.brown@email.com",
        created_at: "2024-03-01T11:00:00Z",
        updated_at: "2024-03-01T11:00:00Z",
        current_booking: {
          booking_id: 1003,
          room_number: "101",
          check_in_date: "2024-10-10T14:00:00Z",
          check_out_date: "2024-10-17T11:00:00Z",
          status: "checked_out",
        },
      },
      {
        guest_id: 5,
        nic: "199545678901",
        name: "Sophie Wilson",
        age: 29,
        contact_number: "+1-555-0205",
        email: "sophie.wilson@email.com",
        created_at: "2024-02-20T12:00:00Z",
        updated_at: "2024-02-20T12:00:00Z",
        current_booking: {
          booking_id: 1004,
          room_number: "408",
          check_in_date: "2024-10-19T14:00:00Z",
          check_out_date: "2024-10-25T11:00:00Z",
          status: "confirmed",
        },
      },
    ]);
  }, []);

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
        const updatedGuest: Guest = {
          ...editingGuest,
          nic: formData.nic.toUpperCase(),
          name: formData.name.trim(),
          age: parseInt(formData.age),
          contact_number: formData.contact_number.trim(),
          email: formData.email.trim().toLowerCase(),
          updated_at: new Date().toISOString(),
        };

        setGuests(guests.map((g) => (g.guest_id === editingGuest.guest_id ? updatedGuest : g)));
        showSuccess("Guest updated successfully!");
      } else {
        // Create new guest
        const newGuest: Guest = {
          guest_id: Math.max(...guests.map((g) => g.guest_id), 0) + 1,
          nic: formData.nic.toUpperCase(),
          name: formData.name.trim(),
          age: parseInt(formData.age),
          contact_number: formData.contact_number.trim(),
          email: formData.email.trim().toLowerCase(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        setGuests([...guests, newGuest]);
        showSuccess("Guest created successfully!");
      }

      resetForm();
    } catch {
      showError("An error occurred while saving guest");
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
    if (!window.confirm("Are you sure you want to delete this guest?")) return;

    try {
      setGuests(guests.filter((g) => g.guest_id !== guestId));
      showSuccess("Guest deleted successfully!");
    } catch {
      showError("Failed to delete guest");
    }
  };

  const handleViewDetails = (guest: Guest) => {
    setSelectedGuest(guest);
    setIsDetailsModalOpen(true);
  };

  const handleSendPassword = async (guestId: number) => {
    setSendPasswordLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const guest = guests.find((g) => g.guest_id === guestId);
      showSuccess(`New password sent to ${guest?.email}`);
    } catch {
      showError("Failed to send password reset email");
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
