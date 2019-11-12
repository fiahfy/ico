export class IcoFileHeader {
  reserved: number
  type: number
  count: number

  constructor(reserved = 0, type = 1, count = 0) {
    this.reserved = reserved
    this.type = type
    this.count = count
  }

  get data(): Buffer {
    const buffer = Buffer.alloc(6)
    buffer.writeUInt16LE(this.reserved, 0)
    buffer.writeUInt16LE(this.type, 2)
    buffer.writeUInt16LE(this.count, 4)
    return buffer
  }

  set data(buffer) {
    this.reserved = buffer.readUInt16LE(0)
    this.type = buffer.readUInt16LE(2)
    this.count = buffer.readUInt16LE(4)
  }
}
