import { LayoutDashboard, Users, Settings, Plus, X } from 'lucide-react';

// The three pages available from the sidebar
const menuItems = [
  { id: 'Dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'Customers', label: 'Customers', icon: Users },
  { id: 'Settings', label: 'Settings', icon: Settings },
];

// Sidebar = fixed nav on desktop, slide-in drawer on mobile.
// isOpen + onClose control the mobile drawer visibility.
export default function Sidebar({ activeTab, onTabChange, onAddNewCustomer, isOpen, onClose }) {
  // On mobile we close the drawer after the user picks an item
  const handleNav = (id) => { onTabChange(id); onClose?.(); };
  const handleAdd = () => { onAddNewCustomer(); onClose?.(); };

  return (
    <>
      {/* Dark overlay behind the drawer on mobile — tapping it closes the sidebar */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed left-0 top-0 h-full w-[240px] flex flex-col z-50 transition-transform duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
        style={{ background: 'linear-gradient(180deg, #041b3c 0%, #0a2a52 100%)' }}>

        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="https://www.menem.in/images/logo.png" alt="MeNem CRM" className="h-8 w-auto object-contain" style={{ mixBlendMode: 'screen' }} />
            <div>
              <h1 className="text-[15px] font-bold text-white tracking-tight leading-none">MeNem CRM</h1>
              <p className="text-[#9bb8db] text-[9px] uppercase tracking-[0.2em] mt-0.5">Enterprise Suite</p>
            </div>
          </div>
          <button onClick={onClose} className="md:hidden text-[#7a9cc4] hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav + Add Button grouped */}
        <div className="px-4 py-5 space-y-1">
          {menuItems.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <button key={id} onClick={() => handleNav(id)}
                className={`w-full flex items-center px-3 py-2.5 rounded-xl transition-all duration-150 text-left group ${
                  isActive
                    ? 'bg-white/15 text-white shadow-sm font-semibold'
                    : 'text-[#c5d6ed] hover:text-white hover:bg-white/10'
                }`}>
                <div className={`p-1.5 rounded-lg mr-3 transition-all ${isActive ? 'bg-[#0052cc] shadow-md' : 'group-hover:bg-white/10'}`}>
                  <Icon className={`h-4 w-4 ${isActive ? 'text-white' : ''}`} />
                </div>
                <span className="text-sm font-semibold">{label}</span>
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#5b9cf6]"></div>}
              </button>
            );
          })}

          <div className="pt-3">
            <button onClick={handleAdd}
              className="w-full py-2.5 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 transition-all shadow-lg"
              style={{ background: 'linear-gradient(135deg, #0052cc, #0040a2)' }}>
              <Plus className="h-4 w-4" /> Add New Customer
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
