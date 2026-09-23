class DocumentController {
  constructor({ documentService }) {
    this.documentService = documentService;
    this.upload = this.upload.bind(this);
    this.list = this.list.bind(this);
    this.download = this.download.bind(this); 
  }

  upload(req, res) {
    const document = this.documentService.createDocument({
      file: req.file,
      owner: req.header('X-User-Id') || req.body?.owner,
    });

    res.status(201).json(document);
  }

  list(req, res) {
    res.json(this.documentService.listDocuments(req.query.owner));
  }

  download(req, res) {
    const { document, filePath } = this.documentService.getDownload(req.params.id);
    res.download(filePath, document.originalName);
  }
}

module.exports = { DocumentController };