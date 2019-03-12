'use strict';

function decodedPayloadFromJWT(token) {
  if (!token) {
    return {
      id: '-1',
      userName: 'missing authorization'
    };
  }

  const base64Url = token.split('.')[1];
  const base64String = base64Url.replace('-', '+').replace('_', '/');
  return JSON.parse(new Buffer(base64String, 'base64').toString());
}

/**
 * Logger hook
 */

module.exports = function (strapi) {
  const hook = {

    /**
     * Default options
     */

    defaults: {
      logger: true
    },

    /**
     * Initialize the hook
     */

    initialize: function (cb) {
      if (strapi.config.logger === true) {
        strapi.app.use(function * (next) {
          const start = new Date();
          yield next;
          const ms = new Date() - start;
          const authorizationHeader = this.request.header.authorization;
          const tokenPayload = decodedPayloadFromJWT(authorizationHeader);
          const userId = tokenPayload.id;
          const userName = tokenPayload.username;
          strapi.log.debug(start.toUTCString() + ' ' + userId + ':' + userName + ' ' + this.method + ' ' + this.url + ' (' + ms + 'ms)');
        });
      }

      cb();
    }
  };

  return hook;
};
