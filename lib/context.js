'use strict'

var utils = require('uvwlib')
var Plug = require('./plug')

var Context = utils.class({
  init: function (parent) {
    this.parent = parent || null
    this.children = []
    this.plugList = []
    this._fused = false
    return this
  },

  isFused: function () {
    return this._fused
  },

  addChild: function () {
    var child = Context.instance(this)
    this.children.push(child)
    return child
  },

  join: function (app, spec) {
    this.plugIn(Plug.instance(app, spec || app.SPEC))
  },

  plugIn: function (plug) {
    if (!plug || this.plugList.indexOf(plug) >= 0) return

    plug.setContext(this)
    this.plugList.push(plug)

    if (this._fused) this._insertPlug(plug)
  },

  closestPlugs: function (spec, appType) {
    var plugs = this.plugList.filter(function (p) {
      return p.forType !== 'none' && p.appType === spec.need
    })

    if (plugs.length && appType) {
      var specifics = plugs.filter(function (p) {
        return p.forType === appType
      })
      plugs = specifics.length ? specifics : plugs.filter(function (p) { return !p.forType })
    }

    return plugs.length ? plugs : (this.parent && this.parent.closestPlugs(spec, appType))
  },

  fuse: function () {
    if (!this._fused) this._fuse(false)
  },

  _fuse: function (secondPass) {
    if (!secondPass) {
      this.plugList.forEach(function (plug) {
        plug.fusing()
      })
      this.children.forEach(function (child) {
        child.fuse()
      })
      if (!this.parent) this._fuse(true) // second pass
    } else {
      this._fused = true
      this.plugList.forEach(function (plug) {
        plug.fused()
      })
      this.children.forEach(function (child) {
        child._fuse(true)
      })
    }
  },

  push: function (token, fromCntx) {
    var me = this
    me.plugList.forEach(function (plug) {
      plug.onToken(token)
    })
    me.children.forEach(function (child) {
      if (child !== fromCntx) child.push(token, me)
    })
    if (me.parent && me.parent !== fromCntx) {
      me.parent.push(token, me)
    }
  },

  _insertPlug: function (newPlug, fromCntx) {
    var me = this
    me.plugList.forEach(function (plug) {
      if (plug !== newPlug) plug.onNewPlug(newPlug)
    })

    me.children.forEach(function (child) {
      if (child !== fromCntx) child._insertPlug(newPlug, me)
    })
    if (me.parent && me.parent !== fromCntx) {
      me.parent._insertPlug(newPlug, me)
    }
  }
})

module.exports = Context
