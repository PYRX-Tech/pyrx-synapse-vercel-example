import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Synapse } from '@pyrx/synapse';
const synapse = new Synapse({ baseUrl: process.env.SYNAPSE_API_URL || "https://synapse-api.pyrx.tech", apiKey: process.env.SYNAPSE_API_KEY!, workspaceId: process.env.SYNAPSE_WORKSPACE_ID! });
export default async (req: VercelRequest, res: VercelResponse) => {
  if (req.method === 'GET') return res.json(await synapse.templates.list());
  if (req.method === 'POST') return res.json(await synapse.templates.create(req.body));
  res.status(405).end();
};
