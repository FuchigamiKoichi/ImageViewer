/**
 * Port: ImageRepository
 * @interface
 */
class ImageRepository {
  /** @param {{tags?: string[], logic?: 'AND'|'OR', cursor?: number, limit?: number}} q */
  // eslint-disable-next-line no-unused-vars
  async listByFilter(q) { throw new Error('Not implemented'); }
  /** @param {string} id */
  // eslint-disable-next-line no-unused-vars
  async getById(id) { throw new Error('Not implemented'); }
  /** @param {Buffer|any} file @param {string[]} tags */
  // eslint-disable-next-line no-unused-vars
  async upload(file, tags) { throw new Error('Not implemented'); }
  /** @param {string} id */
  // eslint-disable-next-line no-unused-vars
  async deleteById(id) { throw new Error('Not implemented'); }
  /** @param {string} id @param {{title?: string, description?: string, tags?: string[]}} updates */
  // eslint-disable-next-line no-unused-vars
  async updateById(id, updates) { throw new Error('Not implemented'); }
}
module.exports = ImageRepository;
