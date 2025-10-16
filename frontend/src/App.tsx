import { useState } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { AlertProvider } from "./contexts/AlertContext";
import { ModalProvider } from "./contexts/ModalContext";
import { useAuth } from "./hooks/useAuth";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import AppRouter from "./components/AppRouter";
import { AlertContainer, ModalContainer } from "./components";
import { navigationItems } from "./config";
import type { NotificationItem } from "./types";

// Main App Content Component (needs to be inside AuthProvider)
function AppContent() {
  const { user, logout, isAuthenticated } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

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
    logout();
  };

  // Convert User to UserProfile format for Header component
  const userProfile = user
    ? {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      }
    : null;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Only show sidebar and header for authenticated users */}
      {isAuthenticated && userProfile && (
        <>
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
              user={userProfile}
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
        </>
      )}

      {/* For non-authenticated users, show full-screen content (Login page) */}
      {!isAuthenticated && (
        <div className="w-full">
          <AppRouter />
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AlertProvider>
          <ModalProvider>
            <AppContent />
            <AlertContainer position="top-right" className="mt-14" />
            <ModalContainer />
          </ModalProvider>
        </AlertProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
