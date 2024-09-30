import type { EventHandler } from '@/class/event';

import command from '#/client/command';
import ready from '#/client/ready';
import report from '#/client/report';
import rts from '#/client/rts';
import voiceCreate from '#/client/voiceCreate';
import voiceDelete from '#/client/voiceDelete';
import voiceRemove from '#/client/voiceRemove';

export default [
  command,
  ready,
  report,
  rts,
  voiceCreate,
  voiceDelete,
  voiceRemove,
] as EventHandler[];
