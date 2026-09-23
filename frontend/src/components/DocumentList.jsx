import DownloadButton from './DownloadButton';

function formatDate(date) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date));
}

export default function DocumentList({ documents, isLoading }) {
  if (isLoading) {
    return <p>Carregando documentos...</p>;
  }

  if (documents.length === 0) {
    return <p className="empty-state">Nenhum documento enviado ainda.</p>;
  }

  return (
    <div className="document-list">
      {documents.map((document) => (
        <article className="document-item" key={document.id}>
          <div>
            <h3>{document.originalName}</h3>
            <p>{document.size} bytes · {formatDate(document.uploadedAt)}</p>
            <small>Proprietário: {document.owner}</small>
          </div>
          <DownloadButton documentId={document.id} />
        </article>
      ))}
    </div>
  );
}