const Image = require('../../entities/Image');
/** @implements {import('../../ports/ImageRepository')} */
class InMemoryImageRepository {
  constructor(images) { this.images = images || []; }
  /** @param {{tags?: string[], logic?: 'AND'|'OR', cursor?: number, limit?: number}} q */
  async listByFilter(q={}) {
    const tags = q.tags || [];
    const logic = q.logic || 'AND';
    let filtered = this.images;
    if (tags.length) {
      filtered = this.images.filter(img => {
        const has = tags.map(t => img.tags.includes(t));
        return logic === 'AND' ? has.every(Boolean) : has.some(Boolean);
      });
    }
    const cursor = q.cursor || 0; const limit = q.limit || 50;
    const items = filtered.slice(cursor, cursor + limit);
    const nextCursor = cursor + limit < filtered.length ? cursor + limit : undefined;
    return { items, nextCursor, total: filtered.length };
  }
  async getById(id) { return this.images.find(i => i.id === id) || null; }
  async upload(file, tags) {
    // If a file path/url is provided from framework, use it; otherwise fallback placeholder
    const id = String(Date.now());
    let url = `/uploads/${id}.jpg`;
    if (typeof file === 'string' && file) {
      // If absolute http(s) URL, keep as-is; if starts with '/', keep; otherwise prefix '/'
      const isHttp = /^https?:\/\//i.test(file);
      url = isHttp ? file : (file.startsWith('/') ? file : `/${file}`);
    }
    const img = new Image({ id, url, width: 800, height: 600, createdAt: new Date(), tags: tags || [] });
    this.images.unshift(img);
    return img;
  }
  async deleteById(id) {
    const index = this.images.findIndex(i => i.id === id);
    if (index === -1) return false;
    this.images.splice(index, 1);
    return true;
  }
  async updateById(id, updates) {
    const img = this.images.find(i => i.id === id);
    if (!img) return null;
    if (updates.title !== undefined) img.title = updates.title;
    if (updates.description !== undefined) img.description = updates.description;
    if (updates.tags !== undefined) img.tags = updates.tags;
    return img;
  }
}
module.exports = InMemoryImageRepository;
