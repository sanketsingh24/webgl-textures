/**
 * @module AstronomicalObject
 */
define(['gl', 'glMatrix', 'shaders', 'buffers'], function (gl, glMatrix, shaderProgram, buffers) {

    /**
     * AstronomicalObject is a class that represents Planets, Moons, the Sun, Galaxy, and Saturn's Rings.
     * 
     * @class AstronomicalObject
     * @constructor
     * @param {Object}  config                  The config object.
     * @param {String}  config.name             Name of the Astronomical Body. Useful for debugging, but also used in generating the instructions for the keyboard shortcuts.
     * @param {Array}   config.origin           X, Y, Z co-ordinates of the origin of the body in space.
     * @param {int}     config.orbitDistance    (in miles) from whatever it is orbiting. This is then automatically reduced for presen tation purposes.
     * @param {float}   config.orbitalPeriod    Number of days to make a full orbit.
     * @param {float}   config.spinPeriod       Number of days to rotate fully on its axis.
     * @param {int}     config.radius           (in miles). This is then automatically increased for presentation purposes.
     * @param {float}   config.axis             Rotational axis (in degrees).
     * @param {String}  config.texture          Url pointing to the texture image to be mapped to the object.
     * @param {String}  config.specularTexture  Url pointing to the specular map to be mapped to the object.
     * @param {String}  config.shortcutKey      The key that when pressed should make the camera snap to the object.
     * @param {boolean} config.spins            Determines whether or not the object should spin on its axis.
     * @param {boolean} config.spinsClockwise   Defaults to false. Determines spin direction.
     * @param {boolean} config.useLighting      Determines whether or not the object should be affected by Phong shading.
     * @param {boolean} config.spherical        Determines which buffers to initialise and draw the object with (cuboidal or spherical).
     */
    var AstronomicalObject = function (config) {
        this.setAttributes(config);
        this.setOrigin(config.origin);
        this.setRandomStartingOrbit();
        this.initMatrix();
        this.initTextures();
        buffers.initBuffers(this);
    };

    AstronomicalObject.prototype = {

        /**
         * Sets the attributes of the object instance based on the passed config object.
         * @method setAttributes
         * @param {Object} config The config object.
         */
        setAttributes: function (config) {
            this.name                 = config.name            || 'name not set';
            this.orbits               = config.orbits          || false;
            this.orbitDistance        = config.orbitDistance   || 0;
            this.orbitalPeriod        = config.orbitalPeriod   || 1;
            this.spinPeriod           = config.spinPeriod      || 1;
            this.radius               = config.radius          || 10;
            this.textureImage         = config.texture         || 'textures/moon.gif';
            this.specularTextureImage = config.specularTexture || false;
            this.spherical            = this.getBoolean(config.spherical);
            this.useLighting          = this.getBoolean(config.useLighting);
            this.spins                = this.getBoolean(config.spins);
            this.spinsClockwise       = this.getBoolean(config.spinsClockwise, false);
            this.shortcutKey          = config.shortcutKey;
            this.setAxis(config.axis);
            this.normalise();
            this.prepareSpecialCases();
        },

        /**
         * Sets the origin of the object, using the passed value if there is one, or calculating based on the orbited object if there isn't.
         * @method setOrigin
         * @param {Array} origin Three-value array representing the origin, or null.
         */
        setOrigin: function (origin) {
            if (origin) {
                this.origin = origin;
            }
            else if (this.orbits) {
                this.origin = [];
                this.origin[0] = this.orbits.origin[0];
                this.origin[1] = this.orbits.origin[1];
                this.origin[2] = this.orbits.origin[2] - this.distanceFromBodyWeAreOrbiting;
            }
            else {
                this.origin = [0, 0, 0];
            }
        },

        /**
         * Called on initialisation - this moves the object to a position in its orbit, randomised to prevent all objects starting off in a long straight line.
         * @method setRandomStartingOrbit
         */
        setRandomStartingOrbit: function () {
            this.lastSpinAngle = 0;
            this.lastOrbitAngle = 0;
            this.cumulativeOrbitAngle = 0;

            if (this.name === 'Saturn\'s Rings') {
                // angle rings towards the Sun
                var saturnsRingsAngle = this.degreesToRadians(90);
                this.lastOrbitAngle = saturnsRingsAngle;
                this.cumulativeOrbitAngle = saturnsRingsAngle;
            }
            else if (this.orbits) {
                var randomStartingOrbit = (Math.PI * 2) / Math.random();
                if (this.spinsClockwise) {
                    randomStartingOrbit *= -1;
                }
                this.lastOrbitAngle = randomStartingOrbit;
                this.cumulativeOrbitAngle = randomStartingOrbit;
            }
        },

        /**
         * Initialises the model view matrix.
         * @method initMatrix
         */
        initMatrix: function () {
            this.modelViewMatrix = glMatrix.mat4.create();

            if (this.orbits.orbits) {
                glMatrix.mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, this.orbits.lastOrbitAngle, [0, 1, 0]);
                glMatrix.mat4.translate(this.modelViewMatrix, this.modelViewMatrix, this.orbits.origin);
            }

            glMatrix.mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, this.lastOrbitAngle, [0, 1, 0]);
            glMatrix.mat4.translate(this.modelViewMatrix, this.modelViewMatrix, [0, 0, -this.distanceFromBodyWeAreOrbiting]);
        },

        /**
         * Initialises the textures for the object.
         * @method initTextures
         */
        initTextures: function () {
            if (this.textureImage) {
                this.initTexture(this.textureImage, 'texture');
            }
            if (this.specularTextureImage) {
                this.initTexture(this.specularTextureImage, 'specularTexture');
            }
        },

        /**
         * Initialises a texture for the object.
         * @method initTexture
         * @param {String} imageSrc         URL pointing to the texture image.
         * @param {String} imageProperty    The property to set texture to on this object.
         */
        initTexture: function (imageSrc, imageProperty) {
            var texture = gl.createTexture();
            texture.image = new Image();
            texture.image.crossOrigin = 'anonymous';

            var self = this;

            texture.image.onload = function () {
                self.handleLoadedTexture(texture, imageProperty);
            };

            texture.image.src = imageSrc;
        },

        /**
         * Handle the image texture once it has downloaded.
         * @method handleLoadedTexture
         * @param {Object} texture A WebGL TEXTURE_2D object.
         * @param {String} imageProperty The property to set texture to on this object.
         */
        handleLoadedTexture: function (texture, imageProperty) {
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.bindTexture(gl.TEXTURE_2D, null);
            this[imageProperty] = texture;
            this.isReady = true;
        },

        /**
         * False until all assets for the Astronomical Object have been downloaded (i.e. the texture maps).
         * @property isReady
         * @type {Boolean}
         * @default false
         */
        isReady: false,

        /**
         * Sets the axis of the object.
         * @method setAxis
         * @param {int} axis Axis (in degrees) that the object rotates on.
         */
        setAxis: function (axis) {
            axis = axis || 0;
            this.axis = this.degreesToRadians(axis);
            this.axisArray = [
                this.axis / this.degreesToRadians(90),
                1 - (this.axis / this.degreesToRadians(90)),
                0
            ];
        },

        /**
         * Adjusts the scales and radiuses for aesthetic reasons.
         * @method normalise
         */
        normalise: function () {
            this.orbitDistance /= 50000;
            this.radius /= 100;
        },

        /**
         * Executes code specific to individual entities, e.g. the Sun/Saturn's Rings. In future, this could be extracted out into a subclass.
         * @method prepareSpecialCases
         */
        prepareSpecialCases: function () {
            this.distanceFromBodyWeAreOrbiting = 0;
            if (this.orbits) {
                this.distanceFromBodyWeAreOrbiting = this.radius + this.orbitDistance + this.orbits.radius;
            }
            
            if (this.name === 'Sun') {
                this.radius /= 10;
            }
            else if (this.name === 'Saturn\'s Rings') {
                this.distanceFromBodyWeAreOrbiting = 0;
                this.orbitalPeriod = this.orbits.orbitalPeriod;
                this.spinPeriod    = this.orbits.spinPeriod;
            }
        },

        /**
         * Converts degrees to radians.
         * @method degreesToRadians
         * @param  {int} celsius Value in degrees.
         * @return {float}       Converted value in radians.
         */
        degreesToRadians: function (celsius) {
            return celsius * (Math.PI / 180);
        },

        /**
         * Converts the given value into a boolean.
         * @method getBoolean
         * @param  {Object} attribute Value to convert (typically a boolean or null)
         * @param {boolean} defaultValue Value to default to if one is not specified.
         * @return {boolean}          The boolean value.
         */
        getBoolean: function (attribute, defaultValue) {
            if (defaultValue === undefined) {
                defaultValue = true;
            }
            return attribute === undefined ? defaultValue : attribute;
        },

        /**
         * Draws the object, relative to a projection matrix handles by the Camera object.
         * @method draw
         * @param  {array} projectionMatrix glMatrix object (mat4) representing projection of the camera.
         */
        draw: function (projectionMatrix) {
            this.setupLighting(projectionMatrix);
            this.setupTexture();
            buffers.drawElements(this);
        },

        /**
         * Initialises the shader variables for lighting.
         * @method setupLighting
         * @param  {array} projectionMatrix glMatrix object (mat4) representing projection of the camera.
         */
        setupLighting: function (projectionMatrix) {
            var normalMatrix = glMatrix.mat3.create();
            gl.uniform1i(shaderProgram.showSpecularHighlightsUniform, true);
            gl.uniform1i(shaderProgram.useLightingUniform, this.useLighting);
            gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, projectionMatrix);
            gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, this.modelViewMatrix);
            glMatrix.mat3.normalFromMat4(normalMatrix, this.modelViewMatrix);
            gl.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, normalMatrix);
        },

        /**
         * Sets up the texture.
         * @method setupTexture
         */
        setupTexture: function () {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.uniform1i(shaderProgram.useTexturesUniform, true);
            gl.uniform1i(shaderProgram.samplerUniform, 0);
            gl.uniform1i(shaderProgram.showSpecularSamplerUniform, false);
            
            if (this.specularTextureImage) {
                gl.uniform1i(shaderProgram.showSpecularSamplerUniform, true);
                gl.activeTexture(gl.TEXTURE1);
                gl.bindTexture(gl.TEXTURE_2D, this.specularTexture);
                gl.uniform1i(shaderProgram.specularSamplerUniform, 1);
            }
        },

        /**
         * Performs the calculations necessary for the object to orbit and spin on its axis, if applicable.
         * @method animate
         * @param {float} millisecondsPerDay The number of milliseconds that represent a day - this is integral in some of the calculations of the animation.
         * @param {float} millisecondsSinceLastFrame The number of milliseconds since the last frame was rendered.
         */
        animate: function (millisecondsPerDay, millisecondsSinceLastFrame) {

            var orbitAmount = this.calculatePortionOf(this.orbitalPeriod, millisecondsSinceLastFrame, millisecondsPerDay),
                spinAmount  = this.calculatePortionOf(this.spinPeriod, millisecondsSinceLastFrame, millisecondsPerDay);

            if (this.orbits) {
                var translationMatrix = glMatrix.mat4.create();

                this.beforeOrbit(translationMatrix);

                // NORMAL PLANETS
                if (!this.orbits.orbits) {
                    // 3. move to origin of body we're orbiting
                    glMatrix.mat4.translate(translationMatrix, translationMatrix, [0, 0, this.distanceFromBodyWeAreOrbiting]);

                    // 4. rotate by extra orbit angle
                    glMatrix.mat4.rotate(translationMatrix, translationMatrix, orbitAmount, [0, 1, 0]);

                    // 5. move back out to orbit space
                    glMatrix.mat4.translate(translationMatrix, translationMatrix, [0, 0, -this.distanceFromBodyWeAreOrbiting]);
                }
                // MOONS etc
                else {
                    // 1. move to center of earth
                    glMatrix.mat4.translate(translationMatrix, translationMatrix, [0, 0, this.distanceFromBodyWeAreOrbiting]);
                    
                    // 2. rotate by the moon's CUMULATIVE orbit amount
                    glMatrix.mat4.rotate(translationMatrix, translationMatrix, -this.cumulativeOrbitAngle, [0, 1, 0]);
                    
                    // 3. move to center of sun
                    glMatrix.mat4.translate(translationMatrix, translationMatrix, [0, 0, this.orbits.distanceFromBodyWeAreOrbiting]);

                    // 4. rotate by earth's LAST orbit angle
                    glMatrix.mat4.rotate(translationMatrix, translationMatrix, this.orbits.lastOrbitAngle, [0, 1, 0]);

                    // 5. move back out by earth's distance
                    glMatrix.mat4.translate(translationMatrix, translationMatrix, [0, 0, -this.orbits.distanceFromBodyWeAreOrbiting]);

                    // 6. rotate by the moon's cumulative orbit amount PLUS the new orbit
                    glMatrix.mat4.rotate(translationMatrix, translationMatrix, this.cumulativeOrbitAngle + orbitAmount, [0, 1, 0]);

                    // 7. move back out to orbit space (away from earth)
                    glMatrix.mat4.translate(translationMatrix, translationMatrix, [0, 0, -this.distanceFromBodyWeAreOrbiting]);
                }

                // move the planet according to its orbit matrix
                glMatrix.mat4.multiply(this.modelViewMatrix, this.modelViewMatrix, translationMatrix);

                this.afterOrbit(spinAmount);
            }
            else if (this.spins) {
                glMatrix.mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, spinAmount, [0, 1, 0]);
            }
            
            this.updateAttributes(orbitAmount, spinAmount);
        },

        /**
         * Rotation to perform before orbit.
         * @method beforeOrbit
         * @param  {Object} translationMatrix glMatrix to multiply by modelViewMatrix
         */
        beforeOrbit: function (translationMatrix) {
            // unspin
            if (this.isNotFirstAnimationFrame) {
                var angle = this.spinsClockwise ? this.lastSpinAngle : -this.lastSpinAngle;
                glMatrix.mat4.rotate(translationMatrix, translationMatrix, angle, [0, 1, 0]);
                glMatrix.mat4.rotate(translationMatrix, translationMatrix, -1, this.axisArray);
            }
        },

        /**
         * Rotation to perform after orbit.
         * @method afterOrbit
         * @param  {float} spinAmount Spin amount to take into account.
         */
        afterOrbit: function (spinAmount) {
            // perform spin
            var angle = this.spinsClockwise ? (-this.lastSpinAngle - spinAmount) : (this.lastSpinAngle + spinAmount);
            glMatrix.mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, 1, this.axisArray);
            glMatrix.mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, [0, 1, 0]);
            this.isNotFirstAnimationFrame = true;
        },

        /**
         * Calculates the portion of a given attribute, based on the number of milliseconds since the last frame and the number of milliseconds which represents a day.
         * @method calculatePortionOf
         * @param  {int} attribute A property of the current object, e.g. orbitalPeriod
         * @param  {float} millisecondsSinceLastFrame    Number of milliseconds since last frame.
         * @param  {float} millisecondsPerDay The number of milliseconds that represent a day - this is integral in some of the calculations of the animation.
         * @return {float}           Angle (in radians) that should be moved by.
         */
        calculatePortionOf: function (attribute, millisecondsSinceLastFrame, millisecondsPerDay) {
            var proportion = millisecondsSinceLastFrame / (millisecondsPerDay * attribute),
                proportionInRadians = (Math.PI * 2) * proportion;
            return proportionInRadians;
        },

        /**
         * Updates the object's attributes concerning angles.
         * @method updateAttributes
         * @param  {float} orbitAmount Last orbit amount travelled
         * @param  {float} spinAmount  Last spin amount spun
         */
        updateAttributes: function (orbitAmount, spinAmount) {
            this.lastOrbitAngle = orbitAmount;
            this.cumulativeOrbitAngle += this.lastOrbitAngle;
            this.lastSpinAngle += spinAmount;
        }
    };

    return AstronomicalObject;
});