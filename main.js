const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const url = require('url');
require('electron-reload')(__dirname); // Live reload

let mainWindow;
let addWindow;

// Main application window
let createWindow = () => {
	mainWindow = new BrowserWindow({
	  width: 1200,
		height: 800,
		minWidth: 600,
		minHeight: 800,
		icon: 'assets/images/wine-bottle-icon.ico',
	  webPreferences: {
		nodeIntegration: true
		}
	});

	mainWindow.maximize();
	mainWindow.loadURL(url.format({
		pathname: path.join(__dirname, 'src/index.html'),
		protocol: 'file',
		slashes: true
	}));

	// mainWindow.webContents.openDevTools();
  
	mainWindow.on('closed', () => app.quit());
  
	ipcMain.on('item:add', (e, item) => {
	  mainWindow.webContents.send('item:add', item);
	  addWindow.close();
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
				label: 'Clear Wishlist',
				click() { clearWindow() }
			},
			{ type: 'separator' },
			{
				label: 'Quit',
				accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
				click() { app.quit() }
			},
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

	addWindow.on('close', function() {
		addWindow = null;
	});

	// addWindow.webContents.openDevTools();
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
