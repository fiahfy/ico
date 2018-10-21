import fs from 'fs'
import Ico from '../src'

describe('ico', () => {
  describe('constructor', () => {
    test('should work', async () => {
      const ico = new Ico()
      expect(ico.fileHeader.count).toBe(0)
      expect(ico.infoHeaders.length).toBe(0)
      expect(ico.images.length).toBe(0)
    })

    test('should work with buffer', async () => {
      const buf = fs.readFileSync('./test/sample.ico')
      const ico = new Ico(buf)
      expect(ico.fileHeader.count).toBe(7)
      expect(ico.infoHeaders.length).toBe(7)
      expect(ico.images.length).toBe(7)
    })
  })

  describe('data property', () => {
    test('should work', () => {
      const ico = new Ico()
      expect(ico.data.length).toBeGreaterThan(0)
      ico.data = fs.readFileSync('./test/sample.ico')
      expect(ico.fileHeader.count).toBe(7)
      expect(ico.infoHeaders.length).toBe(7)
      expect(ico.images.length).toBe(7)
    })
  })

  describe('appendImage', () => {
    test('should work', async () => {
      const buf = fs.readFileSync('./test/256x256.png')
      const ico = new Ico()
      expect(ico.fileHeader.count).toBe(0)
      expect(ico.infoHeaders.length).toBe(0)
      expect(ico.images.length).toBe(0)
      await ico.appendImage(buf)
      expect(ico.fileHeader.count).toBe(1)
      expect(ico.infoHeaders.length).toBe(1)
      expect(ico.images.length).toBe(1)
      await ico.appendImage(buf)
      expect(ico.fileHeader.count).toBe(2)
      expect(ico.infoHeaders.length).toBe(2)
      expect(ico.images.length).toBe(2)
    })

    test('should throw error if buffer is not PNG format', () => {
      const buf = fs.readFileSync('./test/256x256.jpg')
      const ico = new Ico()
      expect(ico.appendImage(buf)).rejects.toThrowError(TypeError)
    })

    test('should throw error if buffer is not square', () => {
      const buf = fs.readFileSync('./test/256x128.png')
      const ico = new Ico()
      expect(ico.appendImage(buf)).rejects.toThrowError(TypeError)
    })

    test('should throw error if buffer is not supported size', () => {
      const buf = fs.readFileSync('./test/100x100.png')
      const ico = new Ico()
      expect(ico.appendImage(buf)).rejects.toThrowError(TypeError)
    })
  })
})
