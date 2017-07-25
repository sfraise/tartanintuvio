/**
 * Created by Spencer on 8/14/2016.
 */

var remote = require('electron').remote;
var dialog = remote.dialog;
var fs = require('fs');
const BrowserWindow = require('electron').remote.BrowserWindow;

$(document).ready(function() {
    maximizeWindow();

    /*** WINDOW BUTTONS ***/
    $('#minimize-window').click(function () {
        minimizeWindow();
    });

    $('#maximize-window').click(function () {
        maximizeWindow();
    });

    $('.close-window').click(function () {
        /*
         // ASK IF YOU WANT TO SAVE
         $('#messages').views('<div class="save-before-close"><div class="save-before-close-top">Do you want to save?</div><div class="save-before-close-bottom"><div id="save-before-close-button-yes" class="save-before-close-button">Yes</div><div id="save-before-close-button-no" class="save-before-close-button">No</div></div></div></div>').fadeIn();
         */
        closeWindow();
    });

    // SET MAXIMIZE BUTTON
    $(window).on('resize', function () {
        if(BrowserWindow.getFocusedWindow()) {
            var isMaximized = BrowserWindow.getFocusedWindow().isMaximized();

            if (isMaximized == true) {
                $('#window-max-col').attr('src', './images/collapse.png');
            } else {
                $('#window-max-col').attr('src', './images/maximize.png');
            }
        }
    });

});

function minimizeWindow() {
    var window = remote.getCurrentWindow();
    window.minimize();
}

function maximizeWindow() {
    var window = remote.getCurrentWindow();
    if (!window.isMaximized()) {
        window.maximize();
    } else {
        window.unmaximize();
    }
}

function closeWindow() {
    var window = remote.getCurrentWindow();
    window.close();
}

function scrollTo(scrollEle, scrollOffset, scrollSpeed) {
    scrollEle.animate({
        scrollLeft: scrollOffset
    }, scrollSpeed);
}