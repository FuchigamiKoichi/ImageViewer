/** Use Case: DeleteImageUseCase */
class DeleteImageUseCase {
  /** @param {{imageRepo: import('../ports/ImageRepository')}} deps */
  constructor({ imageRepo }) { this.imageRepo = imageRepo; }
  /** @param {string} id */
  async execute(id) {
    return this.imageRepo.deleteById(id);
  }
}
module.exports = DeleteImageUseCase;
