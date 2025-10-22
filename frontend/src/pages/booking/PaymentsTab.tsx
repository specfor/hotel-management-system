import React, { useState, useEffect, useCallback } from "react";
import { Plus, Search, Edit, Trash2, CreditCard, Calendar } from "lucide-react";
import Button from "../../components/primary/Button";
import Input from "../../components/primary/Input";
import Badge from "../../components/primary/Badge";
import Modal from "../../components/Modal";
import Card from "../../components/primary/Card";
import { useAlert } from "../../hooks/useAlert";
import { PaymentMethodEnum, formatPaymentMethod, type Payment, type PaymentMethod } from "../../types";

interface PaymentsTabProps {
  bookingId: number;
}

const PaymentsTab: React.FC<PaymentsTabProps> = ({ bookingId }) => {
  const { showSuccess, showError } = useAlert();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [formData, setFormData] = useState<{
    payment_amount: string;
    payment_method: PaymentMethod | "";
    payment_date: string;
    payment_time: string;
    transaction_reference: string;
    notes: string;
  }>({
    payment_amount: "",
    payment_method: "",
    payment_date: new Date().toISOString().split("T")[0],
    payment_time: new Date().toTimeString().split(" ")[0].substring(0, 5),
    transaction_reference: "",
    notes: "",
  });

  const loadPayments = useCallback(async () => {
    try {
      // TODO: Replace with actual API call
      const mockPayments: Payment[] = [
        {
          payment_id: 1,
          booking_id: bookingId,
          payment_amount: 250.0,
          payment_method: PaymentMethodEnum.CREDIT_CARD,
          payment_date: "2024-01-21",
          payment_time: "15:30",
          transaction_reference: "TXN123456789",
          notes: "Advance payment for booking",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          payment_id: 2,
          booking_id: bookingId,
          payment_amount: 150.0,
          payment_method: PaymentMethodEnum.CASH,
          payment_date: "2024-01-23",
          payment_time: "11:15",
          notes: "Additional service charges",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          payment_id: 3,
          booking_id: bookingId,
          payment_amount: 300.0,
          payment_method: PaymentMethodEnum.BANK_TRANSFER,
          payment_date: "2024-01-24",
          payment_time: "09:45",
          transaction_reference: "BT987654321",
          notes: "Final settlement upon checkout",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];
      setPayments(mockPayments);
    } catch {
      showError("Failed to load payment records");
    }
  }, [bookingId, showError]);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  const filteredPayments = payments.filter(
    (payment) =>
      payment.payment_method.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.transaction_reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.notes?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.payment_amount || !formData.payment_method) {
      showError("Please enter payment amount and method");
      return;
    }

    const amount = parseFloat(formData.payment_amount);
    if (isNaN(amount) || amount <= 0) {
      showError("Please enter a valid payment amount");
      return;
    }

    try {
      const paymentData = {
        payment_id: editingPayment ? editingPayment.payment_id : Math.max(...payments.map((p) => p.payment_id), 0) + 1,
        booking_id: bookingId,
        payment_amount: amount,
        payment_method: formData.payment_method as PaymentMethod,
        payment_date: formData.payment_date,
        payment_time: formData.payment_time,
        transaction_reference: formData.transaction_reference || undefined,
        notes: formData.notes || undefined,
        created_at: editingPayment?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (editingPayment) {
        // Update existing payment
        setPayments(payments.map((p) => (p.payment_id === editingPayment.payment_id ? paymentData : p)));
        showSuccess("Payment updated successfully");
      } else {
        // Add new payment
        setPayments([...payments, paymentData]);
        showSuccess("Payment added successfully");
      }

      resetForm();
    } catch {
      showError(editingPayment ? "Failed to update payment" : "Failed to add payment");
    }
  };

  const handleEdit = (payment: Payment) => {
    setEditingPayment(payment);
    setFormData({
      payment_amount: payment.payment_amount.toString(),
      payment_method: payment.payment_method,
      payment_date: payment.payment_date,
      payment_time: payment.payment_time,
      transaction_reference: payment.transaction_reference || "",
      notes: payment.notes || "",
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = async (paymentId: number) => {
    if (!confirm("Are you sure you want to delete this payment record?")) return;

    try {
      setPayments(payments.filter((p) => p.payment_id !== paymentId));
      showSuccess("Payment deleted successfully");
    } catch {
      showError("Failed to delete payment");
    }
  };

  const resetForm = () => {
    setFormData({
      payment_amount: "",
      payment_method: "",
      payment_date: new Date().toISOString().split("T")[0],
      payment_time: new Date().toTimeString().split(" ")[0].substring(0, 5),
      transaction_reference: "",
      notes: "",
    });
    setEditingPayment(null);
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
  };

  const getTotalPaid = () => {
    return payments.reduce((total, payment) => total + payment.payment_amount, 0);
  };

  const formatDateTime = (date: string, time: string) => {
    return `${new Date(date).toLocaleDateString()} ${time}`;
  };

  const getPaymentMethodBadgeColor = (method: PaymentMethod) => {
    switch (method) {
      case PaymentMethodEnum.CASH:
        return "bg-green-100 text-green-800";
      case PaymentMethodEnum.CREDIT_CARD:
        return "bg-blue-100 text-blue-800";
      case PaymentMethodEnum.DEBIT_CARD:
        return "bg-purple-100 text-purple-800";
      case PaymentMethodEnum.BANK_TRANSFER:
        return "bg-indigo-100 text-indigo-800";
      case PaymentMethodEnum.MOBILE_PAYMENT:
        return "bg-orange-100 text-orange-800";
      case PaymentMethodEnum.CHECK:
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

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
              placeholder="Search by payment method, reference, or notes..."
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reference
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notes
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
                      <div className="text-sm text-gray-900">
                        {formatDateTime(payment.payment_date, payment.payment_time)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-green-600">${payment.payment_amount.toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={getPaymentMethodBadgeColor(payment.payment_method)}>
                      {formatPaymentMethod(payment.payment_method)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{payment.transaction_reference || "-"}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 max-w-xs truncate">{payment.notes || "-"}</div>
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
                        onClick={() => handleDelete(payment.payment_id)}
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
              value={formData.payment_amount}
              onChange={(e) => setFormData({ ...formData, payment_amount: e.target.value })}
              placeholder="Enter amount"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method *</label>
            <select
              value={formData.payment_method}
              onChange={(e) => setFormData({ ...formData, payment_method: e.target.value as PaymentMethod })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Payment Method</option>
              {Object.values(PaymentMethodEnum).map((method) => (
                <option key={method} value={method}>
                  {formatPaymentMethod(method)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date *</label>
              <Input
                type="date"
                value={formData.payment_date}
                onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Time *</label>
              <input
                type="time"
                value={formData.payment_time}
                onChange={(e) => setFormData({ ...formData, payment_time: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Reference</label>
            <Input
              type="text"
              value={formData.transaction_reference}
              onChange={(e) => setFormData({ ...formData, transaction_reference: e.target.value })}
              placeholder="Transaction ID, check number, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Any additional notes..."
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
              value={formData.payment_amount}
              onChange={(e) => setFormData({ ...formData, payment_amount: e.target.value })}
              placeholder="Enter amount"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method *</label>
            <select
              value={formData.payment_method}
              onChange={(e) => setFormData({ ...formData, payment_method: e.target.value as PaymentMethod })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Payment Method</option>
              {Object.values(PaymentMethodEnum).map((method) => (
                <option key={method} value={method}>
                  {formatPaymentMethod(method)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date *</label>
              <Input
                type="date"
                value={formData.payment_date}
                onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Time *</label>
              <input
                type="time"
                value={formData.payment_time}
                onChange={(e) => setFormData({ ...formData, payment_time: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Reference</label>
            <Input
              type="text"
              value={formData.transaction_reference}
              onChange={(e) => setFormData({ ...formData, transaction_reference: e.target.value })}
              placeholder="Transaction ID, check number, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Any additional notes..."
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
