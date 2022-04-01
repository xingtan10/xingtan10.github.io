
class PreloadScene extends Phaser.Scene{
    constructor(){
        super('PreloadScene')
    }
    preload ()
    {
        this.load.tilemapTiledJSON('map', 'assets/crystal_world_map.json');
        this.load.image('tiles-1', 'assets/main_lev_build_1.png');
        this.load.image('tiles-2', 'assets/main_lev_build_2.png');
        // this.load.image('player', 'assets/player/movements/idle01.png');
        this.load.spritesheet('player', 'assets/player/move_sprite_1.png',
            { frameWidth: 32, frameHeight: 38, spacing: 32 }
        );
        // this.load.image('sky', 'assets/sky.png');
        // this.load.image('sky', 'assets/images/sky.png');
        // this.load.image('ground', 'assets/images/platform.png');
        // this.load.image('ground1', 'assets/PNG/tiles/tile001.png');
        // this.load.image('tile39', 'assets/PNG/tiles/tile039.png');
        // this.load.image('star', 'assets/images/star.png');
        // this.load.image('bomb', 'assets/images/bomb.png');
        // this.load.audio('pickup', 'assets/Sounds/highUp.mp3')
        // this.load.audio('die', 'assets/Sounds/highDown.mp3')
        // // this.load.spritesheet('dude', 
        // //     'assets/images/dude.png',
        // //     { frameWidth: 32, frameHeight: 48 }
        // );
    }

    create(){
        // this.add.image(0, 0, 'sky').setOrigin(0);
        this.scene.start('PlayScene')
    }
}

//---------------------- Play Scene ---------------------
//---------------------- Play Scene ---------------------
//---------------------- Play Scene ---------------------

class PlayScene extends Phaser.Scene{
    constructor(config){
        super('PlayScene')
        this.config = config;
        console.log(this.config)
    }

    create(){
       const map = this.createMap();
       const layers = this.createLayers(map);
       const playerZones = this.getPlayerZones(layers.playerZones);
       const player = this.createPlayer(playerZones);
              
       this.createPlayerColliders(player, {
           colliders:{
               platformColliders: layers.platformColliders
           }
       })
    //    this.physics.add.collider(player, layers.platformColliders);
       this.setupFollowupCameraOn(player);
    }

    createMap(){
       const map = this.make.tilemap({key:'map'});
       map.addTilesetImage('main_lev_build_1', 'tiles-1');
       return map;
    }

    createLayers(map){
       const tileset = map.getTileset('main_lev_build_1');
       const platformColliders = map.createStaticLayer('platform_colliders', tileset);
       const environment = map.createStaticLayer('environment', tileset);
       const platforms = map.createStaticLayer('platforms', tileset);
       const playerZones = map.getObjectLayer('player_zones');
       
       platformColliders.setCollisionByExclusion(-1, true)

       return {environment, platforms, platformColliders, playerZones}
       
    }

    createPlayer({start}){
        //const player = this.physics.add.sprite(100, 200, 'player');
        return new Player(this, start.x, start.y)
    }

    createPlayerColliders(player, {colliders}){
        player.addCollider(colliders.platformColliders);
    }

    setupFollowupCameraOn(player){
        const map_width = 1600;
        const width = 1280;
        const height = 600;
        
        const mapOffset = map_width > width ? map_width - width : 0;
        this.physics.world.setBounds(0, 0, width + mapOffset, height + 200)
        this.cameras.main.setBounds(0, 0, width + mapOffset, height).setZoom(1.5);
        this.cameras.main.startFollow(player);
    }

    getPlayerZones(playerZonesLayer){
        const playerZones = playerZonesLayer.objects;
        return{
            start: playerZones.find(zone => zone.name ==='startZone'),
            end: playerZones.find(zone => zone.name ==='endZone'),
        }
    }
}


//---------------------- Player class ---------------------
//---------------------- Player class ---------------------
//---------------------- Player class ---------------------

class Player extends Phaser.Physics.Arcade.Sprite{
    constructor(scene, x, y){
        super(scene, x, y, 'player');
        scene.add.existing(this)
        scene.physics.add.existing(this)

        this.init();
        this.initEvents();
    }

    init(){
        const gravity = 500;
        this.playerSpeed = 150;
        this.jumpCount = 0;
        this.consecutiveJumps = 1;

        this.body.setGravityY(gravity);
        this.setCollideWorldBounds(true);
        this.cursors = this.scene.input.keyboard.createCursorKeys();

        //Animations
        this.scene.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('player', { start: 0, end: 7 }),
            frameRate: 10,
            repeat: -1
        })

        this.scene.anims.create({
            key: 'run',
            frames: this.anims.generateFrameNumbers('player', { start: 11, end: 16 }),
            frameRate: 8,
            repeat: -1
        })

        this.scene.anims.create({
            key: 'jump',
            frames: this.anims.generateFrameNumbers('player', { start: 17, end: 23 }),
            frameRate: 2,
            repeat: 1
        })

    }

    initEvents(){
        this.scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this)
    }
   
    update(){

        const onFloor = this.body.onFloor();
        const {space, up} = this.cursors;
        const isSpaceJustDown = Phaser.Input.Keyboard.JustDown(space);
        const isUpJustDown = Phaser.Input.Keyboard.JustDown(up);
        if(this.cursors.left.isDown){
            this.setVelocityX(-this.playerSpeed)
            this.setFlipX(true);
        } else if (this.cursors.right.isDown){
            this.setVelocityX(this.playerSpeed)
            this.setFlipX(false);
          
        }else{
            this.setVelocityX(0)
        }

        if((isSpaceJustDown|| isUpJustDown) && (onFloor || this.jumpCount < this.consecutiveJumps)){
            this.setVelocityY(-this.playerSpeed * 2)
            
            this.jumpCount++;
            console.log('jumping');
        }

        if (onFloor){
            this.jumpCount = 0;
        }
    
        onFloor ? 
            this.body.velocity.x !==0 ?
                this.anims.play('run', true) : this.anims.play('idle', true):
            this.anims.play('jump',true);
        }  
        addCollider(otherGameObject, callback){
            this.scene.physics.add.collider(this, otherGameObject, callback, null, true);
        }
    
}

