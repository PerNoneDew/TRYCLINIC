import { Page, UserRole } from '../types';

export type PermissionKey =
  | 'dashboard'
  | 'view_all_users'
  | 'manage_users'
  | 'bulk_import'
  | 'view_health_records'
  | 'manage_health_records'
  | 'daily_treatment'
  | 'first_aid'
  | 'physical_exam'
  | 'medicine_issuance'
  | 'referral'
  | 'follow_up'
  | 'appointment'
  | 'request_consultation'
  | 'manage_requests'
  | 'view_inventory'
  | 'manage_inventory'
  | 'stock_transactions'
  | 'suppliers'
  | 'purchases'
  | 'liquidation'
  | 'reports'
  | 'notifications'
  | 'user_management'
  | 'roles_permissions'
  | 'system_settings'
  | 'login_history'
  | 'audit_trail'
  | 'health_services_history';

export interface PermissionDef {
  key: PermissionKey;
  label: string;
  description: string;
  module: string;
}

export const permissionDefs: PermissionDef[] = [
  { key: 'dashboard', label: 'Dashboard', description: 'View the main dashboard with stats and overview', module: 'General' },
  { key: 'health_services_history', label: 'Health Services History', description: 'View personal history of clinic visits and requests', module: 'General' },
  { key: 'request_consultation', label: 'Request Consultation', description: 'Submit consultation requests to the clinic', module: 'General' },

  { key: 'view_all_users', label: 'View All Users', description: 'See all students, employees, and faculty records', module: 'People & Health Records' },
  { key: 'manage_users', label: 'Manage Users', description: 'Add, edit, activate, and deactivate user accounts', module: 'People & Health Records' },
  { key: 'bulk_import', label: 'Bulk Import', description: 'Import multiple users via CSV upload', module: 'People & Health Records' },
  { key: 'view_health_records', label: 'View Health Records', description: 'View health records of all patients', module: 'People & Health Records' },
  { key: 'manage_health_records', label: 'Manage Health Records', description: 'Create and edit health records for patients', module: 'People & Health Records' },

  { key: 'daily_treatment', label: 'Daily Treatment', description: 'Record and manage daily medical treatment visits', module: 'Health Services' },
  { key: 'first_aid', label: 'First Aid', description: 'Record and manage first aid incidents', module: 'Health Services' },
  { key: 'physical_exam', label: 'Physical Examination', description: 'Conduct and record physical examinations', module: 'Health Services' },
  { key: 'medicine_issuance', label: 'Medicine Issuance', description: 'Issue medicines from inventory to patients', module: 'Health Services' },
  { key: 'referral', label: 'Referral Management', description: 'Create and track patient referrals', module: 'Health Services' },
  { key: 'follow_up', label: 'Follow-up Management', description: 'Schedule and track patient follow-ups', module: 'Health Services' },
  { key: 'appointment', label: 'Appointment Management', description: 'Schedule and manage clinic appointments', module: 'Health Services' },
  { key: 'manage_requests', label: 'Manage Consultation Requests', description: 'Review, approve, and reject consultation requests', module: 'Health Services' },

  { key: 'view_inventory', label: 'View Inventory', description: 'View medicine and supply stock levels', module: 'Inventory & Purchases' },
  { key: 'manage_inventory', label: 'Manage Inventory', description: 'Add, edit, and delete inventory items', module: 'Inventory & Purchases' },
  { key: 'stock_transactions', label: 'Stock Transactions', description: 'Record stock in/out, adjustments, and disposals', module: 'Inventory & Purchases' },
  { key: 'suppliers', label: 'Suppliers', description: 'Manage supplier information', module: 'Inventory & Purchases' },
  { key: 'purchases', label: 'Purchases', description: 'Record and track purchase orders', module: 'Inventory & Purchases' },
  { key: 'liquidation', label: 'Liquidation', description: 'Manage expense liquidation and verification', module: 'Inventory & Purchases' },

  { key: 'reports', label: 'Reports', description: 'Generate and view system reports', module: 'Reports & Notifications' },
  { key: 'notifications', label: 'Notifications', description: 'Send and manage system notifications', module: 'Reports & Notifications' },

  { key: 'user_management', label: 'User Management', description: 'Access user management module', module: 'Administration' },
  { key: 'roles_permissions', label: 'Roles & Permissions', description: 'Configure role-based access control', module: 'Administration' },
  { key: 'system_settings', label: 'System Settings', description: 'Configure system settings, backup and recovery', module: 'Administration' },
  { key: 'login_history', label: 'Login History', description: 'View user login history and sessions', module: 'Administration' },
  { key: 'audit_trail', label: 'Audit Trail', description: 'View system audit logs and activity trail', module: 'Administration' },
];

