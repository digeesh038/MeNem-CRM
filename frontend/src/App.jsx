import { useState, useEffect, useCallback, useRef } from 'react';
import { Routes, Route, useNavigate, useLocation, useParams, Navigate } from 'react-router-dom';
import { FileDown, Plus } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import Sidebar from './components/Sidebar';
import Header from './components/Header';
import StatsCards from './components/StatsCards';
import CustomerTable from './components/CustomerTable';
import CustomerForm from './components/CustomerForm';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import * as api from './api/customerApi';

// --- Route wrapper components (defined OUTSIDE App so they don't remount on each render) ---

// /customers — the main customer list page
function CustomersListPage({
  customers, loading, searchQuery,
  statusFilter, setStatusFilter, tierFilter, setTierFilter,
  onAddCustomer, onSelectCustomer, onEditCustomer, onDeleteCustomer, onExportPDF
}) {
  return (
    <div className="animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#003d9b]">Customer Directory</h2>
          <p className="text-[#434654] text-sm mt-1 font-medium">Manage your enterprise relationships and leads.</p>
        </div>
        <div className="flex space-x-3 w-full sm:w-auto shrink-0">
          <button onClick={onExportPDF}
            className="flex-1 sm:flex-none px-4 py-2 border border-[#c3c6d6] bg-white text-[#191c1e] text-xs font-bold rounded-lg hover:bg-[#f3f4f6]/60 transition-colors flex items-center justify-center shadow-sm">
            <FileDown className="mr-2 h-4 w-4 text-[#434654]" />Save as PDF
          </button>
          <button onClick={onAddCustomer}
            className="flex-1 sm:flex-none px-5 py-2 bg-[#003d9b] text-white text-xs font-bold rounded-lg hover:bg-[#0052cc] shadow-md transition-all flex items-center justify-center">
            <Plus className="mr-2 h-4 w-4" />Add Customer
          </button>
        </div>
      </div>

      <StatsCards customers={customers} />

      {loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="w-10 h-10 border-4 border-[#003d9b] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <CustomerTable
          customers={customers}
          searchQuery={searchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          tierFilter={tierFilter}
          setTierFilter={setTierFilter}
          onSelectCustomer={onSelectCustomer}
          onEditCustomer={onEditCustomer}
          onDeleteCustomer={onDeleteCustomer}
        />
      )}
    </div>
  );
}

// /customers/new, /customers/:id, /customers/:id/edit — uses URL params to find the customer
function CustomerFormRoute({ mode, customers, onSave, onDelete }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const customer = id ? customers.find(c => c._id === id) : undefined;

  // If the URL has an id that doesn't match any customer, bounce back to the list
  if (id && !customer) return <Navigate to="/customers" replace />;

  return (
    <CustomerForm
      mode={mode}
      customer={customer}
      onSave={(data) => onSave(data, id)}
      onCancel={() => navigate('/customers')}
      onDelete={mode === 'edit' ? onDelete : undefined}
    />
  );
}

// --- Main App component ---

