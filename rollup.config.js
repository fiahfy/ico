import babel from 'rollup-plugin-babel'
import pkg from './package.json'

export default {
  input: 'src/index.js',
  output: [
    {
      file: pkg.main,
      format: 'cjs'
    },
    {
      file: pkg.module,
      format: 'esm'
    }
  ],
  external: ['jimp'],
  plugins: [
    babel({
      exclude: 'node_modules/**'
    })
  ]
}
