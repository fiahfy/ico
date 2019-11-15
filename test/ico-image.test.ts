import fs from 'fs'
import { IcoImage } from '../src'

describe('IcoImage', () => {
  describe('constructor', () => {
    it('should work', () => {
      const image = new IcoImage()
      expect(image.header.data.length).toBe(40)
      expect(image.xor.length).toBe(0)
      expect(image.and.length).toBe(0)
    })
  })

  describe('fromPNG', () => {
    it('should work', () => {
      const buffer = fs.readFileSync('./test/16x16.png')
      const image = IcoImage.fromPNG(buffer)
      expect(image.header.size).toBe(40)
      expect(image.header.width).toBe(16)
      expect(image.header.height).toBe(32)
      expect(image.header.planes).toBe(1)
      expect(image.header.compression).toBe(0)
    })
    it('should throw error if buffer is not PNG format', () => {
      const buffer = fs.readFileSync('./test/256x256.jpg')
      expect(() => IcoImage.fromPNG(buffer)).toThrowError(TypeError)
    })
    it('should throw error if buffer is not square', () => {
      const buffer = fs.readFileSync('./test/256x128.png')
      expect(() => IcoImage.fromPNG(buffer)).toThrowError(TypeError)
    })
    it('should throw error if buffer is not supported size', () => {
      const buffer = fs.readFileSync('./test/100x100.png')
      expect(() => IcoImage.fromPNG(buffer)).toThrowError(TypeError)
    })
  })
})
