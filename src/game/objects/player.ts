import { KEYBOARD } from "./keyboard"

type PLAYER_EVENTS = 'died' | 'position'

export class Player {


  body?: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
  scene: Phaser.Scene
  jumpSound: Phaser.Sound.BaseSound
  initialPos: {x: number, y: number}

  acceleration = 1000
  topVelocity = 400

  lastTimeOnFloor = 0


  constructor(scene: Phaser.Scene){
    this.scene = scene
    this.initialPos = {x:0,y:0}
    this.init()
  }

  init() {
    this.scene.load.spritesheet('knight', 'assets/knight.png', {
        frameWidth: 32,
        frameHeight: 32,
        startFrame: 0,
        endFrame: 63,
        margin: 0,
        spacing: 0,
    })
    this.scene.load.audio('jumpSound', 'assets/sounds/jump.wav')
  }

  setXY(x?: number, y?: number) {
    console.log('Setting X Y', x, y)
    if(!this.body){
      this.initialPos.x = x || 0
      this.initialPos.y = y || 0
      return
    }

    this.body.body.x = x || 0
    this.body.body.y = y || 0
  }

  get x(){
    return this.body?.body.x || 0
  }

  get y(){
    return this.body?.body.y || 0
  }

  create(){
    this.scene.anims.create({
        key: 'idle',
        frames: this.scene.anims.generateFrameNumbers('knight', { start: 0, end: 3 }),
        frameRate: 5,
        repeat: -1
    });
    this.scene.anims.create({
        key: 'run',
        frames: this.scene.anims.generateFrameNumbers('knight', { start: 16, end: 31 }),
        frameRate: 16,
        repeat: -1
    });
    this.scene.anims.create({
        key: 'roll',
        frames: this.scene.anims.generateFrameNumbers('knight', { start: 40, end: 47 }),
        frameRate: 7,
        repeat: -1
    });
    this.jumpSound = this.scene.sound.add('jumpSound')

    this.body = this.scene.physics.add.sprite(this.initialPos.x, this.initialPos.y, 'knight').setBodySize(12, 22, true)

    this.body.anims.play('run', true)

    this.body.setBounce(0.1)
    this.body.setDragX(500)
    this.body.setFrictionX(0.1)
    this.body.setMaxVelocity(this.topVelocity, 1000)
    
  }

  eventListeners: {evtType: PLAYER_EVENTS, callback: (self: Player) => void}[] = []
  addEventListener(evtType: PLAYER_EVENTS, callback: (self: Player) => void){
    this.eventListeners.push({evtType, callback})
  }
  notifyListeners(evtType: PLAYER_EVENTS) {
    this.eventListeners.filter(e=>e.evtType === evtType).forEach((e)=>{
      e.callback(this)
    })
  }

  animateGraphics(){
    if(!this.body)
      return
    if(!this.body.body.onFloor()){
      this.body.anims.play('roll', true)
    } else {
        if(this.body.body.velocity.x > 100 || this.body.body.velocity.x < -100){
            this.body.anims.play('run', true)
        } else {
            this.body.anims.play('idle', true)
        }
    }
    if(this.body.body.acceleration.x>0){
      this.body.flipX = false
    } else if(this.body.body.acceleration.x<0){
      this.body.flipX = true
    }
  }

  handleKeyboard(time: number){
    if(!this.body)
      return
    if (KEYBOARD.justPressed('left')/*Phaser.Input.Keyboard.JustDown(this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT) )*/){
      if(this.body.body.velocity.x > 0)
          this.body.body.setVelocityX(Math.max(this.body.body.velocity.x - 200, 0))
    } 
    if (KEYBOARD.justPressed('right')/*Phaser.Input.Keyboard.JustDown(this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT) )*/){
      if(this.body.body.velocity.x < 0)
          this.body.body.setVelocityX(Math.min(this.body.body.velocity.x + 200, 0))
    }
    
    const leftDur = KEYBOARD.pressDuration('left')//this.scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT).getDuration()
    if (leftDur) {
        this.body.body.setAccelerationX(-500)
    }
    const rightDur = KEYBOARD.pressDuration('right') //this.scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT).getDuration()
    if (rightDur) {
        this.body.body.setAccelerationX(500)
    }
    if(leftDur === rightDur){
        this.body.body.setAccelerationX(0)
    }
    const spaceDur = this.scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE).getDuration()
    if(spaceDur){
        if(this.body.body.onFloor()){
            this.lastTimeOnFloor = time
            this.body.body.setVelocityY(-300)
            this.jumpSound.play()
        } else if(time - this.lastTimeOnFloor < 250) {
            this.body.body.setVelocityY(-300)
        }
    } else {
        this.lastTimeOnFloor = 0
    }
  }

  handleListeners(){
    if(!this.body)
      return
    if(this.body.body.x !== this.lastPosition.x || this.body.body.y !== this.lastPosition.y) {
      this.notifyListeners('position')
    }
    this.lastPosition.x = this.body.body.x
    this.lastPosition.y = this.body.body.y
  }

  lastPosition: {x: number, y: number} = {x:0, y:0}

  update(time: number, delta: number){
    this.handleKeyboard(time)
    this.animateGraphics()
    this.handleListeners()
  }

  setBig(){
    this.body?.setScale(1.5)
  }

  hit(){
    if(this.body?.scale === 1.5){
      this.body.setScale(1)
    }
  }
}