import 'dotenv/config';
import '@/init';

import { KamiClient } from '@/class/client';
import { KamiIntents } from '@/constants';

process.env.NODE_ENV ??= 'development';

const client = new KamiClient({
  intents: KamiIntents,
});

await client.login(process.env[process.env.NODE_ENV == 'production' ? 'KAMI_TOKEN' : 'DEV_TOKEN']);
