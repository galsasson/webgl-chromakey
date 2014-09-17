navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

var videoStream;
var video;
var canvas;
var gl;
var context;

var projectionMatrix;
var modelViewMatrix;
var texture;

var vertexBuffer;
var texCoordsBuffer;

var image;

function onLoad()
{
  canvas = document.getElementById("videoCanvas");
  function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
    }
  resizeCanvas();
  
  gl = getWebGLContext(canvas);

  // get line video
	navigator.getUserMedia({audio: false, video: true}, startVideo, noVideo);
  // loadImage();
}

function initGL()
{

  initMatrices(canvas);
  console.log("canvas size: " + canvas.width + "x" + canvas.height);
  console.log("video size: " + video.videoWidth + "x" + video.videoHeight);
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  initShader();

  initTexture();

  initVertexBuffer();
  initTexCoords();

  // if (video != undefined) {
  // }
  // else {
    loop();
  // }
}

function render()
{
  // gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
//  canvas.draw
  gl.clearColor(0.0, 0.0, 0.0, 0.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // bind the texture
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);




  gl.useProgram(shaderProgram);

  // bind the object buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexPosAttr, vertexBuffer.vertSize, gl.FLOAT, false, 0, 0);
  // bind the texture coords buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordsBuffer);
  gl.vertexAttribPointer(shaderProgram.aTextureCoord, texCoordsBuffer.itemSize, gl.FLOAT, false, 0, 0);

  // pass parameters to shader
  gl.uniformMatrix4fv(shaderProgram.projectionMatUni, false, projectionMatrix);
  gl.uniformMatrix4fv(shaderProgram.modelViewMatUni, false, modelViewMatrix);
  
  gl.uniform1i(shaderProgram.samplerUniform, 0);
  gl.uniform1f(shaderProgram.thresholdSensitivity, 0.1);
  gl.uniform1f(shaderProgram.smoothing, 0.3);
  gl.uniform3f(shaderProgram.colorToReplace, 0.1, 0.8, 0.1);

  // draw the object
  gl.drawArrays(vertexBuffer.primType, 0, vertexBuffer.nVerts);

  gl.bindTexture(gl.TEXTURE_2D, null);
}

function loop()
{
  window.requestAnimationFrame(loop);
  render();
}

function startVideo(stream)
{
  videoStream = stream;
  	// init video object
	video = document.createElement("video");
  // video = document.getElementById("video");
	video.autoplay = true;
  video.src = webkitURL.createObjectURL(stream);

  video.addEventListener("canplaythrough", initGL, true);


  // initGL();
  // $("#video").append(video);
}

function loadImage()
{
  // load image
  image = new Image();
  image.src = "img/view2.jpg";

  image.onload = initGL;

  // initGL();  
}



function noVideo()
{
  console.log("user cancelled line video");
}



function getWebGLContext(canvas)
{
  var webGLContext;

  /* Context name can differ according to the browser used */
  /* Store the context name in an array and check its validity */
  var names = ["experimental-webgl", "webgl", "webkit-3d", "moz-webgl"];
  for (var i = 0; i < names.length; ++i)
  {
     try
     {
        webGLContext = canvas.getContext(names[i]);
     }
     catch(err) {
       console.log("error: " + err);
     }
     if (webGLContext) break;
  }

  return webGLContext;
}
