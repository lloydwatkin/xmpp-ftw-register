'use strict';

var builder    = require('ltx')
  , Base       = require('xmpp-ftw').Base
  , dataForm   = require('xmpp-ftw').utils['xep-0004']
  , oob        = require('xmpp-ftw').utils['xep-0066']

var Register = function() {}

Register.prototype = new Base()

Register.prototype.NS = 'jabber:iq:register'
Register.prototype.NS_CANCEL = 'jabber:iq:register:cancel'
Register.prototype.NS_CHANGE_PASSWORD = 'jabber:iq:register:changepassword'

Register.prototype._events = {
    'xmpp.register.get': 'get',
    'xmpp.register.set': 'set',
    'xmpp.register.unregister': 'unregister',
    'xmpp.register.password': 'changePassword'
}

Register.prototype.handles = function() {
    return false
}

Register.prototype.handle = function() {
    return false
}

Register.prototype.get = function(data, callback) {
    var self = this
    if (typeof callback !== 'function')
        return this._clientError('Missing callback', data)
    if (!data.to)
        return this._clientError('Missing \'to\' key', data, callback)
    var stanza = new builder.Element(
        'iq',
        { to: data.to, type: 'get', id: this._getId() }
    ).c('query', { xmlns: this.NS })

    this.manager.trackId(stanza, function(stanza) {
        if ('error' === stanza.attrs.type)
            return callback(self._parseError(stanza), null)
        var query = stanza.getChild('query', self.NS)
        var data = {}
        var instructions, value
        var fields = [ 'username', 'password', 'email' ]
        fields.forEach(function(field) {
            if (null != (value = query.getChild(field))) {
                data[field] = (0 === value.getText().length) ?
                true : value.getText()
            }
        })
        if (null != (instructions = query.getChild('instructions')))
            data.instructions = instructions.getText()
        if (null != query.getChild('registered'))
            data.registered = true
        var x
        if (null != (x = query.getChild('x', dataForm.NS)))
            data.form = dataForm.parseFields(x)
        if (null != query.getChild('x', oob.NS_X))
            data.oob = oob.parse(query)
        callback(null, data)
    })
    this.client.send(stanza)
}

Register.prototype.set = function(data, callback) {
    this._register(data, callback)
}

Register.prototype.changePassword = function(data, callback) {
    this._register(data, callback, this.NS_CHANGE_PASSWORD)
}

Register.prototype._register = function(data, callback, namespace) {

    var self = this
    if (typeof callback !== 'function')
        return this._clientError('Missing callback', data)
    if (!data.to)
        return this._clientError('Missing \'to\' key', data, callback)
    var stanza = new builder.Element(
        'iq',
        { to: data.to, type: 'set', id: this._getId() }
    ).c('query', { xmlns: this.NS })

    var fields = [ 'username', 'password', 'email' ]
    fields.forEach(function(field) {
        if (data[field])
            stanza.c(field).t(data[field]).up()
    })

    if (data.form) {
        try {
            dataForm.addForm(
                stanza,
                data.form,
                namespace || this.NS
            )
        } catch(e) {
            return this._clientError(
                'Badly formatted data form', data, callback
            )
        }
    }

    this.manager.trackId(stanza, function(stanza) {
        if ('error' === stanza.attrs.type) {
            var error = self._parseError(stanza)
            var query, x
            if (!!(query = stanza.getChild('query', this.NS)) &&
                !!(x = query.getChild('x', dataForm.NS))) {
                error.form = dataForm.parseFields(x)
            }
            return callback(error)
        }
        var data = { registered: true }
        callback(null, data)
    })
    this.client.send(stanza)
}

Register.prototype.unregister = function(data, callback) {
    if (typeof callback !== 'function')
        return this._clientError('Missing callback', data)
    if (!data.to)
        return this._clientError('Missing \'to\' key', data, callback)
    var stanza = new builder.Element(
        'iq',
        { to: data.to, type: 'set', id: this._getId() }
    ).c('query', { xmlns: this.NS })
    if (data.form) {
        try {
            dataForm.addForm(
                stanza,
                data.form,
                this.NS_CANCEL
            )
        } catch(e) {
            return this._clientError(
                'Badly formatted data form', data, callback
            )
        }
    } else {
        stanza.c('remove')
    }
    var self = this
    this.manager.trackId(stanza, function(stanza) {
        if ('error' === stanza.attrs.type) {
            var error = self._parseError(stanza)
            var query, x
            if (!!(query = stanza.getChild('query', this.NS)) &&
                !!(x = query.getChild('x', dataForm.NS))
            ) {
                error.form = dataForm.parseFields(x)
            }
            return callback(error)
        }
        callback(null, true)
    })
    this.client.send(stanza)
}

module.exports = Register