/**
 * Centralized Role Definitions & Authorization Middleware
 * Compatible with Edge and Node.js runtimes (Zero external dependencies)
 */

export const COOKIE_NAME = 'a2zee_auth_token';

export const ROLES = {
  CUSTOMER: 'CUSTOMER',
  WORKER: 'WORKER',
  ADMIN: 'ADMIN',
  FEDERATION_ADMIN: 'FEDERATION_ADMIN',
  SOCIETY_ADMIN: 'SOCIETY_ADMIN',
};

/**
 * Route-to-Allowed-Roles Mapping
 */
export const ROUTE_ROLES = {
  '/user': [ROLES.CUSTOMER, ROLES.WORKER, ROLES.ADMIN, ROLES.FEDERATION_ADMIN, ROLES.SOCIETY_ADMIN],
  '/worker': [ROLES.WORKER, ROLES.FEDERATION_ADMIN, ROLES.ADMIN],
  '/admin': [ROLES.ADMIN, ROLES.FEDERATION_ADMIN, ROLES.SOCIETY_ADMIN],
};

/**
 * Reusable authorization middleware check for session & required roles or path.
 *
 * @param {Object|null} session - Decoded JWT payload containing { role, sub, ... }
 * @param {string|string[]} requirement - Route prefix ('/admin', '/worker', '/user') OR list of allowed roles
 * @returns {{ isAuthorized: boolean, error?: string, role?: string, allowedRoles?: string[] }}
 */
export function authorize(session, requirement) {
  if (!session) {
    return { isAuthorized: false, error: 'unauthenticated' };
  }

  let allowedRoles = [];
  if (Array.isArray(requirement)) {
    allowedRoles = requirement;
  } else if (typeof requirement === 'string') {
    if (requirement.startsWith('/admin')) {
      allowedRoles = ROUTE_ROLES['/admin'];
    } else if (requirement.startsWith('/worker')) {
      allowedRoles = ROUTE_ROLES['/worker'];
    } else if (requirement.startsWith('/user')) {
      allowedRoles = ROUTE_ROLES['/user'];
    } else {
      allowedRoles = [requirement];
    }
  }

  const role = session.role;
  const isAuthorized = allowedRoles.includes(role);

  return {
    isAuthorized,
    role,
    allowedRoles,
    error: isAuthorized ? null : 'unauthorized_role',
  };
}
