import { useState, useMemo, useEffect } from 'react';
import { ChevronDown, Edit2, Trash2, ChevronLeft, ChevronRight, AlertCircle, ArrowUpDown, X } from 'lucide-react';

// Customer list with filter, sort, search, and pagination.
// statusFilter and tierFilter are controlled by App.jsx so the Dashboard's
// stat-card clicks can update them.
export default function CustomerTable({
  customers, searchQuery,
  statusFilter = 'All', setStatusFilter,
  tierFilter = 'All', setTierFilter,
  onSelectCustomer, onEditCustomer, onDeleteCustomer
}) {
  // Only the sort + pagination stay local — filters live in the parent
  const [sortBy, setSortBy] = useState('Newest');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to page 1 whenever a filter changes (so user always sees their results)
  useEffect(() => { setCurrentPage(1); }, [statusFilter, tierFilter, searchQuery]);

  // Step 1: Apply status, tier, and search filters
  const filtered = useMemo(() => customers.filter(c => {
    if (statusFilter !== 'All' && c.status !== statusFilter) return false;

    // Premium = Platinum OR Gold. Any other tier value filters by that exact tier.
    if (tierFilter === 'Premium') {
      if (c.tier !== 'Platinum' && c.tier !== 'Gold') return false;
    } else if (tierFilter !== 'All' && c.tier !== tierFilter) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.company.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) || (c.role || '').toLowerCase().includes(q);
  }), [customers, statusFilter, tierFilter, searchQuery]);

  // Step 2: Apply the chosen sort to the filtered list
  const sorted = useMemo(() => {
    const list = [...filtered]; // clone so we don't mutate the original
    if (sortBy === 'Alphabetical') list.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === 'Company') list.sort((a, b) => a.company.localeCompare(b.company));
    else list.sort((a, b) => b._id.localeCompare(a._id)); // "Newest" — _id contains a timestamp
    return list;
  }, [filtered, sortBy]);

  // Step 3: Slice the sorted list into the current page
  const totalItems = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));
  const activePage = Math.min(currentPage, totalPages); // clamp page so it doesn't go past the end
  const paginated = useMemo(() => sorted.slice((activePage - 1) * rowsPerPage, activePage * rowsPerPage), [sorted, activePage, rowsPerPage]);

  // Indices shown in the "Showing X–Y of Z" text
  const startIndex = totalItems === 0 ? 0 : (activePage - 1) * rowsPerPage + 1;
  const endIndex = Math.min(activePage * rowsPerPage, totalItems);

  // Returns the right color classes for each tier badge
  const tierClass = (tier) => ({
    Platinum: 'bg-[#003d9b] text-white ring-1 ring-[#003d9b]/30',
    Gold: 'bg-amber-100 text-amber-700 ring-1 ring-amber-300',
    Silver: 'bg-cyan-100 text-cyan-700 ring-1 ring-cyan-300',
    Standard: 'bg-violet-100 text-violet-700 ring-1 ring-violet-300',
  }[tier] || 'bg-violet-100 text-violet-700');

  return (
    <div className="bg-white rounded-xl border border-[#c3c6d6]/40 shadow-sm overflow-hidden">
      {/* Top bar: status filter + sort dropdown + result count */}
      <div className="px-6 py-4 border-b border-[#c3c6d6]/30 bg-[#f3f4f6]/40 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative">
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="appearance-none bg-white border border-[#c3c6d6]/60 rounded-lg pl-3 pr-8 py-2 text-sm font-medium focus:ring-2 focus:ring-[#003d9b]/20 focus:outline-none cursor-pointer">
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#737685] h-4 w-4 pointer-events-none" />
          </div>

          {/* Tier filter pill — visible only when a tier filter is active (e.g. from Premium dashboard card) */}
          {tierFilter !== 'All' && (
            <button onClick={() => setTierFilter('All')}
              className="flex items-center gap-1.5 px-3 py-2 bg-purple-50 text-purple-700 text-xs font-bold rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors">
              <span>Tier: {tierFilter}</span>
              <X className="h-3 w-3" />
            </button>
          )}
          <div className="relative">
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              className="appearance-none bg-white border border-[#c3c6d6]/60 rounded-lg pl-3 pr-8 py-2 text-sm font-medium focus:ring-2 focus:ring-[#003d9b]/20 focus:outline-none cursor-pointer">
              <option value="Newest">Sort: Newest</option>
              <option value="Alphabetical">Alphabetical</option>
              <option value="Company">Company</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#737685] h-4 w-4 pointer-events-none" />
          </div>
        </div>
        <p className="text-xs font-semibold text-[#737685] uppercase tracking-widest">
          Showing {startIndex}–{endIndex} of {totalItems}
        </p>
      </div>

      {/* Table area — horizontal scroll on small screens so columns stay readable */}
      <div className="overflow-x-auto custom-scrollbar">
        {paginated.length === 0 ? (
          <div className="py-16 text-center">
            <AlertCircle className="h-10 w-10 text-[#737685]/60 mx-auto mb-3" />
            <p className="text-sm font-bold text-[#191c1e]">No Customers Found</p>
            <p className="text-xs text-[#434654] mt-1">Try a different search or filter.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f3f4f6]/30 border-b border-[#c3c6d6]/30">
                <th className="px-6 py-3 text-xs font-bold text-[#737685] uppercase tracking-wider">
                  <div className="flex items-center cursor-pointer select-none" onClick={() => setSortBy(sortBy === 'Alphabetical' ? 'Newest' : 'Alphabetical')}>
                    Name <ArrowUpDown className="ml-1.5 h-3.5 w-3.5" />
                  </div>
                </th>
                <th className="px-6 py-3 text-xs font-bold text-[#737685] uppercase tracking-wider">Company</th>
                <th className="px-6 py-3 text-xs font-bold text-[#737685] uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-xs font-bold text-[#737685] uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-xs font-bold text-[#737685] uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-xs font-bold text-[#737685] uppercase tracking-wider">Tier</th>
                <th className="px-6 py-3 text-xs font-bold text-[#737685] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c3c6d6]/20">
              {paginated.map(customer => (
                <tr key={customer._id} onClick={() => onSelectCustomer(customer)}
                  className="hover:bg-[#f8f9fb] transition-colors group cursor-pointer">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-9 w-9 rounded-full bg-[#bfd2fd] text-[#003d9b] font-extrabold text-xs mr-3 flex items-center justify-center border border-[#0052cc]/10 shadow-sm shrink-0">
                        {customer.avatarInitials || customer.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#191c1e]">{customer.name}</p>
                        <p className="text-[11px] text-[#434654]">{customer.role || '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-[#191c1e]">{customer.company || '—'}</td>
                  <td className="px-6 py-4 text-xs text-[#434654] font-mono">{customer.email}</td>
                  <td className="px-6 py-4 text-xs text-[#434654]">{customer.phone || '—'}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ring-1 ${
                      customer.status === 'Active'
                        ? 'bg-green-100 text-green-700 ring-green-300'
                        : 'bg-red-100 text-red-700 ring-red-300'}`}>
                      {customer.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${tierClass(customer.tier)}`}>
                      {customer.tier || 'Standard'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-end space-x-1 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => onEditCustomer(customer)} title="Edit" className="p-1.5 text-[#737685] hover:text-[#384457] hover:bg-[#edeef0] rounded-lg transition-colors"><Edit2 className="h-4 w-4" /></button>
                      <button onClick={() => onDeleteCustomer(customer._id)} className="p-1.5 text-[#737685] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/60 rounded-lg transition-colors"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer: rows-per-page selector + page navigation */}
      <div className="px-6 py-4 border-t border-[#c3c6d6]/30 bg-[#f3f4f6]/40 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <span className="text-xs text-[#434654] font-medium">Rows per page:</span>
          <div className="relative">
            <select value={rowsPerPage} onChange={e => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
              className="appearance-none bg-transparent border-none py-1 pl-2 pr-6 text-xs text-[#191c1e] font-bold focus:ring-0 cursor-pointer">
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 text-[#737685] h-3 w-3 pointer-events-none" />
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-xs text-[#434654] font-semibold">{startIndex}–{endIndex} of {totalItems}</span>
          <div className="flex space-x-1">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={activePage === 1}
              className="p-1.5 rounded-lg border border-[#c3c6d6]/30 text-[#434654] hover:bg-white transition-all disabled:opacity-30">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={activePage === totalPages}
              className="p-1.5 rounded-lg border border-[#c3c6d6]/30 text-[#434654] hover:bg-white transition-all disabled:opacity-30">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
