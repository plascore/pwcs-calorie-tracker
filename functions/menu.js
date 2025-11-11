export async function onRequestPost(context) {
    let body;
    try {
        body = await context.request.json();
    } catch (e) {
        return new Response(JSON.stringify({ error: "Invalid JSON" }), {
            headers: { "Content-Type": "application/json" },
            status: 400
        });
    }

    // Send to PWCS GraphQL API
    const response = await fetch("https://api.schoolnutritionandfitness.com/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });

    const text = await response.text();
    let data;
    try {
        data = JSON.parse(text);
    } catch {
        return new Response(JSON.stringify({ error: "Invalid response from PWCS API", raw: text }), {
            headers: { "Content-Type": "application/json" },
            status: 500
        });
    }

    return new Response(JSON.stringify(data), {
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
        }
    });
}
