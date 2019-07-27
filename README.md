# @fiahfy/ico

> [ICO file format](https://en.wikipedia.org/wiki/ICO_(file_format)) parser and builder.


## Installation
```
npm install @fiahfy/ico
```


## Usage

### Parsing
```js
import fs from 'fs'
import Ico from '@fiahfy/ico'

const buf = fs.readFileSync('icon.ico')
const ico = new Ico(buf)
console.log(ico.fileHeader) // IcoFileHeader { reserved: 0, type: 1, count: 7 }
console.log(ico.infoHeaders[0]) // IcoInfoHeader { width: 16, height: 16, ... }
```

### Building
```js
import fs from 'fs'
import Ico from '@fiahfy/ico'

const ico = new Ico()
let buf

buf = fs.readFileSync('128x128.png')
await ico.appendImage(buf)

buf = fs.readFileSync('256x256.png')
await ico.appendImage(buf)

/* Some other PNG files */

fs.writeFileSync('icon.ico', ico.data)
```


## Specifications

### Supported Size
| Size    |
|---------|
| 16x16   |
| 24x24   |
| 32x32   |
| 48x48   |
| 64x64   |
| 128x128 |
| 256x256 |
