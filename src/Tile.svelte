<script>
  import "./tile.css"
  import { gameStateStore } from './store'
  import interact from 'interactjs'
  const utils = require("./utils")
  const CONST = require("./constants")

  export let tileId

  let type
  let team
  let emoji = "?"
  let dotPositions = []
  let draggable

  gameStateStore.subscribe((s) => {
    let tileInfo = s.findTileById(tileId)
    if (!tileInfo) return
    team = utils.getTeam(tileInfo.tile)
    type = utils.getType(tileInfo.tile)

    if (type == CONST.LION) {
      emoji = "🦁"
      dotPositions = [true, true, true, true, false, true, true, true, true]
    }
    else if (type == CONST.ELEPHANT) {
      emoji = "🐘"
      dotPositions = [true, false, true, false, false, false, true, false, true]
    }
    else if (type == CONST.GIRAFFE) {
      emoji = "🦒"
      dotPositions = [false, true, false, true, false, true, false, true, false]
    }
    else if (type == CONST.CHICK) {
      emoji = "🐤"
      dotPositions = [false, true, false, false, false, false, false, false, false]
    }
    else if (type == CONST.HEN) {
      emoji = "🐓"
      dotPositions = [true, true, true, true, false, true, false, true, false]
    }
    draggable = s.turn == team
  })

  let isDragging = false
  let tx = 0
  let ty = 0

  import { onMount } from 'svelte'
  let tileElement
  onMount(() => {
    interact(tileElement).draggable({
      listeners: {
        start(e) {
          if (draggable) isDragging = true
        },
        move(e) {
          if (isDragging) {
            tx += e.dx
            ty += e.dy
          }
        },
        end(e) {
          isDragging = false
          tx = 0
          ty = 0
        }
      }
    })
  })
</script>

<div class="tile"
  id={"tile-id-" + tileId}
  data-team={team === 0 ? "enemy" : "ally"}
  data-type={type}
  data-tile-id={tileId}
  style={`left: ${tx}px; top: ${ty}px; ${isDragging?"z-index: 100;":""}`}
  bind:this={tileElement}
  >
  <div class="tile-dot-container">
    {#each Array(9) as _, i}
      {#if dotPositions[i]}
        <span class="tile-dot"/>
      {:else}
        <span class="tile-dot-hidden"/>
      {/if}
    {/each}
  </div>
  <div class="tile-emoji">{emoji}</div>
</div>
