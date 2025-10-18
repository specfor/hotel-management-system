import React, { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, Eye, Users } from "lucide-react";
import Table from "../../components/primary/Table";
import Button from "../../components/primary/Button";
import Input from "../../components/primary/Input";
import Badge from "../../components/primary/Badge";
import Modal from "../../components/Modal";
import { useAlert } from "../../hooks/useAlert";
import StaffDetailsModal from "./StaffDetailsModal";
import { JobTitle } from "../../types/staff";
import type { Staff, StaffFilters, StaffFormData, Branch } from "../../types/staff";
import type { TableColumn } from "../../types/table";

// API integration ready - import and use:
// import { getStaff, createStaff, updateStaff, deleteStaff, sendPasswordReset, getBranches } from "../../api_connection";

const StaffManagement: React.FC = () => {
  const { showSuccess, showError } = useAlert();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [filters, setFilters] = useState<StaffFilters & { search: string }>({
    search: "",
    name: "",
    branch_id: undefined,
    job_title: undefined,
    email: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [formData, setFormData] = useState<StaffFormData>({
    name: "",
    branch_id: "",
    contact_number: "",
    email: "",
    job_title: JobTitle.RECEPTIONIST,
    salary: "",
  });
  const [loading, setLoading] = useState(false);
  const [sendPasswordLoading, setSendPasswordLoading] = useState(false);

  // Mock data - Replace with API calls
  useEffect(() => {
    // Mock staff data
    setStaff([
      {
        staff_id: 1,
        branch_id: 1,
        name: "John Smith",
        contact_number: "+1-555-0123",
        email: "john.smith@hotel.com",
        job_title: JobTitle.MANAGER,
        salary: 75000,
        created_at: "2024-01-15T08:00:00Z",
        updated_at: "2024-01-15T08:00:00Z",
        branch_name: "Downtown Branch",
      },
      {
        staff_id: 2,
        branch_id: 1,
        name: "Sarah Johnson",
        contact_number: "+1-555-0124",
        email: "sarah.johnson@hotel.com",
        job_title: JobTitle.RECEPTIONIST,
        salary: 45000,
        created_at: "2024-02-01T09:00:00Z",
        updated_at: "2024-02-01T09:00:00Z",
        branch_name: "Downtown Branch",
      },
      {
        staff_id: 3,
        branch_id: 2,
        name: "Mike Wilson",
        contact_number: "+1-555-0125",
        email: "mike.wilson@hotel.com",
        job_title: JobTitle.MAINTENANCE,
        salary: 52000,
        created_at: "2024-01-20T10:00:00Z",
        updated_at: "2024-01-20T10:00:00Z",
        branch_name: "Airport Branch",
      },
      {
        staff_id: 4,
        branch_id: 2,
        name: "Lisa Brown",
        contact_number: "+1-555-0126",
        email: "lisa.brown@hotel.com",
        job_title: JobTitle.HOUSEKEEPING,
        salary: 38000,
        created_at: "2024-02-10T11:00:00Z",
        updated_at: "2024-02-10T11:00:00Z",
        branch_name: "Airport Branch",
      },
      {
        staff_id: 5,
        branch_id: 3,
        name: "David Garcia",
        contact_number: "+1-555-0127",
        email: "david.garcia@hotel.com",
        job_title: JobTitle.CHEF,
        salary: 65000,
        created_at: "2024-01-25T12:00:00Z",
        updated_at: "2024-01-25T12:00:00Z",
        branch_name: "Beach Resort",
      },
    ]);

    // Mock branches data
    setBranches([
      {
        branch_id: 1,
        branch_name: "Downtown Branch",
        city: "Downtown",
        address: "123 Main St",
      },
      {
        branch_id: 2,
        branch_name: "Airport Branch",
        city: "Airport",
        address: "456 Airport Rd",
      },
      {
        branch_id: 3,
        branch_name: "Beach Resort",
        city: "Beach",
        address: "789 Beach Ave",
      },
    ]);
  }, []);

  const filteredStaff = staff.filter((staffMember) => {
    return (
      (!filters.search ||
        staffMember.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        staffMember.email.toLowerCase().includes(filters.search.toLowerCase()) ||
        staffMember.contact_number.includes(filters.search) ||
        staffMember.branch_name?.toLowerCase().includes(filters.search.toLowerCase())) &&
      (!filters.branch_id || staffMember.branch_id === filters.branch_id) &&
      (!filters.job_title || staffMember.job_title === filters.job_title)
    );
  });

  const getJobTitleBadgeVariant = (jobTitle: string) => {
    switch (jobTitle) {
      case JobTitle.MANAGER:
        return "primary";
      case JobTitle.RECEPTIONIST:
        return "success";
      case JobTitle.HOUSEKEEPING:
        return "warning";
      case JobTitle.MAINTENANCE:
        return "secondary";
      case JobTitle.SECURITY:
        return "error";
      default:
        return "secondary";
    }
  };

  const formatJobTitle = (jobTitle: string) => {
    return jobTitle
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formatSalary = (salary: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(salary);
  };

  const validateForm = (): string | null => {
    if (!formData.name.trim()) return "Name is required";
    if (!formData.branch_id) return "Branch is required";
    if (!formData.contact_number.trim()) return "Contact number is required";
    if (!formData.email.trim()) return "Email is required";
    if (!formData.salary.trim()) return "Salary is required";

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return "Please enter a valid email address";
    }

    // Phone validation (basic)
    const phoneRegex = /^[+]?[\d\s\-()]+$/;
    if (!phoneRegex.test(formData.contact_number)) {
      return "Please enter a valid contact number";
    }

    // Salary validation
    const salaryValue = parseFloat(formData.salary);
    if (isNaN(salaryValue) || salaryValue < 0) {
      return "Please enter a valid salary amount";
    }

    // Check for duplicate email
    const isDuplicateEmail = staff.some(
      (staffMember) =>
        staffMember.email.toLowerCase() === formData.email.toLowerCase() &&
        staffMember.staff_id !== editingStaff?.staff_id
    );

    if (isDuplicateEmail) {
      return "Email address already exists";
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validationError = validateForm();
      if (validationError) {
        showError(validationError);
        return;
      }

      const branch = branches.find((b) => b.branch_id === parseInt(formData.branch_id));

      if (editingStaff) {
        // Update existing staff
        const updatedStaff: Staff = {
          ...editingStaff,
          name: formData.name.trim(),
          branch_id: parseInt(formData.branch_id),
          contact_number: formData.contact_number.trim(),
          email: formData.email.trim().toLowerCase(),
          job_title: formData.job_title,
          salary: parseFloat(formData.salary),
          updated_at: new Date().toISOString(),
          branch_name: branch?.branch_name,
        };

        setStaff(staff.map((s) => (s.staff_id === editingStaff.staff_id ? updatedStaff : s)));
        showSuccess("Staff member updated successfully!");
      } else {
        // Create new staff
        const newStaff: Staff = {
          staff_id: Math.max(...staff.map((s) => s.staff_id), 0) + 1,
          name: formData.name.trim(),
          branch_id: parseInt(formData.branch_id),
          contact_number: formData.contact_number.trim(),
          email: formData.email.trim().toLowerCase(),
          job_title: formData.job_title,
          salary: parseFloat(formData.salary),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          branch_name: branch?.branch_name,
        };

        setStaff([...staff, newStaff]);
        showSuccess("Staff member created successfully!");
      }

      resetForm();
    } catch {
      showError("An error occurred while saving staff member");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (staffMember: Staff) => {
    setEditingStaff(staffMember);
    setFormData({
      name: staffMember.name,
      branch_id: staffMember.branch_id.toString(),
      contact_number: staffMember.contact_number,
      email: staffMember.email,
      job_title: staffMember.job_title,
      salary: staffMember.salary.toString(),
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (staffId: number) => {
    if (!window.confirm("Are you sure you want to delete this staff member?")) return;

    try {
      setStaff(staff.filter((s) => s.staff_id !== staffId));
      showSuccess("Staff member deleted successfully!");
    } catch {
      showError("Failed to delete staff member");
    }
  };

  const handleViewDetails = (staffMember: Staff) => {
    setSelectedStaff(staffMember);
    setIsDetailsModalOpen(true);
  };

  const handleSendPassword = async (staffId: number) => {
    setSendPasswordLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const staffMember = staff.find((s) => s.staff_id === staffId);
      showSuccess(`New password sent to ${staffMember?.email}`);
    } catch {
      showError("Failed to send password reset email");
    } finally {
      setSendPasswordLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      branch_id: "",
      contact_number: "",
      email: "",
      job_title: JobTitle.RECEPTIONIST,
      salary: "",
    });
    setEditingStaff(null);
    setIsModalOpen(false);
  };

  const columns: TableColumn<Staff>[] = [
    {
      key: "name",
      title: "Name",
      render: (_, staffMember) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
              <Users className="h-4 w-4 text-gray-500" />
            </div>
          </div>
          <div>
            <p className="font-medium text-gray-900">{staffMember.name}</p>
            <p className="text-sm text-gray-500">{staffMember.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "branch_name",
      title: "Branch",
      render: (_, staffMember) => <span className="text-gray-900">{staffMember.branch_name}</span>,
    },
    {
      key: "contact_number",
      title: "Contact",
      render: (_, staffMember) => <span className="text-gray-900">{staffMember.contact_number}</span>,
    },
    {
      key: "job_title",
      title: "Job Title",
      render: (_, staffMember) => (
        <Badge variant={getJobTitleBadgeVariant(staffMember.job_title)} size="sm">
          {formatJobTitle(staffMember.job_title)}
        </Badge>
      ),
    },
    {
      key: "salary",
      title: "Salary",
      render: (_, staffMember) => <span className="font-medium text-gray-900">{formatSalary(staffMember.salary)}</span>,
    },
    {
      key: "actions",
      title: "Actions",
      render: (_, staffMember) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewDetails(staffMember)}
            className="text-blue-600 hover:text-blue-800"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(staffMember)}
            className="text-green-600 hover:text-green-800"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(staffMember.staff_id)}
            className="text-red-600 hover:text-red-800"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-gray-600 mt-1">Manage staff members and their details</p>
        </div>
        <Button variant="primary" onClick={() => setIsModalOpen(true)} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add Staff</span>
        </Button>
      </div>
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search staff..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="pl-10 w-64"
            />
          </div>

          <select
            value={filters.job_title || ""}
            onChange={(e) => setFilters({ ...filters, job_title: (e.target.value as JobTitle) || undefined })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Job Titles</option>
            {Object.values(JobTitle).map((title) => (
              <option key={title} value={title}>
                {formatJobTitle(title)}
              </option>
            ))}
          </select>

          <select
            value={filters.branch_id || ""}
            onChange={(e) =>
              setFilters({ ...filters, branch_id: e.target.value ? parseInt(e.target.value) : undefined })
            }
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Branches</option>
            {branches.map((branch) => (
              <option key={branch.branch_id} value={branch.branch_id}>
                {branch.branch_name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <Button
            variant="outline"
            onClick={() =>
              setFilters({
                search: "",
                name: "",
                branch_id: undefined,
                job_title: undefined,
                email: "",
              })
            }
            className="w-full"
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Staff Table */}
      <Table
        data={filteredStaff as unknown as Record<string, unknown>[]}
        columns={columns as unknown as TableColumn<Record<string, unknown>>[]}
        pagination={{
          current: 1,
          pageSize: 10,
          total: branches.length,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: true,
          pageSizeOptions: [5, 10, 20, 50],
        }}
      />

      {/* Staff Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={resetForm}
        title={editingStaff ? "Edit Staff Member" : "Add New Staff Member"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter full name"
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
              <option value="">Select a branch</option>
              {branches.map((branch) => (
                <option key={branch.branch_id} value={branch.branch_id}>
                  {branch.branch_name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number *</label>
              <Input
                value={formData.contact_number}
                onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                placeholder="+1-555-0123"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="staff@hotel.com"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
              <select
                value={formData.job_title}
                onChange={(e) => setFormData({ ...formData, job_title: e.target.value as JobTitle })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {Object.values(JobTitle).map((title) => (
                  <option key={title} value={title}>
                    {formatJobTitle(title)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Salary (USD) *</label>
              <Input
                type="number"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                placeholder="50000"
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={resetForm} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? "Saving..." : editingStaff ? "Update Staff" : "Create Staff"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Staff Details Modal */}
      <StaffDetailsModal
        staff={selectedStaff}
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedStaff(null);
        }}
        onSendPassword={handleSendPassword}
        loading={sendPasswordLoading}
      />
    </div>
  );
};

export default StaffManagement;
