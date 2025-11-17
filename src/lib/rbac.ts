import { User, Permission, UserRole } from '@/types';

/**
 * Role-Based Access Control (RBAC) utilities
 */

// Role hierarchy: admin > employee > client
const roleHierarchy: Record<UserRole, number> = {
  admin: 3,
  employee: 2,
  client: 1,
};

/**
 * Check if a user has a specific permission
 */
export const hasPermission = (user: User | null, permission: Permission): boolean => {
  if (!user) return false;
  return user.permissions.includes(permission);
};

/**
 * Check if user has any of the provided permissions
 */
export const hasAnyPermission = (user: User | null, permissions: Permission[]): boolean => {
  if (!user) return false;
  return permissions.some(permission => user.permissions.includes(permission));
};

/**
 * Check if user has all of the provided permissions
 */
export const hasAllPermissions = (user: User | null, permissions: Permission[]): boolean => {
  if (!user) return false;
  return permissions.every(permission => user.permissions.includes(permission));
};

/**
 * Check if user has a role equal to or higher than the required role
 */
export const hasRoleOrHigher = (user: User | null, requiredRole: UserRole): boolean => {
  if (!user) return false;
  return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
};

/**
 * Check if user can access another user's data (admins can access all, employees can access clients, users can access their own)
 */
export const canAccessUserData = (currentUser: User | null, targetUserId: string, targetUserRole?: UserRole): boolean => {
  if (!currentUser) return false;
  
  // Users can always access their own data
  if (currentUser.id === targetUserId) return true;
  
  // Admins can access all user data
  if (currentUser.role === 'admin') return true;
  
  // Employees can access client data
  if (currentUser.role === 'employee' && targetUserRole === 'client') return true;
  
  return false;
};

/**
 * Check if user can manage another user (create, update, delete)
 */
export const canManageUser = (currentUser: User | null, targetUserRole: UserRole): boolean => {
  if (!currentUser) return false;
  
  // Only admins can manage other users
  if (currentUser.role !== 'admin') return false;
  
  // Admins can manage employees and clients, but not other admins
  if (targetUserRole === 'admin') return false;
  
  return hasPermission(currentUser, 'manage_users');
};

/**
 * Get permissions that can be granted to a user based on current user's role
 */
export const getGrantablePermissions = (currentUser: User | null, targetRole: UserRole): Permission[] => {
  if (!currentUser || currentUser.role !== 'admin') return [];
  
  const allPermissions: Permission[] = [
    'manage_users',
    'manage_packages',
    'view_payments',
    'manage_payments',
    'upload_documents',
    'download_documents',
    'view_own_documents',
    'view_all_documents',
    'create_custom_packages',
    'send_notifications',
  ];
  
  switch (targetRole) {
    case 'admin':
      return allPermissions;
    case 'employee':
      return [
        'view_payments',
        'upload_documents',
        'download_documents',
        'view_all_documents',
        'send_notifications',
        'manage_packages', // Optional for senior employees
      ];
    case 'client':
      return [
        'upload_documents',
        'download_documents',
        'view_own_documents',
      ];
    default:
      return [];
  }
};

/**
 * Middleware to check permissions for API routes
 */
export const requirePermission = (permission: Permission) => {
  return (user: User | null): boolean => {
    return hasPermission(user, permission);
  };
};

/**
 * Middleware to check role for API routes
 */
export const requireRole = (role: UserRole) => {
  return (user: User | null): boolean => {
    return hasRoleOrHigher(user, role);
  };
};

/**
 * Check if user can view order details
 */
export const canViewOrder = (user: User | null, orderClientId: string): boolean => {
  if (!user) return false;
  
  // Admins and employees can view all orders
  if (user.role === 'admin' || user.role === 'employee') return true;
  
  // Clients can only view their own orders
  if (user.role === 'client' && user.id === orderClientId) return true;
  
  return false;
};

/**
 * Check if user can manage documents
 */
export const canManageDocument = (user: User | null, documentUserId: string, isPublic: boolean = false): boolean => {
  if (!user) return false;
  
  // Admins can manage all documents
  if (user.role === 'admin') return true;
  
  // Employees can manage all documents
  if (user.role === 'employee' && hasPermission(user, 'view_all_documents')) return true;
  
  // Users can manage their own documents
  if (user.id === documentUserId) return true;
  
  // Users can view public documents
  if (isPublic && hasPermission(user, 'view_own_documents')) return true;
  
  return false;
};