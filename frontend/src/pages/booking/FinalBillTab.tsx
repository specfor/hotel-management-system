import React, { useState, useEffect, useCallback } from "react";
import { Receipt, FileText, Calculator, AlertCircle, CheckCircle } from "lucide-react";
import Card from "../../components/primary/Card";
import Badge from "../../components/primary/Badge";
import { useAlert } from "../../hooks/useAlert";
import { type FinalBill, BookingStatusEnum, type Booking } from "../../types";

interface FinalBillTabProps {
  bookingId: number;
}

const FinalBillTab: React.FC<FinalBillTabProps> = ({ bookingId }) => {
  const { showError } = useAlert();
  const [finalBill, setFinalBill] = useState<FinalBill | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadFinalBill = useCallback(async () => {
    try {
      setIsLoading(true);

      // TODO: Replace with actual API call
      // First check if booking is checked out
      const mockBooking: Booking = {
        booking_id: bookingId,
        guest_id: 1,
        room_id: 101,
        user_id: 1,
        booking_status: BookingStatusEnum.CHECKED_OUT,
        booking_date: "2024-01-20",
        booking_time: "14:30",
        check_in_date: "2024-01-21",
        check_in_time: "15:00",
        check_out_date: "2024-01-24",
        check_out_time: "11:00",
        total_amount: 850.5,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setBooking(mockBooking);

      if (mockBooking.booking_status === BookingStatusEnum.CHECKED_OUT) {
        // Load final bill only for checked-out bookings
        const mockBill: FinalBill = {
          bill_id: 1,
          booking_id: bookingId,
          room_charges: 600.0,
          service_charges: 240.0,
          tax_amount: 67.2,
          discount_amount: 45.0,
          late_checkout_charges: 0.0,
          total_amount: 862.2,
          total_paid_amount: 700.0,
          outstanding_amount: 162.2,
          bill_date: "2024-01-24",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setFinalBill(mockBill);
      }
    } catch {
      showError("Failed to load final bill information");
    } finally {
      setIsLoading(false);
    }
  }, [bookingId, showError]);

  useEffect(() => {
    loadFinalBill();
  }, [loadFinalBill]);

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const getBillStatusBadge = () => {
    if (!finalBill) return null;

    if (finalBill.outstanding_amount > 0) {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Partially Paid
        </Badge>
      );
    }

    return (
      <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
        <CheckCircle className="h-3 w-3" />
        Fully Paid
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading bill information...</p>
        </div>
      </div>
    );
  }

  if (!booking || booking.booking_status !== BookingStatusEnum.CHECKED_OUT) {
    return (
      <div className="text-center py-12">
        <Receipt className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Final Bill Not Available</h3>
        <p className="mt-1 text-sm text-gray-500">Final bill will be generated after guest checkout.</p>
        <div className="mt-4">
          <Badge className="bg-blue-100 text-blue-800">Current Status: {booking?.booking_status || "Unknown"}</Badge>
        </div>
      </div>
    );
  }

  if (!finalBill) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Bill Processing</h3>
        <p className="mt-1 text-sm text-gray-500">Final bill is being processed. Please try again in a few moments.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Final Bill
          </h3>
          <p className="text-sm text-gray-600">Generated on {new Date(finalBill.bill_date).toLocaleDateString()}</p>
        </div>
        {getBillStatusBadge()}
      </div>

      {/* Bill Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Charges Breakdown */}
        <Card>
          <div className="p-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Charges Breakdown
            </h4>

            <div className="space-y-4">
              {/* Room Charges */}
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Room Charges</span>
                <span className="font-medium">{formatCurrency(finalBill.room_charges)}</span>
              </div>

              {/* Service Charges */}
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Service Charges</span>
                <span className="font-medium">{formatCurrency(finalBill.service_charges)}</span>
              </div>

              {/* Tax */}
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Total Tax</span>
                <span className="font-medium">{formatCurrency(finalBill.tax_amount)}</span>
              </div>

              {/* Late Checkout Charges */}
              {finalBill.late_checkout_charges > 0 && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Late Checkout Charges</span>
                  <span className="font-medium text-orange-600">{formatCurrency(finalBill.late_checkout_charges)}</span>
                </div>
              )}

              {/* Subtotal */}
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-700">Subtotal</span>
                <span className="font-semibold">
                  {formatCurrency(
                    finalBill.room_charges +
                      finalBill.service_charges +
                      finalBill.tax_amount +
                      finalBill.late_checkout_charges
                  )}
                </span>
              </div>

              {/* Discount */}
              {finalBill.discount_amount > 0 && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Total Discount</span>
                  <span className="font-medium text-green-600">-{formatCurrency(finalBill.discount_amount)}</span>
                </div>
              )}

              {/* Total Amount */}
              <div className="flex justify-between items-center py-3 border-t-2 border-gray-200">
                <span className="text-lg font-bold text-gray-900">Total Amount</span>
                <span className="text-lg font-bold text-gray-900">{formatCurrency(finalBill.total_amount)}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Payment Summary */}
        <Card>
          <div className="p-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Payment Summary</h4>

            <div className="space-y-4">
              {/* Total Amount */}
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Total Bill Amount</span>
                <span className="font-medium">{formatCurrency(finalBill.total_amount)}</span>
              </div>

              {/* Total Paid */}
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Total Paid</span>
                <span className="font-medium text-green-600">{formatCurrency(finalBill.total_paid_amount)}</span>
              </div>

              {/* Outstanding Amount */}
              <div className="flex justify-between items-center py-3 border-t-2 border-gray-200">
                <span className="text-lg font-bold text-gray-900">Outstanding Amount</span>
                <span
                  className={`text-lg font-bold ${
                    finalBill.outstanding_amount > 0 ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {formatCurrency(finalBill.outstanding_amount)}
                </span>
              </div>

              {/* Payment Status Indicator */}
              <div className="mt-6 p-4 rounded-lg bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium text-gray-900">Payment Status</h5>
                    <p className="text-sm text-gray-600 mt-1">
                      {finalBill.outstanding_amount > 0
                        ? `${formatCurrency(finalBill.outstanding_amount)} remaining`
                        : "Payment completed"}
                    </p>
                  </div>
                  {finalBill.outstanding_amount > 0 ? (
                    <AlertCircle className="h-8 w-8 text-yellow-500" />
                  ) : (
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Additional Information */}
      <Card>
        <div className="p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h4>
          <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
            Bill generated automatically upon checkout completion.
          </p>
        </div>
      </Card>

      {/* Bill Calculation Details */}
      <Card>
        <div className="p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Calculation Summary</h4>
          <div className="text-sm text-gray-600 space-y-2">
            <p>• Room charges calculated based on nightly rate and duration of stay</p>
            <p>• Service charges include all additional services used during the stay</p>
            <p>• Tax calculated as applicable percentage on room and service charges</p>
            {finalBill.discount_amount > 0 && (
              <p>• Discounts applied as per promotional offers or guest loyalty program</p>
            )}
            {finalBill.late_checkout_charges > 0 && (
              <p>• Late checkout charges applied for checkout after standard time</p>
            )}
            <p className="mt-3 font-medium text-gray-700">
              Final amount = (Room + Services + Tax + Late Charges) - Discounts
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default FinalBillTab;
