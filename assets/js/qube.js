var half_width = 8;
var time_passed = 0;
var steps_duration = [12.0, 6.0, 6.0, 18.0];
var drop_duration = 24.0;
var sum_duration = 0.0;
var drop_alpha = 0.0;
var steps = 3
let current_step = 0;
let pos;
let start_pos;
let end_pos;
var rotations = [0, 0, 0, 0];



function setup() {
    smooth();
    let canvas = createCanvas(64, 64, WEBGL);
    canvas.parent('sketch-holder');
    ortho(-width / 2, width / 2, height / 2, -height / 2, 0, 500);
    camera(100, -100, 100, 0, 0, 0, 0, -1, 0);

    for (const i in steps_duration) {

        sum_duration += steps_duration[i];
    }
}

function draw() {



    background(255);
    noStroke();
    fill(0);

    updateAnimations();

    translate(half_width * 0.5, 0, -half_width * 0.5);
    if (current_step < 3) {


        push();

        {
            translate(0, -half_width, 0);



            push();
            {

                // second quad
                translate(half_width * 2, 0, 0);
                rotateY(PI / 2);
                rotateZ(PI);
                rotateX(-rotations[1]);
                push();
                {
                    //first quad
                    translate(0 * 2, half_width * 2, 0);


                    rotateX(-rotations[0]);


                    rect(0, 0, half_width * 2, half_width * 2);
                }
                pop();
                rect(0, 0, half_width * 2, half_width * 2);
            }

            pop();

            push();

            {
                translate(0, half_width * 2, 0);
                rotateY(-PI / 2);
                rotateZ(PI / 2);

                //rotateX(-rot_3);	

                rect(0, 0, half_width * 2, half_width * 2);
            }


            pop();

            push();

            {
                translate(0, half_width * 2, 0);
                rotateZ(PI / 2);

                rect(0, 0, half_width * 2, half_width * 2);
            }

            pop();

        }
        pop();
    }
    else {


        push();
        translate(0, -half_width, 0);
        push();

        translate(-half_width * (2), half_width * 2, 0);
        rect(0, 0, half_width * (2), half_width * 2);

        pop();


        push();
        translate(-half_width * (2), half_width * (2), 0);

        rotateX(-PI / 2 + rotations[2]);
        //rotateX(frameCount*0.01);
        push();


        rect(0, 0, half_width * 2, half_width * 2);

        pop();

        push();

        translate(0, 0, half_width * 2);

        rect(0, 0, half_width * 2, half_width * 2);

        pop();
        push();


        rotateY(-PI / 2);

        rect(0, 0, half_width * 2, half_width * 2);

        pop();

        push();

        translate(half_width * 2, 0, 0);
        rotateY(-PI / 2);

        rect(0, 0, half_width * 2, half_width * 2);

        pop();

        push();

        rotateX(PI / 2);


        rect(0, 0, half_width * 2, half_width * 2);

        pop();

        push();
        translate(0, half_width * 2, 0);
        rotateX(PI / 2);


        rect(0, 0, half_width * 2, half_width * 2);

        pop();

        pop();
        pop();
        if (current_step == 4) {
            push();

            fill(255);
            translate(0, -(half_width * 0.7 * 1.41421356237), 0);// square root of 2 diagonal of square

            box(half_width * 0.7);

            pop();
        }
    }

}

function deltaTimeMilliseconds() {
    return deltaTime * 0.01;
}
function updateAnimations() {

    if (time_passed > steps_duration[current_step]) {
        current_step += 1;
        time_passed = 0;

    }
    time_passed += deltaTimeMilliseconds();


    switch (current_step) {
        case 0:
            break;
        case 1:
            rotations[0] = time_passed / steps_duration[current_step] * PI / 2;
            rotations[0] = constrain(rotations[0], 0.0, PI / 2);
            break;
        case 2:
            rotations[1] = time_passed / steps_duration[current_step] * PI / 2;
            rotations[1] = constrain(rotations[1], 0.0, PI / 2);
            break;
        case 3:
            rotations[2] = time_passed / steps_duration[current_step] * PI * (3 / 2);
            rotations[2] = constrain(rotations[2], 0.0, PI * (3 / 2));
            drop_alpha += deltaTimeMilliseconds() / steps_duration[current_step];
            drop_alpha = constrain(drop_alpha, 0.0, 1.0);
            break;



        default:
            break;
    }
}