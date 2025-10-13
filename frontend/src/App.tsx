import { useState } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import AppRouter from "./components/AppRouter";
import { navigationItems } from "./config";
import type { UserProfile, NotificationItem } from "./types";

function App() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  // Mock user data
  const mockUser: UserProfile = {
    id: "1",
    name: "John Anderson",
    email: "john.anderson@hotel.com",
    role: "Manager",
    avatar: undefined, // Will show initials
  };

  // Mock notifications
  const mockNotifications: NotificationItem[] = [
    {
      id: "1",
      title: "New Booking",
      message: "Room 101 has been booked for tonight by Sarah Wilson",
      type: "info",
      timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      read: false,
    },
    {
      id: "2",
      title: "Payment Received",
      message: "Payment of $250 received for booking #BK001",
      type: "success",
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      read: false,
    },
    {
      id: "3",
      title: "Maintenance Required",
      message: "Air conditioning in room 205 needs attention",
      type: "warning",
      timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
      read: true,
    },
    {
      id: "4",
      title: "System Alert",
      message: "Database backup completed successfully",
      type: "success",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      read: true,
    },
  ];

  const handleNotificationClick = (notification: NotificationItem) => {
    console.log("Notification clicked:", notification);
  };

  const handleProfileClick = () => {
    console.log("Profile clicked");
  };

  const handleLogout = () => {
    console.log("Logout clicked");
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <Sidebar
          navigationItems={navigationItems}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <Header
            hotelName="Grand Plaza Hotel"
            user={mockUser}
            notifications={mockNotifications}
            onNotificationClick={handleNotificationClick}
            onProfileClick={handleProfileClick}
            onLogout={handleLogout}
          />

          {/* Page Content */}
          <div className="flex justify-center">
            <div className="container">
              <main className="flex-1">
                <AppRouter />
              </main>
            </div>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
