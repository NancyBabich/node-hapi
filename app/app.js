const path = require('path');
const hapi = require('hapi');
const inert = require('inert');
const products = require('./public/api/products.json');
const blipp = require('blipp');
const good = require('good');

const server = new hapi.Server();
server.connection({ port: 3000, host: 'localhost' });

server.register(inert, err => {
  server.route({
    method: 'GET',
    path: '/{param*}',
    handler: {
      directory: {
        path: path.join(__dirname, 'public'),
        listing: true
      }
    }
  });

  // server.route([
  //   {
  //     method: 'GET',
  //     path: '/',
  //     config: {
  //       description: 'The homepage'
  //     },
  //     handler(request, reply) {
  //       reply(products);
  //     }
  //   }
  // ]);

  server.route({
    method: 'GET',
    path: '/api/products',
    handler(request, reply) {
      reply(products);
    }
  });

  server.route([
    {
      path: '/',
      method: 'GET',
      handler(request, reply) {
        return reply({ message: 'Hapi to see you!' });
      }
    },
    {
      path: '/error',
      method: 'GET',
      handler() {
        throw new Error();
      }
    }
  ]);

  const goodOptions = {
    reporters: {
      consoleLogger: [
        {
          module: 'good-squeeze',
          name: 'Squeeze',
          args: [
            {
              log: '*',
              response: '*',
              ops: '*',
              error: '*'
            }
          ]
        },
        {
          module: 'good-console'
        },
        'stdout'
      ]
    }
  };

  server.register({ register: good, options: goodOptions }, () => {
    server.start(err => {
      console.log(`Server running at: ${server.info.uri}`);
    });
  });
});
