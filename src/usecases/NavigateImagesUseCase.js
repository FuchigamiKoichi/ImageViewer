/** Use Case: NavigateImagesUseCase */
class NavigateImagesUseCase {
  /** @param {{imageRepo: import('../ports/ImageRepository')}} deps */
  constructor({ imageRepo }) { this.imageRepo = imageRepo; }
  /** @param {{ currentImageId: string, direction: 'next'|'prev', tags?: string[], logic?: 'AND'|'OR'}} state */
  async next(state) {
    return this._navigate(state, 'next');
  }
  /** @param {{ currentImageId: string, direction: 'next'|'prev', tags?: string[], logic?: 'AND'|'OR'}} state */
  async prev(state) {
    return this._navigate(state, 'prev');
  }
  async _navigate(state, dir) {
    const list = await this.imageRepo.listByFilter({ tags: state.tags, logic: state.logic, limit: 100 });
    const idx = list.items.findIndex(i => i.id === state.currentImageId);
    if (idx === -1) return null;
    const targetIdx = dir === 'next' ? idx + 1 : idx - 1;
    return list.items[targetIdx] || null;
  }
}
module.exports = NavigateImagesUseCase;
