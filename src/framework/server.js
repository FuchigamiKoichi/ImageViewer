const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const InMemoryImageRepository = require('../adapters/repositories/InMemoryImageRepository');
const InMemoryTagRepository = require('../adapters/repositories/InMemoryTagRepository');
const InMemoryTabPresetRepository = require('../adapters/repositories/InMemoryTabPresetRepository');
const UrlStateGatewayImpl = require('../adapters/gateways/UrlStateGatewayImpl');
const FilterImagesUseCase = require('../usecases/FilterImagesUseCase');
const GetImageDetailUseCase = require('../usecases/GetImageDetailUseCase');
const NavigateImagesUseCase = require('../usecases/NavigateImagesUseCase');
const ToggleZoomModeUseCase = require('../usecases/ToggleZoomModeUseCase');
const UpdateUrlStateUseCase = require('../usecases/UpdateUrlStateUseCase');
const UploadImageUseCase = require('../usecases/UploadImageUseCase');
const CreateTagUseCase = require('../usecases/CreateTagUseCase');
const DeleteImageUseCase = require('../usecases/DeleteImageUseCase');
const UpdateImageUseCase = require('../usecases/UpdateImageUseCase');
const GalleryPresenter = require('../adapters/presenters/GalleryPresenter');
const ViewerPresenter = require('../adapters/presenters/ViewerPresenter');
const { seedImages, seedTags, seedTabPresets } = require('../data/seed');

// Instantiate repositories & gateway
const imageRepo = new InMemoryImageRepository(seedImages());
const tagRepo = new InMemoryTagRepository(seedTags());
const tabPresetRepo = new InMemoryTabPresetRepository(seedTabPresets());
const urlStateGateway = new UrlStateGatewayImpl();

// Instantiate use cases
const filterImagesUC = new FilterImagesUseCase({ imageRepo });
const getImageDetailUC = new GetImageDetailUseCase({ imageRepo });
const navigateImagesUC = new NavigateImagesUseCase({ imageRepo });
const toggleZoomUC = new ToggleZoomModeUseCase({});
const updateUrlStateUC = new UpdateUrlStateUseCase({ urlStateGateway });
const uploadImageUC = new UploadImageUseCase({ imageRepo });
const createTagUC = new CreateTagUseCase({ tagRepo });
const deleteImageUC = new DeleteImageUseCase({ imageRepo });
const updateImageUC = new UpdateImageUseCase({ imageRepo });

// Presenters
const galleryPresenter = new GalleryPresenter();
const viewerPresenter = new ViewerPresenter();

function send(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(body);
}

