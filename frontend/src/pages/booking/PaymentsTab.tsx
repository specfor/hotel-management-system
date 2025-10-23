import React, { useState, useEffect, useCallback } from "react";
import { Plus, Search, Edit, Trash2, CreditCard, Calendar } from "lucide-react";
import Button from "../../components/primary/Button";
import Input from "../../components/primary/Input";
import Badge from "../../components/primary/Badge";
import Modal from "../../components/Modal";
import Card from "../../components/primary/Card";
import { useAlert } from "../../hooks/useAlert";
import { paymentApi, type Payment as ApiPayment, type PaymentCreateRequest } from "../../api_connection/payments";
import { finalBillApi } from "../../api_connection/finalBill";
import { apiUtils } from "../../api_connection/base";

interface PaymentsTabProps {
  bookingId: number;
}

const PaymentsTab: React.FC<PaymentsTabProps> = ({ bookingId }) => {
  const { showSuccess, showError } = useAlert();
  const [payments, setPayments] = useState<ApiPayment[]>([]);
  const [finalBillId, setFinalBillId] = useState<number | null>(null);
  const [isLoadingBill, setIsLoadingBill] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<ApiPayment | null>(null);
  const [formData, setFormData] = useState<{
    paid_amount: string;
    paid_method: "Cash" | "Card" | "Online" | "BankTransfer" | "";
    date_time: string;
    notes: string;
  }>({
    paid_amount: "",
    paid_method: "",
    date_time: new Date().toISOString(),
    notes: "",
  });

  const loadFinalBillAndPayments = useCallback(async () => {
    try {
      setIsLoadingBill(true);

      // First get the final bill to get the bill_id
      const billResponse = await finalBillApi.getFinalBillByBookingId(bookingId);
      if (!billResponse.success || !billResponse.data.finalBill) {
        // If no final bill exists, show empty state
        setPayments([]);
        setFinalBillId(null);
        return;
      }

      const billId = billResponse.data.finalBill.bill_id;
      setFinalBillId(billId);

      // Now get payments for this bill
      const paymentsResponse = await paymentApi.getPaymentsByBillId(billId);
      if (paymentsResponse.success && paymentsResponse.data.Payments) {
        setPayments(paymentsResponse.data.Payments);
      } else {
        setPayments([]);
      }
    } catch (error) {
      const apiError = apiUtils.handleError(error);
      showError(apiError.message);
      setPayments([]);
      setFinalBillId(null);
    } finally {
      setIsLoadingBill(false);
    }
  }, [bookingId, showError]);

  useEffect(() => {
    loadFinalBillAndPayments();
  }, [loadFinalBillAndPayments]);

  const filteredPayments = payments.filter((payment) =>
    payment.paid_method.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.paid_amount || !formData.paid_method) {
      showError("Please enter payment amount and method");
      return;
    }

    if (!finalBillId) {
      showError("No final bill found for this booking");
      return;
    }

    const amount = parseFloat(formData.paid_amount);
    if (isNaN(amount) || amount <= 0) {
      showError("Please enter a valid payment amount");
      return;
    }

    try {
      if (editingPayment) {
        // Update existing payment
        const updateData = {
          bill_id: finalBillId,
          paid_method: formData.paid_method as "Cash" | "Card" | "Online" | "BankTransfer",
          paid_amount: amount,
          date_time: null,
          notes: formData.notes || null,
        };

        const response = await paymentApi.updatePayment(editingPayment.payment_id!, updateData);
        if (response.success) {
          showSuccess("Payment updated successfully");
          await loadFinalBillAndPayments(); // Reload payments
        } else {
          showError(response.message || "Failed to update payment");
        }
      } else {
        // Create new payment
        const createData: PaymentCreateRequest = {
          bill_id: finalBillId,
          paid_method: formData.paid_method as "Cash" | "Card" | "Online" | "BankTransfer",
          paid_amount: amount,
          date_time: formData.date_time,
          notes: formData.notes || null,
        };

        const response = await paymentApi.createPayment(createData);
        if (response.success) {
          showSuccess("Payment added successfully");
          await loadFinalBillAndPayments(); // Reload payments
        } else {
          showError(response.message || "Failed to add payment");
        }
      }

      resetForm();
    } catch (error) {
      const apiError = apiUtils.handleError(error);
      showError(apiError.message);
    }
  };

  const handleEdit = (payment: ApiPayment) => {
    setEditingPayment(payment);
    setFormData({
      paid_amount: payment.paid_amount,
      paid_method: payment.paid_method,
      date_time: payment.date_time || new Date().toISOString(),
      notes: payment.notes || "",
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = async (paymentId: number) => {
    if (!confirm("Are you sure you want to delete this payment record?")) return;

    try {
      const response = await paymentApi.deletePayment(paymentId);
      if (response.success) {
        showSuccess("Payment deleted successfully");
        await loadFinalBillAndPayments(); // Reload payments
      } else {
        showError(response.message || "Failed to delete payment");
      }
    } catch (error) {
      const apiError = apiUtils.handleError(error);
      showError(apiError.message);
    }
  };

  const resetForm = () => {
    setFormData({
      paid_amount: "",
      paid_method: "",
      date_time: new Date().toISOString(),
      notes: "",
    });
    setEditingPayment(null);
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
  };

  const getTotalPaid = () => {
    return payments.reduce((total, payment) => total + parseFloat(payment.paid_amount), 0);
  };

  const formatDateTime = (dateTime: string | null) => {
    if (!dateTime) return "-";
    return new Date(dateTime).toLocaleString();
  };

  const getPaymentMethodBadgeColor = (method: string) => {
    switch (method) {
      case "Cash":
        return "bg-green-100 text-green-800";
      case "Card":
        return "bg-blue-100 text-blue-800";
      case "Online":
        return "bg-purple-100 text-purple-800";
      case "BankTransfer":
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Show loading state
  if (isLoadingBill) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading payment information...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show message if no final bill exists
  if (!finalBillId) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No Final Bill Available</h3>
          <p className="mt-1 text-sm text-gray-500">
            Payments will be available after the final bill is generated for this booking.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Payment History</h3>
          <p className="text-sm text-gray-600">
            Total paid: <span className="font-medium text-green-600">${getTotalPaid().toFixed(2)}</span>
          </p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Payment
        </Button>
      </div>

      {/* Search and Filter */}
      <Card>
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search by payment method..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Payments Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.map((payment) => (
                <tr key={payment.payment_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <div className="text-sm text-gray-900">{formatDateTime(payment.date_time)}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-green-600">
                      ${parseFloat(payment.paid_amount).toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={getPaymentMethodBadgeColor(payment.paid_method)}>{payment.paid_method}</Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(payment)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(payment.payment_id!)}
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

        {filteredPayments.length === 0 && (
          <div className="text-center py-12">
            <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No payment records</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? "Try adjusting your search criteria." : "Start by adding a payment record."}
            </p>
          </div>
        )}
      </Card>

      {/* Add Payment Modal */}
      <Modal isOpen={isAddModalOpen} onClose={resetForm} title="Add Payment" size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Amount *</label>
            <input
              type="number"
              step="0.01"
              value={formData.paid_amount}
              onChange={(e) => setFormData({ ...formData, paid_amount: e.target.value })}
              placeholder="Enter amount"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method *</label>
            <select
              value={formData.paid_method}
              onChange={(e) =>
                setFormData({ ...formData, paid_method: e.target.value as "Cash" | "Card" | "Online" | "BankTransfer" })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Payment Method</option>
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="Online">Online</option>
              <option value="BankTransfer">Bank Transfer</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time *</label>
            <input
              type="datetime-local"
              value={formData.date_time.slice(0, 16)}
              onChange={(e) => setFormData({ ...formData, date_time: new Date(e.target.value).toISOString() })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="ghost" onClick={resetForm}>
              Cancel
            </Button>
            <Button type="submit">Add Payment</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Payment Modal */}
      <Modal isOpen={isEditModalOpen} onClose={resetForm} title="Edit Payment" size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Amount *</label>
            <input
              type="number"
              step="0.01"
              value={formData.paid_amount}
              onChange={(e) => setFormData({ ...formData, paid_amount: e.target.value })}
              placeholder="Enter amount"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method *</label>
            <select
              value={formData.paid_method}
              onChange={(e) =>
                setFormData({ ...formData, paid_method: e.target.value as "Cash" | "Card" | "Online" | "BankTransfer" })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Payment Method</option>
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="Online">Online</option>
              <option value="BankTransfer">Bank Transfer</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time *</label>
            <input
              type="datetime-local"
              value={formData.date_time.slice(0, 16)}
              onChange={(e) => setFormData({ ...formData, date_time: new Date(e.target.value).toISOString() })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="ghost" onClick={resetForm}>
              Cancel
            </Button>
            <Button type="submit">Update Payment</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PaymentsTab;
