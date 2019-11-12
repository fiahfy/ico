import Jimp from 'jimp'
import { IcoFileHeader } from './ico-file-header'
import { IcoInfoHeader } from './ico-info-header'
import { IcoImage } from './ico-image'

export class Ico {
  static readonly supportedSizes = [16, 24, 32, 48, 64, 128, 256]

  fileHeader: IcoFileHeader
  infoHeaders: IcoInfoHeader[]
  images: IcoImage[]

  constructor(buffer?: Buffer) {
    this.fileHeader = new IcoFileHeader()
    this.infoHeaders = []
    this.images = []
    if (buffer) {
      this.data = buffer
    }
  }

  get data(): Buffer {
    const buffers = [
      this.fileHeader.data,
      ...this.infoHeaders.map((infoHeader) => infoHeader.data),
      ...this.images.map((image) => image.data)
    ]
    return Buffer.concat(buffers)
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

  private resetHeader(): void {
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

  async appendImage(buffer: Buffer): Promise<void> {
    await this.insertImage(buffer, this.fileHeader.count)
  }
  async insertImage(buffer: Buffer, index: number): Promise<void> {
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
    const infoHeader = new IcoInfoHeader(
      width,
      height,
      0,
      0,
      planes,
      bitCount,
      bytesInRes
    )

    this.infoHeaders[index] = infoHeader
    this.images[index] = icoImage

    this.resetHeader()
  }
  removeImage(index: number): void {
    this.infoHeaders.splice(index, 1)
    this.images.splice(index, 1)

    this.resetHeader()
  }
}
