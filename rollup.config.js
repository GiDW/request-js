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
      tsconfig: './tsconfig.json',
      rootDir: './src',
      declaration: true,
      declarationDir: './dist'
    }),
    uglify({
      mangle: true,
      compress: true
    })
  ]
}
