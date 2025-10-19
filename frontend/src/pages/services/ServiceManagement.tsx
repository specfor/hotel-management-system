import React, { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, DollarSign } from "lucide-react";
import Button from "../../components/primary/Button";
import Input from "../../components/primary/Input";
import Badge from "../../components/primary/Badge";
import Modal from "../../components/Modal";
import Card from "../../components/primary/Card";
import { useAlert } from "../../hooks/useAlert";
import { ServiceUnitType } from "../../types";
import type { ChargeableService, Branch } from "../../types";

const ServiceManagement: React.FC = () => {
  const { showSuccess, showError } = useAlert();
  const [services, setServices] = useState<ChargeableService[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [branchFilter, setBranchFilter] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ChargeableService | null>(null);
  const [formData, setFormData] = useState<{
    service_name: string;
    branch_id: string;
    unit_type: string;
    unit_price: string;
  }>({
    service_name: "",
    branch_id: "",
    unit_type: "",
    unit_price: "",
  });

  // Mock data for testing - replace with actual API calls
  useEffect(() => {
    const loadData = async () => {
      await loadServices();
      await loadBranches();
    };
    loadData();
  }, []);

  const loadServices = async () => {
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
      ];
      setServices(mockServices);
    } catch {
      showError("Failed to load services");
    }
  };

  const loadBranches = async () => {
    try {
      // TODO: Replace with actual API call
      const mockBranches: Branch[] = [
        {
          branch_id: 1,
          branch_name: "Main Branch",
          city: "New York",
          address: "123 Main St",
        },
      ];
      setBranches(mockBranches);
    } catch {
      showError("Failed to load branches");
    }
  };

  const filteredServices = services.filter((service) => {
    const branchName = branches.find((b) => b.branch_id === service.branch_id)?.branch_name || "";
    const matchesSearch =
      service.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      branchName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBranch = !branchFilter || service.branch_id.toString() === branchFilter;
    return matchesSearch && matchesBranch;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.service_name || !formData.branch_id || !formData.unit_type || !formData.unit_price) {
      showError("Please fill in all fields");
      return;
    }

    const unitPrice = parseFloat(formData.unit_price);
    if (isNaN(unitPrice) || unitPrice <= 0) {
      showError("Please enter a valid unit price");
      return;
    }

    try {
      const serviceData = {
        service_name: formData.service_name,
        branch_id: parseInt(formData.branch_id),
        unit_type: formData.unit_type as ServiceUnitType,
        unit_price: unitPrice,
      };

      if (editingService) {
        // TODO: Replace with actual API call
        const updatedService = {
          ...editingService,
          ...serviceData,
          updated_at: new Date().toISOString(),
        };
        setServices(services.map((s) => (s.service_id === editingService.service_id ? updatedService : s)));
        showSuccess("Service updated successfully");
      } else {
        // TODO: Replace with actual API call
        const newService = {
          service_id: Math.max(...services.map((s) => s.service_id)) + 1,
          ...serviceData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setServices([...services, newService]);
        showSuccess("Service created successfully");
      }

      resetForm();
    } catch {
      showError(editingService ? "Failed to update service" : "Failed to create service");
    }
  };

  const handleEdit = (service: ChargeableService) => {
    setEditingService(service);
    setFormData({
      service_name: service.service_name,
      branch_id: service.branch_id.toString(),
      unit_type: service.unit_type,
      unit_price: service.unit_price.toString(),
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (serviceId: number) => {
    if (!confirm("Are you sure you want to delete this service?")) return;

    try {
      // TODO: Replace with actual API call
      setServices(services.filter((s) => s.service_id !== serviceId));
      showSuccess("Service deleted successfully");
    } catch {
      showError("Failed to delete service");
    }
  };

  const resetForm = () => {
    setFormData({
      service_name: "",
      branch_id: "",
      unit_type: "",
      unit_price: "",
    });
    setEditingService(null);
    setIsModalOpen(false);
  };

  const getBranchName = (branchId: number) => {
    return branches.find((b) => b.branch_id === branchId)?.branch_name || "Unknown";
  };

  const formatUnitType = (unitType: ServiceUnitType) => {
    return unitType
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
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
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Chargeable Services</h2>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Service
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
                  placeholder="Search by service name or branch..."
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
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Branch
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit Price
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredServices.map((service) => (
                <tr key={service.service_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <DollarSign className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{service.service_name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getBranchName(service.branch_id)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={getUnitTypeBadgeColor(service.unit_type)}>
                      {formatUnitType(service.unit_type)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${service.unit_price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(service)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(service.service_id)}
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

        {filteredServices.length === 0 && (
          <div className="text-center py-12">
            <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No services found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || branchFilter
                ? "Try adjusting your search criteria."
                : "Get started by adding a new service."}
            </p>
          </div>
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={resetForm}
        title={editingService ? "Edit Service" : "Add New Service"}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Service Name *</label>
            <Input
              type="text"
              value={formData.service_name}
              onChange={(e) => setFormData({ ...formData, service_name: e.target.value })}
              placeholder="Enter service name"
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unit Type *</label>
            <select
              value={formData.unit_type}
              onChange={(e) => setFormData({ ...formData, unit_type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Unit Type</option>
              {Object.values(ServiceUnitType).map((type) => (
                <option key={type} value={type}>
                  {formatUnitType(type)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price *</label>
            <Input
              type="number"
              value={formData.unit_price}
              onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
              placeholder="0.00"
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="ghost" onClick={resetForm}>
              Cancel
            </Button>
            <Button type="submit">{editingService ? "Update Service" : "Create Service"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ServiceManagement;
