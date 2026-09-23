async function parseResponse(response) {
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || 'Não foi possível concluir a operação');
  }

  return response;
}

export async function uploadDocument(file, owner) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/upload', {
    method: 'POST',
    headers: owner ? { 'X-User-Id': owner } : {},
    body: formData,
  });

  await parseResponse(response);
  return response.json();
}

export async function listDocuments(owner) {
  const query = owner ? `?owner=${encodeURIComponent(owner)}` : '';
  const response = await fetch(`/api/documents${query}`);
  await parseResponse(response);
  return response.json();
}

export function getDownloadUrl(documentId) {
  return `/api/documents/${encodeURIComponent(documentId)}/download`;
}