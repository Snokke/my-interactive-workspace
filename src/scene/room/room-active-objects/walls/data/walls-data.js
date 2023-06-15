const WALLS_PART_TYPE = {
  Walls: 'walls',
  GlassBottom: 'glass-bottom',
  GlassTop: 'glass-top',
  Window: 'window',
  WindowHandle: 'window-handle',
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
  [WALLS_PART_TYPE.Walls]: false,
  [WALLS_PART_TYPE.GlassBottom]: false,
  [WALLS_PART_TYPE.GlassTop]: true,
  [WALLS_PART_TYPE.Window]: true,
  [WALLS_PART_TYPE.WindowHandle]: true,
}

export {
  WALLS_PART_TYPE,
  WALLS_PART_ACTIVITY_CONFIG,
  WINDOW_STATE,
  WINDOW_HANDLE_STATE,
  WINDOW_OPEN_TYPE,
  WINDOW_OPEN_TYPE_BOTH,
};
