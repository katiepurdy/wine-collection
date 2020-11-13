const { app, BrowserWindow, Menu, ipcMain, ipcRenderer } = require('electron');
const Settings = require('./settings.js');
const path = require('path');
const url = require('url');
const knex = require('knex')({
	client: 'sqlite3',
	connection: {
		filename: './src/wine.db'
	},
	useNullAsDefault: true
});

let mainWindow;
let addWindow;
let editWindow;

const settings = new Settings({
	configName: 'user-preferences',
	defaults: {
		theme: {
			name: 'default'
		}
	}
});

let changeTheme = themeName => {
	// Apply theme to all browser windows
	let browserWindows = BrowserWindow.getAllWindows();
	browserWindows.forEach(window => {
		window.webContents.send('applyTheme', themeName);
	});
	// Save to user preferences
	settings.set('theme', { name: themeName });
}

// Get the wines from the database and send them to the main window
let readDB = () => {
	clearWindow();
	let result = knex.select('*').from('wines_table');
	result.then((wines) => { 
		mainWindow.webContents.send('item:add', wines);
	});
}

// Main application window
let createWindow = () => {
	mainWindow = new BrowserWindow({
	  width: 1200,
		height: 800,
		minWidth: 600,
		minHeight: 800,
		icon: 'assets/images/wine-bottle-icon.ico',
	  webPreferences: {
			nodeIntegration: true,
			enableRemoteModule: true
		}
	});

	mainWindow.maximize();
	mainWindow.loadURL(url.format({
		pathname: path.join(__dirname, 'src/index.html'),
		protocol: 'file',
		slashes: true
	}));
	
	mainWindow.webContents.on('did-finish-load', () => {
		// Get theme name from the user preferences
		let currentTheme = settings.get('theme');
		changeTheme(currentTheme.name);
		readDB()
	});

	mainWindow.on('closed', () => app.quit());
	
	// Add
	ipcMain.on('item:add', (e, item) => {
		knex('wines_table')
			.insert(item)
			.catch(err => console.log(err))
			.then(() => readDB());
	  addWindow.close();
	});

	// Edit
	ipcMain.on('editButtonClicked', (e, id) => {
		createEditWindow(id);
	});

	// Edit Submit
	ipcMain.on('item:edit', (e, id, item) => {
		knex('wines_table')
			.where({ 'id': id })
			.update(item)
			.catch(err => console.log(err))
			.then(() => readDB());
		editWindow.close();
	});

	// Delete
	ipcMain.on('item:delete', (e, id) => {
		knex('wines_table')
			.where({ 'id': id })
			.del()
			.catch(err => console.log(err));
	});

	let menu = Menu.buildFromTemplate(mainMenuTemplate);
	Menu.setApplicationMenu(menu);
}

// Clear main window
let clearWindow = () => {
	mainWindow.webContents.send('item:clear');
}

// Set up menu items
const mainMenuTemplate = [
	{
		label: 'File',
		submenu: [
			{
				label: 'Add a Wine',
				click() { createAddWindow() }
			},
			{
				label: 'Read DB',
				click() { readDB() }
			},
			// {
			// 	label: 'Clear Wishlist',
			// 	click() { clearWindow() }
			// },
			{ type: 'separator' },
			{
				label: 'Quit',
				accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
				click() { app.quit() }
			},
		]
	},
	{
		label: 'Themes',
		submenu: [
			{
				label: 'Default',
				click() { changeTheme('default')}
			},
			{
				label: 'Dark',
				click() { changeTheme('dark')}
			},
			{
				label: 'Bright',
				click() { changeTheme('bright')}
			}
		]
	},
	{
		label: 'Dev Tools',
		submenu: [
			{
				label: 'Toggle Dev Tools',
				accelerator: 'CmdorCtrl+J',
				click(item, focusedWindow) { focusedWindow.toggleDevTools() }
			},
			{
				role: 'reload'
			}
		]
	}
];

// Add an item window
let createAddWindow = () => {
	addWindow = new BrowserWindow({
		width: 650,
		height: 850,
		minWidth: 650,
		minHeight: 850,
		alwaysOnTop: true,
		icon: 'assets/images/wine-bottle-icon.ico',
		webPreferences: {
				nodeIntegration: true
		}
	});

	addWindow.loadURL(url.format({
		pathname: path.join(__dirname, 'src/add.html'),
		protocol: 'file',
		slashes: true
	}));

	addWindow.setMenuBarVisibility(false);

	addWindow.on('close', function() {
		addWindow = null;
	});

	addWindow.webContents.on('did-finish-load', () => {
		// Get theme name from the user preferences
		let currentTheme = settings.get('theme');
		changeTheme(currentTheme.name);
	});
}

// Edit an item window
let createEditWindow = (id) => {
	editWindow = new BrowserWindow({
		width: 650,
		height: 850,
		minWidth: 650,
		minHeight: 850,
		alwaysOnTop: true,
		icon: 'assets/images/wine-bottle-icon.ico',
		webPreferences: {
				nodeIntegration: true
		}
	});

	editWindow.loadURL(url.format({
		pathname: path.join(__dirname, 'src/edit.html'),
		protocol: 'file',
		slashes: true
	}));

	let data = knex('wines_table')
		.where({ id: id })
		.catch(err => console.log(err));
	data.then((wines) => {
		editWindow.webContents.on('did-finish-load', () => {
			editWindow.webContents.send('editData', wines[0]);
		});
	});

	editWindow.setMenuBarVisibility(false);

	editWindow.webContents.on('did-finish-load', () => {
		// Get theme name from the user preferences
		let currentTheme = settings.get('theme');
		changeTheme(currentTheme.name);
	});

	editWindow.on('close', function() {
		editWindow = null;
	});
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
