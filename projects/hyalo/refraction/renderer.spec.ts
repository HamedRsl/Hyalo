import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HyFidelity } from '@hyalo/angular/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { HyRefraction, HyRefractionRenderer } from './refraction';
import { RefractionRenderer, type RefractionTarget } from './renderer';

/** Exercise the real renderer while replacing only browser GPU/RAF seams. */
function graphics() {
  const gl = {
    createShader: vi.fn(() => ({})),
    createProgram: vi.fn(() => ({})),
    createBuffer: vi.fn((): object | null => ({})),
    createTexture: vi.fn(() => ({})),
    getShaderParameter: vi.fn(() => true),
    getProgramParameter: vi.fn(() => true),
    getAttribLocation: vi.fn(() => 0),
    getUniformLocation: vi.fn(() => ({})),
    deleteTexture: vi.fn(),
    deleteBuffer: vi.fn(),
    deleteProgram: vi.fn(),
    deleteShader: vi.fn(),
    texImage2D: vi.fn(),
    drawArrays: vi.fn(),
    uniform1f: vi.fn(),
    getExtension: vi.fn(() => ({ loseContext })),
    ...Object.fromEntries(
      [
        'shaderSource',
        'compileShader',
        'attachShader',
        'linkProgram',
        'useProgram',
        'bindBuffer',
        'bufferData',
        'enableVertexAttribArray',
        'vertexAttribPointer',
        'bindTexture',
        'texParameteri',
        'pixelStorei',
        'viewport',
        'uniform1i',
      ].map((name) => [name, vi.fn()]),
    ),
  };
  const canvases: HTMLCanvasElement[] = [];
  const images: HTMLImageElement[] = [];
  const create = document.createElement.bind(document);
  vi.spyOn(document, 'createElement').mockImplementation(((name: string) => {
    const element = create(name);
    if (name === 'canvas') canvases.push(element as HTMLCanvasElement);
    if (name === 'img') images.push(element as HTMLImageElement);
    return element;
  }) as typeof document.createElement);
  const copy = { drawImage: vi.fn() };
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(((kind: string) =>
    kind === 'webgl' ? gl : copy) as unknown as HTMLCanvasElement['getContext']);
  let next = 0;
  const frames = new Map<number, FrameRequestCallback>();
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
    frames.set(++next, callback);
    return next;
  });
  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => {
    frames.delete(id);
  });
  function flush() {
    const pending = [...frames.values()];
    frames.clear();
    pending.forEach((callback) => callback(0));
  }
  function target(): RefractionTarget {
    const canvas = create('canvas');
    document.body.append(canvas);
    vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({
      width: 100,
      height: 80,
    } as DOMRect);
    return { canvas, src: 'scene.jpg', strength: () => 0.12 };
  }
  return { gl, canvases, images, frames, flush, target, copy };
}
const loseContext = vi.fn();

@Component({
  imports: [HyRefraction],
  template:
    '<hy-refraction src="scene.jpg" [strength]="strength()"><button>Continue</button></hy-refraction>',
})
class RefractionFixture {
  readonly strength = signal(0.12);
}

