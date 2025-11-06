/** Domain Entity: TabPreset */
class TabPreset {
  /**
   * @param {Object} params
   * @param {string} params.id
   * @param {string} params.name
   * @param {string[]} params.tagIds
   * @param {('AND'|'OR')} params.logic
   */
  constructor({ id, name, tagIds, logic }) {
    this.id = id; this.name = name; this.tagIds = tagIds || []; this.logic = logic || 'AND';
  }
}
module.exports = TabPreset;
