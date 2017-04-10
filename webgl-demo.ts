/**
 * Sample WebGL + TypeScript demo class
 * 
 * Tadeusz Puźniakowski 2017
 * 
 * MIT license
 * 
 */



class WebGlStlTP {
  canvas: HTMLCanvasElement;
  gl: WebGLRenderingContext;
  triangleVerticesBuffer: WebGLBuffer;
  triangleVerticesBufferSize: number; // the size of the buffer - necessary for drawing trinagleVerticesBuffer
  shaderProgram: WebGLProgram;
  vertexPositionAttribute: number;

  fragmentShaderSrc = `
precision mediump float;
varying vec4 v_color;
void main(void) {
   gl_FragColor = v_color;
}`;
  vertexShaderSrc = `
attribute vec3 a_position;
uniform vec2 u_resolution; // canvas resolution
varying vec4 v_color;
void main() {
  vec2 p2 = vec2(a_position[0],a_position[1]) / vec2(u_resolution[0],u_resolution[1]) * 2.0 - 1.0;
  gl_Position = vec4(p2, a_position[2], 1);
  v_color = vec4(1.0-a_position[2],1.0-a_position[2],1.0-a_position[2],1);
}`;

  /* this draws to canvas element, it is not quite 'hello world', but it allows you to get image data */
  getImageAsDataUrl(dstCanvas: HTMLCanvasElement): string {
    var pixels = new Uint8Array(this.gl.drawingBufferWidth * this.gl.drawingBufferHeight * 4);
    this.gl.readPixels(0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight, this.gl.RGBA, this.gl.UNSIGNED_BYTE, pixels);

    var ctx = dstCanvas.getContext('2d');
    ctx.canvas.width = this.canvas.width;
    ctx.canvas.height = this.canvas.height;
    ctx.drawImage(this.gl.canvas, 0, 0, this.canvas.width, this.canvas.height,
      0, 0, this.canvas.width, this.canvas.height);
    return ctx.canvas.toDataURL();
  };

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    try {
      this.gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
      if (!this.gl) {
        alert("Error getting WebGL context - check if your browser supports it");
      }
      if (this.gl) {
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this.gl.clearDepth(1.0);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.depthFunc(this.gl.LEQUAL);
        this.initShaders();
        this.triangleVerticesBuffer = this.gl.createBuffer();
        this.setVertices([]);
        this.drawScene();
      }
    } catch (e) {
      this.gl = null;
    }

  }
  setVertices(v: number[]) {
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.triangleVerticesBuffer);
    this.triangleVerticesBufferSize = v.length / 3;
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(v), this.gl.STATIC_DRAW);
  }

  drawScene() {
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    var resolutionUniformLocation = this.gl.getUniformLocation(this.shaderProgram, "u_resolution");
    this.gl.uniform2f(resolutionUniformLocation, this.gl.canvas.width, this.gl.canvas.height);

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.triangleVerticesBuffer);
    this.gl.vertexAttribPointer(this.vertexPositionAttribute, 3, this.gl.FLOAT, false, 0, 0);
    this.gl.drawArrays(this.gl.TRIANGLES, 0, this.triangleVerticesBufferSize);
  }

  initShaders() {
    let fragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
    this.gl.shaderSource(fragmentShader, this.fragmentShaderSrc);
    this.gl.compileShader(fragmentShader);
    if (!this.gl.getShaderParameter(fragmentShader, this.gl.COMPILE_STATUS)) {
      alert("An error occurred compiling fragmentShader: " + this.gl.getShaderInfoLog(fragmentShader));
      return null;
    }
    let vertexShader = this.gl.createShader(this.gl.VERTEX_SHADER);
    this.gl.shaderSource(vertexShader, this.vertexShaderSrc);
    this.gl.compileShader(vertexShader);
    if (!this.gl.getShaderParameter(vertexShader, this.gl.COMPILE_STATUS)) {
      alert("An error occurred compiling vertexShader: " + this.gl.getShaderInfoLog(vertexShader));
      return null;
    }

    this.shaderProgram = this.gl.createProgram();

    this.gl.attachShader(this.shaderProgram, vertexShader);
    this.gl.attachShader(this.shaderProgram, fragmentShader);
    this.gl.linkProgram(this.shaderProgram);

    if (!this.gl.getProgramParameter(this.shaderProgram, this.gl.LINK_STATUS)) {
      alert("Unable to initialize the shader program: " + this.gl.getProgramInfoLog(this.shaderProgram));
    }

    this.gl.useProgram(this.shaderProgram);

    this.vertexPositionAttribute = this.gl.getAttribLocation(this.shaderProgram, "a_position");
    this.gl.enableVertexAttribArray(this.vertexPositionAttribute);
  }

};


var cel: WebGlStlTP;
function start() {
  cel = new WebGlStlTP(<HTMLCanvasElement>document.getElementById("glcanvas"));
  cel.setVertices(
    [
      50, 40, 0.0,
      80, 300, 1.0,
      50, 0, 0.0,

      50, 40, 0.0,
      90, 30, 1.0,
      60, 0.0, 1.0
    ]
  );
  cel.drawScene();

}

function clickHandle() {
  cel.setVertices(
    [
      10, 40, 0.0,
      20, 300, 1.0,
      10, 0, 0.0,
    ]
  );
  var canvas = (<HTMLCanvasElement>document.getElementById("glcanvas"));
  canvas.width = 320;
  canvas.height = 240;
  cel.drawScene();
}
