import path from 'path'
import crypto from 'crypto'
import Client from 'ssh2-sftp-client'

function getFilename (req, file, cb) {
  crypto.pseudoRandomBytes(16, function (err, raw) {
    cb(err, err ? undefined : raw.toString('hex'))
  })
}

export function SFTPStorage (opts) {
  if (!opts) {
    throw new Error('`opts` is required')
  }

  if (typeof opts !== 'object') {
    throw new Error('Expected `opts` to be an object')
  }

  if (!opts.sftp) {
    throw new Error('`opts.sftp` is required')
  }

  if (typeof opts.sftp !== 'object') {
    throw new Error('Expected `opts.sftp` to be an object')
  }

  if (!opts.destination) {
    throw new Error('`opts.destination` is required')
  }

  if (typeof opts.destination !== 'function' && typeof opts.destination !== 'string') {
    throw new Error('Expected `opts.destination` to be a function or string')
  }

  if (typeof opts.filename !== 'undefined' && typeof opts.filename !== 'function') {
    throw new Error('Expected `opts.filename` to be a function')
  }

  this.opts = opts
  this.sftp = new Client()

  this.getFilename = (opts.filename || getFilename)

  if (typeof opts.destination === 'string') {
    this.getDestination = function ($0, $1, cb) { cb(null, opts.destination) }
  } else {
    this.getDestination = opts.destination
  }
}

SFTPStorage.prototype._handleFile = function _handleFile (req, file, cb) {
  var that = this

  that.getDestination(req, file, function (err, destination) {
    if (err) return cb(err)

    that.getFilename(req, file, function (err, filename) {
      if (err) return cb(err)

      var finalPath = path.join(destination, filename)

      that.sftp.connect(that.opts.sftp)
        .then(() => that.sftp.put(file.stream, finalPath))
        .then(() => that.sftp.end())
        .then((data) => cb(null, {
          destination: destination,
          filename: filename,
          path: finalPath
        }))
        .catch((err) => cb(err))
    })
  })
}

SFTPStorage.prototype._removeFile = function _removeFile (req, file, cb) {
  var that = this

  that.sftp.connect(that.opts.sftp)
    .then(() => that.sftp.delete(file.path))
    .then(() => that.sftp.end())
    .then(() => cb(null))
    .catch((err) => cb(err))
}

export default function (opts) {
  return new SFTPStorage(opts)
}
