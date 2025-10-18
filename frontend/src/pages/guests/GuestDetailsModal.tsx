import React from "react";
import { Mail, Phone, User, Calendar, CreditCard, X, Bed, Clock, CheckCircle } from "lucide-react";
import Modal from "../../components/Modal";
import Button from "../../components/primary/Button";
import Badge from "../../components/primary/Badge";
import type { Guest } from "../../types/guest";

interface GuestDetailsModalProps {
  guest: Guest | null;
  isOpen: boolean;
  onClose: () => void;
  onSendPassword: (guestId: number) => void;
  loading?: boolean;
}

const GuestDetailsModal: React.FC<GuestDetailsModalProps> = ({
  guest,
  isOpen,
  onClose,
  onSendPassword,
  loading = false,
}) => {
  if (!guest) return null;

  const getBookingStatusBadgeVariant = (status: string) => {
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

  const formatBookingStatus = (status: string) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const calculateAge = (age: number) => {
    return `${age} years old`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Guest Details">
      <div className="space-y-6">
        {/* Header with guest name and basic info */}
        <div className="text-center border-b border-gray-200 pb-4">
          <div className="flex items-center justify-center mb-2">
            <User className="h-12 w-12 text-gray-400 bg-gray-100 rounded-full p-2" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">{guest.name}</h2>
          <p className="text-gray-600 mt-1">{calculateAge(guest.age)}</p>
        </div>

        {/* Personal Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <CreditCard className="h-5 w-5 mr-2 text-blue-500" />
              Personal Information
            </h3>

            <div className="space-y-3">
              <div className="flex items-center">
                <CreditCard className="h-4 w-4 text-gray-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">NIC Number</p>
                  <p className="font-medium text-gray-900">{guest.nic}</p>
                </div>
              </div>

              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-gray-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Age</p>
                  <p className="font-medium text-gray-900">{calculateAge(guest.age)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Phone className="h-5 w-5 mr-2 text-green-500" />
              Contact Information
            </h3>

            <div className="space-y-3">
              <div className="flex items-center">
                <Mail className="h-4 w-4 text-gray-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{guest.email}</p>
                </div>
              </div>

              <div className="flex items-center">
                <Phone className="h-4 w-4 text-gray-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Contact Number</p>
                  <p className="font-medium text-gray-900">{guest.contact_number}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Current Booking Information */}
        {guest.current_booking ? (
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-3">
              <Bed className="h-5 w-5 mr-2 text-blue-600" />
              Current Booking
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Room Number:</span>
                  <span className="font-semibold text-gray-900">{guest.current_booking.room_number}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Booking ID:</span>
                  <span className="font-medium text-gray-900">#{guest.current_booking.booking_id}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Check In:</span>
                  <span className="font-medium text-gray-900">{formatDate(guest.current_booking.check_in_date)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Check Out:</span>
                  <span className="font-medium text-gray-900">{formatDate(guest.current_booking.check_out_date)}</span>
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm text-gray-600">Status:</span>
              <Badge
                variant={getBookingStatusBadgeVariant(guest.current_booking.status)}
                size="sm"
                className="flex items-center"
              >
                {guest.current_booking.status === "checked_in" && <CheckCircle className="h-3 w-3 mr-1" />}
                {guest.current_booking.status === "confirmed" && <Clock className="h-3 w-3 mr-1" />}
                {formatBookingStatus(guest.current_booking.status)}
              </Badge>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <Bed className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">No current booking</p>
          </div>
        )}

        {/* System Information */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">System Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-500">Guest ID:</span>
              <span className="ml-2 font-medium text-gray-900">#{guest.guest_id}</span>
            </div>
            <div>
              <span className="text-gray-500">Member Since:</span>
              <span className="ml-2 font-medium text-gray-900">{formatDate(guest.created_at)}</span>
            </div>
            <div>
              <span className="text-gray-500">Last Updated:</span>
              <span className="ml-2 font-medium text-gray-900">{formatDate(guest.updated_at)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <Button
            variant="primary"
            onClick={() => onSendPassword(guest.guest_id)}
            disabled={loading}
            className="flex items-center space-x-2"
          >
            <Mail className="h-4 w-4" />
            <span>{loading ? "Sending..." : "Send New Password"}</span>
          </Button>

          <Button variant="outline" onClick={onClose} className="flex items-center space-x-2">
            <X className="h-4 w-4" />
            <span>Close</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default GuestDetailsModal;
