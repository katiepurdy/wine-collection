const electron = require('electron');
const { ipcRenderer } = electron;
window.$ = window.jQuery = require('jquery');

// Get element references
const addItemForm = document.getElementById('add-item-form');
const categorySelect = document.getElementById('category');

let populateType = () => {
  const category = categorySelect.value;
  const typeSelect = document.getElementById('type');
  const types = {
    red: ['Cabernet', 'Cabernet Sauvignon', 'Chardonnay', 'Malbec', 'Merlot', 'Sirah/Shiraz', 'Pinot Noir', 'Port', 'Other Red Varieties', 'Red Blends'],
    white: ['Riesling', 'Sauvignon Blanc', 'Verdelho', 'Semillon', 'Chardonnay', 'Pinot Gris/Pinot Grigio', 'Other White Varieties', 'White Blends'],
    dessert: ['Eiswein (Ice Wine)', 'Sauternes', 'Other Dessert Varieties', 'Dessert Blends']
  }

  // Populate the type select box with the relevant options
  if (types.hasOwnProperty(category)) {
    typeSelect.innerHTML = '';
    types[category].forEach(type => {
      const option = document.createElement('option');
      const optionText = document.createTextNode(type);
      option.appendChild(optionText);
      typeSelect.appendChild(option);
    });
  }
}

// Add event listeners
addItemForm.addEventListener('submit', submitForm);
categorySelect.addEventListener('change', populateType);

function submitForm(e) {
  e.preventDefault();

  // Grab the form values
	const name = document.getElementById('name').value;
	const category = document.getElementById('category').value;
	const type = document.getElementById('type').value;
	const year = document.getElementById('year').value;
	const winery = document.getElementById('winery').value;
	const yearPurchased = document.getElementById('year-purchased').value;
  const rating = document.getElementById('rating').value;
  
  let item = {
    name: name,
    category: category,
    type: type,
    year: year,
    winery: winery,
    yearPurchased: yearPurchased,
    rating: rating
  }

  ipcRenderer.send('item:add', item);
}

// jQuery plugin for some datepicker functionality
$(document).ready(function(){
  $('.yearpicker').yearpicker();
});
