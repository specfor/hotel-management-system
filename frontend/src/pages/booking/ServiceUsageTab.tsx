import React, { useState, useEffect, useCallback } from "react";
import { Plus, Search, Edit, Trash2, DollarSign, Clock } from "lucide-react";
import Button from "../../components/primary/Button";
import Input from "../../components/primary/Input";
import Badge from "../../components/primary/Badge";
import Modal from "../../components/Modal";
import Card from "../../components/primary/Card";
import { useAlert } from "../../hooks/useAlert";
import { ServiceUnitType, formatUnitType, type ServiceUsage, type ChargeableService } from "../../types";

interface ServiceUsageTabProps {
  bookingId: number;
}

const ServiceUsageTab: React.FC<ServiceUsageTabProps> = ({ bookingId }) => {
  const { showSuccess, showError } = useAlert();
  const [serviceUsages, setServiceUsages] = useState<ServiceUsage[]>([]);
  const [services, setServices] = useState<ChargeableService[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUsage, setEditingUsage] = useState<ServiceUsage | null>(null);
  const [formData, setFormData] = useState<{
    service_id: string;
    usage_date: string;
    usage_time: string;
    quantity: string;
    notes: string;
  }>({
    service_id: "",
    usage_date: new Date().toISOString().split("T")[0],
    usage_time: new Date().toTimeString().split(" ")[0].substring(0, 5),
    quantity: "1",
    notes: "",
  });

  const loadServiceUsages = useCallback(async () => {
    try {
      // TODO: Replace with actual API call
      const mockUsages: ServiceUsage[] = [
        {
          usage_id: 1,
          booking_id: bookingId,
          service_id: 1,
          usage_date: "2024-01-21",
          usage_time: "10:30",
          quantity: 2,
          unit_price: 15.0,
          total_price: 30.0,
          notes: "Extra towels requested",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          service_name: "Room Service",
          unit_type: ServiceUnitType.PER_ITEM,
        },
        {
          usage_id: 2,
          booking_id: bookingId,
          service_id: 2,
          usage_date: "2024-01-22",
          usage_time: "14:00",
          quantity: 1,
          unit_price: 120.0,
          total_price: 120.0,
          notes: "Relaxing massage",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          service_name: "Spa Treatment",
          unit_type: ServiceUnitType.PER_HOUR,
        },
        {
          usage_id: 3,
          booking_id: bookingId,
          service_id: 3,
          usage_date: "2024-01-23",
          usage_time: "19:30",
          quantity: 2,
          unit_price: 45.0,
          total_price: 90.0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          service_name: "Dinner Service",
          unit_type: ServiceUnitType.PER_PERSON,
        },
      ];
      setServiceUsages(mockUsages);
    } catch {
      showError("Failed to load service usage records");
    }
  }, [bookingId, showError]);

  const loadServices = useCallback(async () => {
    try {
      // TODO: Replace with actual API call
      const mockServices: ChargeableService[] = [
        {
          service_id: 1,
          service_name: "Room Service",
          branch_id: 1,
          unit_type: ServiceUnitType.PER_ITEM,
          unit_price: 15.0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          service_id: 2,
          service_name: "Spa Treatment",
          branch_id: 1,
          unit_type: ServiceUnitType.PER_HOUR,
          unit_price: 120.0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          service_id: 3,
          service_name: "Dinner Service",
          branch_id: 1,
          unit_type: ServiceUnitType.PER_PERSON,
          unit_price: 45.0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          service_id: 4,
          service_name: "Laundry Service",
          branch_id: 1,
          unit_type: ServiceUnitType.PER_ITEM,
          unit_price: 8.0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];
      setServices(mockServices);
    } catch {
      showError("Failed to load available services");
    }
  }, [showError]);

  useEffect(() => {
    const loadData = async () => {
      await loadServiceUsages();
      await loadServices();
    };
    loadData();
  }, [loadServiceUsages, loadServices]);

  const filteredUsages = serviceUsages.filter(
    (usage) =>
      usage.service_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usage.notes?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.service_id || !formData.quantity) {
      showError("Please select a service and enter quantity");
      return;
    }

    const quantity = parseInt(formData.quantity);
    if (isNaN(quantity) || quantity <= 0) {
      showError("Please enter a valid quantity");
      return;
    }

    try {
      const selectedService = services.find((s) => s.service_id.toString() === formData.service_id);
      if (!selectedService) {
        showError("Selected service not found");
        return;
      }

      const totalPrice = selectedService.unit_price * quantity;

      const usageData = {
        usage_id: editingUsage ? editingUsage.usage_id : Math.max(...serviceUsages.map((u) => u.usage_id), 0) + 1,
        booking_id: bookingId,
        service_id: parseInt(formData.service_id),
        usage_date: formData.usage_date,
        usage_time: formData.usage_time,
        quantity: quantity,
        unit_price: selectedService.unit_price,
        total_price: totalPrice,
        notes: formData.notes || undefined,
        created_at: editingUsage?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        service_name: selectedService.service_name,
        unit_type: selectedService.unit_type,
      };

      if (editingUsage) {
        // Update existing usage
        setServiceUsages(serviceUsages.map((u) => (u.usage_id === editingUsage.usage_id ? usageData : u)));
        showSuccess("Service usage updated successfully");
      } else {
        // Add new usage
        setServiceUsages([...serviceUsages, usageData]);
        showSuccess("Service usage added successfully");
      }

      resetForm();
    } catch {
      showError(editingUsage ? "Failed to update service usage" : "Failed to add service usage");
    }
  };

  const handleEdit = (usage: ServiceUsage) => {
    setEditingUsage(usage);
    setFormData({
      service_id: usage.service_id.toString(),
      usage_date: usage.usage_date,
      usage_time: usage.usage_time,
      quantity: usage.quantity.toString(),
      notes: usage.notes || "",
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = async (usageId: number) => {
    if (!confirm("Are you sure you want to delete this service usage record?")) return;

    try {
      setServiceUsages(serviceUsages.filter((u) => u.usage_id !== usageId));
      showSuccess("Service usage deleted successfully");
    } catch {
      showError("Failed to delete service usage");
    }
  };

  const resetForm = () => {
    setFormData({
      service_id: "",
      usage_date: new Date().toISOString().split("T")[0],
      usage_time: new Date().toTimeString().split(" ")[0].substring(0, 5),
      quantity: "1",
      notes: "",
    });
    setEditingUsage(null);
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
  };

  const getTotalServiceCharges = () => {
    return serviceUsages.reduce((total, usage) => total + usage.total_price, 0);
  };

  const formatDateTime = (date: string, time: string) => {
    return `${new Date(date).toLocaleDateString()} ${time}`;
  };

  const getUnitTypeBadgeColor = (unitType: ServiceUnitType) => {
    switch (unitType) {
      case ServiceUnitType.PER_HOUR:
        return "bg-blue-100 text-blue-800";
      case ServiceUnitType.PER_ITEM:
        return "bg-green-100 text-green-800";
      case ServiceUnitType.PER_DAY:
        return "bg-purple-100 text-purple-800";
      case ServiceUnitType.PER_NIGHT:
        return "bg-indigo-100 text-indigo-800";
      case ServiceUnitType.PER_PERSON:
        return "bg-orange-100 text-orange-800";
      case ServiceUnitType.PER_USE:
        return "bg-gray-100 text-gray-800";
      case ServiceUnitType.FLAT_RATE:
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
          <h3 className="text-lg font-semibold text-gray-900">Services Used</h3>
          <p className="text-sm text-gray-600">
            Total charges: <span className="font-medium">${getTotalServiceCharges().toFixed(2)}</span>
          </p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Service Usage
        </Button>
      </div>

      {/* Search and Filter */}
      <Card>
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search by service name or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Service Usage Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsages.map((usage) => (
                <tr key={usage.usage_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <DollarSign className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{usage.service_name}</div>
                        {usage.notes && <div className="text-sm text-gray-500">{usage.notes}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-gray-400 mr-2" />
                      <div className="text-sm text-gray-900">{formatDateTime(usage.usage_date, usage.usage_time)}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {usage.unit_type && (
                      <Badge className={getUnitTypeBadgeColor(usage.unit_type as ServiceUnitType)}>
                        {formatUnitType(usage.unit_type as ServiceUnitType)}
                      </Badge>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{usage.quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${usage.unit_price.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${usage.total_price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(usage)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(usage.usage_id)}
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

        {filteredUsages.length === 0 && (
          <div className="text-center py-12">
            <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No service usage records</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? "Try adjusting your search criteria." : "Start by adding a service usage record."}
            </p>
          </div>
        )}
      </Card>

      {/* Add Service Usage Modal */}
      <Modal isOpen={isAddModalOpen} onClose={resetForm} title="Add Service Usage" size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Service *</label>
            <select
              value={formData.service_id}
              onChange={(e) => setFormData({ ...formData, service_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Service</option>
              {services.map((service) => (
                <option key={service.service_id} value={service.service_id.toString()}>
                  {service.service_name} (${service.unit_price.toFixed(2)} per{" "}
                  {formatUnitType(service.unit_type).toLowerCase()})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Usage Date *</label>
              <Input
                type="date"
                value={formData.usage_date}
                onChange={(e) => setFormData({ ...formData, usage_date: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Usage Time *</label>
              <input
                type="time"
                value={formData.usage_time}
                onChange={(e) => setFormData({ ...formData, usage_time: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
            <Input
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              placeholder="Enter quantity"
              required
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
            <Button type="submit">Add Service Usage</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Service Usage Modal */}
      <Modal isOpen={isEditModalOpen} onClose={resetForm} title="Edit Service Usage" size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Service *</label>
            <select
              value={formData.service_id}
              onChange={(e) => setFormData({ ...formData, service_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Service</option>
              {services.map((service) => (
                <option key={service.service_id} value={service.service_id.toString()}>
                  {service.service_name} (${service.unit_price.toFixed(2)} per{" "}
                  {formatUnitType(service.unit_type).toLowerCase()})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Usage Date *</label>
              <Input
                type="date"
                value={formData.usage_date}
                onChange={(e) => setFormData({ ...formData, usage_date: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Usage Time *</label>
              <input
                type="time"
                value={formData.usage_time}
                onChange={(e) => setFormData({ ...formData, usage_time: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
            <Input
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              placeholder="Enter quantity"
              required
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
            <Button type="submit">Update Service Usage</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ServiceUsageTab;
