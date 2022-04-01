import Phaser from 'phaser';

var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 800 },
            debug: false
        }
    },
    scene: {
        preload= preload,
        create: create,
        update: update,
        PreloadScene: PreloadScene,
        PlayScene: PlayScene
    }
};

var game = new Phaser.Game(config);

class Play extends Phaser.Scene{
    sdsd
}
function preload ()
{
    this.load.image('sky', 'assets/images/sky.png');
    this.load.image('ground', 'assets/images/platform.png');
    this.load.image('ground1', 'assets/PNG/tiles/tile001.png');
    this.load.image('tile39', 'assets/PNG/tiles/tile039.png');
    this.load.image('star', 'assets/images/star.png');
    this.load.image('bomb', 'assets/images/bomb.png');
    this.load.audio('pickup', 'assets/Sounds/highUp.mp3')
    this.load.audio('die', 'assets/Sounds/highDown.mp3')
    this.load.spritesheet('dude', 
        'assets/images/dude.png',
        { frameWidth: 32, frameHeight: 48 }
    );
}

var platforms;
var pickUpStarsSound;
var bombhit;
var score = 0;
var scoreText;
function create ()
{
    //Add sky
    this.add.image(400, 300, 'sky');

    //Add platforms
    platforms = this.physics.add.staticGroup();

    platforms.create(400, 568, 'ground').setScale(2).refreshBody();

    platforms.create(600, 400, 'ground');
    platforms.create(50, 250, 'ground');
    platforms.create(750, 220, 'ground');


    for (var i = 0; i < 800; i++){
        platforms.create(i*50, 8*64+32, 'ground1').setScale(1).refreshBody();
    }

    for (var i = 0; i < 4; i++){
        platforms.create(i*60, 8*64+32, 'tile39')
    }
    
    // makePlatform(5, 100, 3)
    // makePlatform(7, 200, 2)
    // makePlatform(9, 550, 1)
    //Add stars
    //this.add.image(400, 300, 'star');

    stars = this.physics.add.group({
        key: 'star',
        repeat: 11,
        setXY: { x: 12, y: 0, stepX: 70 }
    });

    stars.children.iterate(function (child) {
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });

    
    player = this.physics.add.sprite(100, 450, 'dude');

    player.setBounce(0.2);
    player.setCollideWorldBounds(true);
    player.body.setGravityY(100)

    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });
    
    this.anims.create({
        key: 'turn',
        frames: [ { key: 'dude', frame: 4 } ],
        frameRate: 20
    });
    
    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });

    bombs = this.physics.add.group()
    this.physics.add.collider(bombs, platforms);
    this.physics.add.collider(player, bombs, hitBomb, null, this);

    scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '24px', fill: '#000' });

    this.physics.add.collider(bombs, platforms);
    this.physics.add.collider(player, platforms);
    this.physics.add.collider(stars, platforms);

    this.physics.add.overlap(player, stars, collectStar, null, this);
    pickUpStarsSound = this.sound.add('pickup')
    bombhit = this.sound.add('die')
}

function makePlatform (startx, y, length){
    for (var i = startx; i < startx+length; i++){
        platforms.create(i * 60 + startx, y, 'tile39');
    }
}

function hitBomb (player, bomb)
{
    this.physics.pause();

    player.setTint(0xff0000);

    player.anims.play('turn');
    bombhit.play();
    gameOver = true;
}

function collectStar (player, star)
{
    star.disableBody(true, true);
    pickUpStarsSound.play();
    score += 10;
    scoreText.setText('Score: ' + score);
    if (stars.countActive(true) === 5)
    {
        stars.children.iterate(function (child) {

            child.enableBody(true, child.x, 0, true, true);

        });

        var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

        var bomb = bombs.create(x, 16, 'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);

    }
}



function update ()
{
    cursors = this.input.keyboard.createCursorKeys();

    if (cursors.left.isDown)
    {
        player.setVelocityX(-160);

        player.anims.play('left', true);
    }
    else if (cursors.right.isDown)
    {
        player.setVelocityX(160);

        player.anims.play('right', true);
    }
    else
    {
        player.setVelocityX(0);

        player.anims.play('turn');
    }

    if (cursors.up.isDown && player.body.touching.down)
    {
        player.setVelocityY(-600);
    }

    if (cursors.space.isDown && player.body.touching.down)
    {
        player.setVelocityY(-360);
    }
}