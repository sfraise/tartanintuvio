/**
 * Created by Mike Sather on 6/8/2017.
 */

$(document).ready(function() {

    // CLICK EVENTS
    $(document).on('click', '.tour-tab-link', function() {
        var data = $(this).attr('data');
        var sectionToOpen = $("#" + data);
        var sectionSiblings = sectionToOpen.siblings('.tour-tab');
        var tabLinks = $(this).siblings('.tour-tab-link');

        if (!sectionToOpen.is(':visible')) {
            sectionSiblings.hide();
            sectionToOpen.fadeIn(400);

            if ($(this).parent().hasClass('settings-tour-tab-menu')) {
                $('.tab-link-bottom-border').hide();
                $(this).children('.tab-link-bottom-border').fadeIn();
                tabLinks.removeClass('active-setting');
                $(this).addClass('active-setting');
            } else {
                tabLinks.removeClass('active-tab');
                $(this).addClass('active-tab');
            }
        }
    });

});