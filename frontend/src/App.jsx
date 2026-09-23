import { useEffect, useState } from 'react';
import DocumentList from './components/DocumentList';
import UploadComponent from './components/UploadComponent';
import { listDocuments } from './services/documentService';
import './app.css';

export default function App() {
  const [owner, setOwner] = useState('anonymous');
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isCurrent = true;
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => {
      setIsLoading(true);
      listDocuments(owner, { signal: abortController.signal })
        .then((loadedDocuments) => {
          if (isCurrent) {
            setDocuments(loadedDocuments);
            setError('');
          }
        })
        .catch((loadError) => {
          if (isCurrent && loadError.name !== 'AbortError') setError(loadError.message);
        })
        .finally(() => {
          if (isCurrent) setIsLoading(false);
        });
    }, 250);

    return () => {
      isCurrent = false;
      clearTimeout(timeoutId);
      abortController.abort();
    };
  }, [owner]);

  function handleUploaded(document) {
    setDocuments((currentDocuments) => [document, ...currentDocuments]);
  }

  return (
    <main className="app-shell">
      <header className="page-header">
        <p className="eyebrow">Arquivo local</p>
        <h1>Document Management System</h1>
        <p>Envie, acompanhe e baixe seus documentos em um só lugar.</p>
      </header>

      <section className="workspace" aria-label="Gerenciamento de documentos">
        <label htmlFor="owner">Proprietário</label>
        <input id="owner" value={owner} onChange={(event) => setOwner(event.target.value || 'anonymous')} />
        <UploadComponent owner={owner} onUploaded={handleUploaded} />
      </section>

      <section className="documents-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Biblioteca</p>
            <h2>Documentos enviados</h2>
          </div>
          <span className="document-count">{documents.length}</span>
        </div>
        {error && <p className="error-message" role="alert">{error}</p>}
        <DocumentList documents={documents} owner={owner} isLoading={isLoading} />
      </section>
    </main>
  );
}