describe('refraction resource lifecycle', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    loseContext.mockClear();
    document.body.replaceChildren();
  });

  it.each(['fragment', 'link', 'buffer'])(
    'cleans partial GPU initialization on %s failure',
    (failure) => {
      const gpu = graphics();
      if (failure === 'fragment')
        gpu.gl.getShaderParameter.mockReturnValueOnce(true).mockReturnValueOnce(false);
      if (failure === 'link') gpu.gl.getProgramParameter.mockReturnValue(false);
      if (failure === 'buffer') gpu.gl.createBuffer.mockReturnValue(null);
      expect(() => new RefractionRenderer(document)).toThrow();
      expect(gpu.gl.deleteShader).toHaveBeenCalledTimes(2);
      expect(gpu.gl.deleteProgram).toHaveBeenCalledTimes(failure === 'fragment' ? 0 : 1);
      expect(loseContext).toHaveBeenCalledTimes(1);
      expect(gpu.frames.size).toBe(0);
    },
  );

  it('redraws strength changes without reloading the image or replacing focused content', async () => {
    const gpu = graphics();
    const tier = signal('high');
    TestBed.configureTestingModule({ providers: [{ provide: HyFidelity, useValue: { tier } }] });
    const fixture = TestBed.createComponent(RefractionFixture);
    await fixture.whenStable();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    const canvas: HTMLCanvasElement = fixture.nativeElement.querySelector('canvas');
    vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({
      width: 100,
      height: 80,
    } as DOMRect);
    document.body.append(fixture.nativeElement);
    button.focus();
    await expect.poll(() => gpu.images.some((image) => image.onload !== null)).toBe(true);
    gpu.images.find((image) => image.onload)!.dispatchEvent(new Event('load'));
    gpu.flush();
    const imageCount = gpu.images.length;
    const textureCount = gpu.gl.createTexture.mock.calls.length;
    fixture.componentInstance.strength.set(0.4);
    await fixture.whenStable();
    gpu.flush();
    expect(gpu.images).toHaveLength(imageCount);
    expect(gpu.gl.createTexture).toHaveBeenCalledTimes(textureCount);
    expect(gpu.gl.uniform1f).toHaveBeenCalledWith(expect.anything(), 0.4);
    expect(canvas.hasAttribute('data-rendered')).toBe(true);
    expect(fixture.nativeElement.querySelector('button')).toBe(button);
    expect(document.activeElement).toBe(button);
    const glCanvas = gpu.canvases.find((element) => element !== canvas)!;
    glCanvas.dispatchEvent(new Event('webglcontextlost', { cancelable: true }));
    expect(canvas.hasAttribute('data-rendered')).toBe(false);
    expect(fixture.nativeElement.querySelector('button')).toBe(button);
    expect(document.activeElement).toBe(button);
    tier.set('medium');
    await fixture.whenStable();
    expect(canvas.hasAttribute('data-rendered')).toBe(false);
    expect(fixture.nativeElement.querySelector('.fallback')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('button')).toBe(button);
    expect(document.activeElement).toBe(button);
    fixture.destroy();
  });

  it.each(['medium', 'low'])(
    'retains baseline content without initializing graphics at %s fidelity',
    async (value) => {
      const gpu = graphics();
      TestBed.configureTestingModule({
        providers: [{ provide: HyFidelity, useValue: { tier: signal(value) } }],
      });
      const fixture = TestBed.createComponent(RefractionFixture);
      await fixture.whenStable();
      expect(fixture.nativeElement.querySelector('button').textContent).toBe('Continue');
      expect(fixture.nativeElement.querySelector('.fallback')).not.toBeNull();
      expect(gpu.gl.createProgram).not.toHaveBeenCalled();
      fixture.destroy();
    },
  );

  it('restores fallback on tier downgrade without replacing the canvas or focused control', async () => {
    const gpu = graphics();
    const tier = signal('high');
    TestBed.configureTestingModule({ providers: [{ provide: HyFidelity, useValue: { tier } }] });
    const fixture = TestBed.createComponent(RefractionFixture);
    await fixture.whenStable();
    document.body.append(fixture.nativeElement);
    const canvas: HTMLCanvasElement = fixture.nativeElement.querySelector('canvas');
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    button.focus();
    vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({
      width: 100,
      height: 80,
    } as DOMRect);
    await expect.poll(() => gpu.images.some((image) => image.onload !== null)).toBe(true);
    gpu.images.find((image) => image.onload)!.dispatchEvent(new Event('load'));
    gpu.flush();
    expect(canvas.hasAttribute('data-rendered')).toBe(true);
    tier.set('low');
    await fixture.whenStable();
    expect(canvas.hasAttribute('data-rendered')).toBe(false);
    expect(gpu.gl.deleteTexture).toHaveBeenCalledTimes(1);
    expect(fixture.nativeElement.querySelector('canvas')).toBe(canvas);
    expect(fixture.nativeElement.querySelector('button')).toBe(button);
    expect(document.activeElement).toBe(button);
    fixture.destroy();
  });

  it('disconnects resize observation on removal and retains fallback without WebGL', async () => {
    const gpu = graphics();
    const observe = vi.fn();
    const disconnect = vi.fn();
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe = observe;
        disconnect = disconnect;
      },
    );
    const service = TestBed.inject(HyRefractionRenderer);
    const target = gpu.target();
    const remove = await service.register(target);
    expect(observe).toHaveBeenCalledWith(target.canvas);
    remove();
    expect(disconnect).toHaveBeenCalledTimes(1);
    TestBed.resetTestingModule();
    await Promise.resolve();
    vi.mocked(HTMLCanvasElement.prototype.getContext).mockReturnValue(null);
    const unavailable = TestBed.inject(HyRefractionRenderer);
    const fallback = gpu.target();
    (await unavailable.register(fallback))();
    expect(fallback.canvas.hasAttribute('data-rendered')).toBe(false);
    expect(observe).toHaveBeenCalledTimes(1);
  });

  it('coalesces redraws, bounds backing resolution, and does not run a continuous loop', () => {
    const gpu = graphics();
    const renderer = new RefractionRenderer(document);
    const target = gpu.target();
    vi.mocked(target.canvas.getBoundingClientRect).mockReturnValue({
      width: 4000,
      height: 3000,
    } as DOMRect);
    renderer.register(target);
    gpu.images[0]!.dispatchEvent(new Event('load'));
    renderer.draw();
    renderer.draw();
    expect(gpu.frames.size).toBe(1);
    gpu.flush();
    expect(gpu.gl.drawArrays).toHaveBeenCalledTimes(1);
    expect(target.canvas.width).toBe(2048);
    expect(target.canvas.height).toBe(2048);
    expect(gpu.frames.size).toBe(0);
    renderer.destroy();
  });

  it('discards a pending image after unregister and cancels the final queued draw', () => {
    const gpu = graphics();
    const renderer = new RefractionRenderer(document);
    const target = gpu.target();
    const remove = renderer.register(target);
    const lateLoad = gpu.images[0]!.onload!;
    renderer.draw();
    remove();
    lateLoad.call(gpu.images[0]!, new Event('load'));
    gpu.flush();
    expect(gpu.gl.createTexture).not.toHaveBeenCalled();
    expect(gpu.frames.size).toBe(0);
    expect(target.canvas.hasAttribute('data-rendered')).toBe(false);
    renderer.destroy();
  });

  it('keeps fallback and deletes the texture if image upload is rejected', () => {
    const gpu = graphics();
    const renderer = new RefractionRenderer(document);
    const target = gpu.target();
    const remove = renderer.register(target);
    gpu.gl.texImage2D.mockImplementation(() => {
      throw new Error('CORS upload denied');
    });
    gpu.images[0]!.dispatchEvent(new Event('load'));
    gpu.flush();
    expect(target.canvas.hasAttribute('data-rendered')).toBe(false);
    expect(gpu.gl.deleteTexture).toHaveBeenCalledTimes(1);
    expect(gpu.gl.drawArrays).not.toHaveBeenCalled();
    remove();
    renderer.destroy();
    expect(gpu.gl.deleteTexture).toHaveBeenCalledTimes(1);
  });

  it('does not initialize graphics when its injector is destroyed during lazy loading', async () => {
    const gpu = graphics();
    const service = TestBed.inject(HyRefractionRenderer);
    const pending = service.register(gpu.target());
    TestBed.resetTestingModule();
    const remove = await pending;
    remove();
    expect(gpu.canvases).toHaveLength(0);
    expect(gpu.images).toHaveLength(0);
    await service.register(gpu.target());
    expect(gpu.canvases).toHaveLength(0);
  });

  it('restores fallback and releases resources exactly once on destroy', () => {
    const gpu = graphics();
    const renderer = new RefractionRenderer(document);
    const target = gpu.target();
    const remove = renderer.register(target);
    gpu.images[0]!.dispatchEvent(new Event('load'));
    gpu.flush();
    expect(target.canvas.hasAttribute('data-rendered')).toBe(true);
    renderer.draw();
    expect(gpu.frames.size).toBe(1);
    renderer.destroy();
    expect(target.canvas.hasAttribute('data-rendered')).toBe(false);
    expect(target.canvas.width).toBe(0);
    expect(gpu.frames.size).toBe(0);
    expect(gpu.images[0]!.onload).toBeNull();
    remove();
    remove();
    renderer.destroy();
    renderer.draw();
    expect(gpu.gl['deleteTexture']).toHaveBeenCalledTimes(1);
    expect(gpu.gl['deleteBuffer']).toHaveBeenCalledTimes(1);
    expect(gpu.gl['deleteProgram']).toHaveBeenCalledTimes(1);
    expect(loseContext).toHaveBeenCalledTimes(1);
    expect(gpu.frames.size).toBe(0);
    renderer.register(gpu.target())();
    expect(gpu.images).toHaveLength(1);
  });

  it('shares a renderer, then creates a fresh renderer for registration after context loss', async () => {
    const gpu = graphics();
    const service = TestBed.inject(HyRefractionRenderer);
    const first = gpu.target();
    const second = gpu.target();
    const removeFirst = await service.register(first);
    const removeSecond = await service.register(second);
    expect(gpu.canvases).toHaveLength(1);
    gpu.images.forEach((image) => image.dispatchEvent(new Event('load')));
    gpu.flush();
    expect(first.canvas.hasAttribute('data-rendered')).toBe(true);
    const lost = new Event('webglcontextlost', { cancelable: true });
    gpu.canvases[0]!.dispatchEvent(lost);
    expect(lost.defaultPrevented).toBe(true);
    expect(first.canvas.hasAttribute('data-rendered')).toBe(false);
    expect(second.canvas.hasAttribute('data-rendered')).toBe(false);
    const third = gpu.target();
    const fourth = gpu.target();
    const [removeThird, removeFourth] = await Promise.all([
      service.register(third),
      service.register(fourth),
    ]);
    expect(gpu.canvases).toHaveLength(2);
    gpu.images.slice(-2).forEach((image) => image.dispatchEvent(new Event('load')));
    gpu.flush();
    expect(third.canvas.hasAttribute('data-rendered')).toBe(true);
    removeFirst();
    removeSecond();
    removeThird();
    removeFourth();
  });
});
