const CONST = require('./constants')

function createTile(team, tileType, tileId) {
  return team | (tileType << 1) | (tileId << 5)
}

function isInside(r, c) {
  return 0 <= r && r < CONST.BOARD_ROW && 0 <= c && c < CONST.BOARD_COL
}

function getTeam(x) { if (x == -1) return -1; return x & 0b1 }
function getType(x) { if (x == -1) return -1; return (x & 0b11110) >> 1 }
function getId(x) { if (x == -1) return -1; return (x & 0b1111100000) >> 5 }
function changeTeam(x, t) { if (x == -1) return -1; return (x & 0b1111111110) | t }
function changeType(x, t) { if (x == -1) return -1; return (x & 0b1111100001) | (t << 1) }

function converTileToChar(tile) {
  if      (tile == CONST.EMPTY) return "."
  else if (getTeam(tile) == 0 && getType(tile) == CONST.LION)     return "L"
  else if (getTeam(tile) == 0 && getType(tile) == CONST.GIRAFFE)  return "G"
  else if (getTeam(tile) == 0 && getType(tile) == CONST.ELEPHANT) return "E"
  else if (getTeam(tile) == 0 && getType(tile) == CONST.CHICK)    return "C"
  else if (getTeam(tile) == 0 && getType(tile) == CONST.HEN)      return "H"
  else if (getTeam(tile) == 1 && getType(tile) == CONST.LION)     return "l"
  else if (getTeam(tile) == 1 && getType(tile) == CONST.GIRAFFE)  return "g"
  else if (getTeam(tile) == 1 && getType(tile) == CONST.ELEPHANT) return "e"
  else if (getTeam(tile) == 1 && getType(tile) == CONST.CHICK)    return "c"
  else if (getTeam(tile) == 1 && getType(tile) == CONST.HEN)      return "h"
}

function convertTypeToString(type) {
  if (type == CONST.LION) return "lion"
  else if (type == CONST.GIRAFFE) return "giraffe"
  else if (type == CONST.ELEPHANT) return "elephant"
  else if (type == CONST.CHICK) return "chick"
  else if (type == CONST.HEN) return "hen"
}

function shuffleArray(array) {
  for  (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1))
    let temp = array[i]
    array[i] = array[j]
    array[j] = temp
  }
  return array
}

const utils = {
  createTile, isInside, getTeam, getType, getId, changeTeam, changeType, converTileToChar, convertTypeToString, shuffleArray
}

module.exports = utils
