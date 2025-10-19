import React, { useState } from "react";
import { Users, Building, Phone, Mail, DollarSign } from "lucide-react";
import Input from "../../components/primary/Input";
import Button from "../../components/primary/Button";
import { JobTitle } from "../../types/staff";
import type { Staff, StaffFormData, Branch } from "../../types/staff";

interface UpdateStaffFormProps {
  staff: Staff;
  branches: Branch[];
  onSubmit: (data: StaffFormData) => Promise<boolean>;
  onCancel: () => void;
}

const UpdateStaffForm: React.FC<UpdateStaffFormProps> = ({ staff, branches, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<StaffFormData>({
    name: staff.name,
    branch_id: staff.branch_id.toString(),
    contact_number: staff.contact_number,
    email: staff.email,
    job_title: staff.job_title,
    salary: staff.salary.toString(),
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.branch_id) {
      newErrors.branch_id = "Branch is required";
    }

    if (!formData.contact_number.trim()) {
      newErrors.contact_number = "Contact number is required";
    } else if (!/^\d{10}$/.test(formData.contact_number.replace(/\D/g, ""))) {
      newErrors.contact_number = "Contact number must be 10 digits";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Valid email is required";
    }

    if (!formData.salary.trim()) {
      newErrors.salary = "Salary is required";
    } else if (isNaN(Number(formData.salary)) || Number(formData.salary) <= 0) {
      newErrors.salary = "Salary must be a positive number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      const success = await onSubmit(formData);
      if (success) {
        // Form will be closed by parent component
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof StaffFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name */}
      <div>
        <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
          <Users className="h-4 w-4 mr-2" />
          Full Name *
        </label>
        <Input
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          placeholder="Enter full name"
          error={errors.name}
        />
      </div>

      {/* Branch */}
      <div>
        <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
          <Building className="h-4 w-4 mr-2" />
          Branch *
        </label>
        <select
          value={formData.branch_id}
          onChange={(e) => handleChange("branch_id", e.target.value)}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.branch_id ? "border-red-300" : "border-gray-300"
          }`}
        >
          <option value="">Select Branch</option>
          {branches.map((branch) => (
            <option key={branch.branch_id} value={branch.branch_id}>
              {branch.branch_name} - {branch.city}
            </option>
          ))}
        </select>
        {errors.branch_id && <p className="text-red-600 text-sm mt-1">{errors.branch_id}</p>}
      </div>

      {/* Contact Number */}
      <div>
        <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
          <Phone className="h-4 w-4 mr-2" />
          Contact Number *
        </label>
        <Input
          value={formData.contact_number}
          onChange={(e) => handleChange("contact_number", e.target.value)}
          placeholder="Enter contact number"
          error={errors.contact_number}
        />
      </div>

      {/* Email */}
      <div>
        <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
          <Mail className="h-4 w-4 mr-2" />
          Email *
        </label>
        <Input
          type="email"
          value={formData.email}
          onChange={(e) => handleChange("email", e.target.value)}
          placeholder="Enter email address"
          error={errors.email}
        />
      </div>

      {/* Job Title */}
      <div>
        <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
          <Users className="h-4 w-4 mr-2" />
          Job Title *
        </label>
        <select
          value={formData.job_title}
          onChange={(e) => handleChange("job_title", e.target.value as JobTitle)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {Object.values(JobTitle).map((title) => (
            <option key={title} value={title}>
              {title}
            </option>
          ))}
        </select>
      </div>

      {/* Salary */}
      <div>
        <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
          <DollarSign className="h-4 w-4 mr-2" />
          Salary *
        </label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={formData.salary}
          onChange={(e) => handleChange("salary", e.target.value)}
          placeholder="Enter salary"
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.salary ? "border-red-300" : "border-gray-300"
          }`}
        />
        {errors.salary && <p className="text-red-600 text-sm mt-1">{errors.salary}</p>}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-6 border-t">
        <Button variant="secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={loading} disabled={loading}>
          Update Staff Member
        </Button>
      </div>
    </form>
  );
};

export default UpdateStaffForm;
