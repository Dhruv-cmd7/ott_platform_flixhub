import React, { useState, useEffect, useCallback } from 'react';
import { Save, Sliders, Play, CreditCard, Mail, AlertTriangle, CheckCircle2, RefreshCw, Eye, EyeOff, DollarSign, TrendingUp, Users, Activity } from 'lucide-react';
import api from '../services/api';

const TABS = [
  { id: 'general', label: 'General Configuration', icon: Sliders },
  { id: 'media', label: 'Media & Player Config', icon: Play },
  { id: 'payments', label: 'Payments & Gateway', icon: CreditCard },
  { id: 'smtp', label: 'SMTP Mail Settings', icon: Mail },
];

const InputField = ({ label, name, type = 'text', value, onChange, placeholder = '', hint = '', options = null }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">{label}</label>
    {options ? (
      <select name={name} value={value} onChange={onChange}
        className="w-full bg-white/[0.02] border border-white/5 rounded-lg text-sm text-gray-200 px-4 py-3 outline-none focus:border-[#e50914]/50 transition-all">
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    ) : (
      <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder}
        className="w-full bg-white/[0.02] border border-white/5 rounded-lg text-sm text-gray-200 px-4 py-3 outline-none focus:border-[#e50914]/50 transition-all" />
    )}
    {hint && <p className="text-xs text-gray-600">{hint}</p>}
  </div>
);

