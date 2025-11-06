/** Domain Entity: Image */
class Image {
  /**
   * @param {Object} params
   * @param {string} params.id
   * @param {string} params.url
   * @param {number} params.width
   * @param {number} params.height
   * @param {Date} params.createdAt
   * @param {string[]} params.tags
   * @param {string} [params.title]
   * @param {string} [params.description]
   */
  constructor({ id, url, width, height, createdAt, tags, title, description }) {
    this.id = id; this.url = url; this.width = width; this.height = height;
    this.createdAt = createdAt; this.tags = tags || []; this.title = title; this.description = description;
  }
}
module.exports = Image;
