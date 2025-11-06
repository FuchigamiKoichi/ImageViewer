/** @implements {import('../../ports/UrlStateGateway')} */
class UrlStateGatewayImpl {
  constructor() { this._state = {}; }
  read() { return this._state; }
  write(state) { this._state = { ...this._state, ...state }; }
}
module.exports = UrlStateGatewayImpl;