const Toggle = ({ label, name, value, onChange, hint }) => (
  <div className="flex items-center justify-between p-4 bg-white/[0.01] border border-white/5 rounded-xl">
    <div>
      <p className="text-sm font-semibold text-white">{label}</p>
      {hint && <p className="text-xs text-gray-500 mt-0.5">{hint}</p>}
    </div>
    <button type="button" onClick={() => onChange({ target: { name, value: !value } })}
      className={`relative w-12 h-6 rounded-full transition-all duration-300 ${value ? 'bg-[#e50914]' : 'bg-white/10'}`}>
      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${value ? 'left-7' : 'left-1'}`} />
    </button>
  </div>
);

const SectionHeader = ({ icon: Icon, title, subtitle }) => (
  <div className="flex items-center gap-3 pb-5 border-b border-white/5">
    <div className="p-2.5 bg-[#e50914]/10 rounded-xl"><Icon size={20} className="text-[#e50914]" /></div>
    <div>
      <h2 className="text-lg font-bold text-white">{title}</h2>
      <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
    </div>
  </div>
);

// ── Payment Gateway Tab ──────────────────────────────────
const PaymentTab = ({ form, onChange }) => {
  const [payStats, setPayStats] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [showSecret, setShowSecret] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');

  const fetchPayments = useCallback(async () => {
    setLoadingStats(true);
    try {
      const res = await api.get('/api/settings/payments', { params: filterStatus ? { status: filterStatus } : {} });
      if (res.data.success) {
        setPayStats(res.data.data.stats);
        setPayments(res.data.data.payments);
      }
    } catch (e) { console.error(e); }
    finally { setLoadingStats(false); }
  }, [filterStatus]);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  const statCards = [
    { label: 'Total Revenue', value: payStats ? `₹${Number(payStats.totalRevenue).toLocaleString()}` : '—', icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Monthly Revenue', value: payStats ? `₹${Number(payStats.monthRevenue).toLocaleString()}` : '—', icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Successful', value: payStats?.captured ?? '—', icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Failed', value: payStats?.failed ?? '—', icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10' },
  ];

  const statusBadge = (s) => ({ captured: 'bg-emerald-500/10 text-emerald-400', failed: 'bg-red-500/10 text-red-400', pending: 'bg-amber-500/10 text-amber-400' }[s] || 'bg-gray-500/10 text-gray-400');

  return (
    <div className="space-y-8">
      <SectionHeader icon={CreditCard} title="Payment Gateway" subtitle="Configure Razorpay credentials, taxes, and view transaction history." />

      {/* Revenue Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(s => (
          <div key={s.label} className="bg-white/[0.01] border border-white/5 rounded-xl p-4 flex items-center gap-3">
            <div className={`p-2.5 rounded-lg ${s.bg}`}><s.icon size={18} className={s.color} /></div>
            <div>
              <div className={`text-xl font-extrabold ${s.color}`}>{loadingStats ? '—' : s.value}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Gateway Config */}
      <div className="space-y-5">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-white/5 pb-3">Gateway Credentials</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <InputField label="Payment Gateway" name="paymentGateway" value={form.paymentGateway} onChange={onChange}
            options={[{ value: 'razorpay', label: 'Razorpay' }, { value: 'stripe', label: 'Stripe' }, { value: 'paypal', label: 'PayPal' }]} />
          <InputField label="Currency" name="currency" value={form.currency} onChange={onChange}
            options={[{ value: 'INR', label: 'INR — Indian Rupee' }, { value: 'USD', label: 'USD — US Dollar' }, { value: 'EUR', label: 'EUR — Euro' }]} />
          <InputField label="Razorpay Key ID" name="razorpayKeyId" value={form.razorpayKeyId} onChange={onChange} placeholder="rzp_live_..." />
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Razorpay Key Secret</label>
            <div className="relative">
              <input type={showSecret ? 'text' : 'password'} name="razorpayKeySecret" value={form.razorpayKeySecret} onChange={onChange}
                placeholder="••••••••••••••••"
                className="w-full bg-white/[0.02] border border-white/5 rounded-lg text-sm text-gray-200 px-4 py-3 pr-10 outline-none focus:border-[#e50914]/50 transition-all" />
              <button type="button" onClick={() => setShowSecret(p => !p)} className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-300">
                {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <InputField label="Webhook Secret" name="razorpayWebhookSecret" type="password" value={form.razorpayWebhookSecret} onChange={onChange} placeholder="whsec_..." />
          <InputField label="Tax / GST (%)" name="taxPercentage" type="number" value={form.taxPercentage} onChange={onChange} placeholder="18" />
          <InputField label="Free Trial Days" name="trialDays" type="number" value={form.trialDays} onChange={onChange} placeholder="7" />
          <InputField label="Refund Policy" name="refundPolicy" value={form.refundPolicy} onChange={onChange}
            options={[{ value: 'no-refund', label: 'No Refund' }, { value: '7-day', label: '7-Day Refund' }, { value: '30-day', label: '30-Day Refund' }]} />
        </div>
        <Toggle label="Test / Sandbox Mode" name="testMode" value={form.testMode} onChange={onChange}
          hint="Enable to use test credentials. Disable for live payments." />
      </div>

      {/* Transaction History */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Transaction History</p>
          <div className="flex items-center gap-3">
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="bg-white/[0.03] border border-white/5 rounded-lg text-xs text-gray-300 px-3 py-2 outline-none focus:border-[#e50914]/50">
              <option value="">All Status</option>
              <option value="captured">Captured</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
            <button onClick={fetchPayments} className="p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all">
              <RefreshCw size={14} className={loadingStats ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
        <div className="glass-card rounded-xl border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="text-xs text-gray-500 uppercase border-b border-white/5 bg-white/[0.01]">
                  <th className="p-4">User</th>
                  <th className="p-4">Plan</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Order ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loadingStats ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>{Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="p-4"><div className="h-4 bg-white/5 rounded animate-pulse w-3/4" /></td>
                    ))}</tr>
                  ))
                ) : payments.length === 0 ? (
                  <tr><td colSpan={6} className="p-10 text-center text-gray-500 text-sm">No transactions found yet.</td></tr>
                ) : (
                  payments.map(p => (
                    <tr key={p._id} className="text-gray-300 hover:bg-white/[0.01] transition-colors">
                      <td className="p-4">
                        <div className="font-medium text-white">{p.user?.name || 'N/A'}</div>
                        <div className="text-xs text-gray-500">{p.user?.email}</div>
                      </td>
                      <td className="p-4 text-gray-300">{p.plan?.name || 'N/A'}</td>
                      <td className="p-4 font-bold text-white">₹{p.amount?.toLocaleString() || 0}</td>
                      <td className="p-4 text-xs text-gray-400">{p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</td>
                      <td className="p-4"><span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${statusBadge(p.status)}`}>{p.status}</span></td>
                      <td className="p-4 text-xs text-gray-600 font-mono truncate max-w-[120px]">{p.razorpayOrderId || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main Settings Page ───────────────────────────────────
const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [form, setForm] = useState({
    siteName: '', supportEmail: '', siteLogoUrl: '', sessionExpire: '30d',
    maintenanceMode: false, allowRegistration: true, defaultLanguage: 'en', timezone: 'UTC',
    videoCDN: '', hlsEnabled: true, maxStreamQuality: '4K', defaultPlayerTheme: 'dark',
    autoplayEnabled: true, subtitleEnabled: true, watermarkEnabled: false, watermarkText: '',
    maxConcurrentStreams: 3,
    paymentGateway: 'razorpay', razorpayKeyId: '', razorpayKeySecret: '', razorpayWebhookSecret: '',
    currency: 'INR', trialDays: 7, refundPolicy: '7-day', taxPercentage: 18, testMode: true,
    smtpHost: '', smtpPort: 587, smtpUser: '', smtpPass: '', smtpSecure: false,
    emailFromName: 'FLIXHub Support', emailFromAddress: '', emailFooterText: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 4000); };

  useEffect(() => {
    api.get('/api/settings').then(res => {
      if (res.data.success) setForm(prev => ({ ...prev, ...res.data.data }));
    }).catch(() => showToast('Failed to load settings.', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/api/settings', form);
      if (res.data.success) showToast('Settings saved successfully!');
      else showToast('Failed to save settings.', 'error');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save settings.', 'error');
    } finally { setSaving(false); }
  };

  if (loading) return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-[#e50914] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const qOpts = ['480p', '720p HD', '1080p FHD', '4K UHD'].map(v => ({ value: v.split(' ')[0], label: v }));

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border text-sm font-medium animate-in slide-in-from-right duration-300 ${toast.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'}`}>
          {toast.type === 'error' ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />} {toast.msg}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white m-0">System Settings</h1>
        <p className="text-gray-400 text-sm mt-1">Configure global OTT platform parameters, media delivery, payments, and email.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Tab Sidebar */}
        <div className="glass-card p-3 rounded-xl border border-white/5 h-fit space-y-1">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all ${isActive ? 'bg-[#e50914]/10 text-white border border-[#e50914]/20' : 'text-gray-400 hover:bg-white/[0.02] hover:text-white'}`}>
                <Icon size={16} className={isActive ? 'text-[#e50914]' : ''} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Panel */}
        <div className="lg:col-span-3 glass-card p-6 md:p-8 rounded-xl border border-white/5">
          <form onSubmit={handleSave}>

            {/* ── General ── */}
            <div className={activeTab === 'general' ? 'block space-y-6' : 'hidden'}>
              <SectionHeader icon={Sliders} title="General Configuration" subtitle="Basic platform identity, access control, and regional settings." />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InputField label="Platform Display Name" name="siteName" value={form.siteName} onChange={handleChange} placeholder="FLIXHub OTT" />
                <InputField label="Support Email Address" name="supportEmail" type="email" value={form.supportEmail} onChange={handleChange} placeholder="support@flixhub.com" />
                <InputField label="Site Logo URL" name="siteLogoUrl" value={form.siteLogoUrl} onChange={handleChange} placeholder="https://..." />
                <InputField label="Admin Session Expire" name="sessionExpire" value={form.sessionExpire} onChange={handleChange}
                  options={[{ value: '24h', label: '24 Hours' }, { value: '7d', label: '7 Days' }, { value: '30d', label: '30 Days' }]} />
                <InputField label="Default Language" name="defaultLanguage" value={form.defaultLanguage} onChange={handleChange}
                  options={[{ value: 'en', label: 'English' }, { value: 'hi', label: 'Hindi' }, { value: 'es', label: 'Spanish' }, { value: 'fr', label: 'French' }]} />
                <InputField label="Timezone" name="timezone" value={form.timezone} onChange={handleChange}
                  options={[{ value: 'UTC', label: 'UTC' }, { value: 'Asia/Kolkata', label: 'IST — Asia/Kolkata' }, { value: 'America/New_York', label: 'EST — New York' }, { value: 'Europe/London', label: 'GMT — London' }]} />
              </div>
              <div className="space-y-3 pt-2">
                <Toggle label="Maintenance Mode" name="maintenanceMode" value={form.maintenanceMode} onChange={handleChange} hint="Site hidden from users, only admins can access." />
                <Toggle label="Allow New Registrations" name="allowRegistration" value={form.allowRegistration} onChange={handleChange} hint="Allow new users to sign up." />
              </div>
            </div>

            {/* ── Media ── */}
            <div className={activeTab === 'media' ? 'block space-y-6' : 'hidden'}>
              <SectionHeader icon={Play} title="Media & Player Config" subtitle="Control CDN, streaming quality, and the video player behaviour." />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <InputField label="Primary Video CDN Base URL" name="videoCDN" value={form.videoCDN} onChange={handleChange} placeholder="https://cdn.flixhub.com/streams/" />
                </div>
                <InputField label="Max Streaming Quality" name="maxStreamQuality" value={form.maxStreamQuality} onChange={handleChange}
                  options={[{ value: '480p', label: '480p SD' }, { value: '720p', label: '720p HD' }, { value: '1080p', label: '1080p FHD' }, { value: '4K', label: '4K UHD' }]} />
                <InputField label="Max Concurrent Streams" name="maxConcurrentStreams" type="number" value={form.maxConcurrentStreams} onChange={handleChange} placeholder="3" />
                <InputField label="Default Player Theme" name="defaultPlayerTheme" value={form.defaultPlayerTheme} onChange={handleChange}
                  options={[{ value: 'dark', label: 'Dark (Default)' }, { value: 'light', label: 'Light' }, { value: 'minimal', label: 'Minimal' }]} />
                <InputField label="Watermark Text" name="watermarkText" value={form.watermarkText} onChange={handleChange} placeholder="e.g. FLIXHub" />
              </div>
              <div className="space-y-3 pt-2">
                <Toggle label="HLS Adaptive Streaming" name="hlsEnabled" value={form.hlsEnabled} onChange={handleChange} hint="Enable HLS for adaptive bitrate streaming." />
                <Toggle label="Autoplay Next Episode" name="autoplayEnabled" value={form.autoplayEnabled} onChange={handleChange} hint="Automatically play next episode in a series." />
                <Toggle label="Subtitle Support" name="subtitleEnabled" value={form.subtitleEnabled} onChange={handleChange} hint="Show subtitle toggle in the player." />
                <Toggle label="Watermark Overlay" name="watermarkEnabled" value={form.watermarkEnabled} onChange={handleChange} hint="Display watermark text on the video player." />
              </div>
            </div>

            {/* ── Payments ── */}
            <div className={activeTab === 'payments' ? 'block' : 'hidden'}>
              <PaymentTab form={form} onChange={handleChange} />
            </div>

            {/* ── SMTP ── */}
            <div className={activeTab === 'smtp' ? 'block space-y-6' : 'hidden'}>
              <SectionHeader icon={Mail} title="SMTP Mail Settings" subtitle="Configure outgoing email for welcome mails, receipts, and password resets." />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InputField label="SMTP Host" name="smtpHost" value={form.smtpHost} onChange={handleChange} placeholder="smtp.gmail.com" />
                <InputField label="SMTP Port" name="smtpPort" type="number" value={form.smtpPort} onChange={handleChange} placeholder="587" />
                <InputField label="SMTP Username" name="smtpUser" value={form.smtpUser} onChange={handleChange} placeholder="your@email.com" />
                <InputField label="SMTP Password" name="smtpPass" type="password" value={form.smtpPass} onChange={handleChange} placeholder="••••••••" />
                <InputField label="From Name" name="emailFromName" value={form.emailFromName} onChange={handleChange} placeholder="FLIXHub Support" />
                <InputField label="From Email Address" name="emailFromAddress" type="email" value={form.emailFromAddress} onChange={handleChange} placeholder="noreply@flixhub.com" />
                <div className="md:col-span-2">
                  <InputField label="Email Footer Text" name="emailFooterText" value={form.emailFooterText} onChange={handleChange} placeholder="© 2025 FLIXHub. All rights reserved." />
                </div>
              </div>
              <Toggle label="SMTP Secure (TLS/SSL)" name="smtpSecure" value={form.smtpSecure} onChange={handleChange} hint="Enable for port 465 (SSL). Disable for port 587 (STARTTLS)." />

              {/* Test Email Card */}
              <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
                <Mail size={18} className="text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-white">Test Your Mail Config</p>
                  <p className="text-xs text-gray-400 mt-1">Save your settings first, then use <code className="bg-white/5 px-1 rounded font-mono">POST /api/test-email</code> from Postman with your admin token to send a test email.</p>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-6 mt-6 border-t border-white/5">
              <button type="submit" disabled={saving}
                className="flex items-center gap-2 bg-[#e50914] hover:bg-[#ff1e27] text-white font-semibold px-7 py-3 rounded-xl shadow-lg hover:shadow-red-600/20 active:scale-[0.98] transition-all text-sm disabled:opacity-50 cursor-pointer">
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>{activeTab === 'payments' ? 'Save Gateway Config' : 'Save Changes'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
