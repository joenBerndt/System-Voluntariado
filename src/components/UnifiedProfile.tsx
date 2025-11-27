import { useState, useMemo } from 'react';
import { User, Mail, Phone, MapPin, Camera, Lock, Save, X, Edit2, CheckCircle, Award, Briefcase, Shield, Crown, Eye, EyeOff } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info.tsx';

interface UnifiedProfileProps {
  user: any;
  onUpdate: (updatedUser: any) => void;
  applicationsData?: any[];
  showStats?: boolean;
}

export function UnifiedProfile({ user, onUpdate, applicationsData = [], showStats = true }: UnifiedProfileProps) {
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Form state
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [area, setArea] = useState(user?.area || '');
  const [skills, setSkills] = useState(user?.skills || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [photoUrl, setPhotoUrl] = useState(user?.photoUrl || '');

  const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-f99e977c`;

  // Calculate statistics
  const stats = useMemo(() => {
    const myApplications = applicationsData.filter(app => app.userEmail === user.email);
    const myInterviews = myApplications.filter(app => 
      app.status === 'interview_pending' || 
      app.status === 'interview_confirmed' ||
      (app.interviewDate && app.interviewDate !== '')
    );
    const acceptedApplications = myApplications.filter(app => app.status === 'accepted');

    return {
      totalApplications: myApplications.length,
      totalInterviews: myInterviews.length,
      acceptedApplications: acceptedApplications.length,
      pendingApplications: myApplications.filter(app => app.status === 'pending').length,
    };
  }, [applicationsData, user.email]);

  const getRoleInfo = (role: string) => {
    switch (role) {
      case 'admin_master':
        return {
          label: 'Admin Master',
          bgGradient: 'from-purple-600 via-purple-700 to-indigo-700',
          badgeGradient: 'from-purple-500 to-indigo-600',
          iconBg: 'bg-purple-100',
          iconColor: 'text-purple-700',
          borderColor: 'border-purple-200',
          cardBg: 'from-purple-50 to-indigo-50',
          description: 'Control total del sistema',
          icon: Crown,
        };
      case 'admin':
        return {
          label: 'Administrador',
          bgGradient: 'from-teal-600 via-teal-700 to-cyan-700',
          badgeGradient: 'from-teal-500 to-cyan-600',
          iconBg: 'bg-teal-100',
          iconColor: 'text-teal-700',
          borderColor: 'border-teal-200',
          cardBg: 'from-teal-50 to-cyan-50',
          description: 'Gestión de proyectos',
          icon: Shield,
        };
      case 'volunteer':
        return {
          label: 'Voluntario',
          bgGradient: 'from-emerald-600 via-emerald-700 to-teal-700',
          badgeGradient: 'from-emerald-500 to-teal-600',
          iconBg: 'bg-emerald-100',
          iconColor: 'text-emerald-700',
          borderColor: 'border-emerald-200',
          cardBg: 'from-emerald-50 to-teal-50',
          description: 'Colaborador activo',
          icon: Award,
        };
      default:
        return {
          label: 'Usuario',
          bgGradient: 'from-green-600 via-green-700 to-emerald-700',
          badgeGradient: 'from-green-500 to-emerald-600',
          iconBg: 'bg-green-100',
          iconColor: 'text-green-700',
          borderColor: 'border-green-200',
          cardBg: 'from-green-50 to-emerald-50',
          description: 'Miembro registrado',
          icon: User,
        };
    }
  };

  const roleInfo = getRoleInfo(user.role);
  const RoleIcon = roleInfo.icon;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen debe ser menor a 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Solo se permiten archivos de imagen');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('photo', file);
      formData.append('userId', user.id);

      const response = await fetch(`${API_URL}/profile/upload-photo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        setPhotoUrl(result.data.url);
        alert('Foto actualizada exitosamente');
      } else {
        alert('Error al subir la foto: ' + result.error);
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Error al subir la foto');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !email.trim()) {
      alert('El nombre y correo son obligatorios');
      return;
    }

    if (password && password !== confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    if (password && password.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setSaving(true);
    try {
      const updates: any = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        area: area.trim(),
        photoUrl,
      };

      if (password) {
        updates.password = password;
      }

      if (user.role === 'volunteer' || user.role === 'admin' || user.role === 'admin_master') {
        updates.skills = skills.trim();
      }

      const response = await fetch(`${API_URL}/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(updates),
      });

      const result = await response.json();
      if (result.success) {
        if (password) {
          localStorage.setItem(`user_pass_${email.trim()}`, password);
        }
        
        onUpdate(result.data);
        setEditing(false);
        setPassword('');
        setConfirmPassword('');
        alert('Perfil actualizado exitosamente');
      } else {
        alert('Error al actualizar el perfil: ' + result.error);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Error al guardar el perfil');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setName(user?.name || '');
    setEmail(user?.email || '');
    setPhone(user?.phone || '');
    setArea(user?.area || '');
    setSkills(user?.skills || '');
    setPhotoUrl(user?.photoUrl || '');
    setPassword('');
    setConfirmPassword('');
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600"></div>
        <p className="text-gray-600 mt-4">Cargando perfil...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900 mb-2">Mi Perfil</h2>
          <p className="text-gray-600">Gestiona tu información personal</p>
        </div>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-6 py-3 rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
          >
            <Edit2 className="w-5 h-5" />
            Editar Perfil
          </button>
        )}
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-2xl border-2 border-gray-100 overflow-hidden">
        {/* Gradient Header */}
        <div className={`relative h-48 bg-gradient-to-r ${roleInfo.bgGradient} overflow-hidden`}>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzBoLTEydjEyaDEyVjMwem0wLTEyaC0xMnYxMmgxMlYxOHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
          
          {/* Role Badge */}
          <div className="absolute top-6 right-6">
            <div className={`flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border-2 border-white/30`}>
              <RoleIcon className="w-5 h-5 text-white" />
              <span className="text-white font-bold">{roleInfo.label}</span>
            </div>
          </div>

          {/* Profile Photo Container */}
          <div className="absolute -bottom-20 left-8">
            <div className="relative group">
              <div className="w-40 h-40 rounded-3xl border-4 border-white shadow-2xl overflow-hidden bg-gradient-to-br from-emerald-400 to-teal-600">
                {photoUrl ? (
                  <img 
                    src={photoUrl} 
                    alt={name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-6xl font-bold text-white">
                      {name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              
              {editing && (
                <label className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-3xl cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="text-center">
                    <Camera className="w-8 h-8 text-white mx-auto mb-2" />
                    <span className="text-white text-sm font-semibold">
                      {uploading ? 'Subiendo...' : 'Cambiar Foto'}
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="pt-24 px-8 pb-8">
          {/* Name and Role Description */}
          <div className="mb-8">
            <h3 className="text-gray-900 mb-2">{name}</h3>
            <p className="text-gray-600 mb-4">{email}</p>
            <div className={`inline-flex items-center gap-2 bg-gradient-to-r ${roleInfo.cardBg} px-4 py-2 rounded-xl border-2 ${roleInfo.borderColor}`}>
              <RoleIcon className={`w-5 h-5 ${roleInfo.iconColor}`} />
              <span className={`font-semibold ${roleInfo.iconColor}`}>{roleInfo.description}</span>
            </div>
          </div>

          {/* Statistics (Only for users with applications) */}
          {showStats && user.role === 'user' && stats.totalApplications > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className={`bg-gradient-to-br ${roleInfo.cardBg} p-4 rounded-xl border-2 ${roleInfo.borderColor}`}>
                <p className="text-gray-600 text-sm font-medium mb-1">Postulaciones</p>
                <p className={`text-3xl font-bold ${roleInfo.iconColor}`}>{stats.totalApplications}</p>
              </div>
              <div className={`bg-gradient-to-br ${roleInfo.cardBg} p-4 rounded-xl border-2 ${roleInfo.borderColor}`}>
                <p className="text-gray-600 text-sm font-medium mb-1">Entrevistas</p>
                <p className={`text-3xl font-bold ${roleInfo.iconColor}`}>{stats.totalInterviews}</p>
              </div>
              <div className={`bg-gradient-to-br ${roleInfo.cardBg} p-4 rounded-xl border-2 ${roleInfo.borderColor}`}>
                <p className="text-gray-600 text-sm font-medium mb-1">Aceptadas</p>
                <p className={`text-3xl font-bold ${roleInfo.iconColor}`}>{stats.acceptedApplications}</p>
              </div>
              <div className={`bg-gradient-to-br ${roleInfo.cardBg} p-4 rounded-xl border-2 ${roleInfo.borderColor}`}>
                <p className="text-gray-600 text-sm font-medium mb-1">Pendientes</p>
                <p className={`text-3xl font-bold ${roleInfo.iconColor}`}>{stats.pendingApplications}</p>
              </div>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-6">
            {/* Personal Information Section */}
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border-2 border-gray-100">
              <h4 className="text-gray-900 mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-emerald-600" />
                Información Personal
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Nombre Completo
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium"
                      placeholder="Tu nombre completo"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-800 font-medium">
                      {name}
                    </div>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Correo Electrónico
                  </label>
                  {editing ? (
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium"
                      placeholder="correo@ejemplo.com"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-800 font-medium flex items-center gap-2">
                      <Mail className="w-4 h-4 text-emerald-600" />
                      {email}
                    </div>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Teléfono
                  </label>
                  {editing ? (
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium"
                      placeholder="+51 999 999 999"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-800 font-medium flex items-center gap-2">
                      <Phone className="w-4 h-4 text-emerald-600" />
                      {phone || 'No registrado'}
                    </div>
                  )}
                </div>

                {/* Area */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Área de Interés
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium"
                      placeholder="Ej: Biodiversidad"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-800 font-medium flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-emerald-600" />
                      {area || 'No especificada'}
                    </div>
                  )}
                </div>
              </div>

              {/* Skills (for volunteers and admins) */}
              {(user.role === 'volunteer' || user.role === 'admin' || user.role === 'admin_master') && (
                <div className="mt-6">
                  <label className="block text-gray-700 font-semibold mb-2">
                    Habilidades (separadas por comas)
                  </label>
                  {editing ? (
                    <textarea
                      value={skills}
                      onChange={(e) => setSkills(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium"
                      rows={3}
                      placeholder="Ej: Investigación de campo, Análisis de datos, Redacción científica"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-white border-2 border-gray-200 rounded-xl">
                      {skills ? (
                        <div className="flex flex-wrap gap-2">
                          {skills.split(',').map((skill, idx) => (
                            <span key={idx} className="px-3 py-1 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 rounded-lg text-sm font-semibold border border-emerald-200">
                              {skill.trim()}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-500">No especificadas</span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Security Section (Only when editing) */}
            {editing && (
              <div className="bg-gradient-to-br from-amber-50 to-white rounded-xl p-6 border-2 border-amber-200">
                <h4 className="text-gray-900 mb-6 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-amber-600" />
                  Cambiar Contraseña (Opcional)
                </h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Nueva Contraseña
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-medium"
                        placeholder="Mínimo 6 caracteres"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Confirmar Contraseña
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-medium"
                        placeholder="Repite la contraseña"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <p className="text-amber-700 text-sm font-medium">
                    💡 Deja estos campos vacíos si no deseas cambiar tu contraseña
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {editing && (
              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleCancel}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  <X className="w-5 h-5" />
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-6 py-3 rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 shadow-lg hover:shadow-xl font-medium disabled:from-gray-400 disabled:to-gray-500"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Guardar Cambios
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
