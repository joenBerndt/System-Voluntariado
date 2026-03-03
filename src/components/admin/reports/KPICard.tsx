import { ArrowUp, ArrowDown, HelpCircle } from 'lucide-react';

interface KPICardProps {
    label: string;
    value: string | number;
    icon: any;
    color: string;
    trend?: string;
    trendUp?: boolean;
}

export const KPICard = ({ label, value, icon: Icon, color, trend, trendUp }: KPICardProps) => (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
        <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}-50 rounded-bl-full opacity-50 -mr-4 -mt-4 transition-transform group-hover:scale-110`} />
        <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl bg-${color}-50 text-${color}-600 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                </div>
                {trend && (
                    <span className={`inline-flex items-center text-xs font-semibold px-2 py-1 rounded-full ${trendUp ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-500'}`}>
                        {trend}
                    </span>
                )}
            </div>
            <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-1 tracking-tight">{value}</h3>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{label}</p>
            </div>
        </div>
    </div>
);
