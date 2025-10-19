export const PUBLIC_ROUTES = [
  // Auth routes
  "/api/auth/register",
  "/api/auth/login",
  
];

/**
 * Check if a route is public (doesn't require authentication)
 * @param path - The request path to check
 * @returns true if the route is public, false otherwise
 */
export function isPublicRoute(path: string): boolean {
  return PUBLIC_ROUTES.some((route) => path === route);
}
