/** Use Case: UpdateUrlStateUseCase */
class UpdateUrlStateUseCase {
  /** @param {{urlStateGateway: import('../ports/UrlStateGateway')}} deps */
  constructor({ urlStateGateway }) { this.urlStateGateway = urlStateGateway; }
  /** @param {{imageId?: string, tags?: string[], logic?: 'AND'|'OR', page?: number}} state */
  execute(state) { this.urlStateGateway.write(state); }
}
module.exports = UpdateUrlStateUseCase;
