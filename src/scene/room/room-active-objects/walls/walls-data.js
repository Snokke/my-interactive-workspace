const WALLS_PART_TYPE = {
  Floor: 'floor',
  WallLeft: 'wall-left',
  WallRight: 'wall-right',
  Windowsill: 'windowsill',
  WindowFrame: 'window-frame',
  GlassBottom: 'glass-bottom',
  Window: 'window',
  WindowHandle: 'window-handle',
  GlassTop: 'glass-top',
}

const WINDOW_STATE = {
  Closed: 'CLOSED',
  Opening: 'OPENING',
  Opened: 'OPENED',
}

const WINDOW_HANDLE_STATE = {
  Idle: 'IDLE',
  Rotating: 'ROTATING',
}

const WINDOW_OPEN_TYPE = {
  Horizontally: 'HORIZONTALLY',
  Vertically: 'VERTICALLY',
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
  [WALLS_PART_TYPE.Windowsill]: {
    isActive: false,
  },
  [WALLS_PART_TYPE.WindowFrame]: {
    isActive: false,
  },
  [WALLS_PART_TYPE.GlassBottom]: {
    isActive: false,
  },
  [WALLS_PART_TYPE.Window]: {
    isActive: true,
  },
  [WALLS_PART_TYPE.WindowHandle]: {
    isActive: true,
  },
  [WALLS_PART_TYPE.GlassTop]: {
    isActive: true,
  },

}

export { WALLS_PART_TYPE, WALLS_PART_CONFIG, WINDOW_STATE, WINDOW_HANDLE_STATE, WINDOW_OPEN_TYPE };
