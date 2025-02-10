import { Player } from "./player";

export class Enemy extends Player {

  private currentDirection: 'left' | 'right' = 'left'

  changeDirection(direction?: 'left' | 'right'){
    if(direction)
      this.currentDirection = direction
    else {
      //console.log('Changing DIR')
      this.currentDirection = this.currentDirection === 'left' ? 'right' : 'left'
    }
    // this.body?.setVelocityX(this.currentDirection === 'left' ? -100 : 100)
    // this.body?.setAccelerationX(this.currentDirection === 'left' ? 100 : -100)
  }

  constructor(scene: Phaser.Scene, startingDirection: 'left' | 'right' = 'left'){
    super(scene)
    this.currentDirection = startingDirection
  }
  create(){
    super.create()
    this.body?.setTint(0xff0000)
    this.body?.setMaxVelocity(100, 1000)
    this.changeDirection(this.currentDirection)
    //this.body?.setAccelerationX(100)
  }
  setXY(x?: number, y?: number): Enemy {
    console.log('SETTING X Y', x, y)
    super.setXY(x, y)
    console.log('SETTING X Y',this.initialPos, this.x, this.y)
    return this
  }

  firstUpdateDone = false
  lastUD: typeof this.currentDirection | undefined = undefined
  update(time: number, delta: number): void {
    this.animateGraphics()
    this.handleListeners()
    // if(!this.firstUpdateDone){
    //   this.firstUpdateDone = true
    //   this.changeDirection(this.currentDirection)
    // }
    //this.changeDirection(this.currentDirection)
    if(this.lastUD != this.currentDirection){
      // console.log('DIR CHANGE', this.currentDirection === 'left' ? -100 : 100)
      this.lastUD = this.currentDirection
    }
    this.body?.setAccelerationX(this.currentDirection === 'left' ? -100 : 100)
  }

  killed(){
    this.body?.removeAllListeners()
    this.body?.destroy()
    this.body = undefined
    this.jumpSound.play()
  }
}