main();

function main() {

	/*
	* --------------------------------------------------------------------------------------------
	* Initialization
	* --------------------------------------------------------------------------------------------
	*/

	const canvas = document.querySelector('#glcanvas');
	const gl = canvas.getContext('webgl2');

	// make sure we have a gl context
	if (!gl) {
		alert('Unable to initialize WebGL. Your browser or machine may not support it.');
		return;
	}
	
	
	/*
	* --------------------------------------------------------------------------------------------
	* Creating the Vertex shader, Fragment shader and the shader program
	* --------------------------------------------------------------------------------------------
	*/

	// create 2 shaders and a shader program. This is done in 'GLSL', OpenGL Shading Language.
	// for simplicity we will just feed them as strings into WebGL

	// the vertex shader source code
	const vertexShaderSource = `#version 300 es
	
		in vec3 v_position;
		in vec3 v_color;
		in vec2 v_texture;
		
		out lowp vec3 f_color;
		out lowp vec2 f_texture;
		
		void main() {
			f_color = v_color;
			f_texture = v_texture;
			gl_Position = vec4(v_position, 1.0);
		}
	`;

	// create a vertex shader object, attach the shader source to the object and compile the shader
  	var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);

    // debugging the shader
     if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
	     alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(vertexShader));
	     gl.deleteShader(vertexShader);
	     return null;
	 }

	// the fragment shader source code
	const fragmentShaderSource = `#version 300 es
	
		precision mediump float;
	
		in lowp vec3 f_color;
		in lowp vec2 f_texture;
		
		out vec4 fragmentColor;

		uniform sampler2D u_texture;
	
		void main() {
			fragmentColor = texture(u_texture, f_texture);
			//fragmentColor = vec4(f_color, 1.0);
		}
  	`;

	// create a fragment shader object, attach the shader source to the object and compile the shader
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);

    // debugging the shader
     if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
	     alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(fragmentShader));
	     gl.deleteShader(fragmentShader);
	     return null;
	 }

    // finally create a shader program that links our shaders to each other.
	var shaderProgram = gl.createProgram();

	// attach our shaders to the program
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);

	// link the shader programs to each other
	gl.linkProgram(shaderProgram);

	// tell WebGL to use our shader program
	gl.useProgram(shaderProgram);


	/*
	* --------------------------------------------------------------------------------------------
	* Defining the data to create a triangle
	* --------------------------------------------------------------------------------------------
	*/

	// create an array holding all our vertex data.
	var vertices = [
	   //---positions---\   /---colors---\  /--texture--\
	   // x		y     z	   	 r	  g	   b
		-0.5, -0.5,  0.0, 	1.0, 0.0, 0.0,	  0.0, 1.0,		// lower left corner
	 	 0.5, -0.5,  0.0, 	0.0, 1.0, 0.0,	  1.0, 1.0,		// lower right corner
		-0.5,  0.5,  0.0, 	0.0, 0.0, 0.0,	  0.0, 0.0,		// upper left corner
		 0.5,  0.5,  0.0, 	0.0, 0.0, 1.0,	  1.0, 0.0		// upper right corner
	];

	// textures range:
	// 0:0 --> 1:0
	//  |		|
	//  V 		V
	// 0:1 --> 1:1

	// indices show the 3 points that create a triangle.
	var indices = [
		0, 1, 2,	// 1st triangle
		1, 2, 3		// 2nd triangle
	];
	
	// create a buffer, bind it to webgl as our active buffer and put our vertices in the buffer
	var vertex_buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	
	// get the point in our vertex shader where we can insert our positions
	var position_location = gl.getAttribLocation(shaderProgram, "v_position");
	
	// tell the vertex shader how to interpret the vertex data.
	// 1st arg: pointer to the position where the vertex data can be inserted
	// 2nd arg: number of components per vertex attribute (3 for us, as we are working with x,y,z axis)
	// 3rd arg: what type of data each vertex attribute will be 
	// 4th arg: normalization, this has no effect on floats, but will cast other types into their usual values
	// 5th arg: specifies the offset in bytes between vertex attributes. In this case 8*4 because we have 8
	//			values per element (x,y,z,r,g,b,tx1,tx2) times 4 bytes (32 bit floats).
	// 6th arg: offset, specifies at which position (in bytes) in the vertex array the first element starts.
	gl.vertexAttribPointer(position_location, 3, gl.FLOAT, false, 8*4, 0);
	
	// use this if you want to seperate the position and color buffers instead of the above one.
	//gl.vertexAttribPointer(position_location, 3, gl.FLOAT, false, 0, 0);
	
	// now do the same for colors (from the same vertices array)
	var color_location = gl.getAttribLocation(shaderProgram, "v_color");
	// The 6th arg is 3*4 because we skip 3 elements of 4 bytes (32 bits) to get to the colors.
	gl.vertexAttribPointer(color_location, 3, gl.FLOAT, false, 8*4, 3*4); 

	// and for the texture
	var texture_location = gl.getAttribLocation(shaderProgram, "v_texture");
	gl.vertexAttribPointer(texture_location, 2, gl.FLOAT, false, 8*4, 6*4); 
	
	// unbind the buffer to prevent unwanted changes later
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	
	// now we will do the same for the indices
	var index_buffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
	
	// Note: The vertex buffer can be split in a position and color buffer too,
	// they are not required to be in the same array.
	// color buffer
	/*
		var colors = [
		//	 r	  g    b
			1.0, 0.0, 0.0,	// lower left corner
			0.0, 1.0, 0.0,	// lower right corner
			0.0, 0.0, 0.0,	// upper left corner
			0.0, 0.0, 1.0	// upper right corner
		];
		
		var color_buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
		
		var color_location = gl.getAttribLocation(shaderProgram, "v_color");
		gl.vertexAttribPointer(color_location, 3, gl.FLOAT, false, 0, 0); 
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
	*/
	
	/*
	* --------------------------------------------------------------------------------------------
	* Connect the shaders and vertex data
	* --------------------------------------------------------------------------------------------
	*/

	// bind our buffer objects to WebGL
	gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
	//gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);

	// tell WebGL to enable the vertex attribute we just specified.
	gl.enableVertexAttribArray(position_location);
	gl.enableVertexAttribArray(color_location);
	gl.enableVertexAttribArray(texture_location);


	/*
	* --------------------------------------------------------------------------------------------
	* Connect the shaders and vertex data
	* --------------------------------------------------------------------------------------------
	*/

	// load in the texture
	var texture = loadTexture(gl, "brick-wall.jpg");

	// tell WebGL we want to affect texture unit 0
	gl.activeTexture(gl.TEXTURE0);
	
	// bind the texture to texture unit 0
	gl.bindTexture(gl.TEXTURE_2D, texture);


	/*
	* --------------------------------------------------------------------------------------------
	* Draw the shapes
	* --------------------------------------------------------------------------------------------
	*/	

	// set the color which WebGL will use to clear the screen
	gl.clearColor(0.5, 0.5, 0.5, 0.9);

	// enable depth tests
    gl.enable(gl.DEPTH_TEST);
	
	// clear the screen
	gl.clear(gl.COLOR_BUFFER_BIT);

	// set the viewport for WebGL to the canvas we have in our html.
	gl.viewport(0,0,canvas.width,canvas.height);

	// draw the triangles
	// 1st arg: drawing mode, the way WebGL will connect our vertex positions into a shape
	// 2nd arg: count, number of elements to be rendered. (3 for us, as we have specified 3 positions for our triangle)
	// 3rd arg: element array buffer type (the type of our indices array)
	// 4th arg: offset, specifies at which position (in bytes) in the element array the first element starts. As we have no
	//			additional information in our element array buffer, this will be 0.
	gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
	
	
	/*
	* --------------------------------------------------------------------------------------------
	* Create a frame loop
	* --------------------------------------------------------------------------------------------
	*/	
	
	// track the time of the last draw call
	var previous = 0
	
	// see if a new frame can be drawn
	requestAnimationFrame(drawScene);
	
	function drawScene(now) {
		// convert to seconds
		now *= 0.001;
		// subtract the previous time from the current time
		var deltaTime = now - previous;
		// remember the current time for the next frame.
		previous = now;

		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

		// call drawScene again for the next frame
		requestAnimationFrame(drawScene);
	}
}

function loadTexture(gl, url)
{
	var texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);

	// image placeholder until it has been loaded from a file
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
              new Uint8Array([0, 0, 255, 255]));

	var image = new Image();
	image.src = url;
	image.addEventListener('load', function(){
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
		gl.generateMipmap(gl.TEXTURE_2D);
	});
	
	return texture;
}
