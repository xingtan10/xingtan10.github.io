
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
