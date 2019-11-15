import { IcoFileHeader } from '../src'

describe('IcoFileHeader', () => {
  describe('constructor', () => {
    it('should work', () => {
      const header = new IcoFileHeader()
      expect(header.reserved).toBe(0)
      expect(header.type).toBe(1)
      expect(header.count).toBe(0)
    })
  })

  describe('from', () => {
    it('should work', () => {
      const buffer = Buffer.alloc(6)
      buffer.writeUInt16LE(1, 0)
      buffer.writeUInt16LE(2, 2)
      buffer.writeUInt16LE(3, 4)

      const header = IcoFileHeader.from(buffer)
      expect(header.reserved).toBe(1)
      expect(header.type).toBe(2)
      expect(header.count).toBe(3)
    })
  })
})
