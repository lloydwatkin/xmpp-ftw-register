var should  = require('should')
  , Register = require('../../lib/register')
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
        register = new Register()
        register.init(manager)
    })

    describe('Get registration details', function() {

        it('Errors when no callback provided', function(done) {
            xmpp.once('stanza', function() {
                done('Unexpected outgoing stanza')
            })
            socket.once('xmpp.error.client', function(error) {
                error.type.should.equal('modify')
                error.condition.should.equal('client-error')
                error.description.should.equal("Missing callback")
                error.request.should.eql({})
                xmpp.removeAllListeners('stanza')
                done()
            })
            socket.emit('xmpp.register.get', {})
        })

        it('Errors when non-function callback provided', function(done) {
            xmpp.once('stanza', function() {
                done('Unexpected outgoing stanza')
            })
            socket.once('xmpp.error.client', function(error) {
                error.type.should.equal('modify')
                error.condition.should.equal('client-error')
                error.description.should.equal("Missing callback")
                error.request.should.eql({})
                xmpp.removeAllListeners('stanza')
                done()
            })
            socket.emit('xmpp.register.get', {}, true)
        })
 
        it('Errors if missing \'to\' key', function(done) {
            var request = {}
            xmpp.once('stanza', function() {
                done('Unexpected outgoing stanza')
            })
            var callback = function(error, success) {
                should.not.exist(success)
                error.type.should.equal('modify')
                error.condition.should.equal('client-error')
                error.description.should.equal("Missing 'to' key")
                error.request.should.eql(request)
                xmpp.removeAllListeners('stanza')
                done()
            }
            socket.emit(
                'xmpp.register.get',
                request,
                callback
            )
        })

        it('Sends expected stanza', function(done) {
            var request = {
                to: 'shakespeare.lit'
            }
            xmpp.once('stanza', function(stanza) {
                stanza.is('iq').should.be.true
                stanza.attrs.to.should.equal(request.to)
                stanza.attrs.id.should.exist
                stanza.attrs.type.should.equal('get')
                stanza.getChild('register', register.NS)
                    .should.exist
                done()
            })
            socket.emit(
                'xmpp.register.get',
                request,
                function() {}
            )
        })

        it('Handles error response stanza', function(done) {
            xmpp.once('stanza', function(stanza) {
                manager.makeCallback(helper.getStanza('iq-error'))
            })
            var callback = function(error, success) {
                should.not.exist(success)
                error.should.eql({
                    type: 'cancel',
                    condition: 'error-condition'
                })
                done()
            }
            var request = {
                to: 'shakespeare.lit'
            }
            socket.emit('xmpp.register.get', request, callback)
        })

        it('Returns registration information', function(done) {
            xmpp.once('stanza', function(stanza) {
                manager.makeCallback(
                    helper.getStanza('registration-information')
                )
            })
            var callback = function(error, data) {
                should.not.exist(error)
                data.instructions.should.equal('These are instructions')
                data.email.should.be.true
                data.username.should.be.true
                data.email.should.be.true
                done()
            }
            var request = {
                to: 'shakespeare.lit'
            }
            socket.emit('xmpp.register.get', request, callback)
        })


        it('Handles registered entity', function(done) {
            xmpp.once('stanza', function(stanza) {
                manager.makeCallback(
                    helper.getStanza('registered-entity')
                )
            })
            var callback = function(error, data) {
                should.not.exist(error)
                should.not.exist(data.instructions)
                data.email.should.equal('romeo@shakespeare.lit')
                data.username.should.equal('romeo')
                data.password.should.equal('love-juliet')
                data.registered.should.be.true
                done()
            }
            var request = {
                to: 'shakespeare.lit'
            }
            socket.emit('xmpp.register.get', request, callback)
        })
        
        it('Handles registration get information with data forms', function(done) {
            xmpp.once('stanza', function(stanza) {
                manager.makeCallback(
                    helper.getStanza('registration-information-with-data-form')
                )
            })
            var callback = function(error, data) {
                should.not.exist(error)
                data.instructions.should.equal('These are instructions')
                data.form.should.exist
                data.form.title.should.equal('Registration')
                data.form.instructions.should.equal('Registration instructions')
                
                data.form.fields.length.should.equal(2)
                data.form.fields[0].var.should.equal('name')
                data.form.fields[0].type.should.equal('text-single')
                data.form.fields[0].required.should.be.true
                data.form.fields[0].label.should.equal('Name')
                data.form.fields[1].var.should.equal('x-romeo')
                data.form.fields[1].type.should.equal('list-single')
                data.form.fields[1].required.should.be.false
                data.form.fields[1].label.should.equal('Art thou Romeo?')
                data.form.fields[1].options.should.eql([
                  { value: 'Y', label: 'Y' },
                  { value: 'N', label: 'N' }
                ])
                done()
            }
            var request = {
                to: 'shakespeare.lit'
            }
            socket.emit('xmpp.register.get', request, callback)
        })

    })
    
    describe('Can register', function() {

        it('Errors when no callback provided', function(done) {
            xmpp.once('stanza', function() {
                done('Unexpected outgoing stanza')
            })
            socket.once('xmpp.error.client', function(error) {
                error.type.should.equal('modify')
                error.condition.should.equal('client-error')
                error.description.should.equal("Missing callback")
                error.request.should.eql({})
                xmpp.removeAllListeners('stanza')
                done()
            })
            socket.emit('xmpp.register.set', {})
        })

        it('Errors when non-function callback provided', function(done) {
            xmpp.once('stanza', function() {
                done('Unexpected outgoing stanza')
            })
            socket.once('xmpp.error.client', function(error) {
                error.type.should.equal('modify')
                error.condition.should.equal('client-error')
                error.description.should.equal("Missing callback")
                error.request.should.eql({})
                xmpp.removeAllListeners('stanza')
                done()
            })
            socket.emit('xmpp.register.set', {}, true)
        })
 
        it('Errors if missing \'to\' key', function(done) {
            var request = {}
            xmpp.once('stanza', function() {
                done('Unexpected outgoing stanza')
            })
            var callback = function(error, success) {
                should.not.exist(success)
                error.type.should.equal('modify')
                error.condition.should.equal('client-error')
                error.description.should.equal("Missing 'to' key")
                error.request.should.eql(request)
                xmpp.removeAllListeners('stanza')
                done()
            }
            socket.emit(
                'xmpp.register.set',
                request,
                callback
            )
        })

        it('Sends expected stanza', function(done) {
            var request = {
                to: 'shakespeare.lit'
            }
            xmpp.once('stanza', function(stanza) {
                stanza.is('iq').should.be.true
                stanza.attrs.to.should.equal(request.to)
                stanza.attrs.id.should.exist
                stanza.attrs.type.should.equal('set')
                stanza.getChild('query', register.NS)
                    .should.exist
                done()
            })
            socket.emit(
                'xmpp.register.set',
                request,
                function() {}
            )
        })
        
        it('Sends expected stanza with fields', function(done) {
            var request = {
                to: 'shakespeare.lit',
                username: 'romeo',
                email: 'romeo@shakespeare.lit',
                password: 'love-juliet'
            }
            xmpp.once('stanza', function(stanza) {
                stanza.is('iq').should.be.true
                stanza.attrs.to.should.equal(request.to)
                stanza.attrs.id.should.exist
                stanza.attrs.type.should.equal('set')
                var query = stanza.getChild('query', register.NS)
                query.should.exist
                query.getChildText('username').should.equal(request.username)
                query.getChildText('password').should.equal(request.password)
                query.getChildText('email').should.equal(request.email)
                done()
            })
            socket.emit(
                'xmpp.register.set',
                request,
                function() {}
            )
        })

        it('Handles error response stanza', function(done) {
            xmpp.once('stanza', function(stanza) {
                manager.makeCallback(helper.getStanza('iq-error'))
            })
            var callback = function(error, success) {
                should.not.exist(success)
                error.should.eql({
                    type: 'cancel',
                    condition: 'error-condition'
                })
                done()
            }
            var request = {
                to: 'shakespeare.lit'
            }
            socket.emit('xmpp.register.set', request, callback)
        })

        it('Confirms expected registration', function(done) {
            xmpp.once('stanza', function(stanza) {
                manager.makeCallback(
                    helper.getStanza('iq-result')
                )
            })
            var callback = function(error, data) {
                should.not.exist(error)
                data.registered.should.be.true
                done()
            }
            var request = {
                to: 'shakespeare.lit'
            }
            socket.emit('xmpp.register.set', request, callback)
        })
        
    })

})