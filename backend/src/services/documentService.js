const crypto = require('node:crypto');

class DocumentService {
  constructor({ metadataRepository, fileRepository }) {
    this.metadataRepository = metadataRepository;
    this.fileRepository = fileRepository;
  }

  createDocument({ file, owner }) {
    if (!file) {
      const error = new Error('O arquivo é obrigatório');
      error.statusCode = 400;
      throw error;
    }

    const document = {
      id: crypto.randomUUID(),
      originalName: file.originalname,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      owner: owner || 'anonymous',
      storedName: file.filename,
    };

    return this.metadataRepository.create(document);
  }

  listDocuments(owner) {
    return this.metadataRepository.findAll(owner);
  }

  getDownload(documentId) {
    const document = this.metadataRepository.findById(documentId);
    if (!document) {
      const error = new Error('Documento não encontrado');
      error.statusCode = 404;
      throw error;
    }

    return {
      document,
      filePath: this.fileRepository.getDownloadPath(document.storedName),
    };
  }
}

module.exports = { DocumentService };