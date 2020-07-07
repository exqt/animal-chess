const CONST = require('./constants')
const utils = require('./utils')

class GameState {
  constructor() {
    this.reset()
  }

  reset() {
    this.cells = []
    this.turn = 0
    this.totalturns = 0
    this.hands = [[], []]

    for(let i=0; i<CONST.BOARD_ROW; i++) {
      this.cells[i] = []
      for(let j=0; j<CONST.BOARD_COL; j++) {
        this.cells[i].push(CONST.EMPTY)
      }
    }

    this.cells[0][0] = utils.createTile(0, CONST.GIRAFFE, 0)
    this.cells[0][1] = utils.createTile(0, CONST.LION, 1)
    this.cells[0][2] = utils.createTile(0, CONST.ELEPHANT, 2)
    this.cells[1][1] = utils.createTile(0, CONST.CHICK, 3)
    this.cells[2][1] = utils.createTile(1, CONST.CHICK, 4)
    this.cells[3][0] = utils.createTile(1, CONST.ELEPHANT, 5)
    this.cells[3][1] = utils.createTile(1, CONST.LION, 6)
    this.cells[3][2] = utils.createTile(1, CONST.GIRAFFE, 7)
  }

  get(r, c) {
    return this.cells[r][c]
  }

  copy() {
    let s = new GameState()
    s.cells = []
    for(let i=0; i<CONST.BOARD_ROW; i++) s.cells[i] = this.cells[i].slice()
    s.turn = this.turn
    s.totalturns = this.totalturns
    s.hands[0] = this.hands[0].slice()
    s.hands[1] = this.hands[1].slice()

    return s
  }

  isEqual(state) {
    if(this.turn != state.turn) return false
    if(this.hands[0].length != state.hands[0].length) return false
    if(this.hands[1].length != state.hands[1].length) return false

    for(let i=0; i<this.hands[0].length; i++) {
      if(utils.getType(this.hands[0][i]) != utils.getType(state.hands[0][i])) return false
    }
    for(let i=0; i<this.hands[1].length; i++) {
      if(utils.getType(this.hands[1][i]) != utils.getType(state.hands[1][i])) return false
    }
    for(let i=0; i<CONST.BOARD_ROW; i++) {
      for(let j=0; j<CONST.BOARD_ROW; j++) {
        if(utils.getType(this.cells[i][j]) != utils.getType(this.cells[i][j])) return false
        if(utils.getTeam(this.cells[i][j]) != utils.getTeam(this.cells[i][j])) return false
      }
    }
    return true
  }

  findTileById(id) {
    for(let i=0; i<CONST.BOARD_ROW; i++) {
      for(let j=0; j<CONST.BOARD_COL; j++) {
        if(utils.getId(this.cells[i][j]) == id) return {"where": "grid", "row": i, "col": j, "tile": this.cells[i][j]}
      }
    }
    for(let i=0; i<this.hands[0].length; i++) {
      if(utils.getId(this.hands[0][i]) == id) return {"where": "red_hand", "index": i, "tile": this.hands[0][i]}
    }
    for(let i=0; i<this.hands[1].length; i++) {
      if(utils.getId(this.hands[1][i]) == id) return {"where": "blue_hand", "index": i, "tile": this.hands[1][i]}
    }
  }

  isValidMove(r, c, nr, nc, checkDirection = true) {
    if(!utils.isInside(r, c)) return false
    if(!utils.isInside(nr, nc)) return false
    if(this.getWinner() != -1) return false
    if(this.cells[r][c] === CONST.EMPTY) return false
    if(utils.getTeam(this.cells[r][c]) !== this.turn) return false
    if(utils.getTeam(this.cells[r][c]) === utils.getTeam(this.cells[nr][nc])) return false

    if(checkDirection) {
      let team = utils.getTeam(this.cells[r][c])
      let tileType = utils.getType(this.cells[r][c])
      for(let [dr, dc] of CONST.MOVEMENTS[tileType]) {
        let pr = r + (team === 0 ? -1 : 1) * dr
        let pc = c + dc
        if(nr == pr && nc == pc) return true
      }
      return false
    }

    return true
  }

  addToHand(tile) {
    if(this.turn === 0) this.hands[0].push(utils.changeTeam(tile, 0))
    else this.hands[1].push(utils.changeTeam(tile, 1))
  }

