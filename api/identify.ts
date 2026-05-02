import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Synapse } from '@pyrx/synapse';

const synapse = new Synapse({
  baseUrl: process.env.SYNAPSE_API_URL || "https://synapse-api.pyrx.tech",
  apiKey: process.env.SYNAPSE_API_KEY!,
  workspaceId: process.env.SYNAPSE_WORKSPACE_ID!,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { userId, email, properties } = req.body;
  await synapse.identify({ externalId: userId, email, properties });
  res.json({ success: true });
}
