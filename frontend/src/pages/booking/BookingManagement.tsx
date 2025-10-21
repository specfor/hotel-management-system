import React, { useState, useEffect, useCallback } from "react";
import { Plus, Search, Edit, Trash2, Calendar, Eye, User, MapPin } from "lucide-react";
import Button from "../../components/primary/Button";
import Input from "../../components/primary/Input";
import Badge from "../../components/primary/Badge";
import Card from "../../components/primary/Card";
import Breadcrumb from "../../components/Breadcrumb";
import { useAlert } from "../../hooks/useAlert";
import { useNavigate } from "react-router-dom";
import CreateBookingModal from "./CreateBookingModal";
import UpdateBookingModal from "./UpdateBookingModal";
import { BookingStatusEnum, formatBookingStatus, getBookingStatusColor } from "../../types";
import type { Booking, Guest, Room, User as StaffUser, CreateBookingRequest, UpdateBookingRequest } from "../../types";

const BookingManagement: React.FC = () => {
  const { showSuccess, showError } = useAlert();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);

  // Mock data for testing - replace with actual API calls

  const loadBookings = useCallback(async () => {
    try {
      // TODO: Replace with actual API call
      const mockBookings: Booking[] = [
        {
          booking_id: 1,
          guest_id: 1,
          room_id: 1,
          user_id: 1,
          booking_status: BookingStatusEnum.CONFIRMED,
          booking_date: "2024-01-15",
          booking_time: "14:30",
          check_in_date: "2024-01-20",
          check_in_time: "15:00",
          check_out_date: "2024-01-25",
          check_out_time: "11:00",
          special_requests: "Late checkout requested",
          total_amount: 750.0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          guest_name: "John Doe",
          guest_nic: "123456789V",
          room_number: "101",
          room_type_name: "Deluxe Room",
          branch_name: "Main Branch",
          user_name: "Alice Johnson",
        },
        {
          booking_id: 2,
          guest_id: 2,
          room_id: 2,
          user_id: 2,
          booking_status: BookingStatusEnum.CHECKED_IN,
          booking_date: "2024-01-10",
          booking_time: "09:15",
          check_in_date: "2024-01-18",
          check_in_time: "14:00",
          check_out_date: "2024-01-22",
          check_out_time: "12:00",
          total_amount: 480.0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          guest_name: "Jane Smith",
          guest_nic: "987654321V",
          room_number: "205",
          room_type_name: "Standard Room",
          branch_name: "Main Branch",
          user_name: "Bob Wilson",
        },
      ];
      setBookings(mockBookings);
    } catch {
      showError("Failed to load bookings");
    }
  }, [showError]);

  const loadGuests = useCallback(async () => {
    try {
      // TODO: Replace with actual API call
      const mockGuests: Guest[] = [
        {
          guest_id: 1,
          nic: "123456789V",
          name: "John Doe",
          age: 35,
          contact_number: "555-0123",
          email: "john.doe@email.com",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          guest_id: 2,
          nic: "987654321V",
          name: "Jane Smith",
          age: 28,
          contact_number: "555-0456",
          email: "jane.smith@email.com",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];
      setGuests(mockGuests);
    } catch {
      showError("Failed to load guests");
    }
  }, [showError]);

  const loadRooms = useCallback(async () => {
    try {
      // TODO: Replace with actual API call
      const mockRooms: Room[] = [
        {
          room_id: 1,
          room_number: "101",
          branch_id: 1,
          room_type_id: 1,
          status: "available",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          room_type_name: "Deluxe Room",
          branch_name: "Main Branch",
        },
        {
          room_id: 2,
          room_number: "205",
          branch_id: 1,
          room_type_id: 2,
          status: "occupied",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          room_type_name: "Standard Room",
          branch_name: "Main Branch",
        },
      ];
      setRooms(mockRooms);
    } catch {
      showError("Failed to load rooms");
    }
  }, [showError]);

  const loadStaff = useCallback(async () => {
    try {
      // TODO: Replace with actual API call
      const mockStaff: StaffUser[] = [
        {
          id: "1",
          name: "Alice Johnson",
          email: "alice.johnson@hotel.com",
          role: "manager",
        },
        {
          id: "2",
          name: "Bob Wilson",
          email: "bob.wilson@hotel.com",
          role: "receptionist",
        },
      ];
      setStaff(mockStaff);
    } catch {
      showError("Failed to load staff");
    }
  }, [showError]);

  useEffect(() => {
    const loadData = async () => {
      await loadBookings();
      await loadGuests();
      await loadRooms();
      await loadStaff();
    };
    loadData();
  }, [loadBookings, loadGuests, loadRooms, loadStaff]);

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.guest_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.guest_nic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.room_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.user_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || booking.booking_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateBooking = async (bookingData: CreateBookingRequest) => {
    try {
      // TODO: Replace with actual API call
      const newBooking = {
        booking_id: Math.max(...bookings.map((b) => b.booking_id)) + 1,
        ...bookingData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        // Add populated fields for display
        guest_name: guests.find((g) => g.guest_id === bookingData.guest_id)?.name,
        guest_nic: guests.find((g) => g.guest_id === bookingData.guest_id)?.nic,
        room_number: rooms.find((r) => r.room_id === bookingData.room_id)?.room_number,
        room_type_name: rooms.find((r) => r.room_id === bookingData.room_id)?.room_type_name,
        branch_name: rooms.find((r) => r.room_id === bookingData.room_id)?.branch_name,
        user_name: staff.find((s) => s.id === bookingData.user_id.toString())?.name,
      };
      setBookings([...bookings, newBooking]);
      showSuccess("Booking created successfully");
      setIsCreateModalOpen(false);
    } catch {
      showError("Failed to create booking");
    }
  };

  const handleUpdateBooking = async (bookingData: UpdateBookingRequest) => {
    if (!editingBooking) return;

    try {
      // TODO: Replace with actual API call
      const updatedBooking = {
        ...editingBooking,
        ...bookingData,
        updated_at: new Date().toISOString(),
        // Update populated fields for display
        guest_name: guests.find((g) => g.guest_id === bookingData.guest_id)?.name,
        guest_nic: guests.find((g) => g.guest_id === bookingData.guest_id)?.nic,
        room_number: rooms.find((r) => r.room_id === bookingData.room_id)?.room_number,
        room_type_name: rooms.find((r) => r.room_id === bookingData.room_id)?.room_type_name,
        branch_name: rooms.find((r) => r.room_id === bookingData.room_id)?.branch_name,
        user_name: staff.find((s) => s.id === bookingData.user_id?.toString())?.name,
      };
      setBookings(bookings.map((b) => (b.booking_id === editingBooking.booking_id ? updatedBooking : b)));
      showSuccess("Booking updated successfully");
      setIsUpdateModalOpen(false);
      setEditingBooking(null);
    } catch {
      showError("Failed to update booking");
    }
  };

  const handleEdit = (booking: Booking) => {
    setEditingBooking(booking);
    setIsUpdateModalOpen(true);
  };

  const handleDelete = async (bookingId: number) => {
    if (!confirm("Are you sure you want to delete this booking?")) return;

    try {
      // TODO: Replace with actual API call
      setBookings(bookings.filter((b) => b.booking_id !== bookingId));
      showSuccess("Booking deleted successfully");
    } catch {
      showError("Failed to delete booking");
    }
  };

  const handleViewDetails = (bookingId: number) => {
    navigate(`/bookings/${bookingId}`);
  };

  const formatDateTime = (date: string, time: string) => {
    return `${new Date(date).toLocaleDateString()} ${time}`;
  };

  const getDaysCount = (checkIn: string, checkOut: string) => {
    const diffTime = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "Dashboard", path: "/" },
          { label: "Bookings", isActive: true },
        ]}
      />

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Booking Management</h1>
        <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Booking
        </Button>
      </div>

      <Card>
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search by guest name, NIC, room number, or staff..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                {Object.values(BookingStatusEnum).map((status) => (
                  <option key={status} value={status}>
                    {formatBookingStatus(status)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booking
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Guest
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check-in/out
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Staff
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBookings.map((booking) => (
                <tr key={booking.booking_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">#{booking.booking_id}</div>
                        <div className="text-sm text-gray-500">
                          {formatDateTime(booking.booking_date, booking.booking_time)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{booking.guest_name}</div>
                        <div className="text-sm text-gray-500">{booking.guest_nic}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{booking.room_number}</div>
                        <div className="text-sm text-gray-500">{booking.room_type_name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div>In: {formatDateTime(booking.check_in_date, booking.check_in_time)}</div>
                      <div>Out: {formatDateTime(booking.check_out_date, booking.check_out_time)}</div>
                      <div className="text-xs text-gray-500">
                        {getDaysCount(booking.check_in_date, booking.check_out_date)} nights
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={getBookingStatusColor(booking.booking_status)}>
                      {formatBookingStatus(booking.booking_status)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.user_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${booking.total_amount?.toFixed(2) || "0.00"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(booking.booking_id)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(booking)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(booking.booking_id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredBookings.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No bookings found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter
                ? "Try adjusting your search criteria."
                : "Get started by creating a new booking."}
            </p>
          </div>
        )}
      </Card>

      <CreateBookingModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateBooking}
        guests={guests}
        rooms={rooms}
        staff={staff}
      />

      <UpdateBookingModal
        isOpen={isUpdateModalOpen}
        onClose={() => {
          setIsUpdateModalOpen(false);
          setEditingBooking(null);
        }}
        onSubmit={handleUpdateBooking}
        booking={editingBooking}
        guests={guests}
        rooms={rooms}
        staff={staff}
      />
    </div>
  );
};

export default BookingManagement;
