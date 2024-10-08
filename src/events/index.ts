import type { EventHandler } from '@/class/event';

import onCommand from '#/client/onCommand';
import onAutocomplete from './client/onAutocomplete';
import onButton from './client/onButton';
import onModalSubmit from './client/onModalSubmit';
import onSelectMenu from './client/onSelectMenu';
import ready from '#/client/ready';

import report from '#/custom/report';
import rts from '#/custom/rts';
import voiceCreate from '#/custom/voiceCreate';
import voiceDelete from '#/custom/voiceDelete';
import voiceRemove from '#/custom/voiceRemove';
import weatherAdvisory from '#/custom/weatherAdvisory';

export default [
  onCommand,
  onAutocomplete,
  onButton,
  onModalSubmit,
  onSelectMenu,
  ready,
  report,
  rts,
  voiceCreate,
  voiceDelete,
  voiceRemove,
  weatherAdvisory,
] as EventHandler[];
