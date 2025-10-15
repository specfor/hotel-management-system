import React from "react";
import { Card, Button, Input } from "../components/primary";

const Guests: React.FC = () => {
  const mockGuests = [
    { id: "1", name: "John Doe", email: "john@example.com", phone: "+1-555-0123", room: "205", checkIn: "2025-10-13" },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "+1-555-0124",
      room: "304",
      checkIn: "2025-10-14",
    },
    {
      id: "3",
      name: "Mike Johnson",
      email: "mike@example.com",
      phone: "+1-555-0125",
      room: "101",
      checkIn: "2025-10-15",
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Guests</h1>
          <p className="text-gray-600">Manage guest information and profiles</p>
        </div>
        <Button variant="primary">Add Guest</Button>
      </div>

      <div className="mb-6 flex gap-4">
        <Input placeholder="Search guests..." className="max-w-md" />
        <Button variant="outline">Filter</Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">Name</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Email</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Phone</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Current Room</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Check In</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockGuests.map((guest) => (
                <tr key={guest.id} className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium">{guest.name}</td>
                  <td className="py-3 px-4">{guest.email}</td>
                  <td className="py-3 px-4">{guest.phone}</td>
                  <td className="py-3 px-4">Room {guest.room}</td>
                  <td className="py-3 px-4">{guest.checkIn}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Guests;
