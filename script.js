// usage: format date from YYYY-MM-DD -> MM/DD/YYYY
function formatDateForPWCS(dateStr) {
  const [y,m,d] = dateStr.split('-');
  return `${m}/${d}/${y}`;
}

const DETAILS_QUERY = `query detailsCalendarPage($menu_type_id:String!,$start_date:String!,$end_date:String!){
  menuType(id:$menu_type_id){
    id name items(start_date:$start_date,end_date:$end_date){
      date product{ id name prod_calories prod_allergens }
    }
  }
}`;

async function loadMenu(dateIso) {
  const formatted = formatDateForPWCS(dateIso);
  const payload = { query: DETAILS_QUERY, variables: { menu_type_id: "599742bd4d4a13a5438b4567", start_date: formatted, end_date: formatted } };

  const res = await fetch('/api/menu', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify(payload) });
  const text = await res.text();
  console.log('Raw response:', text);
  const data = JSON.parse(text); // will succeed once function works
  // ... process data ...
}
