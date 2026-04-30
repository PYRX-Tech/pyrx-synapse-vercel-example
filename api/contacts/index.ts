import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Synapse } from '@pyrx/synapse';
const synapse = new Synapse({ apiKey: process.env.SYNAPSE_API_KEY!, workspaceId: process.env.SYNAPSE_WORKSPACE_ID! });
export default async (req: VercelRequest, res: VercelResponse) => {
  if (req.method === 'GET') return res.json(await synapse.contacts.list({ page: Number(req.query.page) || 1, limit: Number(req.query.limit) || 20 }));
  res.status(405).end();
};
