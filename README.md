# multer-sftp

[![NPM version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Coverage Status][codecov-image]][codecov-url]

> SFTP storage engine for [Multer](https://github.com/expressjs/multer)

## Install

```
$ npm install --save multer-sftp ssh2-sftp-client
```

## Usage

```js
var multer = require('multer')
var sftpStorage = require('multer-sftp')

var storage = sftpStorage({
  sftp: {
    host: '127.0.0.1',
    port: 22,
    username: 'username',
    password: 'password'
  },
  destination: function (req, file, cb) {
    cb(null, '/tmp/my-uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now())
  }
})

var upload = multer({ storage: storage })
```

## API

```js
var sftpStorage = require('multer-sftp')
```

### sftpStorage(opts)

The module returns a function that can be invoked with options to create a Multer storage engine.

#### opts

```js
{
  sftp: Object,
  destination: function (req, file, cb) { return cb(null, '/path/to/uploads') }
  filename: function (req, file, cb) { return cb(null, 'filename.ext') }
}
```

* `sftp`: **Required**. `sftp` is a settings object for sftp client connection. Please see [ssh2](https://github.com/mscdex/ssh2#user-content-client-methods) documentation for details.
* `destination`: **Required**. `destination` is used to determine within which folder the uploaded files should be stored. This can also be given as a `string` (e.g. `'/tmp/uploads'`).
* `filename`: **Optional**. `filename` is used to determine what the file should be named inside the folder. If no `filename` is given, each file will be given a random name that doesn't include any file extension.

## License

MIT © [Chun-Kai Wang](https://github.com/chunkai1312)

[npm-image]: https://img.shields.io/npm/v/multer-sftp.svg
[npm-url]: https://npmjs.org/package/multer-sftp
[travis-image]: https://img.shields.io/travis/chunkai1312/multer-sftp.svg
[travis-url]: https://travis-ci.org/chunkai1312/multer-sftp
[codecov-image]: https://img.shields.io/codecov/c/github/chunkai1312/multer-sftp.svg
[codecov-url]: https://codecov.io/gh/chunkai1312/multer-sftp
