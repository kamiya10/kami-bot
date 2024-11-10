import { Client, Collection } from 'discord.js';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { KamiStates } from '@/class/states';
import { createHash } from 'crypto';
import { safeWriteFileSync } from '@/utils/fs';

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
  cacheFolderPath = resolve('.cache');

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

    try {
      const data = this.commands.map((command) => command.builder.toJSON());
      const hash = createHash('md5').update(JSON.stringify(data)).digest('hex');

      const filePath = resolve(this.cacheFolderPath, 'commands.cache');

      if (process.env.NODE_ENV == 'development') {
        const devGuildId = process.env['DEV_GUILD_ID']?.split(',');
        if (!devGuildId?.length) return;

        for (const id of devGuildId) {
          const guild = this.guilds.cache.get(id);
          if (!guild) return;

          logger.debug(
            `Updating commands in ${guild.name} (${id}). (DEV_GUILD_ID=${devGuildId})`,
          );
          await guild.commands.set(data);
        }
        return;
      }

      if (existsSync(filePath)) {
        if (!force && readFileSync(filePath, { encoding: 'utf8' }) == hash) return;
      }

      logger.info('Updating global slash commands...');

      await this.application.commands.set(data);

      safeWriteFileSync(filePath, hash, { encoding: 'utf8' });

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
