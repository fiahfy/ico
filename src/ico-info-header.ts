export class IcoInfoHeader {
  width: number
  height: number
  colorCount: number
  reserved: number
  planes: number
  bitCount: number
  bytesInRes: number
  imageOffset: number

  constructor(
    width = 0,
    height = 0,
    colorCount = 0,
    reserved = 0,
    planes = 0,
    bitCount = 0,
    bytesInRes = 0,
    imageOffset = 0
  ) {
    this.width = width
    this.height = height
    this.colorCount = colorCount
    this.reserved = reserved
    this.planes = planes
    this.bitCount = bitCount
    this.bytesInRes = bytesInRes
    this.imageOffset = imageOffset
  }

  get data(): Buffer {
    const buffer = Buffer.alloc(16)
    buffer.writeUInt8(this.width, 0)
    buffer.writeUInt8(this.height, 1)
    buffer.writeUInt8(this.colorCount, 2)
    buffer.writeUInt8(this.reserved, 3)
    buffer.writeUInt16LE(this.planes, 4)
    buffer.writeUInt16LE(this.bitCount, 6)
    buffer.writeUInt32LE(this.bytesInRes, 8)
    buffer.writeUInt32LE(this.imageOffset, 12)
    return buffer
  }

  set data(buffer) {
    this.width = buffer.readUInt8(0)
    this.height = buffer.readUInt8(1)
    this.colorCount = buffer.readUInt8(2)
    this.reserved = buffer.readUInt8(3)
    this.planes = buffer.readUInt16LE(4)
    this.bitCount = buffer.readUInt16LE(6)
    this.bytesInRes = buffer.readUInt32LE(8)
    this.imageOffset = buffer.readUInt32LE(12)

    if (this.bitCount !== 32) {
      // TODO: only 32 bpp supported
      throw new Error('Only 32 bpp supported')
    }
  }
}
