import { useState, useEffect } from 'react';
import { ArrowLeft, User, Mail, Phone, Camera, Lock, Save, X } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info.tsx';

interface ProfileViewProps {
  user: any;
  onBack?: () => void;
  onUpdate: (updatedUser: any) => void;
}

export function ProfileView({ user, onBack, onUpdate }: ProfileViewProps) {
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [photoUrl, setPhotoUrl] = useState(user?.photoUrl || '');
  const [area, setArea] = useState(user?.area || '');
  const [skills, setSkills] = useState(user?.skills || '');

  const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-f99e977c`;

  // If no user, show loading or error
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 mb-2">
            <User className="w-16 h-16 mx-auto" />
          </div>
          <p className="text-gray-600">Cargando información del perfil...</p>
        </div>
      </div>
    );
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen debe ser menor a 5MB');
      return;
    }

    // Validate file type
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
    // Validate required fields
    if (!name.trim() || !email.trim()) {
      alert('El nombre y correo son obligatorios');
      return;
    }

    // Validate password if changed
    if (password && password !== confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    setSaving(true);
    try {
      const updates: any = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        photoUrl,
      };

      // Only include password if it was changed
      if (password) {
        updates.password = password;
      }

      // Include area and skills for volunteers
      if (user.role === 'volunteer') {
        updates.area = area.trim();
        updates.skills = skills.trim();
      }

      const response = await fetch(`${API_URL}/profile/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(updates),
      });

      const result = await response.json();
      if (result.success) {
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

  const getRoleName = (role: string) => {
    switch (role) {
      case 'admin_master':
        return 'Admin Master';
      case 'admin':
        return 'Admin';
      case 'volunteer':
        return 'Voluntario';
      default:
        return 'Usuario';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver
          </button>
        )}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-gray-900">Mi Perfil</h1>
            <p className="text-gray-500 text-sm mt-1">
              Gestiona tu información personal
            </p>
          </div>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Editar Perfil
            </button>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-8">
        {/* Profile Card */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Profile Photo Section */}
          <div className="bg-gradient-to-r from-blue-600 to-green-600 h-32"></div>
          <div className="px-8 pb-8">
            <div className="flex items-end -mt-16 mb-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-200 overflow-hidden">
                  {photoUrl ? (
                    <img 
                      src={photoUrl} 
                      alt={name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-blue-100">
                      <User className="w-16 h-16 text-blue-600" />
                    </div>
                  )}
                </div>
                {editing && (
                  <label className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                    <Camera className="w-5 h-5 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                )}
                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                    <div className="text-white text-sm">Subiendo...</div>
                  </div>
                )}
              </div>
              <div className="ml-6 mb-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                  {getRoleName(user.role)}
                </span>
              </div>
            </div>

            {/* Profile Form */}
            <div className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-gray-700 mb-2">
                  Nombre Completo *
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ingresa tu nombre completo"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-gray-900">
                    <User className="w-5 h-5 text-gray-400" />
                    <span>{name}</span>
                  </div>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-gray-700 mb-2">
                  Correo Electrónico *
                </label>
                {editing ? (
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="correo@ejemplo.com"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-gray-900">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <span>{email}</span>
                  </div>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-gray-700 mb-2">
                  Teléfono
                </label>
                {editing ? (
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+51 987654321"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-gray-900">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <span>{phone || 'No registrado'}</span>
                  </div>
                )}
              </div>

              {/* Area and Skills (for volunteers only) */}
              {user.role === 'volunteer' && (
                <>
                  <div>
                    <label className="block text-gray-700 mb-2">
                      Área de Interés
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ej: Medio Ambiente, Educación"
                      />
                    ) : (
                      <div className="text-gray-900">
                        {area || 'No especificado'}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">
                      Habilidades
                    </label>
                    {editing ? (
                      <textarea
                        value={skills}
                        onChange={(e) => setSkills(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Describe tus habilidades principales"
                      />
                    ) : (
                      <div className="text-gray-900">
                        {skills || 'No especificado'}
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Password Change (only when editing) */}
              {editing && (
                <>
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-gray-900 mb-4">Cambiar Contraseña</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Deja estos campos vacíos si no deseas cambiar tu contraseña
                    </p>
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">
                      Nueva Contraseña
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ingresa nueva contraseña"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">
                      Confirmar Contraseña
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Confirma tu contraseña"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Action Buttons */}
              {editing && (
                <div className="flex gap-3 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setEditing(false);
                      setName(user.name || '');
                      setEmail(user.email || '');
                      setPhone(user.phone || '');
                      setPhotoUrl(user.photoUrl || '');
                      setArea(user.area || '');
                      setSkills(user.skills || '');
                      setPassword('');
                      setConfirmPassword('');
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={saving}
                  >
                    <X className="w-5 h-5 inline mr-2" />
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving || uploading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    <Save className="w-5 h-5 inline mr-2" />
                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-2">
            <User className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-blue-900 text-sm font-medium">Nota sobre tu información</p>
              <p className="text-blue-700 text-sm mt-1">
                Tu nombre, correo y contraseña son campos obligatorios y no pueden eliminarse. 
                Puedes editarlos en cualquier momento desde esta sección.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}