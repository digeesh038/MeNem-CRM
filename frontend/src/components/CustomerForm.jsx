import { useState, useEffect } from 'react';
import { Save, Trash2, UserPlus, Award, TrendingUp, Calendar, AlertTriangle, CheckCircle, User, Mail, ArrowLeft } from 'lucide-react';

// One component, three modes:
//   'create' — blank form to add a new customer
//   'edit'   — pre-filled form to update an existing customer
//   'view'   — read-only profile page
export default function CustomerForm({ customer, mode, onSave, onCancel, onDelete }) {
  // Form state — holds all input values
  const [form, setForm] = useState({ name: '', company: '', email: '', phone: '', status: 'Active', notes: '', source: '', role: 'Manager', tier: 'Gold' });
  const [isSaving, setIsSaving] = useState(false);     // controls "Saving..." button state
  const [saveSuccess, setSaveSuccess] = useState(false); // briefly shows "Saved!" after save

  // When mode/customer changes, prefill the form (edit) or reset it (create)
  useEffect(() => {
    if (mode === 'edit' && customer) {
      setForm({ name: customer.name || '', company: customer.company || '', email: customer.email || '', phone: customer.phone || '', status: customer.status || 'Active', notes: customer.notes || '', source: customer.source || '', role: customer.role || 'Manager', tier: customer.tier || 'Gold' });
    } else {
      setForm({ name: '', company: '', email: '', phone: '', status: 'Active', notes: '', source: '', role: 'Standard Account', tier: 'Gold' });
    }
  }, [customer, mode]);

  // Helper that returns an onChange handler for a given field name
  // Usage: <input onChange={set('email')} />
  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  // Validate required fields, then call the parent's onSave callback
  const handleSubmit = (e) => {
    e?.preventDefault?.();
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) { alert('Full Name, Email, and Phone Number are required.'); return; }
    setIsSaving(true);
    // Simulated 800ms delay for a smoother UX — real save happens inside onSave()
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      // Build initials like "John Smith" → "JS" and send to parent
      onSave({ ...form, avatarInitials: form.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) });
      setTimeout(() => setSaveSuccess(false), 1000);
    }, 800);
  };

  // Confirm before deleting so accidental clicks don't wipe records
  const handleDelete = () => {
    if (!customer) return;
    if (confirm(`Delete ${customer.name}? This cannot be undone.`)) onDelete?.(customer._id);
  };

  const inputClass = "w-full border border-[#c3c6d6] rounded-lg px-4 py-2.5 text-sm focus:border-[#0052cc] focus:ring-1 focus:ring-[#0052cc] focus:outline-none transition-all text-[#191c1e]";
  const inputSmClass = "w-full border border-[#c3c6d6] rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-[#0052cc] focus:border-[#0052cc] focus:outline-none transition-all text-[#191c1e]";

  const SaveBtn = ({ className = '' }) => (
    <button type="button" onClick={handleSubmit} disabled={isSaving}
      className={`flex items-center gap-2 px-6 py-2 bg-[#003d9b] hover:bg-[#0052cc] text-white font-semibold text-xs rounded-lg shadow-sm transition-all active:scale-95 disabled:opacity-50 ${className}`}>
      {isSaving ? <><span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full inline-block"></span>Saving...</>
        : saveSuccess ? <><CheckCircle className="h-4 w-4" />Saved!</>
        : <><Save className="h-4 w-4" />{mode === 'edit' ? 'Save Changes' : 'Save Customer'}</>}
    </button>
  );

  if (mode === 'view' && customer) {
    const fields = [
      ['Full Name', customer.name],
      ['Company', customer.company || '—'],
      ['Email Address', customer.email],
      ['Phone Contact', customer.phone || '—'],
      ['Role', customer.role || '—'],
      ['Tier', customer.tier || '—'],
      ['Status', customer.status || '—'],
    ];
    return (
      <div className="animate-in fade-in slide-in-from-bottom-5 duration-200">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <nav className="flex items-center space-x-2 text-xs font-semibold text-[#737685] mb-2">
              <button onClick={onCancel} className="hover:text-[#0052cc] transition-colors uppercase">Customers</button>
              <span>/</span>
              <span className="text-[#0052cc] uppercase font-bold">Profile</span>
            </nav>
            <h2 className="text-2xl font-bold text-[#191c1e] tracking-tight">{customer.name}</h2>
          </div>
          <button onClick={onCancel}
            className="flex items-center gap-2 px-4 py-2 border border-[#c3c6d6] bg-white text-[#434654] hover:bg-[#f3f4f6] font-semibold text-xs rounded-lg transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Customers
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          <div className="lg:col-span-8">
            <div className="bg-white rounded-xl border border-[#c3c6d6]/40 shadow-sm p-4 md:p-6">
              <div className="flex items-center gap-3 mb-6 border-b border-[#edeef0] pb-4">
                <User className="h-5 w-5 text-[#003d9b]" />
                <h3 className="text-lg font-bold text-[#191c1e]">Customer Details</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {fields.map(([label, value]) => (
                  <div key={label} className={label === 'Notes' ? 'md:col-span-2' : ''}>
                    <p className="text-[10px] font-bold text-[#737685] uppercase tracking-wider mb-1">{label}</p>
                    <p className="text-sm font-semibold text-[#191c1e] bg-[#f8f9fb] px-3 py-2.5 rounded-lg border border-[#c3c6d6]/30">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#003d9b] text-white rounded-xl p-6 shadow-md relative overflow-hidden">
              <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full border-4 border-white/20 mb-4 shadow-md bg-[#dae2ff] text-[#003d9b] flex items-center justify-center font-extrabold text-2xl">
                  {customer.avatarInitials || customer.name.slice(0, 2).toUpperCase()}
                </div>
                <h4 className="text-lg font-bold">{customer.name}</h4>
                <p className="text-white/80 text-xs mb-4">{customer.role} @ {customer.company || 'Independent'}</p>
                <div className="flex gap-2.5">
                  <span className="px-3 py-1 bg-white/25 rounded-full text-[10px] font-bold flex items-center"><Award className="h-3 w-3 mr-1" />Tier: {customer.tier}</span>
                  <span className="px-3 py-1 bg-white/25 rounded-full text-[10px] font-bold flex items-center"><TrendingUp className="h-3 w-3 mr-1" />Status: {customer.status}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#c3c6d6]/40 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-[#edeef0] bg-[#f3f4f6]/30">
                <h3 className="font-bold text-[#434654] text-sm flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[#003d9b]" />Activity Timeline
                </h3>
              </div>
              <div className="p-6 space-y-4 relative">
                <div className="absolute left-[31px] top-6 bottom-6 w-0.5 bg-[#c3c6d6]/40"></div>
                {customer.activities?.length > 0 ? customer.activities.map((act, i) => (
                  <div key={i} className="flex gap-4 relative z-10">
                    <div className="flex-none w-8 h-8 rounded-full bg-[#bfd2fd] text-[#003d9b] flex items-center justify-center shadow-sm">
                      <Mail className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#191c1e]">{act.title}</p>
                      <p className="text-[10px] text-[#737685] font-semibold mt-0.5">{act.time}</p>
                      {act.description && <p className="text-xs text-[#434654] mt-1 italic bg-[#f3f4f6]/40 p-2 rounded">"{act.description}"</p>}
                    </div>
                  </div>
                )) : (
                  <div className="py-4 text-center text-xs text-[#737685]">
                    <AlertTriangle className="h-6 w-6 text-amber-500 mx-auto mb-2 opacity-70" />
                    No activities logged yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'create') {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-5 duration-200">
        <nav className="flex items-center space-x-2 text-xs font-semibold text-[#737685] mb-6">
          <button onClick={onCancel} className="hover:text-[#0052cc] transition-colors uppercase">Customers</button>
          <span>/</span>
          <span className="text-[#0052cc] uppercase font-bold">Create New Customer</span>
        </nav>

        <div className="max-w-[800px] mx-auto bg-white border border-[#c3c6d6]/40 rounded-xl shadow-sm overflow-hidden mb-8">
          <div className="px-4 md:px-8 py-4 md:py-5 border-b border-[#c3c6d6]/30 flex justify-between items-center bg-[#f3f4f6]/10">
            <div>
              <h2 className="text-lg md:text-xl font-bold text-[#003d9b]">Add New Customer</h2>
              <p className="text-xs text-[#434654] mt-1">Fill out the fields below to register a new client.</p>
            </div>
            <div className="h-10 w-10 md:h-12 md:w-12 bg-[#bfd2fd] text-[#003d9b] rounded-full flex items-center justify-center shrink-0">
              <UserPlus className="h-4 w-4 md:h-5 md:w-5" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-4 md:p-8 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#434654]">Full Name <span className="text-[#ba1a1a]">*</span></label>
                <input type="text" required value={form.name} onChange={set('name')} placeholder="e.g. John Smith" className={inputClass} />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#434654]">Company Name</label>
                <input type="text" value={form.company} onChange={set('company')} placeholder="e.g. Acme Corp" className={inputClass} />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#434654]">Email Address <span className="text-[#ba1a1a]">*</span></label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#737685] h-4 w-4" />
                  <input type="email" required value={form.email} onChange={set('email')} placeholder="john@company.com"
                    className="w-full border border-[#c3c6d6] rounded-lg pl-10 pr-4 py-2.5 text-sm focus:border-[#0052cc] focus:ring-1 focus:ring-[#0052cc] focus:outline-none transition-all text-[#191c1e]" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#434654]">Phone Number <span className="text-[#ba1a1a]">*</span></label>
                <input type="tel" required value={form.phone} onChange={set('phone')} placeholder="+1 (555) 000-0000" className={inputClass} />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#434654]">Role</label>
                <select value={form.role} onChange={set('role')} className={inputClass}>
                  <option value="CEO">CEO</option>
                  <option value="Manager">Manager</option>
                  <option value="Director">Director</option>
                  <option value="Sales Representative">Sales Representative</option>
                  <option value="Developer">Developer</option>
                  <option value="Consultant">Consultant</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#434654]">Tier</label>
                <select value={form.tier} onChange={set('tier')} className={inputClass}>
                  <option value="Platinum">Platinum</option>
                  <option value="Gold">Gold</option>
                  <option value="Silver">Silver</option>
                  <option value="Standard">Standard</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-[#c3c6d6]/25">
              <button type="button" onClick={onCancel} className="w-full sm:w-auto px-5 py-2.5 rounded-lg border border-[#737685] hover:bg-[#edeef0] text-[#384457] font-semibold text-xs transition-colors">Cancel</button>
              <SaveBtn className="w-full sm:w-auto justify-center" />
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-5 duration-200">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <nav className="flex items-center space-x-2 text-xs font-semibold text-[#737685] mb-2">
            <button onClick={onCancel} className="hover:text-[#0052cc] transition-colors uppercase">Customers</button>
            <span>/</span>
            <span className="text-[#0052cc] uppercase font-bold">Profile Editor</span>
          </nav>
          <h2 className="text-2xl font-bold text-[#191c1e] tracking-tight">Update: {customer?.name}</h2>
        </div>
        <div className="flex gap-2">
          {onDelete && (
            <button onClick={handleDelete} className="flex items-center gap-2 px-4 py-2 border border-[#ba1a1a] text-[#ba1a1a] hover:bg-[#ffdad6]/20 font-semibold text-xs rounded-lg transition-all">
              <Trash2 className="h-4 w-4" />Delete
            </button>
          )}
          <SaveBtn />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        <div className="lg:col-span-8 space-y-6">
          <section className="bg-white rounded-xl border border-[#c3c6d6]/40 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6 border-b border-[#edeef0] pb-4 text-[#003d9b]">
              <User className="h-5 w-5" />
              <h3 className="text-lg font-bold text-[#191c1e]">Core Identity</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[['Full Name', 'name', 'text'], ['Company', 'company', 'text'], ['Email Address', 'email', 'email'], ['Phone Contact', 'phone', 'tel']].map(([label, key, type]) => (
                <div key={key} className="space-y-1">
                  <label className="text-xs text-[#737685] font-bold block">{label}</label>
                  <input type={type} value={form[key]} onChange={set(key)} className={inputSmClass} />
                </div>
              ))}
              <div className="space-y-1">
                <label className="text-xs text-[#737685] font-bold block">Role</label>
                <select value={form.role} onChange={set('role')} className={inputSmClass}>
                  <option value="CEO">CEO</option>
                  <option value="Manager">Manager</option>
                  <option value="Director">Director</option>
                  <option value="Sales Representative">Sales Representative</option>
                  <option value="Developer">Developer</option>
                  <option value="Consultant">Consultant</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-[#737685] font-bold block">Tier</label>
                <select value={form.tier} onChange={set('tier')} className={inputSmClass}>
                  <option value="Platinum">Platinum</option>
                  <option value="Gold">Gold</option>
                  <option value="Silver">Silver</option>
                  <option value="Standard">Standard</option>
                </select>
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs text-[#737685] font-bold block">Status</label>
                <select value={form.status} onChange={set('status')} className={inputSmClass}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          </section>

        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#003d9b] text-white rounded-xl p-6 shadow-md relative overflow-hidden">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full border-4 border-white/20 mb-4 shadow-md bg-[#dae2ff] text-[#003d9b] flex items-center justify-center font-extrabold text-2xl">
                {form.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'AC'}
              </div>
              <h4 className="text-lg font-bold">{form.name || 'Customer Name'}</h4>
              <p className="text-white/80 text-xs mb-4">{form.role} @ {form.company || 'Independent'}</p>
              <div className="flex gap-2.5">
                <span className="px-3 py-1 bg-white/25 rounded-full text-[10px] font-bold flex items-center"><Award className="h-3 w-3 mr-1" />Tier: {form.tier}</span>
                <span className="px-3 py-1 bg-white/25 rounded-full text-[10px] font-bold flex items-center"><TrendingUp className="h-3 w-3 mr-1" />Status: {form.status}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#c3c6d6]/40 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-[#edeef0] bg-[#f3f4f6]/30">
              <h3 className="font-bold text-[#434654] text-sm flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#003d9b]" />Activity Timeline
              </h3>
            </div>
            <div className="p-6 space-y-4 relative">
              <div className="absolute left-[31px] top-6 bottom-6 w-0.5 bg-[#c3c6d6]/40"></div>
              {customer?.activities?.length > 0 ? customer.activities.map((act, i) => (
                <div key={act.id || i} className="flex gap-4 relative z-10">
                  <div className="flex-none w-8 h-8 rounded-full bg-[#bfd2fd] text-[#003d9b] flex items-center justify-center shadow-sm">
                    <Mail className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#191c1e]">{act.title}</p>
                    <p className="text-[10px] text-[#737685] font-semibold mt-0.5">{act.time}</p>
                    {act.description && <p className="text-xs text-[#434654] mt-1 italic bg-[#f3f4f6]/40 p-2 rounded">"{act.description}"</p>}
                  </div>
                </div>
              )) : (
                <div className="py-4 text-center text-xs text-[#737685]">
                  <AlertTriangle className="h-6 w-6 text-amber-500 mx-auto mb-2 opacity-70" />
                  No activities logged yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
