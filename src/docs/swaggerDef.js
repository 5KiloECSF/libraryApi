const { version } = require('../../package.json');

const {PORT} = require("../config/constants");
const swaggerDef = {
  openapi: '3.0.0',
  info: {
    title: 'node-express-boilerplate API documentation',
    version,
    license: {
      name: 'MIT',
      url: 'https://github.com/hagopj13/node-express-boilerplate/blob/master/LICENSE',
    },
  },
  servers: [
    {
      url: `http://localhost:${PORT}/api/v1`,
    },
  ],
};

const options =  ({
  // import swaggerDefinitions
  swaggerDef,
  // path to the API docs
  apis: ['src/docs/*.yml', 'src/app/*/*.route.js'],
});

exports.options=options
module.exports = swaggerDef;
