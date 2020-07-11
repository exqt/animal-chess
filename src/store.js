import { writable, readable } from 'svelte/store'
import GameState from './gamestate'

let gameStateStore = writable(new GameState())
let gitHashStore = readable(COMMITHASH ? COMMITHASH : "1234567890123456789012345678901234567890")

export {
  gameStateStore,
  gitHashStore
}
