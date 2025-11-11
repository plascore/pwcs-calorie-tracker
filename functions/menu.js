// functions/menu.js
export async function onRequestPost(context) {
  // Read JSON body (frontend must send { query, variables })
  let body;
  try {
    body = await context.request.json();
  } catch (err) {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Forward to PWCS GraphQL
  const resp = await fetch("https://api.schoolnutritionandfitness.com/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const text = await resp.text();
  // Try to return parsed JSON, but always return valid JSON to frontend
  try {
    const json = JSON.parse(text);
    return new Response(JSON.stringify(json), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (e) {
    // PWCS returned non-JSON (or empty). Return a helpful JSON object for debugging.
    return new Response(JSON.stringify({ error: "Invalid response from PWCS", raw: text }), {
      status: 502,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
}
