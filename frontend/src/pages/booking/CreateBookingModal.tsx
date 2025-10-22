import React, { useState } from "react";
import Modal from "../../components/Modal";
import Button from "../../components/primary/Button";
import Input from "../../components/primary/Input";
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
    guest_id: string;
    room_id: string;
    check_in_date: string;
    check_in_time: string;
    check_out_date: string;
    check_out_time: string;
  }>({
    guest_id: "",
    room_id: "",
    check_in_date: "",
    check_in_time: "15:00",
    check_out_date: "",
    check_out_time: "11:00",
  });

  console.log(rooms);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

      if (checkInDateTime >= checkOutDateTime) {
        showError("Check-out date and time must be after check-in date and time");
        return;
      }

      const bookingData: CreateBookingRequest = {
        guest_id: parseInt(formData.guest_id),
        room_id: parseInt(formData.room_id),
        check_in_date: formData.check_in_date,
        check_in_time: formData.check_in_time,
        check_out_date: formData.check_out_date,
        check_out_time: formData.check_out_time,
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
      guest_id: "",
      room_id: "",
      check_in_date: "",
      check_in_time: "15:00",
      check_out_date: "",
      check_out_time: "11:00",
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
                  Room - {room.room_id}
                </option>
              ))}
            </select>
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
