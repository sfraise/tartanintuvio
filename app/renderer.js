// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const remote = require('electron').remote;
const dialog = remote.dialog;
const fs = require('fs');
const path = require('path');
const {shell, ipcRenderer} = require('electron');
var electron = require('electron');
var app = electron.remote.app;

/*** SHOW AUTO-UPDATE STATUS ***/
ipcRenderer.on('updateStatus', function(event, text) {
    console.log(text);
    $('#current-version').html(text);
});

/*** LOAD THE HOME VIEW ***/
$( "#home_view" ).load( "./views/sections/home_view.html" );

$(document).ready(function () {
    /*** NAVIGATION ***/
    showHideView();

    function showHideView(prevId) {
        var prevView = $("#" + prevId).data("view");
        var newId = $(".active_tab").data("view");
        $("#" + prevView).hide();
        $("#" + newId).show();
    }

    $(".tab_text").on('click', function () {
        var newId = $(this).attr("id");
        var currentId = $(".active_tab").attr("id");
        if (newId != currentId) {
            $("#" + currentId).removeClass("active_tab");
            $("#" + newId).addClass("active_tab");
            showHideView(currentId);
        }
    });

    /*** OPEN LINKS EXTERNALLY IN DEFAULT APP OR BROWSER ***/
    $(document).on('click', '.external', function(e) {
        e.preventDefault();
        var href = $(this).attr('href');
        var fileName = href.split("/").pop();

        if(/^(f|ht)tps?:\/\//i.test(href)) {
            // IF HREF STARTS WITH HTTP JUST USE HREF
            shell.openExternal(href);
        } else {
            // IF HREF DOESN'T START WITH HTTP COPY FILE TO TEMP DIRECTORY THEN OPEN (NEEDED TO GET AROUND ASAR ENCODING)
            let file = path.join(__dirname + href);

            let filetmp = path.join(app.getPath('temp'),fileName);
            let ws = fs.createWriteStream(filetmp);

            fs.createReadStream(file).pipe(ws);

            ws.on('finish', () => {
                shell.openItem(filetmp);
            });
        }
    });

    /*** UPDATE APP ***/
    $(document).on('click', '#update-app', function() {
        ipcRenderer.send('update-apply');
    });
});