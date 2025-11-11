export async function onRequestPost(context) {
  const body = await context.request.text();

  const response = await fetch("https://api.schoolnutritionandfitness.com/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });

  return new Response(await response.text(), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
