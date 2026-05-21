import { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Bell, HelpCircle, CheckCircle, Info, User, Mail, Shield, Menu } from 'lucide-react';
import { INITIAL_USER } from '../constants/user';

// Top bar — search box, notifications, help, profile dropdown, and the mobile hamburger
export default function Header({ searchQuery, onSearchChange, showSearch = true, onMenuToggle, customers = [], onSuggestionSelect }) {
  // Which dropdown is open (only one at a time)
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const ref = useRef(null);        // wraps the right-side icons (used for click-outside)
  const searchRef = useRef(null);  // wraps the search input + suggestions

  // Build the live suggestion list as the user types.
  // Limited to 5 matches so the dropdown stays small.
  const suggestions = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.length < 1) return [];
    const q = searchQuery.toLowerCase();
    return customers
      .filter(c =>
        c.name?.toLowerCase().includes(q) ||
        c.company?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q)
      )
      .slice(0, 5);
  }, [searchQuery, customers]);

  // Close any open dropdown when the user clicks somewhere else
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setShowNotifications(false);
        setShowHelp(false);
        setShowProfile(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Hardcoded demo notifications shown in the bell dropdown
  const notifications = [
    { id: 1, title: 'Customer record synced', desc: 'Database synchronized successfully', type: 'success' },
    { id: 2, title: 'Lead Status Update', desc: 'New customer requested support', type: 'info' },
  ];

  return (
    <header className="h-16 px-4 md:px-8 bg-white border-b border-[#c3c6d6]/40 flex justify-between items-center sticky top-0 z-40 shadow-sm">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Hamburger — mobile only */}
        <button onClick={onMenuToggle}
          className="md:hidden p-2 text-[#434654] hover:bg-[#f3f4f6] rounded-full transition-all shrink-0">
          <Menu className="h-5 w-5" />
        </button>

        {showSearch && (
          <div className="relative w-full max-w-md" ref={searchRef}>
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#737685] h-4 w-4 z-10 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { onSearchChange(e.target.value); setShowSuggestions(true); }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 500)}
              placeholder="Search customers, company, or status..."
              className="w-full bg-[#f3f4f6] border border-[#c3c6d6]/30 hover:border-[#c3c6d6]/60 rounded-full py-2 pl-10 pr-4 text-sm placeholder-[#737685] text-[#191c1e] focus:outline-none focus:ring-2 focus:ring-[#003d9b]/20 focus:bg-white transition-all"
            />
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#c3c6d6]/50 rounded-xl shadow-xl z-50 overflow-hidden">
                {suggestions.map(c => (
                  <button key={c._id}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => { onSearchChange(c.name); setShowSuggestions(false); onSuggestionSelect?.(); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#f3f4f6] transition-colors text-left">
                    <div className="h-7 w-7 rounded-full bg-[#bfd2fd] text-[#003d9b] font-bold text-[10px] flex items-center justify-center shrink-0">
                      {c.avatarInitials || c.name?.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[#191c1e] truncate">{c.name}</p>
                      <p className="text-[10px] text-[#737685] truncate">{c.company} · {c.status}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center space-x-3 md:space-x-5 shrink-0" ref={ref}>
        {/* Notifications */}
        <div className="relative">
          <button onClick={() => { setShowNotifications(!showNotifications); setShowHelp(false); setShowProfile(false); }}
            className="p-2 text-[#434654] hover:bg-[#f3f4f6] rounded-full transition-all relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-[#ba1a1a] rounded-full ring-2 ring-white"></span>
          </button>
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-72 md:w-80 bg-white border border-[#c3c6d6]/50 rounded-xl shadow-xl py-2 z-50">
              <div className="px-4 py-2 border-b border-[#edeef0] flex justify-between items-center">
                <span className="font-semibold text-sm text-[#191c1e]">Notifications</span>
                <span className="text-xs bg-[#dae2ff] text-[#001848] px-2 py-0.5 rounded-full font-bold">New</span>
              </div>
              {notifications.map(item => (
                <div key={item.id} className="p-3 hover:bg-[#f3f4f6] flex gap-2.5">
                  {item.type === 'success' ? <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" /> : <Info className="h-5 w-5 text-[#0052cc] shrink-0 mt-0.5" />}
                  <div>
                    <p className="text-xs font-semibold text-[#191c1e]">{item.title}</p>
                    <p className="text-[11px] text-[#434654] mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Help — hidden on small mobile */}
        <div className="relative hidden sm:block">
          <button onClick={() => { setShowHelp(!showHelp); setShowNotifications(false); setShowProfile(false); }}
            className="p-2 text-[#434654] hover:bg-[#f3f4f6] rounded-full transition-all">
            <HelpCircle className="h-5 w-5" />
          </button>
          {showHelp && (
            <div className="absolute right-0 mt-3 w-72 bg-white border border-[#c3c6d6]/50 rounded-xl shadow-xl p-4 z-50">
              <h4 className="font-semibold text-sm text-[#191c1e] mb-2">Help & Guidelines</h4>
              <p className="text-xs text-[#434654] leading-relaxed">Use the sidebar to navigate between views. Click any customer row to view their profile.</p>
            </div>
          )}
        </div>

        <div className="h-8 w-[1px] bg-[#c3c6d6]/50 mx-1 hidden sm:block"></div>

        {/* Profile */}
        <div className="relative">
          <button onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); setShowHelp(false); }}
            className="flex items-center cursor-pointer hover:bg-[#f3f4f6] rounded-xl px-2 py-1 transition-all">
            <div className="text-right mr-3 hidden md:block">
              <p className="text-sm font-semibold text-[#191c1e]">{INITIAL_USER.name}</p>
              <p className="text-[11px] text-[#434654]">{INITIAL_USER.title}</p>
            </div>
            <div className="h-9 w-9 rounded-full bg-[#003d9b] text-white flex items-center justify-center font-bold text-sm border border-[#c3c6d6]/50 shadow-sm">
              MA
            </div>
          </button>

          {showProfile && (
            <div className="absolute right-0 mt-3 w-72 bg-white border border-[#c3c6d6]/50 rounded-xl shadow-xl z-50 overflow-hidden">
              <div className="bg-[#003d9b] px-4 py-4 flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-[#dae2ff] text-[#003d9b] flex items-center justify-center font-bold text-lg shrink-0">MA</div>
                <div>
                  <p className="text-sm font-bold text-white">{INITIAL_USER.name}</p>
                  <p className="text-[11px] text-white/70">{INITIAL_USER.title}</p>
                </div>
              </div>
              <div className="p-3 space-y-1">
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#f8f9fb]">
                  <Mail className="h-4 w-4 text-[#003d9b]" />
                  <div>
                    <p className="text-[10px] text-[#737685] font-semibold uppercase">Email</p>
                    <p className="text-xs font-semibold text-[#191c1e]">{INITIAL_USER.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#f8f9fb]">
                  <User className="h-4 w-4 text-[#003d9b]" />
                  <div>
                    <p className="text-[10px] text-[#737685] font-semibold uppercase">Role</p>
                    <p className="text-xs font-semibold text-[#191c1e]">CRM Administrator</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#f8f9fb]">
                  <Shield className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-[10px] text-[#737685] font-semibold uppercase">Access Level</p>
                    <p className="text-xs font-semibold text-green-700">Full Access</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
