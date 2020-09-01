
const canvas = document.getElementById('display');
const ctx = canvas.getContext('2d');
const textBox = document.getElementById('textbox')

const HEIGHT = 640
const WIDTH = 640

ctx.canvas.height = HEIGHT;
ctx.canvas.width = WIDTH;

//Physics variables
const x_acceleration = 0.5; //"running" acceleration
const groundFriction = 0.85; //"ground" friction
const airFriction = 0.99 //air friction
const y_gravity = 1.5; //gravitational pull
const terminalV = 20; //terminal velocity

const character = {
    height: 64,
    width: 32,
    x: 144,
    x_velocity: 0,
    y:0,
    y_velocity: 0,
    airborne: false,
    walkSpeed: 6,
    jumpStrength: 22,

    animation:{
        frameCount: 0,
        frameDelay: 15,
        frameSet: 0,
        frameIndex: 0,
        update: function() {
            this.frameCount ++;
            if (this.frameCount >= this.frameDelay){
                this.frameCount = 0;
                this.frameIndex ++
                if (this.frameIndex > character.spriteSheet.frameList[this.frameSet].length - 1){
                    this.frameIndex = 0;

                }
            }
        }
    },

    spriteSheet: {
        frameList: [[0,1],[2,3],[4,5]],
        frameHeight: 64,
        frameWidth:32,
        image: new Image(),
        get frameX() {
            return character.spriteSheet.frameWidth * character.spriteSheet.frameList[character.animation.frameSet][character.animation.frameIndex];
        },
        get frameY() {
            return 0;
        }
    }
};

//Tile Map functions

const map = {
    cols: 20,
    rows: 20,
    get tWidth() {return WIDTH / map.cols},
    get tHeight() {return HEIGHT / map.rows},
    tiles: [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1,
        0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1,
        0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
        1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1
    ],
    getTile: function (col, row) {
        return this.tiles[row * map.cols + col];
    }
};


let env = []

function createTile(c,r,tClass){
    let tileConstructor = [];
    let name = c + '_' + r;
    let height = map.tHeight;
    let width = map.tWidth;
    let x = c*map.tWidth;
    let y = r*map.tHeight;
    let tile = tClass
    tileConstructor.push(name);
    tileConstructor[0] = {height,width,x,y,tile};

    return env.push(tileConstructor[0])
};

function drawTiles(map) {
    env = []
    for (var c = 0; c < map.cols; c++) {
        for (var r = 0; r < map.rows; r++) {
            var tile = map.getTile(c, r);
            if (tile !== 0) {
                createTile(c,r,tile)
             }
        }
    }
};

drawTiles(map);

//Controller with key listener functionality
const controller = {

    left:false,
    right:false,
    up:false,
    space:false,
    shift:false,
    keyListener: function(event) {
        let key_state = (event.type == "keydown")?true:false;
    
        switch(event.keyCode) {

            case 16:
                controller.shift = key_state;
            break;
            case 32:
                controller.space = key_state;
            break;
            case 37:
                controller.left = key_state;
            break;
            case 38:
                controller.up = key_state;
            break;
            case 39:
                controller.right = key_state;
            break;
            case 40:
                controller.down = key_state;
            break;

        }

    }

};

//Functions to calculate collisions
const rectCollision = function(rect1, rect2){
    if( rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y){
           return true
        } else {return false};
};

const collisionCheck = function(target){
    let collisionArray = []
    env.forEach(obj => {
        if (rectCollision(target,obj)){
            collisionArray.push(obj);
        }
        
    })
    return collisionArray
};


const downCollide = function(){
    let arr = [];
    collisionCheck(character).forEach(obj =>
        arr.push(obj.y)
    )
    return Math.min(...arr) - character.height
};

const upCollide = function(){
    let arr = [];
    collisionCheck(character).forEach(obj =>
        arr.push(obj.y + obj.height)
    )
    return Math.max(...arr)
};

