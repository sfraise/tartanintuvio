/**
 * Created by mikex on 6/20/2017.
 */

$(document).ready(function() {

    $(document).on('click', '.open-modal', function() {
        var data = $(this).attr('data');
        var modal = $('.modal-wrapper');
        var existingModal = modal.attr('data');
        if(existingModal !== data) {
            // IF NOT TRYING TO OPEN THE SAME MODAL CONTINUE
            if(modal.is(':visible')) {
                modal = $('.secondary-modal-wrapper');
            }
            var content = modal.find('.modal-content');
            var modalInner = modal.find('.modal-inner-wrapper');
            var modalDimensions = $(this).data('modal');
            var settingsLink = $('#lower-settings-link');

            modal.fadeIn();

            content.html("");
            content.load('./views/modal-content/' + data + '.html');
            modal.attr('data', data);
        }
    });

    $(document).on('click', '.modal-wrapper', function() {
        $('.close-modal').trigger('click');
    });

    $(document).on('click', '.modal-inner-wrapper', function(event) {
        event.stopPropagation();
    });

    $(document).on('click', '.close-modal', function() {
        var modal = $(this).parent().parent();
        var content = modal.find('.modal-content');
        var modalInner = modal.find('.modal-inner-wrapper');

        // Close modal
        modal.fadeOut().promise().done(function() {
            content.html("");

        });

        modal.attr('data', '');
    });

});