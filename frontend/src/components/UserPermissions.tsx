import { usePermissions } from "../hooks/usePermissions";
import { getRolePermissions, getRoleDisplayName } from "../utils/permissions";
import { Card } from "./primary";

const UserPermissions = () => {
  const { user, userRole } = usePermissions();

  if (!user || !userRole) {
    return null;
  }

  const permissions = getRolePermissions(userRole);
  const roleDisplayName = getRoleDisplayName(userRole);

  return (
    <Card className="mb-6 p-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Current User Access</h3>
        <div className="flex items-center gap-4 text-sm">
          <span>
            <strong>User:</strong> {user.username}
          </span>
          <span>
            <strong>Role:</strong> {roleDisplayName}
          </span>
          <span>
            <strong>Email:</strong> {user.username}
          </span>
        </div>
      </div>

      <div>
        <h4 className="font-medium text-gray-700 mb-2">Available Permissions:</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {permissions.map((permission) => (
            <div key={permission} className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
              {permission.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default UserPermissions;
