import React, { useState } from "react";
import { Building, MapPin } from "lucide-react";

interface Branch {
  branch_id: number;
  branch_name: string;
  city: string;
  address: string;
}

interface UpdateBranchFormProps {
  branch: Branch;
  onSubmit: (data: Omit<Branch, "branch_id">) => void;
  onCancel: () => void;
}

const UpdateBranchForm: React.FC<UpdateBranchFormProps> = ({ branch, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    branch_name: branch.branch_name,
    city: branch.city,
    address: branch.address,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.branch_name.trim()) {
      newErrors.branch_name = "Branch name is required";
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      await onSubmit({
        branch_name: formData.branch_name.trim(),
        city: formData.city.trim(),
        address: formData.address.trim(),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Branch Info Header */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-blue-800 mb-1">Updating Branch</h3>
        <p className="text-sm text-blue-600">Branch ID: {branch.branch_id}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Branch Name */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <Building className="h-4 w-4 mr-2" />
            Branch Name *
          </label>
          <input
            type="text"
            placeholder="Enter branch name"
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.branch_name
                ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:border-blue-500"
            }`}
            value={formData.branch_name}
            onChange={(e) => handleChange("branch_name", e.target.value)}
          />
          {errors.branch_name && <p className="mt-1 text-sm text-red-600">{errors.branch_name}</p>}
        </div>

        {/* City */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <MapPin className="h-4 w-4 mr-2" />
            City *
          </label>
          <input
            type="text"
            placeholder="Enter city name"
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.city
                ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:border-blue-500"
            }`}
            value={formData.city}
            onChange={(e) => handleChange("city", e.target.value)}
          />
          {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
        </div>

        {/* Address */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <MapPin className="h-4 w-4 mr-2" />
            Address *
          </label>
          <textarea
            placeholder="Enter full address"
            rows={3}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.address
                ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:border-blue-500"
            }`}
            value={formData.address}
            onChange={(e) => handleChange("address", e.target.value)}
          />
          {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            )}
            Update Branch
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateBranchForm;
