var builder    = require('ltx'),
    Base       = require('xmpp-ftw/lib/base'),
    dataForm   = require('xmpp-ftw/lib/utils/xep-0004'),
    rsm        = require('xmpp-ftw/lib/utils/xep-0059')
    
var Register = function() {}

Register.prototype = new Base()

Register.prototype.NS = 'jabber:iq:register'

Register.prototype.registerEvents = function() {
    var self = this
    this.socket.on('xmpp.register.get', function(data, callback) {
        self.get(data, callback)
    })
}

Register.prototype.handles = function(stanza) {
    return false
}

Register.prototype.handle = function(stanza) {
    return false
}

Register.prototype.get = function(data, callback) {
    var self = this
    if (typeof callback !== 'function')
        return this._clientError('Missing callback', data)
    if (!data.to)
        return this._clientError("Missing 'to' key", data, callback)
    var stanza = new builder.Element(
        'iq',
        { to: data.to, type: 'get', id: this._getId() }
    ).c('register', { xmlns: this.NS })
  
    this.manager.trackId(stanza.root().attr('id'), function(stanza) {
        if ('error' == stanza.attrs.type)
            return callback(self._parseError(stanza), null)
    })
    this.client.send(stanza)
}

module.exports = Register
