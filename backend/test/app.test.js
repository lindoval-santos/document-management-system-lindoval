const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const appModule = require('../src/app');
const app = appModule;

// Teste de fumaça do seed: garante que o app Express foi exportado.
// Novos testes serão adicionados durante os Steps 2, 6 e 7 com auxílio do Copilot.
test('o app backend é exportado', () => {
  assert.ok(app, 'o app deve estar definido');
  assert.strictEqual(typeof app, 'function', 'o app Express deve ser uma função');
});

test('realiza upload, lista e baixa um documento', async () => {
  const storageDirectory = await fs.mkdtemp(path.join(os.tmpdir(), 'dms-test-'));
  const testApp = appModule.createApp({ storageDirectory });
  const server = testApp.listen(0);

  try {
    const address = server.address();
    const formData = new FormData();
    formData.append('file', new Blob(['conteúdo de teste'], { type: 'text/plain' }), 'teste.txt');

    const uploadResponse = await fetch(`http://127.0.0.1:${address.port}/upload`, {
      method: 'POST',
      headers: { 'X-User-Id': 'user-1' },
      body: formData,
    });

    assert.strictEqual(uploadResponse.status, 201);
    const document = await uploadResponse.json();
    assert.strictEqual(document.originalName, 'teste.txt');
    assert.strictEqual(document.owner, 'user-1');
    assert.strictEqual(document.size, 18);
    assert.strictEqual(Object.hasOwn(document, 'storedName'), true);

    const listResponse = await fetch(`http://127.0.0.1:${address.port}/documents?owner=user-1`);
    assert.strictEqual(listResponse.status, 200);
    assert.deepStrictEqual(await listResponse.json(), [document]);

    const downloadResponse = await fetch(`http://127.0.0.1:${address.port}/documents/${document.id}/download`);
    assert.strictEqual(downloadResponse.status, 200);
    assert.strictEqual(await downloadResponse.text(), 'conteúdo de teste');
  } finally {
    await new Promise((resolve) => server.close(resolve));
    await fs.rm(storageDirectory, { recursive: true, force: true });
  }
});

test('rejeita upload sem arquivo', async () => {
  const testApp = appModule.createApp();
  const server = testApp.listen(0);

  try {
    const address = server.address();
    const response = await fetch(`http://127.0.0.1:${address.port}/upload`, { method: 'POST' });

    assert.strictEqual(response.status, 400);
    assert.deepStrictEqual(await response.json(), { error: 'O arquivo é obrigatório' });
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
