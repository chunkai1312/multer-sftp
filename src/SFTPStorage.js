import path from 'path'
import Client from 'ssh2-sftp-client'
import { getFilename } from './utils'

class SFTPStorage {
  constructor (opts) {
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

    this.sftpClient = new Client()
  }

  _handleFile (req, file, cb) {
    this.getDestination(req, file, (err, destination) => {
      if (err) return cb(err)

      this.getFilename(req, file, (err, filename) => {
        if (err) return cb(err)

        const finalPath = path.join(destination, filename)

        this.sftpClient.connect(this.sftp)
          .then(() => this.sftpClient.put(file.stream, finalPath))
          .then(() => this.sftpClient.end())
          .then((data) => cb(null, {
            destination: destination,
            filename: filename,
            path: finalPath
          }))
          .catch((err) => cb(err))
      })
    })
  }

  _removeFile (req, file, cb) {
    this.sftpClient.connect(this.sftp)
      .then(() => this.sftpClient.delete(file.path))
      .then(() => this.sftpClient.end())
      .then(() => cb(null))
      .catch((err) => cb(err))
  }
}

export default SFTPStorage
