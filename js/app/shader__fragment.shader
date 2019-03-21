precision mediump float;
varying vec2 vTextureCoord;
varying vec3 vTransformedNormal;
varying vec4 vPosition;
uniform float uMaterialShininess;
uniform bool uShowSpecularHighlights;
uniform bool uShowSpecularSampler;
uniform bool uUseLighting;
uniform bool uUseTextures;
uniform vec3 uAmbientColor;
uniform vec3 uPointLightingLocation;
uniform vec3 uPointLightingSpecularColor;
uniform vec3 uPointLightingDiffuseColor;
uniform sampler2D uSampler;
uniform sampler2D uSpecularSampler;
uniform float uAlpha;

void main(void) {
    vec3 lightWeighting;
    if (!uUseLighting) {
        lightWeighting = vec3(1.0, 1.0, 1.0);
    } else {

        float specularLightWeighting = 0.0;
        float shininess = 32.0;
        vec3 lightDirection = normalize(uPointLightingLocation - vPosition.xyz);
        vec3 normal = normalize(vTransformedNormal);

        if (uShowSpecularSampler) {
            shininess = texture2D(uSpecularSampler, vec2(vTextureCoord.s, vTextureCoord.t)).r * 255.0;
        } else {
            shininess = uMaterialShininess;
        }

        if (uShowSpecularHighlights && shininess < 255.0) {
            vec3 eyeDirection = normalize(-vPosition.xyz);
            vec3 reflectionDirection = reflect(-lightDirection, normal);
            specularLightWeighting = pow(max(dot(reflectionDirection, eyeDirection), 0.0), shininess);
        }

        float diffuseLightWeighting = max(dot(normal, lightDirection), 0.0);
        lightWeighting = uAmbientColor
            + uPointLightingSpecularColor * specularLightWeighting * diffuseLightWeighting
            + uPointLightingDiffuseColor * diffuseLightWeighting; // diffuseLightWeighting to retain information about light direction
    }

    // rendering the color from the texture
    vec4 fragmentColor;
    if (uUseTextures) {
        fragmentColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));
    } else {
        fragmentColor = vec4(1.0, 1.0, 1.0, 1.0);
    }
    gl_FragColor = vec4(fragmentColor.rgb * lightWeighting, fragmentColor.a * uAlpha);
}