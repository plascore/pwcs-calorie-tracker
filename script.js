const menuContainer = document.getElementById('menu-container');
const dateInput = document.getElementById('date');

// Default to today
const today = new Date().toISOString().split('T')[0];
dateInput.value = today;

function formatDateForPWCS(dateStr) {
    const [year, month, day] = dateStr.split('-');
    return `${month}/${day}/${year}`; // MM/DD/YYYY
}

async function loadMenu(date) {
    const formattedDate = formatDateForPWCS(date);
    menuContainer.innerHTML = '<p class="loading">Loading menu...</p>';

    try {
        const response = await fetch('/api/menu', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                menu_type_id: "599742bd4d4a13a5438b4567",
                start_date: formattedDate,
                end_date: formattedDate
            })
        });

        const text = await response.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch {
            menuContainer.innerHTML = '<p>Error parsing menu data.</p>';
            console.error('Raw response:', text);
            return;
        }

        if (!data.data || !data.data.menuType) {
            menuContainer.innerHTML = '<p>No menu found.</p>';
            return;
        }

        const items = data.data.menuType.items;

        if (!items || items.length === 0) {
            menuContainer.innerHTML = `<p>- No School Today -<br>- 0 cal</p>`;
            return;
        }

        menuContainer.innerHTML = '';
        items.forEach(item => {
            const prod = item.product;
            const div = document.createElement('div');
            div.className = 'menu-item';
            div.innerHTML = `
                <h3>${prod.name}</h3>
                <p>Calories: ${prod.prod_calories || 'N/A'}</p>
                <p>Allergens: ${prod.prod_allergens || 'None'}</p>
            `;
            menuContainer.appendChild(div);
        });

    } catch (err) {
        menuContainer.innerHTML = '<p>Error loading menu.</p>';
        console.error(err);
    }
}

// Initial load
loadMenu(today);

// Update menu on date change
dateInput.addEventListener('change', e => loadMenu(e.target.value));
