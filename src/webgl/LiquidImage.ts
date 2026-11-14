import { Renderer, Program, Mesh, Triangle, Texture, type OGLRenderingContext } from 'ogl';
import { gsap } from '@/motion/gsap';
import { vertex, fragment } from './shaders/liquid';

export interface LiquidSource {
  src: string;
  focus: [number, number]; // 0–1
  scale: number;
}

const parsePos = (pos: string): [number, number] => {
  const [x, y] = pos.split(' ').map((v) => parseFloat(v) / 100);
  return [x ?? 0.5, y ?? 0.5];
};
export const toLiquidSource = (src: string, objectPosition: string, scale: number): LiquidSource => ({
  src,
  focus: parsePos(objectPosition),
  scale,
});

const cache = new Map<string, Promise<HTMLImageElement>>();
const loadImage = (src: string) => {
  if (!cache.has(src)) {
    cache.set(
      src,
      new Promise((res, rej) => {
        const img = new Image();
        img.decoding = 'async';
        img.onload = () => res(img);
        img.onerror = rej;
        img.src = src;
      }),
    );
  }
  return cache.get(src)!;
};

/**
 * "Liquid Light" — the site's single WebGL effect (ogl).
 * Idle displacement + cursor ripple + displacement dissolve between two images.
 * Initialised only in view, DPR ≤ 1.5, paused offscreen, disposed on destroy.
 */
export class LiquidImage {
  private renderer: Renderer;
  private gl: OGLRenderingContext;
  private program: Program;
  private mesh: Mesh;
  private texA: Texture;
  private texB: Texture;
  private raf = 0;
  private running = false;
  private io: IntersectionObserver;
  private ro: ResizeObserver;
  private mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
  private velocity = 0;
  private start = performance.now();
  private current: LiquidSource;
  private tween: gsap.core.Tween | null = null;
  private destroyed = false;
  ready: Promise<void>;

  constructor(
    private container: HTMLElement,
    source: LiquidSource,
    opts: { ripple?: boolean; idle?: number } = {},
  ) {
    this.current = source;
    this.renderer = new Renderer({ dpr: Math.min(window.devicePixelRatio || 1, 1.5), alpha: false, antialias: false });
    this.gl = this.renderer.gl;
    const canvas = this.gl.canvas as HTMLCanvasElement;
    canvas.className = 'liquid-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    container.appendChild(canvas);

    this.texA = new Texture(this.gl, { generateMipmaps: false, flipY: false });
    this.texB = new Texture(this.gl, { generateMipmaps: false, flipY: false });
    this.program = new Program(this.gl, {
      vertex,
      fragment,
      uniforms: {
        tA: { value: this.texA },
        tB: { value: this.texB },
        uRes: { value: [1, 1] },
        uImg: { value: [1672, 941] },
        uFocusA: { value: source.focus },
        uScaleA: { value: source.scale },
        uFocusB: { value: source.focus },
        uScaleB: { value: source.scale },
        uProgress: { value: 0 },
        uTime: { value: 0 },
        uMouse: { value: [0.5, 0.5] },
        uVelocity: { value: 0 },
        uIdle: { value: opts.idle ?? 1 },
      },
    });
    this.mesh = new Mesh(this.gl, { geometry: new Triangle(this.gl), program: this.program });

    this.ready = loadImage(source.src).then((img) => {
      if (this.destroyed) return;
      this.texA.image = img;
      this.texB.image = img;
      canvas.classList.add('is-ready');
    });

    this.resize();
    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(container);
    this.io = new IntersectionObserver(([e]) => (e.isIntersecting ? this.play() : this.pause()));
    this.io.observe(container);

    if (opts.ripple) {
      window.addEventListener('pointermove', this.onMove, { passive: true });
    }
  }

  private onMove = (e: PointerEvent) => {
    const r = this.container.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    if (x < 0 || x > 1 || y < 0 || y > 1) return;
    const dx = x - this.mouse.tx;
    const dy = y - this.mouse.ty;
    this.velocity = Math.min(1, this.velocity + Math.hypot(dx, dy) * 6);
    this.mouse.tx = x;
    this.mouse.ty = y;
  };

  private resize() {
    const { width, height } = this.container.getBoundingClientRect();
    if (!width || !height) return;
    this.renderer.setSize(width, height);
    this.program.uniforms.uRes.value = [width, height];
    if (!this.running) this.render();
  }

  private render = () => {
    const u = this.program.uniforms;
    u.uTime.value = (performance.now() - this.start) / 1000;
    this.mouse.x += (this.mouse.tx - this.mouse.x) * 0.08;
    this.mouse.y += (this.mouse.ty - this.mouse.y) * 0.08;
    u.uMouse.value = [this.mouse.x, this.mouse.y];
    // ripple decays over ~1.2s
    this.velocity *= 0.955;
    u.uVelocity.value = this.velocity;
    this.renderer.render({ scene: this.mesh });
  };

  private loop = () => {
    if (!this.running) return;
    this.render();
    this.raf = requestAnimationFrame(this.loop);
  };

  play() {
    if (this.running || this.destroyed) return;
    this.running = true;
    this.raf = requestAnimationFrame(this.loop);
  }

  pause() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  /** Dissolve to another image/crop through the displacement field (uProgress 0 → 1). */
  async transitionTo(next: LiquidSource, duration = 0.9) {
    if (next.src === this.current.src && next.scale === this.current.scale && next.focus.join() === this.current.focus.join()) return;
    const img = await loadImage(next.src);
    if (this.destroyed) return;
    const u = this.program.uniforms;
    this.tween?.progress(1).kill();
    this.texB.image = img;
    u.uFocusB.value = next.focus;
    u.uScaleB.value = next.scale;
    u.uProgress.value = 0;
    this.tween = gsap.to(u.uProgress, {
      value: 1,
      duration,
      ease: 'meres.inOut',
      onUpdate: () => {
        if (!this.running) this.render();
      },
      onComplete: () => {
        this.texA.image = img;
        u.uFocusA.value = next.focus;
        u.uScaleA.value = next.scale;
        u.uProgress.value = 0;
        if (!this.running) this.render();
      },
    });
    this.current = next;
  }

  destroy() {
    this.destroyed = true;
    this.pause();
    this.tween?.kill();
    this.io.disconnect();
    this.ro.disconnect();
    window.removeEventListener('pointermove', this.onMove);
    const gl = this.gl;
    [this.texA, this.texB].forEach((t) => t.texture && gl.deleteTexture(t.texture));
    this.program.remove();
    this.mesh.geometry.remove();
    (this.gl.canvas as HTMLCanvasElement).remove();
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  }
}

export const webglAvailable = () => {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
};
