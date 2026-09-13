import { useState, useEffect } from 'react';
import { Lock, Shield, Users, Stethoscope, Package, BarChart3, UserCog, Check, X, Save, RotateCcw, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { UserRole } from '../../types';
import { permissionDefs, moduleOrder, PermissionKey, RolePermissionMap, defaultRolePermissions, defaultPermissionMap } from '../../lib/permissions';

const roleInfo: Record<UserRole, { label: string; description: string; color: string; bg: string; icon: React.ElementType }> = {
  admin: { label: 'Administrator', description: 'Full system access including user management, settings, and audit', color: 'text-teal-700', bg: 'bg-teal-50 border-teal-200', icon: Shield },
  staff: { label: 'Medical Staff', description: 'Clinic operations: treatments, inventory, and patient records', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', icon: Stethoscope },
  faculty: { label: 'Faculty', description: 'Personal health record and consultation requests', color: 'text-violet-700', bg: 'bg-violet-50 border-violet-200', icon: UserCog },
  student: { label: 'Student', description: 'Personal health record and consultation requests', color: 'text-sky-700', bg: 'bg-sky-50 border-sky-200', icon: Users },
  employee: { label: 'Employee', description: 'Personal health record and consultation requests', color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200', icon: Users },
};

const moduleIcons: Record<string, React.ElementType> = {
  General: BarChart3,
  'People & Health Records': Users,
  'Health Services': Stethoscope,
  'Inventory & Purchases': Package,
  'Reports & Notifications': Bell,
  Administration: UserCog,
};

export default function RolesPermissions() {
  const { users, currentUser } = useAuth();
  const { rolePermissions, persistRolePermissions } = useData();
  const [selectedRole, setSelectedRole] = useState<UserRole>('staff');
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [localMatrix, setLocalMatrix] = useState<RolePermissionMap>(rolePermissions);
  const [savedMessage, setSavedMessage] = useState('');

  useEffect(() => {
    setLocalMatrix(rolePermissions);
    setDirty(false);
  }, [rolePermissions]);

  const togglePermission = (role: UserRole, perm: PermissionKey) => {
    if (role === 'admin') return;
    setDirty(true);
    setLocalMatrix((prev) => {
      const next = { ...prev };
      const set = new Set(next[role]);
      if (set.has(perm)) set.delete(perm);
      else set.add(perm);
      next[role] = set;
      return next;
    });
  };

  const toggleModule = (role: UserRole, module: string) => {
    if (role === 'admin') return;
    const modulePerms = permissionDefs.filter((p) => p.module === module);
    const allEnabled = modulePerms.every((p) => localMatrix[role].has(p.key));
    setDirty(true);
    setLocalMatrix((prev) => {
      const next = { ...prev };
      const set = new Set(next[role]);
      modulePerms.forEach((p) => {
        if (allEnabled) set.delete(p.key);
        else set.add(p.key);
      });
      next[role] = set;
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setSavedMessage('');
    try {
      const perms = Array.from(localMatrix[selectedRole]);
      await persistRolePermissions(selectedRole, perms, currentUser?.id);
      setDirty(false);
      setSavedMessage(`${roleInfo[selectedRole].label} permissions saved successfully.`);
      setTimeout(() => setSavedMessage(''), 3000);
    } catch {
      setSavedMessage('Failed to save. Please try again.');
      setTimeout(() => setSavedMessage(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleResetRole = () => {
    if (selectedRole === 'admin') return;
    setDirty(true);
    setLocalMatrix((prev) => ({
      ...prev,
      [selectedRole]: new Set(defaultRolePermissions[selectedRole]),
    }));
  };

  const handleResetAll = () => {
    setDirty(true);
    setLocalMatrix(defaultPermissionMap());
  };

  const roleUserCounts: Record<UserRole, number> = { admin: 0, staff: 0, faculty: 0, student: 0, employee: 0 };
  users.forEach((u) => { roleUserCounts[u.role]++; });

  const filteredPerms = permissionDefs.filter((p) =>
    p.label.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  );

  const permsByModule = moduleOrder
    .map((mod) => ({ module: mod, perms: filteredPerms.filter((p) => p.module === mod) }))
    .filter((m) => m.perms.length > 0);

  return (
    <div className="space-y-5">
      <div className="bg-teal-50 border border-teal-200 rounded-2xl px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-white border border-teal-100"><Lock size={20} className="text-teal-600" /></div>
          <div>
            <h2 className="text-sm font-bold text-teal-800 uppercase tracking-wider">Roles & Permissions</h2>
            <p className="text-xs text-teal-600 mt-0.5">Define what each role can access and do across the system. Changes are saved to the database.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {(Object.keys(roleInfo) as UserRole[]).map((role) => {
          const info = roleInfo[role];
          const Icon = info.icon;
          const permCount = localMatrix[role]?.size ?? 0;
          const isSelected = selectedRole === role;
          return (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`text-left p-4 rounded-2xl border transition-all ${isSelected ? 'ring-2 ring-teal-400 ' + info.bg : 'bg-white border-slate-100 hover:border-slate-200 shadow-sm'}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 rounded-lg ${info.bg}`}><Icon size={16} className={info.color} /></div>
                <span className={`text-sm font-bold ${isSelected ? info.color : 'text-slate-700'}`}>{info.label}</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed mb-2">{info.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">{permCount} permissions</span>
                <span className="text-xs font-medium text-slate-400">{roleUserCounts[role]} user{roleUserCounts[role] !== 1 ? 's' : ''}</span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${roleInfo[selectedRole].bg}`}>
              {(() => { const Icon = roleInfo[selectedRole].icon; return <Icon size={18} className={roleInfo[selectedRole].color} />; })()}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">{roleInfo[selectedRole].label} Permissions</h3>
              <p className="text-xs text-slate-500">{localMatrix[selectedRole]?.size ?? 0} of {permissionDefs.length} permissions enabled</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-xs">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search permissions..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>
            {selectedRole !== 'admin' && (
              <button
                onClick={handleResetRole}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
                title="Reset this role to default permissions"
              >
                <RotateCcw size={13} /> Reset
              </button>
            )}
          </div>
        </div>

        {selectedRole === 'admin' && (
          <div className="px-5 py-3 bg-teal-50/50 border-b border-teal-100">
            <p className="text-xs text-teal-700 flex items-center gap-2">
              <Shield size={13} /> Administrator always has full access and cannot be restricted.
            </p>
          </div>
        )}

        <div className="divide-y divide-slate-50">
          {permsByModule.map(({ module: mod, perms }) => {
            const ModuleIcon = moduleIcons[mod] ?? BarChart3;
            const allEnabled = perms.every((p) => localMatrix[selectedRole]?.has(p.key));
            const someEnabled = perms.some((p) => localMatrix[selectedRole]?.has(p.key));
            return (
              <div key={mod} className="px-5 py-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <ModuleIcon size={15} className="text-slate-400" />
                    <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">{mod}</h4>
                    <span className="text-xs text-slate-400">({perms.filter((p) => localMatrix[selectedRole]?.has(p.key)).length}/{perms.length})</span>
                  </div>
                  {selectedRole !== 'admin' && (
                    <button
                      onClick={() => toggleModule(selectedRole, mod)}
                      className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${allEnabled ? 'bg-teal-50 text-teal-600 hover:bg-teal-100' : someEnabled ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                    >
                      {allEnabled ? 'Disable All' : 'Enable All'}
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {perms.map((perm) => {
                    const enabled = localMatrix[selectedRole]?.has(perm.key) ?? false;
                    const disabled = selectedRole === 'admin';
                    return (
                      <button
                        key={perm.key}
                        onClick={() => togglePermission(selectedRole, perm.key)}
                        disabled={disabled}
                        className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${enabled ? 'border-teal-200 bg-teal-50/50' : 'border-slate-100 bg-white hover:border-slate-200'} ${disabled ? 'cursor-default opacity-70' : 'cursor-pointer'}`}
                      >
                        <div className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-colors ${enabled ? 'bg-teal-500' : 'bg-slate-100 border border-slate-200'}`}>
                          {enabled ? <Check size={13} className="text-white" /> : <X size={13} className="text-slate-300" />}
                        </div>
                        <div className="min-w-0">
                          <p className={`text-sm font-medium ${enabled ? 'text-teal-800' : 'text-slate-700'}`}>{perm.label}</p>
                          <p className="text-xs text-slate-400 leading-relaxed mt-0.5">{perm.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="px-5 py-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
          <div className="flex items-center gap-3">
            {savedMessage && (
              <span className="text-xs font-medium text-teal-600 flex items-center gap-1.5">
                <Check size={14} /> {savedMessage}
              </span>
            )}
            {dirty && !savedMessage && (
              <span className="text-xs font-medium text-amber-600 flex items-center gap-1.5">
                You have unsaved changes
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleResetAll}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
            >
              <RotateCcw size={13} /> Reset All to Defaults
            </button>
            <button
              onClick={handleSave}
              disabled={!dirty || saving || selectedRole === 'admin'}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl transition-all ${dirty && !saving && selectedRole !== 'admin' ? 'bg-teal-500 text-white hover:bg-teal-600 shadow-sm shadow-teal-500/20' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
            >
              <Save size={14} /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-white border border-slate-200"><Lock size={15} className="text-slate-500" /></div>
          <div>
            <p className="text-sm font-semibold text-slate-700">How permissions work</p>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Each role has a set of permissions that determine which pages and actions are available.
              Users see only the sidebar items their role allows, and the system blocks direct access to restricted pages.
              Changes are saved to the database and take effect immediately for all users in that role.
              Administrators always have full access and cannot be restricted.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
