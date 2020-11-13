const electron = require('electron');
const { ipcRenderer } = electron;
window.$ = window.jQuery = require('jquery');

let applyTheme = themeName => {
	// Add a class to the root element to apply different CSS custom properties predefined for each theme in main.css
	var root = document.getElementsByTagName('html')[0];
	root.className = themeName;
}

ipcRenderer.on('applyTheme', (e, themeName) => applyTheme(themeName));

// Selectors
const addItemForm = document.getElementById('add-item-form');
const categorySelect = document.getElementById('category');

// Populate the type select box with options for the selected category
let populateType = () => {
  const category = categorySelect.value;
  const typeSelect = document.getElementById('type');
  const types = {
    red: ['Cabernet', 'Cabernet Sauvignon', 'Chardonnay', 'Malbec', 'Merlot', 'Sirah/Shiraz', 'Pinot Noir', 'Port', 'Other Red Varieties', 'Red Blends'],
    white: ['Riesling', 'Sauvignon Blanc', 'Verdelho', 'Semillon', 'Chardonnay', 'Pinot Gris/Pinot Grigio', 'Other White Varieties', 'White Blends'],
    dessert: ['Eiswein (Ice Wine)', 'Sauternes', 'Other Dessert Varieties', 'Dessert Blends']
  }

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

let clearErrors = () => {
  const errorIDS = ['nameError', 'yearError', 'yearPurchasedError']

  errorIDS.forEach(id => {
    document.getElementById(id).innerText = '';
  });
}

let submitForm = e => {
  e.preventDefault();

  // Grab the form values
  const name = document.getElementById('name').value;
  const category = document.getElementById('category').value;
  const type = document.getElementById('type').value;
  const year = document.getElementById('year').value;
  const winery = document.getElementById('winery').value;
  const yearPurchased = document.getElementById('year-purchased').value;
  const rating = document.getElementById('rating').value;
  
  let checkForErrors = () => {
    let errors = [];
    const regex = /^\d{4}$/;
    if (!regex.test(year)){
       errors.push({'yearError': 'Please input a year in the format ####'})
    }
    if (!regex.test(yearPurchased)) {
      errors.push({'yearPurchasedError': 'Please input a year in the format ####'})
    }
    if (!name) {
       errors.push({'nameError': 'Please input a name'});
    }
    return errors;
  }

  // Check for errors
  const errors = checkForErrors();

  // If there are no errors, proceed with form submission
  if (errors.length === 0) {
    const item = {
      name: name,
      category: category,
      type: type,
      year: year,
      winery: winery,
      yearPurchased: yearPurchased,
      rating: rating
    }
    ipcRenderer.send('item:add', item);
  } else {
    clearErrors()
    errors.forEach(error => {
      const key = Object.keys(error)[0];
      document.getElementById(key).innerText = error[key];
    });
  }
}

// Add event listeners
addItemForm.addEventListener('submit', submitForm);
categorySelect.addEventListener('change', populateType);

// jQuery plugin for some datepicker functionality
$(document).ready(function(){
  $('.yearpicker').yearpicker();
});
