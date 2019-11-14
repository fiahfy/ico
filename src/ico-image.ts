import { Bitmap } from 'jimp'
import { BitmapInfoHeader } from './bitmap-info-header'

export class IcoImage {
  readonly header: BitmapInfoHeader
  readonly xor: Buffer
  readonly and: Buffer

  constructor(
    header = new BitmapInfoHeader(),
    xor = Buffer.alloc(0),
    and = Buffer.alloc(0)
  ) {
    this.header = header
    this.xor = xor
    this.and = and
  }

  /**
   * Create ICO image from the buffer.
   * @param buffer The ICO image buffer.
   */
  static from(buffer: Buffer): IcoImage {
    const header = BitmapInfoHeader.from(buffer)

    // TODO: only 32 bpp supported
    // no colors when bpp is 16 or more

    let pos = header.data.length
    const xorSize = (((header.width * header.height) / 2) * header.bitCount) / 8
    const xor = buffer.slice(pos, pos + xorSize)

    pos += xorSize
    const andSize =
      ((header.width + (header.width % 32 ? 32 - (header.width % 32) : 0)) *
        header.height) /
      2 /
      8
    const and = buffer.slice(pos, pos + andSize)

    return new IcoImage(header, xor, and)
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

  get data(): Buffer {
    const buffers = [this.header.data, this.xor, this.and]
    return Buffer.concat(buffers)
  }
}
