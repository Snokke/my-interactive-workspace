const AIR_CONDITIONER_REMOTE_PART_TYPE = {
  Base: 'base',
  ButtonOnOff: 'button_on_off',
  ButtonTemperatureUp: 'button_up',
  ButtonTemperatureDown: 'button_down',
  TemperatureScreen: 'temperature_screen',
}

const AIR_CONDITIONER_REMOTE_PART_ACTIVITY_CONFIG = {
  [AIR_CONDITIONER_REMOTE_PART_TYPE.Base]: true,
  [AIR_CONDITIONER_REMOTE_PART_TYPE.ButtonOnOff]: true,
  [AIR_CONDITIONER_REMOTE_PART_TYPE.ButtonTemperatureUp]: true,
  [AIR_CONDITIONER_REMOTE_PART_TYPE.ButtonTemperatureDown]: true,
  [AIR_CONDITIONER_REMOTE_PART_TYPE.TemperatureScreen]: true,
}

const AIR_CONDITIONER_REMOTE_BUTTON_TYPE = {
  OnOff: 'ON_OFF',
  TemperatureUp: 'TEMPERATURE_UP',
  TemperatureDown: 'TEMPERATURE_DOWN',
}

export { AIR_CONDITIONER_REMOTE_PART_TYPE, AIR_CONDITIONER_REMOTE_PART_ACTIVITY_CONFIG, AIR_CONDITIONER_REMOTE_BUTTON_TYPE };
