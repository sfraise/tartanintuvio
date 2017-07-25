/**
 * Created by mikex on 6/9/2017.
 */
$(document).ready(function() {

    // MENU FUNCTIONALITY
    $(document).on('click', '.menu-button', function() {
        var staticMenu = $('.static-menu');
        var settingsMenu = $('.settings-menu');

        if (staticMenu.is(':visible')) {
            staticMenu.fadeOut();
            settingsMenu.hide();
            $(this).removeClass('active-menu-button');
        } else {
            staticMenu.fadeIn();
            $(this).addClass('active-menu-button');
        }
    });

    $(document).on({
        mouseenter: function () {
            $(this).addClass('active-menu-button');
        },
        mouseleave: function () {
            if (!$('.static-menu').is(':visible')) {
                $(this).removeClass('active-menu-button');
            }
        }
    }, ".menu-button");

    $(document).on('click', '.view-inner', function() {
        if ($('.static-menu').is(":visible")) {
            $('.menu-button').trigger('click');
        }
    });

    $(document).on('click', '.static-menu', function(event) {
        event.stopPropagation();
    });

    $(document).on('click', '#settings-button', function() {
        var settingsMenu = $('.settings-menu');

        if (settingsMenu.is(':visible')) {
            settingsMenu.fadeOut();
            $(this).removeClass('active-menu-item');
        } else {
            settingsMenu.fadeIn();
            $(this).addClass('active-menu-item');
        }
    });

    // VIEW TRANSITIONS
    $(document).on('click', '.switch-view', function() {
        // Variable Declarations
        var data = $(this).attr('data');
        var sectionToOpen = $('#' + data);
        var sections = $('.view-container');

        if (!sectionToOpen.is(':visible')) {
            sections.html('');
            sections.hide();
            sectionToOpen.load('./views/sections/' + data + '.html');
            sectionToOpen.fadeIn();
            $('#settings-button').removeClass('active-menu-item');
            $('.menu-button').trigger('click');
        }
    });
});