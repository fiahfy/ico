import { IcoFileHeader } from './ico-file-header'
import { IcoInfoHeader } from './ico-info-header'
import { IcoImage } from './ico-image'

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

  get images(): ReadonlyArray<IcoImage> {
    return this._images
  }

  set images(images: ReadonlyArray<IcoImage>) {
    this._images = images

    this._fileHeader = new IcoFileHeader(
      this._fileHeader.reserved,
      this._fileHeader.type,
      this._images.length
    )

    const infoHeaders = this._images.map((image) => {
      return new IcoInfoHeader(
        image.header.width < 256 ? image.header.width : 0,
        image.header.height < 256 ? image.header.height : 0,
        0,
        0,
        image.header.planes,
        image.header.bitCount,
        image.data.length
      )
    })

    let imageOffset =
      this._fileHeader.data.length +
      infoHeaders.reduce(
        (carry, infoHeader) => carry + infoHeader.data.length,
        0
      )

    this._infoHeaders = infoHeaders.map((infoHeader) => {
      const header = new IcoInfoHeader(
        infoHeader.width,
        infoHeader.height,
        infoHeader.colorCount,
        infoHeader.reserved,
        infoHeader.planes,
        infoHeader.bitCount,
        infoHeader.bytesInRes,
        imageOffset
      )
      imageOffset += header.bytesInRes
      return header
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

  /**
   * Adds ICO image at the end.
   * @param image The ICO Image to append.
   */
  append(image: IcoImage): void {
    this.images = [...this.images, image]
  }

  /**
   * Inserts ICO image at the specified position.
   * @param image The ICO Image to insert.
   * @param index The position at which to insert the ICO Image.
   */
  insert(image: IcoImage, index: number): void {
    this.images = [
      ...this.images.slice(0, index),
      image,
      ...this.images.slice(index + 1)
    ]
  }

  /**
   * Removes ICO image at the specified position.
   * @param index The position of the ICO Image to remove.
   */
  remove(index: number): void {
    this.images = [
      ...this.images.slice(0, index),
      ...this.images.slice(index + 1)
    ]
  }
}
