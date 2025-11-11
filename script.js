// public/script.js
const menuContainer = document.getElementById('menu-container');
const dateInput = document.getElementById('date');

// Default to today (YYYY-MM-DD for <input type=date>)
const today = new Date().toISOString().split('T')[0];
dateInput.value = today;

function formatDateForPWCS(dateStr) {
  // Input: "YYYY-MM-DD" -> Output: "MM/DD/YYYY"
  const [year, month, day] = dateStr.split('-');
  return `${month}/${day}/${year}`;
}

// GraphQL query exactly like the site uses
const DETAILS_QUERY = `
query detailsCalendarPage($menu_type_id: String!, $start_date: String!, $end_date: String!) {
  menuType(id:$menu_type_id) {
    id
    name
    items(start_date: $start_date, end_date: $end_date) {
      date
      product {
        id
        name
        prod_calories
        prod_allergens
      }
    }
  }
}
`;

async function loadMenu(date) {
  const formatted = formatDateForPWCS(date);
  menuContainer.innerHTML = '<p class="loading">Loading menu...</p>';

  const payload = {
    query: DETAILS_QUERY,
    variables: {
      menu_type_id: "599742bd4d4a13a5438b4567",
      start_date: formatted,
      end_date: formatted
    }
  };

  try {
    const res = await fetch('/api/menu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const text = await res.text();
    // DEBUG: uncomment to inspect raw response in console
    // console.log('Raw response:', text);

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      menuContainer.innerHTML = '<p>Error parsing menu data.</p>';
      console.error('Raw response (not JSON):', text);
      return;
    }

    if (!data.data || !data.data.menuType) {
      // show any server-side GraphQL errors for debugging
      console.warn('GraphQL returned no menuType:', data);
      menuContainer.innerHTML = '<p>No menu found.</p>';
      return;
    }

    const items = data.data.menuType.items || [];
    if (items.length === 0) {
      menuContainer.innerHTML = `<p>- No School Today -<br>- 0 cal</p>`;
      return;
    }

    // render items + calories
    let total = 0;
    menuContainer.innerHTML = '';
    items.forEach(item => {
      const prod = item.product || {};
      const name = prod.name || '(no name)';
      const cals = parseFloat(prod.prod_calories) || 0;
      total += cals;

      const div = document.createElement('div');
      div.className = 'menu-item';
      div.innerHTML = `<h3>${escapeHtml(name)}</h3>
                       <p>Calories: ${cals}</p>
                       <p>Allergens: ${escapeHtml(prod.prod_allergens || 'None')}</p>`;
      menuContainer.appendChild(div);
    });

    // optional: show total calories
    const totEl = document.createElement('p');
    totEl.innerHTML = `<strong>Total Calories: ${total}</strong>`;
    menuContainer.prepend(totEl);

  } catch (err) {
    menuContainer.innerHTML = '<p>Error loading menu.</p>';
    console.error(err);
  }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

// initial load
loadMenu(today);

// date change
dateInput.addEventListener('change', e => loadMenu(e.target.value));
