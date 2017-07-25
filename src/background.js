// This is main process of Electron, started as first thing when your
// app starts. This script is running through entire life of your application.
// It doesn't have any windows which you can see on screen, but we can open
// window from here.

import { app, Menu, BrowserWindow } from 'electron';
import { devMenuTemplate } from './menu/dev_menu_template';
import { editMenuTemplate } from './menu/edit_menu_template';
import createWindow from './helpers/window';

const log = require('electron-log');
const {autoUpdater} = require("electron-updater");

// Special module holding environment variables which you declared
// in config/env_xxx.json file.
import env from './env';

// SET THE GITHUB PERSONAL AUTH TOKEN ENV VAR
env.GH_TOKEN = process.env.GH_TOKEN;

let mainWindow;

var setApplicationMenu = function () {
    var menus = [editMenuTemplate];
    if (env.name !== 'production') {
        menus.push(devMenuTemplate);
    }
    Menu.setApplicationMenu(Menu.buildFromTemplate(menus));
};

// Save userData in separate folders for each environment.
// Thanks to this you can use production and development versions of the app
// on same machine like those are two separate apps.
var userDataPath = app.getPath('userData');
if (env.name !== 'production') {
    app.setPath('userData', userDataPath + ' (' + env.name + ')');
}

// (MAC ONLY) SET EVENT LISTENER IF OPENING FROM FILE AND SET FILE PATH
var myOpenFile = null;
app.on('open-file', function(ev, path) {
    myOpenFile = path;
});

// (WINDOWS ONLY) SET FILE PATH IF OPENING FROM A FILE
if (process.platform == 'win32' && process.argv.length >= 2) {
    var myArgv = process.argv[1];
    var filename = myArgv.replace(/^.*[\\\/]/, '');
    filename = filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);

    if(filename == 'usbank') {
        myOpenFile = myArgv;
    }
}

const {ipcMain} = require('electron'); // MODULE ALLOWS MESSAGING FROM MAIN TO RENDERER
// read the file and send data to the render process
ipcMain.on('get-file-data', function(event) {
    event.returnValue = myOpenFile;
});

ipcMain.on('get-user-data-path', function(event) {
    event.returnValue = userDataPath;
});

/*** AUTO UPDATE ***/
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

function sendStatusToWindow(text) {
    log.info(text);
    mainWindow.webContents.send('updateStatus', text);
}

autoUpdater.on('checking-for-update', () => {
    sendStatusToWindow('Checking for update...');
})
autoUpdater.on('update-available', (ev, info) => {
    sendStatusToWindow('Update available.');
})
autoUpdater.on('update-not-available', (ev, info) => {
    sendStatusToWindow('Update not available.');

    setTimeout(function() {
        sendStatusToWindow('V' + app.getVersion());
    },500);
})
autoUpdater.on('error', (ev, err) => {
    sendStatusToWindow('Error in auto-updater.' + err);
})
autoUpdater.on('download-progress', (progressObj) => {
    let log_message = "Download speed: " + progressObj.bytesPerSecond;
    log_message = 'Downloaded ' + Math.round(progressObj.percent) + '%';
    //log_message = log_message + ' (' + Math.round(progressObj.transferred) + "/" + progressObj.total + ')';
    sendStatusToWindow(log_message);
})
autoUpdater.on('update-downloaded', (event, releaseName) => {
    sendStatusToWindow('<span id="update-app">Install Update</span>');
});

//-------------------------------------------------------------------
// Auto updates
//
// For details about these events, see the Wiki:
// https://github.com/electron-userland/electron-builder/wiki/Auto-Update#events
//
// The app doesn't need to listen to any events except `update-downloaded`
//
// Uncomment any of the below events to listen for them.  Also,
// look in the previous section to see them being used.
//-------------------------------------------------------------------
// autoUpdater.on('checking-for-update', () => {
// })
// autoUpdater.on('update-available', (ev, info) => {
// })
// autoUpdater.on('update-not-available', (ev, info) => {
// })
// autoUpdater.on('error', (ev, err) => {
// })
// autoUpdater.on('download-progress', (ev, progressObj) => {
// })

ipcMain.on('update-apply', function (event) {
    autoUpdater.quitAndInstall();
});

app.on('window-all-closed', function () {
    app.quit();
});

app.on('ready', function () {
    setApplicationMenu();

    mainWindow = createWindow('main', {
        width: 1024,
        minWidth: 1024,
        minHeight: 600,
        height: 600,
        frame: false,
        show: false
    });

    mainWindow.loadURL('file://' + __dirname + '/app.html');

    // WAIT FOR WINDOW TO LOAD BEFORE SHOWING THE WINDOW
    mainWindow.webContents.on('did-finish-load', function() {
        mainWindow.show();

        mainWindow.webContents.send('updateStatus', 'V' + app.getVersion());

        if (env.name === 'development') {
            mainWindow.openDevTools();
        }

        if (env.name !== 'development') {
            autoUpdater.checkForUpdates();
        }
    });
});
