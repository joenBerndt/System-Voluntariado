import { FileText, Video, CheckCircle, XCircle, Clock, History } from 'lucide-react';

interface ActivityHistoryProps {
    activityHistory: any[];
}

export function ActivityHistory({ activityHistory }: ActivityHistoryProps) {
    return (
        <div>
            <div className="mb-6">
                <h2 className="text-gray-900 mb-2">Historial de Actividad</h2>
                <p className="text-gray-600">Revisa todas tus acciones en el sistema</p>
            </div>

            {activityHistory.length > 0 ? (
                <div className="space-y-4">
                    {activityHistory.map((activity) => {
                        let icon, bgColor, borderColor, textColor;

                        switch (activity.type) {
                            case 'application':
                                icon = <FileText className="w-5 h-5" />;
                                bgColor = 'bg-emerald-100';
                                borderColor = 'border-emerald-200';
                                textColor = 'text-emerald-700';
                                break;
                            case 'interview':
                                icon = <Video className="w-5 h-5" />;
                                bgColor = 'bg-purple-100';
                                borderColor = 'border-purple-200';
                                textColor = 'text-purple-700';
                                break;
                            case 'accepted':
                                icon = <CheckCircle className="w-5 h-5" />;
                                bgColor = 'bg-emerald-100';
                                borderColor = 'border-emerald-200';
                                textColor = 'text-emerald-700';
                                break;
                            case 'rejected':
                                icon = <XCircle className="w-5 h-5" />;
                                bgColor = 'bg-red-100';
                                borderColor = 'border-red-200';
                                textColor = 'text-red-700';
                                break;
                            default:
                                icon = <Clock className="w-5 h-5" />;
                                bgColor = 'bg-gray-100';
                                borderColor = 'border-gray-200';
                                textColor = 'text-gray-700';
                        }

                        return (
                            <div
                                key={activity.id}
                                className="bg-white rounded-xl shadow-md p-6 border-2 border-gray-100 hover:border-emerald-200 transition-all"
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`${bgColor} p-3 rounded-lg ${textColor}`}>
                                        {icon}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="text-gray-900">{activity.title}</h3>
                                            <span className="text-sm text-gray-500">
                                                {new Date(activity.date).toLocaleDateString('es-ES', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 text-sm">{activity.description}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-lg p-12 text-center border-2 border-gray-100">
                    <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <History className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-gray-900 mb-2">Sin actividad registrada</h3>
                    <p className="text-gray-600">
                        Tu historial de actividades aparecerá aquí
                    </p>
                </div>
            )}
        </div>
    );
}
