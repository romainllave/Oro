const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');

// Configuration du logger pour l'auto-updater
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

let mainWindow;

function sendStatusToWindow(text) {
  log.info(text);
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('message', text);
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  
  // Supprime complètement le menu (File, Edit, etc.)
  mainWindow.setMenu(null);

  mainWindow.loadFile('index.html');
  
  // Attendre que la fenêtre soit prête pour vérifier les MAJ
  mainWindow.webContents.once('did-finish-load', () => {
    sendStatusToWindow('Application prête (v' + app.getVersion() + ')');
    sendStatusToWindow('Démarrage du système de mise à jour...');
    autoUpdater.checkForUpdatesAndNotify();
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// --- Événements de l'auto-updater ---

autoUpdater.on('checking-for-update', () => {
  sendStatusToWindow('Vérification des mises à jour en cours sur GitHub...');
});

autoUpdater.on('update-available', (info) => {
  sendStatusToWindow('Une mise à jour (' + info.version + ') est disponible !');
});

autoUpdater.on('update-not-available', (info) => {
  const versionInfo = info ? info.version : 'inconnue';
  sendStatusToWindow('Aucune mise à jour disponible (version sur le serveur : ' + versionInfo + ').');
});

autoUpdater.on('error', (err) => {
  sendStatusToWindow('Erreur lors de la mise à jour : ' + err.toString());
});

autoUpdater.on('download-progress', (progressObj) => {
  let log_message = "Vitesse: " + Math.round(progressObj.bytesPerSecond / 1024) + " KB/s";
  log_message += ' - Téléchargé: ' + Math.round(progressObj.percent) + '%';
  sendStatusToWindow(log_message);
});

autoUpdater.on('update-downloaded', (info) => {
  sendStatusToWindow('Mise à jour téléchargée. En attente de redémarrage.');
  const dialogOpts = {
    type: 'info',
    buttons: ['Redémarrer maintenant', 'Plus tard'],
    title: 'Mise à jour prête',
    message: 'Version ' + info.version,
    detail: 'Une nouvelle version a été téléchargée. Redémarrez l\'application pour l\'appliquer.'
  };

  dialog.showMessageBox(dialogOpts).then((returnValue) => {
    if (returnValue.response === 0) {
      autoUpdater.quitAndInstall();
    }
  });
});
