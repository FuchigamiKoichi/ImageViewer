/** Port: UrlStateGateway */
class UrlStateGateway {
  /** @returns {{imageId?: string, tags?: string[], logic?: 'AND'|'OR', page?: number}} */
  read() { throw new Error('Not implemented'); }
  /** @param {{imageId?: string, tags?: string[], logic?: 'AND'|'OR', page?: number}} state */
  // eslint-disable-next-line no-unused-vars
  write(state) { throw new Error('Not implemented'); }
}
module.exports = UrlStateGateway;
