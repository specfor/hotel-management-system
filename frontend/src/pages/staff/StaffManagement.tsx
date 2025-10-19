import React, { useState, useEffect, useCallback } from "react";
import { Plus, Search, Edit, Trash2, Eye, Users } from "lucide-react";
import Table from "../../components/primary/Table";
import Button from "../../components/primary/Button";
import Input from "../../components/primary/Input";
import Badge from "../../components/primary/Badge";
import { useAlert } from "../../hooks/useAlert";
import { useModal } from "../../hooks/useModal";
import StaffDetailsModal from "./StaffDetailsModal";
import NewStaffForm from "./NewStaffForm";
import UpdateStaffForm from "./UpdateStaffForm";
import { JobTitle } from "../../types/staff";
import type { Staff, StaffFilters, StaffFormData, Branch } from "../../types/staff";
import type { TableColumn } from "../../types/table";
import { getStaff, createStaff, updateStaff, deleteStaff, sendPasswordReset } from "../../api_connection/staff";
import { getBranches } from "../../api_connection/branches";

const StaffManagement: React.FC = () => {
  const { showSuccess, showError } = useAlert();
  const { openModal, closeModal } = useModal();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [filters, setFilters] = useState<StaffFilters & { search: string }>({
    search: "",
    name: "",
    branch_id: undefined,
    job_title: undefined,
    email: "",
  });
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);

  const [sendPasswordLoading, setSendPasswordLoading] = useState(false);

  // Load staff data from API
  const loadStaff = useCallback(async () => {
    try {
      // Create filters object for API call, excluding the local 'search' field
      const apiFilters: StaffFilters = {
        name: filters.name,
        branch_id: filters.branch_id,
        job_title: filters.job_title,
        email: filters.email,
      };
      const response = await getStaff(apiFilters as StaffFilters & Record<string, unknown>);
      console.log("Staff response:", response);
      setStaff(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Failed to load staff:", error);
      showError("Failed to load staff. Please try again.");
      setStaff([]); // Ensure staff is always an array
    }
  }, [filters, showError]);

  // Load branches data from API
  const loadBranches = useCallback(async () => {
    try {
      const response = await getBranches();
      console.log("Branches response:", response);
      // Map branch data to expected format
      const branchData = response.data.map(
        (b: {
          branchid?: number;
          branch_id?: number;
          branchname?: string;
          branch_name?: string;
          city?: string;
          address?: string;
        }) => ({
          branch_id: (b.branchid || b.branch_id) as number,
          branch_name: (b.branchname || b.branch_name) as string,
          city: b.city || "",
          address: b.address || "",
        })
      );
      setBranches(branchData);
    } catch (error) {
      console.error("Failed to load branches:", error);
      showError("Failed to load branches. Please try again.");
    }
  }, [showError]);

  useEffect(() => {
    loadStaff();
    loadBranches();
  }, [loadStaff, loadBranches]);

  const filteredStaff = (Array.isArray(staff) ? staff : []).filter((staffMember) => {
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

  const handleEdit = (staffMember: Staff) => {
    const modalId = openModal({
      title: "Update Staff Member",
      size: "md",
      component: React.createElement(UpdateStaffForm, {
        staff: staffMember,
        branches,
        onSubmit: async (staffData: StaffFormData) => {
          const staffDataWithNumbers = {
            name: staffData.name.trim(),
            branch_id: parseInt(staffData.branch_id),
            contact_no: staffData.contact_number.trim(), // Use contact_no for API
            email: staffData.email.trim().toLowerCase(),
            job_title: staffData.job_title,
            salary: parseFloat(staffData.salary),
          };

          try {
            const response = await updateStaff(staffMember.staff_id, staffDataWithNumbers);

            if (response.success) {
              await loadStaff(); // Reload staff data
              showSuccess("Staff member updated successfully!");
              closeModal(modalId);
              return true;
            } else {
              showError(response.message || "Failed to update staff member");
              return false;
            }
          } catch (error) {
            console.error("Error updating staff member:", error);
            showError("An error occurred while updating staff member");
            return false;
          }
        },
        onCancel: () => closeModal(modalId),
      }),
    });
  };

  const handleDelete = (staff: Staff) => {
    const modalId = openModal({
      title: "Delete Staff Member",
      size: "sm",
      component: React.createElement(
        "div",
        { className: "p-6" },
        React.createElement(
          "div",
          { className: "flex items-center space-x-3 mb-4" },
          React.createElement(Trash2, { className: "h-6 w-6 text-red-600" }),
          React.createElement(
            "div",
            {},
            React.createElement("h3", { className: "text-lg font-medium text-gray-900" }, "Delete Staff Member"),
            React.createElement("p", { className: "text-sm text-gray-500" }, "This action cannot be undone")
          )
        ),
        React.createElement(
          "p",
          { className: "text-sm text-gray-700 mb-6" },
          `Are you sure you want to delete "${staff.name}" from ${staff.branch_name}? This will permanently remove the staff member and all associated data.`
        ),
        React.createElement(
          "div",
          { className: "flex justify-end space-x-3" },
          React.createElement(
            "button",
            {
              onClick: () => closeModal(modalId),
              className:
                "px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md font-medium transition-colors",
            },
            "Cancel"
          ),
          React.createElement(
            "button",
            {
              onClick: async () => {
                try {
                  const response = await deleteStaff(staff.staff_id);

                  if (response.success) {
                    await loadStaff(); // Reload staff data
                    showSuccess("Staff member deleted successfully!");
                    closeModal(modalId);
                  } else {
                    showError(response.message || "Failed to delete staff member");
                  }
                } catch (error) {
                  console.error("Error deleting staff member:", error);
                  showError("An error occurred while deleting staff member");
                }
              },
              className: "px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium transition-colors",
            },
            "Delete Staff Member"
          )
        )
      ),
    });
  };

  const handleViewDetails = (staffMember: Staff) => {
    setSelectedStaff(staffMember);
    setIsDetailsModalOpen(true);
  };

  const handleSendPassword = async (staffId: number) => {
    setSendPasswordLoading(true);
    try {
      const response = await sendPasswordReset(staffId);

      if (response.success) {
        const staffMember = staff.find((s) => s.staff_id === staffId);
        showSuccess(`New password sent to ${staffMember?.email}`);
      } else {
        showError(response.message || "Failed to send password reset email");
      }
    } catch (error) {
      console.error("Error sending password reset:", error);
      showError("Failed to send password reset email");
    } finally {
      setSendPasswordLoading(false);
    }
  };

  const handleNewStaff = () => {
    const modalId = openModal({
      title: "Create New Staff Member",
      size: "md",
      component: React.createElement(NewStaffForm, {
        branches,
        onSubmit: async (staffData: StaffFormData) => {
          const staffDataWithNumbers = {
            name: staffData.name.trim(),
            branch_id: parseInt(staffData.branch_id),
            contact_no: staffData.contact_number.trim(), // Use contact_no for API
            email: staffData.email.trim().toLowerCase(),
            job_title: staffData.job_title,
            salary: parseFloat(staffData.salary),
          };

          try {
            const response = await createStaff(staffDataWithNumbers);

            if (response.success) {
              await loadStaff(); // Reload staff data
              showSuccess("Staff member created successfully!");
              closeModal(modalId);
              return true;
            } else {
              showError(response.message || "Failed to create staff member");
              return false;
            }
          } catch (error) {
            console.error("Error creating staff member:", error);
            showError("An error occurred while creating staff member");
            return false;
          }
        },
        onCancel: () => closeModal(modalId),
      }),
    });
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
            onClick={() => handleDelete(staffMember)}
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
        <Button variant="primary" onClick={handleNewStaff} className="flex items-center space-x-2">
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
