var should  = require('should')
  , register = require('../../lib/register')
  , ltx     = require('ltx')
  , helper  = require('../helper')

describe('Register', function() {

    var register, socket, xmpp, manager

    before(function() {
        socket = new helper.Eventer()
        xmpp = new helper.Eventer()
        manager = {
            socket: socket,
            client: xmpp,
            trackId: function(id, callback) {
                this.callback = callback
            },
            makeCallback: function(error, data) {
                this.callback(error, data)
            }
        }
        register = new register()
        register.init(manager)
    })

})
