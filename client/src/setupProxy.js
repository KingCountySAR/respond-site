const { debug } = require('console');
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(createProxyMiddleware('/socket', {
    target: 'http://localhost:3333',
    ws: true,
    //changeOrigin: true,
    logLevel: 'debug',
  }));
  app.use(createProxyMiddleware('/api', {
    target: 'http://localhost:3333',
   // changeOrigin: true,
    logLevel: 'debug',
  }));
};