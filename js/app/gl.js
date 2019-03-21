/**
 * @module GL
 */
define(function () {

    var canvas = document.getElementById('canvas_solar_system'),
        gl = null;

    /**
     * Does some initial checking for WebGL support, before defining the cross-module variable `gl`.
     * @constructor
     * @class GL
     * @method initWebGL
     * @param  {DOMElement} canvas The canvas to get the context of.
     */
    function initWebGL(canvas) {

        var msg = 'Your browser does not support WebGL, ' + 'or it is not enabled by default.';

        try {
            gl = canvas.getContext('experimental-webgl');
            gl.viewport(0, 0, canvas.width, canvas.height);
        } catch (e) {
            msg = 'Error creating WebGL Context!: ' + e.toString();
        }

        if (!gl) {
            console.log(msg);
        }
    }

    initWebGL(canvas);

    return gl;
});