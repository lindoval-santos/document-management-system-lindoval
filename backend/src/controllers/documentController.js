class DocumentController {
  constructor({ documentService }) {
    this.documentService = documentService;
    this.upload = this.upload.bind(this);
    this.list = this.list.bind(this);
    this.download = this.download.bind(this); 
  }

  getOwner(req) {
    return req.header('X-User-Id') || 'anonymous';
  }

  upload(req, res) {
    const document = this.documentService.createDocument({
      file: req.file,
      owner: this.getOwner(req),
    });

    res.status(201).json(document);
  }

  list(req, res) {
    res.json(this.documentService.listDocuments(this.getOwner(req)));
  }

  download(req, res) {
    const { document, filePath } = this.documentService.getDownload(req.params.id, this.getOwner(req));
    res.download(filePath, document.originalName);
  }
}

module.exports = { DocumentController };