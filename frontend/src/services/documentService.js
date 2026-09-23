const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

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

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    headers: owner ? { 'X-User-Id': owner } : {},
    body: formData,
  });

  await parseResponse(response);
  return response.json();
}

export async function listDocuments(owner, { signal } = {}) {
  const response = await fetch(`${API_BASE_URL}/documents`, {
    headers: owner ? { 'X-User-Id': owner } : {},
    signal,
  });
  await parseResponse(response);
  return response.json();
}

export async function downloadDocument(documentId, owner) {
  const response = await fetch(`${API_BASE_URL}/documents/${encodeURIComponent(documentId)}/download`, {
    headers: owner ? { 'X-User-Id': owner } : {},
  });
  await parseResponse(response);

  const contentDisposition = response.headers.get('content-disposition') || '';
  const encodedFileName = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
  const plainFileName = contentDisposition.match(/filename="?([^";]+)"?/i)?.[1];
  const fileName = encodedFileName
    ? decodeURIComponent(encodedFileName)
    : plainFileName || 'documento';
  const blobUrl = URL.createObjectURL(await response.blob());
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(blobUrl);
}