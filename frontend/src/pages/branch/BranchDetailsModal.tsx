import React from "react";
import { Building, MapPin, Phone, Mail, Calendar, Clock, X } from "lucide-react";

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

interface BranchDetailsModalProps {
  branch: Branch;
  onClose: () => void;
  onEdit?: () => void;
}

const BranchDetailsModal: React.FC<BranchDetailsModalProps> = ({ branch, onClose, onEdit }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      if (diffInHours === 0) {
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        return `${diffInMinutes} minutes ago`;
      }
      return `${diffInHours} hours ago`;
    } else if (diffInDays === 1) {
      return "Yesterday";
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
    } else {
      const months = Math.floor(diffInDays / 30);
      return `${months} month${months > 1 ? "s" : ""} ago`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Building className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{branch.branch_name}</h3>
            <p className="text-sm text-gray-500">Branch ID: {branch.branch_id}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {onEdit && (
            <button
              onClick={onEdit}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md font-medium transition-colors"
            >
              Edit Branch
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Branch Information */}
      <div className="grid gap-6">
        {/* Location Details */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
            <MapPin className="h-4 w-4 mr-2" />
            Location Details
          </h4>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">City</label>
              <p className="text-sm text-gray-900 mt-1">{branch.city}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Address</label>
              <p className="text-sm text-gray-900 mt-1 leading-relaxed">{branch.address}</p>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        {(branch.phone_number || branch.email) && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">Contact Information</h4>
            <div className="space-y-3">
              {branch.phone_number && (
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Phone</label>
                    <p className="text-sm text-gray-900">{branch.phone_number}</p>
                  </div>
                </div>
              )}
              {branch.email && (
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email</label>
                    <p className="text-sm text-gray-900">{branch.email}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Timestamps */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            Timeline
          </h4>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <Calendar className="h-4 w-4 text-gray-400 mt-0.5" />
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Created</label>
                <p className="text-sm text-gray-900">{formatDate(branch.created_at)}</p>
                <p className="text-xs text-gray-500">{formatRelativeTime(branch.created_at)}</p>
              </div>
            </div>
            {branch.updated_at !== branch.created_at && (
              <div className="flex items-start space-x-3">
                <Clock className="h-4 w-4 text-gray-400 mt-0.5" />
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Last Updated</label>
                  <p className="text-sm text-gray-900">{formatDate(branch.updated_at)}</p>
                  <p className="text-xs text-gray-500">{formatRelativeTime(branch.updated_at)}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats or Additional Info */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Branch Status</h4>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-sm text-blue-800">Active</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button
          onClick={onClose}
          className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md font-medium transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default BranchDetailsModal;
