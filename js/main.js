// set up our game config
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

// declare our variables
const game = new Phaser.Game(config);
let platforms;
let player;
let stars;
let score = 0;
let scoreText;
let bombs;
let gameOver;

function preload() {
    // load in all of our game assets
    this.load.image('sky', 'assets/sky.png');
    this.load.image('platform', 'assets/platform.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.spritesheet('dude', 'assets/dude.png', {
        frameWidth: 32, frameHeight: 48
    });
}

function create() {
    // -------- ADDING OUR ASSETS --------

    // add the sky
    this.add.image(400, 300, 'sky');

    // add the platforms
    platforms = this.physics.add.staticGroup();
    platforms.create(400, 568, 'platform').setScale(2).refreshBody();
    platforms.create(600, 400, 'platform');
    platforms.create(50, 250, 'platform');
    platforms.create(750, 220, 'platform');

    // add our player
    player = this.physics.add.sprite(100, 450, 'dude');
    player.setBounce(0.2); // this gives him a little bounce when he lands
    player.setCollideWorldBounds(true); // ensures our player stays in the frame
    this.physics.add.collider(player, platforms); // ensures the player collides with platforms

    // add the stars
    stars = this.physics.add.group({
        key: 'star',
        repeat: 11,
        setXY: { x: 12, y: 0, stepX: 70 }
    });
    stars.children.iterate((child) => {
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });

    this.physics.add.collider(stars, platforms); // ensure the stars collide with the platforms
    this.physics.add.overlap(player, stars, collectStar, null, this); // tell the game what to do when a player collides with a star

    bombs = this.physics.add.group();
    this.physics.add.collider(bombs, platforms);
    this.physics.add.collider(player, bombs, hitBomb, null, this);

    // -------- ANIMATIONS --------

    // left animation
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    // turn animation
    this.anims.create({
        key: 'turn',
        frames: [{ key: 'dude', frame: 4 }],
        frameRate: 10
    });

    // right animation
    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });

    // display the score
    scoreText = this.add.text(16, 16, `score: ${score}`, { fontSize: '32px', fill: '#000' });
};

function update() {
    // keyboard controls
    let cursors = this.input.keyboard.createCursorKeys();

    if (cursors.left.isDown) {
        player.setVelocityX(-160);
        player.anims.play('left', true);
    } else if (cursors.right.isDown) {
        player.setVelocityX(160);
        player.anims.play('right', true);
    } else {
        player.anims.play('turn');
        player.setVelocityX(0);
    };

    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-330);
    };
};

// this function determines what happens when the player touches a star
function collectStar(player, star) {
    star.disableBody(true, true); // this removes the star (making it look like the player has 'collected' it)
    score += 10 // add 10 to the score each time a star is collected

    if (stars.countActive(true) === 0) { // if there are no stars left
        stars.children.iterate(function (child) { // iterate over each star
            child.enableBody(true, child.x, 0, true, true); // and enable them again
        });

        // determine where the bomb should appear on the screen
        // the (player.x < 400) is there so that we put the bomb on the opposite side of the screen to where the player is
        // because having a bomb appear right on top of the player would be a bit unfair...
        let x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

        let bomb = bombs.create(x, 16, 'bomb');
        bomb.setBounce(1); // this makes the bomb continue to bounce around the screen
        bomb.setCollideWorldBounds(true); // ensure the bomb stays in the game
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20); // set a random velocity
    }
};

// this function determines what happens when a player is hit by a bomb
function hitBomb(player, bomb) {
    this.physics.pause(); // pause the game
    player.setTint(0xff0000); // turn the player red
    player.anims.play('turn'); // make player face the front
    gameOver = true;
};