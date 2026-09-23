const multer = require('multer');
const crypto = require('node:crypto');
const path = require('node:path');
const { DocumentController } = require('../controllers/documentController');

const DEFAULT_ALLOWED_MIME_TYPES = [
  'application/pdf',
  'text/plain',
  'image/jpeg',
  'image/png',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

function createRateLimitMiddleware() {
  const requests = new Map();
  const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS || 60 * 1000);
  const maxRequests = Number(process.env.RATE_LIMIT_MAX || 120);

  return (req, res, next) => {
    const now = Date.now();
    const key = req.ip || req.socket.remoteAddress || 'unknown';
    const current = requests.get(key);

    if (!current || now - current.startedAt >= windowMs) {
      requests.set(key, { startedAt: now, count: 1 });
      return next();
    }

    current.count += 1;
    if (current.count > maxRequests) {
      res.set('Retry-After', String(Math.ceil((windowMs - (now - current.startedAt)) / 1000)));
      return res.status(429).json({ error: 'Muitas requisições. Tente novamente mais tarde.' });
    }

    next();
  };
}

function createUploadMiddleware({ storageDirectory } = {}) {
  const destination = storageDirectory || process.env.STORAGE_DIR || path.resolve(__dirname, '../../storage');
  const storage = multer.diskStorage({
    destination,
    filename: (req, file, callback) => {
      callback(null, crypto.randomUUID());
    },
  });

  return multer({
    storage,
    limits: {
      fileSize: Number(process.env.MAX_FILE_SIZE || 10 * 1024 * 1024),
      files: 1,
    },
    fileFilter: (req, file, callback) => {
      const allowedMimeTypes = (process.env.ALLOWED_MIME_TYPES || DEFAULT_ALLOWED_MIME_TYPES.join(','))
        .split(',')
        .map((mimeType) => mimeType.trim())
        .filter(Boolean);

      if (!allowedMimeTypes.includes(file.mimetype)) {
        const error = new Error('Tipo de arquivo não permitido');
        error.statusCode = 400;
        return callback(error);
      }

      callback(null, true);
    },
  }).single('file');
}

function createDocumentRoutes({ documentService, storageDirectory } = {}) {
  const router = require('express').Router();
  const controller = new DocumentController({ documentService });
  const uploadMiddleware = createUploadMiddleware({
    storageDirectory: storageDirectory || documentService.fileRepository.storageDirectory,
  });

  router.use(createRateLimitMiddleware());
  router.post('/upload', uploadMiddleware, controller.upload);
  router.get('/documents', controller.list);
  router.get('/documents/:id/download', controller.download);

  return router;
}

module.exports = { createDocumentRoutes, createUploadMiddleware };