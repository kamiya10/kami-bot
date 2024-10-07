import type { KamiCommand } from '@/class/command';

// earthquake
import report from '$/report';
import rts from '$/rts';

// utils
import avatar from '$/avatar';
import banner from '$/banner';
import color from '$/color';
import ping from '$/ping';

// voice
import voice from '$/voice';

export default [
  report,
  rts,
  avatar,
  banner,
  color,
  ping,
  voice,
] as KamiCommand[];
