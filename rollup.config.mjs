import alias from '@rollup/plugin-alias';
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/index.ts',
  output: {
    file: "dist/index.js",
    format: 'es',
  },
  plugins: [
    json(),
    terser(),
    typescript({
      tsconfig: './tsconfig.json',
    }),
    alias({
      entries: [
        { find: 'logger', replacement: './src/class/logger' },
        { find: '$', replacement: './src/commands' },
        { find: '#', replacement: './src/events' },
        { find: '@', replacement: './src' },
        { find: '~', replacement: '.' },
      ],
    }),
  ],
};
