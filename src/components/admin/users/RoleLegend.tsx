import { Shield } from 'lucide-react';

export function RoleLegend() {
    return (
        <div className="mt-6 bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
                <div className="bg-amber-100 p-2 rounded-lg shrink-0">
                    <Shield className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                    <h4 className="text-amber-900 font-bold mb-1">Jerarquía de Roles</h4>
                    <p className="text-amber-800 text-sm mb-2">
                        Los usuarios pueden ser promovidos o degradados siguiendo esta jerarquía:
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                        <span className="px-3 py-1 bg-gray-100 text-gray-800 border border-gray-200 rounded-lg">Usuario</span>
                        <span className="text-amber-600">→</span>
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg">Voluntario</span>
                        <span className="text-amber-600">→</span>
                        <span className="px-3 py-1 bg-teal-100 text-teal-800 border border-teal-200 rounded-lg">Admin</span>
                        <span className="text-amber-600">→</span>
                        <span className="px-3 py-1 bg-purple-100 text-purple-800 border border-purple-200 rounded-lg">Admin Master</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
