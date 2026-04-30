import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Synapse } from '@pyrx/synapse';
const synapse = new Synapse({ baseUrl: process.env.SYNAPSE_API_URL || "https://synapse-api.pyrx.tech", apiKey: process.env.SYNAPSE_API_KEY!, workspaceId: process.env.SYNAPSE_WORKSPACE_ID! });
export default async (req: VercelRequest, res: VercelResponse) => { if (req.method !== 'POST') return res.status(405).end(); res.json(await synapse.trackBatch({ events: req.body.events })); };
