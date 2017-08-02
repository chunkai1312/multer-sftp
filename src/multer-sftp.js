import path from 'path'
import crypto from 'crypto'
import Client from 'ssh2-sftp-client'

function getFilename (req, file, cb) {
  crypto.pseudoRandomBytes(16, function (err, raw) {
    cb(err, err ? undefined : raw.toString('hex'))
  })
}

function SFTPStorage (opts) {
  this.opts = opts
  this.sftp = new Client()

  this.getFilename = (opts.filename || getFilename)

  if (!opts.destination) throw new Error('missing destination')
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

module.exports = function (opts) {
  return new SFTPStorage(opts)
}
