let startingPoints = []
let activePoints = []
let points = []
let delaunay;
let voronoi ;
let rows = 5;
let cols = rows;
let mouseDistance = 100;
let time = 5.0;
let canvas;
let noiseAlpha = 0.0;
let increment = 0.005;
let baseImg;

function preload() {
    baseImg = loadImage('/assets/img/portfolio/CaptainStarshot/header.jpg');
}

function setup() {
    canvas = createCanvas(windowWidth, windowHeight, WEBGL);
    smooth() ;
    background(255);
    noiseDetail(8, 0.5);
    for(var x = 0; x < cols ; x++){
        for(var y = 0; y < rows; y++){
            let posX = x*windowWidth/cols;
            let posY = y*windowHeight/rows;
            posX += noise(posX*0.1, posY*0.1, noiseAlpha)*windowWidth/cols;
            posY += noise(posY*0.1, posX*0.1, noiseAlpha)*windowHeight/rows;
            //posX+=noise(posX, posY)*windowWidth/cols;
            
            
            //posY+=noise(posY, posX)*windowHeight/rows;
            startingPoints.push([[posX,posY], time]);
        }
    }
}

function draw() {
    background(255);
    let deltaTime = window.performance.now() - canvas._pInst._lastFrameTime;
    noiseAlpha += increment;
    //Find closest cell
    let closest = 0;
    let minDistance = windowHeight* windowWidth;
    points = [];
    for(var i = 0; i < startingPoints.length ; i++){
        let newPos = startingPoints[i][0];
        //let posX = newPos[0] + noise(newPos[0]*0.01, newPos[1]*0.01, noiseAlpha)*windowWidth/cols;
        //let posY = newPos[1] + noise(newPos[1]*0.01, newPos[0]*0.01, noiseAlpha)*windowHeight/rows;
        let posX = newPos[0];
        let posY = newPos[1];
        points.push([posX, posY]);
        startingPoints[i][1] -= deltaTime*0.001;
        //console.log(startingPoints[i][1]);
        if(startingPoints[i][1] < 0.0) {
            startingPoints[i][1] = 0.0;
        }
    }
    activePoints = [];
    for(var i = 0; i < points.length ; i++){
        const center = points[i];
        let cellDistance = distance2D(mouseX, mouseY, center[0], center[1]);
        if( cellDistance< mouseDistance ){
            if( cellDistance < minDistance ){
                closest = i;
                minDistance =  cellDistance;
                
            }
            activePoints.push([i, cellDistance/mouseDistance]);
        }
    }
    //points[closest] = [mouseX, mouseY];
    startingPoints[closest][1] = time;
    //Regenerate voronoi
    delaunay = d3.Delaunay.from(points);
    voronoi = delaunay.voronoi([0, 0, windowWidth, windowHeight]);
    
    const cell = voronoi.cellPolygon(1);
    stroke(0);
    beginShape();
    texture(baseImg);
    const center = points[1];
    let furthest = 0;
    
    for (var j = 0; j < cell.length; j++) {
        var vert = cell[j];
        let maxX = abs(vert[0]-center[0])
        if(furthest < maxX) 
        {
            furthest =maxX;
        }
        let maxY = abs(vert[1]-center[1]);
        if(furthest < maxY) 
        {
            furthest =maxY;
        }
    }
    for (var j = 0; j < cell.length; j++) {
        var vert = cell[j];
        vertex(vert[0], vert[1], ( 0.5 + (vert[0] - center[0])*0.5/furthest )*baseImg.width, ( 0.5 + (vert[1] -center[1])*0.5/furthest)*baseImg.height);
    }
    endShape();
    
    //Draw Cells
    //for (var i = 0; i < points.length; i++) {
    //    const center = points[i];
    //    if (i<20){
    //        
    //        const cell = voronoi.cellPolygon(i);
    //        let randB = noise(center[0], center[1]);
    //        noFill();
    //        
    //        
    //        stroke(startingPoints[i][1]/time * 255);
    //        //stroke( 255);
    //        beginShape();
    //        texture(baseImg);
    //        for (var j = 0; j < cell.length; j++) {
    //            var vert = cell[j];
    //            vertex(vert[0], vert[1], (vert[0]-floor(vert[0]) )*baseImg.width, (vert[1]-floor(vert[1]))*baseImg.height);
    //        }
    //        endShape();
        //
    //    }
    //    else if(startingPoints[i][1]>0){
        //
    //        
    //    }
    //}

    
    texture(baseImg);
    // Assuming img has 100 pixels width and height
  beginShape();
  vertex(0, 0, 0, 0);
  vertex(100, 0, baseImg.width, 0);
  vertex(100, 100, baseImg.width, baseImg.height);
  vertex(0, 100, 0, baseImg.height);
  endShape(CLOSE);
}

function distance2D(xA,yA,xB,yB){
    return Math.sqrt(Math.pow(xB-xA,2)+Math.pow(yB-yA,2));
}