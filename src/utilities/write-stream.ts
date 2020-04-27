import {Writable, WritableOptions} from 'stream';
import {close, closeSync, existsSync, openSync, write} from 'fs';

export class WriteStream extends Writable {
  private metadataBufferSize = 16;
  private readonly fd;

  constructor(path:string, options?: WritableOptions) {
    super(options);

    if (!existsSync(path)) {
      closeSync(openSync(path, 'w'));
    }

    this.fd = openSync(path, 'r+');
    this.on('finish', () => {
      close(this.fd, (err) => {
        if (err) {
          this.emit('error', err);
        } else {
          this.emit('close');
        }
      });
    });
  }

  public writeWithOffset(chunk: Buffer, offset: number, callback: Function): boolean {
    const metadata = Buffer.alloc(this.metadataBufferSize);
    metadata.fill(' ');
    metadata.write(`${offset}`);

    return this.write(Buffer.concat([metadata, chunk]), callback);
  }

  public _write(chunk: any, encoding: string, callback: Function): void {
    const offset = +chunk.subarray(0, this.metadataBufferSize).toString();

    write(this.fd, chunk, this.metadataBufferSize, undefined, offset, (err) => {
      callback(err);
    });
  }
}
