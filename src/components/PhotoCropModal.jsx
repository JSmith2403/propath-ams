import { useState, useRef } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { X, Check } from 'lucide-react';

/** Render the cropped region to a 400×400 JPEG data URL (full rectangle). */
function getCroppedDataURL(imgEl, crop) {
  const scaleX = imgEl.naturalWidth  / imgEl.width;
  const scaleY = imgEl.naturalHeight / imgEl.height;
  const size   = 400;

  const canvas = document.createElement('canvas');
  canvas.width  = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Convert % crop → pixel crop relative to the displayed image
  const px = crop.unit === '%'
    ? {
        x:      (crop.x      / 100) * imgEl.width,
        y:      (crop.y      / 100) * imgEl.height,
        width:  (crop.width  / 100) * imgEl.width,
        height: (crop.height / 100) * imgEl.height,
      }
    : crop;

  ctx.drawImage(
    imgEl,
    px.x * scaleX, px.y * scaleY,
    px.width * scaleX, px.height * scaleY,
    0, 0, size, size,
  );

  // Full rectangle — no circular clip. The card frames the photo into its
  // own fixed-height rectangle via object-fit: cover at render time.
  return canvas.toDataURL('image/jpeg', 0.9);
}

/**
 * PhotoCropModal — shows a circular crop tool after the user selects a photo.
 *
 * Props:
 *   src       {string}   — data URL of the raw selected image
 *   onConfirm {fn}       — called with the cropped data URL
 *   onCancel  {fn}       — called when user dismisses without cropping
 */
export default function PhotoCropModal({ src, onConfirm, onCancel }) {
  const imgRef = useRef(null);
  const [crop, setCrop] = useState(undefined);

  const onImageLoad = (e) => {
    const { width, height } = e.currentTarget;
    const initial = centerCrop(
      makeAspectCrop({ unit: '%', width: 80 }, 1, width, height),
      width, height,
    );
    setCrop(initial);
  };

  const handleConfirm = () => {
    if (!imgRef.current || !crop) return;
    onConfirm(getCroppedDataURL(imgRef.current, crop));
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 text-sm">Crop Photo</h3>
          <button
            onClick={onCancel}
            className="p-1.5 rounded hover:bg-gray-100 text-gray-400 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Crop area */}
        <div className="flex justify-center items-center p-5 bg-gray-950 rounded-none">
          <ReactCrop
            crop={crop}
            onChange={(_, pct) => setCrop(pct)}
            aspect={1}
            minWidth={40}
            keepSelection
          >
            <img
              ref={imgRef}
              src={src}
              onLoad={onImageLoad}
              alt="Crop preview"
              style={{ maxHeight: 380, maxWidth: '100%', display: 'block' }}
            />
          </ReactCrop>
        </div>

        {/* Hint */}
        <p className="text-xs text-center text-gray-400 pt-3 px-5">
          Drag the circle to reposition · Drag the handles to zoom in or out
        </p>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-100">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!crop}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white rounded transition-opacity hover:opacity-90 disabled:opacity-40"
            style={{ backgroundColor: '#A58D69' }}
          >
            <Check size={14} />
            Save Photo
          </button>
        </div>
      </div>
    </div>
  );
}
