import React, { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, Bed } from "lucide-react";
import Button from "../../components/primary/Button";
import Input from "../../components/primary/Input";
import Badge from "../../components/primary/Badge";
import Modal from "../../components/Modal";
import Card from "../../components/primary/Card";
import { useAlert } from "../../hooks/useAlert";
import { RoomStatus } from "../../types/room";
import type { Room, Branch, RoomType } from "../../types/room";

const RoomManagement: React.FC = () => {
  const { showSuccess, showError } = useAlert();
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

  // Mock data - Replace with API calls
  useEffect(() => {
    // Mock rooms data
    setRooms([
      {
        room_id: 1,
        room_number: "101",
        branch_id: 1,
        room_type_id: 1,
        status: RoomStatus.AVAILABLE,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        branch_name: "Downtown Branch",
        room_type_name: "Standard Single",
      },
      {
        room_id: 2,
        room_number: "102",
        branch_id: 1,
        room_type_id: 2,
        status: RoomStatus.OCCUPIED,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        branch_name: "Downtown Branch",
        room_type_name: "Deluxe Double",
      },
      {
        room_id: 3,
        room_number: "201",
        branch_id: 2,
        room_type_id: 3,
        status: RoomStatus.MAINTENANCE,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        branch_name: "Airport Branch",
        room_type_name: "Suite",
      },
    ]);

    // Mock branches data
    setBranches([
      {
        branch_id: 1,
        branch_name: "Downtown Branch",
        city: "Downtown",
        address: "123 Main St",
      },
      {
        branch_id: 2,
        branch_name: "Airport Branch",
        city: "Airport",
        address: "456 Airport Rd",
      },
      {
        branch_id: 3,
        branch_name: "Beach Resort",
        city: "Beach",
        address: "789 Beach Ave",
      },
    ]);

    // Mock room types data
    setRoomTypes([
      {
        room_type_id: 1,
        room_type_name: "Standard Single",
        branch_id: 1,
        daily_rate: 120,
        late_checkout_rate: 30,
        capacity: 1,
        amenities: ["WiFi", "TV"],
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      },
      {
        room_type_id: 2,
        room_type_name: "Deluxe Double",
        branch_id: 1,
        daily_rate: 180,
        late_checkout_rate: 40,
        capacity: 2,
        amenities: ["WiFi", "TV", "Mini Bar"],
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      },
      {
        room_type_id: 3,
        room_type_name: "Suite",
        branch_id: 2,
        daily_rate: 350,
        late_checkout_rate: 75,
        capacity: 4,
        amenities: ["WiFi", "TV", "Mini Bar", "Balcony"],
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      },
    ]);
  }, []);

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
    return roomTypes.filter((rt) => rt.branch_id === parseInt(formData.branch_id));
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

      const branch = branches.find((b) => b.branch_id === parseInt(formData.branch_id));
      const roomType = roomTypes.find((rt) => rt.room_type_id === parseInt(formData.room_type_id));

      if (editingRoom) {
        // Update existing room
        const updatedRoom: Room = {
          ...editingRoom,
          room_number: formData.room_number,
          branch_id: parseInt(formData.branch_id),
          room_type_id: parseInt(formData.room_type_id),
          status: formData.status as RoomStatus,
          branch_name: branch?.branch_name,
          room_type_name: roomType?.room_type_name,
          updated_at: new Date().toISOString(),
        };

        setRooms(rooms.map((room) => (room.room_id === editingRoom.room_id ? updatedRoom : room)));
        showSuccess("Room updated successfully!");
      } else {
        // Create new room
        const newRoom: Room = {
          room_id: Math.max(...rooms.map((r) => r.room_id), 0) + 1,
          room_number: formData.room_number,
          branch_id: parseInt(formData.branch_id),
          room_type_id: parseInt(formData.room_type_id),
          status: formData.status as RoomStatus,
          branch_name: branch?.branch_name,
          room_type_name: roomType?.room_type_name,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        setRooms([...rooms, newRoom]);
        showSuccess("Room created successfully!");
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
    if (!window.confirm("Are you sure you want to delete this room?")) return;

    try {
      setRooms(rooms.filter((room) => room.room_id !== roomId));
      showSuccess("Room deleted successfully!");
    } catch {
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
                <option key={roomType.room_type_id} value={roomType.room_type_id}>
                  {roomType.room_type_name}
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
