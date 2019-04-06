var realToCSSPixels = window.devicePixelRatio || 1;
var mousePos = [0.0,0.0] ;
var elapsedTime = 0.0;
//get canvas obj
const canvas = document.getElementById('glCanvas');

//get gl context
var gl = canvas.getContext('webgl');

 // resize the canvas to fill browser window dynamically
 window.addEventListener('resize', resizeCanvas, false);
 function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
    console.log("resized");
}
resizeCanvas();


main();

//
// Start here
//
function main() {
    
    
    if(!gl){
        gl = canvas.getContext('experimental-webgl');
        alert('Unable to initialize WebGL. Initializing experimental-webgl instead.');
    }   
    if(!gl){
        alert('Your browser does not support WebGL');
        return;
    }

    ////////////////VERTEX SHADER//////////////////////
    const vsSource = 
        `
        precision mediump float;
        attribute vec2 aVertexPosition;
        void main()
        {
          gl_Position = vec4(aVertexPosition, 0.0, 1.0);
        }
        `;
    ////////////////FRAGMENT SHADER//////////////////////
    const fsSource =
        `
        precision mediump float;
        uniform vec2 u_resolution;
        uniform vec2 u_mousePos;
        uniform float u_time;
        uniform float u_deltaTime;

        vec2 random2( vec2 p ) {
            return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);
        }

        void main() {
            vec2 st = gl_FragCoord.xy/u_resolution.xy;
            st.x *= u_resolution.x/u_resolution.y;
 
            vec3 color = vec3(.0);
        
           
        
            // Tile the space
            vec2 i_st = floor(st);
            vec2 f_st = fract(st);
        
            
        
            // Cell positions
            vec2 point[5];
            point[0] = vec2(0.75,0.75);
            point[1] = vec2(0.75,0.25);
            point[2] = vec2(0.25,0.75);
            point[3] =  vec2(0.25,0.25);
            point[4] = u_mousePos/u_resolution;
        
            float m_dist = 1.;  // minimun distance
            vec2 m_point;        // minimum position
        
            // Iterate through the points positions
            for (int i = 0; i < 5; i++) {
                float dist = distance(st, point[i]);
                if ( dist < m_dist ) {
                    // Keep the closer distance
                    m_dist = dist;
        
                    // Kepp the position of the closer point
                    m_point = point[i];
                }
            }
        
            // Assign a color using the closest point position
            color += dot(m_point,vec2(.3,.6));
        
            // Add distance field to closest point center
            // color.g = m_dist;
        
            // Show isolines
            //color -= abs(sin(40.0*m_dist))*0.07;
        
            // Draw cell center
            color += 1.-step(.05, m_dist);
        
            // Draw grid
            color.r += step(.98, f_st.x) + step(.98, f_st.y);
        
            gl_FragColor = vec4(st.xy, 0.0,1.0);
            //gl_FragColor = vec4(color,1.0);
        }
        `;

    // Initialize a shader program; this is where all the lighting
    // for the vertices and so forth is established.
    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

    //Collect all the info needed to use the shader program.
    //Look up which attributes our shader program is using
    //for aVertexPosition, aVevrtexColor and also
    //look up uniform locations.
    const programInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
        },
        uniformLocations: {
            resolution: gl.getUniformLocation(shaderProgram, 'u_resolution'),
            mousePos: gl.getUniformLocation(shaderProgram, 'u_mousePos'),
            time: gl.getUniformLocation(shaderProgram, 'u_time'),
            deltaTime: gl.getUniformLocation(shaderProgram, 'u_deltaTime'),
        },
    };

    // Here's where we call the routine that builds all the
    // objects we'll be drawing.
    //const buffers = initBuffers(gl);

    var then = 0;
    var buffers = initVoronoiBuffers(gl);

    //bind events 
    bindMouseEvents(window);

    // Draw the scene repeatedly
    function render(now) {
        now *= 0.001;  // convert to seconds
        const deltaTime = now - then;
        then = now;
        elapsedTime += deltaTime;

        //if(updateScene){
        //    buffers = initVoronoiBuffers(gl);
        //    updateScene = false;
        //}

        drawScene(gl, programInfo, buffers, deltaTime);

        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}

