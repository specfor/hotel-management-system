import React, { useState, useEffect, useCallback } from "react";
import { Receipt, FileText, Calculator, AlertCircle, CheckCircle, Plus } from "lucide-react";
import Card from "../../components/primary/Card";
import Badge from "../../components/primary/Badge";
import Button from "../../components/primary/Button";
import { useAlert } from "../../hooks/useAlert";
import { type FinalBill, type Booking } from "../../types";
import { finalBillApi, type FinalBillCreateRequest } from "../../api_connection/finalBill";
import { bookingApi } from "../../api_connection/bookings";
import { apiUtils } from "../../api_connection/base";

interface FinalBillTabProps {
  bookingId: number;
}

const FinalBillTab: React.FC<FinalBillTabProps> = ({ bookingId }) => {
  const { showError, showSuccess } = useAlert();
  const [finalBill, setFinalBill] = useState<FinalBill | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const loadFinalBill = useCallback(async () => {
    try {
      setIsLoading(true);

      // First get the booking details to check if it's checked out
      const bookingResponse = await bookingApi.getBookingById(bookingId);
      if (!bookingResponse.success || !bookingResponse.data.booking) {
        throw new Error(bookingResponse.message || "Failed to load booking details");
      }

      const bookingData = bookingResponse.data.booking;
      setBooking(bookingData);

      // Only load final bill if booking is checked out
      if (bookingData.bookingStatus === "checked_out") {
        const billResponse = await finalBillApi.getFinalBillByBookingId(bookingId);
        if (billResponse.success && billResponse.data.finalBill) {
          setFinalBill(billResponse.data.finalBill);
        } else {
          // Final bill might not exist yet, this is not necessarily an error
          console.log("Final bill not found, might be processing:", billResponse.message);
        }
      }
    } catch (error) {
      const apiError = apiUtils.handleError(error);
      showError(apiError.message);
    } finally {
      setIsLoading(false);
    }
  }, [bookingId, showError]);

  useEffect(() => {
    loadFinalBill();
  }, [loadFinalBill]);

  const handleCreateBill = async () => {
    if (!booking) {
      showError("Booking information not available");
      return;
    }

    try {
      setIsCreating(true);
      const createData: FinalBillCreateRequest = {
        user_id: booking.userId,
        booking_id: booking.bookingId,
      };

      const response = await finalBillApi.createFinalBill(createData);
      if (response.success) {
        showSuccess("Final bill created successfully");
        await loadFinalBill(); // Reload to get the new bill
      } else {
        showError(response.message || "Failed to create final bill");
      }
    } catch (error) {
      const apiError = apiUtils.handleError(error);
      showError(apiError.message);
    } finally {
      setIsCreating(false);
    }
  };

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

  if (!booking || booking.bookingStatus !== "checked_out") {
    return (
      <div className="text-center py-12">
        <Receipt className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Final Bill Not Available</h3>
        <p className="mt-1 text-sm text-gray-500">Final bill will be generated after guest checkout.</p>
        <div className="mt-4">
          <Badge className="bg-blue-100 text-blue-800">Current Status: {booking?.bookingStatus || "Unknown"}</Badge>
        </div>
      </div>
    );
  }

  if (!finalBill) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Final Bill Ready to Generate</h3>
        <p className="mt-1 text-sm text-gray-500">
          Booking is checked out. Create the final bill to proceed with billing.
        </p>
        <div className="mt-6">
          <Button onClick={handleCreateBill} disabled={isCreating} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            {isCreating ? "Creating Bill..." : "Create Final Bill"}
          </Button>
        </div>
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
