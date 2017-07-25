(function () {'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var electron = require('electron');
var jetpack = _interopDefault(require('fs-jetpack'));

var devMenuTemplate = {
    label: 'Development',
    submenu: [{
        label: 'Reload',
        accelerator: 'CmdOrCtrl+R',
        click: function () {
            electron.BrowserWindow.getFocusedWindow().webContents.reloadIgnoringCache();
        }
    },{
        label: 'Toggle DevTools',
        accelerator: 'Alt+CmdOrCtrl+I',
        click: function () {
            electron.BrowserWindow.getFocusedWindow().toggleDevTools();
        }
    },{
        label: 'Quit',
        accelerator: 'CmdOrCtrl+Q',
        click: function () {
            electron.app.quit();
        }
    }]
};

var editMenuTemplate = {
    label: 'Edit',
    submenu: [
        { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
        { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
        { type: "separator" },
        { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
        { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
        { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
        { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
    ]
};

// This helper remembers the size and position of your windows (and restores
// them in that place after app relaunch).
// Can be used for more than one window, just construct many
// instances of it and give each different name.

function createWindow (name, options) {

    var userDataDir = jetpack.cwd(electron.app.getPath('userData'));
    var stateStoreFile = 'window-state-' + name +'.json';
    var defaultSize = {
        width: options.width,
        height: options.height
    };
    var state = {};
    var win;

    var restore = function () {
        var restoredState = {};
        try {
            restoredState = userDataDir.read(stateStoreFile, 'json');
        } catch (err) {
            // For some reason json can't be read (might be corrupted).
            // No worries, we have defaults.
        }
        return Object.assign({}, defaultSize, restoredState);
    };

    var getCurrentPosition = function () {
        var position = win.getPosition();
        var size = win.getSize();
        return {
            x: position[0],
            y: position[1],
            width: size[0],
            height: size[1]
        };
    };

    var windowWithinBounds = function (windowState, bounds) {
        return windowState.x >= bounds.x &&
            windowState.y >= bounds.y &&
            windowState.x + windowState.width <= bounds.x + bounds.width &&
            windowState.y + windowState.height <= bounds.y + bounds.height;
    };

    var resetToDefaults = function (windowState) {
        var bounds = electron.screen.getPrimaryDisplay().bounds;
        return Object.assign({}, defaultSize, {
            x: (bounds.width - defaultSize.width) / 2,
            y: (bounds.height - defaultSize.height) / 2
        });
    };

    var ensureVisibleOnSomeDisplay = function (windowState) {
        var visible = electron.screen.getAllDisplays().some(function (display) {
            return windowWithinBounds(windowState, display.bounds);
        });
        if (!visible) {
            // Window is partially or fully not visible now.
            // Reset it to safe defaults.
            return resetToDefaults(windowState);
        }
        return windowState;
    };

    var saveState = function () {
        if (!win.isMinimized() && !win.isMaximized()) {
            Object.assign(state, getCurrentPosition());
        }
        userDataDir.write(stateStoreFile, state, { atomic: true });
    };

    state = ensureVisibleOnSomeDisplay(restore());

    win = new electron.BrowserWindow(Object.assign({}, options, state));

    win.on('close', saveState);

    return win;
}

// Simple wrapper exposing environment variables to rest of the code.

// The variables have been written to `env.json` by the build process.
var env = jetpack.cwd(__dirname).read('env.json', 'json');

// This is main process of Electron, started as first thing when your
// app starts. This script is running through entire life of your application.
// It doesn't have any windows which you can see on screen, but we can open
// window from here.

const log = require('electron-log');
const {autoUpdater} = require("electron-updater");

// Special module holding environment variables which you declared
// in config/env_xxx.json file.
// SET THE GITHUB PERSONAL AUTH TOKEN ENV VAR
env.GH_TOKEN = process.env.GH_TOKEN;

let mainWindow;

var setApplicationMenu = function () {
    var menus = [editMenuTemplate];
    if (env.name !== 'production') {
        menus.push(devMenuTemplate);
    }
    electron.Menu.setApplicationMenu(electron.Menu.buildFromTemplate(menus));
};

// Save userData in separate folders for each environment.
// Thanks to this you can use production and development versions of the app
// on same machine like those are two separate apps.
var userDataPath = electron.app.getPath('userData');
if (env.name !== 'production') {
    electron.app.setPath('userData', userDataPath + ' (' + env.name + ')');
}

// (MAC ONLY) SET EVENT LISTENER IF OPENING FROM FILE AND SET FILE PATH
var myOpenFile = null;
electron.app.on('open-file', function(ev, path) {
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
        sendStatusToWindow('V' + electron.app.getVersion());
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

electron.app.on('window-all-closed', function () {
    electron.app.quit();
});

electron.app.on('ready', function () {
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

        mainWindow.webContents.send('updateStatus', 'V' + electron.app.getVersion());

        if (env.name === 'development') {
            mainWindow.openDevTools();
        }

        if (env.name !== 'development') {
            autoUpdater.checkForUpdates();
        }
    });
});
}());
//# sourceMappingURL=background.js.map