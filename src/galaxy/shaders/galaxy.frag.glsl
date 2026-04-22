varying vec3 vColor;
varying float vAlpha;
varying float vSpikeIntensity;

#define PI 3.14159265359

// Diffraction spikes: 3 directions = 6 rays (like JWST)
float diffraction(vec2 uv) {
  float result = 0.0;
  float radial = length(uv);

  // Fade spike out very close to center (star glow covers it)
  float centerFade = smoothstep(0.0, 0.08, radial);

  for (int i = 0; i < 3; i++) {
    // 60° apart, rotated 15° for aesthetics
    float angle = float(i) * PI / 3.0 + PI / 12.0;
    float c = cos(angle);
    float s = sin(angle);

    // Perpendicular distance from point to spike line
    float perp = abs(uv.x * s - uv.y * c);

    // Spike shape: thin + fades at tip
    float width  = 1.0 - smoothstep(0.0, 0.055, perp);
    float length = 1.0 - smoothstep(0.0, 0.48, radial);

    result += pow(width, 3.0) * pow(length, 0.6) * centerFade;
  }

  return result;
}

void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float dist = length(uv);

  if (dist > 0.5) discard;

  // Base star glow
  float core  = 1.0 - smoothstep(0.0, 0.10, dist);
  float inner = 1.0 - smoothstep(0.10, 0.25, dist);
  float halo  = 1.0 - smoothstep(0.25, 0.50, dist);
  float star  = core * 1.0 + inner * 0.5 + halo * 0.15;

  // Diffraction spikes — only on bright stars
  float spikes = diffraction(uv) * vSpikeIntensity * 0.75;

  float strength = clamp(star + spikes, 0.0, 1.0);

  gl_FragColor = vec4(vColor, strength * vAlpha);
}
