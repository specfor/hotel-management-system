import React, { useState } from "react";
import { Bed, Settings } from "lucide-react";
import RoomManagement from "./RoomManagement";
import RoomTypeManagement from "./RoomTypeManagement";

type TabType = "rooms" | "room-types";

const Rooms: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("rooms");

  const tabs = [
    {
      id: "rooms" as TabType,
      label: "Room Management",
      icon: Bed,
      description: "Manage individual rooms and their status",
    },
    {
      id: "room-types" as TabType,
      label: "Room Types",
      icon: Settings,
      description: "Configure room types, rates and amenities",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Room Management</h1>
          <p className="text-gray-600 mt-1">Manage rooms, room types, and configurations</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                    isActive
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          <div className="mb-4">
            <p className="text-gray-600 text-sm">{tabs.find((tab) => tab.id === activeTab)?.description}</p>
          </div>

          {activeTab === "rooms" && <RoomManagement />}
          {activeTab === "room-types" && <RoomTypeManagement />}
        </div>
      </div>
    </div>
  );
};

export default Rooms;
