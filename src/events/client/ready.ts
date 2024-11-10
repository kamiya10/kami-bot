import { EventHandler } from '@/class/event';

import logger from 'logger';
import pkg from '~/package.json';

export default new EventHandler({
  event: 'ready',
  async on(client) {
    await this.updateCommands();
    this.sweepStates();

    logger.info(
      `Client is ready as ${client.user.tag} with ${client.guilds.cache.size} guild${client.guilds.cache.size > 1 ? 's' : ''}.`,
    );

    const updateStatus = () => {
      client.user.setActivity({
        name: `v${pkg.version} | ${client.guilds.cache.size} 伺服器`,
      });
    };

    updateStatus();
    setInterval(updateStatus, 600_000);
  },
});
