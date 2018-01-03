'use strict'

var utils = require('uvwlib')

var SimpleApp = utils.class({
  fuseApps: function (apps, spec, plug) {
    apps[0] && this.onApp(apps[0], spec, plug)
  },

  onApp: function (app, spec, plug) {
    var need = spec.need.replace(/-/g, '_')
    var fn = this['need_' + need]
    if (typeof fn === 'function') fn.call(this, app, spec, plug)
  },

  onToken: function (token, spec, plug) {
    var accept = spec.accept.replace(/-|\//g, '_')
    var fn = this['accept_' + accept]
    if (typeof fn === 'function') fn.call(this, token, spec, plug)
  }
})

module.exports = SimpleApp
