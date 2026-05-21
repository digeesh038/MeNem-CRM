import { Users, Zap, XCircle } from 'lucide-react';

// Three summary cards shown above the customer table:
//  - Total Customers
//  - Active Accounts
//  - Inactive Accounts
export default function StatsCards({ customers }) {
  // Quick counts derived from the customer list
  const activeCount = customers.filter(c => c.status === 'Active').length;
  const inactiveCount = customers.filter(c => c.status === 'Inactive').length;

  // Each card is defined as data — easier to add/remove cards later
  const cards = [
    {
      label: 'Total Customers',
      value: customers.length,
      icon: Users,
      iconBg: 'bg-blue-50',
      iconColor: 'text-[#003d9b]',
      accent: 'border-l-[#003d9b]',
      sub: 'All registered accounts',
    },
    {
      label: 'Active Accounts',
      value: activeCount,
      icon: Zap,
      iconBg: 'bg-green-50',
      iconColor: 'text-green-600',
      accent: 'border-l-green-500',
      sub: 'Currently active',
    },
    {
      label: 'Inactive Accounts',
      value: inactiveCount,
      icon: XCircle,
      iconBg: 'bg-red-50',
      iconColor: 'text-red-500',
      accent: 'border-l-red-400',
      sub: 'Needs attention',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
      {cards.map(({ label, value, icon: Icon, iconBg, iconColor, accent, sub }) => (
        <div key={label} className={`bg-white rounded-xl border border-[#e8eaed] border-l-4 ${accent} shadow-sm hover:shadow-md transition-all duration-200 p-5`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-[#737685] uppercase tracking-wider">{label}</p>
              <h3 className="text-3xl font-bold text-[#191c1e] mt-1.5 tracking-tight">{value}</h3>
              <p className="text-[11px] text-[#9ea3b0] mt-1">{sub}</p>
            </div>
            <div className={`p-2.5 rounded-xl ${iconBg}`}>
              <Icon className={`h-5 w-5 ${iconColor}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
