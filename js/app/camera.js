/**
 * @module Camera
 */
define(['gl', 'glMatrix'], function (gl, glMatrix) {

    var canvas              = document.getElementById('canvas_solar_system'),
        projectionMatrix    = glMatrix.mat4.create(),
        cameraMatrix        = glMatrix.mat4.create(),
        fullScreen          = false,
        defaultCanvasWidth  = 800,
        defaultCanvasHeight = 400;

    /**
     * Initialises the camera.
     * @class Camera
     * @constructor
     */
    function init() {
        setCanvasSize(defaultCanvasWidth, defaultCanvasHeight);
        moveCameraToStartingPosition();
    }

    /**
     * Resets camera to its starting position - which is the origin of the solar system, set back by a certain distance so as not to be stuck "inside" the Sun.
     * @method moveCameraToStartingPosition
     */
    function moveCameraToStartingPosition() {
        glMatrix.mat4.identity(cameraMatrix);
        glMatrix.mat4.translate(cameraMatrix, cameraMatrix, [0, 0, -5000]);
    }

    /**
     * Sets the size of the canvas and informs the necessary objects/matrices of the change.
     * @method setCanvasSize
     * @param {int} width  Width of the canvas.
     * @param {int} height Height of the canvas.
     */
    function setCanvasSize(width, height) {
        canvas.width  = width;
        canvas.height = height;
        gl.viewport(0, 0, canvas.width, canvas.height);
        updateProjectionMatrix();
    }

    /**
     * Updates the projection view matrix.
     * @method updateProjectionMatrix
     */
    function updateProjectionMatrix() {
        glMatrix.mat4.perspective(
            projectionMatrix,
            Math.PI / 4,        // 45 degree field of view
            canvas.width / canvas.height,
            1,
            1000000
        );
    }

    init();

    return {

        /**
         * Toggles full screen mode. When full screen, the canvas is set to the size of the viewport, otherwise it is set to the default height and width, defined in this class.
         * @method toggleFullScreen
         */
        toggleFullScreen: function () {
            fullScreen = !fullScreen;

            if (fullScreen) {
                canvas.className = 'canvas_solar_system--full_screen';
                setCanvasSize(window.innerWidth, window.innerHeight);
            } else {
                canvas.className = 'canvas_solar_system';
                setCanvasSize(defaultCanvasWidth, defaultCanvasHeight);
            }
        },

        /**
         * Returns the projection view matrix of the camera. This is used by the AstronomicalObject class.
         * @method getProjectionViewMatrix
         * @return {[array]} Projection view matrix of the camera.
         */
        getProjectionViewMatrix: function () {
            var projectionViewMatrix = glMatrix.mat4.create();
            glMatrix.mat4.multiply(projectionViewMatrix, projectionMatrix, cameraMatrix);
            return projectionViewMatrix;
        },

        /**
         * Calculates the movement speed of the camera, given the number of frames the movement key has been held down for.
         * @method calculateMovementSpeed
         * @param  {int} acceleration In this case, this is the number of frames that the movement key has been held down for.
         * @return {int}              A number representing the distance in the 3D world that we should move by in the next frame.
         */
        calculateMovementSpeed: function (acceleration) {
            return acceleration * acceleration;
        },

        /**
         * Rotates the camera by the given rotation matrix.
         * @method rotateView
         * @param  {array} rotationMatrix Rotation matrix to merge with the camera matrix.
         */
        rotateView: function (rotationMatrix) {
            glMatrix.mat4.multiply(cameraMatrix, cameraMatrix, rotationMatrix);
        },

        /**
         * Moves the camera forwards in 3D space.
         * @method goForwards
         * @param  {int} acceleration The number of frames the movement key has been held down for.
         */
        goForwards: function (acceleration) {
            glMatrix.mat4.translate(cameraMatrix, cameraMatrix, [0, 0, this.calculateMovementSpeed(acceleration)]);
        },

        /**
         * Moves the camera backwards in 3D space.
         * @method goBackwards
         * @param  {int} acceleration The number of frames the movement key has been held down for.
         */
        goBackwards: function (acceleration) {
            glMatrix.mat4.translate(cameraMatrix, cameraMatrix, [0, 0, -this.calculateMovementSpeed(acceleration)]);
        },

        /**
         * Strafes the camera to the left in 3D space.
         * @method goLeft
         * @param  {int} acceleration The number of frames the movement key has been held down for.
         */
        goLeft: function (acceleration) {
            glMatrix.mat4.translate(cameraMatrix, cameraMatrix, [this.calculateMovementSpeed(acceleration), 0, 0]);
        },

        /**
         * Strafes the camera to the right in 3D space.
         * @method goRight
         * @param  {int} acceleration The number of frames the movement key has been held down for.
         */
        goRight: function (acceleration) {
            glMatrix.mat4.translate(cameraMatrix, cameraMatrix, [-this.calculateMovementSpeed(acceleration), 0, 0]);
        },

        /**
         * Resets the camera to its original position.
         * @method resetPosition
         */
        resetPosition: moveCameraToStartingPosition,

        /**
         * Snaps the camera to the given planet.
         * @method snapTo
         * @param  {AstronomicalObject} planet The planet object to snap to.
         */
        snapTo: function (planet) {
            // clean slate
            glMatrix.mat4.identity(cameraMatrix);

            // translate planet orbital distance
            glMatrix.mat4.translate(cameraMatrix, cameraMatrix, [
                planet.origin[0],
                planet.origin[1],
                planet.origin[2]
            ]);

            // zoom out a little so that we can see the planet
            glMatrix.mat4.translate(cameraMatrix, cameraMatrix, [0, 0, -planet.radius * 5]);

            // rotate same amount as planet
            glMatrix.mat4.rotate(cameraMatrix, cameraMatrix, -planet.cumulativeOrbitAngle, [0, 1, 0]);

            // turn back to face the Sun
            glMatrix.mat4.rotate(cameraMatrix, cameraMatrix, Math.PI, [0, 1, 0]);
        }
    };
});