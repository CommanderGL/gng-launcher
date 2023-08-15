const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

let gWindow;

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    title: "GNG Launcher",
    width: 800,
    height: 600,
    minWidth: 700,
    minHeight: 450,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, './preload.js')
    },
    frame: false,
    icon: 'logo.png'
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  gWindow = mainWindow;
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

ipcMain.handle('minimize-window', () => {
  if (gWindow != null) gWindow.minimize();
});

ipcMain.handle('maximize-window', () => {
  if (gWindow != null) {
    if (gWindow.isMaximized()) {
      gWindow.unmaximize()
    } else {
      gWindow.maximize();
    }
  }
});

ipcMain.handle('close-window', () => {
  if (gWindow != null) gWindow.close();
});

ipcMain.handle('is-fullscreen', () => {
  if (gWindow != null) return gWindow.isFullScreen();
  return null;
});

ipcMain.handle('open-dir', async () => {
  const data = await dialog.showOpenDialog({
    properties: ['openDirectory']
  });

  if (data.canceled) return null;
  return data.filePaths;
})