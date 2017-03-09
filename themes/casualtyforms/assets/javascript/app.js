/*
 * Application
 */

/*
 * Auto hide navbar and other jQuery objects.
 */
jQuery(document).ready(function($) {
    var $header = $('.navbar-autohide'),
        scrolling = false,
        previousTop = 0,
        currentTop = 0,
        scrollDelta = 10,
        scrollOffset = 150;

    // Initialise tooltips.
    $(this).tooltip({
        selector: '[data-toggle="tooltip"]'
    });

    // Initialise datepicker.
    $('input[type="datepicker"]').datepicker({
        format: "yyyy-mm-dd"
    });

    // Initialise image zoom.
    $('.image-zoom').elevateZoom({
        zoomType: "inner",
        cursor: "crosshair",
        zoomWindowFadeIn: 200,
        zoomWindowFadeOut: 200,
        //scrollZoom : true
    });

    /*
     * Auto hide navbar and other jQuery objects.
     */
    $(window).on('scroll', function(){
        if (!scrolling) {
            scrolling = true

            if (!window.requestAnimationFrame) {
                setTimeout(autoHideHeader, 250)
            }
            else {
                requestAnimationFrame(autoHideHeader)
            }
        }
    })

    function autoHideHeader() {
        var currentTop = $(window).scrollTop()

        // Scrolling up
        if (previousTop - currentTop > scrollDelta) {
            $header.removeClass('is-hidden')
        }
        else if (currentTop - previousTop > scrollDelta && currentTop > scrollOffset) {
            // Scrolling down
            $header.addClass('is-hidden')
        }

        previousTop = currentTop
        scrolling = false
    }
});
