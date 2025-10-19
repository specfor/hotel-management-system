import React, { useEffect, useState, useCallback } from "react";
import { Plus, Eye, Pencil, Search, Building, Trash2 } from "lucide-react";
import Table from "../../components/primary/Table";
import Button from "../../components/primary/Button";
import { useModal } from "../../hooks/useModal";
import { useAlert } from "../../hooks/useAlert";
import NewBranchForm from "./NewBranchForm";
import UpdateBranchForm from "./UpdateBranchForm";
import BranchDetailsModal from "./BranchDetailsModal";
import {
  createBranch,
  getBranches,
  updateBranch,
  deleteBranch,
  type Branch as ApiBranch,
} from "../../api_connection/branches";

interface Branch {
  branch_id: number;
  branch_name: string;
  city: string;
  address: string;
}

interface BranchFilters {
  branch_name?: string;
  city?: string;
}

const BranchPage: React.FC = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading] = useState(false);
  const [filters, setFilters] = useState<BranchFilters>({});
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

  const { openModal, closeModal } = useModal();
  const { showSuccess, showError } = useAlert();

  // Apply filters to branches
  const filteredBranches = branches.filter((branch) => {
    const matchesName =
      !filters.branch_name || branch.branch_name.toLowerCase().includes(filters.branch_name.toLowerCase());
    const matchesCity = !filters.city || branch.city.toLowerCase().includes(filters.city.toLowerCase());
    return matchesName && matchesCity;
  });

  // Table columns configuration
  const columns = [
    {
      key: "branch_name",
      title: "Branch Name",
      sortable: true,
      render: (value: unknown) => (
        <div className="flex items-center space-x-2">
          <Building className="h-5 w-5 text-blue-500" />
          <span className="font-medium">{String(value)}</span>
        </div>
      ),
    },
    {
      key: "city",
      title: "City",
      sortable: true,
      render: (value: unknown) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {String(value)}
        </span>
      ),
    },
    {
      key: "address",
      title: "Address",
      sortable: false,
      render: (value: unknown) => (
        <span className="text-gray-600 max-w-xs truncate block" title={String(value)}>
          {String(value)}
        </span>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      sortable: false,
      render: (_: unknown, record: unknown) => {
        const branch = record as Branch;
        return (
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleViewDetails(branch)}
              className="text-blue-600 hover:text-blue-800"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(branch)}
              className="text-green-600 hover:text-green-800"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(branch)}
              className="text-red-600 hover:text-red-800"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  // Handlers
  const handleNewBranch = () => {
    const modalId = openModal({
      title: "Create New Branch",
      size: "md",
      component: React.createElement(NewBranchForm, {
        onSubmit: async (branchData: Omit<Branch, "branch_id">) => {
          const success = await handleCreateBranch(branchData);
          if (success) {
            closeModal(modalId);
          }
        },
        onCancel: () => closeModal(modalId),
      }),
    });
  };

  const handleEdit = (branch: Branch) => {
    setSelectedBranch(branch);
    const modalId = openModal({
      title: "Update Branch",
      size: "md",
      component: React.createElement(UpdateBranchForm, {
        branch,
        onSubmit: async (branchData: Omit<Branch, "branch_id">) => {
          const updatedBranch: Branch = { ...branchData, branch_id: branch.branch_id };
          const success = await handleUpdateBranch(updatedBranch);
          if (success) {
            closeModal(modalId);
          }
        },
        onCancel: () => closeModal(modalId),
      }),
    });
  };

  const handleViewDetails = (branch: Branch) => {
    setSelectedBranch(branch);
    const modalId = openModal({
      title: "Branch Details",
      size: "lg",
      component: React.createElement(BranchDetailsModal, {
        branch,
        onEdit: () => {
          closeModal(modalId);
          handleEdit(branch);
        },
        onClose: () => closeModal(modalId),
      }),
    });
  };

  const handleDelete = (branch: Branch) => {
    const modalId = openModal({
      title: "Delete Branch",
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
            React.createElement("h3", { className: "text-lg font-medium text-gray-900" }, "Delete Branch"),
            React.createElement("p", { className: "text-sm text-gray-500" }, "This action cannot be undone")
          )
        ),
        React.createElement(
          "p",
          { className: "text-sm text-gray-700 mb-6" },
          `Are you sure you want to delete "${branch.branch_name}" located in ${branch.city}? This will permanently remove the branch and all associated data.`
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
                const success = await handleDeleteBranch(branch);
                if (success) {
                  closeModal(modalId);
                }
              },
              className: "px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium transition-colors",
            },
            "Delete Branch"
          )
        )
      ),
    });
  };

  const loadBranches = useCallback(async () => {
    try {
      const response = await getBranches();
      console.log(response);
      setBranches(
        response.data.map((b: ApiBranch) => ({
          branch_id: b.branchid,
          branch_name: b.branchname,
          city: b.city || "",
          address: b.address || "",
        }))
      );
    } catch {
      showError("Failed to load branches. Please try again.");
    }
  }, [showError]);

  const handleCreateBranch = async (branchData: Omit<Branch, "branch_id">): Promise<boolean> => {
    try {
      const response = await createBranch({
        address: branchData.address,
        branchName: branchData.branch_name,
        city: branchData.city,
      });
      if (response.success) {
        loadBranches();
        showSuccess("Branch created successfully!");
        return true;
      } else {
        showError(response.message || "Failed to create branch. Please try again.");
        return false;
      }
    } catch {
      showError("Failed to create branch. Please try again.");
      return false;
    }
  };

  const handleUpdateBranch = async (branchData: Branch): Promise<boolean> => {
    if (!selectedBranch) return false;

    try {
      const response = await updateBranch(branchData.branch_id, {
        address: branchData.address,
        branchName: branchData.branch_name,
        city: branchData.city,
      });

      if (response.success) {
        const updatedBranch: Branch = {
          ...selectedBranch,
          ...branchData,
        };

        setBranches((prev) =>
          prev.map((branch) => (branch.branch_id === selectedBranch.branch_id ? updatedBranch : branch))
        );

        setSelectedBranch(null);
        showSuccess("Branch updated successfully!");
        return true;
      } else {
        showError(response.message || "Failed to update branch. Please try again.");
        return false;
      }
    } catch {
      showError("Failed to update branch. Please try again.");
      return false;
    }
  };

  const handleDeleteBranch = async (branch: Branch): Promise<boolean> => {
    try {
      const response = await deleteBranch(branch.branch_id);

      if (response.success) {
        setBranches((prev) => prev.filter((b) => b.branch_id !== branch.branch_id));
        showSuccess("Branch deleted successfully!");
        return true;
      } else {
        showError(response.message || "Failed to delete branch. Please try again.");
        return false;
      }
    } catch {
      showError("Failed to delete branch. Please try again.");
      return false;
    }
  };

  useEffect(() => {
    loadBranches();
  }, [loadBranches, filters]);

  // Filter components
  const renderFilters = () => (
    <div className="flex justify-between gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
      <div className="flex gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Search className="h-4 w-4 inline mr-1" />
            Search by Branch Name
          </label>
          <input
            type="text"
            placeholder="Enter branch name..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={filters.branch_name || ""}
            onChange={(e) => setFilters((prev) => ({ ...prev, branch_name: e.target.value }))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Building className="h-4 w-4 inline mr-1" />
            Filter by City
          </label>
          <input
            type="text"
            placeholder="Enter city name..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={filters.city || ""}
            onChange={(e) => setFilters((prev) => ({ ...prev, city: e.target.value }))}
          />
        </div>
      </div>

      <div className="flex items-end">
        <Button variant="outline" onClick={() => setFilters({})} className="w-full">
          Clear Filters
        </Button>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Building className="h-7 w-7 text-blue-600" />
              Branch Management
            </h1>
            <p className="text-gray-600 mt-1">Manage hotel branches, locations, and contact information</p>
          </div>

          <Button onClick={handleNewBranch} className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            New Branch
          </Button>
        </div>
      </div>

      {/* Filters */}
      {renderFilters()}

      {/* Table */}
      <div className="bg-white rounded-lg shadow">
        <Table
          columns={columns}
          data={filteredBranches as unknown as Record<string, unknown>[]}
          rowKey="branch_id"
          loading={loading}
          filterable={false}
          sortable={true}
          pagination={{
            current: 1,
            pageSize: 10,
            total: branches.length,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: true,
            pageSizeOptions: [5, 10, 20, 50],
          }}
          emptyText="No branches found. Get started by creating your first branch location."
        />
      </div>
    </div>
  );
};

export default BranchPage;
