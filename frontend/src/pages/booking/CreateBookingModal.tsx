import React, { useState } from "react";
import Modal from "../../components/Modal";
import Button from "../../components/primary/Button";
import { useAlert } from "../../hooks/useAlert";
import { type CreateBookingRequest, type Guest, type Room } from "../../types";

interface CreateBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (bookingData: CreateBookingRequest) => Promise<void>;
  guests: Guest[];
  rooms: Room[];
}

const CreateBookingModal: React.FC<CreateBookingModalProps> = ({ isOpen, onClose, onSubmit, guests, rooms }) => {
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

  console.log(rooms);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

      const bookingData: CreateBookingRequest = {
        guestId: parseInt(formData.guestId),
        roomId: parseInt(formData.roomId),
        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
      };

      await onSubmit(bookingData);
      resetForm();
      onClose();
    } catch (error) {
      console.error("Error creating booking:", error);
      showError("Failed to create booking");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      guestId: "",
      roomId: "",
      checkIn: "",
      checkOut: "",
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Filter available rooms (not occupied)
  const availableRooms = rooms.filter((room) => room.status.toLowerCase() === "available");

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Booking" size="lg">
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
                  Room - {room.room_id}
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
            {isSubmitting ? "Creating..." : "Create Booking"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateBookingModal;
