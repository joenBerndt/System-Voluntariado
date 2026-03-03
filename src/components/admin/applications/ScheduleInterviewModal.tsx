import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface ScheduleInterviewModalProps {
    isOpen: boolean;
    application: any;
    onClose: () => void;
    onSchedule: (application: any, data: { date: string; time: string; location: string; notes: string }) => void;
}

export function ScheduleInterviewModal({
    isOpen,
    application,
    onClose,
    onSchedule
}: ScheduleInterviewModalProps) {
    const [interviewDate, setInterviewDate] = useState('');
    const [interviewTime, setInterviewTime] = useState('');
    const [interviewLocation, setInterviewLocation] = useState('');
    const [interviewNotes, setInterviewNotes] = useState('');

    useEffect(() => {
        if (isOpen) {
            // Reset or load existing data if re-scheduling? 
            // Current usage seems to always start empty or use application data?
            // Assuming new schedule for now, or could pre-fill if application has data.
            if (application) {
                setInterviewDate(application.interviewDate ? new Date(application.interviewDate).toISOString().split('T')[0] : '');
                setInterviewTime(application.interviewTime || '');
                setInterviewLocation(application.interviewLocation || '');
                setInterviewNotes('');
            }
        }
    }, [isOpen, application]);

    const handleSubmit = () => {
        onSchedule(application, {
            date: interviewDate,
            time: interviewTime,
            location: interviewLocation,
            notes: interviewNotes
        });
    };

    if (!isOpen || !application) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-xl w-full">
                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="text-gray-900">Programar Entrevista</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <p className="text-gray-700 mb-4">
                            Postulante: <span className="font-medium">{application.userName}</span>
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-700 mb-2">Fecha de Entrevista *</label>
                            <input
                                type="date"
                                value={interviewDate}
                                onChange={(e) => setInterviewDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 mb-2">Hora *</label>
                            <input
                                type="time"
                                value={interviewTime}
                                onChange={(e) => setInterviewTime(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-700 mb-2">Ubicación</label>
                        <input
                            type="text"
                            value={interviewLocation}
                            onChange={(e) => setInterviewLocation(e.target.value)}
                            placeholder="Ej: Oficina Principal, Sala de Reuniones 2"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 mb-2">Notas Adicionales</label>
                        <textarea
                            value={interviewNotes}
                            onChange={(e) => setInterviewNotes(e.target.value)}
                            rows={3}
                            placeholder="Instrucciones, documentos a traer, etc."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                    </div>
                </div>

                <div className="p-6 border-t border-gray-200 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!interviewDate || !interviewTime}
                        className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        Programar Entrevista
                    </button>
                </div>
            </div>
        </div>
    );
}
