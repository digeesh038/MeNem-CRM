import { useMemo, useCallback } from 'react';
import { Users, CheckCircle2, XCircle, Crown, ArrowRight, TrendingUp, Clock, Plus, BarChart3 } from 'lucide-react';

// Main dashboard page — shown when "Dashboard" tab is active.
// Displays: welcome banner, 4 stat cards, tier distribution, recent activity feed.
export default function Dashboard({ customers, onViewCustomers, onAddCustomers, onStatClick }) {
  // --- Derived stats (recalculated when customers change) ---
  const activeCount = useMemo(() => customers.filter(c => c.status === 'Active').length, [customers]);
  const inactiveCount = useMemo(() => customers.filter(c => c.status === 'Inactive').length, [customers]);

  // Premium = Platinum OR Gold tier customers
  const premiumCount = useMemo(() =>
    customers.filter(c => c.tier === 'Platinum' || c.tier === 'Gold').length,
    [customers]
  );

  // Flatten activities from every customer, sort newest first, take top 6
  const allActivities = useMemo(() =>
    customers.flatMap(c => (c.activities || []).map(act => ({ ...act, customerName: c.name })))
      .sort((a, b) => b.time?.localeCompare(a.time || '') || 0)
      .slice(0, 6),
    [customers]
  );

  // Count customers per tier — used for the tier distribution bars
  const tierCounts = useMemo(() => ({
    Platinum: customers.filter(c => c.tier === 'Platinum').length,
    Gold: customers.filter(c => c.tier === 'Gold').length,
    Silver: customers.filter(c => c.tier === 'Silver').length,
    Standard: customers.filter(c => c.tier === 'Standard').length,
  }), [customers]);

  // Memoized button handlers (prevents unnecessary re-renders of child components)
  const handleViewCustomers = useCallback(() => onViewCustomers(), [onViewCustomers]);
  const handleAddCustomers = useCallback(() => onAddCustomers(), [onAddCustomers]);

  // Tier rows config — colors + counts for the progress bars
  const tiers = [
    { label: 'Platinum', count: tierCounts.Platinum, bar: 'bg-gradient-to-r from-[#003d9b] to-[#0052cc]', dot: 'bg-[#003d9b]', text: 'text-[#003d9b]' },
    { label: 'Gold', count: tierCounts.Gold, bar: 'bg-gradient-to-r from-amber-400 to-yellow-300', dot: 'bg-amber-400', text: 'text-amber-600' },
    { label: 'Silver', count: tierCounts.Silver, bar: 'bg-gradient-to-r from-slate-400 to-slate-300', dot: 'bg-slate-400', text: 'text-slate-500' },
    { label: 'Standard', count: tierCounts.Standard, bar: 'bg-gradient-to-r from-slate-300 to-slate-200', dot: 'bg-slate-300', text: 'text-slate-400' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">

      {/* Welcome Banner with gradient and decorative orbs */}
      <div className="relative overflow-hidden rounded-2xl text-white"
        style={{ background: 'linear-gradient(135deg, #020f24 0%, #041b3c 40%, #073272 100%)' }}>
        <div className="absolute -top-16 -right-16 w-72 h-72 bg-[#0052cc]/25 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 w-80 h-40 bg-[#003d9b]/20 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute top-4 right-1/4 w-3 h-3 bg-white/20 rounded-full"></div>
        <div className="absolute top-12 right-1/3 w-1.5 h-1.5 bg-white/15 rounded-full"></div>
        <div className="absolute bottom-6 right-1/4 w-2 h-2 bg-blue-300/30 rounded-full"></div>

        <div className="relative z-10 px-5 py-6 md:px-8 md:py-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold text-blue-300 uppercase tracking-[0.2em] bg-blue-500/20 px-2.5 py-1 rounded-full border border-blue-400/20">
                Dashboard
              </span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight">Welcome back, Admin 👋</h2>
            <p className="text-blue-200/80 text-sm mt-2">
              You have <span className="text-white font-bold">{activeCount} active</span> customer{activeCount !== 1 ? 's' : ''} · <span className="text-white font-bold">{customers.length} total</span> in system
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <button onClick={handleViewCustomers}
              className="px-4 py-2.5 text-xs font-semibold rounded-xl border border-white/20 text-white/80 hover:bg-white/10 hover:text-white transition-all backdrop-blur-sm">
              View Directory
            </button>
            <button onClick={handleAddCustomers}
              className="px-5 py-2.5 text-xs font-bold rounded-xl text-white flex items-center gap-2 transition-all shadow-lg shadow-blue-900/40 hover:shadow-blue-900/60 hover:scale-[1.02]"
              style={{ background: 'linear-gradient(135deg, #0052cc, #0040a2)' }}>
              <Plus className="h-4 w-4" /> Add Customer <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Stat cards — clicking each one filters the customer list accordingly */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          {
            label: 'Total Customers', value: customers.length, icon: Users,
            gradient: 'from-[#003d9b] to-[#0052cc]', light: 'bg-blue-50', iconColor: 'text-[#003d9b]',
            sub: 'All accounts', badge: `+${customers.length}`,
            filter: { status: 'All', tier: 'All' }, // show everyone
          },
          {
            label: 'Active Accounts', value: activeCount, icon: CheckCircle2,
            gradient: 'from-emerald-500 to-green-400', light: 'bg-emerald-50', iconColor: 'text-emerald-600',
            sub: 'Currently active', badge: 'Live',
            filter: { status: 'Active', tier: 'All' }, // only active
          },
          {
            label: 'Inactive Accounts', value: inactiveCount, icon: XCircle,
            gradient: 'from-red-500 to-red-400', light: 'bg-red-50', iconColor: 'text-red-600',
            sub: 'Needs attention', badge: 'Review',
            filter: { status: 'Inactive', tier: 'All' }, // only inactive
          },
          {
            label: 'Premium Accounts', value: premiumCount, icon: Crown,
            gradient: 'from-purple-500 to-violet-400', light: 'bg-purple-50', iconColor: 'text-purple-600',
            sub: 'Platinum & Gold tier', badge: 'Top',
            filter: { status: 'All', tier: 'Premium' }, // platinum + gold
          },
        ].map(({ label, value, icon: Icon, gradient, light, iconColor, sub, badge, filter }) => (
          <button key={label} onClick={() => onStatClick(filter)}
            className="bg-white rounded-2xl border border-[#e8eaed] shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden group text-left cursor-pointer">
            <div className={`h-1 w-full bg-gradient-to-r ${gradient}`}></div>
            <div className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-2.5 rounded-xl ${light} group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className={`h-5 w-5 ${iconColor}`} />
                </div>
                <span className="text-[10px] font-bold text-[#9ea3b0] bg-[#f8f9fb] px-2 py-1 rounded-full">{badge}</span>
              </div>
              <h3 className="text-3xl font-extrabold text-[#191c1e] tracking-tight">{value}</h3>
              <p className="text-xs font-bold text-[#434654] uppercase tracking-wider mt-1">{label}</p>
              <p className="text-[11px] text-[#737685] font-medium mt-0.5">{sub}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Bottom row: Tier Distribution (left) + Activity Feed (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Tier Distribution — shows what % of customers are in each tier */}
        <div className="col-span-12 lg:col-span-7 bg-white rounded-2xl border border-[#e8eaed] shadow-sm p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="h-4 w-4 text-[#003d9b]" />
                <h3 className="font-bold text-[#191c1e] text-sm">Tier Distribution</h3>
              </div>
              <p className="text-xs text-[#9ea3b0]">Customer breakdown by account tier</p>
            </div>
            <span className="text-xs font-bold text-[#003d9b] bg-blue-50 px-3 py-1.5 rounded-full">
              {customers.length} total
            </span>
          </div>

          <div className="space-y-5">
            {tiers.map(({ label, count, bar, dot, text }) => {
              // Percentage = (this tier's count / total customers) * 100
              const pct = customers.length ? Math.round((count / customers.length) * 100) : 0;
              return (
                <div key={label}>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${dot}`}></div>
                      <span className={`text-xs font-bold ${text}`}>{label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-[#9ea3b0]">{count} account{count !== 1 ? 's' : ''}</span>
                      <span className="text-xs font-bold text-[#191c1e] w-9 text-right">{pct}%</span>
                    </div>
                  </div>
                  <div className="h-2.5 w-full bg-[#f3f4f6] rounded-full overflow-hidden">
                    {/* Min width 3% so tiny bars are still visible */}
                    <div className={`h-full ${bar} rounded-full transition-all duration-700 ease-out`}
                      style={{ width: `${Math.max(pct, pct > 0 ? 3 : 0)}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty state when no customers exist yet */}
          {customers.length === 0 && (
            <div className="text-center py-8 text-[#9ea3b0]">
              <BarChart3 className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="text-xs">No data yet — add your first customer</p>
            </div>
          )}
        </div>

        {/* Activity Feed — most recent activities across all customers */}
        <div className="col-span-12 lg:col-span-5 bg-white rounded-2xl border border-[#e8eaed] shadow-sm p-6 flex flex-col">
          <div className="flex justify-between items-start mb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-[#003d9b]" />
                <h3 className="font-bold text-[#191c1e] text-sm">Recent Activity</h3>
              </div>
              <p className="text-xs text-[#9ea3b0]">Latest customer interactions</p>
            </div>
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-100">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> LIVE
            </span>
          </div>

          <div className="flex-1 space-y-2.5 overflow-y-auto custom-scrollbar max-h-[280px] pr-1">
            {allActivities.length > 0 ? allActivities.map((act, idx) => (
              <div key={idx} className="flex gap-3 p-3 rounded-xl hover:bg-[#f8f9fb] transition-colors border border-transparent hover:border-[#e8eaed] group">
                <div className="h-9 w-9 rounded-full flex items-center justify-center text-[11px] font-extrabold shrink-0 text-white shadow-sm"
                  style={{ background: 'linear-gradient(135deg, #003d9b, #0052cc)' }}>
                  {act.customerName?.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-bold text-[#191c1e] truncate">{act.customerName}</p>
                    <span className="text-[9px] font-bold text-[#9ea3b0] bg-[#f3f4f6] px-1.5 py-0.5 rounded shrink-0 uppercase">{act.type}</span>
                  </div>
                  <p className="text-[11px] text-[#434654] mt-0.5 truncate">{act.title}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3 text-[#b0b5c0]" />
                    <p className="text-[10px] text-[#b0b5c0]">{act.time}</p>
                  </div>
                </div>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center py-12 text-[#9ea3b0]">
                <TrendingUp className="h-10 w-10 mb-3 opacity-20" />
                <p className="text-xs font-semibold">No activities yet</p>
                <p className="text-[11px] mt-1">Add a customer to get started</p>
              </div>
            )}
          </div>

          <button onClick={handleViewCustomers}
            className="mt-4 w-full py-2.5 text-xs font-bold rounded-xl transition-all hover:scale-[1.01]"
            style={{ background: 'linear-gradient(135deg, #f0f4ff, #e8eeff)', color: '#003d9b' }}>
            View All Customers →
          </button>
        </div>
      </div>
    </div>
  );
}
