<script>
  import "./style.css"
  import Tile from './Tile'
  import Button from './Button'
  import CONST from './constants'
  import utils from './utils'
  import { gameStateStore, gitHashStore } from './store'
  import { DummyAI, AlphaBetaPruningAI } from './ai'

  let gameState
  gameStateStore.subscribe(v => { gameState = v })
  let gameAI = new DummyAI()
  let gameAIsecond = new DummyAI()
  let stopSecondAI = false
  let defaultDelayTime = 500
  let loaded = false
  let gameMode
  let showSelectGameMode = false
  let showGameEnd = false
  let logs = []

  function getTile(row, col) {
    let cell = document.querySelector(`.grid-cell[data-row="${row}"][data-col="${col}"]`)
    return cell.children[0]
  }

  function getTileById(tileId) {
    return document.querySelector(`#tile-id-${tileId}`)
  }

  function moveTileToGrid(tileId, row, col) {
    let tile = getTileById(tileId)
    let destCell = document.querySelector(`.grid-cell[data-row="${row}"][data-col="${col}"]`)

    if (destCell.children.length > 0) {
      let capturedTile = destCell.children[0]
      moveTileToHand(capturedTile.id, gameState.turn === 1 ? "ally-hand" : "enemy-hand")
    }

    destCell.appendChild(tile)
  }

  function moveTileToHand(tileId, handId) {
    let tile = document.getElementById(tileId)
    let hand = document.getElementById(handId)
    hand.appendChild(tile)
  }

  function move(srcRow, srcCol, destRow, destCol) {
    if (gameState.getWinner() != -1) return
    gameStateStore.update(s => {
      let newState = s.copy()
      if (newState.move(srcRow, srcCol, destRow, destCol)) {
        moveTileToGrid(utils.getId(s.get(srcRow, srcCol)), destRow, destCol)
        logs.push(`move(${srcRow}, ${srcCol}, ${destRow}, ${destCol})`)
        console.log(newState.toString())
      }
      return newState
    })
  }

  function spawn(destRow, destCol, tileId) {
    if (gameState.getWinner() != -1) return
    gameStateStore.update(s => {
      let newState = s.copy()
      if (newState.spawn(destRow, destCol, tileId)) {
        moveTileToGrid(tileId, destRow, destCol)
        logs.push(`spawn(${destRow}, ${destCol}, ${tileId})`)
        console.log(newState.toString())
      }
      return newState
    })
  }

  function newGame(_gameMode) {
    gameStateStore.update(s => {
      let newState = s.copy()
      newState.reset()
      showSelectGameMode = false
      return newState
    })

    moveTileToGrid(0, 0, 0)
    moveTileToGrid(1, 0, 1)
    moveTileToGrid(2, 0, 2)
    moveTileToGrid(3, 1, 1)

    moveTileToGrid(4, 2, 1)
    moveTileToGrid(5, 3, 0)
    moveTileToGrid(6, 3, 1)
    moveTileToGrid(7, 3, 2)
    console.log("THE GAME STARTS!")

    if (AITurnTimeout) {
      clearTimeout(AITurnTimeout)
      AITurnTimeout = null
    }

    gameMode = _gameMode
    if (gameMode == "Easy") {
      gameAI = new AlphaBetaPruningAI(2)
    }
    else if (gameMode == "Medium") {
      gameAI = new AlphaBetaPruningAI(5)
    }
    else if (gameMode == "Hard") {
      gameAI = new AlphaBetaPruningAI(8)
    }
    else if (gameMode == "SecondAI") {
      gameAI = new AlphaBetaPruningAI(5)
      gameAIsecond = new AlphaBetaPruningAI(5)
    }

    console.log(gameState.toString())
    loaded = true
    if (gameMode != "Versus") doAITurn(gameAI)

    logs = []
  }


  // AI
  let AITurnTimeout
  function doAITurn(ai, delayTime = defaultDelayTime) {
    if (AITurnTimeout) return
    AITurnTimeout = setTimeout(() => {
      if (gameState.getWinner() != -1) return
      AITurnTimeout = null

      let {state, type, parameters} = ai.doAction(gameState)
      if (type == "move") {
        move(parameters[0], parameters[1], parameters[2], parameters[3])
      }
      else if (type == "spawn") {
        spawn(parameters[0], parameters[1], parameters[2])
      }
    }, delayTime)
  }

  // Game Update
  let gameOverMessage = ""
  let gameOverMessageLower = ""
  gameStateStore.subscribe((s) => {
    if (!loaded) return

    let w = s.getWinner()
    if (w == -1) {
      gameOverMessage = "INGAME"
      gameOverMessageLower = ""
    }
    else if (w == 0) {
      if (gameMode == "Versus" || gameMode == "SecondAI") gameOverMessage = "1P WIN!"
      else {
        gameOverMessage = "YOU LOSE"
        gameOverMessageLower = "Difficulty: " + gameMode
      }
    }
    else if (w == 1) {
      if (gameMode == "Versus" || gameMode == "SecondAI") gameOverMessage = "2P WIN!"
      else {
        gameOverMessage = "YOU WIN!"
        gameOverMessageLower = "Difficulty: " + gameMode
      }
    }

    if (w != -1) {
      if (AITurnTimeout) clearTimeout(AITurnTimeout)
      showGameEnd = true
    }

    if (s.turn == 0 && gameMode != "Versus") doAITurn(gameAI)
    else if (!stopSecondAI && s.turn == 1 && gameMode == "SecondAI") doAITurn(gameAIsecond)
  })

  // Modal
  import { getContext } from 'svelte'
  import HowToPlay from './HowToPlay.svelte'
  const { open } = getContext('simple-modal')
  const showHowToPlay = () => { open(HowToPlay) }

  // Game Selection
  function onNewGameButtonClick() {
    showSelectGameMode = true
    showGameEnd = false
  }

  // Dropzone
  import { onMount } from 'svelte'
  import interact from 'interactjs'
  onMount(() => {
    for(let i=0; i<CONST.BOARD_ROW; i++) {
      for(let j=0; j<CONST.BOARD_COL; j++) {
        interact(`.grid-cell[data-row="${i}"][data-col="${j}"]`)
        .dropzone({
          accept: ".tile",
          overlap: 0.5,
        })
        .on("drop", (e) => {
          if (gameMode != "Versus" && AITurnTimeout) return

          let target = e.target
          let tile = e.draggable.target
          let destRow = parseInt(target.dataset.row)
          let destCol = parseInt(target.dataset.col)

          if (tile.parentNode.className.slice(0, 9) == "grid-cell") {
            let srcRow = parseInt(tile.parentNode.dataset.row)
            let srcCol = parseInt(tile.parentNode.dataset.col)
            move(srcRow, srcCol, destRow, destCol)
          }
          else {
            let tileId = parseInt(tile.dataset.tileId)
            spawn(destRow, destCol, parseInt(tileId))
          }
        })
      }
    }
  })

  document.addEventListener('keydown', onKeydown)
  function onKeydown(e) {
    if (e.code == "KeyS") {
      stopSecondAI = !stopSecondAI
      if (!stopSecondAI) doAITurn(gameAIsecond, 1)
    }
    else if (e.code == "KeyA") {
      doAITurn(gameAIsecond, 1)
    }
    else if (e.code == "KeyQ") {
      if (defaultDelayTime == 500) defaultDelayTime = 50
      else defaultDelayTime = 500
    }
    else if (e.code == "KeyP") {
      console.log(logs.join("\n"))
    }
  }

