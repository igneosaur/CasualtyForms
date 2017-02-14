/**
 * TranscriptionForm.js
 * All the scripts for the transcription form component.
 */
jQuery(document).ready(function($) {
    // Initialise the bootstrap components.
    $('input[type="datepicker"]').datepicker({ format: "yyyy-mm-dd" });

    // This one needs to be done when all images are loaded.
    window.onload = function() {
        // Instantiate the image zooms.
        $('.image-zoom').imagezoom();
    }
});

/**
 * ToggleIllegible
 * Module for the toggling of illegible fields.
 */
var ToggleIllegible = (function(exports) {
    'use strict';

    /* Vars. */
    var TOGGLE_ILLEGIBLE_CLASS = '.toggle-illegible',
        ILLEGIBLE_CHAR = { text: '?', datepicker: '0001-01-01' },
        INPUT_GROUP_CLASS = '.input-group',
        FORM_CONTROL_CLASS = '.form-control';

    /**
     * Function to action the user logout.
     */
    function toggleIllegibleClick(event) {
        var $this = $(this),
            $input = $this.parents(INPUT_GROUP_CLASS).find(FORM_CONTROL_CLASS);

        $this.toggleClass('marked');
        $this.find('span').toggleClass('hidden');

        // Change the input.
        if( $this.hasClass('marked') ) {
            $input.val(ILLEGIBLE_CHAR[$input.attr('type')]).prop('readonly', true);
        } else {
            $input.val('').prop('readonly', false);
        }

        event.preventDefault();
    }

    /**
     * Event handler for mousemove to detect inactivity.
     */
    jQuery(document).ready(function($) {
        var $illegibleToggles = $(TOGGLE_ILLEGIBLE_CLASS);

        if( $illegibleToggles.length > 0 ) {
            // If we have some toggles on the page add the event listeners.
            $illegibleToggles.each(function(index) {
                $(this).click(toggleIllegibleClick);
            });
        }
    });

    return exports;
}(ToggleIllegible || {}));

/**
 * ImageZoom
 * Module for the form image zoom and pan.
 */
$.fn.imagezoom = function() {
    /* Vars. */
    var formImg = new Image,
        scaleFactor = 1.1,
        dragStart, dragged;

    /**
     * Constructor.
     */
    function ImageZoom(canvas) {
        var ctx = canvas.getContext('2d'),
            lastX = canvas.width / 2,
            lastY = canvas.height / 2;

        // Assign the width and height.
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        // Get the image source.
        formImg.src = canvas.firstElementChild.src;

        // Track the movement.
        trackTransforms(ctx);

        // Redraw canvas.
        redraw(ctx, canvas);

        canvas.addEventListener('mousedown',function(evt) {
            document.body.style.mozUserSelect = document.body.style.webkitUserSelect = document.body.style.userSelect = 'none';
            lastX = evt.offsetX || (evt.pageX - canvas.offsetLeft);
            lastY = evt.offsetY || (evt.pageY - canvas.offsetTop);

            dragStart = ctx.transformedPoint(lastX,lastY);

            dragged = false;
        },false);

        canvas.addEventListener('mousemove',function(evt) {
            lastX = evt.offsetX || (evt.pageX - canvas.offsetLeft);
            lastY = evt.offsetY || (evt.pageY - canvas.offsetTop);
            dragged = true;

            if (dragStart) {
                var pt = ctx.transformedPoint(lastX,lastY);
                ctx.translate(pt.x-dragStart.x,pt.y-dragStart.y);
                redraw(ctx, canvas);
            }
        },false);

        canvas.addEventListener('mouseup',function(evt) {
            dragStart = null;
            if (!dragged) zoom(evt.shiftKey ? -1 : 1 );
        },false);

        function zoom(clicks) {
            // Get this to see how zoomed we are.
            var transform = ctx.getTransform();

            // Check if the image is zoomed out too much.
            if (transform.a >= 1 || clicks > 0) {
                // Do the translation.
                var pt = ctx.transformedPoint(lastX,lastY);
                var factor = Math.pow(scaleFactor,clicks);
                ctx.translate(pt.x, pt.y);
                ctx.scale(factor,factor);
                ctx.translate(-pt.x, -pt.y);
            }

            redraw(ctx, canvas);
        }

        function handleScroll(evt) {
            var delta = evt.wheelDelta ? evt.wheelDelta/40 : evt.detail ? -evt.detail : 0;
            if (delta) zoom(delta);
            return evt.preventDefault() && false;
        }

        canvas.addEventListener('DOMMouseScroll', handleScroll, false);
        canvas.addEventListener('mousewheel', handleScroll, false);
    }

    /**
     * Redraw the canvas.
     */
    function redraw(ctx, canvas) {
        // Clear the entire canvas
        var p1 = ctx.transformedPoint(0, 0);
        var p2 = ctx.transformedPoint(canvas.width, canvas.height);
        ctx.clearRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);

        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.restore();

        ctx.drawImage(formImg, 0, 0, canvas.width, canvas.width * formImg.height / formImg.width);
    }

    /**
     * Adds ctx.getTransform() - returns an SVGMatrix
     * Adds ctx.transformedPoint(x,y) - returns an SVGPoint
     */
    function trackTransforms(ctx) {
        var svg = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
        var xform = svg.createSVGMatrix();
        ctx.getTransform = function(){ return xform; };

        var savedTransforms = [];
        var save = ctx.save;
        ctx.save = function() {
            savedTransforms.push(xform.translate(0, 0));
            return save.call(ctx);
        };

        var restore = ctx.restore;
        ctx.restore = function() {
            xform = savedTransforms.pop();
            return restore.call(ctx);
        };

        var scale = ctx.scale;
        ctx.scale = function(sx, sy) {
            xform = xform.scaleNonUniform(sx, sy);
            return scale.call(ctx, sx, sy);
        };

        var rotate = ctx.rotate;
        ctx.rotate = function(radians) {
            xform = xform.rotate(radians * 180 / Math.PI);
            return rotate.call(ctx, radians);
        };

        var translate = ctx.translate;
        ctx.translate = function(dx, dy) {
            xform = xform.translate(dx, dy);
            return translate.call(ctx, dx, dy);
        };

        var transform = ctx.transform;
        ctx.transform = function(a, b, c, d, e, f) {
            var m2 = svg.createSVGMatrix();
            m2.a = a; m2.b = b; m2.c = c; m2.d = d; m2.e = e; m2.f = f;
            xform = xform.multiply(m2);
            return transform.call(ctx, a, b, c, d, e, f);
        };

        var setTransform = ctx.setTransform;
        ctx.setTransform = function(a, b, c, d, e, f) {
            xform.a = a;
            xform.b = b;
            xform.c = c;
            xform.d = d;
            xform.e = e;
            xform.f = f;
            return setTransform.call(ctx, a, b, c, d, e, f);
        };

        var pt  = svg.createSVGPoint();
        ctx.transformedPoint = function(x, y) {
            pt.x = x; pt.y = y;
            return pt.matrixTransform(xform.inverse());
        }
    }

    return this.each(function() {
        // Initialise each image.
        ImageZoom(this);
    });
}