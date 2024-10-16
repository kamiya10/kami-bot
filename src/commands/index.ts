import type { KamiCommand } from '@/class/command';

import avatar from '$/avatar';
import banner from '$/banner';
import color from '$/color';
import ping from '$/ping';
import push from '$/push';
import report from '$/earthquake';
import rts from '$/rts';
import track_voice_activity from '$/track_voice_activity';
import voice from '$/voice';
import weather from '$/weather';

export default [
  avatar,
  banner,
  color,
  ping,
  push,
  report,
  rts,
  track_voice_activity,
  voice,
  weather,
] as KamiCommand[];
