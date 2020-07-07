const CONST = require("./constants");
const utils = require("./utils");

class AI {
  constructor() {

  }

  doAction(state) {

  }
}

class DummyAI extends AI {
  constructor() {
    super()
  }

  doAction(state) {
    let states = state.getAllNextStates()
    return states[Math.floor(Math.random() * states.length)];
  }
}

class AlphaBetaPruningAI extends AI {
  constructor(maxDepth = 4, randomness = 0.0) {
    super()
    this.randomness = randomness
    this.maxDepth = maxDepth
    this.exploredCount = 0
    this.rootValue = 0
    this.rootActions = []
    this.handWeights = [0, 40, 40, 15, 0]
    this.cache = {}
  }

  evaluate(state) {
    let winner = state.getWinner()
    if(winner == 0) return 10000 - state.totalturns
    if(winner == 1) return -10000 + state.totalturns

    let score = 0
    for(let i=0; i<CONST.BOARD_ROW; i++) {
      for(let j=0; j<CONST.BOARD_COL; j++) {
        if(state.cells[i][j] == CONST.EMPTY) continue

        let type = utils.getType(state.cells[i][j])
        let teamCof = utils.getTeam(state.cells[i][j]) == 0 ? 1 : -1

        if(type == CONST.CHICK) {
          if(teamCof == 1 && i == CONST.BOARD_ROW-1) score += -100
          else if(teamCof == -1 && i == 0) score -= -100
          else score += 15 * teamCof
        }
        else if(type == CONST.ELEPHANT) {
          score += ((j == 1 ? 20 : 35) + ((i == 1 || i == 2) ? 10 : 0))  * teamCof
        }
        else if(type == CONST.GIRAFFE) {
          score += 35 * teamCof
        }
        else if(type == CONST.HEN) {
          if(teamCof == 1) score += (CONST.BOARD_ROW-1-i)*25 + 10
          else if(teamCof == -1) score -= (i)*25 + 10
        }
        else if(type == CONST.LION) {
          if(teamCof == 1) score += (i)*7
          else if(teamCof == -1) score -= (CONST.BOARD_ROW-1-i)*7
        }
      }
    }

    for(let tile of state.hands[0]) {
      score += this.handWeights[utils.getType(tile)]
    }
    for(let tile of state.hands[1]) {
      score -= this.handWeights[utils.getType(tile)]
    }
    score += state.totalturns * (state.turn == 0 ? -1 : 1);

    return score
  }

  sortStateByValue(states, d) {
    states.forEach((s) => s._v = this.evaluate(s.state))
    states.sort((a, b) => (b._v - a._v)*d)
    return states
  }

  alphabeta(state, depth, alpha, beta, minmax, root = false) {
    this.exploredCount += 1
    // let h = state.hash()
    // if(!root && this.cache[h | (depth<<32)]) {
    //   return this.cache[h | (depth<<32)]
    // }
    if(depth == 0 || state.getWinner() != -1)
      return this.evaluate(state)

    if(minmax == "max") {
      let value = -100000
      let list = state.getAllNextStates()
      for(let next of this.sortStateByValue(list, 1)) {
        let ab = this.alphabeta(next.state, depth-1, alpha, beta, "min")
        if(ab >= value) {
          if(root && ab > value) this.rootActions = []
          value = ab
          if(root) {
            this.rootActions.push(next)
            this.rootValue = value
          }
        }
        alpha = Math.max(alpha, value)
        if(alpha >= beta) break
      }
      //this.cache[h | (depth<<32)] = value
      return value
    }
    else if(minmax == "min") {
      let value = 100000
      let list = state.getAllNextStates()
      for(let next of this.sortStateByValue(list, -1)) {
        value = Math.min(value, this.alphabeta(next.state, depth-1, alpha, beta, "max"))
        beta = Math.min(beta, value)
        if(alpha >= beta) break
      }
      ///this.cache[h | (depth<<32)] = value
      return value
    }
  }


  doAction(state) {
    this.exploredCount = 0
    this.rootActions = []

    let startDate = new Date()

    if(Object.keys(this.cache).length > 100000) this.cache = {}

    this.alphabeta(state, this.maxDepth, -100000, 100000, "max", true)

    let endDate   = new Date()
    let seconds = (endDate.getTime() - startDate.getTime()) / 1000
    console.log(`[AI] Explored: ${this.exploredCount} | Time: ${seconds} | Score: ${this.rootValue} | Candidates: ${this.rootActions.length}`)

    return this.rootActions[Math.floor(Math.random() * this.rootActions.length)];
  }
}

module.exports = {
  DummyAI: DummyAI,
  AlphaBetaPruningAI: AlphaBetaPruningAI
}
