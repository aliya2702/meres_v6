export const vertex = /* glsl */ `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

// Light moving through water/glass over walnut and stone.
export const fragment = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform sampler2D tA;
uniform sampler2D tB;
uniform vec2 uRes;
uniform vec2 uImg;
uniform vec2 uFocusA;
uniform float uScaleA;
uniform vec2 uFocusB;
uniform float uScaleB;
uniform float uProgress;
uniform float uTime;
uniform vec2 uMouse;
uniform float uVelocity;
uniform float uIdle;

// Simplex 3D noise (Ashima Arts, MIT)
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.0-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;vec4 s1=floor(b1)*2.0+1.0;vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}

// object-fit: cover + object-position(focus) + scale(k) about the focus point
vec2 coverUV(vec2 f, vec2 focus, float k){
  float rs = uRes.x / uRes.y;
  float ri = uImg.x / uImg.y;
  vec2 s0 = rs > ri ? vec2(1.0, ri / rs) : vec2(rs / ri, 1.0);
  return focus + (f - focus) * s0 / k;
}

void main(){
  vec2 f = vec2(vUv.x, 1.0 - vUv.y);
  float aspect = uRes.x / uRes.y;
  float t = uTime;

  // slowly scrolling noise field
  float n1 = snoise(vec3(f * vec2(aspect, 1.0) * 2.2, t * 0.06));
  float n2 = snoise(vec3(f * vec2(aspect, 1.0) * 4.0 + 7.3, t * 0.09));

  // cursor ripple: strength scales with velocity and decays (handled on the CPU)
  vec2 dm = (f - uMouse) * vec2(aspect, 1.0);
  float d = length(dm);
  float ring = sin(d * 38.0 - t * 5.0) * exp(-d * 7.0);
  vec2 rippleDir = d > 0.0001 ? dm / d : vec2(0.0);

  vec2 disp = vec2(n1, n2) * 0.0035 * uIdle + rippleDir * ring * 0.012 * uVelocity;

  // transition A → B through the displacement field
  float p = uProgress;
  float edge = smoothstep(p - 0.25, p + 0.25, (n1 * 0.5 + 0.5) * 0.6 + f.y * 0.4);
  float push = sin(p * 3.14159);
  vec2 dA = disp + vec2(n1, n2) * 0.06 * push;
  vec2 dB = disp - vec2(n2, n1) * 0.06 * push;

  vec4 a = texture2D(tA, clamp(coverUV(f + dA, uFocusA, uScaleA), 0.001, 0.999));
  vec4 b = texture2D(tB, clamp(coverUV(f + dB, uFocusB, uScaleB), 0.001, 0.999));
  vec4 col = mix(b, a, edge);
  if (p <= 0.0) col = a;
  if (p >= 1.0) col = b;

  // soft caustic brightening in warm linen
  float c = pow(max(snoise(vec3(f * vec2(aspect, 1.0) * 3.0 + disp * 40.0, t * 0.12)), 0.0), 3.0) * 0.08;
  col.rgb += vec3(0.957, 0.937, 0.902) * c * (0.6 + uVelocity);

  gl_FragColor = vec4(col.rgb, 1.0);
}
`;
