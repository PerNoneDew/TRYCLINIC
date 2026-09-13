import { useState, useMemo } from 'react';
import { Search, LogIn, LogOut, Eye, History, Monitor, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { AuditLog } from '../../types';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';

function formatTimestamp(ts: string): { date: string; time: string } {
  const d = new Date(ts);
  if (isNaN(d.getTime())) return { date: ts.split(' ')[0] ?? ts, time: ts.split(' ')[1] ?? '' };
  return {
    date: d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
    time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }),
  };
}

function relativeTime(ts: string): string {
  const d = new Date(ts);
  if (isNaN(d.getTime())) return ts;
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function LoginHistory() {
  const { auditLogs, users } = useData();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewLog, setViewLog] = useState<AuditLog | null>(null);

  const loginLogs = useMemo(() => {
    return auditLogs
      .filter((l) => l.type === 'login' || l.type === 'logout')
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }, [auditLogs]);

  const filtered = loginLogs.filter((l) => {
    const matchSearch =
      l.userName.toLowerCase().includes(search.toLowerCase()) ||
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.details.toLowerCase().includes(search.toLowerCase());
    const isLogin = l.type === 'login';
    const isSuccess = !l.details.toLowerCase().includes('failed');
    const matchStatus =
      statusFilter === 'all' ||
      (statusFilter === 'login' && isLogin && isSuccess) ||
      (statusFilter === 'logout' && l.type === 'logout') ||
      (statusFilter === 'failed' && isLogin && !isSuccess);
    return matchSearch && matchStatus;
  });

  const totalLogins = loginLogs.filter((l) => l.type === 'login' && !l.details.toLowerCase().includes('failed')).length;
  const totalLogouts = loginLogs.filter((l) => l.type === 'logout').length;
  const failedAttempts = loginLogs.filter((l) => l.type === 'login' && l.details.toLowerCase().includes('failed')).length;
  const uniqueUsers = new Set(loginLogs.map((l) => l.userId)).size;

  return (
    <div className="space-y-5">
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-teal-50 rounded-xl"><LogIn size={18} className="text-teal-500" /></div>
            <div>
              <p className="text-sm text-slate-500">Successful Logins</p>
              <p className="text-2xl font-bold text-slate-800">{totalLogins}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-50 rounded-xl"><LogOut size={18} className="text-slate-500" /></div>
            <div>
              <p className="text-sm text-slate-500">Logouts</p>
              <p className="text-2xl font-bold text-slate-800">{totalLogouts}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-50 rounded-xl"><XCircle size={18} className="text-rose-500" /></div>
            <div>
              <p className="text-sm text-slate-500">Failed Attempts</p>
              <p className="text-2xl font-bold text-slate-800">{failedAttempts}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-50 rounded-xl"><History size={18} className="text-sky-500" /></div>
            <div>
              <p className="text-sm text-slate-500">Unique Users</p>
              <p className="text-2xl font-bold text-slate-800">{uniqueUsers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by user or action..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 text-slate-600"
          >
            <option value="all">All Events</option>
            <option value="login">Logins</option>
            <option value="logout">Logouts</option>
            <option value="failed">Failed Attempts</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Event</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">User</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider hidden md:table-cell">Role</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider hidden lg:table-cell">IP Address</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">When</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((log) => {
                const isLogin = log.type === 'login';
                const isFailed = log.details.toLowerCase().includes('failed');
                const { date, time } = formatTimestamp(log.timestamp);
                const user = users.find((u) => u.id === log.userId);
                return (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex p-1.5 rounded-lg ${isLogin ? (isFailed ? 'bg-rose-50' : 'bg-teal-50') : 'bg-slate-100'}`}>
                          {isLogin ? (isFailed ? <XCircle size={14} className="text-rose-500" /> : <LogIn size={14} className="text-teal-500" />) : <LogOut size={14} className="text-slate-500" />}
                        </span>
                        <span className="text-sm text-slate-700">{isLogin ? (isFailed ? 'Failed Login' : 'Login') : 'Logout'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-teal-100 flex items-center justify-center shrink-0">
                          <span className="text-teal-600 font-semibold text-xs">{log.userName.charAt(0)}</span>
                        </div>
                        <span className="text-sm font-medium text-slate-700 whitespace-nowrap">{log.userName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      {user && <Badge label={user.role.charAt(0).toUpperCase() + user.role.slice(1)} variant="neutral" />}
                    </td>
                    <td className="px-5 py-3.5 hidden lg:table-cell">
                      <span className="text-xs text-slate-400 font-mono">{log.ipAddress}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="text-xs text-slate-500">
                        <p className="font-medium text-slate-600">{date}</p>
                        <p className="text-slate-400">{time}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      {isFailed ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-600 bg-rose-50 px-2 py-1 rounded-full">
                          <XCircle size={11} /> Failed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                          <CheckCircle size={11} /> Success
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => setViewLog(log)}
                        className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-10 text-slate-400 text-sm">No login history entries found.</div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      <Modal isOpen={viewLog !== null} onClose={() => setViewLog(null)} title="Login Event Details" size="md">
        {viewLog && (
          <div className="space-y-4">
            <div className={`flex items-center gap-3 p-4 rounded-xl ${viewLog.type === 'login' ? (viewLog.details.toLowerCase().includes('failed') ? 'bg-rose-50 border border-rose-100' : 'bg-teal-50 border border-teal-100') : 'bg-slate-50 border border-slate-100'}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${viewLog.type === 'login' ? (viewLog.details.toLowerCase().includes('failed') ? 'bg-rose-100' : 'bg-teal-100') : 'bg-slate-200'}`}>
                {viewLog.type === 'login' ? (viewLog.details.toLowerCase().includes('failed') ? <XCircle size={20} className="text-rose-500" /> : <LogIn size={20} className="text-teal-500" />) : <LogOut size={20} className="text-slate-500" />}
              </div>
              <div>
                <p className="font-semibold text-slate-800">{viewLog.type === 'login' ? (viewLog.details.toLowerCase().includes('failed') ? 'Failed Login Attempt' : 'Successful Login') : 'User Logout'}</p>
                <p className="text-xs text-slate-500">{relativeTime(viewLog.timestamp)}</p>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-slate-400 flex items-center gap-1.5"><Clock size={13} /> Timestamp</span>
                <span className="font-mono text-slate-700">{viewLog.timestamp}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-slate-400">User</span>
                <span className="font-medium text-slate-700">{viewLog.userName}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-slate-400">Action</span>
                <span className="font-medium text-slate-700">{viewLog.action}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-slate-400 flex items-center gap-1.5"><Monitor size={13} /> IP Address</span>
                <span className="font-mono text-slate-700">{viewLog.ipAddress}</span>
              </div>
              <div className="py-2">
                <p className="text-slate-400 mb-1">Details</p>
                <p className="text-slate-600 bg-slate-50 rounded-xl p-3 leading-relaxed">{viewLog.details}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
