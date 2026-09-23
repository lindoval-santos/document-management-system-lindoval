const multer = require('multer');
const crypto = require('node:crypto');
const path = require('node:path');
const { DocumentController } = require('../controllers/documentController');

function createUploadMiddleware({ storageDirectory } = {}) {
  const destination = storageDirectory || process.env.STORAGE_DIR || path.resolve(__dirname, '../../storage');
  const storage = multer.diskStorage({
    destination,
    filename: (req, file, callback) => {
      callback(null, `${crypto.randomUUID()}${path.extname(file.originalname)}`);
    },
  });

  return multer({
    storage,
    limits: {
      fileSize: Number(process.env.MAX_FILE_SIZE || 10 * 1024 * 1024),
    },
  }).single('file');
}

function createDocumentRoutes({ documentService, storageDirectory } = {}) {
  const router = require('express').Router();
  const controller = new DocumentController({ documentService });
  const uploadMiddleware = createUploadMiddleware({ storageDirectory });

  router.post('/upload', uploadMiddleware, controller.upload);
  router.get('/documents', controller.list);
  router.get('/documents/:id/download', controller.download);

  return router;
}

module.exports = { createDocumentRoutes, createUploadMiddleware };