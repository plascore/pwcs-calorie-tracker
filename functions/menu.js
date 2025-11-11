export async function onRequestPost(context) {
    const { request } = context;
    const body = await request.text(); // pass GraphQL payload from frontend

    const response = await fetch("https://api.schoolnutritionandfitness.com/graphql", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body
    });

    const json = await response.json();

    return new Response(JSON.stringify(json), {
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
        }
    });
}
