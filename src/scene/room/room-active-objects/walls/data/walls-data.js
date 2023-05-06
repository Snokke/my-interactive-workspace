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
  Closing: 'CLOSING',
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

const WINDOW_OPEN_TYPE_BOTH = 'WINDOW_OPEN_TYPE_BOTH';

const WALLS_PART_ACTIVITY_CONFIG = {
  [WALLS_PART_TYPE.Floor]: false,
  [WALLS_PART_TYPE.WallLeft]: false,
  [WALLS_PART_TYPE.WallRight]: false,
  [WALLS_PART_TYPE.Windowsill]: false,
  [WALLS_PART_TYPE.WindowFrame]: false,
  [WALLS_PART_TYPE.GlassBottom]: false,
  [WALLS_PART_TYPE.Window]: true,
  [WALLS_PART_TYPE.WindowHandle]: true,
  [WALLS_PART_TYPE.GlassTop]: true,
}

export {
  WALLS_PART_TYPE,
  WALLS_PART_ACTIVITY_CONFIG,
  WINDOW_STATE,
  WINDOW_HANDLE_STATE,
  WINDOW_OPEN_TYPE,
  WINDOW_OPEN_TYPE_BOTH,
};
