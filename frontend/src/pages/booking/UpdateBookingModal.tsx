import React, { useState, useEffect } from "react";
import Modal from "../../components/Modal";
import Button from "../../components/primary/Button";
import { useAlert } from "../../hooks/useAlert";
import { type UpdateBookingRequest, type Booking, type Guest, type Room } from "../../types";

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
    guestId: string;
    roomId: string;
    checkIn: string;
    checkOut: string;
  }>({
    guestId: "",
    roomId: "",
    checkIn: "",
    checkOut: "",
  });

  // Populate form when booking changes
  useEffect(() => {
    if (booking) {
      // Convert ISO strings to datetime-local format
      const checkInLocal = booking.checkIn ? booking.checkIn.substring(0, 16) : "";
      const checkOutLocal = booking.checkOut ? booking.checkOut.substring(0, 16) : "";

      setFormData({
        guestId: booking.guestId.toString(),
        roomId: booking.roomId.toString(),
        checkIn: checkInLocal,
        checkOut: checkOutLocal,
      });
    }
  }, [booking]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!booking) return;

    setIsSubmitting(true);

    try {
      // Validation
      if (!formData.guestId || !formData.roomId) {
        showError("Please select guest and room");
        return;
      }

      if (!formData.checkIn || !formData.checkOut) {
        showError("Please select check-in and check-out dates and times");
        return;
      }

      const checkInDateTime = new Date(formData.checkIn);
      const checkOutDateTime = new Date(formData.checkOut);

      if (checkInDateTime >= checkOutDateTime) {
        showError("Check-out date and time must be after check-in date and time");
        return;
      }

      const bookingData: UpdateBookingRequest = {
        bookingId: booking.bookingId,
        guestId: parseInt(formData.guestId),
        roomId: parseInt(formData.roomId),
        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
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
  const availableRooms = rooms.filter((room) => room.status === "available" || room.room_id === booking?.roomId);

  if (!booking) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Update Booking" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Guest *</label>
            <select
              value={formData.guestId}
              onChange={(e) => setFormData({ ...formData, guestId: e.target.value })}
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
              value={formData.roomId}
              onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Room</option>
              {availableRooms.map((room) => (
                <option key={room.room_id} value={room.room_id.toString()}>
                  {room.room_number} - {room.room_type_name} ({room.branch_name})
                  {room.room_id === booking.roomId ? " (Current)" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Check-in Date & Time *</label>
            <input
              type="datetime-local"
              value={formData.checkIn}
              onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Check-out Date & Time *</label>
            <input
              type="datetime-local"
              value={formData.checkOut}
              onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
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