export default function App() {
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ msg: '', type: '' });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tableStatusFilter, setTableStatusFilter] = useState('All');
  const [tableTierFilter, setTableTierFilter] = useState('All');
  const mainRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  // Figure out which tab is "active" from the URL — used to highlight the sidebar item
  const activeTab =
    location.pathname.startsWith('/customers') ? 'Customers' :
    location.pathname.startsWith('/settings') ? 'Settings' :
    'Dashboard';

  // Block clicks briefly when a suggestion is tapped (prevents mobile tap-through)
  const handleSuggestionSelect = useCallback(() => {
    if (mainRef.current) {
      mainRef.current.style.pointerEvents = 'none';
      setTimeout(() => { if (mainRef.current) mainRef.current.style.pointerEvents = ''; }, 600);
    }
  }, []);

  const notify = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: '' }), 3000);
  }, []);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getAllCustomers();
      setCustomers(res.data.data);
    } catch {
      notify('Failed to load customers.', 'error');
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  // --- Navigation helpers ---
  const goToCustomers = useCallback(() => navigate('/customers'), [navigate]);
  const goToAddCustomer = useCallback(() => navigate('/customers/new'), [navigate]);
  const goToViewCustomer = useCallback((c) => navigate(`/customers/${c._id}`), [navigate]);
  const goToEditCustomer = useCallback((c) => navigate(`/customers/${c._id}/edit`), [navigate]);

  // Sidebar tab change → navigate to the matching URL
  const handleTabChange = useCallback((tab) => {
    if (tab === 'Dashboard') navigate('/');
    else if (tab === 'Customers') navigate('/customers');
    else if (tab === 'Settings') navigate('/settings');
  }, [navigate]);

  // Dashboard stat card click → set filter and navigate to /customers
  const handleStatClick = useCallback(({ status = 'All', tier = 'All' }) => {
    setTableStatusFilter(status);
    setTableTierFilter(tier);
    navigate('/customers');
  }, [navigate]);

  // Save handler — id is undefined for create, set for edit
  const handleSave = useCallback(async (formData, id) => {
    try {
      if (id) {
        await api.updateCustomer(id, formData);
        notify('Customer updated successfully.');
      } else {
        await api.createCustomer(formData);
        notify('Customer added successfully.');
      }
      await fetchCustomers();
      navigate('/customers');
    } catch (err) {
      notify(err.response?.data?.message || 'Something went wrong.', 'error');
    }
  }, [fetchCustomers, navigate, notify]);

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm('Delete this customer? This cannot be undone.')) return;
    try {
      await api.deleteCustomer(id);
      notify('Customer deleted.');
      await fetchCustomers();
      navigate('/customers');
    } catch {
      notify('Failed to delete customer.', 'error');
    }
  }, [fetchCustomers, navigate, notify]);

  // PDF export
  const handleExportPDF = useCallback(() => {
    if (!customers.length) return;
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a3' });
    doc.setFontSize(16);
    doc.setTextColor(0, 61, 155);
    doc.text('MeNem CRM — Customer Directory', 14, 16);
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 22);
    autoTable(doc, {
      startY: 28,
      head: [['Name', 'Company', 'Email', 'Phone', 'Status', 'Role', 'Tier']],
      body: customers.map(c => [
        c.name ?? '', c.company ?? '', c.email ?? '', c.phone ?? '',
        c.status ?? '', c.role ?? '', c.tier ?? '',
      ]),
      headStyles: { fillColor: [0, 61, 155], fontSize: 8, fontStyle: 'bold' },
      bodyStyles: { fontSize: 8 },
      alternateRowStyles: { fillColor: [245, 247, 251] },
    });
    doc.save(`customers_${new Date().toISOString().slice(0, 10)}.pdf`);
  }, [customers]);

  return (
    <div className="bg-[#f8f9fb] min-h-screen text-[#191c1e]">
      <Sidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onAddNewCustomer={goToAddCustomer}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="md:ml-[240px] min-h-screen flex flex-col">
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          showSearch={location.pathname === '/customers'}
          onMenuToggle={() => setSidebarOpen(o => !o)}
          customers={customers}
          onSuggestionSelect={handleSuggestionSelect}
        />
        <main ref={mainRef} className="p-4 md:p-8 max-w-[1600px] w-full mx-auto flex-1">
          <Routes>
            <Route path="/" element={
              <Dashboard
                customers={customers}
                onViewCustomers={goToCustomers}
                onAddCustomers={goToAddCustomer}
                onStatClick={handleStatClick}
              />
            } />
            <Route path="/customers" element={
              <CustomersListPage
                customers={customers}
                loading={loading}
                searchQuery={searchQuery}
                statusFilter={tableStatusFilter}
                setStatusFilter={setTableStatusFilter}
                tierFilter={tableTierFilter}
                setTierFilter={setTableTierFilter}
                onAddCustomer={goToAddCustomer}
                onSelectCustomer={goToViewCustomer}
                onEditCustomer={goToEditCustomer}
                onDeleteCustomer={handleDelete}
                onExportPDF={handleExportPDF}
              />
            } />
            <Route path="/customers/new" element={
              <CustomerFormRoute mode="create" customers={customers} onSave={handleSave} />
            } />
            <Route path="/customers/:id" element={
              <CustomerFormRoute mode="view" customers={customers} onSave={handleSave} />
            } />
            <Route path="/customers/:id/edit" element={
              <CustomerFormRoute mode="edit" customers={customers} onSave={handleSave} onDelete={handleDelete} />
            } />
            <Route path="/settings" element={<Settings />} />
            {/* Catch-all — redirects unknown URLs back to the dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      {toast.msg && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${
          toast.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'
        }`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
