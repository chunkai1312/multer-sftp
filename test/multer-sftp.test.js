'use strict'

var sftpStorage = require('../lib')

var assert = require('assert')
var multer = require('multer')
var FormData = require('form-data')

var util = require('./_util')
var Client = require('./mock/sftp')

describe('SFTP Storage', function () {
  var sftp = {
    host: '127.0.0.1',
    port: 22,
    username: 'username',
    password: 'password'
  }

  it('should throw error if opts is invalid', () => {
    assert.throws(() => sftpStorage({}))
    assert.throws(() => sftpStorage({ sftp: false }))
    assert.throws(() => sftpStorage({ sftp: {}, destination: false }))
    assert.throws(() => sftpStorage({ sftp: {}, destination: '/path/to/uploads', filename: false }))
    assert.throws(() => sftpStorage({ sftp: sftp }))
  })

  it('should process parser/form-data POST request', function (done) {
    var mockClient = new Client()
    var storage = sftpStorage({
      client: mockClient,
      sftp: sftp,
      destination: function (req, file, cb) {
        cb(null, '/path/to/upload')
      },
      filename: function (req, file, cb) {
        cb(null, file.originalname)
      }
    })
    var upload = multer({ storage: storage })
    var parser = upload.single('small0')

    var form = new FormData()
    form.append('name', 'Multer')
    form.append('small0', util.file('small0.dat'))

    util.submitForm(parser, form, function (err, req) {
      assert.ifError(err)

      assert.equal(req.body.name, 'Multer')

      assert.equal(req.file.fieldname, 'small0')
      assert.equal(req.file.originalname, 'small0.dat')

      done()
    })
  })

  it('should process empty fields and an empty file', function (done) {
    var mockClient = new Client()
    var storage = sftpStorage({
      client: mockClient,
      sftp: sftp,
      destination: '/path/to/upload'
    })
    var upload = multer({ storage: storage })
    var parser = upload.single('empty')

    var form = new FormData()
    form.append('empty', util.file('empty.dat'))
    form.append('name', 'Multer')
    form.append('version', '')
    form.append('year', '')
    form.append('checkboxfull', 'cb1')
    form.append('checkboxfull', 'cb2')
    form.append('checkboxhalfempty', 'cb1')
    form.append('checkboxhalfempty', '')
    form.append('checkboxempty', '')
    form.append('checkboxempty', '')

    util.submitForm(parser, form, function (err, req) {
      assert.ifError(err)

      assert.equal(req.body.name, 'Multer')
      assert.equal(req.body.version, '')
      assert.equal(req.body.year, '')

      assert.deepEqual(req.body.checkboxfull, [ 'cb1', 'cb2' ])
      assert.deepEqual(req.body.checkboxhalfempty, [ 'cb1', '' ])
      assert.deepEqual(req.body.checkboxempty, [ '', '' ])

      assert.equal(req.file.fieldname, 'empty')
      assert.equal(req.file.originalname, 'empty.dat')

      done()
    })
  })

  it('should process multiple files', function (done) {
    var mockClient = new Client()
    var storage = sftpStorage({
      client: mockClient,
      sftp: sftp,
      destination: '/path/to/upload'
    })
    var upload = multer({ storage: storage })
    var parser = upload.fields([
      { name: 'empty', maxCount: 1 },
      { name: 'tiny0', maxCount: 1 },
      { name: 'tiny1', maxCount: 1 },
      { name: 'small0', maxCount: 1 },
      { name: 'small1', maxCount: 1 },
      { name: 'medium', maxCount: 1 },
      { name: 'large', maxCount: 1 }
    ])

    var form = new FormData()
    form.append('empty', util.file('empty.dat'))
    form.append('tiny0', util.file('tiny0.dat'))
    form.append('tiny1', util.file('tiny1.dat'))
    form.append('small0', util.file('small0.dat'))
    form.append('small1', util.file('small1.dat'))
    form.append('medium', util.file('medium.dat'))
    form.append('large', util.file('large.jpg'))

    util.submitForm(parser, form, function (err, req) {
      assert.ifError(err)

      assert.deepEqual(req.body, {})

      assert.equal(req.files['empty'][0].fieldname, 'empty')
      assert.equal(req.files['empty'][0].originalname, 'empty.dat')

      assert.equal(req.files['tiny0'][0].fieldname, 'tiny0')
      assert.equal(req.files['tiny0'][0].originalname, 'tiny0.dat')

      assert.equal(req.files['tiny1'][0].fieldname, 'tiny1')
      assert.equal(req.files['tiny1'][0].originalname, 'tiny1.dat')

      assert.equal(req.files['small0'][0].fieldname, 'small0')
      assert.equal(req.files['small0'][0].originalname, 'small0.dat')

      assert.equal(req.files['small1'][0].fieldname, 'small1')
      assert.equal(req.files['small1'][0].originalname, 'small1.dat')

      assert.equal(req.files['medium'][0].fieldname, 'medium')
      assert.equal(req.files['medium'][0].originalname, 'medium.dat')

      assert.equal(req.files['large'][0].fieldname, 'large')
      assert.equal(req.files['large'][0].originalname, 'large.jpg')

      done()
    })
  })

  it('should remove uploaded files on error', function (done) {
    var mockClient = new Client()
    var storage = sftpStorage({
      client: mockClient,
      sftp: sftp,
      destination: '/path/to/upload'
    })
    var upload = multer({ storage: storage })
    var parser = upload.single('tiny0')

    var form = new FormData()
    form.append('tiny0', util.file('tiny0.dat'))
    form.append('small0', util.file('small0.dat'))

    util.submitForm(parser, form, function (err, req) {
      assert.equal(err.code, 'LIMIT_UNEXPECTED_FILE')
      assert.equal(err.field, 'small0')
      assert.deepEqual(err.storageErrors, [])

      done()
    })
  })

  it('should report error when directory doesn\'t exist', function (done) {
    var mockClient = new Client()
    mockClient.put = () => {
      var error = new Error()
      error.code = 'ERR_BAD_PATH'
      return Promise.reject(error)
    }

    var storage = sftpStorage({
      client: mockClient,
      sftp: sftp,
      destination: '/path/to/upload'
    })
    var upload = multer({ storage: storage })
    var parser = upload.single('tiny0')

    var form = new FormData()
    form.append('tiny0', util.file('tiny0.dat'))

    util.submitForm(parser, form, function (err, req) {
      assert.equal(err.code, 'ERR_BAD_PATH')
      done()
    })
  })
})
