import React, { useEffect, useState } from "react";
import { Plus, Eye, Pencil, Search, Building } from "lucide-react";
import Table from "../../components/primary/Table";
import Button from "../../components/primary/Button";
import { useModal } from "../../hooks/useModal";
import { useAlert } from "../../hooks/useAlert";
import NewBranchForm from "./NewBranchForm";
import UpdateBranchForm from "./UpdateBranchForm";
import BranchDetailsModal from "./BranchDetailsModal";
import { getBranches, createBranch, updateBranch, deleteBranch } from "../../api_connection/branches";

interface Branch {
  branch_id: number;
  branch_name: string;
  city: string;
  address: string;
  phone_number?: string;
  email?: string;
  created_at: string;
  updated_at: string;
}

const mockBranches: Branch[] = [
  {
    branch_id: 1,
    branch_name: "Main Branch",
    city: "Colombo",
    address: "123 Galle Road, Colombo 03",
    phone_number: "+94 11 234 5678",
    email: "main@hotel.com",
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
  },
  {
    branch_id: 2,
    branch_name: "Kandy Branch",
    city: "Kandy",
    address: "456 Peradeniya Road, Kandy",
    phone_number: "+94 81 234 5678",
    email: "kandy@hotel.com",
    created_at: "2024-02-01T14:20:00Z",
    updated_at: "2024-02-01T14:20:00Z",
  },
  {
    branch_id: 3,
    branch_name: "Galle Branch",
    city: "Galle",
    address: "789 Fort Road, Galle",
    phone_number: "+94 91 234 5678",
    email: "galle@hotel.com",
    created_at: "2024-03-10T09:15:00Z",
    updated_at: "2024-03-10T09:15:00Z",
  },
];

interface BranchFilters {
  branch_name?: string;
  city?: string;
}

const BranchPage: React.FC = () => {
  const [branches, setBranches] = useState<Branch[]>(mockBranches);
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
      key: "phone_number",
      title: "Phone",
      sortable: false,
      render: (value: unknown) => <span className="text-gray-600">{value ? String(value) : "N/A"}</span>,
    },
    {
      key: "created_at",
      title: "Created",
      sortable: true,
      render: (value: unknown) => (
        <span className="text-gray-500 text-sm">{new Date(String(value)).toLocaleDateString()}</span>
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
        onSubmit: handleCreateBranch,
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
        onSubmit: handleUpdateBranch,
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

  const loadBranches = async () => {
    try {
      const response = await getBranches();
      console.log(response);
      //   setBranches(response.data);
    } catch {
      showError("Failed to load branches. Please try again.");
    }
  };

  const handleCreateBranch = async (branchData: Omit<Branch, "branch_id" | "created_at" | "updated_at">) => {
    try {
      // Mock API call - replace with actual implementation
      const newBranch: Branch = {
        ...branchData,
        branch_id: Math.max(...branches.map((b) => b.branch_id)) + 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setBranches((prev) => [...prev, newBranch]);
      showSuccess("Branch created successfully!");
    } catch {
      showError("Failed to create branch. Please try again.");
    }
  };

  const handleUpdateBranch = async (branchData: Omit<Branch, "branch_id" | "created_at" | "updated_at">) => {
    if (!selectedBranch) return;

    try {
      // Mock API call - replace with actual implementation
      const updatedBranch: Branch = {
        ...selectedBranch,
        ...branchData,
        updated_at: new Date().toISOString(),
      };

      setBranches((prev) =>
        prev.map((branch) => (branch.branch_id === selectedBranch.branch_id ? updatedBranch : branch))
      );

      setSelectedBranch(null);
      showSuccess("Branch updated successfully!");
    } catch {
      showError("Failed to update branch. Please try again.");
    }
  };

  useEffect(() => {
    loadBranches();
  }, [filters]);

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

      {/* Statistics Cards */}
      {/* <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Branches</p>
              <p className="text-2xl font-semibold text-gray-900">{branches.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Building className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Cities</p>
              <p className="text-2xl font-semibold text-gray-900">{new Set(branches.map((b) => b.city)).size}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Building className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Newest Branch</p>
              <p className="text-sm font-semibold text-gray-900">
                {branches.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
                  ?.branch_name || "N/A"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Building className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg. per City</p>
              <p className="text-2xl font-semibold text-gray-900">
                {(branches.length / new Set(branches.map((b) => b.city)).size).toFixed(1)}
              </p>
            </div>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default BranchPage;
