const { ipcRenderer } = require('electron');

const wishlist = document.getElementById('wishlist');

let clearList = () => {
	wishlist.innerHTML = '';
}

let removeItem = e => {
	const listItem = e.target.parentNode.parentNode;
	wishlist.removeChild(listItem);
}

ipcRenderer.on('item:add', (e, item) => {
	// Build the new list item
	const wishlistItemLi = document.createElement('li');
	wishlistItemLi.classList.add('wishlist-item');

	// Category
	const categoryDiv = document.createElement('div');
	categoryDiv.classList.add('category');
	const categoryP = document.createElement('p');
	categoryP.classList.add('category-name');
	const categoryText = document.createTextNode(item.category);

	// Include the category as a class name for color coding
	categoryDiv.classList.add(`${item.category.toLowerCase()}`);
	categoryP.appendChild(categoryText);
	categoryDiv.appendChild(categoryP);

	// Include a button to remove the item from the list
	const removeButton = document.createElement('button');
	removeButton.innerHTML = '&times;';
	removeButton.classList.add('remove-item');
	removeButton.addEventListener('click', removeItem);
	categoryDiv.appendChild(removeButton);

	// Item details
	const itemDetailsDiv = document.createElement('div');
	itemDetailsDiv.classList.add('item-details');
	const nameP = document.createElement('p');
	nameP.classList.add('name');
	const nameText = document.createTextNode(`Name: ${item.name}`);
	nameP.appendChild(nameText);
	const yearP = document.createElement('p');
	yearP.classList.add('year');
	const yearText = document.createTextNode(`Year: ${item.year}`);
	yearP.appendChild(yearText);
	const ratingDisplayP = document.createElement('p');
	const ratingStarsSpan = document.createElement('span');
	ratingStarsSpan.classList.add('rating-stars');
	ratingDisplayP.innerHTML = 'Rating: ';

	// Add star icons for the rating
	for (let i = 0; i < parseInt(item.rating); i++) {
		ratingStarsSpan.innerHTML += `<i class="fas fa-star"></i>`;
	}
	ratingDisplayP.appendChild(ratingStarsSpan);

	// Continue item details
	ratingDisplayP.classList.add('rating-display');
	const wineryP = document.createElement('p');
	const wineryText = document.createTextNode(`Winery: ${item.winery}`);
	wineryP.appendChild(wineryText);
	wineryP.classList.add('winery');
	const typeP = document.createElement('p');
	const typeText = document.createTextNode(`Type: ${item.type}`);
	typeP.appendChild(typeText);
	typeP.classList.add('type');
	const yearPurchasedP = document.createElement('p');
	const yearPurchasedText = document.createTextNode(`Year Puchased: ${item.yearPurchased}`);
	yearPurchasedP.classList.add('year-purchased')
	yearPurchasedP.appendChild(yearPurchasedText);

	// Put it all together
	itemDetailsDiv.appendChild(nameP);
	itemDetailsDiv.appendChild(yearP);
	itemDetailsDiv.appendChild(ratingDisplayP);
	itemDetailsDiv.appendChild(wineryP);
	itemDetailsDiv.appendChild(typeP);
	itemDetailsDiv.appendChild(yearPurchasedP);
	wishlistItemLi.appendChild(categoryDiv);
	wishlistItemLi.appendChild(itemDetailsDiv);
	
	// Append the newly built item to the list
	wishlist.appendChild(wishlistItemLi);
});

// Clear the list through the menu or a clear list button
ipcRenderer.on('item:clear', clearList);

// Bind event handler to each remove button
document.querySelectorAll('.remove-item').forEach(item => {
  item.addEventListener('click', removeItem)
});
