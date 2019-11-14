import Jimp from 'jimp'
import { IcoFileHeader } from './ico-file-header'
import { IcoInfoHeader } from './ico-info-header'
import { IcoImage } from './ico-image'
import { file } from '@babel/types'

export class Ico {
  static readonly supportedIconSizes = [16, 24, 32, 48, 64, 128, 256]

  private _fileHeader: IcoFileHeader
  private _infoHeaders: ReadonlyArray<IcoInfoHeader>
  private _images: ReadonlyArray<IcoImage>

  constructor(
    fileHeader = new IcoFileHeader(),
    infoHeaders: IcoInfoHeader[] = [],
    images: IcoImage[] = []
  ) {
    this._fileHeader = fileHeader
    this._infoHeaders = infoHeaders
    this._images = images
  }

  /**
   * Create ICO from the icon buffer.
   * @param buffer The ICO icon buffer.
   */
  static from(buffer: Buffer): Ico {
    const fileHeader = IcoFileHeader.from(buffer)

    let pos = fileHeader.data.length
    const infoHeaders = []
    for (let i = 0; i < fileHeader.count; i++) {
      const infoHeader = IcoInfoHeader.from(buffer.slice(pos))
      infoHeaders.push(infoHeader)
      pos += infoHeader.data.length
    }

    const images = []
    for (let i = 0; i < infoHeaders.length; i++) {
      const { imageOffset: pos } = infoHeaders[i]
      const image = IcoImage.from(buffer.slice(pos))
      images.push(image)
    }

    return new Ico(fileHeader, infoHeaders, images)
  }

  get fileHeader(): IcoFileHeader {
    return this._fileHeader
  }

  get infoHeaders(): ReadonlyArray<IcoInfoHeader> {
    return this._infoHeaders
  }

  set infoHeaders(infoHeaders: ReadonlyArray<IcoInfoHeader>) {
    this._infoHeaders = infoHeaders

    const count = this._infoHeaders.length

    this._fileHeader = new IcoFileHeader(
      this._fileHeader.reserved,
      this._fileHeader.type,
      count
    )
  }

  get images(): ReadonlyArray<IcoImage> {
    return this._images
  }

  set images(images: ReadonlyArray<IcoImage>) {
    this._images = images

    let imageOffset =
      this._fileHeader.data.length +
      this._infoHeaders.reduce(
        (carry, infoHeader) => carry + infoHeader.data.length,
        0
      )

    const infoHeaders = this._infoHeaders.map((infoHeader) => {
      infoHeader.imageOffset = imageOffset
      imageOffset += infoHeader.bytesInRes
      return infoHeader
    })
  }

  get data(): Buffer {
    const buffers = [
      this._fileHeader.data,
      ...this._infoHeaders.map((infoHeader) => infoHeader.data),
      ...this._images.map((image) => image.data)
    ]
    return Buffer.concat(buffers)
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
