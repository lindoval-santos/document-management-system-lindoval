const fs = require('node:fs');
const path = require('node:path');

class LocalFileRepository {
  constructor({ storageDirectory } = {}) {
    this.storageDirectory = storageDirectory || process.env.STORAGE_DIR || path.resolve(__dirname, '../../storage');
    fs.mkdirSync(this.storageDirectory, { recursive: true });
  }

  getFilePath(storedName) {
    if (!storedName || path.basename(storedName) !== storedName) {
      const error = new Error('Nome de arquivo inválido');
      error.statusCode = 400;
      throw error;
    }

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

  delete(storedName) {
    const filePath = this.getFilePath(storedName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  getDownloadPath(storedName) {
    const filePath = this.getFilePath(storedName);
    let fileStats;
    try {
      fileStats = fs.lstatSync(filePath);
    } catch (error) {
      if (error.code === 'ENOENT') {
        const notFoundError = new Error('Arquivo não encontrado');
        notFoundError.statusCode = 404;
        throw notFoundError;
      }

      throw error;
    }

    if (fileStats.isSymbolicLink() || !fileStats.isFile()) {
      const error = new Error('Arquivo não encontrado');
      error.statusCode = 404;
      throw error;
    }

    return filePath;
  }
}

module.exports = { LocalFileRepository };