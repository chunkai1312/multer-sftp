# multer-sftp

[![NPM version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Coverage Status][codecov-image]][codecov-url]

> SFTP storage engine for multer

## Install

```
$ npm install --save multer-sftp
```

## Usage

```js
var multer = require('multer')
var SFTPStorage = require('multer-sftp')

var storage = SFTPStorage({
  destination: function (req, file, cb) {
    cb(null, '/tmp/my-uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now())
  },
  sftp: {
    host: '127.0.0.1',
    port: 22,
    username: 'username'
    password: 'password'
  }
})

var upload = multer({ storage: storage })
```

## License

MIT © [Chun-Kai Wang](https://github.com/chunkai1312)

[npm-image]: https://img.shields.io/npm/v/multer-sftp.svg
[npm-url]: https://npmjs.org/package/multer-sftp
[travis-image]: https://img.shields.io/travis/chunkai1312/multer-sftp.svg
[travis-url]: https://travis-ci.org/chunkai1312/multer-sftp
[codecov-image]: https://img.shields.io/codecov/c/github/chunkai1312/multer-sftp.svg
[codecov-url]: https://codecov.io/gh/chunkai1312/multer-sftp
