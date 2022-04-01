
class PreloadScene extends Phaser.Scene{
    constructor(){
        super('PreloadScene')
    }
    preload ()
    {
        this.load.tilemapTiledJSON('map', 'assets/crystal_world_map.json');
        this.load.image('tiles-1', 'assets/main_lev_build_1.png');
        this.load.image('tiles-2', 'assets/main_lev_build_2.png');
        this.load.spritesheet('player', 'assets/player/move_sprite_1.png',
            { frameWidth: 32, frameHeight: 38, spacing: 32 }
        );

    }

    create(){
        // this.add.image(0, 0, 'sky').setOrigin(0);
        this.scene.start('PlayScene')
    }
}

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
