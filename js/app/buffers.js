/**
 * @module Buffers
 */
define(['gl', 'shaders', 'lighting'], function (gl, shaderProgram, lighting) {

    /**
     * @class Buffers
     */
    return {

        /**
         * Initialises the buffers.
         * @method initBuffers
         * @param  {AstronomicalObject} obj The object for which we're initialising buffers.
         */
        initBuffers: function (obj) {
            if (obj.spherical) {
                this.initSphericalBuffers(obj);
            } else {
                this.initCuboidalBuffers(obj);
            }
        },

        /**
         * Draws the necessary elements of the object onto the canvas.
         * @method drawElements
         * @param  {AstronomicalObject} obj The object which needs to be drawn.
         */
        drawElements: function (obj) {
            if (obj.spherical) {
                this.drawSphericalElements(obj);
            } else {
                this.drawCuboidalElements(obj);
            }
        },

        /**
         * Called by initBuffers(), this initialises the buffers for spherical objects, e.g. planets, the moon, the Sun.
         * @method initSphericalBuffers
         * @param  {AstronomicalObject} obj The spherical object we're initialising buffers for.
         */
        initSphericalBuffers: function (obj) {
            var radius = obj.radius;
            var latitudeBands = 30;
            var longitudeBands = 30;

            var vertexPositionData = [];
            var normalData = [];
            var textureCoordData = [];
            for (var latNumber = 0; latNumber <= latitudeBands; latNumber++) {
                var theta = latNumber * Math.PI / latitudeBands;
                var sinTheta = Math.sin(theta);
                var cosTheta = Math.cos(theta);

                for (var longNumber = 0; longNumber <= longitudeBands; longNumber++) {
                    var phi = longNumber * 2 * Math.PI / longitudeBands;
                    var sinPhi = Math.sin(phi);
                    var cosPhi = Math.cos(phi);

                    var x = cosPhi * sinTheta;
                    var y = cosTheta;
                    var z = sinPhi * sinTheta;
                    var u = 1 - (longNumber / longitudeBands);
                    var v = 1 - (latNumber / latitudeBands);

                    normalData.push(x);
                    normalData.push(y);
                    normalData.push(z);
                    textureCoordData.push(u);
                    textureCoordData.push(v);
                    vertexPositionData.push(radius * x);
                    vertexPositionData.push(radius * y);
                    vertexPositionData.push(radius * z);
                }
            }

            var indexData = this._getIndexData(latitudeBands, longitudeBands);

            obj.vertexNormalBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, obj.vertexNormalBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalData), gl.STATIC_DRAW);
            obj.vertexNormalBuffer.itemSize = 3;
            obj.vertexNormalBuffer.numItems = normalData.length / 3;

            obj.vertexTextureCoordBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, obj.vertexTextureCoordBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordData), gl.STATIC_DRAW);
            obj.vertexTextureCoordBuffer.itemSize = 2;
            obj.vertexTextureCoordBuffer.numItems = textureCoordData.length / 2;

            obj.vertexPositionBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, obj.vertexPositionBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositionData), gl.STATIC_DRAW);
            obj.vertexPositionBuffer.itemSize = 3;
            obj.vertexPositionBuffer.numItems = vertexPositionData.length / 3;

            obj.vertexIndexBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.vertexIndexBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData), gl.STATIC_DRAW);
            obj.vertexIndexBuffer.itemSize = 1;
            obj.vertexIndexBuffer.numItems = indexData.length;
        },

        /**
         * A private method called by initSphericalBuffers, which calculates index data used by gl.ELEMENT_ARRAY_BUFFER.
         * @method _getIndexData
         * @param  {int} latitudeBands  Latitude bands of the sphere
         * @param  {int} longitudeBands Longitude bands of the sphere
         * @return {array}              Index data.
         */
        _getIndexData: function (latitudeBands, longitudeBands) {
            var indexData = [];
            for (var latNumber = 0; latNumber < latitudeBands; latNumber++) {
                for (var longNumber = 0; longNumber < longitudeBands; longNumber++) {
                    var first = (latNumber * (longitudeBands + 1)) + longNumber;
                    var second = first + longitudeBands + 1;
                    indexData.push(first);
                    indexData.push(second);
                    indexData.push(first + 1);

                    indexData.push(second);
                    indexData.push(second + 1);
                    indexData.push(first + 1);
                }
            }
            return indexData;
        },

        /**
         * Called by initBuffers(), this initialises the buffers for cuboidal objects, e.g. Saturn's rings
         * @method initCuboidalBuffers
         * @param  {AstronomicalObject} obj The cuboidal object we're initialising buffers for.
         */
        initCuboidalBuffers: function (obj) {
            var width  = obj.radius,
                depth  = width,
                height = 0.1;

            obj.cubeVertexPositionBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, obj.cubeVertexPositionBuffer);
            var vertices = [
                    // Front face
                    -width, -height,  depth,
                    width, -height,  depth,
                    width,  height,  depth,
                    -width,  height,  depth,
                    // Back face
                    -width, -height, -depth,
                    -width,  height, -depth,
                    width,  height, -depth,
                    width, -height, -depth,
                    // Top face
                    -width,  height, -depth,
                    -width,  height,  depth,
                    width,  height,  depth,
                    width,  height, -depth,
                    // Bottom face
                    -width, -height, -depth,
                    width, -height, -depth,
                    width, -height,  depth,
                    -width, -height,  depth,
                    // Right face
                    width, -height, -depth,
                    width,  height, -depth,
                    width,  height,  depth,
                    width, -height,  depth,
                    // Left face
                    -width, -height, -depth,
                    -width, -height,  depth,
                    -width,  height,  depth,
                    -width,  height, -depth
                ];

            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
            obj.cubeVertexPositionBuffer.itemSize = 3;
            obj.cubeVertexPositionBuffer.numItems = 24;
            obj.cubeVertexTextureCoordBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, obj.cubeVertexTextureCoordBuffer);
            var textureCoords = [
                // Front face
                0.0, 0.0,
                1.0, 0.0,
                1.0, 1.0,
                0.0, 1.0,
                // Back face
                1.0, 0.0,
                1.0, 1.0,
                0.0, 1.0,
                0.0, 0.0,
                // Top face
                0.0, 1.0,
                0.0, 0.0,
                1.0, 0.0,
                1.0, 1.0,
                // Bottom face
                1.0, 1.0,
                0.0, 1.0,
                0.0, 0.0,
                1.0, 0.0,
                // Right face
                1.0, 0.0,
                1.0, 1.0,
                0.0, 1.0,
                0.0, 0.0,
                // Left face
                0.0, 0.0,
                1.0, 0.0,
                1.0, 1.0,
                0.0, 1.0
            ];

            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);
            obj.cubeVertexTextureCoordBuffer.itemSize = 2;
            obj.cubeVertexTextureCoordBuffer.numItems = 24;
            obj.cubeVertexIndexBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.cubeVertexIndexBuffer);
            var cubeVertexIndices = [
                0, 1, 2,      0, 2, 3,    // Front face
                4, 5, 6,      4, 6, 7,    // Back face
                8, 9, 10,     8, 10, 11,  // Top face
                12, 13, 14,   12, 14, 15, // Bottom face
                16, 17, 18,   16, 18, 19, // Right face
                20, 21, 22,   20, 22, 23  // Left face
            ];
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), gl.STATIC_DRAW);
            obj.cubeVertexIndexBuffer.itemSize = 1;
            obj.cubeVertexIndexBuffer.numItems = 36;
        },

        /**
         * Called by drawElements(), this draws the elements that comprise spherical objects.
         * @method drawSphericalElements
         * @param  {AstronomicalObject} obj The spherical object we're drawing
         */
        drawSphericalElements: function (obj) {
            gl.bindBuffer(gl.ARRAY_BUFFER, obj.vertexPositionBuffer);
            gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, obj.vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ARRAY_BUFFER, obj.vertexTextureCoordBuffer);
            gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, obj.vertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ARRAY_BUFFER, obj.vertexNormalBuffer);
            gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, obj.vertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

            // transparency
            gl.disable(gl.BLEND);
            gl.enable(gl.DEPTH_TEST);
            gl.uniform1f(shaderProgram.alphaUniform, 1.0);
            gl.uniform1f(shaderProgram.materialShininessUniform, lighting.getShininess());

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.vertexIndexBuffer);
            gl.drawElements(gl.TRIANGLES, obj.vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
        },

        /**
         * Called by drawElements(), this draws the elements that comprise cuboidal objects.
         * @method drawCuboidalElements
         * @param  {AstronomicalObject} obj The cuboidal object we're drawing
         */
        drawCuboidalElements: function (obj) {
            gl.bindBuffer(gl.ARRAY_BUFFER, obj.cubeVertexPositionBuffer);
            gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, obj.cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
            gl.bindBuffer(gl.ARRAY_BUFFER, obj.cubeVertexTextureCoordBuffer);
            gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, obj.cubeVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

            // transparency
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
            gl.enable(gl.BLEND);
            gl.enable(gl.DEPTH_TEST);
            gl.uniform1f(shaderProgram.alphaUniform, 1.0);
            gl.uniform1f(shaderProgram.materialShininessUniform, 0);

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.cubeVertexIndexBuffer);
            gl.drawElements(gl.TRIANGLES, obj.cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
        }
    };
});