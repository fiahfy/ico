export class BitmapInfoHeader {
  size: number
  width: number
  height: number
  planes: number
  bitCount: number
  compression: number
  sizeImage: number
  xPelsPerMeter: number
  yPelsPerMeter: number
  clrUsed: number
  clrImportant: number

  constructor(
    size = 40,
    width = 0,
    height = 0,
    planes = 0,
    bitCount = 0,
    compression = 0,
    sizeImage = 0,
    xPelsPerMeter = 0,
    yPelsPerMeter = 0,
    clrUsed = 0,
    clrImportant = 0
  ) {
    this.size = size
    this.width = width
    this.height = height
    this.planes = planes
    this.bitCount = bitCount
    this.compression = compression
    this.sizeImage = sizeImage
    this.xPelsPerMeter = xPelsPerMeter
    this.yPelsPerMeter = yPelsPerMeter
    this.clrUsed = clrUsed
    this.clrImportant = clrImportant
  }

  get data(): Buffer {
    const buffer = Buffer.alloc(40)
    buffer.writeUInt32LE(this.size, 0)
    buffer.writeInt32LE(this.width, 4)
    buffer.writeInt32LE(this.height, 8)
    buffer.writeUInt16LE(this.planes, 12)
    buffer.writeUInt16LE(this.bitCount, 14)
    buffer.writeUInt32LE(this.compression, 16)
    buffer.writeUInt32LE(this.sizeImage, 20)
    buffer.writeInt32LE(this.xPelsPerMeter, 24)
    buffer.writeInt32LE(this.yPelsPerMeter, 28)
    buffer.writeUInt32LE(this.clrUsed, 32)
    buffer.writeUInt32LE(this.clrImportant, 36)
    return buffer
  }

  set data(buffer) {
    this.size = buffer.readUInt32LE(0)
    this.width = buffer.readInt32LE(4)
    this.height = buffer.readInt32LE(8)
    this.planes = buffer.readUInt16LE(12)
    this.bitCount = buffer.readUInt16LE(14)
    this.compression = buffer.readUInt32LE(16)
    this.sizeImage = buffer.readUInt32LE(20)
    this.xPelsPerMeter = buffer.readInt32LE(24)
    this.yPelsPerMeter = buffer.readInt32LE(28)
    this.clrUsed = buffer.readUInt32LE(32)
    this.clrImportant = buffer.readUInt32LE(36)
  }
}