</script>

<style>
</style>

<div class="container">
  <div class="game-container">
    <div id="enemy-hand">
    </div>

    <div class="grid-wrapper">
      <div class="turn-indicator" data-on={loaded && gameState.turn == 0} data-team="0"></div>
      <div class="game-setting" data-on={showSelectGameMode} on:click={() => showSelectGameMode = false}>
        <div>SELECT</div>
        <div>GAME MODE</div>
        <div>
          <Button onClick={() => newGame("Easy")}>Easy</Button>
          <Button onClick={() => newGame("Medium")}>Medium</Button>
          <Button onClick={() => newGame("Hard")}>Hard</Button>
        </div>
        <div>
          <Button onClick={() => newGame("Versus")}>2P Versus</Button>
          <Button onClick={() => newGame("SecondAI")}>Bot vs Bot</Button>
        </div>
      </div>
      <div class="game-message" data-on={showGameEnd}>
        <p>{gameOverMessage}</p>
        <div class="lower">{gameOverMessageLower}</div>
      </div>
      <div class="grid">
        {#each Array(CONST.BOARD_ROW) as _, i}
          {#each Array(CONST.BOARD_COL) as _, j}
            <div
              data-row={i}
              data-col={j}
              class="grid-cell"
            />
          {/each}
        {/each}
      </div>
      <div class="turn-indicator" data-on={loaded && gameState.turn == 1} data-team="1"></div>
    </div>
    <div class="hidden-tile-container">
      <Tile tileId={0}/>
      <Tile tileId={1}/>
      <Tile tileId={2}/>
      <Tile tileId={3}/>
      <Tile tileId={4}/>
      <Tile tileId={5}/>
      <Tile tileId={6}/>
      <Tile tileId={7}/>
    </div>
    <div id="ally-hand">
    </div>
  </div>
  <div class="buttons">
    <Button onClick={onNewGameButtonClick}>NEW GAME</Button>
    <Button onClick={showHowToPlay}>HOW TO PLAY</Button>
  </div>
  <div class="github">
    <a href={`https://github.com/exqt/animal-chess/commit/${$gitHashStore}`}>{($gitHashStore).slice(0, 10)}</a>
  </div>
</div>
