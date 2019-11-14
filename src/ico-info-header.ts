export class IcoInfoHeader {
  readonly width: number
  readonly height: number
  readonly colorCount: number
  readonly reserved: number
  readonly planes: number
  readonly bitCount: number
  readonly bytesInRes: number
  readonly imageOffset: number

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

  /**
   * Create ICO info header from the buffer.
   * @param buffer The ICO info header image buffer.
   */
  static from(buffer: Buffer): IcoInfoHeader {
    const width = buffer.readUInt8(0)
    const height = buffer.readUInt8(1)
    const colorCount = buffer.readUInt8(2)
    const reserved = buffer.readUInt8(3)
    const planes = buffer.readUInt16LE(4)
    const bitCount = buffer.readUInt16LE(6)
    const bytesInRes = buffer.readUInt32LE(8)
    const imageOffset = buffer.readUInt32LE(12)
    if (bitCount !== 32) {
      // TODO: only 32 bpp supported
      throw new Error('Only 32 bpp supported')
    }
    return new IcoInfoHeader(
      width,
      height,
      colorCount,
      reserved,
      planes,
      bitCount,
      bytesInRes,
      imageOffset
    )
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
}
