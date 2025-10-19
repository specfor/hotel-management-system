import React from "react";
import { Card, Button } from "../components/primary";

const Reports: React.FC = () => {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600">View analytics and generate reports</p>
        </div>
        <Button variant="primary">Generate Report</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Report</h3>
          <div className="text-3xl font-bold text-green-600 mb-2">$45,230</div>
          <p className="text-sm text-gray-600">This month</p>
          <Button variant="outline" size="sm" className="mt-4">
            View Details
          </Button>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Occupancy Rate</h3>
          <div className="text-3xl font-bold text-blue-600 mb-2">79.5%</div>
          <p className="text-sm text-gray-600">Average this month</p>
          <Button variant="outline" size="sm" className="mt-4">
            View Details
          </Button>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Guest Satisfaction</h3>
          <div className="text-3xl font-bold text-purple-600 mb-2">4.7/5</div>
          <p className="text-sm text-gray-600">Average rating</p>
          <Button variant="outline" size="sm" className="mt-4">
            View Details
          </Button>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button variant="outline" className="h-16 flex flex-col justify-center">
            <span className="font-medium">Daily Operations</span>
            <span className="text-sm text-gray-500">Room status, bookings, revenue</span>
          </Button>
          <Button variant="outline" className="h-16 flex flex-col justify-center">
            <span className="font-medium">Financial Summary</span>
            <span className="text-sm text-gray-500">Revenue, expenses, profit</span>
          </Button>
          <Button variant="outline" className="h-16 flex flex-col justify-center">
            <span className="font-medium">Guest Analytics</span>
            <span className="text-sm text-gray-500">Demographics, preferences</span>
          </Button>
          <Button variant="outline" className="h-16 flex flex-col justify-center">
            <span className="font-medium">Staff Performance</span>
            <span className="text-sm text-gray-500">Productivity, feedback</span>
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Reports;
