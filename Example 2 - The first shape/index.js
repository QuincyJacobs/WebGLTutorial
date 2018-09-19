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
	* Defining the data to create a triangle (Buffer Objects)
	* --------------------------------------------------------------------------------------------
	*/

	// create an array holding all our vertex positions. 	Note: This will become a triangle
	var positions = [
	   // x		y     z
		-0.5, -0.5,  0.0,	// lower left corner
	 	 0.5, -0.5,  0.0,	// lower right corner
		 0.0,  0.5,  0.0	// upper corner
	];

	// indices show the 3 points that create a triangle. This will not be of much help with just 
	// 1 triangle, but once we start drawing more it will start making more sense.
	var indices = [0, 1, 2];
	
	// create a buffer object, bind it to webgl as our active buffer and put our vertices in the buffer
	var vertex_buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
	
	// unbind the buffer to prevent unwanted changes later
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	
	// now we will do the same for the indices
	var index_buffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);


	/*
	* --------------------------------------------------------------------------------------------
	* Creating the Vertex shader, Fragment shader and the shader program
	* --------------------------------------------------------------------------------------------
	*/

	// create 2 shader programs. This is done in 'GLSL', OpenGL Shading Language.
	// for simplicity we will just feed them as strings into WebGL

	// the vertex shader source code
	const vertexShaderSource = `#version 300 es
	
		in vec3 coordinates;
		
		void main() {
			gl_Position = vec4(coordinates, 1.0);
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
	
		out vec4 fragmentColor;
	
		void main() {
			fragmentColor = vec4(0.0, 0.0, 0.0, 1.0);
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
	* Connect the shaders and vertex data
	* --------------------------------------------------------------------------------------------
	*/

	// bind our buffer objects to WebGL
	gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);

	// get the point in our vertex shader where we can insert our positions
	var coordinatePosition = gl.getAttribLocation(shaderProgram, "coordinates");

	// tell the vertex shader how to interpret the vertex data.
	// 1st arg: pointer to the position where the vertex data can be inserted
	// 2nd arg: number of components per vertex attribute (3 for us, as we are working with x,y,z axis)
	// 3rd arg: what type of data each vertex attribute will be 
	// 4th arg: normalization, this has no effect on floats, but will cast other types into their usual values
	// 5th arg: specifies the offset in bytes between vertex attributes. (This will be used later when our vertex 
	//			data will contain more than just positions)
	// 6th arg: offset, specifies at which position (in bytes) in the vertex array the first element starts. As we have no
	//			additional information in our vertex object, this will be 0.
	gl.vertexAttribPointer(coordinatePosition, 3, gl.FLOAT, false, 0, 0); 

	// tell WebGL to enable the vertex attribute we just specified.
	gl.enableVertexAttribArray(coordinatePosition);


	/*
	* --------------------------------------------------------------------------------------------
	* Draw the triangle
	* --------------------------------------------------------------------------------------------
	*/	

	// set the color which WebGL will use to clear the screen
	gl.clearColor(0.5, 0.5, 0.5, 0.9);

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
}
