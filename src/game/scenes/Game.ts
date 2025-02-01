import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { Player } from '../objects/player';

export class Game extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Container;
    clouds: Phaser.GameObjects.Container;
    gameText: Phaser.GameObjects.Text;

    music: Phaser.Sound.BaseSound

    player: Player

    constructor ()
    {
        super('Game');
    }

    preload(){

        this.load.image({
            key: 'background',
            url: 'assets/bgGame.jpg',
        });
        this.load.image({
            key: 'cloud',
            url: 'assets/cloud.png',
        });
        this.load.image({
            key: 'ground',
            url: 'assets/platforms.png',
        });
        this.load.image({
            key: 'foundations',
            url: 'assets/world_tileset.png',
        });
        this.load.audio('music', 'assets/time_for_adventure.mp3')
        this.load.tilemapTiledJSON('tilemap', 'assets/my-world.json')

        this.player = new Player(this)
    
    }

    timeText: Phaser.GameObjects.Text

    finishLineX: number = 1000

    create ()
    {
        // Music and camera

        this.music = this.sound.add('music')
        this.music.play()
        
        this.camera = this.cameras.main;
        this.camera.flash(1000)
        this.camera.setZoom(2, 2)
        this.camera.scrollY = -260
        this.camera.backgroundColor.setTo(0, 0, 0)

        this.timeText = this.add.text(10, 10, 'Time')

        // Initiate map

        const bg1 = this.add.image(0, 0, 'background').setScale(0.8, 0.8).setOrigin(0,0).setPosition(-150, -100).setTint(0x0, 0x0, 0xffffff, 0xffffff).setAlpha(0.5)
        const bg2 = this.add.image(0, 0, 'background').setScale(0.8, 0.8).setOrigin(0,0).setPosition(650, -100).setTint(0x0, 0x0, 0xffffff, 0xffffff).setAlpha(0.5)
        const bg3 = this.add.image(0, 0, 'background').setScale(0.8, 0.8).setOrigin(0,0).setPosition(1450, -100).setTint(0x0, 0x0, 0xffffff, 0xffffff).setAlpha(0.5)
        this.background = this.add.container(0, 0, [bg1, bg2, bg3])

        const tint = 500
        this.tweens.add({
            targets: bg1,
            tint: tint,
            ease: 'Power1',
            duration: 4000,
            repeat: -1
        })
        this.tweens.add({
            targets: bg2,
            tint: tint,
            ease: 'Power1',
            duration: 4000,
            repeat: -1
        })
        this.tweens.add({
            targets: bg3,
            tint: tint,
            ease: 'Power1',
            duration: 4000,
            repeat: -1
        })

        const clouds = [
            this.add.image(0, 0, 'cloud').setScale(0.8, 0.8).setOrigin(0,0).setPosition(0, 50).setAlpha(0.8),
            this.add.image(0, 0, 'cloud').setScale(0.4, 0.4).setOrigin(0,0).setPosition(400, 150).setAlpha(0.7).setTint(0x0, 0, 0xffffff),
            this.add.image(0, 0, 'cloud').setScale(1, 1).setOrigin(0,0).setPosition(850, 0).setAlpha(0.9),
        ]
        this.clouds = this.add.container(0, 0, clouds)

        const map = this.make.tilemap({ key: 'tilemap' })
        map.addTilesetImage('foundations', 'foundations')
        map.addTilesetImage('ground', 'ground')

        map.createLayer('background', 'background')
        const floorLayer = map.createLayer('floor', ['foundations', 'ground'])?.setCollisionByProperty({collides: true}).setCollisionCategory(1)
        if(!floorLayer){
            return
        }


        // Initiate player

        const startPosition = {x: 0, y: 0}
        const gameObjLayer = map.objects.find((v)=>v.name === 'GameObjects')
        if(gameObjLayer){
            const startObj = gameObjLayer.objects.find((v) => v.name === 'Start')
            if(startObj){
                startPosition.x = startObj.x || 0
                startPosition.y = startObj.y || 0
            }
            const finishObj = gameObjLayer.objects.find((v) => v.name === 'Finish')
            if(finishObj){
                this.finishLineX = finishObj.x || 1000
            }
        }

        this.player.setXY(startPosition.x, startPosition.y)

        this.player.create(
            floorLayer, 
            (tile) => {
                if(tile instanceof Phaser.Tilemaps.Tile && (tile.faceBottom)){
                    if(tile.alpha < 0.6)
                        setTimeout(()=>map.removeTile(tile), 500)
                    tile.alpha -= 0.02 
                }
            },
            (tile) => {
                if(tile instanceof Phaser.Tilemaps.Tile && tile.properties.mushroom){
                    map.removeTile(tile)
                    this.player.setBig()
                }
            },
        )

        this.player.addEventListener('position', () => {
            if(this.player.x - 400 < this.camera.scrollX)
                this.camera.scrollX = this.player.x - 400
            if(this.player.x + 500 - this.camera.width > this.camera.scrollX)
                this.camera.scrollX = this.player.x + 500 - this.camera.width
        
            if(this.player.y > 300)
                this.changeScene()
            this.background.setPosition(this.camera.scrollX * 0.7, -100)
            this.clouds.setPosition(this.camera.scrollX * 0.5, -100)
            if(this.player.x > this.finishLineX){
                this.levelCleared()
            }
        })

        EventBus.emit('current-scene-ready', this);
    }

    update(time: number, delta: number): void {
        this.player.update(time, delta)
    }

    changeScene ()
    {
        this.music.stop()
        this.scene.start('GameOver');
    }
    levelCleared () {
        this.music.stop()
        this.scene.start('LevelCleared');
    }
}
