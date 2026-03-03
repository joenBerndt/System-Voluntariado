import { useState } from 'react';
import { Crown, X, UserMinus, UserPlus } from 'lucide-react';

interface ManagerManagementModalProps {
    project: any;
    onClose: () => void;
    eligibleManagers: any[];
    users: any[];
    onAddManager: (managerId: string) => void;
    onRemoveManager: (managerId: string) => void;
}

export function ManagerManagementModal({
    project,
    onClose,
    eligibleManagers,
    users,
    onAddManager,
    onRemoveManager
}: ManagerManagementModalProps) {
    const [selectedManager, setSelectedManager] = useState('');

    const getManagersForProject = (proj: any) => {
        if (!proj.managers || !Array.isArray(proj.managers)) return [];
        return proj.managers.map((managerId: string) => {
            const manager = users.find((u) => u.id === managerId);
            return manager || { id: managerId, name: 'Usuario no encontrado', role: 'unknown' };
        });
    };

    const currentManagers = getManagersForProject(project);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b-2 border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-amber-200 p-2 rounded-lg"><Crown className="w-6 h-6 text-amber-800" /></div>
                            <div><h3 className="text-gray-900 font-bold">Gestión de Encargados</h3><p className="text-amber-800 text-sm font-semibold">{project.name}</p></div>
                        </div>
                        <button onClick={onClose} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
                    </div>
                </div>
                <div className="p-6 space-y-6">
                    {/* Existing Managers */}
                    <div>
                        <h4 className="text-gray-900 mb-3 font-semibold">Encargados Actuales</h4>
                        {currentManagers.length > 0 ? (
                            <div className="space-y-2">
                                {currentManagers.map((manager: any) => (
                                    <div key={manager.id} className="flex items-center justify-between p-3 bg-amber-50 border-2 border-amber-200 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-amber-200 rounded-full flex items-center justify-center font-bold text-amber-800">{manager.name?.charAt(0)}</div>
                                            <span className="text-gray-900 font-semibold">{manager.name} ({manager.role})</span>
                                        </div>
                                        <button onClick={() => onRemoveManager(manager.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 border border-red-200"><UserMinus className="w-4 h-4" /></button>
                                    </div>
                                ))}
                            </div>
                        ) : <div className="text-center py-6 bg-gray-50 border-2 border-gray-200 rounded-lg text-gray-500">No hay encargados asignados</div>}
                    </div>
                    {/* Add Manager */}
                    <div>
                        <h4 className="text-gray-900 mb-3 font-semibold">Agregar Encargado</h4>
                        <div className="flex items-center gap-3">
                            <select value={selectedManager} onChange={(e) => setSelectedManager(e.target.value)} className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg">
                                <option value="">Selecciona un encargado</option>
                                {eligibleManagers.filter(v => !(project.managers || []).includes(v.id)).map(person => <option key={person.id} value={person.id}>{person.name} - {person.role}</option>)}
                            </select>
                            <button onClick={() => { if (selectedManager) { onAddManager(selectedManager); setSelectedManager(''); } }} disabled={!selectedManager} className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 shadow-md font-semibold flex items-center gap-2"><UserPlus className="w-4 h-4" /> Agregar</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
