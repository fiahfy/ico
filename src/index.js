import Jimp from 'jimp'

class IcoFileHeader {
  constructor({ reserved = 0, type = 1, count = 0 } = {}) {
    this.reserved = reserved
    this.type = type
    this.count = count
  }
  get data() {
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

class IcoInfoHeader {
  constructor({
    width = 0,
    height = 0,
    colorCount = 0,
    reserved = 0,
    planes = 0,
    bitCount = 0,
    bytesInRes = 0,
    imageOffset = 0
  } = {}) {
    this.width = width
    this.height = height
    this.colorCount = colorCount
    this.reserved = reserved
    this.planes = planes
    this.bitCount = bitCount
    this.bytesInRes = bytesInRes
    this.imageOffset = imageOffset
  }
  get data() {
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

class IcoImage {
  constructor({
    header = new BitmapInfoHeader(),
    xor = null,
    and = null
  } = {}) {
    this.header = header
    this.xor = xor
    this.and = and
  }
  get data() {
    const list = [this.header.data, this.xor, this.and]
    const totalLength = list.reduce((carry, buffer) => carry + buffer.length, 0)
    return Buffer.concat(list, totalLength)
  }
  set data(buffer) {
    this.header.data = buffer

    // TODO: only 32 bpp supported
    // no colors when bpp is 16 or more

    let pos = this.header.data.length
    const xorSize =
      (((this.header.width * this.header.height) / 2) * this.header.bitCount) /
      8
    this.xor = buffer.slice(pos, pos + xorSize)

    pos += xorSize
    const andSize =
      ((this.header.width +
        (this.header.width % 32 ? 32 - (this.header.width % 32) : 0)) *
        this.header.height) /
      2 /
      8
    this.and = buffer.slice(pos, pos + andSize)
  }
  static create(bitmap) {
    const width = bitmap.width
    const height = bitmap.height * 2 // image + mask
    const planes = 1
    const bitCount = bitmap.bpp * 8 // byte per pixel * 8

    const xorSize = bitmap.height * bitmap.width * bitmap.bpp
    const andSize =
      ((bitmap.width + (bitmap.width % 32 ? 32 - (bitmap.width % 32) : 0)) *
        bitmap.height) /
      8
    const sizeImage = xorSize + andSize

    const header = new BitmapInfoHeader({
      width,
      height,
      planes,
      bitCount,
      sizeImage
    })

    const xors = []
    let andBits = []

    // Convert Top/Left to Bottom/Left
    for (let y = bitmap.height - 1; y >= 0; y--) {
      for (let x = 0; x < bitmap.width; x++) {
        // RGBA to BGRA
        const pos = (y * bitmap.width + x) * bitmap.bpp
        const red = bitmap.data.slice(pos, pos + 1)
        const green = bitmap.data.slice(pos + 1, pos + 2)
        const blue = bitmap.data.slice(pos + 2, pos + 3)
        const alpha = bitmap.data.slice(pos + 3, pos + 4)
        xors.push(blue)
        xors.push(green)
        xors.push(red)
        xors.push(alpha)
        andBits.push(alpha.readUInt8() === 0 ? 1 : 0)
      }
      const padding = andBits.length % 32 ? 32 - (andBits.length % 32) : 0
      andBits = andBits.concat(Array(padding).fill(0))
    }

    const ands = []
    for (let i = 0; i < andBits.length; i += 8) {
      const n = parseInt(andBits.slice(i, i + 8).join(''), 2)
      const buffer = Buffer.alloc(1)
      buffer.writeUInt8(n)
      ands.push(buffer)
    }

    const xor = Buffer.concat(xors, xorSize)
    const and = Buffer.concat(ands, andSize)

    return new IcoImage({ header, xor, and })
  }
}

class BitmapInfoHeader {
  constructor({
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
  } = {}) {
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
  get data() {
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

export default class Ico {
  constructor(buffer) {
    this.fileHeader = new IcoFileHeader()
    this.infoHeaders = []
    this.images = []
    if (buffer) {
      this.data = buffer
    }
  }
  static get supportedSizes() {
    return [16, 24, 32, 48, 64, 128, 256]
  }
  get data() {
    const list = [
      this.fileHeader.data,
      ...this.infoHeaders.map((infoHeader) => infoHeader.data),
      ...this.images.map((image) => image.data)
    ]
    const totalLength = list.reduce((carry, buffer) => carry + buffer.length, 0)
    return Buffer.concat(list, totalLength)
  }
  set data(buffer) {
    this.fileHeader.data = buffer

    let pos = this.fileHeader.data.length
    const infoHeaders = []
    for (let i = 0; i < this.fileHeader.count; i++) {
      const infoHeader = new IcoInfoHeader()
      infoHeader.data = buffer.slice(pos)
      infoHeaders.push(infoHeader)
      pos += infoHeader.data.length
    }
    this.infoHeaders = infoHeaders

    const images = []
    for (let i = 0; i < this.infoHeaders.length; i++) {
      const { imageOffset: pos } = this.infoHeaders[i]
      const image = new IcoImage()
      image.data = buffer.slice(pos)
      images.push(image)
    }
    this.images = images
  }
  _resetHeader() {
    this.fileHeader.count = this.infoHeaders.length

    let imageOffset =
      this.fileHeader.data.length +
      this.infoHeaders.reduce(
        (carry, infoHeader) => carry + infoHeader.data.length,
        0
      )
    this.infoHeaders = this.infoHeaders.map((infoHeader) => {
      infoHeader.imageOffset = imageOffset
      imageOffset += infoHeader.bytesInRes
      return infoHeader
    })
  }
  async appendImage(buffer) {
    await this.insertImage(buffer, this.fileHeader.count)
  }
  async insertImage(buffer, index) {
    const image = await Jimp.read(buffer)
    if (image.getMIME() !== Jimp.MIME_PNG) {
      throw new TypeError('Image must be png format')
    }
    if (image.getWidth() !== image.getHeight()) {
      throw new TypeError('Image must be squre')
    }
    const size = image.getWidth()
    if (!Ico.supportedSizes.includes(size)) {
      throw new TypeError('No supported Size')
    }

    const icoImage = IcoImage.create(image.bitmap)

    const width = size < 256 ? size : 0
    const height = size < 256 ? size : 0
    const planes = icoImage.header.planes
    const bitCount = icoImage.header.bitCount
    const bytesInRes = icoImage.data.length
    const infoHeader = new IcoInfoHeader({
      width,
      height,
      planes,
      bitCount,
      bytesInRes
    })

    this.infoHeaders[index] = infoHeader
    this.images[index] = icoImage

    this._resetHeader()
  }
  removeImage(index) {
    this.infoHeaders.splice(index, 1)
    this.images.splice(index, 1)

    this._resetHeader()
  }
}
