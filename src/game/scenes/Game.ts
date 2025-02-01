import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { Player } from '../objects/player';
import { Level } from '../objects/level';

export class Game extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;

    level: Level
    player: Player

    timeInLevel: number = 0

    constructor ()
    {
        super('Game');
    }

    preload(){

        this.level = new Level(this)
        this.player = new Player(this)
    
    }

    timeText: Phaser.GameObjects.Text

    create ()
    {
        // Camera
        
        this.camera = this.cameras.main;
        this.camera.flash(1000)
        this.camera.setZoom(2, 2)
        this.camera.scrollY = -260
        this.camera.backgroundColor.setTo(0, 0, 0)

        this.timeText = this.add.text(10, 10, 'Time')

        // Initiate Level map etc
        this.level.create()

        if(!this.level.map || !this.level.floor){
            console.error('CANNOT LOAD GAME')
            return
        }

        // Initiate player

        this.player.setXY(this.level.playerStartPosition.x, this.level.playerStartPosition.y)

        this.player.create(
            this.level.floor, 
            (tile) => {
                if(tile instanceof Phaser.Tilemaps.Tile && (tile.faceBottom)){
                    if(tile.alpha < 0.6)
                        setTimeout(()=> this.level.map!.removeTile(tile), 500)
                    tile.alpha -= 0.02 
                }
            },
            (tile) => {
                if(tile instanceof Phaser.Tilemaps.Tile && tile.properties.mushroom){
                    this.level.map!.removeTile(tile)
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
            this.level.background.setPosition(this.camera.scrollX * 0.7, -100)
            this.level.clouds.setPosition(this.camera.scrollX * 0.5, -100)
            if(this.player.x > this.level.finishLineX){
                this.levelCleared()
            }
        })

        EventBus.emit('current-scene-ready', this);
    }

    update(time: number, delta: number): void {
        if(this.timeInLevel === 0) this.timeInLevel = time
        this.player.update(time, delta)
        this.level.update(time, delta)
        this.timeText.x = this.player.x
        this.timeText.text = "Time: " + Math.round((time-this.timeInLevel)/1000)
    }

    changeScene ()
    {
        this.level.stop()
        this.scene.start('GameOver');
    }
    levelCleared () {
        this.level.stop()
        this.scene.start('LevelCleared');
    }
}
