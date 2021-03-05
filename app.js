class Alien {
   
   constructor(index, alive=true ) {
     this._index = index
     this._alive = alive
   }

   get alive() {
      return this._alive
   }   
   
   set alive(value) {
      return this._alive = value
   }
   
   get index() {
      return this._index
   } 
    
   set index(value) {
      this._index = value
   }
}



class Swarm {
  constructor(rows,cols,screenWidth) {
    this._rows = rows
    this._cols = cols
    this._screenWidth = screenWidth
    this._aliens = Array(rows*cols).fill().map((unused,i) =>  new Alien(i))
    this._aliens = this.setUpInitialIndex()
    this._aliensSetDead = 0
  }  
    
   setUpInitialIndex() {
      var temp = []
      for (let i = 0; i < this._rows; i++) {
        temp = temp.concat(this.moveRow(i))
      }
      return temp
   }
 
    moveRow(index) {
         let temp3 =  this._aliens.slice( index*this._cols, index*this._cols + this._cols)
         temp3.forEach( (anAlien,i) => anAlien.index = index*this._screenWidth + i)
         return temp3
    }
     
    anyAlive(inCol) { 
         //console.log(` the column is ${inCol}`)
         return this._aliens[inCol].alive || 
                this._aliens[1*this._cols + inCol].alive || 
                this._aliens[2*this._cols + inCol].alive 
    }
      
  
    get aliens() {
        return this._aliens
    }
    
    
    killAlienWithIndex(index) {
        this._aliens[this._aliens.findIndex(anAlien => anAlien.index === index)].alive = false
        this._aliensSetDead++
        //console.log(this._aliensSetDead)
    }
    
    areAliensAllDead() {
      return (this._aliensSetDead === this._rows*this._cols)
    }
    
    get aliensSetDead() {
      return this._aliensSetDead
    }

}

class Squares {
   constructor(squares) {
     this._squares = squares
   }
  remove(item, at) {
    this._squares[at].classList.remove(item)
  }
  add(item, at) {
    this._squares[at].classList.add(item)
  }
  contains(item, at) {
    return this._squares[at].classList.contains(item)
  }
  empty(item) {
    this._squares.forEach( aSquare => aSquare.classList.remove(item))
  }
  
}


class Shooter {
    constructor(position, squares, width) {
       this._position = position
       this._squares = squares
       this._width = width
    }
 
 
  moveShooter(event, gameInPlay) {
    //console.log("MOVE")
    if (!gameInPlay) { 
      return
    }
    this._squares.remove('shooter', this._position)
    switch(event.keyCode) {
      case 37:
        if( this._position % this._width !== 0) this._position -= 1
        break
      case 39:
        if ( this._position % this._width < this._width - 1) this._position += 1
        break
    }
    this._squares.add('shooter', this._position)
  }
 
  get position() {
    return this._position
  }
   
}


