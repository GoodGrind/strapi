'use strict';

const UNIDENTIFIED_USER_ID = '-1';
const MISSING_AUTHORIZATION = {
  id: UNIDENTIFIED_USER_ID,
  username: 'missing'
};
const INVALID_TOKEN_FORMAT = {
  id: UNIDENTIFIED_USER_ID,
  username: 'invalid'
}

function decodedPayloadFromAuthorizationHeader(authorizationHeader) {
  if (authorizationHeader == null) {
    return MISSING_AUTHORIZATION;
  }
  if (typeof authorizationHeader !== 'string') {
    return INVALID_TOKEN_FORMAT;
  }

  const base64Url = authorizationHeader.split('.')[1];
  if (base64Url == null) {
    return INVALID_TOKEN_FORMAT;
  }

  const base64String = base64Url.replace('-', '+').replace('_', '/');
  const decodedBase64String = new Buffer(base64String, 'base64').toString();
  const parsedAuthorizationPayload = JSON.parse(decodedBase64String);
  return {
    id: parsedAuthorizationPayload.id,
    username: parsedAuthorizationPayload.username
  };
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
          const tokenPayload = decodedPayloadFromAuthorizationHeader(authorizationHeader);
          const userId = tokenPayload.id;
          const username = tokenPayload.username;
          strapi.log.debug(start.toUTCString() + ' ' + userId + ':' + username + ' ' + this.method + ' ' + this.url + ' (' + ms + 'ms)');
        });
      }

      cb();
    }
  };

  return hook;
};
