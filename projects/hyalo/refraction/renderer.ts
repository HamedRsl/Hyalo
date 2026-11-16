/** One WebGL context shared by all surfaces; each surface receives a 2D copy. */
export interface RefractionTarget {
  readonly canvas: HTMLCanvasElement;
  readonly src: string;
  readonly strength: () => number;
}
interface Surface {
  readonly target: RefractionTarget;
  readonly image: HTMLImageElement;
  texture: WebGLTexture | null;
  ready: boolean;
}
export class RefractionRenderer {
  private readonly canvas: HTMLCanvasElement;
  private readonly gl: WebGLRenderingContext;
  private readonly program: WebGLProgram;
  private readonly buffer: WebGLBuffer | null;
  private readonly uniforms: Record<string, WebGLUniformLocation | null>;
  private readonly surfaces = new Set<Surface>();
  private frame = 0;
  private lost = false;
  private readonly onLost = (event: Event): void => {
    event.preventDefault();
    this.lost = true;
    this.stop();
    for (const surface of this.surfaces) {
      surface.target.canvas.width = 0;
      surface.target.canvas.removeAttribute('data-rendered');
    }
  };

  constructor(private readonly document: Document) {
    this.canvas = document.createElement('canvas');
    const gl = this.canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false });
    if (!gl) throw new Error('WebGL unavailable');
    this.gl = gl;
    const vertex = this.shader(
      gl.VERTEX_SHADER,
      'attribute vec2 p; varying vec2 uv; void main(){ uv=(p+1.0)*0.5; gl_Position=vec4(p,0.0,1.0); }',
    );
    const fragment = this.shader(
      gl.FRAGMENT_SHADER,
      `
      precision mediump float;
      varying vec2 uv;
      uniform sampler2D image;
      uniform float strength;
      uniform float aspect;
      uniform float imageAspect;
      void main(){
        vec2 q=uv;
        float edge=pow(abs(q.x-0.5)*2.0,8.0)+pow(abs(q.y-0.5)*2.0,8.0);
        q+=(q-0.5)*edge*strength;
        if(aspect>imageAspect) q.y=(q.y-0.5)*imageAspect/aspect+0.5;
        else q.x=(q.x-0.5)*aspect/imageAspect+0.5;
        vec4 color=texture2D(image,clamp(q,0.001,0.999));
        gl_FragColor=vec4(color.rgb+edge*0.07,color.a);
      }`,
    );
    const program = gl.createProgram();
    if (!program) throw new Error('WebGL program unavailable');
    this.program = program;
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('WebGL link failed');
    gl.useProgram(program);
    const buffer = gl.createBuffer();
    this.buffer = buffer;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'p');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    this.uniforms = Object.fromEntries(
      ['image', 'strength', 'aspect', 'imageAspect'].map((name) => [
        name,
        gl.getUniformLocation(program, name),
      ]),
    );
    this.canvas.addEventListener('webglcontextlost', this.onLost);
    // Keep CSS fallback after a context loss. A new renderer is created on the next registration.
  }
  private shader(kind: number, source: string): WebGLShader {
    const shader = this.gl.createShader(kind);
    if (!shader) throw new Error('WebGL shader unavailable');
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      this.gl.deleteShader(shader);
      throw new Error('WebGL compilation failed');
    }
    return shader;
  }
  register(target: RefractionTarget): () => void {
    const image = this.document.createElement('img');
    image.crossOrigin = 'anonymous';
    const surface: Surface = { target, image, texture: null, ready: false };
    this.surfaces.add(surface);
    image.onload = (): void => {
      if (!this.surfaces.has(surface) || this.lost) return;
      const gl = this.gl;
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
      try {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        surface.texture = texture;
        surface.ready = true;
      } catch {
        gl.deleteTexture(texture);
      }
      this.draw();
    };
    image.src = target.src;
    return (): void => {
      this.surfaces.delete(surface);
      image.onload = null;
      if (surface.texture) this.gl.deleteTexture(surface.texture);
      target.canvas.width = 0;
      target.canvas.removeAttribute('data-rendered');
      if (!this.surfaces.size) this.stop();
    };
  }
  /** Render only on load, resize or an input change. Refraction itself is stationary. */
  draw(): void {
    if (this.frame || this.lost) return;
    this.frame =
      this.document.defaultView?.requestAnimationFrame(() => {
        this.frame = 0;
        const measured = [...this.surfaces]
          .filter((surface) => surface.ready && surface.target.canvas.isConnected)
          .map((surface) => ({ surface, rect: surface.target.canvas.getBoundingClientRect() }));
        for (const { surface, rect } of measured) this.render(surface, rect);
      }) ?? 0;
  }
  private render(surface: Surface, rect: DOMRect): void {
    if (!surface.ready || !surface.texture) return;
    const { canvas } = surface.target;
    if (rect.width <= 0 || rect.height <= 0) return;
    const dpr = Math.min(this.document.defaultView?.devicePixelRatio ?? 1, 2);
    const width = Math.min(2048, Math.round(rect.width * dpr)),
      height = Math.min(2048, Math.round(rect.height * dpr));
    if (this.canvas.width !== width) this.canvas.width = width;
    if (this.canvas.height !== height) this.canvas.height = height;
    const gl = this.gl;
    gl.viewport(0, 0, width, height);
    gl.useProgram(this.program);
    gl.bindTexture(gl.TEXTURE_2D, surface.texture);
    gl.uniform1i(this.uniforms['image'] ?? null, 0);
    gl.uniform1f(
      this.uniforms['strength'] ?? null,
      Math.max(0, Math.min(1, surface.target.strength())),
    );
    gl.uniform1f(this.uniforms['aspect'] ?? null, width / height);
    gl.uniform1f(
      this.uniforms['imageAspect'] ?? null,
      surface.image.naturalWidth / surface.image.naturalHeight,
    );
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    if (canvas.width !== width) canvas.width = width;
    if (canvas.height !== height) canvas.height = height;
    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(this.canvas, 0, 0);
      canvas.setAttribute('data-rendered', '');
    }
  }
  private stop(): void {
    this.document.defaultView?.cancelAnimationFrame(this.frame);
    this.frame = 0;
  }
  destroy(): void {
    this.lost = true;
    this.stop();
    for (const surface of this.surfaces) {
      surface.image.onload = null;
      if (surface.texture) this.gl.deleteTexture(surface.texture);
    }
    this.surfaces.clear();
    this.canvas.removeEventListener('webglcontextlost', this.onLost);
    this.gl.deleteBuffer(this.buffer);
    this.gl.deleteProgram(this.program);
    this.gl.getExtension('WEBGL_lose_context')?.loseContext();
  }
}
