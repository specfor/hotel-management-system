import React from "react";
import { Card, Button, Input } from "../components/primary";

const Settings: React.FC = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage system preferences and configuration</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Hotel Information</h2>
          <div className="space-y-4">
            <Input label="Hotel Name" defaultValue="Grand Plaza Hotel" />
            <Input label="Address" defaultValue="123 Main Street, City" />
            <Input label="Phone" defaultValue="+1-555-0100" />
            <Input label="Email" defaultValue="info@grandplaza.com" />
            <Button variant="primary" className="mt-4">
              Update Information
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">System Preferences</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Email Notifications</span>
              <Button variant="outline" size="sm">
                Configure
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Auto Backup</span>
              <Button variant="outline" size="sm">
                Configure
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Time Zone</span>
              <Button variant="outline" size="sm">
                Change
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Currency</span>
              <Button variant="outline" size="sm">
                USD
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Security</h2>
          <div className="space-y-4">
            <Button variant="outline" fullWidth>
              Change Password
            </Button>
            <Button variant="outline" fullWidth>
              Two-Factor Authentication
            </Button>
            <Button variant="outline" fullWidth>
              Session Management
            </Button>
            <Button variant="outline" fullWidth>
              API Keys
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Data Management</h2>
          <div className="space-y-4">
            <Button variant="outline" fullWidth>
              Export Data
            </Button>
            <Button variant="outline" fullWidth>
              Import Data
            </Button>
            <Button variant="outline" fullWidth>
              Backup Database
            </Button>
            <Button variant="secondary" fullWidth>
              Reset System
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
