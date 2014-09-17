
ResourceManager = function()
{
	this.materials = {};
	// this.models = {};
}
ResourceManager.prototype.constructor = ResourceManager;

ResourceManager.prototype.initMaterials = function()
{
	this.materials.white = new THREE.MeshLambertMaterial( { color: 0xffffff, ambient: 0xffffff } );
	this.materials.lightGray = new THREE.MeshLambertMaterial( { color: 0xdddddd, ambient: 0xaaaaaa } );
	this.materials.gray = new THREE.MeshLambertMaterial( { color: 0x444444, ambient: 0x222222 } );
	this.materials.black = new THREE.MeshLambertMaterial( { color: 0x0, ambient: 0x0 } );
	this.materials.screenBack = new THREE.MeshLambertMaterial( { color: 0x222222, ambient: 0x111111 } );

	// this.materials.floor = new THREE.MeshLambertMaterial( { color: 0xC49756, ambient: 0xC49756 } );
	this.materials.floor = new THREE.MeshLambertMaterial( { color: 0xC6B263, ambient: 0xC6B263 } );
	this.materials.walls = new THREE.MeshLambertMaterial( { color: 0xE6D283, ambient: 0xE6D283 } );

	// this.materials.object = new THREE.MeshPhongMaterial( { ambient: 0x030303, specular: 0xc0c0c0, shininess: 25 } );
	this.materials.object = new THREE.MeshPhongMaterial( { ambient: 0x050505, specular: 0xc0c0c0, shininess: 50 } );
	this.materials.object.shading = THREE.FlatShading;

	this.materials.red = new THREE.MeshLambertMaterial( { color: 0xaa0000, ambient: 0xaa0000 } );
	this.materials.green = new THREE.MeshLambertMaterial( { color: 0x00aa00, ambient: 0x00aa00 } );
	this.materials.led = new THREE.MeshLambertMaterial( { color: 0x990000, ambient: 0x990000 } );

	this.materials.rcstand = new THREE.MeshPhongMaterial( {color: 0xffffff, ambient: 0xffffff, specular: 0xffffff} );
	this.materials.rcstand.shading = THREE.FlatShading;


//	this.materials.sofa = new THREE.MeshLambertMaterial( { color: 0x85724E, ambient: 0x85724E } );


	/* init colors */
	// this.materials.colors = [];
	// for (var i=0; i<16; i++)
	// {
	// 	var c = new THREE.Color();
	// 	var ca = new THREE.Color();

	// 	c.setHSL(map(i, 0, 12, 1, 0.5), 0.5, 0.5);
	// 	ca.setHSL(map(i, 0, 12, 1, 0.5), 0.5, 0.3);

	// 	this.materials.colors[i] = new THREE.MeshLambertMaterial( { color: c, ambient: ca } );
	// 	//this.materials.colors[i] = new THREE.MeshBasicMaterial( { color: c } );
	// }

	// this.materials.basic = new THREE.MeshBasicMaterial( {color:0xdddddd });

	// create shader material
	// this.initShader();
}

ResourceManager.prototype.loadResources = function(whenFinished)
{
	whenFinished();

	return;

    // load sofa
    // var manager = new THREE.LoadingManager();
    //             manager.onProgress = function ( item, loaded, total ) {

    //                 console.log( item, loaded, total );
    //                 if (loaded == total) {
    //                 	finishedFunc();
    //                 }
    //             };

    // var loader = new THREE.OBJLoader(manager);
    // loader.load("models/sofa.obj", function(object) {
    //     object.traverse(function (child) {
    //         if (child instanceof THREE.Mesh) {
    //         	child.material = resMgr.materials.sofa;
    //         	child.castShadow = true;
    //         	child.receiveShadow = true;
    //         }
    //     });

    //     resMgr.models.sofa = object;
    //     resMgr.models.sofa.scale.set(0.1, 0.1, 0.1);
    // });	
}