  toString() {
    let r = ""
    for(let i=0; i<CONST.BOARD_ROW; i++) {
      let s = ""
      for(let j=0; j<CONST.BOARD_COL; j++) {
        s += utils.converTileToChar(this.cells[i][j])
      }
      if(i == 0) s += " (" + this.hands[0].map(utils.converTileToChar).join("") + ")"
      if(i == 3) s += " (" + this.hands[1].map(utils.converTileToChar).join("") + ")"
      r += s + '\n'
    }
    r += `Turn: ${this.turn === 0 ? "RED" : "BLUE"} ${this.totalturns}`

    return r
  }

  getWinner() {
    if(this.hands[0].filter((x) => utils.getType(x) == CONST.LION).length > 0) return 0
    if(this.hands[1].filter((x) => utils.getType(x) == CONST.LION).length > 0) return 1

    if(this.turn === 1 && this.cells[0].filter((x) => utils.getType(x) == CONST.LION && utils.getTeam(x) == 1).length > 0) return 1
    if(this.turn === 0 && this.cells[3].filter((x) => utils.getType(x) == CONST.LION && utils.getTeam(x) == 0).length > 0) return 0

    return -1
  }

  hash() {
    let p = 1000000007
    let b = 10007
    let h = 0

    for(let i=0; i<CONST.BOARD_ROW; i++) {
      for(let j=0; j<CONST.BOARD_COL; j++) {
        h = (h * b) % p
        h = (h + (this.cells[i][j] & 0b11111)) % p
      }
    }
    for(let tile of this.hands[0]) {
      h = (h * b) % p
      h = (h + (tile & 0b11111)) % p
    }

    return h
  }

  getPossibleMoves(r, c) {
    let team = utils.getTeam(this.cells[r][c])
    let tileType = utils.getType(this.cells[r][c])
    let ret = []

    for(let [dr, dc] of CONST.MOVEMENTS[tileType]) {
      let nr = r + (team === 0 ? -1 : 1) * dr
      let nc = c + dc
      if(this.isValidMove(r, c, nr, nc, false)) ret.push([nr, nc])
    }

    return ret
  }

  capture(r, c) {
    if(this.cells[r][c] != CONST.EMPTY) {
      if(utils.getType(this.cells[r][c]) == CONST.HEN) {
        this.cells[r][c] = utils.changeType(this.cells[r][c], CONST.CHICK)
      }

      this.addToHand(this.cells[r][c])
      return true
    }

    return false
  }

  move(r, c, nr, nc) {
    if(!this.isValidMove(r, c, nr, nc)) return false

    this.capture(nr, nc)

    //promote
    if(utils.getType(this.cells[r][c]) == CONST.CHICK && utils.getTeam(this.cells[r][c]) == 0 && r == 2 && nr == 3)
      this.cells[r][c] = utils.changeType(this.cells[r][c], CONST.HEN)
    if(utils.getType(this.cells[r][c]) == CONST.CHICK && utils.getTeam(this.cells[r][c]) == 1 && r == 1 && nr == 0)
      this.cells[r][c] = utils.changeType(this.cells[r][c], CONST.HEN)

    this.cells[nr][nc] = this.cells[r][c]
    this.cells[r][c] = CONST.EMPTY

    this.turn = 1 - this.turn
    this.totalturns += 1

    return true
  }

  spawn(r, c, id) {
    let {where, index, tile} = this.findTileById(id)

    if(this.cells[r][c] != CONST.EMPTY) return false
    if(this.turn == 0) {
      if(where != "red_hand") return false
      this.hands[0].splice(index, 1)
    }
    else {
      this.hands[1].splice(index, 1)
      if(where != "blue_hand") return false
    }

    this.cells[r][c] = tile
    this.turn = 1 - this.turn
    this.totalturns += 1

    return true
  }

  getAllNextStates() {
    let states = []
    for(let i=0; i<CONST.BOARD_ROW; i++) {
      for(let j=0; j<CONST.BOARD_COL; j++) {
        if(this.turn == utils.getTeam(this.cells[i][j])) {
          let moves = this.getPossibleMoves(i, j)

          for(let move of moves) {
            let state = this.copy()
            state.move(i, j, move[0], move[1])
            states.push({state: state, type: "move", parameters: [i, j, move[0], move[1]]})
          }
        }
        else if(this.cells[i][j] == CONST.EMPTY) {
          let hand = this.turn == 0 ? this.hands[0] : this.hands[1]
          let played = []

          for(let tile of hand) {
            let tileType = utils.getType(tile)
            if(played.includes(tileType)) continue

            let tileId = utils.getId(tile)
            let state = this.copy()
            state.spawn(i, j, tileId)
            states.push({state: state, type: "spawn", parameters: [i, j, tileId]})
            played.push(tileType)
          }
        }
      }
    }

    return states
  }
}

module.exports = GameState
