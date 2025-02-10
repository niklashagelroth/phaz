import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { Player } from '../objects/player';
import { LevelMap } from '../objects/level-map';
import { KEYBOARD, Keyboard, setActiveKeyboard } from '../objects/keyboard';

export class Game extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;

    levelMap: LevelMap
    player: Player

    timeInLevel: number = 0

    constructor ()
    {
        super('Game');

        // Initiate keyboard with the active scene.
        setActiveKeyboard(new Keyboard(this))
        
    }

    preload(){
        this.levelMap = new LevelMap(this)
        this.player = new Player(this)
    }

    timeText: Phaser.GameObjects.Text

    create ()
    {
        // Camera
        
        this.timeInLevel = 0

        this.camera = this.cameras.main;
        this.camera.flash(1000)
        this.camera.setZoom(2, 2)
        this.camera.scrollY = -260
        this.camera.backgroundColor.setTo(0, 0, 0)

        this.timeText = this.add.text(10, 10, 'Time')

         // Initiate Level map etc
         this.levelMap.create()

         if(!this.levelMap.map || !this.levelMap.floor){
             console.error('CANNOT LOAD GAME')
             return
         }

        // Initiate player

        this.player.setXY(this.levelMap.playerStartPosition.x, this.levelMap.playerStartPosition.y)

        this.player.create()

        // Make camera follow the player
        this.player.addEventListener('position', () => {
            if(this.player.x - 400 < this.camera.scrollX)
                this.camera.scrollX = this.player.x - 400
            if(this.player.x + 500 - this.camera.width > this.camera.scrollX)
                this.camera.scrollX = this.player.x + 500 - this.camera.width
        
            if(this.player.y > 300)
                this.changeScene()
            this.levelMap.background.setPosition(this.camera.scrollX * 0.7, -100)
            this.levelMap.clouds.setPosition(this.camera.scrollX * 0.5, -100)
            if(this.player.x > this.levelMap.finishLineX){
                this.levelCleared()
            }
        })

        this.levelMap.registerPlayer(
            this.player, 
            (tile) => {
            if(tile instanceof Phaser.Tilemaps.Tile && (tile.faceBottom)){
                if(tile.alpha < 0.6)
                    setTimeout(()=> this.levelMap.map!.removeTile(tile), 500)
                tile.alpha -= 0.02 
            }
            },
            (tile) => {
                if(tile instanceof Phaser.Tilemaps.Tile && tile.properties.mushroom){
                    this.levelMap.map!.removeTile(tile)
                    this.player.setBig()
                }
            },
        )

        EventBus.emit('current-scene-ready', this);
    }

    update(time: number, delta: number): void {
        // Update keyboard state
        KEYBOARD.update(time, delta)

        if(this.timeInLevel === 0) this.timeInLevel = time
        this.player.update(time, delta)
        this.levelMap.update(time, delta)
        this.timeText.x = this.player.x
        this.timeText.text = "Time: " + Math.round((time-this.timeInLevel)/1000)
    }

    changeScene ()
    {
        this.levelMap.stop()
        this.scene.start('GameOver');
    }
    levelCleared () {
        this.levelMap.stop()
        this.scene.start('LevelCleared');
    }
}
