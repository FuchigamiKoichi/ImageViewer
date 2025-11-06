/** Use Case: GetImageDetailUseCase */
class GetImageDetailUseCase {
  /** @param {{imageRepo: import('../ports/ImageRepository')}} deps */
  constructor({ imageRepo }) { this.imageRepo = imageRepo; }
  /** @param {string} id */
  async execute(id) { return this.imageRepo.getById(id); }
}
module.exports = GetImageDetailUseCase;
