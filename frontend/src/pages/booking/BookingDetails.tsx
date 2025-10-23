import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, User, MapPin, CreditCard, FileText, DollarSign, LogIn, LogOut, X } from "lucide-react";
import Card from "../../components/primary/Card";
import Button from "../../components/primary/Button";
import Badge from "../../components/primary/Badge";
import Breadcrumb from "../../components/Breadcrumb";
import { useAlert } from "../../hooks/useAlert";
import ServiceUsageTab from "./ServiceUsageTab";
import PaymentsTab from "./PaymentsTab";
import FinalBillTab from "./FinalBillTab";
import { formatBookingStatus, getBookingStatusColor, type Booking } from "../../types";
import { bookingApi } from "../../api_connection/bookings";
import { apiUtils } from "../../api_connection/base";

type TabType = "services" | "payments" | "bill";

const BookingDetails: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const { showError, showSuccess } = useAlert();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("services");
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const loadBookingDetails = useCallback(async () => {
    try {
      setIsLoading(true);
      if (!bookingId) {
        throw new Error("Booking ID not provided");
      }

      const response = await bookingApi.getBookingById(parseInt(bookingId));
      if (response.success && response.data.booking) {
        setBooking(response.data.booking);
      } else {
        throw new Error(response.message || "Failed to load booking details");
      }
    } catch (error) {
      console.error("Error loading booking details:", error);
      const apiError = apiUtils.handleError(error);
      showError(apiError.message);
      navigate("/bookings");
    } finally {
      setIsLoading(false);
    }
  }, [bookingId, navigate, showError]);

  const handleStatusUpdate = async (newStatus: string) => {
    if (!booking || !bookingId) return;

    try {
      setIsUpdating(true);
      const response = await bookingApi.updateBookingStatus(parseInt(bookingId), newStatus);

      if (response.success && response.data.booking) {
        setBooking(response.data.booking);
        showSuccess(`Booking ${newStatus.toLowerCase()} successfully`);
        // Reload to get updated data
        await loadBookingDetails();
      } else {
        showError(response.message || `Failed to update booking status to ${newStatus}`);
      }
    } catch (error) {
      console.error("Error updating booking status:", error);
      const apiError = apiUtils.handleError(error);
      showError(apiError.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCheckIn = () => {
    if (confirm("Are you sure you want to check in this guest?")) {
      handleStatusUpdate("Checked-In");
    }
  };

  const handleCheckOut = () => {
    if (confirm("Are you sure you want to check out this guest?")) {
      handleStatusUpdate("Checked-Out");
    }
  };

  const handleCancel = () => {
    if (confirm("Are you sure you want to cancel this booking? This action cannot be undone.")) {
      handleStatusUpdate("Cancelled");
    }
  };

  useEffect(() => {
    if (bookingId) {
      loadBookingDetails();
    }
  }, [bookingId, loadBookingDetails]);

  // Set appropriate default tab based on booking status
  useEffect(() => {
    if (booking) {
      console.log(booking);

      if (booking.bookingStatus.toLowerCase() === "checked-out") {
        // For checked out bookings, default to services if currently on an unavailable tab
        if (activeTab !== "services" && activeTab !== "payments" && activeTab !== "bill") {
          setActiveTab("services");
        }
      } else if (booking.bookingStatus.toLowerCase() === "checked-in") {
        // For checked in bookings, only services tab is available
        setActiveTab("services");
      } else {
        // For booked or cancelled bookings, no tabs are available
        // Reset to services tab for display purposes, but it won't be shown
        setActiveTab("services");
      }
    }
  }, [booking?.bookingStatus, activeTab, booking]); // Include all dependencies

  const formatDateTime = (date: string, time: string) => {
    return `${new Date(date).toLocaleDateString()} ${time}`;
  };

  const getDaysCount = (checkIn: string, checkOut: string) => {
    const diffTime = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading booking details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-gray-600">Booking not found</p>
            <Button onClick={() => navigate("/bookings")} className="mt-4">
              Back to Bookings
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "Dashboard", path: "/" },
          { label: "Bookings", path: "/bookings" },
          { label: `Booking #${booking.bookingId}`, isActive: true },
        ]}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate("/bookings")} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Bookings
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Booking #{booking.bookingId}</h1>
        </div>
        <div className="flex items-center space-x-3">
          {/* Action buttons based on booking status */}
          {booking.bookingStatus.toLowerCase() === "booked" && (
            <>
              <Button
                onClick={handleCheckIn}
                disabled={isUpdating}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <LogIn className="h-4 w-4" />
                {isUpdating ? "Processing..." : "Check In"}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isUpdating}
                className="flex items-center gap-2 text-red-600 border-red-300 hover:bg-red-50"
              >
                <X className="h-4 w-4" />
                Cancel Booking
              </Button>
            </>
          )}

          {booking.bookingStatus.toLowerCase() === "checked-in" && (
            <Button
              onClick={handleCheckOut}
              disabled={isUpdating}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <LogOut className="h-4 w-4" />
              {isUpdating ? "Processing..." : "Check Out"}
            </Button>
          )}

          <Badge className={getBookingStatusColor(booking.bookingStatus)}>
            {formatBookingStatus(booking.bookingStatus)}
          </Badge>
        </div>
      </div>

      {/* Booking Overview */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Guest Information */}
            <div className="flex items-start space-x-3">
              <User className="h-5 w-5 text-gray-400 mt-1" />
              <div>
                <p className="text-sm font-medium text-gray-900">Guest</p>
                <p className="text-sm text-gray-600">{booking.guest_name}</p>
                <p className="text-xs text-gray-500">{booking.guest_nic}</p>
              </div>
            </div>

            {/* Room Information */}
            <div className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-gray-400 mt-1" />
              <div>
                <p className="text-sm font-medium text-gray-900">Room</p>
                <p className="text-sm text-gray-600">{booking.room_number}</p>
                <p className="text-xs text-gray-500">{booking.room_type_name}</p>
              </div>
            </div>

            {/* Stay Duration */}
            <div className="flex items-start space-x-3">
              <Calendar className="h-5 w-5 text-gray-400 mt-1" />
              <div>
                <p className="text-sm font-medium text-gray-900">Stay Duration</p>
                <p className="text-sm text-gray-600">{getDaysCount(booking.checkIn, booking.checkOut)} nights</p>
                <p className="text-xs text-gray-500">
                  {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Total Amount */}
            <div className="flex items-start space-x-3">
              <DollarSign className="h-5 w-5 text-gray-400 mt-1" />
              <div>
                <p className="text-sm font-medium text-gray-900">Total Amount</p>
                <p className="text-sm text-gray-600">${booking.total_amount?.toFixed(2) || "0.00"}</p>
                <p className="text-xs text-gray-500">Booked by {booking.user_name}</p>
              </div>
            </div>
          </div>

          {/* Check-in/out Details */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-900">Check-in</p>
                <p className="text-sm text-gray-600">{formatDateTime(booking.checkIn, booking.checkIn)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Check-out</p>
                <p className="text-sm text-gray-600">{formatDateTime(booking.checkOut, booking.checkOut)}</p>
              </div>
            </div>

            {/* {booking. && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-900">Special Requests</p>
                <p className="text-sm text-gray-600">{booking.special_requests}</p>
              </div>
            )} */}
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Card>
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {/* Only show services tab after check-in */}
            {(booking.bookingStatus.toLowerCase() === "checked-in" ||
              booking.bookingStatus.toLowerCase() === "checked-out") && (
              <Button
                variant={activeTab === "services" ? "primary" : "ghost"}
                onClick={() => setActiveTab("services")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "services"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4" />
                  <span>Services Used</span>
                </div>
              </Button>
            )}

            {/* Only show payments and bill tabs after checkout */}
            {booking.bookingStatus.toLowerCase() === "checked-out" && (
              <>
                <Button
                  variant={activeTab === "payments" ? "primary" : "ghost"}
                  onClick={() => setActiveTab("payments")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "payments"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-4 w-4" />
                    <span>Payments</span>
                  </div>
                </Button>
                <Button
                  variant={activeTab === "bill" ? "primary" : "ghost"}
                  onClick={() => setActiveTab("bill")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "bill"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <span>Final Bill</span>
                  </div>
                </Button>
              </>
            )}
          </nav>
        </div>{" "}
        <div className="p-6">
          {/* Show content based on booking status and active tab */}
          {booking.bookingStatus.toLowerCase() === "booked" || booking.bookingStatus.toLowerCase() === "cancelled" ? (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Service Management Not Available</h3>
              <p className="mt-1 text-sm text-gray-500">
                {booking.bookingStatus.toLowerCase() === "booked"
                  ? "Service management will be available after guest check-in."
                  : "This booking has been cancelled."}
              </p>
            </div>
          ) : (
            <>
              {activeTab === "services" &&
                (booking.bookingStatus.toLowerCase() === "checked-in" ||
                  booking.bookingStatus.toLowerCase() === "checked-out") && (
                  <ServiceUsageTab bookingId={parseInt(bookingId || "0")} />
                )}
              {activeTab === "services" &&
                booking.bookingStatus.toLowerCase() !== "checked-in" &&
                booking.bookingStatus.toLowerCase() !== "checked-out" && (
                  <div className="text-center py-12">
                    <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Services Not Available</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Service management will be available after guest check-in.
                    </p>
                  </div>
                )}
              {activeTab === "payments" && booking.bookingStatus.toLowerCase() === "checked-out" ? (
                <PaymentsTab bookingId={parseInt(bookingId || "0")} />
              ) : activeTab === "payments" ? (
                <div className="text-center py-12">
                  <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Payments Not Available</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Payment management will be available after guest checkout.
                  </p>
                </div>
              ) : null}
              {activeTab === "bill" && booking.bookingStatus.toLowerCase() === "checked-out" ? (
                <FinalBillTab bookingId={parseInt(bookingId || "0")} />
              ) : activeTab === "bill" ? (
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Final Bill Not Available</h3>
                  <p className="mt-1 text-sm text-gray-500">Final bill will be generated after guest checkout.</p>
                </div>
              ) : null}
            </>
          )}
        </div>
      </Card>
    </div>
  );
};

export default BookingDetails;
