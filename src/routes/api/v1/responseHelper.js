function createResponse(moduleName, payload = {}) {
  return {
    status: 'ok',
    module: moduleName,
    payload
  };
}

module.exports = createResponse;
