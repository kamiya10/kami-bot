import { Client, Collection } from 'discord.js';
import { existsSync, readFileSync } from 'fs';
import { join, resolve } from 'path';
import { KamiStates } from '@/class/states';

import type { ClientOptions } from 'discord.js';
import type { KamiCommand } from '@/class/command';
import type { KamiStatesOptions } from '@/class/states';

import commands from '@/commands';
import db from '@/database';
import events from '@/events';
import logger from 'logger';

export class KamiClient extends Client {
  states: KamiStates;
  commands = new Collection<string, KamiCommand>();
  database = db;
  cacheDirectory = resolve('.cache');

  constructor(clientOptions: ClientOptions) {
    super(clientOptions);

    let cachedState;

    if (existsSync('./.cache/states.json')) {
      cachedState = JSON.parse(
        readFileSync('./.cache/states.json', { encoding: 'utf-8' }),
      ) as KamiStatesOptions;
    }

    this.states = new KamiStates(this, cachedState);

    for (const command of commands) {
      this.commands.set(command.builder.name, command);
    }
    logger.debug(`Loaded ${this.commands.size} commands`);

    for (const event of events) {
      const on = event.on;
      if (on) {
        // @ts-expect-error implementation limitation
        this.on(event.event, (...args) => void on.apply(this, args));
      }
      const once = event.once;
      if (once) {
        // @ts-expect-error implementation limitation
        this.once(event.event, (...args) => void once.apply(this, args));
      }
    }
    logger.debug(`Loaded ${events.length} event handlers`);
  }

  async updateCommands(force = false) {
    if (!this.isReady()) {
      logger.error('Client isn\'t ready for command updates yet');
      return;
    }
    const lockfile = Bun.file(join(this.cacheDirectory, 'commands.lock'));

    try {
      const data = this.commands.map((v) => v.builder.toJSON());

      const hash = new Bun.CryptoHasher('sha256')
        .update(JSON.stringify(data))
        .digest('hex');

      if (!force && (await lockfile.text().catch((e) => void e)) == hash) {
        logger.debug(
          'Command Version is the same. Skipping command registration.',
        );
        return;
      }

      if (process.env.NODE_ENV == 'development') {
        const devGuildId = process.env['DEV_GUILD_ID'];
        if (!devGuildId) return;

        const guild = this.guilds.cache.get(devGuildId);
        if (!guild) return;

        logger.debug(
          `Updating commands in ${guild.name}. (DEV_GUILD_ID=${devGuildId})`,
        );
        await guild.commands.set(data);
        return;
      }

      await this.application.commands.set(data);

      await Bun.write(lockfile, hash);

      logger.info('Command updated successfully');
    }
    catch (error) {
      logger.error('Error while updating commands', error);
    }
  }

  sweepStates() {
    for (const [id] of this.states.voice) {
      if (!this.channels.cache.has(id)) {
        this.states.voice.delete(id);
      }
    }
  }
}
