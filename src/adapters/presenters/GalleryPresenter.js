/** Presenter: GalleryPresenter
 * Transforms use case output to simple JSON view model.
 */
class GalleryPresenter {
  toViewModel(paged) {
    return {
      total: paged.total,
      nextCursor: paged.nextCursor,
      items: paged.items.map(i => ({ id: i.id, url: i.url, tags: i.tags }))
    };
  }
}
module.exports = GalleryPresenter;
