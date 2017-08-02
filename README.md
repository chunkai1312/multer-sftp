# multer-sftp

[![NPM version][npm-image]][npm-url]

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
