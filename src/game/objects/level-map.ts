import { Enemy } from "./enemy";
import { Player } from "./player";

type animationFrame = {
  duration: number
  tileid: number
}

export type TileAnimation = {
  elapsedTime: number
  firstgid: number
  tile: Phaser.Tilemaps.Tile
  tileAnimationData: animationFrame[]
}

export class LevelMap{

  scene: Phaser.Scene
  music: Phaser.Sound.BaseSound
  background: Phaser.GameObjects.Container;
  clouds: Phaser.GameObjects.Container;
  floorLayer?: Phaser.Tilemaps.TilemapLayer
  tileMap?: Phaser.Tilemaps.Tilemap
  playerStartPosition: {x: number, y: number} = {x:0,y:0}
  finishLineX: number = 1000

  player: Player
  movingPlatforms: Phaser.GameObjects.GameObject[] = []

  enemies: Enemy[] = []

  animatedTiles: TileAnimation[] = []

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
        key: 'foundations-image',
        url: 'assets/world_tileset.png',
    });
    this.scene.load.audio('music', 'assets/time_for_adventure.mp3')
    this.scene.load.tilemapTiledJSON('tilemap', 'assets/my-world.json')


    // Enemy test
    this.enemies = [new Enemy(this.scene, 'left').setXY(300, 100), new Enemy(this.scene, 'right').setXY(200, 100)]
  }

  registerPlayer(
    player: Player, 
    onGameObjectCollision: (obj: Phaser.Physics.Arcade.Body | Phaser.Tilemaps.Tile | Phaser.Types.Physics.Arcade.GameObjectWithBody) => void,
    onGameObjectOverlap: (obj: Phaser.Physics.Arcade.Body | Phaser.Tilemaps.Tile | Phaser.Types.Physics.Arcade.GameObjectWithBody) => void,
  ){
    this.movingPlatforms.forEach(mp=>{
      this.scene.physics.add.collider(player.body!, mp, ()=>{})
    })
    this.scene.physics.add.collider(player.body!, this.floor!, (bod, obj)=>{
        onGameObjectCollision(obj)
    })

    this.scene.physics.add.overlap(player.body!, this.floor!, (bod, obj) => {
        onGameObjectOverlap(obj)
    })
    this.player = player
    this.enemies.forEach(e=>{
      this.scene.physics.add.collider(player.body!, e.body!, (bod, ebod)=>{
        if((bod as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody).body.touching.down && (ebod as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody).body.touching.up){
          // Kill the enemy
          e.killed()
        } else {
          player.hit()
        }
      })
      e.body!.on('collide', () => console.log('ENEMY'))
    })
  }

  registerEnemy(
    enemy: Enemy, 
   ){
    this.movingPlatforms.forEach(mp=>{
      this.scene.physics.add.collider(enemy.body!, mp, ()=>{})
    })
    this.scene.physics.add.collider(enemy.body!, this.floor!, (e, floorObj)=>{
      
      if(e.body instanceof Phaser.Physics.Arcade.Body){
        const bod: Phaser.Physics.Arcade.Body = e.body as Phaser.Physics.Arcade.Body
        if(bod.onWall() && enemy.body?.name !== 'bouncing'){
          // console.log('WALL HIT!')
          enemy.body!.name = 'bouncing'
          enemy.changeDirection()
          setTimeout(()=>{
            enemy.body!.name = ''
          }, 500)
        } else if(bod.onFloor() && floorObj instanceof Phaser.Tilemaps.Tile){
          if((floorObj.faceLeft || floorObj.faceRight) && enemy.body?.name !== 'bouncing'){
            enemy.body!.name = 'bouncing'
            enemy.body?.setVelocityX(0)
            enemy.changeDirection()
            setTimeout(()=>{
              enemy.body!.name = ''
            }, 500)
          }
        }
      }
    })

    this.scene.physics.add.overlap(enemy.body!, this.floor!, () => {})
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

    setInterval(()=>{
      clouds.forEach((c)=>{
        c.setOrigin(c.originX + 0.001, c.originY)
      })
    }, 100)

    this.tileMap = this.scene.make.tilemap({ key: 'tilemap' })
    this.tileMap.addTilesetImage('foundations', 'foundations-image')
    this.tileMap.addTilesetImage('ground', 'ground')

    this.tileMap.createLayer('background', 'background')
    this.floorLayer = this.tileMap.createLayer('floor', ['foundations', 'ground'])?.setCollisionByProperty({collides: true}).setCollisionCategory(1)

    this.animatedTiles = handleCreateTilesData(this)
    console.log(this.animatedTiles)

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

        const movingPlatforms = gameObjLayer.objects.filter(v=>v.type==='movingplatform')
        movingPlatforms.forEach(mp=>{

            console.log(mp)
            const t= this.scene.add.tileSprite(mp.x!, mp.y!, mp.width!, mp.height!, 'foundations-image', 0)

            const gameObject = this.scene.physics.add.existing(t)
            gameObject.body!.setImmovable(true);
            gameObject.body!.allowGravity = false;
            this.movingPlatforms.push(gameObject)
            const animation = mp.properties.find(p=>p.name === 'animation')
            if(animation){
              const anim = JSON.parse(animation.value)
              this.scene.add.tween({
                x: anim.x,
                repeat: anim.repeat,
                ease: anim.method,
                yoyo: true,
                targets: gameObject,
                duration: anim.duration,
                onUpdate: (_tween, target, _key, curr, prev) => {
                  
                  if (target.body.touching.up) {
                    this.player.body!.x += curr - prev
                  }
                },    
              })
            }
            

            //const b = this.scene.physics.add.body(mp.x!, mp.y!, mp.width!, mp.height!)
            //const t = this.floorLayer?.putTileAtWorldXY(mp.gid!, mp.x!, mp.y!, true)
            
            // this.scene.physics.add.sprite(mp.x!, mp.y!)
            // const newObj = staticObjects.add(this.scene.physics.add.existing(t!))
            //newObj.setOrigin(0, 1); // Justera om Tiled har offset

        })
        
        
        
    }


    // Enemies
    this.enemies.forEach(e=>{
      e.create()
      this.registerEnemy(e)
    })

    // const debugGraphics = this.scene.add.graphics();
    // this.tileMap.renderDebug(debugGraphics, {
    //     tileColor: null,
    //     collidingTileColor: new Phaser.Display.Color(255, 0, 0, 100),
    // });

  }

  update(time: number, delta: number) {
    handleAnimateTiles(this, delta);
    this.enemies.forEach(e=>e.update(time, delta))
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




export const handleCreateTilesData = (level: LevelMap): TileAnimation[] => {
  //This is where we will store all animated tiles that are being used in this game scene
  const animatedTiles = [] as TileAnimation[];
  if(!level.tileMap){
    return []
  }
  const map = level.tileMap
  //Code to get all the tiles with animation in your tileset
  const tileData = map.tilesets[1].tileData as {[index: string]: any}
  //For each individual tile with animation in our tilemap, get only those that are actually in the actual game scene
  for (const tileid in tileData) {
    if(!tileData[tileid].animation)
      continue
    //check if any of them is on the actual game scene
    map.layers.forEach(layer  => {
      //first check in any of the layers
      layer.data.forEach(tileRow => {
          tileRow.forEach(tile => {
              if (tile.index - map.tilesets[1].firstgid === parseInt(tileid)) {
                  //In case there is any, add it to the empty array that we created at the beginning
                  animatedTiles.push({
                      tile,
                      tileAnimationData: tileData[tileid].animation as animationFrame[],
                      firstgid: map.tilesets[0].firstgid,
                      elapsedTime:0,
                    });
              }
          })
      })
    })
  }

  return animatedTiles
}

export const handleAnimateTiles = (level: LevelMap, delta: number) => {
  //For each animated tile in our game scene: 
  level.animatedTiles.forEach(tile => {
    //If there is no animated tile, don't run the code
    if (!tile.tileAnimationData) return;
    //Get the total animation duration of each tile     
    const animationDuration = tile.tileAnimationData[0].duration * tile.tileAnimationData.length
    //Check the elapsed time on your game scene since its started running each frame
    tile.elapsedTime += delta;
    tile.elapsedTime %= animationDuration
    const animatonFrameIndex = Math.floor(tile.elapsedTime / tile.tileAnimationData[0].duration);
    //Change the tile index for the next one on the list
    tile.tile.index = tile.tileAnimationData[animatonFrameIndex].tileid + tile.firstgid 
  });
};
  
  