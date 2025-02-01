

export class Level{

  scene: Phaser.Scene
  music: Phaser.Sound.BaseSound
  background: Phaser.GameObjects.Container;
  clouds: Phaser.GameObjects.Container;
  floorLayer?: Phaser.Tilemaps.TilemapLayer
  tileMap?: Phaser.Tilemaps.Tilemap
  playerStartPosition: {x: number, y: number} = {x:0,y:0}
  finishLineX: number = 1000

  constructor(scene: Phaser.Scene){
    this.scene = scene
    this.init()
  }

  init() {
    this.scene.load.image({
      key: 'background',
      url: 'assets/bgGame.jpg',
    });
    this.scene.load.image({
        key: 'cloud',
        url: 'assets/cloud.png',
    });
    this.scene.load.image({
        key: 'ground',
        url: 'assets/platforms.png',
    });
    this.scene.load.image({
        key: 'foundations',
        url: 'assets/world_tileset.png',
    });
    this.scene.load.audio('music', 'assets/time_for_adventure.mp3')
    this.scene.load.tilemapTiledJSON('tilemap', 'assets/my-world.json')
  }

  create() {
    this.music = this.scene.sound.add('music')
    this.music.play()

    // Initiate map

    const bg1 = this.scene.add.image(0, 0, 'background').setScale(0.8, 0.8).setOrigin(0,0).setPosition(-150, -100).setTint(0x0, 0x0, 0xffffff, 0xffffff).setAlpha(0.5)
    const bg2 = this.scene.add.image(0, 0, 'background').setScale(0.8, 0.8).setOrigin(0,0).setPosition(650, -100).setTint(0x0, 0x0, 0xffffff, 0xffffff).setAlpha(0.5)
    const bg3 = this.scene.add.image(0, 0, 'background').setScale(0.8, 0.8).setOrigin(0,0).setPosition(1450, -100).setTint(0x0, 0x0, 0xffffff, 0xffffff).setAlpha(0.5)
    this.background = this.scene.add.container(0, 0, [bg1, bg2, bg3])

    const tint = 500
    this.scene.tweens.add({
        targets: bg1,
        tint: tint,
        ease: 'Power1',
        duration: 4000,
        repeat: -1
    })
    this.scene.tweens.add({
        targets: bg2,
        tint: tint,
        ease: 'Power1',
        duration: 4000,
        repeat: -1
    })
    this.scene.tweens.add({
        targets: bg3,
        tint: tint,
        ease: 'Power1',
        duration: 4000,
        repeat: -1
    })

    const clouds = [
      this.scene.add.image(0, 0, 'cloud').setScale(0.8, 0.8).setOrigin(0,0).setPosition(0, 50).setAlpha(0.8),
      this.scene.add.image(0, 0, 'cloud').setScale(0.4, 0.4).setOrigin(0,0).setPosition(400, 150).setAlpha(0.7).setTint(0x0, 0, 0xffffff),
      this.scene.add.image(0, 0, 'cloud').setScale(1, 1).setOrigin(0,0).setPosition(850, 0).setAlpha(0.9),
    ]
    this.clouds = this.scene.add.container(0, 0, clouds)

    this.tileMap = this.scene.make.tilemap({ key: 'tilemap' })
    this.tileMap.addTilesetImage('foundations', 'foundations')
    this.tileMap.addTilesetImage('ground', 'ground')

    this.tileMap.createLayer('background', 'background')
    this.floorLayer = this.tileMap.createLayer('floor', ['foundations', 'ground'])?.setCollisionByProperty({collides: true}).setCollisionCategory(1)

    const gameObjLayer = this.tileMap.objects.find((v)=>v.name === 'GameObjects')
    if(gameObjLayer){
        const startObj = gameObjLayer.objects.find((v) => v.name === 'Start')
        if(startObj){
            this.playerStartPosition.x = startObj.x || 0
            this.playerStartPosition.y = startObj.y || 0
        }
        const finishObj = gameObjLayer.objects.find((v) => v.name === 'Finish')
        if(finishObj){
            this.finishLineX = finishObj.x || 1000
        }
    }
  }

  update(time: number, delta: number) {

  }

  stop() {
    this.music.stop()
  }

  get map(){
    return this.tileMap
  }

  get floor(){
    return this.floorLayer
  }
}