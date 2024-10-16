import { EventHandler } from '@/class/event';

import logger from 'logger';

export default new EventHandler({
  event: 'ready',
  async on(client) {
    await this.updateCommands();
    this.sweepStates();
    logger.info(
      `Client is ready as ${client.user.tag} with ${client.guilds.cache.size} guild${client.guilds.cache.size > 1 ? 's' : ''}.`,
    );
  },
});
