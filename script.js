const menuContainer = document.getElementById('menu-container');
const dateInput = document.getElementById('date');
const selectedItemsContainer = document.getElementById('selected-items');
const totalCaloriesValue = document.getElementById('total-calories-value');
const clearBtn = document.getElementById('clear-selection');

// Store selected items (array of {id, name, calories, allergens})
let selectedItems = [];

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

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const text = await response.text();
    console.log('Raw response:', text); // debug

    if (!text || text.trim() === '') {
      throw new Error('Empty response from server');
    }

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
      const calories = prod.prod_calories || 0;
      const isSelected = selectedItems.some(sel => sel.id === prod.id);
      
      div.innerHTML = `
        <h3>${prod.name}</h3>
        <p class="calories-display">${calories || 'N/A'} calories</p>
        <button class="add-btn" data-item-id="${prod.id}" data-item-name="${prod.name}" data-item-calories="${calories}" data-item-allergens="${prod.prod_allergens || 'None'}" ${isSelected ? 'disabled' : ''}>
          ${isSelected ? 'Added' : 'Add to Counter'}
        </button>
      `;
      menuContainer.appendChild(div);
    });

    // Add event listeners to all add buttons
    document.querySelectorAll('.add-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-item-id');
        const name = e.target.getAttribute('data-item-name');
        const calories = parseInt(e.target.getAttribute('data-item-calories')) || 0;
        const allergens = e.target.getAttribute('data-item-allergens');
        
        addToCounter({ id, name, calories, allergens });
        e.target.disabled = true;
        e.target.textContent = 'Added';
      });
    });

  } catch (err) {
    menuContainer.innerHTML = '<p>Error loading menu.</p>';
    console.error('Error parsing menu data:', err);
  }
}

// Initial load
loadMenu(today);

// Add item to counter
function addToCounter(item) {
  selectedItems.push(item);
  updateCounterDisplay();
}

// Remove item from counter
function removeFromCounter(itemId) {
  selectedItems = selectedItems.filter(item => item.id !== itemId);
  updateCounterDisplay();
  
  // Re-enable the add button for this item
  const addBtn = document.querySelector(`.add-btn[data-item-id="${itemId}"]`);
  if (addBtn) {
    addBtn.disabled = false;
    addBtn.textContent = 'Add to Counter';
  }
}

// Update counter display
function updateCounterDisplay() {
  // Clear current display
  selectedItemsContainer.innerHTML = '';
  
  if (selectedItems.length === 0) {
    selectedItemsContainer.innerHTML = '<p class="empty-selection">No items selected yet.<br>Add items from the menu.</p>';
    totalCaloriesValue.textContent = '0';
    return;
  }
  
  // Display selected items
  selectedItems.forEach(item => {
    const div = document.createElement('div');
    div.className = 'selected-item';
    div.innerHTML = `
      <div class="selected-item-info">
        <div class="selected-item-name">${item.name}</div>
        <div class="selected-item-calories">${item.calories || 0} calories</div>
      </div>
      <button class="remove-btn" data-item-id="${item.id}">Remove</button>
    `;
    selectedItemsContainer.appendChild(div);
  });
  
  // Add event listeners to remove buttons
  document.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const itemId = e.target.getAttribute('data-item-id');
      removeFromCounter(itemId);
    });
  });
  
  // Calculate and display total calories
  const total = selectedItems.reduce((sum, item) => sum + (parseInt(item.calories) || 0), 0);
  totalCaloriesValue.textContent = total;
}

// Clear all selected items
clearBtn.addEventListener('click', () => {
  selectedItems = [];
  updateCounterDisplay();
  
  // Re-enable all add buttons
  document.querySelectorAll('.add-btn').forEach(btn => {
    btn.disabled = false;
    btn.textContent = 'Add to Counter';
  });
});

// Update menu on date change
dateInput.addEventListener('change', e => {
  loadMenu(e.target.value);
});

// Initialize counter display
updateCounterDisplay();
