import React, { useState, useEffect } from "react";
import Modal from "../../components/Modal";
import Button from "../../components/primary/Button";
import Input from "../../components/primary/Input";
import { useAlert } from "../../hooks/useAlert";
import {
  BookingStatusEnum,
  formatBookingStatus,
  type UpdateBookingRequest,
  type Booking,
  type Guest,
  type Room,
} from "../../types";

interface UpdateBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (bookingData: UpdateBookingRequest) => Promise<void>;
  booking: Booking | null;
  guests: Guest[];
  rooms: Room[];
}

const UpdateBookingModal: React.FC<UpdateBookingModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  booking,
  guests,
  rooms,
}) => {
  const { showError } = useAlert();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<{
    guest_id: string;
    room_id: string;
    booking_status: string;
    booking_date: string;
    booking_time: string;
    check_in_date: string;
    check_in_time: string;
    check_out_date: string;
    check_out_time: string;
    special_requests: string;
  }>({
    guest_id: "",
    room_id: "",
    booking_status: BookingStatusEnum.PENDING,
    booking_date: "",
    booking_time: "",
    check_in_date: "",
    check_in_time: "",
    check_out_date: "",
    check_out_time: "",
    special_requests: "",
  });

  // Populate form when booking changes
  useEffect(() => {
    if (booking) {
      setFormData({
        guest_id: booking.guest_id.toString(),
        room_id: booking.room_id.toString(),
        booking_status: booking.booking_status,
        booking_date: booking.booking_date,
        booking_time: booking.booking_time,
        check_in_date: booking.check_in_date,
        check_in_time: booking.check_in_time,
        check_out_date: booking.check_out_date,
        check_out_time: booking.check_out_time,
        special_requests: booking.special_requests || "",
      });
    }
  }, [booking]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!booking) return;

    setIsSubmitting(true);

    try {
      // Validation
      if (!formData.guest_id || !formData.room_id) {
        showError("Please select guest and room");
        return;
      }

      if (!formData.check_in_date || !formData.check_out_date) {
        showError("Please select check-in and check-out dates");
        return;
      }

      const checkInDateTime = new Date(`${formData.check_in_date}T${formData.check_in_time}`);
      const checkOutDateTime = new Date(`${formData.check_out_date}T${formData.check_out_time}`);
      const bookingDateTime = new Date(`${formData.booking_date}T${formData.booking_time}`);

      if (checkInDateTime >= checkOutDateTime) {
        showError("Check-out date and time must be after check-in date and time");
        return;
      }

      if (bookingDateTime > checkInDateTime) {
        showError("Booking date and time cannot be after check-in date and time");
        return;
      }

      const bookingData: UpdateBookingRequest = {
        booking_id: booking.booking_id,
        guest_id: parseInt(formData.guest_id),
        room_id: parseInt(formData.room_id),
        booking_status: formData.booking_status as BookingStatusEnum,
        booking_date: formData.booking_date,
        booking_time: formData.booking_time,
        check_in_date: formData.check_in_date,
        check_in_time: formData.check_in_time,
        check_out_date: formData.check_out_date,
        check_out_time: formData.check_out_time,
        special_requests: formData.special_requests || undefined,
      };

      await onSubmit(bookingData);
      onClose();
    } catch (error) {
      console.error("Error updating booking:", error);
      showError("Failed to update booking");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  // Filter available rooms (include current room even if occupied)
  const availableRooms = rooms.filter((room) => room.status === "available" || room.room_id === booking?.room_id);

  if (!booking) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Update Booking" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Guest *</label>
            <select
              value={formData.guest_id}
              onChange={(e) => setFormData({ ...formData, guest_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Guest</option>
              {guests.map((guest) => (
                <option key={guest.guest_id} value={guest.guest_id.toString()}>
                  {guest.name} ({guest.nic})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Room *</label>
            <select
              value={formData.room_id}
              onChange={(e) => setFormData({ ...formData, room_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Room</option>
              {availableRooms.map((room) => (
                <option key={room.room_id} value={room.room_id.toString()}>
                  {room.room_number} - {room.room_type_name} ({room.branch_name})
                  {room.room_id === booking.room_id ? " (Current)" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Booking Status *</label>
            <select
              value={formData.booking_status}
              onChange={(e) => setFormData({ ...formData, booking_status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {Object.values(BookingStatusEnum).map((status) => (
                <option key={status} value={status}>
                  {formatBookingStatus(status)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Booking Date *</label>
            <Input
              type="date"
              value={formData.booking_date}
              onChange={(e) => setFormData({ ...formData, booking_date: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Booking Time *</label>
            <input
              type="time"
              value={formData.booking_time}
              onChange={(e) => setFormData({ ...formData, booking_time: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Check-in Date *</label>
            <Input
              type="date"
              value={formData.check_in_date}
              onChange={(e) => setFormData({ ...formData, check_in_date: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Check-in Time *</label>
            <input
              type="time"
              value={formData.check_in_time}
              onChange={(e) => setFormData({ ...formData, check_in_time: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Check-out Date *</label>
            <Input
              type="date"
              value={formData.check_out_date}
              onChange={(e) => setFormData({ ...formData, check_out_date: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Check-out Time *</label>
            <input
              type="time"
              value={formData.check_out_time}
              onChange={(e) => setFormData({ ...formData, check_out_time: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Special Requests</label>
          <textarea
            value={formData.special_requests}
            onChange={(e) => setFormData({ ...formData, special_requests: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Any special requests or notes..."
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Updating..." : "Update Booking"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default UpdateBookingModal;
