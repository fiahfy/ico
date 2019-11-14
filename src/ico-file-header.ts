export class IcoFileHeader {
  readonly reserved: number
  readonly type: number
  readonly count: number

  constructor(reserved = 0, type = 1, count = 0) {
    this.reserved = reserved
    this.type = type
    this.count = count
  }

  /**
   * Create ICO file header from the buffer.
   * @param buffer The ICO file header buffer.
   */
  static from(buffer: Buffer): IcoFileHeader {
    const reserved = buffer.readUInt16LE(0)
    const type = buffer.readUInt16LE(2)
    const count = buffer.readUInt16LE(4)
    return new IcoFileHeader(reserved, type, count)
  }

  get data(): Buffer {
    const buffer = Buffer.alloc(6)
    buffer.writeUInt16LE(this.reserved, 0)
    buffer.writeUInt16LE(this.type, 2)
    buffer.writeUInt16LE(this.count, 4)
    return buffer
  }
}
