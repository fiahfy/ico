import fs from 'fs'
import { Ico, IcoImage, IcoFileHeader } from '../src'

describe('Ico', () => {
  describe('constructor', () => {
    test('should work', () => {
      const ico = new Ico()
      expect(ico.fileHeader).toEqual(new IcoFileHeader())
      expect(ico.infoHeaders).toEqual([])
      expect(ico.images).toEqual([])
    })
  })

  describe('from', () => {
    test('should work', () => {
      const buffer = fs.readFileSync('./test/icon.ico')
      const ico = Ico.from(buffer)
      expect(ico.images.length).toBe(7)
    })
  })

  describe('set images', () => {
    test('should work', () => {
      const ico = new Ico()
      const buffer = fs.readFileSync('./test/16x16.png')
      const firstBytes = ico.data.length
      let image: IcoImage, prevBytes: number

      prevBytes = ico.data.length
      image = IcoImage.fromPNG(buffer)
      ico.images = [...ico.images, image]
      expect(ico.images.length).toBe(1)
      expect(ico.infoHeaders.length).toBe(1)
      expect(ico.infoHeaders[0].bytesInRes).toBe(image.data.length)
      expect(ico.data.length).toBe(
        prevBytes + ico.infoHeaders[0].data.length + image.data.length
      )
      expect(ico.infoHeaders[0].imageOffset).toBe(
        ico.fileHeader.data.length +
          ico.infoHeaders.reduce(
            (carry, infoHeader) => carry + infoHeader.data.length,
            0
          )
      )

      prevBytes = ico.data.length
      image = IcoImage.fromPNG(buffer)
      ico.images = [...ico.images, image]
      expect(ico.images.length).toBe(2)
      expect(ico.infoHeaders.length).toBe(2)
      expect(ico.infoHeaders[1].bytesInRes).toBe(image.data.length)
      expect(ico.data.length).toBe(
        prevBytes + ico.infoHeaders[1].data.length + image.data.length
      )
      expect(ico.infoHeaders[0].imageOffset).toBe(
        ico.fileHeader.data.length +
          ico.infoHeaders.reduce(
            (carry, infoHeader) => carry + infoHeader.data.length,
            0
          )
      )
      expect(ico.infoHeaders[1].imageOffset).toBe(
        ico.infoHeaders[0].imageOffset + ico.infoHeaders[0].bytesInRes
      )

      prevBytes = ico.data.length
      image = IcoImage.fromPNG(buffer)
      ico.images = [...ico.images, image]
      expect(ico.images.length).toBe(3)
      expect(ico.infoHeaders.length).toBe(3)
      expect(ico.infoHeaders[2].bytesInRes).toBe(image.data.length)
      expect(ico.data.length).toBe(
        prevBytes + ico.infoHeaders[2].data.length + image.data.length
      )
      expect(ico.infoHeaders[0].imageOffset).toBe(
        ico.fileHeader.data.length +
          ico.infoHeaders.reduce(
            (carry, infoHeader) => carry + infoHeader.data.length,
            0
          )
      )
      expect(ico.infoHeaders[1].imageOffset).toBe(
        ico.infoHeaders[0].imageOffset + ico.infoHeaders[0].bytesInRes
      )
      expect(ico.infoHeaders[2].imageOffset).toBe(
        ico.infoHeaders[0].imageOffset +
          ico.infoHeaders[0].bytesInRes +
          ico.infoHeaders[1].bytesInRes
      )

      prevBytes = ico.data.length
      ico.images = []
      expect(ico.images.length).toBe(0)
      expect(ico.infoHeaders.length).toBe(0)
      expect(ico.data.length).toBe(firstBytes)
    })
  })

  describe('append', () => {
    test('should work', () => {
      const ico = new Ico()
      const buffer = fs.readFileSync('./test/16x16.png')
      let image: IcoImage

      image = IcoImage.fromPNG(buffer)
      ico.append(image)
      expect(ico.images.length).toBe(1)

      image = IcoImage.fromPNG(buffer)
      ico.append(image)
      expect(ico.images.length).toBe(2)
    })
  })

  describe('insert', () => {
    test('should work', () => {
      const ico = new Ico()
      const buffer = fs.readFileSync('./test/16x16.png')
      let image: IcoImage

      image = IcoImage.fromPNG(buffer)
      ico.insert(image, 0)
      expect(ico.images.length).toBe(1)

      image = IcoImage.fromPNG(buffer)
      ico.insert(image, 0)
      expect(ico.images.length).toBe(1)

      image = IcoImage.fromPNG(buffer)
      ico.insert(image, 1)
      expect(ico.images.length).toBe(2)
    })
  })

  describe('remove', () => {
    test('should work', () => {
      const ico = new Ico()
      const buffer = fs.readFileSync('./test/16x16.png')

      ico.images = [
        IcoImage.fromPNG(buffer),
        IcoImage.fromPNG(buffer),
        IcoImage.fromPNG(buffer)
      ]
      expect(ico.images.length).toBe(3)

      ico.remove(0)
      expect(ico.images.length).toBe(2)
    })
  })
})
