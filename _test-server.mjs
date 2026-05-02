/**
 * Local test server that adapts Vercel serverless function handlers
 * to a plain Node.js HTTP server. No Vercel CLI required.
 */
import { createServer } from 'node:http';
import { URL } from 'node:url';

const PORT = parseInt(process.env.PORT || '4008', 10);

// Dynamic imports of handler modules (tsx handles TS transpilation)
const trackHandler = (await import('./api/track.ts')).default;
const trackBatchHandler = (await import('./api/track/batch.ts')).default;
const identifyHandler = (await import('./api/identify.ts')).default;
const identifyBatchHandler = (await import('./api/identify/batch.ts')).default;
const sendHandler = (await import('./api/send.ts')).default;
const contactsListHandler = (await import('./api/contacts/index.ts')).default;
const contactByIdHandler = (await import('./api/contacts/[id].ts')).default;
const templatesListHandler = (await import('./api/templates/index.ts')).default;
const templateBySlugHandler = (await import('./api/templates/[slug].ts')).default;

function parseBody(req) {
  return new Promise((resolve) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString();
      try { resolve(JSON.parse(raw)); } catch { resolve({}); }
    });
  });
}

function adaptReqRes(req, res, url) {
  // Adapt req to look like VercelRequest
  req.query = Object.fromEntries(url.searchParams);
  // Adapt res to look like VercelResponse
  const origEnd = res.end.bind(res);
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (obj) => {
    res.setHeader('Content-Type', 'application/json');
    origEnd(JSON.stringify(obj));
  };
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const path = url.pathname;
  const method = req.method;

  req.body = await parseBody(req);
  adaptReqRes(req, res, url);

  try {
    // Route matching
    if (path === '/api/track' && method === 'POST') return await trackHandler(req, res);
    if (path === '/api/track/batch' && method === 'POST') return await trackBatchHandler(req, res);
    if (path === '/api/identify' && method === 'POST') return await identifyHandler(req, res);
    if (path === '/api/identify/batch' && method === 'POST') return await identifyBatchHandler(req, res);
    if (path === '/api/send' && method === 'POST') return await sendHandler(req, res);
    if (path === '/api/contacts' && method === 'GET') return await contactsListHandler(req, res);
    if (path === '/api/templates' && method === 'GET') return await templatesListHandler(req, res);
    if (path === '/api/templates' && method === 'POST') return await templatesListHandler(req, res);

    // /api/templates/:slug/preview
    const previewMatch = path.match(/^\/api\/templates\/([^/]+)\/preview$/);
    if (previewMatch) {
      req.query.slug = previewMatch[1];
      return await templateBySlugHandler(req, res);
    }

    // /api/templates/:slug
    const templateMatch = path.match(/^\/api\/templates\/([^/]+)$/);
    if (templateMatch) {
      req.query.slug = templateMatch[1];
      return await templateBySlugHandler(req, res);
    }

    // /api/contacts/:id
    const contactMatch = path.match(/^\/api\/contacts\/([^/]+)$/);
    if (contactMatch) {
      req.query.id = contactMatch[1];
      return await contactByIdHandler(req, res);
    }

    res.statusCode = 404;
    res.end('Not found');
  } catch (e) {
    res.statusCode = e.status || 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: e.message, status: e.status || 500 }));
  }
});

server.listen(PORT, () => {
  console.log(`Vercel test server listening on http://localhost:${PORT}`);
});
