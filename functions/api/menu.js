export async function onRequest(context) {
  try {
    const { request } = context;

    // Handle OPTIONS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST,GET,OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // Only allow POST for actual requests
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed. Use POST.' }), {
        status: 405,
        headers: { 
          'Content-Type': 'application/json', 
          'Access-Control-Allow-Origin': '*',
          'Allow': 'POST, OPTIONS'
        },
      });
    }

    // Parse incoming JSON (frontend should send { query, variables })
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return new Response(JSON.stringify({ error: 'Invalid JSON in request body' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // Forward to PWCS GraphQL API
    const upstream = await fetch('https://api.schoolnutritionandfitness.com/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const text = await upstream.text();

    // Return JSON
    try {
      const json = JSON.parse(text);
      return new Response(JSON.stringify(json), {
        status: upstream.status,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: 'Upstream returned non-JSON', raw: text }), {
        status: 502,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
}

