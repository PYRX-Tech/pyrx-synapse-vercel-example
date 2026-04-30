import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Synapse } from '@pyrx/synapse';
const synapse = new Synapse({ baseUrl: process.env.SYNAPSE_API_URL || "https://synapse-api.pyrx.tech", apiKey: process.env.SYNAPSE_API_KEY!, workspaceId: process.env.SYNAPSE_WORKSPACE_ID! });
export default async (req: VercelRequest, res: VercelResponse) => {
  const id = req.query.id as string;
  if (req.method === 'GET') return res.json(await synapse.contacts.get(id));
  if (req.method === 'PUT') return res.json(await synapse.contacts.update(id, req.body));
  if (req.method === 'DELETE') { await synapse.contacts.delete(id); return res.json({ success: true }); }
  res.status(405).end();
};
