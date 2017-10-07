const path = require('path');
const hapi = require('hapi');
const inert = require('inert');
const products = require('./public/server/db.json');
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

  // server.route({
  //   method: 'GET',
  //   path: '/public/api/products',
  //   handler(request, reply) {
  //     reply(products);
  //   }
  // });

  server.route([
    {
      path: '/public/server/db.json',
      method: 'GET',
      handler(request, reply) {
        reply(products.products);
      }
    },
    {
      method: 'POST',
      path: '/api/products',
      handler(request, reply) {
        const { id, name, description, price } = request.payload;
        const priceV = parseInt(price, 10);
        //3/ Validate each required parameter
        if (!id) {
          reply(boom.badRequest('missing id'));
          return;
        }
        if (!name) {
          reply(boom.badRequest('missing name'));
          return;
        }
        if (!description) {
          reply(boom.badRequest('missing description'));
          return;
        }
        if (isNaN(priceV)) {
          reply(boom.badRequest('invalid price'));
          return;
        }

        //3/ After entire validation add product and return a response.
        const product = { id, name, description, price: priceV };
        products.add(product);
        reply(product).code(201);
      }
    },
    // {
    //   path: '/public/server/db.json',
    //   method: 'GET',
    //   handler(request, reply) {
    //      reply(products.products);
    //   }
    // },
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
