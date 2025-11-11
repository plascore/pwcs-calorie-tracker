export async function onRequest(context) {
  const response = await fetch("https://api.schoolnutritionandfitness.com/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      operationName: "GetMenu",
      variables: {
        menuTypeId: "599742bd4d4a13a5438b4567",
        monthId: "68890313615e6713f665ab47"
      },
      query: `
        query GetMenu($menuTypeId: ID!, $monthId: ID!) {
          menuType(id: $menuTypeId) {
            items(monthId: $monthId) {
              date
              product { name prod_calories }
            }
          }
        }
      `
    }),
  });

  const data = await response.text();
  return new Response(data, {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
