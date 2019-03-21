/**
 * @module Shaders
 */
define(['gl', 'glMatrix', 'text!shader__fragment.shader', 'text!shader__vertex.shader'], function (gl, glMatrix, fragmentShaderCode, vertexShaderCode) {

    /**
     * Initialises the shaders.
     * @class Shaders
     * @constructor
     * @return {Object} The shader program containing the compiled shaders.
     */
    function initShaders() {
        var fragmentShader = compileShader(fragmentShaderCode, 'fragment');
        var vertexShader = compileShader(vertexShaderCode, 'vertex');
        var shaderProgram = gl.createProgram();

        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);

        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            alert('Could not initialise shaders');
        }
        
        gl.useProgram(shaderProgram);
        shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
        gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
        shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, 'aVertexNormal');
        gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);
        shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, 'aTextureCoord');
        gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);

        var jsVariableShaderVariablePairs = {
            'pMatrixUniform':                    'uPMatrix',
            'mvMatrixUniform':                   'uMVMatrix',
            'nMatrixUniform':                    'uNMatrix',
            'samplerUniform':                    'uSampler',
            'showSpecularSamplerUniform':        'uShowSpecularSampler',
            'specularSamplerUniform':            'uSpecularSampler',
            'materialShininessUniform':          'uMaterialShininess',
            'showSpecularHighlightsUniform':     'uShowSpecularHighlights',
            'useTexturesUniform':                'uUseTextures',
            'useLightingUniform':                'uUseLighting',
            'ambientColorUniform':               'uAmbientColor',
            'pointLightingLocationUniform':      'uPointLightingLocation',
            'pointLightingSpecularColorUniform': 'uPointLightingSpecularColor',
            'pointLightingDiffuseColorUniform':  'uPointLightingDiffuseColor',
            'alphaUniform':                      'uAlpha'
        }

        for (var jsVariable in jsVariableShaderVariablePairs) {
            var shaderVariable = jsVariableShaderVariablePairs[jsVariable];
            shaderProgram[jsVariable] = gl.getUniformLocation(shaderProgram, shaderVariable);
        }

        return shaderProgram;
    }

    /**
     * Compiles an OpenGL shader from raw shader code.
     * @method  compileShader
     * @param  {String} code    The uncompiled shader program.
     * @param  {String} type    The type of shader to compiled (fragment or vertex).
     * @return {Object}         The compiled gl shader.
     */
    function compileShader(code, type) {
        var shader;
        if (type === 'fragment') {
            shader = gl.createShader(gl.FRAGMENT_SHADER);
        }
        else if (type === 'vertex') {
            shader = gl.createShader(gl.VERTEX_SHADER);
        }
        else {
            return null;
        }

        gl.shaderSource(shader, code);
        gl.compileShader(shader);
        
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.log(gl.getShaderInfoLog(shader), 'Error: could not compile shaders');
            return null;
        }
        
        return shader;
    }

    return initShaders();
});