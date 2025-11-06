/**
 * Use Case: FilterImagesUseCase
 * Input: { tags?: string[], logic?: 'AND'|'OR', cursor?: number, limit?: number }
 * Output: { items: Image[], nextCursor?: number, total: number }
 */
class FilterImagesUseCase {
  /** @param {{imageRepo: import('../ports/ImageRepository')}} deps */
  constructor({ imageRepo }) {
    this.imageRepo = imageRepo;
  }
  /** @param {{ tags?: string[], logic?: 'AND'|'OR', cursor?: number, limit?: number }} criteria */
  async execute(criteria) {
    return this.imageRepo.listByFilter(criteria || {});
  }
}
module.exports = FilterImagesUseCase;
