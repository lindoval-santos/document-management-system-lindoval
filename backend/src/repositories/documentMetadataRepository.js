class DocumentMetadataRepository {
  constructor() {
    this.documents = new Map();
  }

  create(document) {
    this.documents.set(document.id, { ...document });
    return { ...document };
  }

  findAll(owner) {
    const documents = [...this.documents.values()];
    const filteredDocuments = owner
      ? documents.filter((document) => document.owner === owner)
      : documents;

    return filteredDocuments.map((document) => ({ ...document }));
  }

  findById(id) {
    const document = this.documents.get(id);
    return document ? { ...document } : null;
  }
}

module.exports = { DocumentMetadataRepository };