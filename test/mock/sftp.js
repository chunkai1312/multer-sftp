'use strict'

var concat = require('concat-stream')

class SftpClient {
  connect () {
    return Promise.resolve()
  }

  end () {
    return Promise.resolve()
  }

  put (input, remoteFilePath) {
    return new Promise((resolve, reject) => {
      input.pipe(concat({ encoding: 'buffer' }, function (data) {
        resolve()
      }))
    })
  }

  list () {
    return Promise.resolve([])
  }

  delete () {
    return Promise.resolve()
  }

  mkdir () {
    return Promise.resolve()
  }

  rmdir () {
    return Promise.resolve()
  }
}

module.exports = SftpClient
