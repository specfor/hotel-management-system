import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, User, MapPin, CreditCard, FileText, DollarSign } from "lucide-react";
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
  const { showError } = useAlert();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("services");
  const [isLoading, setIsLoading] = useState(true);

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

  useEffect(() => {
    if (bookingId) {
      loadBookingDetails();
    }
  }, [bookingId, loadBookingDetails]);

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
          { label: `Booking #${booking.booking_id}`, isActive: true },
        ]}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate("/bookings")} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Bookings
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Booking #{booking.booking_id}</h1>
        </div>
        <Badge className={getBookingStatusColor(booking.booking_status)}>
          {formatBookingStatus(booking.booking_status)}
        </Badge>
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
                <p className="text-sm text-gray-600">
                  {getDaysCount(booking.check_in_date, booking.check_out_date)} nights
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(booking.check_in_date).toLocaleDateString()} -{" "}
                  {new Date(booking.check_out_date).toLocaleDateString()}
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
                <p className="text-sm text-gray-600">{formatDateTime(booking.check_in_date, booking.check_in_time)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Check-out</p>
                <p className="text-sm text-gray-600">
                  {formatDateTime(booking.check_out_date, booking.check_out_time)}
                </p>
              </div>
            </div>

            {booking.special_requests && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-900">Special Requests</p>
                <p className="text-sm text-gray-600">{booking.special_requests}</p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Card>
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
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
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "services" && <ServiceUsageTab bookingId={parseInt(bookingId || "0")} />}
          {activeTab === "payments" && <PaymentsTab bookingId={parseInt(bookingId || "0")} />}
          {activeTab === "bill" && <FinalBillTab bookingId={parseInt(bookingId || "0")} />}
        </div>
      </Card>
    </div>
  );
};

export default BookingDetails;
