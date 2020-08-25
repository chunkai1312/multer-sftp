'use strict'

var path = require('path')
var crypto = require('crypto')
var queue = require('queue')
var Client = require('ssh2-sftp-client')

function getFilename (req, file, cb) {
  crypto.pseudoRandomBytes(16, function (err, raw) {
    cb(err, err ? undefined : raw.toString('hex'))
  })
}

function SFTPStorage (opts) {
  switch (typeof opts.sftp) {
    case 'object': this.sftp = opts.sftp; break
    case 'undefined': throw new Error('opts.sftp is required')
    default: throw new TypeError('Expected opts.sftp to be object')
  }

  switch (typeof opts.destination) {
    case 'function': this.getDestination = opts.destination; break
    case 'string': this.getDestination = ($0, $1, cb) => cb(null, opts.destination); break
    case 'undefined': throw new Error('opts.destination is required')
    default: throw new TypeError('Expected opts.destination to be function or string')
  }

  switch (typeof opts.filename) {
    case 'function': this.getFilename = opts.filename; break
    case 'undefined': this.getFilename = getFilename; break
    default: throw new TypeError('Expected opts.filename to be undefined or function')
  }

  this.client = opts.client || new Client()
  this.queue = queue({
    concurrency: 1,
    autostart: true
  })
}

SFTPStorage.prototype._handleFile = function _handleFile (req, file, cb) {
  this.getDestination(req, file, (err, destination) => {
    if (err) return cb(err)

    this.getFilename(req, file, (err, filename) => {
      if (err) return cb(err)

      var finalPath = path.join(destination, filename)

      this.queue.push(() => {
          return this.client.connect(this.sftp)
            .then(() => this.client.put(file.stream, finalPath))
            .then((data) => cb(null, {
              destination: destination,
              filename: filename,
              path: finalPath
            }))
            .catch((err) => cb(err))
            .then(() => this.client.end())
        }
      )
    })
  })
}

SFTPStorage.prototype._removeFile = function _removeFile (req, file, cb) {
  this.client.connect(this.sftp)
    .then(() => this.client.delete(file.path))
    .then(() => cb(null))
    .catch(/* istanbul ignore next */err => cb(err))
    .then(() => this.client.end())
}

module.exports = function (opts) {
  return new SFTPStorage(opts)
}
