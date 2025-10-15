import React from "react";
import { Card, Button, Input, Badge } from "../components/primary";

const Rooms: React.FC = () => {
  const mockRooms = [
    { id: "101", type: "Standard", status: "available", price: 120, guest: null },
    { id: "102", type: "Standard", status: "occupied", price: 120, guest: "John Doe" },
    { id: "205", type: "Deluxe", status: "occupied", price: 180, guest: "Jane Smith" },
    { id: "304", type: "Suite", status: "maintenance", price: 250, guest: null },
    { id: "305", type: "Suite", status: "available", price: 250, guest: null },
  ];

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "available":
        return "success";
      case "occupied":
        return "primary";
      case "maintenance":
        return "warning";
      default:
        return "secondary";
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rooms</h1>
          <p className="text-gray-600">Manage hotel rooms and availability</p>
        </div>
        <Button variant="primary">Add Room</Button>
      </div>

      <div className="mb-6 flex gap-4">
        <Input placeholder="Search rooms..." className="max-w-md" />
        <Button variant="outline">Filter by Status</Button>
        <Button variant="outline">Filter by Type</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {mockRooms.map((room) => (
          <Card key={room.id} className="p-4">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Room {room.id}</h3>
              <Badge variant={getStatusVariant(room.status)} size="sm">
                {room.status}
              </Badge>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Type:</span>
                <span className="text-sm font-medium">{room.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Price:</span>
                <span className="text-sm font-medium">${room.price}/night</span>
              </div>
              {room.guest && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Guest:</span>
                  <span className="text-sm font-medium">{room.guest}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" fullWidth>
                {room.status === "available" ? "Book" : "Details"}
              </Button>
              <Button variant="ghost" size="sm">
                Edit
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Rooms;
