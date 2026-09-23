const express = require('express');
const { createDocumentRoutes } = require('./routes/documentRoutes');
const { DocumentService } = require('./services/documentService');
const { DocumentMetadataRepository } = require('./repositories/documentMetadataRepository');
const { LocalFileRepository } = require('./repositories/localFileRepository');

function createApp({ metadataRepository, fileRepository, storageDirectory } = {}) {
  const app = express();
  const configuredFileRepository = fileRepository || new LocalFileRepository({ storageDirectory });
  const documentService = new DocumentService({
    metadataRepository: metadataRepository || new DocumentMetadataRepository(),
    fileRepository: configuredFileRepository,
  });

  app.use(express.json());

  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.use(createDocumentRoutes({
    documentService,
    storageDirectory: storageDirectory || configuredFileRepository.storageDirectory,
  }));

  app.use((error, req, res, next) => {
    if (res.headersSent) {
      return next(error);
    }

    const status = error.code === 'LIMIT_FILE_SIZE'
      ? 413
      : error instanceof SyntaxError && error.status === 400
        ? 400
        : error.statusCode || 500;
    const message = status >= 500
      ? 'Erro interno do servidor'
      : status === 413
        ? 'O arquivo excede o limite permitido'
        : error.message || 'Erro na requisição';
    res.status(status).json({ error: message });
  });

  return app;
}

const app = createApp();
const PORT = Number(process.env.PORT || 3000);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`DMS backend ouvindo na porta ${PORT}`);
  });
}

module.exports = app;
module.exports.createApp = createApp;
