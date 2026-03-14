// src/components/ui/ImageUpload.tsx
// Composant d'upload d'image avec prévisualisation

import { ChangeEvent, useRef, useState, forwardRef } from 'react';

interface ImageUploadProps {
  label?: string;
  currentPhoto?: string;
  onFileSelect: (file: File) => void;
  onRemove?: () => void;
  accept?: string;
  maxSizeMB?: number;
  disabled?: boolean;
  error?: string;
  id?: string;
}

export const ImageUpload = forwardRef<HTMLDivElement, ImageUploadProps>(
  (
    {
      label = 'Photo de profil',
      currentPhoto,
      onFileSelect,
      onRemove,
      accept = 'image/*',
      maxSizeMB = 0.5,
      disabled = false,
      error,
      id,
    },
    ref
  ) => {
    const [preview, setPreview] = useState<string | null>(currentPhoto || null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const inputId = id || 'image-upload';

    const handleFile = (file: File) => {
      // Vérifier la taille
      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        return; // Error handled by parent via error prop
      }

      // Créer la prévisualisation
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Passer le fichier au parent
      onFileSelect(file);
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
    };

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) {
        setIsDragging(true);
      }
    };

    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      if (disabled) return;

      const file = e.dataTransfer.files?.[0];
      if (file && file.type.startsWith('image/')) {
        handleFile(file);
      }
    };

    const handleClick = () => {
      if (!disabled) {
        fileInputRef.current?.click();
      }
    };

    const handleRemove = (e: React.MouseEvent) => {
      e.stopPropagation();
      setPreview(null);
      onRemove?.();
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    return (
      <div ref={ref} className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {label}
          </label>
        )}

        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-label={preview ? 'Changer la photo' : 'Télécharger une photo'}
          aria-disabled={disabled}
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleClick();
            }
          }}
          className={`
            relative w-full max-w-xs aspect-square rounded-xl border-2 border-dashed
            transition-all duration-200 cursor-pointer
            focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500
            ${isDragging
              ? 'border-blue-500 bg-blue-50'
              : error
              ? 'border-red-300 hover:border-red-400'
              : 'border-gray-300 hover:border-gray-400'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {preview ? (
            <div className="relative w-full h-full">
              <img
                src={preview}
                alt="Aperçu de la photo de profil"
                className="w-full h-full object-cover rounded-lg"
              />
              {onRemove && !disabled && (
                <button
                  type="button"
                  onClick={handleRemove}
                  className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-md
                    hover:bg-red-50 transition-colors focus-visible:outline focus-visible:outline-2
                    focus-visible:outline-red-500"
                  aria-label="Supprimer la photo"
                >
                  <svg
                    className="w-4 h-4 text-red-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center w-full h-full p-4">
              <svg
                className="w-10 h-10 text-gray-400 mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-sm text-gray-600 text-center">
                Cliquez ou glissez une image
              </p>
              <p className="text-xs text-gray-500 mt-1">
                JPG, PNG, GIF ou WebP (max {maxSizeMB}MB)
              </p>
            </div>
          )}

          <input
            ref={fileInputRef}
            id={inputId}
            type="file"
            accept={accept}
            onChange={handleChange}
            disabled={disabled}
            className="hidden"
            aria-hidden="true"
          />
        </div>

        {error && (
          <p className="mt-2 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

ImageUpload.displayName = 'ImageUpload';
