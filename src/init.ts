import { dirname } from 'path';

import PrettyError from 'pretty-error';
import i18next from 'i18next';
import strings from '@/localization/strings';

const pe = PrettyError.start() as PrettyError;

pe.skipNodeFiles();
pe.alias(`${dirname(import.meta.url).replace(/\\/g, '/')}/`, 'kami-bot @ ');
pe.appendStyle({
  'pretty-error': {
    marginLeft: 0,
  },
  'pretty-error > header > message': {
    color: 'white',
  },
  'pretty-error > trace': {
    marginTop: 0,
    marginLeft: 1,
  },
  'pretty-error > trace > item': {
    marginBottom: 0,
  },
  'pretty-error > trace > item > header > pointer > file': {
    color: 'blue',
  },
  'pretty-error > trace > item > header > pointer > line': {
    color: 'yellow',
  },
  'pretty-error > trace > item > header > what': {
    color: 'none',
  },
  'pretty-error > trace > item > footer > addr': {
    color: 'black',
  },
  'pretty-error > trace > item > footer > extra': {
    color: 'black',
  },
});

await i18next.init({
  resources: strings,
  interpolation: {
    escapeValue: false,
  },
});
