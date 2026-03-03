import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface ProjectFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    project?: any; // If editing
    onSave: (projectData: any) => Promise<void>;
    areas: any[];
}

export function ProjectFormModal({ isOpen, onClose, project, onSave, areas }: ProjectFormModalProps) {
    const [formData, setFormData] = useState<any>({
        name: '',
        description: '',
        areaId: '',
        startDate: '',
        endDate: '',
        objectives: '',
        status: 'activo',
        published: false,
        managers: [],
    });

    useEffect(() => {
        if (project) {
            setFormData({ ...project });
        } else {
            setFormData({
                name: '',
                description: '',
                areaId: '',
                startDate: '',
                endDate: '',
                objectives: '',
                status: 'activo',
                published: false,
                managers: [],
            });
        }
    }, [project, isOpen]); // Reset/Update on open

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (formData.startDate && formData.endDate) {
            if (new Date(formData.startDate) > new Date(formData.endDate)) {
                alert('La fecha de inicio no puede ser posterior a la fecha de fin.');
                return;
            }
        }

        onSave(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b-2 border-gray-200 bg-gradient-to-r from-emerald-50 to-teal-50">
                    <h3 className="text-gray-900 font-bold text-lg">
                        {project?.id ? 'Editar Proyecto' : 'Nuevo Proyecto'}
                    </h3>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-gray-700 mb-2 font-semibold">Nombre del Proyecto *</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            placeholder="Ej: Conservación de Especies Amazónicas"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 mb-2 font-semibold">Descripción *</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={4}
                            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            placeholder="Describe el proyecto..."
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 mb-2 font-semibold">Área *</label>
                        <select
                            value={formData.areaId}
                            onChange={(e) => setFormData({ ...formData, areaId: e.target.value })}
                            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                            <option value="">Selecciona un área</option>
                            {areas.map((area) => <option key={area.id} value={area.id}>{area.name}</option>)}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-700 mb-2 font-semibold">Fecha de Inicio *</label>
                            <input
                                type="date"
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-2 font-semibold">Fecha de Fin *</label>
                            <input
                                type="date"
                                value={formData.endDate}
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-700 mb-2 font-semibold">Objetivos</label>
                        <textarea
                            value={formData.objectives}
                            onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            placeholder="Objetivos del proyecto..."
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 mb-2 font-semibold">Estado</label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                            <option value="activo">Activo</option>
                            <option value="inactivo">Inactivo</option>
                            <option value="finalizado">Finalizado</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-lg">
                        <input
                            type="checkbox"
                            id="published"
                            checked={formData.published || false}
                            onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                            className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                        />
                        <label htmlFor="published" className="text-gray-700 cursor-pointer">
                            <span className="font-bold text-purple-900">Publicar en el Landing</span>
                            <p className="text-sm text-purple-800">Al publicar, el proyecto será visible para usuarios públicos</p>
                        </label>
                    </div>
                </div>

                <div className="p-6 border-t-2 border-gray-200 flex gap-3 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!formData.name || !formData.description || !formData.areaId}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
                    >
                        Guardar Proyecto
                    </button>
                </div>
            </div>
        </div>
    );
}
