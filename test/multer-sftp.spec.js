import sftpStorage, { SFTPStorage } from '../src/multer-sftp'

describe('Multer SFTP Storage', () => {
  describe('#sftpStorage()', () => {
    it('should throw error if opts not an object', () => {
      const opts = false
      expect(() => sftpStorage(opts)).toThrow()
    })

    it('should throw error if opts.sftp not an object', () => {
      const opts = { sftp: false }
      expect(() => sftpStorage(opts)).toThrow()
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
      expect(() => sftpStorage(opts)).toThrow()
    })

    it('should throw error if opts.destination not a function or a string', () => {
      const opts = { sftp: {}, destination: false }
      expect(() => sftpStorage(opts)).toThrow()
    })

    it('should throw error if opts.filename not a function', () => {
      const opts = { sftp: {}, destination: '/path/to/uploads', filename: false }
      expect(() => sftpStorage(opts)).toThrow()
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
      expect(sftpStorage(opts)).toBeInstanceOf(SFTPStorage)
    })

    it('should create a SFTPStorage instance with string of destination', () => {
      const opts = {
        sftp: {
          host: '127.0.0.1',
          port: 22,
          username: 'username',
          password: 'password'
        },
        destination: '/path/to/uploads'
      }
      expect(sftpStorage(opts)).toBeInstanceOf(SFTPStorage)
    })

    it('should create a SFTPStorage instance with filename', () => {
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
      expect(sftpStorage(opts)).toBeInstanceOf(SFTPStorage)
    })
  })
})