//
// Initialize the buffers we'll need. For this demo, we just
// have one quad.
//
function initVoronoiBuffers(gl) {


    
    var vertexBuffer = [
        -1.0, -1.0,
        1.0, -1.0,
       -1.0,  1.0,
       -1.0,  1.0,
        1.0, -1.0,
        1.0,  1.0];
    
    

    // Create a buffer for the cube's vertex positions.

    const positionBuffer = gl.createBuffer();

    // Select the positionBuffer as the one to apply buffer
    // operations to from here out.

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    
    // Now pass the list of positions into WebGL to build the
    // shape. We do this by creating a Float32Array from the
    // JavaScript array, then use it to fill the current buffer.

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexBuffer), gl.STATIC_DRAW);

    // Build the element array buffer; this specifies the indices
    // into the vertex arrays for each face's vertices.

    return {
        position: positionBuffer,
        positionBufferSize: vertexBuffer.length,
    };
}


//
// Draw the scene.
//
function drawScene(gl, programInfo, buffers, deltaTime) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
    gl.clearDepth(1.0);                 // Clear everything
    gl.enable(gl.DEPTH_TEST);           // Enable depth testing
    gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

    // Clear the canvas before we start drawing on it.

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // Tell WebGL how to pull out the positions from the position
    // buffer into the vertexPosition attribute
    {
        const numComponents = 2;
        const type = gl.FLOAT;
        const normalize = gl.FALSE;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexPosition,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(
            programInfo.attribLocations.vertexPosition);
    }





    // Tell WebGL to use our program when drawing

    gl.useProgram(programInfo.program);

    // Set the shader uniforms

    gl.uniform2f(
        programInfo.uniformLocations.resolution,
        1,
        canvas.width, canvas.height);

    gl.uniform2f(
        programInfo.uniformLocations.mousePos,
        1,
        mousePos[0], mousePos[1]);

    gl.uniform1f(
        programInfo.uniformLocations.time,
        elapsedTime);

    gl.uniform1f(
        programInfo.uniformLocations.deltaTime,
        deltaTime);
    

    {
        const vertexCount = buffers.positionBufferSize/2;
        const type = gl.UNSIGNED_SHORT;
        const offset = 0;
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    // Update the rotation for the next draw

    //cubeRotation += deltaTime;
}

//
// Initialize a and return a shader program
//
function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    //Create the shader program

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    //check for linking errors

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('ERROR linking program!', gl.getProgramInfoLog(program));
        return null;
    }

    //#debugOnly
    gl.validateProgram(program);
    if(!gl.getProgramParameter(program, gl.VALIDATE_STATUS)){
        console.error('ERROR validating program!', gl.getProgramInfoLog(program));
        return;
    }

    return program;
}

//
// creates and returns a shader of the given type, uploads the source and
// compiles it.
//
function loadShader(gl, type, source) {
    //Crete shader of type gl.VERTEX_SHADER || gl.FRAGMENT_SHADER
    const shader = gl.createShader(type);

    //Send the source to the shader object
    gl.shaderSource(shader, source);

    //Compile the shader program
    gl.compileShader(shader);

    //check for compilation errors

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('ERROR compiling vertex shader!', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

function randInRange(min, max){
    return min + Math.random()*(max - min);
}

function mapToRange(val, inMin, inMax, outMin, outMax){
    return outMin + (val - inMin)*(outMax - outMin) / (inMax - inMin);
}

function distance2D(xA,yA,xB,yB){
    return Math.sqrt(Math.pow(xB-xA,2)+Math.pow(yB-yA,2));
}

//Get Mouse Position
function getMousePos(window, evt) {
    var rect = canvas.getBoundingClientRect();

    //console.log('canvas  pos %f, %f',rect.left, rect.top, rect.width, rect.height);
    return {
        x: ((evt.clientX - rect.left) * realToCSSPixels),
        y: (rect.height-(evt.clientY - rect.top) * realToCSSPixels)
    };
}

function bindMouseEvents(window){
        
    window.addEventListener("mousemove", function (evt) {
        var mouseP = getMousePos(window, evt);
        

        mousePos[0] =mouseP.x;
        mousePos[1] =mouseP.y;        
        console.log("mouse moved %f, %f",mousePos[0], mousePos[1] );
    }, false);

    
    window.addEventListener("click", function(){
        
        
        updateScene = true;
        
    });


    
}