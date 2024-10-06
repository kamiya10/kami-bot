import 'dotenv/config';
import '@/init';

import { KamiClient } from '@/class/client';
import { KamiIntents } from '@/constants';

const client = new KamiClient({
  intents: KamiIntents,
});

await client.login(process.env[process.env.NODE_ENV == 'development' ? 'DEV_TOKEN' : 'KAMI_TOKEN']);
