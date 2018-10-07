# @fiahfy/ico

> [ICO file format](https://en.wikipedia.org/wiki/ICO_(file_format)) parser and builder.

## Installation
```
npm install @fiahfy/ico
```

## Usage
```js
import fs from 'fs'
import Ico from '@fiahfy/ico'

const buf = fs.readFileSync('input.png')
const ico = new Ico(buf)
console.log(ico.data) // <Buffer 00 00 01 00 ...
```
