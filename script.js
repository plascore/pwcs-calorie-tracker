const menuContainer = document.getElementById('menu-container');
const dateInput = document.getElementById('date');

// Default to today
const today = new Date().toISOString().split('T')[0];
dateInput.value = today;

// Convert YYYY-MM-DD to MM/DD/YYYY for PWCS API
function formatDateForPWCS(dateStr) {
  const [y, m, d] = dateStr.split('-');
  return `${m}/${d}/${y}`;
}

// Full GraphQL query (matches PWCS API)
const DETAILS_QUERY = `
query detailsCalendarPage($menu_type_id:String!,$start_date:String!,$end_date:String!){
  menuType(id:$menu_type_id){
    id
    name
    items(start_date:$start_date,end_date:$end_date){
      date
      product{
        id
        name
        prod_calories
        prod_allergens
      }
    }
  }
}
`;

async function loadMenu(dateIso) {
  menuContainer.innerHTML = '<p class="loading">Loading menu...</p>';
  const formatted = formatDateForPWCS(dateIso);

  const payload = {
    query: DETAILS_QUERY,
    variables: {
      menu_type_id: "599742bd4d4a13a5438b4567",
      start_date: formatted,
      end_date: formatted
    }
  };

  try {
    const response = await fetch('/api/menu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const text = await response.text();
    console.log('Raw response:', text); // debug

    const data = JSON.parse(text);

    if (!data.data || !data.data.menuType) {
      menuContainer.innerHTML = '<p>No menu found.</p>';
      return;
    }

    const items = data.data.menuType.items;
    if (!items || items.length === 0) {
      menuContainer.innerHTML = `<p>- No School Today -<br>- 0 cal</p>`;
      return;
    }

    // Clear container
    menuContainer.innerHTML = '';

    // Render items
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
    console.error('Error parsing menu data:', err);
  }
}

// Initial load
loadMenu(today);

// Update menu on date change
dateInput.addEventListener('change', e => {
  loadMenu(e.target.value);
});
