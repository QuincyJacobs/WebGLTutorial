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
	
		in vec3 positions;
		in vec3 v_colors;
		
		out lowp vec3 f_colors;
		
		void main() {
			f_colors = v_colors;
			gl_Position = vec4(positions, 1.0);
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
	
		in lowp vec3 f_colors;
		
		out vec4 fragmentColor;
	
		void main() {
			fragmentColor = vec4(f_colors, 1.0);
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

	// create an array holding all our vertex data. 	Note: This will become a square
	var vertices = [
	   //---positions---\   /---colors---\
	   // x		y     z	   	 r	  g	   b
		-0.5, -0.5,  0.0, 	1.0, 0.0, 0.0,	// lower left corner
	 	 0.5, -0.5,  0.0, 	0.0, 1.0, 0.0,	// lower right corner
		-0.5,  0.5,  0.0, 	0.0, 0.0, 0.0,	// upper left corner
		 0.5,  0.5,  0.0, 	0.0, 0.0, 1.0,	// upper right corner
	];

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
	var position_location = gl.getAttribLocation(shaderProgram, "positions");
	
	// tell the vertex shader how to interpret the vertex data.
	// 1st arg: pointer to the position where the vertex data can be inserted
	// 2nd arg: number of components per vertex attribute (3 for us, as we are working with x,y,z axis)
	// 3rd arg: what type of data each vertex attribute will be 
	// 4th arg: normalization, this has no effect on floats, but will cast other types into their usual values
	// 5th arg: specifies the offset (in bytes) between vertex attributes.
	// 6th arg: offset, specifies at which position (in bytes) in the vertex array the first element starts.
	gl.vertexAttribPointer(position_location, 3, gl.FLOAT, false, 3*8, 0);
	
	// now do the same for colors (from the same vertices array)
	var color_location = gl.getAttribLocation(shaderProgram, "v_colors");
	gl.vertexAttribPointer(color_location, 3, gl.FLOAT, false, 3*8, 3*4); 
	
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
	//var colors = [
	//	 r	  g    b
	//	1.0, 0.0, 0.0,	// lower left corner
	//	0.0, 1.0, 0.0,	// lower right corner
	//	0.0, 0.0, 0.0,	// upper left corner
	//	0.0, 0.0, 1.0,	// upper right corner
	//];
	
	//var color_buffer = gl.createBuffer();
	//gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
	//gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
	//var color_location = gl.getAttribLocation(shaderProgram, "v_colors");
	//gl.vertexAttribPointer(color_location, 3, gl.FLOAT, false, 0, 0); 
	//gl.bindBuffer(gl.ARRAY_BUFFER, null);

	
	/*
	* --------------------------------------------------------------------------------------------
	* Connect the shaders and vertex data
	* --------------------------------------------------------------------------------------------
	*/

	// bind our buffer objects to WebGL
	gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);

	// tell WebGL to enable the vertex attribute we just specified.
	gl.enableVertexAttribArray(position_location);
	gl.enableVertexAttribArray(color_location);


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
		
		// assignment 4 comes in here.
		
		
		

		gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

		// call drawScene again for the next frame
		requestAnimationFrame(drawScene);
	}
}
