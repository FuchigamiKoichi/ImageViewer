const Tag = require('../../entities/Tag');
/** @implements {import('../../ports/TagRepository')} */
class InMemoryTagRepository {
  constructor(tags) { this.tags = tags || []; }
  async listAll() { return this.tags; }
  async create(tag) {
    // Check if tag id already exists
    if (this.tags.find(t => t.id === tag.id)) {
      throw new Error('Tag already exists');
    }
    this.tags.push(tag);
    return tag;
  }
}
module.exports = InMemoryTagRepository;
