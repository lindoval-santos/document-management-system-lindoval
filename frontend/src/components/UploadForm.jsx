import { useState } from 'react';
import { uploadDocument } from '../services/documentService';

export default function UploadForm({ owner, onUploaded }) {
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    if (!file) {
      setError('Selecione um arquivo para enviar.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      const document = await uploadDocument(file, owner);
      setFile(null);
      event.target.reset();
      onUploaded(document);
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="upload-form" onSubmit={handleSubmit}>
      <label htmlFor="document-file">Arquivo</label>
      <input
        id="document-file"
        type="file"
        onChange={(event) => setFile(event.target.files?.[0] || null)}
      />
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Enviando...' : 'Enviar documento'}
      </button>
      {error && <p className="error-message" role="alert">{error}</p>}
    </form>
  );
}