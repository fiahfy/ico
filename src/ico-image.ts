import { PNG } from 'pngjs'
import { BitmapInfoHeader } from './bitmap-info-header'
import { Ico } from './ico'

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

  /**
   * Create ICO Image from the PNG image buffer.
   * @param buffer The PNG image buffer.
   */
  static fromPNG(buffer: Buffer): IcoImage {
    const png = IcoImage.readPNG(buffer)
    if (!png) {
      throw new TypeError('Image must be PNG format')
    }

    const width = png.width
    const height = png.height
    if (width !== height) {
      throw new TypeError('Image must be squre')
    }
    const supported = Ico.supportedIconSizes.includes(width)
    if (!supported) {
      throw new TypeError('No supported size')
    }

    const bpp = 4
    const planes = 1
    const bitCount = bpp * 8 // byte per pixel * 8

    const xors = []
    let andBits: number[] = []

    // Convert Top/Left to Bottom/Left
    for (let y = height - 1; y >= 0; y--) {
      for (let x = 0; x < width; x++) {
        // RGBA to BGRA
        const pos = (y * width + x) * bpp
        const red = png.data.slice(pos, pos + 1)
        const green = png.data.slice(pos + 1, pos + 2)
        const blue = png.data.slice(pos + 2, pos + 3)
        const alpha = png.data.slice(pos + 3, pos + 4)
        xors.push(blue)
        xors.push(green)
        xors.push(red)
        xors.push(alpha)
        andBits.push(alpha.readUInt8(0) === 0 ? 1 : 0)
      }
      const padding = andBits.length % 32 ? 32 - (andBits.length % 32) : 0
      andBits = andBits.concat(Array(padding).fill(0))
    }

    const ands = []
    for (let i = 0; i < andBits.length; i += 8) {
      const n = parseInt(andBits.slice(i, i + 8).join(''), 2)
      const buffer = Buffer.alloc(1)
      buffer.writeUInt8(n, 0)
      ands.push(buffer)
    }

    const xor = Buffer.concat(xors)
    const and = Buffer.concat(ands)

    const header = new BitmapInfoHeader(
      40,
      width,
      height * 2, // image + mask
      planes,
      bitCount,
      0,
      xor.length + and.length
    )

    return new IcoImage(header, xor, and)
  }

  get data(): Buffer {
    const buffers = [this.header.data, this.xor, this.and]
    return Buffer.concat(buffers)
  }

  private static readPNG(buffer: Buffer): PNG | undefined {
    try {
      return PNG.sync.read(buffer)
    } catch (e) {
      return undefined
    }
  }
}
