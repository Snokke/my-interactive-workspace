const MOUSE_PART_TYPE = {
  Body: 'mouse_body',
  LeftKey: 'mouse_left_key',
  MouseShadow: 'mouse_shadow',
}

const MOUSE_PART_ACTIVITY_CONFIG = {
  [MOUSE_PART_TYPE.Body]: true,
  [MOUSE_PART_TYPE.LeftKey]: true,
  [MOUSE_PART_TYPE.MouseShadow]: false,
}

const AREA_BORDER_TYPE = {
  Left: 'LEFT',
  Right: 'RIGHT',
  Top: 'TOP',
  Bottom: 'BOTTOM',
}

export { MOUSE_PART_TYPE, MOUSE_PART_ACTIVITY_CONFIG, AREA_BORDER_TYPE };
