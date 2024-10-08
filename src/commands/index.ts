import type { KamiCommand } from '@/class/command';

import avatar from '$/avatar';
import banner from '$/banner';
import color from '$/color';
import ping from '$/ping';
import report from '$/report';
import rts from '$/rts';
import voice from '$/voice';
import weather from '$/weather';

export default [
  avatar,
  banner,
  color,
  ping,
  report,
  rts,
  voice,
  weather,
] as KamiCommand[];
