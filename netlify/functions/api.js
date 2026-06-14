const serverless = require('serverless-http');
const app = require(process.cwd() + '/server');

exports.handler = serverless(app);
