/**
 * Created by Mike Sather on 6/8/2017.
 */

$(document).ready(function() {

    // CLICK EVENTS
    $(document).on('click', '.demo-wrapper', function() {

    });

    $(document).on({
        mouseenter: function () {
            var data = $(this).children('a').data('rollover');

            $(this).css({
                border: '1px solid #00B7AD'
            });
            $(this).children('a').children('img').attr('src', './images/pics/' + data + '-rollover.png');
        },
        mouseleave: function () {
            var data = $(this).children('a').data('rollover');

            $(this).css({
               border: 'none'
            });
            $(this).children('a').children('img').attr('src', './images/pics/' + data + '-resting.png');
        }
    }, ".demo-wrapper");


    // PAGINATION
    // TO DO
});