import { GameObjects, Scene } from 'phaser';

import { EventBus } from '../EventBus';

export class MainMenu extends Scene
{
    background: GameObjects.Image;
    logo: GameObjects.Image;
    logoTween: Phaser.Tweens.Tween | null;

    constructor ()
    {
        super('MainMenu');
    }

    menuOptions = [
        { text: 'Start Game', action: this.startGame.bind(this) },
        { text: 'Options', action: this.showCredits.bind(this) },
        { text: 'Credits', action: this.showCredits.bind(this) }
    ];

    renderMenu () {
        const y = 460;
        this.menuOptions.forEach((option, index) => {
            const text = this.add.text(512, y + (index * 60), option.text, {
                fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
                stroke: '#000000', strokeThickness: 8,
                align: 'center'
            }).setOrigin(0.5).setDepth(100);
            text.setInteractive();
            text.on('pointerdown', option.action);
            text.on('pointerover', () => {
                text.setAlpha(0.7)
                text.setScale(1.1);
            });
            text.on('pointerout', () => {
                text.setAlpha(1)
                text.setScale(1);
            });
        });
    }

    create ()
    {
        this.background = this.add.image(512, 384, 'background');

        this.logo = this.add.image(512, 300, 'logo').setDepth(100);

        this.renderMenu();

        EventBus.emit('current-scene-ready', this);
    }
    
    startGame ()
    {
        this.scene.start('Game');
    }
    showCredits ()
    {
        this.scene.start('Credits');
    }
}
