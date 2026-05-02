import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Synapse } from '@pyrx/synapse';
const synapse = new Synapse({ baseUrl: process.env.SYNAPSE_API_URL || "https://synapse-api.pyrx.tech", apiKey: process.env.SYNAPSE_API_KEY!, workspaceId: process.env.SYNAPSE_WORKSPACE_ID! });
export default async (req: VercelRequest, res: VercelResponse) => {
  const slug = req.query.slug as string;
  if (req.method === 'GET') return res.json(await synapse.templates.get(slug));
  if (req.method === 'PUT') return res.json(await synapse.templates.update(slug, req.body));
  if (req.method === 'DELETE') { await synapse.templates.delete(slug); return res.json({ success: true }); }
  if (req.method === 'POST') return res.json(await synapse.templates.preview(slug, req.body));
  res.status(405).end();
};
