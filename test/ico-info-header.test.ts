import { IcoInfoHeader } from '../src'

describe('IcoInfoHeader', () => {
  describe('constructor', () => {
    it('should work', () => {
      const header = new IcoInfoHeader()
      expect(header.width).toBe(0)
      expect(header.height).toBe(0)
      expect(header.colorCount).toBe(0)
      expect(header.reserved).toBe(0)
      expect(header.planes).toBe(0)
      expect(header.bitCount).toBe(0)
      expect(header.bytesInRes).toBe(0)
      expect(header.imageOffset).toBe(0)
    })
  })

  describe('from', () => {
    it('should work', () => {
      const buffer = Buffer.alloc(16)
      buffer.writeUInt8(32, 0)
      buffer.writeUInt8(32, 1)
      buffer.writeUInt8(4, 2)
      buffer.writeUInt8(1, 3)
      buffer.writeUInt16LE(4, 4)
      buffer.writeUInt16LE(32, 6)
      buffer.writeUInt32LE(128, 8)
      buffer.writeUInt32LE(256, 12)

      const header = IcoInfoHeader.from(buffer)
      expect(header.width).toBe(32)
      expect(header.height).toBe(32)
      expect(header.colorCount).toBe(4)
      expect(header.reserved).toBe(1)
      expect(header.planes).toBe(4)
      expect(header.bitCount).toBe(32)
      expect(header.bytesInRes).toBe(128)
      expect(header.imageOffset).toBe(256)
    })
  })
})
