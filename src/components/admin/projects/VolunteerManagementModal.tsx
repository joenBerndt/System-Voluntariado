import { useState } from 'react';
import { Users, X, UserMinus, UserPlus } from 'lucide-react';

interface VolunteerManagementModalProps {
    project: any;
    onClose: () => void;
    assignments: any[];
    allVolunteers: any[];
    onAddVolunteer: (projectId: string, volunteerId: string) => void;
    onRemoveVolunteer: (assignmentId: string) => void;
}

export function VolunteerManagementModal({
    project,
    onClose,
    assignments,
    allVolunteers,
    onAddVolunteer,
    onRemoveVolunteer
}: VolunteerManagementModalProps) {
    const [selectedVolunteer, setSelectedVolunteer] = useState('');
    const [showAllVolunteersInAdmin, setShowAllVolunteersInAdmin] = useState(false);

    // Helper to get volunteers for this project
    const getVolunteersForProject = () => {
        return assignments
            .filter((assignment) => assignment.projectId === project.id)
            .map((assignment) => {
                const volunteer = allVolunteers.find((v) => v.id === assignment.volunteerId);
                return volunteer || { id: assignment.volunteerId, name: 'Voluntario no encontrado' };
            });
    };

    const assignedVolunteers = getVolunteersForProject();

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b-2 border-teal-200 bg-gradient-to-r from-teal-50 to-emerald-50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-teal-200 p-2 rounded-lg"><Users className="w-6 h-6 text-teal-800" /></div>
                            <div><h3 className="text-gray-900 font-bold">Gestión de Voluntarios</h3><p className="text-teal-800 text-sm font-semibold">{project.name}</p></div>
                        </div>
                        <button onClick={onClose} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
                    </div>
                </div>
                <div className="p-6 space-y-6">
                    <div>
                        <h4 className="text-gray-900 mb-3 font-semibold">Voluntarios Asignados</h4>
                        {assignedVolunteers.length > 0 ? (
                            <div className="space-y-2">
                                {(showAllVolunteersInAdmin ? assignedVolunteers : assignedVolunteers.slice(0, 6)).map((volunteer) => (
                                    <div key={volunteer.id} className="flex items-center justify-between p-3 bg-teal-50 border-2 border-teal-200 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-teal-200 rounded-full flex items-center justify-center font-bold text-teal-800">{volunteer.name?.charAt(0)}</div>
                                            <span className="text-gray-900 font-semibold">{volunteer.name}</span>
                                        </div>
                                        <button onClick={() => {
                                            // Find assignment ID
                                            const assignment = assignments.find(a => a.projectId === project.id && a.volunteerId === volunteer.id);
                                            if (assignment) onRemoveVolunteer(assignment.id);
                                        }} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 border border-red-200"><UserMinus className="w-4 h-4" /></button>
                                    </div>
                                ))}
                                {assignedVolunteers.length > 6 && !showAllVolunteersInAdmin && (
                                    <button
                                        onClick={() => setShowAllVolunteersInAdmin(true)}
                                        className="w-full py-2 bg-gray-50 text-emerald-600 font-semibold text-sm rounded-lg hover:bg-emerald-50 border-2 border-dashed border-emerald-200 transition-colors mt-2"
                                    >
                                        Ver todos ({assignedVolunteers.length} voluntarios)
                                    </button>
                                )}
                                {assignedVolunteers.length > 6 && showAllVolunteersInAdmin && (
                                    <button
                                        onClick={() => setShowAllVolunteersInAdmin(false)}
                                        className="w-full py-2 bg-gray-50 text-gray-500 font-semibold text-sm rounded-lg hover:bg-gray-100 border-2 border-dashed border-gray-200 transition-colors mt-2"
                                    >
                                        Ocultar
                                    </button>
                                )}
                            </div>
                        ) : <div className="text-center py-6 bg-gray-50 border-2 border-gray-200 rounded-lg text-gray-500">No hay voluntarios asignados</div>}
                    </div>
                    <div>
                        <h4 className="text-gray-900 mb-3 font-semibold">Agregar Voluntario</h4>
                        <div className="flex items-center gap-3">
                            <select value={selectedVolunteer} onChange={(e) => setSelectedVolunteer(e.target.value)} className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg">
                                <option value="">Selecciona un voluntario</option>
                                {allVolunteers.filter(v => !assignedVolunteers.find(ev => ev.id === v.id)).map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                            </select>
                            <button onClick={() => { if (selectedVolunteer) { onAddVolunteer(project.id, selectedVolunteer); setSelectedVolunteer(''); } }} disabled={!selectedVolunteer} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 shadow-md font-semibold flex items-center gap-2"><UserPlus className="w-4 h-4" /> Agregar</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
