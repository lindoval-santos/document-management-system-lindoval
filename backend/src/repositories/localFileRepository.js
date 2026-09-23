const fs = require('node:fs');
const path = require('node:path');

class LocalFileRepository {
  constructor({ storageDirectory } = {}) {
    this.storageDirectory = storageDirectory || process.env.STORAGE_DIR || path.resolve(__dirname, '../../storage');
    fs.mkdirSync(this.storageDirectory, { recursive: true });
  }

  getFilePath(storedName) {
    const resolvedPath = path.resolve(this.storageDirectory, storedName);
    const storageRoot = `${path.resolve(this.storageDirectory)}${path.sep}`;

    if (!resolvedPath.startsWith(storageRoot)) {
      const error = new Error('Nome de arquivo inválido');
      error.statusCode = 400;
      throw error;
    }

    return resolvedPath;
  }

  exists(storedName) {
    return fs.existsSync(this.getFilePath(storedName));
  }

  getDownloadPath(storedName) {
    const filePath = this.getFilePath(storedName);
    if (!fs.existsSync(filePath)) {
      const error = new Error('Arquivo não encontrado');
      error.statusCode = 404;
      throw error;
    }

    return filePath;
  }
}

module.exports = { LocalFileRepository };