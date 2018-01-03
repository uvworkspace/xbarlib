'use strict'

var utils = require('uvwlib')

var Plug = utils.class({
  init: function (app, spec) {
    spec = spec || {}

    app.plug = this // TODO: fix later

    this.app = app
    this.appType = spec.type || null
    this.forType = spec.for || null
    this.localDecls = spec.local || []
    this.xbarDecls = spec.xbar || []

    return this
  },

  setContext: function (cntx) {
    this.cntx = cntx
  },

  fusing: function () {
    var me = this
    me.localDecls.forEach(function (spec) {
      var plugs = me.cntx.closestPlugs(spec, me.appType)
      if (plugs) {
        var apps = plugs.map(function (p) { return p.app })
        // maybe empty (for update later)
        me.app.fuseApps(apps, spec, me)
      }
    })
  },

  fused: function () {
  },

  onToken: function (token) {
    var me = this
    me.xbarDecls.forEach(function (spec) {
      if (spec.accept === token.type) {
        me.app.onToken(token, spec, me)
      }
    })
  },

  onNewPlug: function (newPlug) {
    this.receive(newPlug)
    newPlug.receive(this)
  },

  receive: function (offerPlug) {
    if (typeof this.app.onApp !== 'function') return

    var me = this
    me.localDecls.forEach(function (spec) {
      if (offerPlug.appType === spec.need) {
        if (!offerPlug.forType || offerPlug.forType === me.appType) {
          me.app.onApp(offerPlug.app, spec, me)
        }
      }
    })
  }
})

module.exports = Plug
