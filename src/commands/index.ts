import type { KamiCommand } from '@/class/command';

// earthquake
import report from '@/commands/earthquake/report';
import rts from '@/commands/earthquake/rts';

// utils
import avatar from '@/commands/utils/avatar';
import banner from '@/commands/utils/banner';
import color from '@/commands/utils/color';
import ping from '@/commands/utils/ping';

// voice
import voice from '@/commands/voice/voice';

export default [
  report,
  rts,
  avatar,
  banner,
  color,
  ping,
  voice,
] as KamiCommand[];
