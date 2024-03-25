uniform float uFillAmount;
uniform float uTurnRed;

varying vec2 vUv;

void main() {
  vec3 color;
  if(uTurnRed < 0.5) {
    // Original behavior
    color = mix(vec3(1.0), vec3(0.0, 1.0, 0.0), step(vUv.x, uFillAmount));
  } else {
    // Turn red
    color = vec3(1.0, 0.0, 0.0);
  }
  gl_FragColor = vec4(color, 1.0);

  #include <colorspace_fragment>
}