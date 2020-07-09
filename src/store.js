import { writable } from 'svelte/store'
import GameState from './gamestate'

let gameStateStore = writable(new GameState())

export {
  gameStateStore
}