//---------------------- Config ---------------------
//---------------------- Config ---------------------
//---------------------- Config ---------------------


// const widthX = document.body.offsetWidth;
var config = {
    type: Phaser.AUTO,

    width: 1280,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 200 },
            debug: false
        }
    },
    scene: [PreloadScene, PlayScene]
};

var game = new Phaser.Game(config);

// var platforms;
// var pickUpStarsSound;
// var bombhit;
// var score = 0;
// var scoreText;
// function create ()
// {
//     //Add sky
//     this.add.image(400, 300, 'sky');

//     //Add platforms
//     platforms = this.physics.add.staticGroup();

//     platforms.create(400, 568, 'ground').setScale(2).refreshBody();

//     platforms.create(600, 400, 'ground');
//     platforms.create(50, 250, 'ground');
//     platforms.create(750, 220, 'ground');


//     for (var i = 0; i < 800; i++){
//         platforms.create(i*50, 8*64+32, 'ground1').setScale(1).refreshBody();
//     }

//     for (var i = 0; i < 4; i++){
//         platforms.create(i*60, 8*64+32, 'tile39')
//     }
    
//     // makePlatform(5, 100, 3)
//     // makePlatform(7, 200, 2)
//     // makePlatform(9, 550, 1)
//     //Add stars
//     //this.add.image(400, 300, 'star');

//     stars = this.physics.add.group({
//         key: 'star',
//         repeat: 11,
//         setXY: { x: 12, y: 0, stepX: 70 }
//     });

//     stars.children.iterate(function (child) {
//         child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
//     });

    
//     player = this.physics.add.sprite(100, 450, 'dude');

//     player.setBounce(0.2);
//     player.setCollideWorldBounds(true);
//     player.body.setGravityY(100)

//     this.anims.create({
//         key: 'left',
//         frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
//         frameRate: 10,
//         repeat: -1
//     });
    
//     this.anims.create({
//         key: 'turn',
//         frames: [ { key: 'dude', frame: 4 } ],
//         frameRate: 20
//     });
    
//     this.anims.create({
//         key: 'right',
//         frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
//         frameRate: 10,
//         repeat: -1
//     });

//     bombs = this.physics.add.group()
//     this.physics.add.collider(bombs, platforms);
//     this.physics.add.collider(player, bombs, hitBomb, null, this);

//     scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '24px', fill: '#000' });

//     this.physics.add.collider(bombs, platforms);
//     this.physics.add.collider(player, platforms);
//     this.physics.add.collider(stars, platforms);

//     this.physics.add.overlap(player, stars, collectStar, null, this);
//     pickUpStarsSound = this.sound.add('pickup')
//     bombhit = this.sound.add('die')
// }

// function makePlatform (startx, y, length){
//     for (var i = startx; i < startx+length; i++){
//         platforms.create(i * 60 + startx, y, 'tile39');
//     }
// }

// function hitBomb (player, bomb)
// {
//     this.physics.pause();

//     player.setTint(0xff0000);

//     player.anims.play('turn');
//     bombhit.play();
//     gameOver = true;
// }

// function collectStar (player, star)
// {
//     star.disableBody(true, true);
//     pickUpStarsSound.play();
//     score += 10;
//     scoreText.setText('Score: ' + score);
//     if (stars.countActive(true) === 5)
//     {
//         stars.children.iterate(function (child) {

//             child.enableBody(true, child.x, 0, true, true);

//         });

//         var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

//         var bomb = bombs.create(x, 16, 'bomb');
//         bomb.setBounce(1);
//         bomb.setCollideWorldBounds(true);
//         bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);

//     }
// }



// function update ()
// {
//     cursors = this.input.keyboard.createCursorKeys();

//     if (cursors.left.isDown)
//     {
//         player.setVelocityX(-160);

//         player.anims.play('left', true);
//     }
//     else if (cursors.right.isDown)
//     {
//         player.setVelocityX(160);

//         player.anims.play('right', true);
//     }
//     else
//     {
//         player.setVelocityX(0);

//         player.anims.play('turn');
//     }

//     if (cursors.up.isDown && player.body.touching.down)
//     {
//         player.setVelocityY(-600);
//     }

//     if (cursors.space.isDown && player.body.touching.down)
//     {
//         player.setVelocityY(-360);
//     }
// }