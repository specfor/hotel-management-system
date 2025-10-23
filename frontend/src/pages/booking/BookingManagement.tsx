import React, { useState, useEffect, useCallback } from "react";
import { Plus, Search, Trash2, Calendar, Eye, User, MapPin } from "lucide-react";
import Button from "../../components/primary/Button";
import Input from "../../components/primary/Input";
import Badge from "../../components/primary/Badge";
import Card from "../../components/primary/Card";
import Breadcrumb from "../../components/Breadcrumb";
import { useAlert } from "../../hooks/useAlert";
import { useNavigate } from "react-router-dom";
import CreateBookingModal from "./CreateBookingModal";
import UpdateBookingModal from "./UpdateBookingModal";
import { BookingStatus, formatBookingStatus, getBookingStatusColor } from "../../types/booking";
import type { Booking, Guest, Room, CreateBookingRequest, UpdateBookingRequest } from "../../types";
import { bookingApi } from "../../api_connection/bookings";
import { guestService } from "../../api_connection/guests";
import { roomApi } from "../../api_connection/rooms";
import { apiUtils } from "../../api_connection/base";

const BookingManagement: React.FC = () => {
  const { showSuccess, showError } = useAlert();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);

  // Mock data for testing - replace with actual API calls

  const loadBookings = useCallback(async () => {
    try {
      const response = await bookingApi.getAllBookings();
      if (response.success && response.data.bookings) {
        console.log("bookings ", response.data);

        setBookings(response.data.bookings);
      } else {
        showError(response.message || "Failed to load bookings");
      }
    } catch (error) {
      const apiError = apiUtils.handleError(error);
      showError(apiError.message);
    }
  }, [showError]);

  const loadGuests = useCallback(async () => {
    try {
      const response = await guestService.getGuests();
      if (response.success && response.data) {
        setGuests(response.data);
        console.log("guests ", response.data);
      } else {
        showError(response.message || "Failed to load guests");
      }
    } catch (error) {
      const apiError = apiUtils.handleError(error);
      showError(apiError.message);
    }
  }, [showError]);

  const loadRooms = useCallback(async () => {
    try {
      const response = await roomApi.getAllRooms();
      if (response.success && response.data) {
        console.log(response.data);

        setRooms(response.data);
      } else {
        showError(response.message || "Failed to load rooms");
      }
    } catch (error) {
      const apiError = apiUtils.handleError(error);
      showError(apiError.message);
    }
  }, [showError]);

  useEffect(() => {
    const loadData = async () => {
      await loadBookings();
      await loadGuests();
      await loadRooms();
    };
    loadData();
  }, [loadBookings, loadGuests, loadRooms]);

  const filteredBookings = bookings.filter((booking) => {
    const guest = guests.find((g) => g.guest_id === booking.guestId);
    const room = rooms.find((r) => r.room_id === booking.roomId);

    const matchesSearch =
      guest?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest?.nic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room?.room_id?.toString().includes(searchTerm.toLowerCase()) ||
      booking.bookingId?.toString().includes(searchTerm.toLowerCase());

    const matchesStatus = !statusFilter || booking.bookingStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleCreateBooking = async (bookingData: CreateBookingRequest) => {
    try {
      const response = await bookingApi.createBooking(bookingData);
      if (response.success && response.data.booking) {
        // Add the new booking to the list
        setBookings([...bookings, response.data.booking]);
        showSuccess("Booking created successfully");
        setIsCreateModalOpen(false);
        // Reload bookings to get the latest data with all populated fields
        await loadBookings();
      } else {
        showError(response.message || "Failed to create booking");
      }
    } catch (error) {
      const apiError = apiUtils.handleError(error);
      showError(apiError.message);
    }
  };

  const handleUpdateBooking = async (bookingData: UpdateBookingRequest) => {
    if (!editingBooking) return;

    try {
      const response = await bookingApi.updateBooking(editingBooking.bookingId, bookingData);
      if (response.success && response.data.booking) {
        // Update the booking in the list
        setBookings(bookings.map((b) => (b.bookingId === editingBooking.bookingId ? response.data.booking : b)));
        showSuccess("Booking updated successfully");
        setIsUpdateModalOpen(false);
        setEditingBooking(null);
        // Reload bookings to get the latest data with all populated fields
        await loadBookings();
      } else {
        showError(response.message || "Failed to update booking");
      }
    } catch (error) {
      const apiError = apiUtils.handleError(error);
      showError(apiError.message);
    }
  };

  const handleDelete = async (bookingId: number) => {
    if (!confirm("Are you sure you want to delete this booking?")) return;

    try {
      const response = await bookingApi.deleteBooking(bookingId);
      if (response.success) {
        setBookings(bookings.filter((b) => b.bookingId !== bookingId));
        showSuccess("Booking deleted successfully");
      } else {
        showError(response.message || "Failed to delete booking");
      }
    } catch (error) {
      const apiError = apiUtils.handleError(error);
      showError(apiError.message);
    }
  };

  const handleViewDetails = (bookingId: number) => {
    navigate(`/bookings/${bookingId}`);
  };

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
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
                  placeholder="Search by guest name, NIC, or booking ID..."
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
                {Object.values(BookingStatus).map((status) => (
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
                  Total
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBookings.map((booking) => (
                <tr key={booking.bookingId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">#{booking.bookingId}</div>
                        <div className="text-sm text-gray-500">{formatDateTime(booking.dateTime)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {guests.find((g) => g.guest_id === booking.guestId)?.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {guests.find((g) => g.guest_id === booking.guestId)?.nic}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {rooms.find((r) => r.room_id === booking.roomId)?.room_id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div>In: {formatDateTime(booking.checkIn)}</div>
                      <div>Out: {formatDateTime(booking.checkOut)}</div>
                      <div className="text-xs text-gray-500">
                        {getDaysCount(booking.checkIn, booking.checkOut)} nights
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={getBookingStatusColor(booking.bookingStatus)}>
                      {formatBookingStatus(booking.bookingStatus)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${booking.total_amount?.toFixed(2) || "0.00"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(booking.bookingId)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(booking.bookingId)}
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
      />
    </div>
  );
};

export default BookingManagement;
