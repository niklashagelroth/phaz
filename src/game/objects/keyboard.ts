export const KEYS = <const>['down', 'up', 'left', 'right', 'space']

export type KEY =  typeof KEYS[number]

export type ActiveKey = {
  key: KEY
  pressedTime: number
  justDown: boolean
  pressed: boolean
  justReleased: boolean
}

export let KEYBOARD: Keyboard

export function setActiveKeyboard(keyboard: Keyboard){
  KEYBOARD = keyboard
}

export class Keyboard {
  scene: Phaser.Scene
  activeKeys: Map<KEY, ActiveKey>
  // listeners: {
  //     event: 'pressed' | 'released',
  //     key: KEY,
  //     callback: () => void,
  //   }[]

  constructor(scene: Phaser.Scene){
    this.scene = scene
    this.activeKeys = new Map<KEY, ActiveKey>()
    // this.listeners = []
  }


  justPressed(key: KEY): boolean {
    return !!this.activeKeys.get(key)?.justDown
  }

  justReleased(key: KEY): boolean {
    return !!this.activeKeys.get(key)?.justReleased
  }

  isPressed(key: KEY): boolean {
    return !!this.activeKeys.get(key)?.pressed
  }

  pressDuration(key: KEY): number {
    return this.activeKeys.get(key)?.pressedTime || 0
  }

  private getKey(key: KEY): number | undefined {
    switch(key){
      case 'down':
        return Phaser.Input.Keyboard.KeyCodes.DOWN
      case 'up':
        return Phaser.Input.Keyboard.KeyCodes.UP
      case 'left':
        return Phaser.Input.Keyboard.KeyCodes.LEFT
      case 'right':
        return Phaser.Input.Keyboard.KeyCodes.RIGHT
      case 'space':
        return Phaser.Input.Keyboard.KeyCodes.SPACE
    }
    return undefined
  }

  lastUpdate: number

  update(time: number, delta: number){
    if(this.lastUpdate === time){
      // Skip
      console.error('Not allowed to call update twice during the same update loop')
      return
    }
    this.lastUpdate = time

    for(const key of KEYS){
      const tkey = this.getKey(key)
      if(!tkey){
        console.error('UNSUPPORTED KEY', tkey)
        continue
      }
      // const dur = Phaser.Input.Keyboard.JustDown(this.scene.input.keyboard!.addKey(tkey))
      const dur = this.scene.input.keyboard?.addKey(tkey).getDuration()
      const wasActive = this.activeKeys.get(key)
      if((!wasActive || wasActive.justReleased) && dur){
        // console.log(key, 'JUST PRESSED')
        this.activeKeys.set(key, {
          justDown: true,
          justReleased: false,
          key: key,
          pressed: true,
          pressedTime: dur,
        })
      } else if(wasActive && !dur){
        if(wasActive.justReleased){
          // console.log(key, 'RELEASED')
          this.activeKeys.delete(key)
        } else {
          // console.log(key, 'JUST RELEASED')
          this.activeKeys.set(key, {
            justDown: false,
            justReleased: true,
            key: key,
            pressed: false,
            pressedTime: wasActive.pressedTime,
          })
        }
      } else if(wasActive && dur){
        // console.log(key, 'PRESSED')
        this.activeKeys.set(key, {
          justDown: false,
          justReleased: false,
          key: key,
          pressed: true,
          pressedTime: dur,
        })
      }
    }
  }
  
}