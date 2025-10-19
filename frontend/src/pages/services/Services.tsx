import React, { useState } from "react";
import Card from "../../components/primary/Card";
import Button from "../../components/primary/Button";
import ServiceManagement from "./ServiceManagement";
import DiscountManagement from "./DiscountManagement";

const Services: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"services" | "discounts">("services");

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Services & Discounts Management</h1>
      </div>

      <Card>
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <Button
              variant={activeTab === "services" ? "primary" : "ghost"}
              onClick={() => setActiveTab("services")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "services"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Chargeable Services
            </Button>
            <Button
              variant={activeTab === "discounts" ? "primary" : "ghost"}
              onClick={() => setActiveTab("discounts")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "discounts"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Discounts
            </Button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "services" && <ServiceManagement />}
          {activeTab === "discounts" && <DiscountManagement />}
        </div>
      </Card>
    </div>
  );
};

export default Services;
