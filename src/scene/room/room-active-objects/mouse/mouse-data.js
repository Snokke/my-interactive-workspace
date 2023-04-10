const MOUSE_PART_TYPE = {
  Body: 'mouse_body',
}

const MOUSE_PART_CONFIG = {
  [MOUSE_PART_TYPE.Body]: {
    isActive: true,
  },
}

const CURSOR_MONITOR_TYPE = {
  Monitor: 'MONITOR',
  Notebook: 'NOTEBOOK',
}

const AREA_BORDER_TYPE = {
  Left: 'LEFT',
  Right: 'RIGHT',
  Top: 'TOP',
  Bottom: 'BOTTOM',
}

export { MOUSE_PART_TYPE, MOUSE_PART_CONFIG, CURSOR_MONITOR_TYPE, AREA_BORDER_TYPE };
