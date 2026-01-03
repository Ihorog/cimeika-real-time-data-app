function makeResponse(moduleName, data = {}, status = 'ok') {
  return {
    status,
    module: moduleName,
    data,
    timestamp: new Date().toISOString()
  };
}

module.exports = { makeResponse };
