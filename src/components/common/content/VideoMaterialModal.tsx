import { useState } from 'react';
import { X, Video, Eye, EyeOff, Loader2 } from 'lucide-react';

interface VideoMaterialModalProps {
  material: any;
  projectId: string;
  onClose: () => void;
  onSave: (material: any) => Promise<void>;
  isSaving?: boolean;
}

export function VideoMaterialModal({ material, projectId, onClose, onSave, isSaving = false }: VideoMaterialModalProps) {
  const [title, setTitle] = useState(material?.title || '');
  const [description, setDescription] = useState(material?.description || '');
  const [youtubeUrl, setYoutubeUrl] = useState(material?.url || '');
  const [published, setPublished] = useState(material?.published ?? false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !youtubeUrl.trim()) {
      alert('⚠️ Por favor completa el título y el enlace de YouTube');
      return;
    }

    const materialData = {
      id: material?.id,
      title: title.trim(),
      description: description.trim(),
      url: youtubeUrl.trim(),
      projectId: projectId,
      published: published,
      type: 'youtube',
      order: material?.order || 0,
    };

    await onSave(materialData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                <Video className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-white mb-1">
                  {material?.id ? 'Editar Video' : 'Agregar Nuevo Video'}
                </h2>
                <p className="text-emerald-50 text-sm">
                  Comparte videos de YouTube con tus voluntarios
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isSaving}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <label className="block text-gray-700 font-semibold">
              Título del Video *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Introducción a la Biodiversidad Amazónica"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 transition-all disabled:bg-gray-100"
              required
              disabled={isSaving}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="block text-gray-700 font-semibold">
              Descripción (opcional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe el contenido del video..."
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 transition-all resize-none disabled:bg-gray-100"
              disabled={isSaving}
            />
          </div>

          {/* YouTube URL */}
          <div className="space-y-2">
            <label className="block text-gray-700 font-semibold">
              Enlace de YouTube *
            </label>
            <input
              type="url"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 transition-all disabled:bg-gray-100"
              required
              disabled={isSaving}
            />
            <p className="text-xs text-gray-500">
              💡 Copia y pega el enlace completo del video de YouTube
            </p>
          </div>

          {/* Published Toggle */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {published ? (
                    <Eye className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <EyeOff className="w-5 h-5 text-amber-600" />
                  )}
                  <label className="text-gray-900 font-semibold">
                    Estado de Publicación
                  </label>
                </div>
                <p className="text-gray-700 text-sm mb-3">
                  {published 
                    ? '✅ Este video está publicado y visible para los voluntarios'
                    : '⚠️ Este video está en borrador y NO es visible para los voluntarios'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPublished(!published)}
                disabled={isSaving}
                className={`px-6 py-3 rounded-lg font-semibold transition-all shadow-md disabled:opacity-50 ${
                  published
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-amber-600 text-white hover:bg-amber-700'
                }`}
              >
                {published ? '✓ Publicado' : '○ Borrador'}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t-2 border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl font-semibold disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>{material?.id ? 'Actualizar Video' : 'Crear Video'}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
