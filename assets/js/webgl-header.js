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
    // Lookup the size the browser is displaying the canvas in CSS pixels
    // and compute a size needed to make our drawingbuffer match it in
    // device pixels.
    //var displayWidth  = Math.floor(gl.canvas.clientWidth  * realToCSSPixels);
    //var displayHeight = Math.floor(gl.canvas.clientHeight * realToCSSPixels);

    var displayWidth  = Math.floor(window.innerWidth  * realToCSSPixels);
    var displayHeight = Math.floor(window.innerHeight*(2.0/3.0) * realToCSSPixels);

    // Check if the canvas is not the same size.
    if (gl.canvas.width  !== displayWidth ||
        gl.canvas.height !== displayHeight) {

      // Make the canvas the same size
      gl.canvas.width  = displayWidth;
      gl.canvas.height = displayHeight;
    }
    console.log("resized: %f, %f", canvas.width, canvas.height);
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

        vec3 voronoi( in vec2 x , in vec2 mousePos) {
            vec2 n = floor(x);
            vec2 f = fract(x);
            mousePos = vec2(0.1,0.1);
            vec2 nm = floor(mousePos);
            vec2 fm = fract(mousePos);
        
            

            // first pass: regular voronoi
            vec2 mg, mr;
            float md = 8.0;


            for (int j= -1; j <= 1; j++) {
                for (int i= -1; i <= 1; i++) {
                    vec2 g = vec2(float(i),float(j));
                    vec2 r;
            


                    vec2 o = random2( n + g );
                    r = g + o - f;

                    
                    
                    float d = dot(r,r);
        
                    if( d<md ) {
                        md = d;
                        mr = r;
                        mg = g;
                    }
                }
            }

            // second pass: distance to borders
            //TODO look into why 2
            md = 8.0;
            for (int j= -2; j <= 2; j++) {
                for (int i= -2; i <= 2; i++) {
                    vec2 g = mg + vec2(float(i),float(j));
                
                    
                    vec2 r;           
                
                    
                    vec2 o = random2( n + g );
                    r = g + o - f;
                    
                
                    if ( dot(mr-r,mr-r)>0.00001 ) {
                        md = min(md, dot( 0.5*(mr+r), normalize(r-mr) ));
                    }
                }
            }
            return vec3(md, mr);
        }

        void main() {
            vec2 st = gl_FragCoord.xy/u_resolution.xy;
            // Scale
            //st *= 3.;
            float res = (u_resolution.x/u_resolution.y);
            st.x *= res;
            vec2 mousePos = u_mousePos;
            //mousePos*= 3.;
            mousePos.x *= res;
            
            vec3 color = vec3(.0);
            vec2 f_st = fract(st);

        
            float m_dist = 1.;  // minimun distance
            vec2 m_point;        // minimum position
        
            // Iterate through the points positions
            
            vec3 c = voronoi(st,mousePos);
            //// isolines
            ////color = c.x*(0.5 + 0.5*sin(64.0*c.x))*vec3(1.0);
            //// borders
            //color = mix( vec3(1.0), color, smoothstep( 0.01, 0.02, c.x ) );
            //// Draw grid
            //color.r += step(.98, f_st.x) + step(.98, f_st.y);
            //// feature points
            // float dd = length( c.yz );
            //color += vec3(1.)*(1.0-smoothstep( 0.0, 0.04, dd));
            //color=mix(vec3(0.13,0.13,0.13),vec3(0.886,0.27,0.27),color.x);
            gl_FragColor = vec4(1.0,1.0,1.0,1.0);
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
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    

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

   

    gl.uniform2f(
        programInfo.uniformLocations.resolution,
        gl.canvas.width, gl.canvas.height);

    gl.uniform2f(
        programInfo.uniformLocations.mousePos,
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
function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();

    //console.log('canvas  pos %f, %f',rect.left, rect.top, rect.width, rect.height);
    return {
        x: ((evt.clientX - rect.left) * realToCSSPixels),
        y: (rect.height-(evt.clientY - rect.top) * realToCSSPixels)
    };
}

function bindMouseEvents(window){
        
    window.addEventListener("mousemove", function (evt) {
        var mouseP = getMousePos(canvas, evt);
        

        mousePos[0] =mouseP.x/canvas.width;
        mousePos[1] =mouseP.y/canvas.height;        
        //console.log("mouse moved %f, %f",mousePos[0], mousePos[1] );
    }, false);

    
    window.addEventListener("click", function(){
        
        
        updateScene = true;
        
    });


    
}