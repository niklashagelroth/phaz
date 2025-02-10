import { Boot } from './scenes/Boot';
import { GameOver } from './scenes/GameOver';
import { Game as MainGame } from './scenes/Game';
import { MainMenu } from './scenes/MainMenu';
import { AUTO, Game } from 'phaser';
import { Preloader } from './scenes/Preloader';
import { Credits } from './scenes/Credits';
import { LevelCleared } from './scenes/LevelCleared';

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: 1024,
    height: 768,
    parent: 'game-container',
    backgroundColor: '#028af8',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {x: 0, y: 1000 },
            // debug: true
        }
    },

    fps: {
        target: 60,
        forceSetTimeOut: true
    },
    scene: [
        Boot,
        Preloader,
        MainMenu,
        MainGame,
        GameOver,
        Credits,
        LevelCleared,
    ]
};

const StartGame = (parent: string) => {

    return new Game({ ...config, parent });

}

export default StartGame;