document.addEventListener('DOMContentLoaded', () => {
  const squaresReal = document.querySelectorAll('.grid div')
  const resultDisplay = document.querySelector('span')
  const startBtn = document.querySelector('.start')
  const gameArea = document.querySelector('.grid')
  let width = 15
  //let squaresLength = squares.length 
  //Position shooter 1 row up on screen and in the middle
  let currentShooterIndex = squaresReal.length - 1*width - Math.floor(width/2) -2
  let currentInvaderIndex = 0
  let alienInvadersTakenDown = []
  let MOVE_RIGHT = 1
  let MOVE_LEFT = -1
  let MOVE_DOWN_ONE_ROW_THEN_RIGHT = 3
  let MOVE_DOWN_ONE_ROW_THEN_LEFT = 4
  let direction = MOVE_RIGHT
  let invaderId
  let rows = 3
  let cols = 10
  let swarm = new Swarm(rows,cols,width)  
  let leftEdge = 0
  let rightEdge = cols - 1
  let gameInPlay = false
  let squares = new Squares(squaresReal)
  let shooter = new Shooter(currentShooterIndex, squares, width)
  let history = []  //debug code
 
  function startGame() {
    //console.log("start")
      if (gameInPlay) {
       return  
     }
     gameInPlay = true
  
    //Clean out the squares from previous game
    squares = new Squares(squaresReal)
    swarm = new Swarm(rows,cols,width)  
    squares.empty('invader')
    //Remove previous shooter, may be dead
    squares.remove('invader', shooter.position)
    squares.remove('shooter', shooter.position)
    squares.remove('boom', shooter.position)  
      
    //Get ready for new shooter
    currentShooterIndex = squaresReal.length - 1*width - Math.floor(width/2) -2
    currentInvaderIndex = 0
    alienInvadersTakenDown = []
    shooter = new Shooter(currentShooterIndex, squares, width)

    direction = MOVE_RIGHT
    leftEdge = 0
    rightEdge = cols - 1
  
    history = []  //debug code
  
    swarm.aliens.forEach( invader => squares.add('invader',currentInvaderIndex + invader.index))
    squares.add('shooter',currentShooterIndex)
    resultDisplay.textContent = ` ${swarm.aliensSetDead} `
    invaderId = setInterval(moveInvaders, 200)

   }



   function record(direction) {
       switch (direction) {
       case MOVE_LEFT: 
          history.push(`MOVE_LEFT ${leftEdge}  ${rightEdge}`)
        break;
       case MOVE_RIGHT: 
          history.push(`MOVE_RIGHT ${leftEdge}  ${rightEdge}`)
        break;
      case MOVE_DOWN_ONE_ROW_THEN_LEFT: 
                       history.push(`MOVE_DOWN_ONE_ROW_THEN_LEFT ${leftEdge}  ${rightEdge}`)
                break;
       case MOVE_DOWN_ONE_ROW_THEN_RIGHT: 
                      history.push(`MOVE_DOWN_ONE_ROW_THEN_RIGHT ${leftEdge}  ${rightEdge}`)
                break;
       default: 
         console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&")
    }
  }
  //move the alien invaders
  function moveInvaders() {
    switch (direction) {
       case MOVE_LEFT: 
          if (leftEdge <= 0 ) {
             if (swarm.anyAlive(-leftEdge)) {
                direction = MOVE_DOWN_ONE_ROW_THEN_RIGHT
             }
        }
        break;
  
       case MOVE_RIGHT: 
         if (rightEdge >= width - 1) {
                if (swarm.anyAlive(cols - 2 - (rightEdge - width))) {
                   direction = MOVE_DOWN_ONE_ROW_THEN_LEFT
                }
        }
        break;
      case MOVE_DOWN_ONE_ROW_THEN_LEFT: 
                direction = MOVE_LEFT
                break;
       case MOVE_DOWN_ONE_ROW_THEN_RIGHT: 
                direction = MOVE_RIGHT
                break;
                
      default: 
         console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&")
                
    }
    record(direction)
      //Remove all invaders from screen
      swarm.aliens.forEach( anAlien => {
        //This is for reaching bottom and cell being alive
        try {
           squares.remove('invader', anAlien.index)
        }
        catch (exception) {
          
        }
      })
      //Update invaders position on board
      
        let offset = 0
        if (direction === MOVE_LEFT || direction === MOVE_RIGHT) {
            offset = direction 
        } else {
            offset = width
        }
  
      //for (let i = 0; i <= swarm.aliens.length - 1; i++) {
        swarm.aliens.forEach( anAlien => {
          anAlien.index += offset
        })
      
      //}
      if (direction === MOVE_LEFT || direction === MOVE_RIGHT) {
           leftEdge = leftEdge + direction
           rightEdge = rightEdge + direction
      }
        
      //Only show invaders which have not been killed
      swarm.aliens.forEach( anAlien => {
        if (anAlien.alive){
          squares.add('invader', anAlien.index)
        }
      })

    //At this point we have updated the invaders position 
    //Have we moved the invaders over the shooter?
    //console.log(squares[currentShooterIndex].classList)
    //Can we remove shooter class as its always there
    if(squares.contains('invader',shooter.position)) {
      resultDisplay.textContent = ` ${swarm.aliensSetDead} Game Over`
      squares.add('boom', shooter.position)
      clearInterval(invaderId)
      console.log("OVER SHOOTER ENDING")
      gameInPlay = false
      return //No point checking other details
    }

    //Have we reach the bottom row?
    swarm.aliens.forEach( anAlien => {
      if(anAlien.index > (squaresReal.length - (width - 1)) && 
         anAlien.alive){
        resultDisplay.textContent = ` ${swarm.aliensSetDead} Game Over`
        clearInterval(invaderId)  //stop invaders moving
        //console.log("BOTTOM ENDING")
        gameInPlay = false
        return //No point checking other details
      }
    })

    //Are all the aliens dead
    if(swarm.areAliensAllDead()) {
      //console.log(alienInvadersTakenDown.length)
      //console.log(alienInvaders.length)
      resultDisplay.textContent = ` ${swarm.aliensSetDead} You Win`
      clearInterval(invaderId)
      console.log("DEAD ENDING")
      gameInPlay = false
      return //No point checking other details
    }
  }
  
 

  //shoot at aliens
  function fire() {
     //console.log("SHOOT")

    if (!gameInPlay) {
       return
    }
    let laserId
    let currentLaserIndex = shooter.position
    //move the laser from the shooter to the alien invader
    function moveLaser() {
      //console.log(laserId)
      //Move laser up one row
      squares.remove('laser',currentLaserIndex)
      currentLaserIndex -= width
      squares.add('laser', currentLaserIndex)
      
      //Does the new laser position contain an alien
      if(squares.contains('invader',currentLaserIndex)) {
        //Remove laser, invader and show a boom
         squares.remove('laser', currentLaserIndex)
         squares.remove('invader', currentLaserIndex)
         squares.add('boom', currentLaserIndex)
         setTimeout(() => squares.remove('boom',currentLaserIndex), 250)
         clearInterval(laserId)

         swarm.killAlienWithIndex(currentLaserIndex) 
         
         resultDisplay.textContent = ` ${swarm.aliensSetDead} `
      }

      //At top of the screen so remove its function in setTimeout
      if(currentLaserIndex < width) {
        clearInterval(laserId)
        setTimeout(() => squares.remove('laser',currentLaserIndex), 100)
      }
    }
    
    laserId = setInterval(moveLaser, 100)
  }
  
  function masterKeyUp(event) {
      //Using space bar generates events for button??
      //Watch button appear to be clicked if you change this
      //86 to 32???????????????
      //Even now accidently pressing space bar generates the effect
      if (event.keyCode === 86) {
           fire()
      } else {
          shooter.moveShooter(event, gameInPlay)
      }
      //event.stopImmediatePropagation()
        
   }
   function masterClick(event) {
      //Expect undefined when mouse event
      if (event.keyCode === undefined) {
         //console.log(event.target)
         startGame()
      }
    } 
        
  
  //console.log(squares.length)
  //Using () => allows code to go in a class
  //Can not gameInPlay on the left of the =>
  document.addEventListener('keydown', masterKeyUp) 
  startBtn.addEventListener('click', masterClick) 

})
