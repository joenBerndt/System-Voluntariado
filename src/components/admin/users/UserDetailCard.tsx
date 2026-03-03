import { UserCircle, Shield, UserCheck, Crown, Mail, Phone, MapPin, X, ChevronUp, ChevronDown, Key, Trash2 } from 'lucide-react';

interface UserDetailCardProps {
    selectedUser: any;
    currentUser: any;
    onClose: () => void;
    onPromote: (userId: string, role: string) => void;
    onDemote: (userId: string, role: string) => void;
    onResetPassword: (user: any) => void;
    onDelete: (userId: string) => void;
    getRoleInfo: (role: string) => any;
}

export function UserDetailCard({
    selectedUser,
    currentUser,
    onClose,
    onPromote,
    onDemote,
    onResetPassword,
    onDelete,
    getRoleInfo
}: UserDetailCardProps) {

    if (!selectedUser) {
        return (
            <div className="bg-white rounded-xl border-2 border-gray-200 p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                    <UserCircle className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Detalles del Usuario</h3>
                <p className="text-gray-500 max-w-xs mx-auto">Selecciona un usuario de la lista para ver su información, rol y gestionar permisos.</p>
            </div>
        );
    }

    const roleInfo = getRoleInfo(selectedUser.role);
    const RoleIcon = roleInfo.icon;
    const isCurrentUser = selectedUser.id === currentUser?.id;

    return (
        <div className={`${roleInfo.bgColor} p-6 rounded-xl border-2 ${roleInfo.borderColor} shadow-xl relative overflow-hidden`}>
            {/* Header */}
            <div className="flex items-start justify-between mb-4 relative z-10">
                <div className="flex items-center gap-3">
                    <div className={`w-14 h-14 bg-gradient-to-br ${roleInfo.color} rounded-full flex items-center justify-center shadow-lg border-2 border-white`}>
                        <span className="text-white font-bold text-xl">{selectedUser.name?.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                        <h4 className={`${roleInfo.textColor} font-bold text-lg`}>{selectedUser.name}</h4>
                        <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${roleInfo.badgeColor} mt-1 inline-block`}>
                            {roleInfo.label}
                        </span>
                    </div>
                </div>
                {isCurrentUser && (
                    <span className="px-2 py-1 bg-amber-200 text-amber-900 text-xs rounded-full font-bold border border-amber-300 shadow-sm">
                        TÚ
                    </span>
                )}
                <button onClick={onClose} className="lg:hidden text-gray-500 hover:text-gray-700">
                    <X className="w-6 h-6" />
                </button>
            </div>

            {/* User Info */}
            <div className="space-y-3 mb-6 bg-white/60 p-4 rounded-xl backdrop-blur-sm relative z-10">
                <div className="flex items-center gap-3 text-gray-700">
                    <div className="bg-emerald-100 p-2 rounded-lg">
                        <Mail className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span className="text-sm font-medium">{selectedUser.email}</span>
                </div>
                {selectedUser.phone && (
                    <div className="flex items-center gap-3 text-gray-700">
                        <div className="bg-teal-100 p-2 rounded-lg">
                            <Phone className="w-4 h-4 text-teal-600" />
                        </div>
                        <span className="text-sm font-medium">{selectedUser.phone}</span>
                    </div>
                )}
                {selectedUser.area && (
                    <div className="flex items-center gap-3 text-gray-700">
                        <div className="bg-purple-100 p-2 rounded-lg">
                            <MapPin className="w-4 h-4 text-purple-600" />
                        </div>
                        <span className="text-sm font-medium">{selectedUser.area}</span>
                    </div>
                )}
            </div>

            {/* Role Icon Watermark */}
            <div className="absolute -bottom-6 -right-6 opacity-10 pointer-events-none">
                <RoleIcon className={`w-48 h-48 ${roleInfo.textColor}`} />
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 pt-4 border-t-2 border-white/50 relative z-10">
                <div className="flex gap-3">
                    <button
                        onClick={() => onPromote(selectedUser.id, selectedUser.role)}
                        disabled={selectedUser.role === 'admin_master' || isCurrentUser}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold shadow-md active:scale-95 transform transition-transform"
                        title="Promover usuario"
                    >
                        <ChevronUp className="w-5 h-5" />
                        <span className="text-sm">Promover</span>
                    </button>
                    <button
                        onClick={() => onDemote(selectedUser.id, selectedUser.role)}
                        disabled={selectedUser.role === 'user' || isCurrentUser}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold shadow-md active:scale-95 transform transition-transform"
                        title="Degradar usuario"
                    >
                        <ChevronDown className="w-5 h-5" />
                        <span className="text-sm">Degradar</span>
                    </button>
                </div>

                {currentUser?.role === 'admin_master' && (
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => onResetPassword(selectedUser)}
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-semibold shadow-md active:scale-95 transform transition-transform"
                            title="Restablecer contraseña a valor por defecto"
                        >
                            <Key className="w-4 h-4" />
                            <span className="text-xs">Nueva Contraseña</span>
                        </button>

                        <button
                            onClick={() => onDelete(selectedUser.id)}
                            disabled={isCurrentUser}
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold shadow-md active:scale-95 transform transition-transform"
                            title="Eliminar usuario"
                        >
                            <Trash2 className="w-4 h-4" />
                            <span className="text-xs">Eliminar Usuario</span>
                        </button>
                    </div>
                )}
            </div>

            {isCurrentUser && (
                <p className="mt-4 text-xs text-amber-900/70 text-center font-bold uppercase tracking-wider">
                    No puedes modificar tu propia cuenta
                </p>
            )}
        </div>
    );
}
