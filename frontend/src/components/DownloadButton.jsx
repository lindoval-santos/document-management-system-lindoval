import { useState } from 'react';
import { downloadDocument } from '../services/documentService';

export default function DownloadButton({ documentId, owner }) {
  const [error, setError] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  async function handleDownload() {
    setIsDownloading(true);
    setError('');
    try {
      await downloadDocument(documentId, owner);
    } catch (downloadError) {
      setError(downloadError.message);
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <span>
      <button className="download-button" type="button" onClick={handleDownload} disabled={isDownloading}>
        {isDownloading ? 'Baixando...' : 'Baixar'}
      </button>
      {error && <span className="error-message" role="alert">{error}</span>}
    </span>
  );
}