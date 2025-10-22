import React, { useState, useEffect, useCallback } from "react";
import { Plus, Search, Edit, Trash2, Bed } from "lucide-react";
import Button from "../../components/primary/Button";
import Input from "../../components/primary/Input";
import Badge from "../../components/primary/Badge";
import Modal from "../../components/Modal";
import Card from "../../components/primary/Card";
import ConfirmationModal from "../../components/ConfirmationModal";
import { useAlert } from "../../hooks/useAlert";
import { useModal } from "../../hooks/useModal";
import { RoomStatus } from "../../types/room";
import type { Room, Branch, RoomType } from "../../types/room";
import { getBranches } from "../../api_connection/branches";
import { getAllRooms, getAllRoomTypes, createRoom, updateRoom, deleteRoom } from "../../api_connection/rooms";

const RoomManagement: React.FC = () => {
  const { showSuccess, showError } = useAlert();
  const { openModal, closeModal } = useModal();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [branchFilter, setBranchFilter] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [formData, setFormData] = useState<{
    room_number: string;
    branch_id: string;
    room_type_id: string;
    status: string;
  }>({
    room_number: "",
    branch_id: "",
    room_type_id: "",
    status: RoomStatus.AVAILABLE,
  });
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

  const loadRooms = useCallback(async () => {
    try {
      const response = await getAllRooms();
      if (response.success && response.data) {
        setRooms(response.data);
      } else {
        showError("Failed to load rooms");
      }
    } catch (error) {
      console.error("Error loading rooms:", error);
      showError("Failed to load rooms");
    }
  }, [showError]);

  const loadRoomTypes = useCallback(async () => {
    try {
      const response = await getAllRoomTypes();
      if (response.success && response.data) {
        setRoomTypes(response.data);
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
    loadRooms();
    loadRoomTypes();
  }, [loadBranches, loadRooms, loadRoomTypes]);

  const filteredRooms = rooms.filter((room) => {
    return (
      (!searchTerm ||
        room.room_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.branch_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.room_type_name?.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (!statusFilter || room.status === statusFilter) &&
      (!branchFilter || room.branch_id === parseInt(branchFilter))
    );
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case RoomStatus.AVAILABLE:
        return "success";
      case RoomStatus.OCCUPIED:
        return "warning";
      case RoomStatus.MAINTENANCE:
        return "error";
      case RoomStatus.OUT_OF_ORDER:
        return "error";
      default:
        return "secondary";
    }
  };

  const getFilteredRoomTypes = () => {
    if (!formData.branch_id) return [];
    return roomTypes.filter((rt) => rt.branchid === parseInt(formData.branch_id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate form
      if (!formData.room_number.trim() || !formData.branch_id || !formData.room_type_id) {
        showError("Please fill in all required fields");
        return;
      }

      // Check for duplicate room number in the same branch
      const isDuplicate = rooms.some(
        (room) =>
          room.room_number === formData.room_number &&
          room.branch_id === parseInt(formData.branch_id) &&
          room.room_id !== editingRoom?.room_id
      );

      if (isDuplicate) {
        showError("Room number already exists in this branch");
        return;
      }

      const roomType = roomTypes.find((rt) => rt.roomtypeid === parseInt(formData.room_type_id));

      if (editingRoom) {
        // Update existing room
        const updateRequest = {
          roomStatus: formData.status,
          roomTypeName: roomType?.roomtypename,
        };

        const response = await updateRoom(editingRoom.room_id, updateRequest);

        if (response.success) {
          await loadRooms(); // Reload to get updated data
          showSuccess("Room updated successfully!");
        } else {
          showError(response.message || "Failed to update room");
          return;
        }
      } else {
        // Create new room
        const createRequest = {
          branchId: parseInt(formData.branch_id),
          roomType: roomType?.roomtypename || "Single", // Default to Single if not found
        };

        const response = await createRoom(createRequest);

        if (response.success) {
          await loadRooms(); // Reload to get updated data
          showSuccess("Room created successfully!");
        } else {
          showError(response.message || "Failed to create room");
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

  const handleEdit = (room: Room) => {
    setEditingRoom(room);
    setFormData({
      room_number: room.room_number,
      branch_id: room.branch_id.toString(),
      room_type_id: room.room_type_id.toString(),
      status: room.status,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (roomId: number) => {
    const room = rooms.find((r) => r.room_id === roomId);
    const roomInfo = room ? `Room ${room.room_number}` : "this room";

    const modalId = openModal({
      component: (
        <ConfirmationModal
          title="Delete Room"
          message={`Are you sure you want to delete "${roomInfo}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
          onConfirm={() => {
            closeModal(modalId);
            performDeleteRoom(roomId);
          }}
          onCancel={() => closeModal(modalId)}
        />
      ),
      size: "sm",
      showCloseButton: false,
    });
  };

  const performDeleteRoom = async (roomId: number) => {
    try {
      const response = await deleteRoom(roomId);

      if (response.success) {
        await loadRooms(); // Reload to get updated data
        showSuccess("Room deleted successfully!");
      } else {
        showError(response.message || "Failed to delete room");
      }
    } catch (error) {
      console.error("Error deleting room:", error);
      showError("Failed to delete room");
    }
  };

  const resetForm = () => {
    setFormData({
      room_number: "",
      branch_id: "",
      room_type_id: "",
      status: RoomStatus.AVAILABLE,
    });
    setEditingRoom(null);
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
              placeholder="Search rooms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            {Object.values(RoomStatus).map((status) => (
              <option key={status} value={status}>
                {status.replace("_", " ").toUpperCase()}
              </option>
            ))}
          </select>

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
          <span>Add Room</span>
        </Button>
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredRooms.map((room) => (
          <Card key={room.room_id} className="p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center space-x-2">
                <Bed className="h-4 w-4 text-gray-500" />
                <h3 className="text-lg font-semibold text-gray-900">Room {room.room_number}</h3>
              </div>
              <Badge variant={getStatusBadgeVariant(room.status)} size="sm">
                {room.status.replace("_", " ").toUpperCase()}
              </Badge>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Branch:</span>
                <span className="text-sm font-medium">{room.branch_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Type:</span>
                <span className="text-sm font-medium">{room.room_type_name}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEdit(room)}
                className="text-blue-600 hover:text-blue-800"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(room.room_id)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {filteredRooms.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No rooms found</p>
        </div>
      )}

      {/* Room Form Modal */}
      <Modal isOpen={isModalOpen} onClose={resetForm} title={editingRoom ? "Edit Room" : "Add New Room"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Room Number *</label>
            <Input
              value={formData.room_number}
              onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
              placeholder="Enter room number"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Branch *</label>
            <select
              value={formData.branch_id}
              onChange={(e) => setFormData({ ...formData, branch_id: e.target.value, room_type_id: "" })}
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Room Type *</label>
            <select
              value={formData.room_type_id}
              onChange={(e) => setFormData({ ...formData, room_type_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={!formData.branch_id}
            >
              <option value="">Select a room type</option>
              {getFilteredRoomTypes().map((roomType) => (
                <option key={roomType.roomtypeid} value={roomType.roomtypeid}>
                  {roomType.roomtypename}
                </option>
              ))}
            </select>
            {!formData.branch_id && <p className="text-sm text-gray-500 mt-1">Please select a branch first</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as typeof RoomStatus.AVAILABLE })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.values(RoomStatus).map((status) => (
                <option key={status} value={status}>
                  {status.replace("_", " ").toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={resetForm} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? "Saving..." : editingRoom ? "Update Room" : "Create Room"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default RoomManagement;
