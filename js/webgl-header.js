var cubeRotation = 0.0;

var voronoi;
var grid;

var updateScene = false;

class Cell{
    constructor(pos,w,h, newId){
        this.isOpen = true;
        this.position = pos;
        this.height = h;
        this.width = w;
        this.voronoiId = newId;
        
    }

    

    switchOnOff(){
        this.isOpen = !this.isOpen;
        if(!this.isOpen){console.log('switched off');}
        else{
            console.log('switched on');
        }
    }

    switchOff(){
        this.isOpen = false;
        if(!this.isOpen){console.log('switched off pos : %i', this.voronoiId );}
    }
};

class Grid{
    constructor(rows,cols,w,h){
        this.cells = new Array();
        this.botRight = [((rows)*w)/2,((cols)*h)/2];
        this.topLeft = [-((rows+1)*w)/2,-((cols+1)*h)/2];
        
        var currentPos = new Array(this.topLeft[0] +(w/2),this.topLeft[1] +(h/2));
        this.cellsPos = new Array();

        // console.log('cell %i, %i, pos: %f, %f;',currentPos[0], currentPos[1], 
        // this.topLeft[0], this.topLeft[1]);
        for (let i = 0; i < rows; i++) {
            currentPos[0] = this.topLeft[0] +(w/2);
            for (let j = 0; j < cols; j++) {
                
                let tempPos = [currentPos[0] + randInRange(-h/2, h/2),
                currentPos[1] + randInRange(-h/2, h/2)];
                this.cellsPos.push(tempPos);
                this.cells.push(new Cell([tempPos[0], tempPos[1]],w,h, i*rows+ j));
                console.log('cell %i, pos: %f, %f;',i*rows+ j, 
                tempPos[0], tempPos[1]);
                
                currentPos[0] = currentPos[0] + w;             
            }
            
            currentPos[1] = currentPos[1] + h;
        }
    }

    popCell(x,y){
        let closest = new Cell();
        let dist = 500000;
        
        for (const iterator of this.cells) {
            if(iterator.isOpen){
            
                let tempDist = distance2D(iterator.position[0], iterator.position[1],x, y);
                
                if(dist > tempDist){
                    closest = iterator;
                    dist = tempDist;
                   
                }
            }
            
            
        }
        closest.switchOff();
        // closest.switchOnOff();
        this.cellsPos = [];
        
        for (const iterator of this.cells) {
            if(iterator.isOpen){
                this.cellsPos.push([iterator.position[0], iterator.position[1]]);
                //console.log('cell pos: %f, %f', iterator.position[0], iterator.position[1]);
            }else{
                console.log('popped');
            }
            
        }
    
    }


    popCellNeighboursInRadius(x,y, radius){
        let closest = 0;
        let dist = 500000;
        let cellId = 0;
        
        for (const iterator of this.cells) {
            if(iterator.isOpen){
            
                let tempDist = distance2D(iterator.position[0], iterator.position[1],x, y);
                
                if(dist > tempDist){
                    closest = cellId;
                    dist = tempDist;
                   
                }
            }
            cellId++;
            
        }
        for (let index = 0; index < this.cells.length; index++) {
            if(this.cells[index].isOpen){
                if(index!=closest){
                    let tempDist = distance2D(
                        this.cells[index].position[0], this.cells[index].position[1],
                        x, y);
                    if(tempDist<=radius){
                        this.cells[index].switchOff();
                    }
                }

            }
            
        }
        
        // closest.switchOnOff();
        this.cellsPos = [];
        
        for (const iterator of this.cells) {
            if(iterator.isOpen){
                this.cellsPos.push([iterator.position[0], iterator.position[1]]);
                //console.log('cell pos: %f, %f', iterator.position[0], iterator.position[1]);
            }else{
                console.log('closed');
            }
            
        }
    
    }
    

    //get cells(){return this.cells;}

};

main();

