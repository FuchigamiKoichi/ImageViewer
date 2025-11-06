/** Presenter: ViewerPresenter */
class ViewerPresenter {
  toViewModel(image) {
    if (!image) return null;
    return {
      id: image.id,
      url: image.url,
      size: { width: image.width, height: image.height },
      tags: image.tags,
      title: image.title
    };
  }
}
module.exports = ViewerPresenter;
