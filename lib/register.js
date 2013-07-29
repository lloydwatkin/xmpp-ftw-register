var builder    = require('ltx'),
    Base       = require('xmpp-ftw/lib/base'),
    dataForm   = require('xmpp-ftw/lib/utils/xep-0004'),
    rsm        = require('xmpp-ftw/lib/utils/xep-0059')
    
var Register = function() {}

Register.prototype = new Base()

Register.prototype.registerEvents = function() {
}

Register.prototype.handles = function(stanza) {
    return false
}

Register.prototype.handle = function(stanza) {
    return false
}

module.exports = Register
