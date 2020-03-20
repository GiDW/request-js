import typescript from '@rollup/plugin-typescript'
import { uglify } from 'rollup-plugin-uglify'

export default {
  input: './src/index.ts',
  output: {
    dir: './dist',
    format: 'umd',
    name: 'RequestJs',
    compact: true
  },
  plugins: [
    typescript({
      tsconfig: './tsconfig.json'
    }),
    uglify({
      mangle: true,
      compress: true
    })
  ]
}