ResourceManager.prototype.initShader = function()
{
	var sprite = generateSprite();
	console.log(sprite);
	var texture = new THREE.Texture(sprite);
	texture.needsUpdate = true;

	uniforms = {
		texture: { type: 't', value: texture },
		time: {type: 'f', value: 0},
		ugreen: {type: 'f', value: 0}
	};

	attributes = {
		size:  { type: 'f', value: [] },
		pcolor: { type: 'c', value: [] },
		pgreen: {type: 'f', value: []}
	};

	// fill size and color values
	var sizes = attributes.size.value;
	var pcolors = attributes.pcolor.value;
	var pgreens = attributes.pgreen.value;
	for (var v=0; v<10000; v++)
	{
		sizes[v] = Math.random();
		pgreens[v] = 0;
		pcolors[v] = new THREE.Color(0x0000ff);
	}


	var vertexProgram = 
		"uniform float time;" +
		"attribute float size;" +
		"attribute vec3 pcolor;" +
		"attribute float pgreen;" +
		"varying vec3 vColor;" +
		"varying float vHeight;" +
		"varying float vGreen;" +
		"varying vec3 vNormal;" +
		"" +
		"void main() {" +
		"	vColor = pcolor;" +
		"   vGreen = pgreen;" +
		"   vNormal = normal;" +
		"   float disp = size * time * 10.0;" +
		"   vHeight = size * time;" +
		"   vec3 newPosition = position + normal * vec3(disp);" +
		"	vec4 mvPosition = modelViewMatrix * vec4( newPosition, 1.0 );" +
		"	gl_Position = projectionMatrix * mvPosition;" +
		"}";

	var fragmentProgram = 
		"uniform sampler2D texture;" +
		"uniform float ugreen;" +
		"varying vec3 vColor;" +
		"varying float vHeight;" +
		"varying float vGreen;" +
		"varying vec3 vNormal;" +
		"" +
		"void main() {" +
		"	vec4 outColor = texture2D( texture, gl_PointCoord );" +
		"vec3 light = vec3(0.5,0.2,1.0);" +
  		"light = normalize(light);" +
  		"float dProd = max(0.0, dot(vNormal, light));" +
  		"gl_FragColor = vec4(dProd, dProd, dProd, 1.0);" + 
//		"	gl_FragColor = vec4(0.0, vGreen, 0.7, 1.0);" +
		"}";

	console.log("vertex shader: " + document.getElementById('vertexshader').textContent);

	this.materials.shader = new THREE.ShaderMaterial( 
	{
		uniforms: uniforms,
		attributes: attributes,

		vertexShader: vertexProgram,
		fragmentShader: fragmentProgram,

		blending: THREE.AdditiveBlending,
		depthWrite: true,
		transparent: false
	} );

}

function generateSprite() {

	var canvas = document.createElement( 'canvas' );
	canvas.width = 128;
	canvas.height = 128;

	var context = canvas.getContext( '2d' );


	// Just a square, doesnt work too bad with blur pp.
	// context.fillStyle = "white";
	// context.strokeStyle = "white";
	// context.fillRect(0, 0, 63, 63) ;

	// Heart Shapes are not too pretty here
	// var x = 4, y = 0;
	// context.save();
	// context.scale(8, 8); // Scale so canvas render can redraw within bounds
	// context.beginPath();
	// context.bezierCurveTo( x + 2.5, y + 2.5, x + 2.0, y, x, y );
	// context.bezierCurveTo( x - 3.0, y, x - 3.0, y + 3.5,x - 3.0,y + 3.5 );
	// context.bezierCurveTo( x - 3.0, y + 5.5, x - 1.0, y + 7.7, x + 2.5, y + 9.5 );
	// context.bezierCurveTo( x + 6.0, y + 7.7, x + 8.0, y + 5.5, x + 8.0, y + 3.5 );
	// context.bezierCurveTo( x + 8.0, y + 3.5, x + 8.0, y, x + 5.0, y );
	// context.bezierCurveTo( x + 3.5, y, x + 2.5, y + 2.5, x + 2.5, y + 2.5 );

	context.beginPath();
	context.arc( 64, 64, 60, 0, Math.PI * 2, false) ;

	context.lineWidth = 0.5; //0.05
	context.stroke();
	context.restore();

	var gradient = context.createRadialGradient( canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2 );

	gradient.addColorStop( 0, 'rgba(255,255,255,1)' );
	gradient.addColorStop( 0.2, 'rgba(255,255,255,1)' );
	gradient.addColorStop( 0.4, 'rgba(200,200,200,1)' );
	gradient.addColorStop( 1, 'rgba(0,0,0,1)' );

	context.fillStyle = gradient;

	context.fill();

	return canvas;
};




