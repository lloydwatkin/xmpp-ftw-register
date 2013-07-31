var should   = require('should')
  , Register = require('../../lib/register')
  , ltx      = require('ltx')
  , helper   = require('../helper')
  , dataForm = require('xmpp-ftw/lib/utils/xep-0004')

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
        
        it('Handles registration get with data form', function(done) {
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
                data.form.instructions
                    .should.equal('Registration instructions')
                
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
        
        it('Errors with invalid data form', function(done) {
            var callback = function(error, success) {
                should.not.exist(success)
                error.should.eql({
                    type: 'modify',
                    condition: 'client-error',
                    description: 'Badly formatted data form',
                    request: request
                })
                done()
            }
            var request = {
                to: 'shakespeare.lit',
                form: {} 
            }
            socket.emit('xmpp.register.set', request, callback)
        })

        it('Sends expected stanza with data form', function(done) {
            xmpp.once('stanza', function(stanza) {
                stanza.is('iq').should.be.true
                stanza.attrs.type.should.equal('set')
                stanza.attrs.to.should.equal(request.to)
                
                var query = stanza.getChild('query', register.NS)
                query.should.exist
                
                var x = query.getChild('x', dataForm.NS)

                x.should.exist
                x.attrs.type.should.exist
                x.children.length.should.equal(request.form.length + 1)
                
                x.children[0].name.should.equal('field')
                x.children[0].attrs.var.should.equal('FORM_TYPE')
                x.children[0].attrs.type.should.equal('hidden')
                x.children[0].getChildText('value').should.equal(register.NS)
                
                x.children[1].name.should.equal('field')
                x.children[1].attrs.var.should.equal('field-type1')
                x.children[1].getChildText('value')
                    .should.equal('field-value1')
                
                x.children[2].name.should.equal('field')
                x.children[2].attrs.var.should.equal('field-type2')
                x.children[2].getChildText('value')
                    .should.equal('field-value2')
                
                done()
            })
            var request = {
                to: 'shakespeare.lit',
                form: [
                    { var: 'field-type1', value: 'field-value1' }, 
                    { var: 'field-type2', value: 'field-value2' } 
                ]
            }
            socket.emit('xmpp.register.set', request, function() {})
        })

    })

    describe('Unregister', function() {

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
            socket.emit('xmpp.register.unregister', {})
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
            socket.emit('xmpp.register.unregister', {}, true)
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
                'xmpp.register.unregister',
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
                var query = stanza.getChild('query', register.NS)
                query.should.exist
                query.getChild('remove').should.exist
                done()
            })
            socket.emit(
                'xmpp.register.unregister',
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
            socket.emit('xmpp.register.unregister', request, callback)
        })

        it('Returns success', function(done) {
            xmpp.once('stanza', function(stanza) {
                manager.makeCallback(
                    helper.getStanza('iq-result')
                )
            })
            var callback = function(error, success) {
                should.not.exist(error)
                success.should.be.true
                done()
            }
            var request = {
                to: 'shakespeare.lit'
            }
            socket.emit('xmpp.register.unregister', request, callback)
        })

        it('Handles unregister error with data form', function(done) {
            xmpp.once('stanza', function(stanza) {
                manager.makeCallback(helper.getStanza('unregister-error'))
            })
            var callback = function(error, success) {
                should.not.exist(success)
                error.type.should.equal('cancel')
                error.condition.should.equal('not-allowed')
                error.form.should.exist
                error.form.title.should.equal('Cancel')
                error.form.instructions.should.equal('Unregister Instructions')
                error.form.fields.length.should.equal(1)
                error.form.fields[0].var.should.equal('username')
                error.form.fields[0].label.should.equal('Username')
                error.form.fields[0].type.should.equal('text-single')
                error.form.fields[0].required.should.be.true
                done()
            }
            var request = {
                to: 'shakespeare.lit'
            }
            socket.emit('xmpp.register.unregister', request, callback)
        })

        it('Sends expected stanza with data form', function(done) {
            var request = {
                to: 'shakespeare.lit',
                form: [
                    { var: 'field-name1', value: 'field-value1' }
                ]
            }
            xmpp.once('stanza', function(stanza) {
                stanza.is('iq').should.be.true
                stanza.attrs.to.should.equal(request.to)
                stanza.attrs.id.should.exist
                stanza.attrs.type.should.equal('set')
                var query = stanza.getChild('query', register.NS)
                query.should.exist
                should.not.exist(query.getChild('remove'))

                var x = query.getChild('x', dataForm.NS)
                x.should.exist
                x.children.length.should.equal(2)
                x.children[0].name.should.equal('field')
                x.children[0].attrs.type.should.equal('hidden')
                x.children[0].attrs.var.should.equal('FORM_TYPE')
                x.children[0].getChildText('value')
                    .should.equal(register.NS_CANCEL)
                x.children[1].name.should.equal('field')
                x.children[1].attrs.var.should.equal('field-name1')
                x.children[1].getChildText('value')
                    .should.equal('field-value1')
                done()
            })
            socket.emit(
                'xmpp.register.unregister',
                request,
                function() {}
            )
        })

        it('Errors with unparsable data form', function(done) {
            var callback = function(error, success) {
                should.not.exist(success)
                error.should.eql({
                    type: 'modify',
                    condition: 'client-error',
                    description: 'Badly formatted data form',
                    request: request
                })
                done()
            }
            var request = {
                to: 'shakespeare.lit',
                form: {}
            }
            socket.emit('xmpp.register.unregister', request, callback)

        })
    
    })

})
