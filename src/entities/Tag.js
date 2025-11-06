/** Domain Entity: Tag */
class Tag {
  /**
   * @param {Object} params
   * @param {string} params.id
   * @param {string} params.name
   * @param {string} [params.color]
   * @param {number} [params.order]
   */
  constructor({ id, name, color, order }) {
    this.id = id; this.name = name; this.color = color; this.order = order;
  }
}
module.exports = Tag;
