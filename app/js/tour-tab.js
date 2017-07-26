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

            $('.quote-inner').hide();
            $('.quote-bubble').removeClass('active-quote');

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

    $(document).on('click', '.quote-bubble', function() {
        var quoteContainer = $(this).siblings('.quote-inner');

        if (!quoteContainer.is(":visible")) {
            quoteContainer.fadeIn();
            $(this).addClass('active-quote');
        } else {
            quoteContainer.fadeOut();
            $(this).removeClass('active-quote');
        }
    });

    $(document).on({
        mouseenter: function () {
            $(this).addClass('active-quote');
        },
        mouseleave: function () {
            var quoteContainer = $(this).siblings('.quote-container');
            if (!$('.quote-container').is(':visible')) {
                $(this).removeClass('active-quote');
            }
        }
    }, ".quote-bubble");
});