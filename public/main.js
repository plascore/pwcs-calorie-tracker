async function loadMenu() {
    const menuDiv = document.getElementById('menu');
    const totalCaloriesSpan = document.getElementById('total-calories');

    const today = new Date();
    const startDate = `${today.getMonth()+1}/${today.getDate()}/${today.getFullYear()}`;
    const endDate = `${today.getMonth()+1}/${today.getDate()}/${today.getFullYear()}`;

    const payload = {
        query: `
        query detailsCalendarPage($menu_type_id: String!, $start_date: String!, $end_date: String!) {
          menuType(id:$menu_type_id) {
            items(start_date: $start_date, end_date: $end_date) {
              product {
                name
                prod_calories
              }
            }
          }
        }`,
        variables: {
            menu_type_id: "599742bd4d4a13a5438b4567",
            start_date: startDate,
            end_date: endDate
        }
    };

    try {
        const response = await fetch('/api/menu', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        const items = data.data.menuType.items;

        menuDiv.innerHTML = '';
        let totalCalories = 0;

        items.forEach(item => {
            const name = item.product.name;
            const calories = parseFloat(item.product.prod_calories) || 0;
            totalCalories += calories;

            const p = document.createElement('p');
            p.textContent = `${name} - ${calories} cal`;
            menuDiv.appendChild(p);
        });

        totalCaloriesSpan.textContent = totalCalories;
    } catch (err) {
        console.error(err);
        menuDiv.textContent = 'Failed to load menu.';
    }
}

loadMenu();
