'use strict';

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
          strapi.log.debug(start.toUTCString() + ' ' + this.method + ' ' + this.url + ' (' + ms + 'ms)');
          strapi.log.debug(JSON.stringify(this.request.header));
        });
      }

      cb();
    }
  };

  return hook;
};
