const CONST = {
  BOARD_ROW: 4,
  BOARD_COL: 3,

  EMPTY: -1,
  LION: 0,
  GIRAFFE: 1,
  ELEPHANT: 2,
  CHICK: 3,
  HEN: 4,

  MOVEMENTS: [
    [[0, 1], [1, 1], [1, 0], [1, -1], [0, -1], [-1, -1], [-1, 0], [-1, 1]],
    [[0, 1], [1, 0], [0, -1], [-1, 0]],
    [[1, 1], [1, -1], [-1, -1], [-1, 1]],
    [[-1, 0]],
    [[0, 1], [1, 0], [0, -1], [-1, -1], [-1, 0], [-1, 1]],
  ]
}

module.exports = CONST
