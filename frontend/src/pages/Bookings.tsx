import React from "react";
import { Card, Button, Input, Badge } from "../components/primary";

const Bookings: React.FC = () => {
  const mockBookings = [
    { id: "BK001", guest: "John Doe", room: "205", checkIn: "2025-10-13", checkOut: "2025-10-15", status: "confirmed" },
    { id: "BK002", guest: "Jane Smith", room: "304", checkIn: "2025-10-14", checkOut: "2025-10-16", status: "pending" },
    {
      id: "BK003",
      guest: "Mike Johnson",
      room: "101",
      checkIn: "2025-10-15",
      checkOut: "2025-10-18",
      status: "checked-in",
    },
  ];

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "confirmed":
        return "success";
      case "pending":
        return "warning";
      case "checked-in":
        return "primary";
      default:
        return "secondary";
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
          <p className="text-gray-600">Manage hotel reservations and bookings</p>
        </div>
        <Button variant="primary">New Booking</Button>
      </div>

      <div className="mb-6 flex gap-4">
        <Input placeholder="Search bookings..." className="max-w-md" />
        <Button variant="outline">Filter</Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">Booking ID</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Guest</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Room</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Check In</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Check Out</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockBookings.map((booking) => (
                <tr key={booking.id} className="border-b border-gray-100">
                  <td className="py-3 px-4">{booking.id}</td>
                  <td className="py-3 px-4">{booking.guest}</td>
                  <td className="py-3 px-4">Room {booking.room}</td>
                  <td className="py-3 px-4">{booking.checkIn}</td>
                  <td className="py-3 px-4">{booking.checkOut}</td>
                  <td className="py-3 px-4">
                    <Badge variant={getStatusVariant(booking.status)} size="sm">
                      {booking.status}
                    </Badge>
                  </td>
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

export default Bookings;
