/** Use Case: UpdateImageUseCase */
class UpdateImageUseCase {
  /** @param {{imageRepo: import('../ports/ImageRepository')}} deps */
  constructor({ imageRepo }) { this.imageRepo = imageRepo; }
  /** @param {string} id @param {{title?: string, description?: string, tags?: string[]}} updates */
  async execute(id, updates) {
    return this.imageRepo.updateById(id, updates);
  }
}
module.exports = UpdateImageUseCase;