const leftCollide = function(){
    let arr = [];
    collisionCheck(character).forEach(obj =>
        arr.push(obj.x + obj.width)
    )
    return Math.max(...arr)
};

const rightCollide = function(){
    let arr = [];
    collisionCheck(character).forEach(obj =>
        arr.push(obj.x)
    )
    return Math.max(...arr) - character.width
};


//Game loop
const loop = function() {
    
    //Apply key press
    if (controller.shift){
        character.walkSpeed = 8;
    } else {
        character.walkSpeed = 4;
    };
    
    if (controller.right && !(character.airborne)){
        character.x_velocity += x_acceleration;
    };
    if (controller.left && !(character.airborne)){
        character.x_velocity -= x_acceleration;
    };
    if ((controller.space || controller.up) && !(character.airborne)){
        character.y_velocity -= character.jumpStrength;
        character.airborne = true
    }

    //Apply physics variables
    character.y_velocity += y_gravity;

    if (character.y_velocity > terminalV){
        character.y_velocity = terminalV;
    };

    if (character.x_velocity > character.walkSpeed){
        character.x_velocity = character.walkSpeed;
    };

    if (character.x_velocity < -character.walkSpeed){
        character.x_velocity = -character.walkSpeed;
    };


    //Apply movement, dependent on collisions

    character.y += character.y_velocity;
    
    if(collisionCheck(character).length != 0 && character.y_velocity > 0){
        character.y = downCollide();
        character.y_velocity = 0;
        character.airborne = false;
    };

    if(collisionCheck(character).length != 0 && character.y_velocity < 0){
        character.y = upCollide();
        character.y_velocity = 0;
    };

    character.x += character.x_velocity;

    if(collisionCheck(character).length != 0 && character.x_velocity < 0){
        character.x = leftCollide();
        character.x_velocity = 0;
    };

    if(collisionCheck(character).length != 0 && character.x_velocity > 0){
        character.x = rightCollide();
        character.x_velocity = 0;
    };

    //Apply friction
    if(!(controller.left) && !(controller.right)){
        if(character.airborne){
            character.x_velocity *= airFriction;
        } else {
            character.x_velocity *= groundFriction;
        };
    };

    //Update animation
    if ((controller.left) && !(controller.right)) {
        character.animation.frameSet = 2
    } else if ((controller.right) && !(controller.left)){
        character.animation.frameSet = 1
    } else if (character.x_velocity > 2) {
        character.animation.frameSet = 1
    } else if (character.x_velocity < -2) {
        character.animation.frameSet = 2
    } else {
        character.animation.frameSet = 0
    };

    character.animation.update();

    //Draw the shapes on the background
    ctx.fillStyle = '#e5e5e5'
    ctx.fillRect(0, 0, WIDTH, HEIGHT)
    ctx.fillStyle = '#a9a9a9'
    env.forEach(obj => ctx.fillRect(obj.x, obj.y, obj.width, obj.height))
    ctx.drawImage(character.spriteSheet.image,character.spriteSheet.frameX,character.spriteSheet.frameY,character.spriteSheet.frameWidth,character.spriteSheet.frameHeight,character.x,character.y,character.width,character.height)
    //Reset the position if you go over the edge
    if(character.x > WIDTH){
        character.x = -character.width;
    };

    if(character.x < -character.width - 1){
        character.x = WIDTH
    }

    if(character.y > HEIGHT){
        character.y = -character.height
    }

    //textBox.innerHTML = String(character.animation.frameCount) + `FrameIndex: ${String(character.animation.frameIndex)}`; 

    //Repeat animation loop
    window.requestAnimationFrame(loop);

}; //End of loop

//Initiate animation loop
character.spriteSheet.image.addEventListener("load",function(event){
    window.requestAnimationFrame(loop);
});

character.spriteSheet.image.src = "Kyle Sprite.png";

//
window.addEventListener('keydown', controller.keyListener);
window.addEventListener('keyup', controller.keyListener);
