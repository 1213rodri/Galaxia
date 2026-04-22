uniform float uTime;
uniform float uPixelRatio;
uniform float uSize;

attribute float aSize;
attribute vec3 aColor;
attribute float aTwinkleSpeed;
attribute float aTwinkleOffset;

varying vec3 vColor;
varying float vAlpha;

void main() {
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;
  gl_Position = projectedPosition;

  // Soft twinkling per star
  float twinkle = sin(uTime * aTwinkleSpeed + aTwinkleOffset) * 0.5 + 0.5;
  vAlpha = 0.55 + twinkle * 0.45;

  // Perspective-correct size with pixel ratio
  gl_PointSize = uSize * aSize * uPixelRatio * (1.0 / -viewPosition.z);
  gl_PointSize = clamp(gl_PointSize, 0.5, 180.0);

  vColor = aColor;
}
