import * as ssh2 from 'ssh2';
import { StorageEngine } from 'multer';

interface SFTPStorageOptions {
  sftp: ssh2.ConnectConfig;
  destination?: string | ((
    req: Request,
    file: Express.Multer.File,
    callback: (error: Error | null, destination: string) => void
  ) => void);
  filename?(
    req: Request,
    file: Express.Multer.File,
    callback: (error: Error | null, filename: string) => void
  ): void;
}

declare global {
  namespace Express {
    namespace MulterSFTP {
      interface File extends Multer.File { }
    }
  }
}

interface SFTPStorage {
  (options?: SFTPStorageOptions): StorageEngine;
}

declare const sftpStorage: SFTPStorage;
export = sftpStorage;