//
// Start here
//
function main() {
    //get canvas obj
    const canvas = document.getElementById('glCanvas');
    //init canvas size to window size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    

    //get gl context
    var gl = canvas.getContext('webgl');
    
    if(!gl){
        gl = canvas.getContext('experimental-webgl');
        alert('Unable to initialize WebGL. Initializing experimental-webgl instead.');
    }   
    if(!gl){
        alert('Your browser does not support WebGL');
        return;
    }

    //init inverted matrix to convert mousepos
    var invertedMVP = new Float32Array(16);
    var worldMatrix = new Float32Array(16);
	var viewMatrix = new Float32Array(16);
    glMatrix.mat4.identity(worldMatrix);
    glMatrix.mat4.lookAt(viewMatrix, [0, 0, -10], [0, 0, 0], [0, -1, 0]);
    glMatrix.mat4.multiply(invertedMVP,worldMatrix,viewMatrix );

    //init grid and voronoi
    grid = new Grid(10,10,0.5,0.5);
    
    voronoi =  d3.Delaunay.from(grid.cellsPos).voronoi(
        [grid.topLeft[0],grid.topLeft[1],grid.botRight[0],grid.botRight[1]]);
    

    ////////////////VERTEX SHADER//////////////////////
    const vsSource = 
        `
        precision mediump float;
        attribute vec2 aVertexPosition;
        attribute vec3 aVertexColor;
        varying vec3 fragColor;
        uniform mat4 uModelViewMatrix;
        uniform mat4 uProjectionMatrix;  
        void main()
        {
          fragColor = aVertexColor;
          gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aVertexPosition, 0.0, 1.0);
        }
        `;
    ////////////////FRAGMENT SHADER//////////////////////
    const fsSource =
        `
        precision mediump float;
        varying vec3 fragColor;
        void main()
        {
          gl_FragColor = vec4(fragColor, 1.0);
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
            vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
            modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
        },
    };

    // Here's where we call the routine that builds all the
    // objects we'll be drawing.
    //const buffers = initBuffers(gl);

    var then = 0;
    var buffers = initVoronoiBuffers(gl);

    //bind events 
    bindMouseEvents(canvas, invertedMVP);

    // Draw the scene repeatedly
    function render(now) {
        now *= 0.001;  // convert to seconds
        const deltaTime = now - then;
        then = now;
    

        if(updateScene){
            buffers = initVoronoiBuffers(gl);
            updateScene = false;
        }

        drawScene(gl, programInfo, buffers, deltaTime);

        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}
//
// initVoronoiBuffers
//
// Initialize the buffers we'll need. For this demo, we just
// have one object -- a simple three-dimensional cube.
//
function initVoronoiBuffers(gl) {


    //recalculate voronoi
    voronoi =  d3.Delaunay.from(grid.cellsPos).voronoi(
        [grid.topLeft[0],grid.topLeft[1],grid.botRight[0],grid.botRight[1]]
        );
    
    var {points, triangles} = voronoi.delaunay;
    var colorsBuffer = new Array();

    var colors = [];
    var vertexBuffer = [];
    var indices = [];
    var ind = 0;
    var polyInd = 0;
    for(var i = 0; i < points.length / 2; i++){
        var center = [points[i*2],points[i*2+1]];
        
       
        const cell = voronoi.cellPolygon(i);
        //console.log('size %i',cell.length  );
        let randB = Math.random();
        for(var j = 0; j < cell.length-1; j++){
            var vert1 = cell[j];
            var vert2 = [];
            if(j=== cell.length-1){
                
                vert2 = cell[0] ;
              
            }else{
                vert2 = cell[j+1] ;
                
            }
            //console.log('cell %i, triangle %i, center: %f, %f, %f, %f, %f, %f', i,j,center[0], center[1],vert1[0],vert1[1], vert2[0],vert2[1]  );
            
            
            const v = [center[0], center[1], vert1[0], vert1[1], vert2[0], vert2[1]];
           
            
            vertexBuffer = vertexBuffer.concat(v);
            
            indices = indices.concat([polyInd,polyInd+1, polyInd+2]);
            // const c = [center[0]*Math.random(), center[1]*Math.random(), Math.random()];
            // colors = colors.concat(c);
            // colors = colors.concat(c);
            // colors = colors.concat(c);
            let r =mapToRange(center[0], grid.topLeft[0], grid.botRight[0], 0.0, 1.0);
            let g =mapToRange(center[1], grid.topLeft[1], grid.botRight[1], 0.0, 1.0);
            let b =r *g;
            const c = [
                r, 
                g, 
                0];
            colors = colors.concat(c);
            colors = colors.concat(c);
            colors = colors.concat(c);

            // const c = colorsBuffer[i];
            // colors = colors.concat(c);
            // colors = colors.concat(c);
            // colors = colors.concat(c);
            //console.log('cell %i, color: %f, %f, %f', i,c[0],c[1], c[2]) ;
            
            //console.log('cell %i', i);
            polyInd = polyInd+3;
        }
        ind = ind+2;
    }
    

    // Create a buffer for the cube's vertex positions.

    const positionBuffer = gl.createBuffer();

    // Select the positionBuffer as the one to apply buffer
    // operations to from here out.

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    
    // Now pass the list of positions into WebGL to build the
    // shape. We do this by creating a Float32Array from the
    // JavaScript array, then use it to fill the current buffer.

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexBuffer), gl.STATIC_DRAW);

    // Now set up the colors for the faces. We'll use solid colors
    // for each face.

    

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    // Build the element array buffer; this specifies the indices
    // into the vertex arrays for each face's vertices.

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

   

    // Now send the element array to GL

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(indices), gl.STATIC_DRAW);

    return {
        position: positionBuffer,
        color: colorBuffer,
        indices: indexBuffer,
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

    

  const fieldOfView = 45 * Math.PI / 180;   // in radians
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 0.1;
  const zFar = 100.0;
  const projectionMatrix = glMatrix.mat4.create();

  var modelViewMatrix = glMatrix.mat4.create();
  worldMatrix = new Float32Array(16);
         viewMatrix = new Float32Array(16);
         projMatrix = new Float32Array(16);
        glMatrix.mat4.identity(worldMatrix);
        glMatrix.mat4.lookAt(viewMatrix, [0, 0, -10], [0, 0, 0], [0, -1, 0]);

        glMatrix.mat4.multiply(modelViewMatrix,viewMatrix ,worldMatrix);
        glMatrix.mat4.ortho(projectionMatrix, -gl.canvas.clientWidth/200, gl.canvas.clientWidth/200, - gl.canvas.clientHeight/200,  gl.canvas.clientHeight/200,  0.1, 1000.0)
    // note: glmatrix.js always has the first argument
    // as the destination to receive the result.
    // glMatrix.mat4.perspective(projectionMatrix,
    //                 fieldOfView,
    //                 aspect,
    //                 zNear,
    //                 zFar);

    // Set the drawing position to the "identity" point, which is
    // the center of the scene.
    

    // // Now move the drawing position a bit to where we want to
    // // start drawing the square.

    // glMatrix.mat4.translate(modelViewMatrix,     // destination matrix
    //              modelViewMatrix,     // matrix to translate
    //              [-0.0, 0.0, -6.0]);  // amount to translate
    // glMatrix.mat4.rotate(modelViewMatrix,  // destination matrix
    //           modelViewMatrix,  // matrix to rotate
    //           cubeRotation,     // amount to rotate in radians
    //           [0, 0, 1]);       // axis to rotate around (Z)
    // glMatrix.mat4.rotate(modelViewMatrix,  // destination matrix
    //           modelViewMatrix,  // matrix to rotate
    //           cubeRotation * .7,// amount to rotate in radians
    //           [0, 1, 0]);       // axis to rotate around (X)

    // Tell WebGL how to pull out the positions from the position
    // buffer into the vertexPosition attribute
    {
        const numComponents = 2;
        const type = gl.FLOAT;
        const normalize = gl.FALSE;;
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

    // Tell WebGL how to pull out the colors from the color buffer
    // into the vertexColor attribute.
    {
        const numComponents = 3;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexColor,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(
            programInfo.attribLocations.vertexColor);
    }

    // Tell WebGL which indices to use to index the vertices
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

    // Tell WebGL to use our program when drawing

    gl.useProgram(programInfo.program);

    // Set the shader uniforms

    gl.uniformMatrix4fv(
        programInfo.uniformLocations.projectionMatrix,
        false,
        projectionMatrix);
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.modelViewMatrix,
        false,
        modelViewMatrix);

    {
        const vertexCount = buffers.positionBufferSize/2;
        const type = gl.UNSIGNED_SHORT;
        const offset = 0;
        gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
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
        x: ((evt.clientX - rect.left) -rect.width/2)/(100),
        y: (-(evt.clientY - rect.top) +rect.height/2)/(100)
    };
}

function bindMouseEvents(canvas,invertedMVP){
        
    canvas.addEventListener("mousemove", function (evt) {
        var mouseP = getMousePos(canvas, evt);
        var moseP = glMatrix.vec2.fromValues(mouseP.x, mouseP.y);
        let tranformedMP = glMatrix.vec2.fromValues(0,0) ;
        glMatrix.vec2.transformMat4(tranformedMP, moseP, invertedMVP);

        mousePos[0] =tranformedMP[0];
        mousePos[1] =tranformedMP[1];        
    
    }, false);

    var mousePos = [] ;
    canvas.addEventListener("click", function(){
        // for (let index = 0; index < voronoi.delaunay.points.length/2; index++) {
        //     //console.log('cell %i pos %f, %f', index, points[index*2], points[index*2+1]);
        //     if(voronoi.contains(index, mousePos[0], mousePos[1])){
        //         console.log('clicked on cell %i', index);
        //         for (const t of this.neighbors(index)) {
        //             grid.popCell(t.[0], mousePos[1]);
        //           }
        //     }
        // }
        
        grid.popCellNeighboursInRadius(mousePos[0], mousePos[1],1);
        
        updateScene = true;
        
    });


    
}

