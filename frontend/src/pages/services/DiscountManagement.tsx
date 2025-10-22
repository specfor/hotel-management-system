import React, { useState, useEffect, useCallback } from "react";
import { Plus, Search, Edit, Trash2, Tag, Calendar } from "lucide-react";
import Button from "../../components/primary/Button";
import Input from "../../components/primary/Input";
import Badge from "../../components/primary/Badge";
import Modal from "../../components/Modal";
import Card from "../../components/primary/Card";
import ConfirmationModal from "../../components/ConfirmationModal";
import { useAlert } from "../../hooks/useAlert";
import { useModal } from "../../hooks/useModal";
import { ServiceDiscountConditionType, formatConditionType } from "../../types";
import type { Discount, Branch } from "../../types";
import { getDiscounts, createDiscount, updateDiscount, deleteDiscount } from "../../api_connection/discounts";
import { getBranches } from "../../api_connection/branches";

const DiscountManagement: React.FC = () => {
  const { showSuccess, showError } = useAlert();
  const { openModal, closeModal } = useModal();
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [branchFilter, setBranchFilter] = useState<string>("");
  const [conditionFilter, setConditionFilter] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);
  const [formData, setFormData] = useState<{
    discount_name: string;
    branch_id: string;
    discount_rate: string;
    condition_type: string;
    condition_value: string;
    valid_from: string;
    valid_to: string;
  }>({
    discount_name: "",
    branch_id: "",
    discount_rate: "",
    condition_type: "",
    condition_value: "",
    valid_from: "",
    valid_to: "",
  });

  const loadDiscounts = useCallback(async () => {
    try {
      const response = await getDiscounts();
      if (response.success) {
        setDiscounts(response.data);
      } else {
        showError(response.message || "Failed to load discounts");
      }
    } catch (error) {
      console.error("Error loading discounts:", error);
      showError("Failed to load discounts");
    }
  }, [showError]);

  const loadBranches = useCallback(async () => {
    try {
      const response = await getBranches();
      if (response.success) {
        // Transform branch data to match expected format
        const transformedBranches = response.data.map(
          (branch: { branchid: number; branchname: string; city: string; address: string }) => ({
            branch_id: branch.branchid,
            branch_name: branch.branchname,
            city: branch.city,
            address: branch.address,
          })
        );
        setBranches(transformedBranches);
      } else {
        showError(response.message || "Failed to load branches");
      }
    } catch (error) {
      console.error("Error loading branches:", error);
      showError("Failed to load branches");
    }
  }, [showError]);

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      await loadDiscounts();
      await loadBranches();
    };
    loadData();
  }, [loadDiscounts, loadBranches]);

  const filteredDiscounts = discounts.filter((discount) => {
    const branchName = branches.find((b) => b.branch_id === discount.branch_id)?.branch_name || "";
    const matchesSearch =
      discount.discount_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      branchName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBranch = !branchFilter || discount.branch_id.toString() === branchFilter;
    const matchesCondition = !conditionFilter || discount.condition_type === conditionFilter;
    return matchesSearch && matchesBranch && matchesCondition;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.discount_name ||
      !formData.branch_id ||
      !formData.discount_rate ||
      !formData.condition_type ||
      !formData.valid_from ||
      !formData.valid_to
    ) {
      showError("Please fill in all required fields");
      return;
    }

    const discountRate = parseFloat(formData.discount_rate);
    if (isNaN(discountRate) || discountRate <= 0 || discountRate > 100) {
      showError("Please enter a valid discount rate between 0 and 100");
      return;
    }

    const validFrom = new Date(formData.valid_from);
    const validTo = new Date(formData.valid_to);
    if (validFrom >= validTo) {
      showError("Valid from date must be before valid to date");
      return;
    }

    let conditionValue: number | undefined = undefined;
    if (formData.condition_value) {
      conditionValue = parseFloat(formData.condition_value);
      if (isNaN(conditionValue)) {
        showError("Please enter a valid condition value");
        return;
      }
    }

    try {
      const discountData = {
        branchId: parseInt(formData.branch_id),
        discountName: formData.discount_name,
        discountType: "percentage" as const, // Assuming percentage type based on backend
        discountValue: discountRate,
        minBillAmount: conditionValue,
        discountCondition: formData.condition_type,
        validFrom: formData.valid_from,
        validTo: formData.valid_to,
      };

      if (editingDiscount) {
        const response = await updateDiscount(editingDiscount.discount_id, discountData);
        if (response.success) {
          showSuccess("Discount updated successfully");
          await loadDiscounts(); // Reload to get updated data
        } else {
          showError(response.message || "Failed to update discount");
        }
      } else {
        const response = await createDiscount(discountData);
        if (response.success) {
          showSuccess("Discount created successfully");
          await loadDiscounts(); // Reload to get new data
        } else {
          showError(response.message || "Failed to create discount");
        }
      }

      resetForm();
    } catch (error) {
      console.error("Error submitting discount:", error);
      showError(editingDiscount ? "Failed to update discount" : "Failed to create discount");
    }
  };

  const handleEdit = (discount: Discount) => {
    setEditingDiscount(discount);
    setFormData({
      discount_name: discount.discount_name,
      branch_id: discount.branch_id.toString(),
      discount_rate: discount.discount_rate.toString(),
      condition_type: discount.condition_type,
      condition_value: discount.condition_value?.toString() || "",
      valid_from: discount.valid_from,
      valid_to: discount.valid_to,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (discountId: number) => {
    const discount = discounts.find((d) => d.discount_id === discountId);
    const discountName = discount?.discount_name || "this discount";

    const modalId = openModal({
      component: (
        <ConfirmationModal
          title="Delete Discount"
          message={`Are you sure you want to delete "${discountName}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
          onConfirm={() => {
            closeModal(modalId);
            performDeleteDiscount(discountId);
          }}
          onCancel={() => closeModal(modalId)}
        />
      ),
      size: "sm",
      showCloseButton: false,
    });
  };

  const performDeleteDiscount = async (discountId: number) => {
    try {
      const response = await deleteDiscount(discountId);
      if (response.success) {
        showSuccess("Discount deleted successfully");
        await loadDiscounts(); // Reload to update the list
      } else {
        showError(response.message || "Failed to delete discount");
      }
    } catch (error) {
      console.error("Error deleting discount:", error);
      showError("Failed to delete discount");
    }
  };

  const resetForm = () => {
    setFormData({
      discount_name: "",
      branch_id: "",
      discount_rate: "",
      condition_type: "",
      condition_value: "",
      valid_from: "",
      valid_to: "",
    });
    setEditingDiscount(null);
    setIsModalOpen(false);
  };

  const getBranchName = (branchId: number) => {
    return branches.find((b) => b.branch_id === branchId)?.branch_name || "Unknown";
  };

  const getConditionBadgeColor = (conditionType: ServiceDiscountConditionType) => {
    switch (conditionType) {
      case ServiceDiscountConditionType.SEASONAL:
        return "bg-green-100 text-green-800";
      case ServiceDiscountConditionType.AMOUNT_GREATER_THAN:
        return "bg-blue-100 text-blue-800";
      case ServiceDiscountConditionType.AMOUNT_LESS_THAN:
        return "bg-purple-100 text-purple-800";
      case ServiceDiscountConditionType.MINIMUM_NIGHTS:
        return "bg-orange-100 text-orange-800";
      case ServiceDiscountConditionType.EARLY_BOOKING:
        return "bg-indigo-100 text-indigo-800";
      case ServiceDiscountConditionType.LOYALTY_MEMBER:
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDiscountValue = (discount: Discount) => {
    const rate = `${discount.discount_rate}%`;
    if (discount.condition_value !== null) {
      switch (discount.condition_type) {
        case ServiceDiscountConditionType.AMOUNT_GREATER_THAN:
        case ServiceDiscountConditionType.AMOUNT_LESS_THAN:
          return `${rate} (when bill ${
            discount.condition_type === ServiceDiscountConditionType.AMOUNT_GREATER_THAN ? ">" : "<"
          } $${discount.condition_value})`;
        case ServiceDiscountConditionType.MINIMUM_NIGHTS:
          return `${rate} (min ${discount.condition_value} nights)`;
        case ServiceDiscountConditionType.EARLY_BOOKING:
          return `${rate} (book ${discount.condition_value} days early)`;
        default:
          return rate;
      }
    }
    return rate;
  };

  const isConditionValueRequired = (conditionType: string) => {
    return (
      conditionType === ServiceDiscountConditionType.AMOUNT_GREATER_THAN ||
      conditionType === ServiceDiscountConditionType.AMOUNT_LESS_THAN ||
      conditionType === ServiceDiscountConditionType.MINIMUM_NIGHTS ||
      conditionType === ServiceDiscountConditionType.EARLY_BOOKING
    );
  };

  const getConditionValueLabel = (conditionType: string) => {
    switch (conditionType) {
      case ServiceDiscountConditionType.AMOUNT_GREATER_THAN:
      case ServiceDiscountConditionType.AMOUNT_LESS_THAN:
        return "Amount ($)";
      case ServiceDiscountConditionType.MINIMUM_NIGHTS:
        return "Minimum Nights";
      case ServiceDiscountConditionType.EARLY_BOOKING:
        return "Days in Advance";
      default:
        return "Value";
    }
  };

  const isDateValid = (discount: Discount) => {
    const now = new Date();
    const validFrom = new Date(discount.valid_from);
    const validTo = new Date(discount.valid_to);
    return now >= validFrom && now <= validTo;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Discount Management</h2>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Discount
        </Button>
      </div>

      <Card>
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search by discount name or branch..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Branches</option>
                {branches.map((branch) => (
                  <option key={branch.branch_id} value={branch.branch_id.toString()}>
                    {branch.branch_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-full sm:w-48">
              <select
                value={conditionFilter}
                onChange={(e) => setConditionFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Conditions</option>
                {Object.values(ServiceDiscountConditionType).map((type) => (
                  <option key={type} value={type}>
                    {formatConditionType(type)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Discount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Branch
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Condition
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valid Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDiscounts.map((discount) => (
                <tr key={discount.discount_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Tag className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{discount.discount_name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getBranchName(discount.branch_id)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={getConditionBadgeColor(discount.condition_type)}>
                      {formatConditionType(discount.condition_type)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDiscountValue(discount)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <span>
                        {new Date(discount.valid_from).toLocaleDateString()} -{" "}
                        {new Date(discount.valid_to).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge
                      className={isDateValid(discount) ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                    >
                      {isDateValid(discount) ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(discount)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(discount.discount_id)}
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

        {filteredDiscounts.length === 0 && (
          <div className="text-center py-12">
            <Tag className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No discounts found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || branchFilter || conditionFilter
                ? "Try adjusting your search criteria."
                : "Get started by adding a new discount."}
            </p>
          </div>
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={resetForm}
        title={editingDiscount ? "Edit Discount" : "Add New Discount"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount Name *</label>
              <Input
                type="text"
                value={formData.discount_name}
                onChange={(e) => setFormData({ ...formData, discount_name: e.target.value })}
                placeholder="Enter discount name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Branch *</label>
              <select
                value={formData.branch_id}
                onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Branch</option>
                {branches.map((branch) => (
                  <option key={branch.branch_id} value={branch.branch_id.toString()}>
                    {branch.branch_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount Rate (%) *</label>
              <Input
                type="number"
                value={formData.discount_rate}
                onChange={(e) => setFormData({ ...formData, discount_rate: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Condition Type *</label>
              <select
                value={formData.condition_type}
                onChange={(e) => setFormData({ ...formData, condition_type: e.target.value, condition_value: "" })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Condition Type</option>
                {Object.values(ServiceDiscountConditionType).map((type) => (
                  <option key={type} value={type}>
                    {formatConditionType(type)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {isConditionValueRequired(formData.condition_type) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {getConditionValueLabel(formData.condition_type)} *
              </label>
              <Input
                type="number"
                value={formData.condition_value}
                onChange={(e) => setFormData({ ...formData, condition_value: e.target.value })}
                placeholder="Enter value"
                required
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valid From *</label>
              <Input
                type="date"
                value={formData.valid_from}
                onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valid To *</label>
              <Input
                type="date"
                value={formData.valid_to}
                onChange={(e) => setFormData({ ...formData, valid_to: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="ghost" onClick={resetForm}>
              Cancel
            </Button>
            <Button type="submit">{editingDiscount ? "Update Discount" : "Create Discount"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DiscountManagement;
