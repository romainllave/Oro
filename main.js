const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');

// Configuration du logger pour l'auto-updater
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();

  // Vérifier les mises à jour
  autoUpdater.checkForUpdatesAndNotify();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// --- Événements de l'auto-updater ---

autoUpdater.on('checking-for-update', () => {
  log.info('Vérification des mises à jour...');
});

autoUpdater.on('update-available', (info) => {
  log.info('Mise à jour disponible.');
});

autoUpdater.on('update-not-available', (info) => {
  log.info('Aucune mise à jour disponible.');
});

autoUpdater.on('error', (err) => {
  log.error('Erreur lors de la mise à jour: ' + err);
});

autoUpdater.on('download-progress', (progressObj) => {
  let log_message = "Vitesse de téléchargement: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - Téléchargé ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  log.info(log_message);
});

autoUpdater.on('update-downloaded', (info) => {
  log.info('Mise à jour téléchargée');
  // Demander à l'utilisateur s'il veut installer maintenant
  const dialogOpts = {
    type: 'info',
    buttons: ['Redémarrer', 'Plus tard'],
    title: 'Mise à jour de l\'application',
    message: process.platform === 'win32' ? info.releaseNotes : info.releaseName,
    detail: 'Une nouvelle version a été téléchargée. Redémarrez l\'application pour appliquer les mises à jour.'
  };

  dialog.showMessageBox(dialogOpts).then((returnValue) => {
    if (returnValue.response === 0) {
      autoUpdater.quitAndInstall();
    }
  });
});
