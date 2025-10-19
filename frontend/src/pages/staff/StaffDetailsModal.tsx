import React from "react";
import { Mail, MapPin, Phone, User, Briefcase, DollarSign, Calendar, X } from "lucide-react";
import Modal from "../../components/Modal";
import Button from "../../components/primary/Button";
import Badge from "../../components/primary/Badge";
import type { Staff, JobTitle } from "../../types/staff";

interface StaffDetailsModalProps {
  staff: Staff | null;
  isOpen: boolean;
  onClose: () => void;
  onSendPassword: (staffId: number) => void;
  loading?: boolean;
}

const StaffDetailsModal: React.FC<StaffDetailsModalProps> = ({
  staff,
  isOpen,
  onClose,
  onSendPassword,
  loading = false,
}) => {
  if (!staff) return null;

  const getJobTitleBadgeVariant = (jobTitle: JobTitle) => {
    switch (jobTitle) {
      case "manager":
        return "primary";
      case "receptionist":
        return "success";
      case "housekeeping":
        return "warning";
      case "maintenance":
        return "secondary";
      case "security":
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
    }).format(salary);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Staff Details">
      <div className="space-y-6">
        {/* Header with staff name and job title */}
        <div className="text-center border-b border-gray-200 pb-4">
          <div className="flex items-center justify-center mb-2">
            <User className="h-12 w-12 text-gray-400 bg-gray-100 rounded-full p-2" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">{staff.name}</h2>
          <Badge variant={getJobTitleBadgeVariant(staff.job_title)} size="sm" className="mt-2">
            {formatJobTitle(staff.job_title)}
          </Badge>
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Phone className="h-5 w-5 mr-2 text-blue-500" />
              Contact Information
            </h3>

            <div className="space-y-3">
              <div className="flex items-center">
                <Mail className="h-4 w-4 text-gray-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{staff.email}</p>
                </div>
              </div>

              <div className="flex items-center">
                <Phone className="h-4 w-4 text-gray-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Contact Number</p>
                  <p className="font-medium text-gray-900">{staff.contact_number}</p>
                </div>
              </div>

              <div className="flex items-center">
                <MapPin className="h-4 w-4 text-gray-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Branch</p>
                  <p className="font-medium text-gray-900">{staff.branch_name}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Employment Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Briefcase className="h-5 w-5 mr-2 text-green-500" />
              Employment Details
            </h3>

            <div className="space-y-3">
              <div className="flex items-center">
                <Briefcase className="h-4 w-4 text-gray-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Job Title</p>
                  <p className="font-medium text-gray-900">{formatJobTitle(staff.job_title)}</p>
                </div>
              </div>

              <div className="flex items-center">
                <DollarSign className="h-4 w-4 text-gray-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Salary</p>
                  <p className="font-medium text-gray-900">{formatSalary(staff.salary)}</p>
                </div>
              </div>

              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-gray-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Joined Date</p>
                  <p className="font-medium text-gray-900">{formatDate(staff.created_at)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* System Information */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">System Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-500">Staff ID:</span>
              <span className="ml-2 font-medium text-gray-900">#{staff.staff_id}</span>
            </div>
            <div>
              <span className="text-gray-500">Last Updated:</span>
              <span className="ml-2 font-medium text-gray-900">{formatDate(staff.updated_at)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <Button
            variant="primary"
            onClick={() => onSendPassword(staff.staff_id)}
            disabled={loading}
            className="flex items-center space-x-2"
          >
            <Mail className="h-4 w-4" />
            <span>{loading ? "Sending..." : "Send New Password"}</span>
          </Button>

          <Button variant="outline" onClick={onClose} className="flex items-center space-x-2">
            <X className="h-4 w-4" />
            <span>Close</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default StaffDetailsModal;
