/** Use Case: CreateTagUseCase */
class CreateTagUseCase {
  /** @param {{tagRepo: import('../ports/TagRepository')}} deps */
  constructor({ tagRepo }) { this.tagRepo = tagRepo; }
  /** @param {{id: string, name: string, color?: string, order?: number}} input */
  async execute(input) {
    const Tag = require('../entities/Tag');
    const tag = new Tag(input);
    return this.tagRepo.create(tag);
  }
}
module.exports = CreateTagUseCase;
