import React, { useState, useEffect, useCallback } from "react";
import { Plus, Search, Edit, Trash2, Settings, DollarSign, Users } from "lucide-react";
import Button from "../../components/primary/Button";
import Input from "../../components/primary/Input";
import Modal from "../../components/Modal";
import Card from "../../components/primary/Card";
import ConfirmationModal from "../../components/ConfirmationModal";
import { useAlert } from "../../hooks/useAlert";
import { useModal } from "../../hooks/useModal";
import type { Branch, RoomType } from "../../types/room";
import { getBranches } from "../../api_connection/branches";
import { getAllRoomTypes, createRoomType, updateRoomType, deleteRoomType } from "../../api_connection/rooms";

const RoomTypeManagement: React.FC = () => {
  const { showSuccess, showError } = useAlert();
  const { openModal, closeModal } = useModal();
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [branchFilter, setBranchFilter] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoomType, setEditingRoomType] = useState<RoomType | null>(null);
  const [formData, setFormData] = useState({
    room_type_name: "",
    branch_id: "",
    daily_rate: "",
    late_checkout_rate: "",
    capacity: "",
    amenities: [] as string[],
  });
  const [amenityInput, setAmenityInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Load data
  const loadBranches = useCallback(async () => {
    try {
      const response = await getBranches();
      if (response.success && response.data) {
        const transformedBranches = response.data.map(
          (branch: { branchid: number; branchname: string; city: string; address: string }) => ({
            branch_id: branch.branchid,
            branch_name: branch.branchname,
            city: branch.city,
            address: branch.address,
          })
        );
        setBranches(transformedBranches);
      } else {
        showError("Failed to load branches");
      }
    } catch (error) {
      console.error("Error loading branches:", error);
      showError("Failed to load branches");
    }
  }, [showError]);

  const loadRoomTypes = useCallback(async () => {
    try {
      const response = await getAllRoomTypes();
      if (response.success && response.data) {
        setRoomTypes(
          response.data.map((rt) => ({
            ...rt,
            amenities: typeof rt.amenities === "string" ? rt.amenities.split(",").map((a) => a.trim()) : [],
          }))
        );
      } else {
        showError("Failed to load room types");
      }
    } catch (error) {
      console.error("Error loading room types:", error);
      showError("Failed to load room types");
    }
  }, [showError]);

  useEffect(() => {
    loadBranches();
    loadRoomTypes();
  }, [loadBranches, loadRoomTypes]);

  const filteredRoomTypes = roomTypes.filter((roomType) => {
    return (
      (!searchTerm || roomType.roomtypename.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (!branchFilter || roomType.branchid === parseInt(branchFilter))
    );
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate form
      if (!formData.room_type_name.trim() || !formData.branch_id || !formData.daily_rate || !formData.capacity) {
        showError("Please fill in all required fields");
        return;
      }

      // Check for duplicate room type name in the same branch
      const isDuplicate = roomTypes.some(
        (roomType) =>
          roomType.roomtypename.toLowerCase() === formData.room_type_name.toLowerCase() &&
          roomType.branchid === parseInt(formData.branch_id) &&
          roomType.roomtypeid !== editingRoomType?.roomtypeid
      );

      if (isDuplicate) {
        showError("Room type name already exists in this branch");
        return;
      }

      if (editingRoomType) {
        // Update existing room type
        const updateRequest = {
          dailyRate: parseFloat(formData.daily_rate),
          lateCheckoutRate: parseFloat(formData.late_checkout_rate) || 0,
          capacity: parseInt(formData.capacity),
          amenities: formData.amenities.join(", "), // Convert array to string
        };

        const response = await updateRoomType(editingRoomType.branchid, editingRoomType.roomtypename, updateRequest);

        if (response.success) {
          await loadRoomTypes(); // Reload to get updated data
          showSuccess("Room type updated successfully!");
        } else {
          showError(response.message || "Failed to update room type");
          return;
        }
      } else {
        // Create new room type
        const createRequest = {
          branchId: parseInt(formData.branch_id),
          roomTypeName: formData.room_type_name,
          dailyRate: parseFloat(formData.daily_rate),
          lateCheckoutRate: parseFloat(formData.late_checkout_rate) || 0,
          capacity: parseInt(formData.capacity),
          amenities: formData.amenities.join(", "), // Convert array to string
        };

        const response = await createRoomType(createRequest);

        if (response.success) {
          await loadRoomTypes(); // Reload to get updated data
          showSuccess("Room type created successfully!");
        } else {
          showError(response.message || "Failed to create room type");
          return;
        }
      }

      resetForm();
    } catch {
      showError("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (roomType: RoomType) => {
    console.log(roomType);

    setEditingRoomType(roomType);
    setFormData({
      room_type_name: roomType.roomtypename,
      branch_id: roomType.branchid.toString(),
      daily_rate: roomType.dailyrate.toString(),
      late_checkout_rate: roomType.latecheckoutrate.toString(),
      capacity: roomType.capacity.toString(),
      amenities: [...roomType.amenities],
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (roomTypeId: number) => {
    const roomType = roomTypes.find((rt) => rt.roomtypeid === roomTypeId);
    const roomTypeName = roomType ? roomType.roomtypename : "this room type";

    const modalId = openModal({
      component: (
        <ConfirmationModal
          title="Delete Room Type"
          message={`Are you sure you want to delete "${roomTypeName}"? This action cannot be undone and may affect existing rooms.`}
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
          onConfirm={() => {
            closeModal(modalId);
            performDeleteRoomType(roomTypeId);
          }}
          onCancel={() => closeModal(modalId)}
        />
      ),
      size: "sm",
      showCloseButton: false,
    });
  };

  const performDeleteRoomType = async (roomTypeId: number) => {
    try {
      const roomType = roomTypes.find((rt) => rt.roomtypeid === roomTypeId);
      if (!roomType) {
        showError("Room type not found");
        return;
      }

      const response = await deleteRoomType(roomType.branchid, roomType.roomtypename);

      if (response.success) {
        await loadRoomTypes(); // Reload to get updated data
        showSuccess("Room type deleted successfully!");
      } else {
        showError(response.message || "Failed to delete room type");
      }
    } catch (error) {
      console.error("Error deleting room type:", error);
      showError("Failed to delete room type");
    }
  };

  const addAmenity = () => {
    if (amenityInput.trim() && !formData.amenities.includes(amenityInput.trim())) {
      setFormData({
        ...formData,
        amenities: [...formData.amenities, amenityInput.trim()],
      });
      setAmenityInput("");
    }
  };

  const removeAmenity = (amenity: string) => {
    setFormData({
      ...formData,
      amenities: formData.amenities.filter((a) => a !== amenity),
    });
  };

  const resetForm = () => {
    setFormData({
      room_type_name: "",
      branch_id: "",
      daily_rate: "",
      late_checkout_rate: "",
      capacity: "",
      amenities: [],
    });
    setAmenityInput("");
    setEditingRoomType(null);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search room types..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>

          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Branches</option>
            {branches.map((branch) => (
              <option key={branch.branch_id} value={branch.branch_id}>
                {branch.branch_name}
              </option>
            ))}
          </select>
        </div>

        <Button variant="primary" onClick={() => setIsModalOpen(true)} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add Room Type</span>
        </Button>
      </div>

      {/* Room Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRoomTypes.map((roomType) => (
          <Card key={roomType.roomtypeid} className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-gray-500" />
                <h3 className="text-lg font-semibold text-gray-900">{roomType.roomtypename}</h3>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(roomType)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(roomType.roomtypeid)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Branch:</span>
                <span className="text-sm font-medium">
                  {branches.find((branch) => branch.branch_id === roomType.branchid)?.branch_name}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Capacity:</span>
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">{roomType.capacity} guests</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="text-lg font-bold text-green-600">{roomType.dailyrate}</span>
                  </div>
                  <span className="text-xs text-gray-500">Daily Rate</span>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <DollarSign className="h-4 w-4 text-orange-600" />
                    <span className="text-lg font-bold text-orange-600">{roomType.latecheckoutrate}</span>
                  </div>
                  <span className="text-xs text-gray-500">Late Checkout</span>
                </div>
              </div>

              <div>
                <span className="text-sm text-gray-600 block mb-2">Amenities:</span>
                <div className="flex flex-wrap gap-1">
                  {(Array.isArray(roomType.amenities)
                    ? roomType.amenities
                    : roomType.amenities
                    ? roomType.amenities.split(",").map((a) => a.trim())
                    : []
                  ).length > 0 ? (
                    (Array.isArray(roomType.amenities)
                      ? roomType.amenities
                      : roomType.amenities
                      ? roomType.amenities.split(",").map((a) => a.trim())
                      : []
                    ).map((amenity, index) => (
                      <span
                        key={index}
                        className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                      >
                        {amenity}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-400">No amenities listed</span>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredRoomTypes.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No room types found</p>
        </div>
      )}

      {/* Room Type Form Modal */}
      <Modal isOpen={isModalOpen} onClose={resetForm} title={editingRoomType ? "Edit Room Type" : "Add New Room Type"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Room Type Name *</label>
            <Input
              value={formData.room_type_name}
              onChange={(e) => setFormData({ ...formData, room_type_name: e.target.value })}
              placeholder="Enter room type name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Branch *</label>
            <select
              value={formData.branch_id}
              onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a branch</option>
              {branches.map((branch) => (
                <option key={branch.branch_id} value={branch.branch_id}>
                  {branch.branch_name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Daily Rate ($) *</label>
              <Input
                type="number"
                value={formData.daily_rate}
                onChange={(e) => setFormData({ ...formData, daily_rate: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Late Checkout Rate ($)</label>
              <Input
                type="number"
                value={formData.late_checkout_rate}
                onChange={(e) => setFormData({ ...formData, late_checkout_rate: e.target.value })}
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Capacity (guests) *</label>
            <Input
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              placeholder="Number of guests"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amenities</label>
            <div className="flex space-x-2 mb-2">
              <Input
                value={amenityInput}
                onChange={(e) => setAmenityInput(e.target.value)}
                placeholder="Enter amenity"
              />
              <Button type="button" variant="outline" onClick={addAmenity} disabled={!amenityInput.trim()}>
                Add
              </Button>
            </div>

            {formData.amenities.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {formData.amenities.map((amenity, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full"
                  >
                    {amenity}
                    <button
                      type="button"
                      onClick={() => removeAmenity(amenity)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={resetForm} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? "Saving..." : editingRoomType ? "Update Room Type" : "Create Room Type"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default RoomTypeManagement;