export const moduleOrder = ['General', 'People & Health Records', 'Health Services', 'Inventory & Purchases', 'Reports & Notifications', 'Administration'];

export const pagePermissions: Record<Page, PermissionKey> = {
  dashboard: 'dashboard',
  'people-health-records': 'view_all_users',
  students: 'view_all_users',
  employees: 'view_all_users',
  'health-records': 'view_health_records',
  'bulk-import': 'bulk_import',
  'health-services': 'daily_treatment',
  'daily-treatment': 'daily_treatment',
  dental: 'daily_treatment',
  'physical-examination': 'physical_exam',
  'medical-issuance': 'medicine_issuance',
  referral: 'referral',
  'follow-up': 'follow_up',
  appointment: 'appointment',
  'first-aid': 'first_aid',
  'inventory-purchases': 'view_inventory',
  medicines: 'view_inventory',
  'medical-supplies': 'view_inventory',
  'stock-transactions': 'stock_transactions',
  suppliers: 'suppliers',
  purchases: 'purchases',
  liquidation: 'liquidation',
  'reports-notifications': 'reports',
  reports: 'reports',
  notifications: 'notifications',
  printing: 'reports',
  'user-management': 'user_management',
  users: 'user_management',
  'roles-permissions': 'roles_permissions',
  'system-settings': 'system_settings',
  'login-history': 'login_history',
  'audit-trail': 'audit_trail',
  profile: 'dashboard',
  'health-services-history': 'health_services_history',
  'request-consultation': 'request_consultation',
  'request-management': 'manage_requests',
};

export const defaultRolePermissions: Record<UserRole, PermissionKey[]> = {
  admin: permissionDefs.map((p) => p.key),
  staff: [
    'dashboard', 'health_services_history', 'request_consultation',
    'view_all_users', 'manage_users', 'bulk_import', 'view_health_records', 'manage_health_records',
    'daily_treatment', 'first_aid', 'physical_exam', 'medicine_issuance',
    'referral', 'follow_up', 'appointment', 'manage_requests',
    'view_inventory', 'manage_inventory', 'stock_transactions', 'suppliers', 'purchases', 'liquidation',
    'reports', 'notifications',
  ],
  faculty: ['dashboard', 'health_services_history', 'request_consultation', 'view_health_records'],
  student: ['dashboard', 'health_services_history', 'request_consultation', 'view_health_records'],
  employee: ['dashboard', 'health_services_history', 'request_consultation', 'view_health_records'],
};

export type RolePermissionMap = Record<UserRole, Set<PermissionKey>>;

export function defaultPermissionMap(): RolePermissionMap {
  const m = {} as RolePermissionMap;
  (Object.keys(defaultRolePermissions) as UserRole[]).forEach((role) => {
    m[role] = new Set(defaultRolePermissions[role]);
  });
  return m;
}

export function canAccess(page: Page, role: UserRole, permissions: RolePermissionMap): boolean {
  if (role === 'admin') return true;
  const perm = pagePermissions[page];
  if (!perm) return false;
  return permissions[role]?.has(perm) ?? false;
}

export function hasPermission(perm: PermissionKey, role: UserRole, permissions: RolePermissionMap): boolean {
  if (role === 'admin') return true;
  return permissions[role]?.has(perm) ?? false;
}
