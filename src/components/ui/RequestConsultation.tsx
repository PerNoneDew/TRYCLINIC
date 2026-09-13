import { useState } from 'react';
import { X, Stethoscope, HeartPulse, Pill, ShieldPlus, Loader2, Upload, FileText, XCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Request, RequestType, Notification } from '../../types';
import { supabase } from '../../lib/supabase';

const ATTACHMENT_BUCKET = 'request-attachments';
const MAX_FILE_SIZE = 10 * 1024 * 1024;

type UploadedAttachment = { name: string; url: string };

async function uploadAttachment(file: File): Promise<UploadedAttachment> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`"${file.name}" is too large. Maximum file size is 10 MB.`);
  }
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from(ATTACHMENT_BUCKET).upload(path, file, { upsert: false });
  if (error) throw new Error(error.message);
  const { data: pub } = supabase.storage.from(ATTACHMENT_BUCKET).getPublicUrl(path);
  return { name: file.name, url: pub.publicUrl };
}

const serviceOptions: { key: RequestType; label: string; description: string; icon: typeof Stethoscope }[] = [
  { key: 'medical', label: 'Medical', description: 'Medical consultation, checkup, or treatment', icon: Stethoscope },
  { key: 'dental', label: 'Dental', description: 'Dental consultation, checkup, or oral care', icon: Stethoscope },
  { key: 'physical', label: 'Physical Exam', description: 'Physical examination and fitness assessment', icon: HeartPulse },
  { key: 'medicine', label: 'Medicine', description: 'Request for medicine from clinic stock', icon: Pill },
  { key: 'first_aid', label: 'First Aid', description: 'Immediate first aid treatment for injuries', icon: ShieldPlus },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function RequestConsultation({ isOpen, onClose }: Props) {
  const { currentUser } = useAuth();
  const { setRequests, setNotifications, persistRequest } = useData();
  const [serviceType, setServiceType] = useState<RequestType>('medical');
  const [description, setDescription] = useState('');
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen || !currentUser) return null;

  const canSubmit = ['student', 'employee', 'faculty', 'staff'].includes(currentUser.role);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    const valid: File[] = [];
    for (const f of files) {
      const ext = f.name.split('.').pop()?.toLowerCase();
      const allowed = ['pdf', 'png', 'jpg', 'jpeg', 'webp', 'gif'];
      if (!allowed.includes(ext ?? '')) {
        setError(`"${f.name}" is not a supported file type. Only PDF, PNG, JPG, WEBP, and GIF are allowed.`);
        continue;
      }
      if (f.size > MAX_FILE_SIZE) {
        setError(`"${f.name}" is too large. Maximum file size is 10 MB.`);
        continue;
      }
      valid.push(f);
    }
    setPendingFiles((prev) => [...prev, ...valid]);
    e.target.value = '';
  };

  const removePendingFile = (idx: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      setError('Please describe your reason for consultation.');
      return;
    }
    setUploading(true);
    setError('');
    let uploaded: UploadedAttachment[] = [];
    try {
      for (const f of pendingFiles) {
        uploaded.push(await uploadAttachment(f));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file.');
      setUploading(false);
      return;
    }
    const now = new Date().toISOString().split('T')[0];
    const newReq: Request = {
      id: `req${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      type: serviceType,
      description: description.trim(),
      status: 'pending',
      attachments: uploaded.map((u) => `${u.name}||${u.url}`),
      submittedAt: now,
      updatedAt: now,
    };
    setRequests((prev) => [...prev, newReq]);
    await persistRequest(newReq);

    const newNotif: Notification = {
      id: `notif${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: 'New Consultation Request',
      message: `${currentUser.name} submitted a ${serviceType} request: ${newReq.description.slice(0, 80)}${newReq.description.length > 80 ? '...' : ''}`,
      recipientRoles: ['admin'],
      sentBy: currentUser.name,
      sentAt: now,
      type: 'status_update',
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);

    setUploading(false);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setDescription('');
      setServiceType('medical');
      setPendingFiles([]);
      onClose();
    }, 1500);
  };

  const handleClose = () => {
    if (uploading) return;
    setDescription('');
    setServiceType('medical');
    setPendingFiles([]);
    setError('');
    setSuccess(false);
    onClose();
  };

  if (!canSubmit) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={handleClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center">
              <Stethoscope size={20} className="text-teal-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Request Consultation</h2>
              <p className="text-xs text-slate-400">Submit a request to the clinic</p>
            </div>
          </div>
          <button onClick={handleClose} disabled={uploading} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors disabled:opacity-50">
            <X size={18} />
          </button>
        </div>

        {success ? (
          <div className="px-6 py-12 text-center">
            <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-7 h-7 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
            </div>
            <p className="font-semibold text-slate-800">Request submitted!</p>
            <p className="text-sm text-slate-400 mt-1">The clinic will review your request shortly.</p>
          </div>
        ) : (
          <div className="px-6 py-5 space-y-5">
            {/* Service type */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Service Type</label>
              <div className="grid grid-cols-1 gap-2">
                {serviceOptions.map((opt) => {
                  const Icon = opt.icon;
                  const selected = serviceType === opt.key;
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setServiceType(opt.key)}
                      className={`text-left px-4 py-3 rounded-xl border text-sm transition-all flex items-center gap-3 ${selected ? 'border-teal-400 bg-teal-50 text-teal-700 font-medium' : 'border-slate-200 text-slate-600 hover:border-teal-200 hover:bg-slate-50'}`}
                    >
                      <div className={`p-2 rounded-lg ${selected ? 'bg-teal-100' : 'bg-slate-100'}`}>
                        <Icon size={18} className={selected ? 'text-teal-600' : 'text-slate-500'} />
                      </div>
                      <div>
                        <span className="font-medium">{opt.label}</span>
                        <span className="text-xs text-slate-400 block">{opt.description}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Reason / Description <span className="text-rose-500">*</span></label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none"
                placeholder="Describe your symptoms or reason for consultation..."
              />
            </div>

            {/* Attachments */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Supporting Documents <span className="text-slate-400 font-normal">(optional, PDF or image, max 10 MB)</span></label>
              <label className="flex flex-col items-center justify-center gap-2 px-4 py-6 border-2 border-dashed border-slate-200 rounded-xl text-sm text-slate-500 hover:border-teal-300 hover:bg-teal-50/30 transition-colors cursor-pointer">
                <Upload size={20} className="text-slate-400" />
                <span className="font-medium text-slate-600">Click to upload files</span>
                <span className="text-xs text-slate-400">PDF, PNG, JPG, WEBP, GIF</span>
                <input type="file" multiple accept=".pdf,.png,.jpg,.jpeg,.webp,.gif,application/pdf,image/*" onChange={handleFileSelect} className="hidden" />
              </label>
              {error && (
                <div className="mt-2 flex items-start gap-2 text-sm text-rose-600 bg-rose-50 border border-rose-100 px-3 py-2 rounded-lg">
                  <XCircle size={14} className="mt-0.5 shrink-0" />{error}
                </div>
              )}
              {pendingFiles.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  {pendingFiles.map((f, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm bg-slate-50 border border-slate-100 rounded-lg px-3 py-2">
                      <FileText size={14} className="text-teal-500 shrink-0" />
                      <span className="truncate flex-1 text-slate-700">{f.name}</span>
                      <span className="text-xs text-slate-400 shrink-0">{(f.size / 1024).toFixed(0)} KB</span>
                      <button type="button" onClick={() => removePendingFile(idx)} className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors shrink-0" title="Remove">
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button onClick={handleClose} disabled={uploading} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50">Cancel</button>
              <button onClick={handleSubmit} disabled={uploading || !description.trim()} className="px-4 py-2 text-sm font-medium bg-teal-500 hover:bg-teal-600 text-white rounded-xl transition-colors flex items-center gap-2 disabled:opacity-60">
                {uploading ? <><Loader2 size={14} className="animate-spin" /> Submitting...</> : 'Submit Request'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
