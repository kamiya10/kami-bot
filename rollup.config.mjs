import alias from '@rollup/plugin-alias';
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';

import { resolve } from 'path';

export default {
  input: 'src/index.ts',
  output: {
    dir: 'dist',
    format: 'es',
  },
  plugins: [
    alias({
      entries: [
        { find: 'logger', replacement: resolve('src', 'class', 'logger') },
        { find: '$', replacement: resolve('src', 'commands') },
        { find: '#', replacement: resolve('src', 'events') },
        { find: '@', replacement: resolve('src') },
        { find: '~', replacement: resolve() },
      ],
    }),
    json(),
    terser(),
    typescript(),
  ],
};
