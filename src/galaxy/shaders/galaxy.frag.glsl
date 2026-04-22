varying vec3 vColor;
varying float vAlpha;

void main() {
  // Distance from center of point sprite
  vec2 uv = gl_PointCoord - 0.5;
  float dist = length(uv);

  if (dist > 0.5) discard;

  // Bright core + soft halo falloff
  float core  = 1.0 - smoothstep(0.0, 0.12, dist);
  float inner = 1.0 - smoothstep(0.12, 0.28, dist);
  float halo  = 1.0 - smoothstep(0.28, 0.50, dist);

  float strength = core * 1.0 + inner * 0.5 + halo * 0.2;
  strength = clamp(strength, 0.0, 1.0);

  gl_FragColor = vec4(vColor, strength * vAlpha);
}
