import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class LevelCleared extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameOverText : Phaser.GameObjects.Text;

    constructor ()
    {
        super('LevelCleared');
    }

    create ()
    {
        this.camera = this.cameras.main
        this.camera.setBackgroundColor(0x00ff00);

        this.gameOverText = this.add.text(512, 384, 'Level Cleared!', {
            fontFamily: 'Arial Black', fontSize: 64, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);
        this.gameOverText.setInteractive()
        this.gameOverText.addListener('pointerdown', ()=>{
            this.changeScene()
        })
        this.changeScene()
        EventBus.emit('current-scene-ready', this);
    }

    changeScene ()
    {
        setTimeout(()=>this.scene.start('Game'), 500)
    }
}
