import fs from 'fs'
import { IcoImage } from '../src'

describe('IcoImage', () => {
  describe('constructor', () => {
    test('should work', () => {
      const image = new IcoImage()
      expect(image.header.data.length).toBe(40)
      expect(image.xor.length).toBe(0)
      expect(image.and.length).toBe(0)
    })
  })

  describe('fromPNG', () => {
    test('should work', () => {
      const buffer = fs.readFileSync('./test/256x256.png')
      expect(() => IcoImage.fromPNG(buffer)).not.toThrowError()
    })
    test('should throw error if buffer is not PNG format', () => {
      const buffer = fs.readFileSync('./test/256x256.jpg')
      expect(() => IcoImage.fromPNG(buffer)).toThrowError(TypeError)
    })
    test('should throw error if buffer is not square', () => {
      const buffer = fs.readFileSync('./test/256x128.png')
      expect(() => IcoImage.fromPNG(buffer)).toThrowError(TypeError)
    })
    test('should throw error if buffer is not supported size', () => {
      const buffer = fs.readFileSync('./test/100x100.png')
      expect(() => IcoImage.fromPNG(buffer)).toThrowError(TypeError)
    })
  })
})