// Ensure uploads directory exists (store under app/uploads as requested)
const uploadsDir = path.join(__dirname, '..', '..', 'app', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url, true);
  const pathname = parsed.pathname;
  
  // Serve index.html at root
  if (req.method === 'GET' && pathname === '/') {
    const indexPath = path.join(__dirname, 'index.html');
    fs.readFile(indexPath, 'utf8', (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(data);
    });
    return;
  }

  // Serve static uploaded files
  if (req.method === 'GET' && pathname.startsWith('/uploads/')) {
    // Prevent path traversal
    const rel = pathname.replace(/^\/uploads\//, '');
    const safeRel = rel.replace(/\.\.+/g, '');
    const filePath = path.join(uploadsDir, safeRel);
    if (!filePath.startsWith(uploadsDir)) {
      res.writeHead(403); res.end('Forbidden'); return;
    }
    fs.stat(filePath, (err, stat) => {
      if (err || !stat.isFile()) { res.writeHead(404); res.end('Not found'); return; }
      const ext = path.extname(filePath).toLowerCase();
      const types = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif', '.webp': 'image/webp' };
      const type = types[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'public, max-age=31536000, immutable' });
      fs.createReadStream(filePath).pipe(res);
    });
    return;
  }

  if (req.method === 'GET' && pathname === '/images') {
    const { tags, logic, cursor, limit } = parsed.query;
    const tagArr = tags ? tags.split(',').filter(Boolean) : [];
    const result = await filterImagesUC.execute({ tags: tagArr, logic: logic === 'OR' ? 'OR' : 'AND', cursor: cursor? Number(cursor):0, limit: limit? Number(limit):50 });
    return send(res, 200, galleryPresenter.toViewModel(result));
  }
  if (req.method === 'GET' && pathname.startsWith('/images/')) {
    const id = pathname.split('/')[2];
    const image = await getImageDetailUC.execute(id);
    if (!image) return send(res, 404, { error: 'Not found' });
    return send(res, 200, viewerPresenter.toViewModel(image));
  }
  if (req.method === 'GET' && pathname === '/tags') {
    const tags = await tagRepo.listAll();
    return send(res, 200, tags);
  }
  if (req.method === 'GET' && pathname === '/tabs') {
    const tabs = await tabPresetRepo.listAll();
    return send(res, 200, tabs);
  }
  if (req.method === 'POST' && pathname === '/upload') {
    let body=''; req.on('data', c => body += c); req.on('end', async () => {
      let input; try { input = JSON.parse(body || '{}'); } catch { input = {}; }
      const { url, dataUrl, title, description, tags } = input;
      if ((!url && !dataUrl)) return send(res, 400, { error: 'URL or dataUrl is required' });
      if (!tags || !Array.isArray(tags) || tags.length === 0) {
        return send(res, 400, { error: 'At least one tag is required' });
      }

      let storedPath = url; // default to remote URL
      if (dataUrl) {
        // Expect data URL: data:<mime>;base64,<data>
        const m = /^data:(.+);base64,(.+)$/.exec(dataUrl);
        if (!m) return send(res, 400, { error: 'Invalid dataUrl format' });
        const mime = m[1];
        const b64 = m[2];
        const map = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/gif': '.gif', 'image/webp': '.webp' };
        const ext = map[mime] || '.bin';
        const filename = `${Date.now()}${ext}`;
        const filePath = path.join(uploadsDir, filename);
        try {
          fs.writeFileSync(filePath, Buffer.from(b64, 'base64'));
        } catch (e) {
          return send(res, 500, { error: 'Failed to save file' });
        }
        storedPath = `/uploads/${filename}`;
      }

      const img = await uploadImageUC.execute({ file: storedPath, tags });
      if (title) img.title = title;
      if (description) img.description = description;
      return send(res, 201, viewerPresenter.toViewModel(img));
    }); return;
  }
  if (req.method === 'POST' && pathname === '/zoom/toggle') {
    let body=''; req.on('data', c => body += c); req.on('end', () => {
      let input; try { input = JSON.parse(body || '{}'); } catch { input = {}; }
      const vm = toggleZoomUC.execute({ currentMode: input.currentMode || 'FIT', customScale: input.customScale });
      send(res, 200, vm);
    });
    return;
  }
  if (req.method === 'POST' && pathname === '/state') {
    let body=''; req.on('data', c => body += c); req.on('end', () => {
      let input; try { input = JSON.parse(body || '{}'); } catch { input = {}; }
      updateUrlStateUC.execute(input);
      send(res, 200, { ok: true });
    });
    return;
  }
  if (req.method === 'GET' && pathname === '/state') {
    return send(res, 200, urlStateGateway.read());
  }
  if (req.method === 'POST' && pathname === '/tags') {
    let body=''; req.on('data', c => body += c); req.on('end', async () => {
      let input; try { input = JSON.parse(body || '{}'); } catch { input = {}; }
      const { id, name, color, order } = input;
      if (!id || !name) return send(res, 400, { error: 'id and name are required' });
      try {
        const tag = await createTagUC.execute({ id, name, color, order });
        return send(res, 201, tag);
      } catch (e) {
        return send(res, 400, { error: e.message });
      }
    }); return;
  }
  if (req.method === 'DELETE' && pathname.startsWith('/images/')) {
    const id = pathname.split('/')[2];
    const success = await deleteImageUC.execute(id);
    if (!success) return send(res, 404, { error: 'Not found' });
    return send(res, 200, { ok: true });
  }
  if (req.method === 'PUT' && pathname.startsWith('/images/')) {
    const id = pathname.split('/')[2];
    let body=''; req.on('data', c => body += c); req.on('end', async () => {
      let input; try { input = JSON.parse(body || '{}'); } catch { input = {}; }
      const { title, description, tags } = input;
      if (tags && (!Array.isArray(tags) || tags.length === 0)) {
        return send(res, 400, { error: 'At least one tag is required' });
      }
      const img = await updateImageUC.execute(id, { title, description, tags });
      if (!img) return send(res, 404, { error: 'Not found' });
      return send(res, 200, viewerPresenter.toViewModel(img));
    }); return;
  }
  send(res, 404, { error: 'Route not found' });
});

const PORT = process.env.PORT || 3000;
if (require.main === module) {
  server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}
module.exports = server;
