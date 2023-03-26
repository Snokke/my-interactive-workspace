const WALLS_PART_TYPE = {
  Floor: 'floor',
  WallLeft: 'wall-left',
  WallRight: 'wall-right',
}

const WALLS_PART_CONFIG = {
  [WALLS_PART_TYPE.Floor]: {
    isActive: false,
  },
  [WALLS_PART_TYPE.WallLeft]: {
    isActive: false,
  },
  [WALLS_PART_TYPE.WallRight]: {
    isActive: false,
  },
}

export { WALLS_PART_TYPE, WALLS_PART_CONFIG };
