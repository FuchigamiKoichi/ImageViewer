const TabPreset = require('../../entities/TabPreset');
/** @implements {import('../../ports/TabPresetRepository')} */
class InMemoryTabPresetRepository {
  constructor(tabPresets) { this.tabPresets = tabPresets || []; }
  async listAll() { return this.tabPresets; }
}
module.exports = InMemoryTabPresetRepository;
