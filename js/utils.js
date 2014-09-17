

function initVertexBuffer()
{
  vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  var verts = [
    1.0, 1.0, 0.0,
    -1.0, 1.0, 0.0,
    1.0, -1.0, 0.0,
    -1.0, -1.0, 0.0
  ];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
  vertexBuffer.vertSize = 3;
  vertexBuffer.nVerts = 4;
  vertexBuffer.primType = gl.TRIANGLE_STRIP;

  gl.bindBuffer(gl.ARRAY_BUFFER, null);
}


function initTexCoords()
{
  texCoordsBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordsBuffer);

  var texCoords = [0.0, 0.0,
                    1.0, 0.0,
                    0.0, 1.0,
                    1.0, 1.0
                    ];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);
  texCoordsBuffer.itemSize = 2;
  texCoordsBuffer.numItems = 4;

  gl.bindBuffer(gl.ARRAY_BUFFER, null);
}


function initMatrices(canvas)
{
  // create model view matrix
  modelViewMatrix = mat4.create();
  mat4.translate(modelViewMatrix, modelViewMatrix, [0, 0, -1.1]);
    // var eye = [2.0, 1.0, 3.0];
    // var center = [0.0, 0.0, 0.0];
    // var up = [0.0, 0.0, -1.0];
    // modelViewMatrix = mat4.create();
    // mat4.lookAt(modelViewMatrix, eye, center, up);

    // projectionMatrix = mat4.create();
    // mat4.perspective(projectionMatrix, 45.0, 0.5, 0.1, 100.0);
  // create a projection matrix with 45 degree field of view
  projectionMatrix = mat4.create();
  mat4.perspective(projectionMatrix, Math.PI / 4,
                    canvas.width / canvas.height, 1, 10000);
}

function createShader(gl, str, type)
{
  var shader;

  if (type == "fragment") {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  }
  else if (type == "vertex") {
    shader = gl.createShader(gl.VERTEX_SHADER);
  }
  else {
    return null;
  }

  gl.shaderSource(shader, str);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.log("error compiling shader: " + gl.getShaderInfoLog(shader));
    return null;
  }

  return shader;
}


var vertexShaderSource =
  "precision highp float;\n" +
  "   attribute vec3 vertexPos;\n" +
  "   attribute vec2 aTextureCoord;\n" +
  "   uniform mat4 modelViewMatrix;\n"+
  "   uniform mat4 projectionMatrix;\n"+
  "   varying vec2 vTextureCoord;\n" +
  "   void main(void) {\n" +
  "     vTextureCoord = aTextureCoord;\n" +
  "     // return the transformed and projected vertex value\n" +
  "     gl_Position = projectionMatrix * modelViewMatrix * \n" +
  "       vec4(vertexPos, 1.0);\n" +
  "   }\n";


var fragmentShaderSource =
"precision highp float;\n" +
 
 "varying highp vec2 vTextureCoord;\n" +
 
 "uniform float thresholdSensitivity;\n" +
 "uniform float smoothing;\n" +
 "uniform vec3 colorToReplace;\n" +
 "uniform sampler2D uSampler;\n" +
 
 "void main(void)\n" +
 "{\n" +
"     vec4 textureColor = texture2D(uSampler, vTextureCoord);\n"+
     
     "float maskY = 0.2989 * colorToReplace.r + 0.5866 * colorToReplace.g + 0.1145 * colorToReplace.b;\n"+
     "float maskCr = 0.7132 * (colorToReplace.r - maskY);\n"+
     "float maskCb = 0.5647 * (colorToReplace.b - maskY);\n"+
     
     "float Y = 0.2989 * textureColor.r + 0.5866 * textureColor.g + 0.1145 * textureColor.b;\n"+
     "float Cr = 0.7132 * (textureColor.r - Y);\n"+
     "float Cb = 0.5647 * (textureColor.b - Y);\n"+
     
     "//float blendValue = 1.0 - smoothstep(thresholdSensitivity - smoothing, thresholdSensitivity , abs(Cr - maskCr) + abs(Cb - maskCb));\n"+
     "float blendValue = smoothstep(thresholdSensitivity, thresholdSensitivity + smoothing, distance(vec2(Cr, Cb), vec2(maskCr, maskCb)));\n"+
     "//if (blendValue < 0.8) { blendValue = 0.0; }\n" +
     "//else if (blendValue < 0.6) {\n"+
     "//  textureColor = vec4(0.0, 0.0, 0.0, 0.2);\n"+
     "//}\n"+
     "gl_FragColor = vec4(textureColor.rgb, textureColor.a * blendValue);\n"+
 "}\n";




var fragmentShaderSourceNormal =
  "precision mediump float;\n" +
  "   varying vec2 vTextureCoord;\n" +
  "   uniform sampler2D uSampler;\n" +

  "   void main(void) {\n" +
  "     // Return the pixel color: always output white\n" +
  "     gl_FragColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));\n" +
  // "     gl_FragColor = vec4(vTextureCoord.s, vTextureCoord.t, 1.0, 0.5);\n" +
  "   }\n";

var shaderProgram, shaderVertexPosAttr, shaderProjectionMatUni, shaderModelViewMatUni;

function initShader() {

  var fragmentShader = createShader(gl, fragmentShaderSource, "fragment");
  var vertexShader = createShader(gl, vertexShaderSource, "vertex");

  // link them together into a new program
  shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // get pointers to the shader params
  shaderProgram.vertexPosAttr = gl.getAttribLocation(shaderProgram, "vertexPos");
  shaderProgram.aTextureCoord = gl.getAttribLocation(shaderProgram, "aTextureCoord");
  console.log("vertexPosAttr = " + shaderProgram.vertexPosAttr);
  console.log("aTextureCoord = " + shaderProgram.aTextureCoord);

  gl.enableVertexAttribArray(shaderProgram.vertexPosAttr);
  gl.enableVertexAttribArray(shaderProgram.aTextureCoord);

  shaderProgram.projectionMatUni = gl.getUniformLocation(shaderProgram, "projectionMatrix");
  shaderProgram.modelViewMatUni = gl.getUniformLocation(shaderProgram, "modelViewMatrix");

  shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
  shaderProgram.thresholdSensitivity = gl.getUniformLocation(shaderProgram, "thresholdSensitivity");
  shaderProgram.smoothing = gl.getUniformLocation(shaderProgram, "smoothing");
  shaderProgram.colorToReplace = gl.getUniformLocation(shaderProgram, "colorToReplace");

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    console.log("could not get initialize shader");
  }
}



function initTexture()
{
  texture = gl.createTexture();

  // bind texture
  gl.bindTexture(gl.TEXTURE_2D, texture);
  // gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  // unbind
  gl.bindTexture(gl.TEXTURE_2D, null);
}
