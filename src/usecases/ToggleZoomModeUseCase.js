/** Use Case: ToggleZoomModeUseCase */
class ToggleZoomModeUseCase {
  /** @param {{}} deps */
  constructor(deps={}) {}
  /** @param {{ currentMode: 'FIT'|'ACTUAL'|'CUSTOM', customScale?: number, nextMode?: 'FIT'|'ACTUAL'|'CUSTOM'}} input */
  execute(input) {
    const order = ['FIT','ACTUAL','CUSTOM'];
    let next = input.nextMode;
    if (!next) {
      const idx = order.indexOf(input.currentMode || 'FIT');
      next = order[(idx + 1) % order.length];
    }
    return { mode: next, scale: next === 'CUSTOM' ? (input.customScale || 2) : (next === 'ACTUAL' ? 1 : 'auto') };
  }
}
module.exports = ToggleZoomModeUseCase;
