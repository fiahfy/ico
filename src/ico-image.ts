import { Bitmap } from 'jimp'
import { BitmapInfoHeader } from './bitmap-info-header'

export class IcoImage {
  header: BitmapInfoHeader
  xor: Buffer
  and: Buffer
  constructor(
    header = new BitmapInfoHeader(),
    xor = Buffer.alloc(0),
    and = Buffer.alloc(0)
  ) {
    this.header = header
    this.xor = xor
    this.and = and
  }
  get data(): Buffer {
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
  static create(bitmap: Bitmap): IcoImage {
    const width = bitmap.width
    const height = bitmap.height * 2 // image + mask
    const planes = 1
    const bitCount = (bitmap as any).bpp * 8 // byte per pixel * 8

    const xorSize = bitmap.height * bitmap.width * (bitmap as any).bpp
    const andSize =
      ((bitmap.width + (bitmap.width % 32 ? 32 - (bitmap.width % 32) : 0)) *
        bitmap.height) /
      8
    const sizeImage = xorSize + andSize

    const header = new BitmapInfoHeader(
      40,
      width,
      height,
      planes,
      bitCount,
      0,
      sizeImage
    )

    const xors = []
    let andBits: number[] = []

    // Convert Top/Left to Bottom/Left
    for (let y = bitmap.height - 1; y >= 0; y--) {
      for (let x = 0; x < bitmap.width; x++) {
        // RGBA to BGRA
        const pos = (y * bitmap.width + x) * (bitmap as any).bpp
        const red = bitmap.data.slice(pos, pos + 1)
        const green = bitmap.data.slice(pos + 1, pos + 2)
        const blue = bitmap.data.slice(pos + 2, pos + 3)
        const alpha = bitmap.data.slice(pos + 3, pos + 4)
        xors.push(blue)
        xors.push(green)
        xors.push(red)
        xors.push(alpha)
        andBits.push(alpha.readUInt8(0) === 0 ? 1 : 0)
      }
      const padding: number =
        andBits.length % 32 ? 32 - (andBits.length % 32) : 0
      andBits = andBits.concat(Array(padding).fill(0))
    }

    const ands = []
    for (let i = 0; i < andBits.length; i += 8) {
      const n = parseInt(andBits.slice(i, i + 8).join(''), 2)
      const buffer = Buffer.alloc(1)
      buffer.writeUInt8(n, 0)
      ands.push(buffer)
    }

    const xor = Buffer.concat(xors, xorSize)
    const and = Buffer.concat(ands, andSize)

    return new IcoImage(header, xor, and)
  }
}
