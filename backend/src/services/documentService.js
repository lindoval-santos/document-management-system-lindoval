const crypto = require('node:crypto');

class DocumentService {
  constructor({ metadataRepository, fileRepository }) {
    this.metadataRepository = metadataRepository;
    this.fileRepository = fileRepository;
  }

  normalizeOwner(owner) {
    const normalizedOwner = owner || 'anonymous';
    if (!/^[a-zA-Z0-9._-]{1,100}$/.test(normalizedOwner)) {
      const error = new Error('Proprietário inválido');
      error.statusCode = 400;
      throw error;
    }

    return normalizedOwner;
  }

  toPublicMetadata(document) {
    const { storedName, ...publicMetadata } = document;
    return publicMetadata;
  }

  createDocument({ file, owner }) {
    if (!file) {
      const error = new Error('O arquivo é obrigatório');
      error.statusCode = 400;
      throw error;
    }

    let document;
    try {
      document = {
        id: crypto.randomUUID(),
        originalName: file.originalname,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        owner: this.normalizeOwner(owner),
        storedName: file.filename,
      };
      this.metadataRepository.create(document);
    } catch (error) {
      this.fileRepository.delete(file.filename);
      throw error;
    }

    return this.toPublicMetadata(document);
  }

  listDocuments(owner) {
    return this.metadataRepository.findAll(this.normalizeOwner(owner)).map((document) => this.toPublicMetadata(document));
  }

  getDownload(documentId, owner) {
    const document = this.metadataRepository.findById(documentId);
    if (!document || document.owner !== this.normalizeOwner(owner)) {
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