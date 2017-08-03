import SFTPStorage from '../src/SFTPStorage'

describe('SFTPStorage', () => {
  describe('#constructor()', () => {
    it('should throw error if opts.sftp is not an object', () => {
      const opts = { sftp: false }
      expect(() => new SFTPStorage(opts)).toThrow('Expected opts.sftp to be object')
    })

    it('should throw error if opts.destination is missing', () => {
      const opts = {
        sftp: {
          host: '127.0.0.1',
          port: 22,
          username: 'username',
          password: 'password'
        }
      }
      expect(() => new SFTPStorage(opts)).toThrow('opts.destination is required')
    })

    it('should throw error if opts.destination is not a function or string', () => {
      const opts = { sftp: {}, destination: false }
      expect(() => new SFTPStorage(opts)).toThrow('Expected opts.destination to be function or string')
    })

    it('should throw error if opts.filename is not a function', () => {
      const opts = { sftp: {}, destination: '/path/to/uploads', filename: false }
      expect(() => new SFTPStorage(opts)).toThrow('Expected opts.filename to be undefined or function')
    })

    it('should create a SFTPStorage instance', () => {
      const opts = {
        sftp: {
          host: '127.0.0.1',
          port: 22,
          username: 'username',
          password: 'password'
        },
        destination: (req, file, cb) => cb(null, '/path/to/uploads')
      }
      expect(new SFTPStorage(opts)).toBeInstanceOf(SFTPStorage)
    })

    it('should create a SFTPStorage instance with opts.destination using string', () => {
      const opts = {
        sftp: {
          host: '127.0.0.1',
          port: 22,
          username: 'username',
          password: 'password'
        },
        destination: '/path/to/uploads'
      }
      expect(new SFTPStorage(opts)).toBeInstanceOf(SFTPStorage)
    })

    it('should create a SFTPStorage instance with opts.filename', () => {
      const opts = {
        sftp: {
          host: '127.0.0.1',
          port: 22,
          username: 'username',
          password: 'password'
        },
        destination: (req, file, cb) => cb(null, '/path/to/uploads'),
        filename: (req, file, cb) => cb(null, 'filename.ext')
      }
      expect(new SFTPStorage(opts)).toBeInstanceOf(SFTPStorage)
    })
  })
})
