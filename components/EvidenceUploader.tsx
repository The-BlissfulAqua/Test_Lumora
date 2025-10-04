import React, { useState, useRef } from 'react';
import { Evidence } from '../types';
import { generateFileHash } from '../utils/crypto';

interface EvidenceUploaderProps {
  evidence: Evidence[];
  onUpload: (evidence: Omit<Evidence, 'id' | 'timestamp'>) => void;
  isOffline: boolean;
}

const EvidenceUploader: React.FC<EvidenceUploaderProps> = ({ evidence, onUpload, isOffline }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploading(true);
      setError(null);
      try {
        const hash = await generateFileHash(file);
        onUpload({ fileName: file.name, hash });
      } catch (err) {
        setError('Failed to process file.');
      } finally {
        setUploading(false);
        // Reset file input
        if(fileInputRef.current) {
            fileInputRef.current.value = "";
        }
      }
    }
  };

  return (
    <div className="bg-navy-dark rounded-lg p-4">
      <h4 className="text-lg font-bold text-accent-cyan mb-3">Evidence Log</h4>
      <div className="space-y-2 mb-4">
        {evidence.map(ev => (
          <div key={ev.id} className="bg-navy-light p-2 rounded-md text-sm">
            <p className="font-semibold text-slate-light truncate">{ev.fileName}</p>
            <p className="text-xs text-slate-dark font-mono truncate">Hash: {ev.hash}</p>
          </div>
        ))}
        {evidence.length === 0 && <p className="text-sm text-slate-dark">No evidence uploaded.</p>}
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        id="evidence-upload"
        disabled={isOffline || uploading}
      />
      <label
        htmlFor="evidence-upload"
        className={`w-full text-center block font-bold py-2 px-4 rounded-md transition-colors ${isOffline ? 'bg-gray-500 text-gray-300 cursor-not-allowed' : 'bg-accent-cyan text-command-blue cursor-pointer hover:bg-opacity-80'}`}
      >
        {uploading ? 'Processing...' : isOffline ? 'Offline: Cannot Upload' : 'Upload Evidence'}
      </label>
      {error && <p className="text-xs text-alert-red mt-2">{error}</p>}
    </div>
  );
};

export default EvidenceUploader;
