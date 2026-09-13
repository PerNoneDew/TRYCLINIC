import { useState } from 'react';
import { Eye, EyeOff, Shield, Lock, ArrowLeft, Mail, CheckCircle, UserPlus, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { User } from '../types';

const programCourseOptions: { label: string; options: string[] }[] = [
  {
    label: 'COLLEGE',
    options: [
      'Bachelor of Elementary Education (BEEd)',
      'Bachelor of Secondary Education (BSEd) - Major in English',
      'Bachelor of Secondary Education (BSEd) - Major in Mathematics',
      'Bachelor of Secondary Education (BSEd) - Major in Social Studies',
      'Bachelor of Secondary Education (BSEd) - Major in General Science',
      'Bachelor of Secondary Education (BSEd) - Major in Filipino',
      'Bachelor of Science in Business Administration (BSBA) - Major in Financial Management',
      'Bachelor of Science in Business Administration (BSBA) - Major in Marketing Management',
      'Bachelor of Science in Business Administration (BSBA) - Major in Human Resource Development Management',
      'Bachelor of Science in Information System',
    ],
  },
  {
    label: 'SENIOR HIGH SCHOOL (Grades 11 & 12) - Academic Track',
    options: [
      'General Academic Strand (GAS)',
      'Humanities and Social Sciences (HUMSS)',
      'Accountancy, Business, and Management (ABM)',
    ],
  },
  {
    label: 'SENIOR HIGH SCHOOL (Grades 11 & 12) - TVL Track',
    options: [
      'Home Economics (HE)',
      'Information and Communications Technology (ICT)',
    ],
  },
  {
    label: 'BASIC EDUCATION DEPARTMENT - Junior High School',
    options: ['Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'],
  },
  {
    label: 'BASIC EDUCATION DEPARTMENT - Elementary',
    options: ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'],
  },
  {
    label: 'BASIC EDUCATION DEPARTMENT - Preschool',
    options: ['Kindergarten', 'Nursery'],
  },
];

const sexOptions = ['Male', 'Female'];

function buildName(firstName: string | undefined, middleName: string | undefined, lastName: string | undefined, suffix: string | undefined): string {
  return [firstName?.trim(), middleName?.trim(), lastName?.trim(), suffix?.trim()].filter(Boolean).join(' ');
}

type LoginView = 'login' | 'signup' | 'forgot' | 'reset';

export default function Login() {
  const { login, forgotPassword, resetPassword, registerUser, users } = useAuth();
  const [view, setView] = useState<LoginView>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Sign-up fields (students only) — mirrors admin "Add Student" form
  const [suForm, setSuForm] = useState({
    email: '', lastName: '', firstName: '', middleName: '', suffix: '',
    sex: '', dateOfBirth: '', contactNumber: '', address: '',
    studentId: '', department: '', gradeYearLevel: '', section: '', schoolYear: '',
    parentGuardian: '', parentGuardianContact: '',
    password: '', confirmPassword: '',
  });
  const [suShowPassword, setSuShowPassword] = useState(false);
  const [showProgramPicker, setShowProgramPicker] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const fullName = buildName(suForm.firstName, suForm.middleName, suForm.lastName, suForm.suffix);
    if (!fullName.trim()) {
      setError('Please enter your last name and first name.');
      return;
    }
    if (!suForm.email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (suForm.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (suForm.password !== suForm.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    const normalized = suForm.email.trim().toLowerCase();
    if (users.some((u) => u.email.trim().toLowerCase() === normalized)) {
      setError('An account with this email already exists.');
      return;
    }
    setLoading(true);
    const newUser: User = {
      id: `u${Date.now()}`,
      name: fullName,
      email: normalized,
      role: 'student',
      department: suForm.department || undefined,
      studentId: suForm.studentId || undefined,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
      lastName: suForm.lastName || undefined,
      firstName: suForm.firstName || undefined,
      middleName: suForm.middleName || undefined,
      suffix: suForm.suffix || undefined,
      sex: suForm.sex || undefined,
      dateOfBirth: suForm.dateOfBirth || undefined,
      gradeYearLevel: suForm.gradeYearLevel || undefined,
      section: suForm.section || undefined,
      programCourse: suForm.department || undefined,
      schoolYear: suForm.schoolYear || undefined,
      contactNumber: suForm.contactNumber || undefined,
      address: suForm.address || undefined,
      parentGuardian: suForm.parentGuardian || undefined,
      parentGuardianContact: suForm.parentGuardianContact || undefined,
    };
    try {
      await registerUser(newUser, suForm.password);
      setMessage('Account created successfully! You can now sign in.');
      setView('login');
      setEmail(normalized);
      setPassword('');
      setSuForm({
        email: '', lastName: '', firstName: '', middleName: '', suffix: '',
        sex: '', dateOfBirth: '', contactNumber: '', address: '',
        studentId: '', department: '', gradeYearLevel: '', section: '', schoolYear: '',
        parentGuardian: '', parentGuardianContact: '',
        password: '', confirmPassword: '',
      });
    } catch {
      setError('Could not create your account. Please try again.');
    }
    setLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    const success = login(email, password);
    if (!success) setError('Invalid email or password. Please try again.');
    setLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    const result = forgotPassword(email);
    if (result.success) {
      setMessage(result.message);
      const tokenMatch = result.message.match(/token: ([a-z0-9]+)/);
      if (tokenMatch) setResetToken(tokenMatch[1]);
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    const result = resetPassword(resetToken, newPassword);
    if (result.success) {
      setMessage(result.message);
      setTimeout(() => {
        setView('login');
        setMessage('');
        setResetToken('');
        setNewPassword('');
        setConfirmPassword('');
      }, 2000);
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex relative bg-[url('/images/Gemini_Generated_Image_c1ou4zc1ou4zc1ou.png')] bg-cover bg-center bg-no-repeat bg-fixed">
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/65 z-0" />

      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative z-10 overflow-hidden">
        <div className="relative">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="w-16 h-auto drop-shadow-lg" />
            <span className="text-white font-bold text-lg drop-shadow-md">HEALTH SYS SFCG</span>
          </div>
        </div>

        <div className="relative space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-white leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
              HEALTH SYS SFCG:<br />
              <span className="text-teal-300">An Information System</span><br />
              for Managing Student and<br />
              Employee Health Records
            </h2>
            <p className="mt-4 text-slate-100 text-lg leading-relaxed max-w-md drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
              A unified platform for managing health records, requests, inventory, and reporting for your institution.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Health Records', icon: '📋' },
              { label: 'User Management', icon: '👥' },
              { label: 'Service Requests', icon: '📝' },
              { label: 'Inventory Control', icon: '💊' },
            ].map((stat) => (
              <div key={stat.label} className="bg-black/40 border border-white/15 rounded-xl p-4 backdrop-blur-md">
                <p className="text-teal-300 font-bold text-xl drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">{stat.icon}</p>
                <p className="text-slate-200 text-sm mt-0.5 drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex items-center gap-2 text-slate-300 text-sm drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
          <Shield size={14} />
          <span>Secure, role-based access control</span>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 relative z-10">
        <div className={`w-full ${view === 'signup' ? 'max-w-2xl' : 'max-w-md'}`}>
          <div className="lg:hidden mb-8 text-center">
            <h1 className="text-white font-bold text-xl">HEALTH SYS SFCG</h1>
          </div>

          <div className={`bg-white rounded-3xl shadow-2xl p-8 ${view === 'signup' ? 'max-h-[90vh] overflow-y-auto' : ''}`}>
            {/* Login View */}
            {view === 'login' && (
              <>
                <div className="mb-8 text-center">
                  <img src="/logo.png" alt="Logo" className="w-28 h-auto mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-slate-800">Welcome back</h2>
                  <p className="text-slate-400 mt-1">Sign in to access your account</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@gmail.com"
                      required
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-sm font-medium text-slate-700">Password</label>
                      <button
                        type="button"
                        onClick={() => { setView('forgot'); setError(''); setMessage(''); }}
                        className="text-xs text-teal-500 hover:text-teal-600 font-medium"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all pr-12"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 text-rose-600 bg-rose-50 border border-rose-100 px-4 py-3 rounded-xl text-sm">
                      <Lock size={14} />
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-teal-500 hover:bg-teal-600 disabled:bg-teal-300 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 mt-2"
                  >
                    {loading ? (
                      <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</>
                    ) : 'Sign In'}
                  </button>
                </form>

                {message && (
                  <div className="mt-4 flex items-center gap-3 bg-teal-50 border border-teal-100 rounded-xl p-4 text-sm text-teal-700">
                    <CheckCircle size={18} className="text-teal-500 shrink-0" />
                    {message}
                  </div>
                )}

                <div className="mt-6 text-center">
                  <span className="text-sm text-slate-500">Are you a student? </span>
                  <button
                    type="button"
                    onClick={() => { setView('signup'); setError(''); setMessage(''); }}
                    className="text-sm text-teal-500 hover:text-teal-600 font-semibold inline-flex items-center gap-1"
                  >
                    <UserPlus size={14} /> Create an account
                  </button>
                </div>
              </>
            )}

            {/* Sign Up View (students only) */}
            {view === 'signup' && (
              <>
                <div className="mb-6">
                  <button onClick={() => { setView('login'); setError(''); setMessage(''); }} className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 text-sm mb-4 transition-colors">
                    <ArrowLeft size={15} /> Back to Sign In
                  </button>
                  <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center mb-4">
                    <UserPlus size={22} className="text-teal-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800">Student Sign Up</h2>
                  <p className="text-slate-400 mt-1 text-sm">Fill in your details to create your student account.</p>
                </div>

                <form onSubmit={handleSignUp} className="space-y-6">
                  {/* Personal Information */}
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Personal Information</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email Address <span className="text-rose-500">*</span></label>
                        <input type="email" value={suForm.email} onChange={(e) => setSuForm({ ...suForm, email: e.target.value })} required placeholder="student@email.edu" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Last Name <span className="text-rose-500">*</span></label>
                        <input value={suForm.lastName} onChange={(e) => setSuForm({ ...suForm, lastName: e.target.value })} required placeholder="Last name" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">First Name <span className="text-rose-500">*</span></label>
                        <input value={suForm.firstName} onChange={(e) => setSuForm({ ...suForm, firstName: e.target.value })} required placeholder="First name" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Middle Name</label>
                        <input value={suForm.middleName} onChange={(e) => setSuForm({ ...suForm, middleName: e.target.value })} placeholder="Middle name" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Suffix</label>
                        <input value={suForm.suffix} onChange={(e) => setSuForm({ ...suForm, suffix: e.target.value })} placeholder="e.g. Jr., Sr., III" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Sex</label>
                        <select value={suForm.sex} onChange={(e) => setSuForm({ ...suForm, sex: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400">
                          <option value="">Select sex</option>
                          {sexOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth</label>
                        <input type="date" value={suForm.dateOfBirth} onChange={(e) => setSuForm({ ...suForm, dateOfBirth: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Contact Number</label>
                        <input value={suForm.contactNumber} onChange={(e) => setSuForm({ ...suForm, contactNumber: e.target.value })} placeholder="e.g. 09171234567" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                        <input value={suForm.address} onChange={(e) => setSuForm({ ...suForm, address: e.target.value })} placeholder="Home address" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
                      </div>
                    </div>
                  </div>

                  {/* Academic Information */}
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Academic Information</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Student ID</label>
                        <input value={suForm.studentId} onChange={(e) => setSuForm({ ...suForm, studentId: e.target.value })} placeholder="e.g. STU-2024-001" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Program / Course</label>
                        <button type="button" onClick={() => setShowProgramPicker(true)} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 text-left flex items-center justify-between bg-white">
                          <span className={suForm.department ? 'text-slate-700' : 'text-slate-400'}>{suForm.department || 'Select program / course'}</span>
                          <ChevronDown size={16} className="text-slate-400 shrink-0" />
                        </button>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Grade / Year Level</label>
                        <input value={suForm.gradeYearLevel} onChange={(e) => setSuForm({ ...suForm, gradeYearLevel: e.target.value })} placeholder="e.g. Grade 11, 1st Year" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Section</label>
                        <input value={suForm.section} onChange={(e) => setSuForm({ ...suForm, section: e.target.value })} placeholder="e.g. A, B, Rizal" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">School Year</label>
                        <input value={suForm.schoolYear} onChange={(e) => setSuForm({ ...suForm, schoolYear: e.target.value })} placeholder="e.g. 2024-2025" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
                      </div>
                    </div>
                  </div>

                  {/* Parent/Guardian */}
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Parent / Guardian</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Parent / Guardian Name</label>
                        <input value={suForm.parentGuardian} onChange={(e) => setSuForm({ ...suForm, parentGuardian: e.target.value })} placeholder="Full name" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Parent / Guardian Contact</label>
                        <input value={suForm.parentGuardianContact} onChange={(e) => setSuForm({ ...suForm, parentGuardianContact: e.target.value })} placeholder="Contact number" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
                      </div>
                    </div>
                  </div>

                  {/* Account */}
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Account</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Password <span className="text-rose-500">*</span></label>
                        <div className="relative">
                          <input type={suShowPassword ? 'text' : 'password'} value={suForm.password} onChange={(e) => setSuForm({ ...suForm, password: e.target.value })} required placeholder="At least 6 characters" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 pr-10" />
                          <button type="button" onClick={() => setSuShowPassword(!suShowPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                            {suShowPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password <span className="text-rose-500">*</span></label>
                        <input type="password" value={suForm.confirmPassword} onChange={(e) => setSuForm({ ...suForm, confirmPassword: e.target.value })} required placeholder="Repeat your password" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 text-rose-600 bg-rose-50 border border-rose-100 px-4 py-3 rounded-xl text-sm">
                      <Lock size={14} />
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-teal-500 hover:bg-teal-600 disabled:bg-teal-300 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating account...</>
                    ) : 'Create Student Account'}
                  </button>
                </form>

                <p className="mt-4 text-center text-xs text-slate-400">
                  Staff, faculty, and employee accounts can only be created by an administrator.
                </p>
              </>
            )}

            {/* Program / Course Picker (for sign-up) */}
            {showProgramPicker && view === 'signup' && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowProgramPicker(false)}>
                <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-slate-800">Select Program / Course</h3>
                    <button onClick={() => setShowProgramPicker(false)} className="text-slate-400 hover:text-slate-600 text-sm">Close</button>
                  </div>
                  <div className="space-y-4">
                    {programCourseOptions.map((group) => (
                      <div key={group.label}>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{group.label}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {group.options.map((o) => (
                            <button
                              key={o}
                              type="button"
                              onClick={() => { setSuForm({ ...suForm, department: o }); setShowProgramPicker(false); }}
                              className={`px-3 py-2 rounded-xl text-sm text-left transition-colors border ${suForm.department === o ? 'bg-teal-50 border-teal-400 text-teal-700 font-medium' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'}`}
                            >
                              {o}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Forgot Password View */}
            {view === 'forgot' && (
              <>
                <div className="mb-8">
                  <button onClick={() => { setView('login'); setError(''); setMessage(''); }} className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 text-sm mb-4 transition-colors">
                    <ArrowLeft size={15} /> Back to Sign In
                  </button>
                  <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center mb-4">
                    <Mail size={22} className="text-teal-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800">Forgot Password</h2>
                  <p className="text-slate-400 mt-1 text-sm">Enter your email to receive reset instructions.</p>
                </div>

                {message ? (
                  <div className="space-y-4">
                    <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 text-sm text-teal-700">
                      {message}
                    </div>
                    <button
                      onClick={() => { setView('reset'); setMessage(''); setError(''); }}
                      className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 rounded-xl transition-colors"
                    >
                      Enter Reset Token
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@gmail.com"
                        required
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
                      />
                    </div>
                    {error && (
                      <div className="flex items-center gap-2 text-rose-600 bg-rose-50 border border-rose-100 px-4 py-3 rounded-xl text-sm">
                        <Lock size={14} />
                        {error}
                      </div>
                    )}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-teal-500 hover:bg-teal-600 disabled:bg-teal-300 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</> : 'Send Reset Instructions'}
                    </button>
                  </form>
                )}
              </>
            )}

            {/* Reset Password View */}
            {view === 'reset' && (
              <>
                <div className="mb-8">
                  <button onClick={() => { setView('forgot'); setError(''); setMessage(''); }} className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 text-sm mb-4 transition-colors">
                    <ArrowLeft size={15} /> Back
                  </button>
                  <h2 className="text-2xl font-bold text-slate-800">Reset Password</h2>
                  <p className="text-slate-400 mt-1 text-sm">Enter your reset token and new password.</p>
                </div>

                {message ? (
                  <div className="flex items-center gap-3 bg-teal-50 border border-teal-100 rounded-xl p-4 text-sm text-teal-700">
                    <CheckCircle size={18} className="text-teal-500 shrink-0" />
                    {message}
                  </div>
                ) : (
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Reset Token</label>
                      <input
                        type="text"
                        value={resetToken}
                        onChange={(e) => setResetToken(e.target.value)}
                        placeholder="Paste your reset token"
                        required
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">New Password</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        required
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm Password</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repeat new password"
                        required
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
                      />
                    </div>
                    {error && (
                      <div className="flex items-center gap-2 text-rose-600 bg-rose-50 border border-rose-100 px-4 py-3 rounded-xl text-sm">
                        <Lock size={14} />
                        {error}
                      </div>
                    )}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-teal-500 hover:bg-teal-600 disabled:bg-teal-300 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Resetting...</> : 'Reset Password'}
                    </button>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
