import { FURNITURE_TYPE } from '../furniture/furniture-config';
import { ROOM_TYPE } from '../room/room-config';

const APPEAR_DIRECTION = {
  left: 0,
  right: 1,
};

const LEVELS_CONFIG = [
  // level 1
  {
    roomType: ROOM_TYPE.SMALL,
    furniture: [
      {
        type: FURNITURE_TYPE.chair,
        targetGridPosition: { x: 3, z: 3 },
        angle: 180,
        appearDirection: APPEAR_DIRECTION.right,
      },
      {
        type: FURNITURE_TYPE.chair,
        targetGridPosition: { x: 2, z: 4 },
        angle: 90,
        appearDirection: APPEAR_DIRECTION.left,
      },
      {
        type: FURNITURE_TYPE.refrigerator,
        targetGridPosition: { x: 0, z: 2 },
        angle: 0,
        appearDirection: APPEAR_DIRECTION.right,
      },
    ],
    initialFurniture: [
      {
        type: FURNITURE_TYPE.table_big,
        gridPosition: { x: 2, z: 2 },
        angle: 0,
      },
      {
        type: FURNITURE_TYPE.chair,
        gridPosition: { x: 3, z: 2 },
        angle: 180,
      },
      {
        type: FURNITURE_TYPE.chair,
        gridPosition: { x: 2, z: 1 },
        angle: -90,
      },
      {
        type: FURNITURE_TYPE.gas_stove,
        gridPosition: { x: 0, z: 1 },
        angle: 0,
      },
    ],
    robotCleaner: {
      enabled: false,
      position: { x: 0, z: 0 },
      angle: 0,
    },
  },

  // level 2
  {
    roomType: ROOM_TYPE.SMALL,
    furniture: [
      {
        type: FURNITURE_TYPE.nightstand,
        targetGridPosition: { x: 0, z: 1 },
        angle: 0,
        appearDirection: APPEAR_DIRECTION.right,
      },
      {
        type: FURNITURE_TYPE.refrigerator,
        targetGridPosition: { x: 0, z: 4 },
        angle: 0,
        appearDirection: APPEAR_DIRECTION.right,
      },
      {
        type: FURNITURE_TYPE.chair,
        targetGridPosition: { x: 4, z: 2 },
        angle: 0,
        appearDirection: APPEAR_DIRECTION.left,
      },
    ],
    initialFurniture: [
      {
        type: FURNITURE_TYPE.table2,
        gridPosition: { x: 5, z: 2 },
        angle: 0,
      },
      {
        type: FURNITURE_TYPE.chair,
        gridPosition: { x: 5, z: 1 },
        angle: -90,
      },
      {
        type: FURNITURE_TYPE.washing_machine,
        gridPosition: { x: 5, z: 5 },
        angle: 180,
      },
    ],
    robotCleaner: {
      enabled: true,
      position: { x: 0, z: 0 },
      angle: 90,
    },
  },

  // level 3
  {
    roomType: ROOM_TYPE.SMALL,
    furniture: [
      {
        type: FURNITURE_TYPE.washing_machine,
        targetGridPosition: { x: 5, z: 2 },
        angle: 180,
        appearDirection: APPEAR_DIRECTION.left,
      },
      {
        type: FURNITURE_TYPE.chair,
        targetGridPosition: { x: 1, z: 2 },
        angle: 0,
        appearDirection: APPEAR_DIRECTION.right,
      },
      {
        type: FURNITURE_TYPE.chair,
        targetGridPosition: { x: 1, z: 3 },
        angle: 0,
        appearDirection: APPEAR_DIRECTION.left,
      },
    ],
    initialFurniture: [
      {
        type: FURNITURE_TYPE.table_big,
        gridPosition: { x: 2, z: 2 },
        angle: 0,
      },
      {
        type: FURNITURE_TYPE.nightstand,
        gridPosition: { x: 5, z: 0 },
        angle: 180,
      },
      {
        type: FURNITURE_TYPE.refrigerator,
        gridPosition: { x: 5, z: 5 },
        angle: 180,
      },
    ],
    robotCleaner: {
      enabled: false,
      position: { x: 0, z: 0 },
      angle: 0,
    },
  },

  // level 4
  {
    roomType: ROOM_TYPE.SMALL,
    furniture: [
      {
        type: FURNITURE_TYPE.refrigerator,
        targetGridPosition: { x: 2, z: 4 },
        angle: 180,
        appearDirection: APPEAR_DIRECTION.left,
      },
      {
        type: FURNITURE_TYPE.refrigerator,
        targetGridPosition: { x: 3, z: 2 },
        angle: -90,
        appearDirection: APPEAR_DIRECTION.right,
      },
      {
        type: FURNITURE_TYPE.refrigerator,
        targetGridPosition: { x: 0, z: 4 },
        angle: 90,
        appearDirection: APPEAR_DIRECTION.left,
      },
    ],
    initialFurniture: [
      {
        type: FURNITURE_TYPE.refrigerator,
        gridPosition: { x: 0, z: 1 },
        angle: 0,
      },
      {
        type: FURNITURE_TYPE.refrigerator,
        gridPosition: { x: 5, z: 0 },
        angle: 180,
      },
      {
        type: FURNITURE_TYPE.refrigerator,
        gridPosition: { x: 4, z: 5 },
        angle: 90,
      },
    ],
    robotCleaner: {
      enabled: true,
      position: { x: 0, z: 0 },
      angle: 180,
    },
  },

  // level 5
  {
    roomType: ROOM_TYPE.SMALL,
    furniture: [
      {
        type: FURNITURE_TYPE.chair,
        targetGridPosition: { x: 2, z: 4 },
        angle: 0,
        appearDirection: APPEAR_DIRECTION.right,
      },
      {
        type: FURNITURE_TYPE.chair,
        targetGridPosition: { x: 2, z: 1 },
        angle: 180,
        appearDirection: APPEAR_DIRECTION.left,
      },
      {
        type: FURNITURE_TYPE.gas_stove,
        targetGridPosition: { x: 0, z: 3 },
        angle: 0,
        appearDirection: APPEAR_DIRECTION.right,
      },
    ],
    initialFurniture: [
      {
        type: FURNITURE_TYPE.table1,
        gridPosition: { x: 1, z: 1 },
        angle: 0,
      },
      {
        type: FURNITURE_TYPE.chair,
        gridPosition: { x: 0, z: 1 },
        angle: 0,
      },
      {
        type: FURNITURE_TYPE.table1,
        gridPosition: { x: 3, z: 4 },
        angle: 0,
      },
      {
        type: FURNITURE_TYPE.chair,
        gridPosition: { x: 4, z: 4 },
        angle: 180,
      },
      {
        type: FURNITURE_TYPE.refrigerator,
        gridPosition: { x: 5, z: 2 },
        angle: 180,
      },
    ],
    robotCleaner: {
      enabled: true,
      position: { x: 0, z: 0 },
      angle: 180,
    },
  },

  // level 6
  {
    roomType: ROOM_TYPE.SMALL,
    furniture: [
      {
        type: FURNITURE_TYPE.chair,
        targetGridPosition: { x: 1, z: 4 },
        angle: 0,
        appearDirection: APPEAR_DIRECTION.right,
      },
      {
        type: FURNITURE_TYPE.table_big,
        targetGridPosition: { x: 3, z: 4 },
        angle: 0,
        appearDirection: APPEAR_DIRECTION.left,
      },
      {
        type: FURNITURE_TYPE.table2,
        targetGridPosition: { x: 3, z: 3 },
        angle: 0,
        appearDirection: APPEAR_DIRECTION.right,
      },
    ],
    initialFurniture: [
      {
        type: FURNITURE_TYPE.chair,
        gridPosition: { x: 0, z: 0 },
        angle: 0,
      },
      {
        type: FURNITURE_TYPE.chair,
        gridPosition: { x: 0, z: 1 },
        angle: 90,
      },
      {
        type: FURNITURE_TYPE.chair,
        gridPosition: { x: 0, z: 2 },
        angle: 270,
      },
      {
        type: FURNITURE_TYPE.chair,
        gridPosition: { x: 0, z: 3 },
        angle: 0,
      },
      {
        type: FURNITURE_TYPE.chair,
        gridPosition: { x: 0, z: 4 },
        angle: 180,
      },
      {
        type: FURNITURE_TYPE.chair,
        gridPosition: { x: 1, z: 0 },
        angle: 90,
      },
      {
        type: FURNITURE_TYPE.chair,
        gridPosition: { x: 1, z: 1 },
        angle: 0,
      },
      {
        type: FURNITURE_TYPE.chair,
        gridPosition: { x: 1, z: 2 },
        angle: 270,
      },
      {
        type: FURNITURE_TYPE.chair,
        gridPosition: { x: 1, z: 3 },
        angle: 90,
      },
      {
        type: FURNITURE_TYPE.table1,
        gridPosition: { x: 4, z: 5 },
        angle: 0,
      },
      {
        type: FURNITURE_TYPE.table2,
        gridPosition: { x: 4, z: 4 },
        angle: 0,
      },
      {
        type: FURNITURE_TYPE.table1,
        gridPosition: { x: 4, z: 3 },
        angle: 0,
      },
    ],
    robotCleaner: {
      enabled: false,
      position: { x: 0, z: 0 },
      angle: 0,
    },
  },

  // level 7
  {
    roomType: ROOM_TYPE.SMALL,
    furniture: [
      {
        type: FURNITURE_TYPE.table_big,
        targetGridPosition: { x: 1, z: 3 },
        angle: 0,
        appearDirection: APPEAR_DIRECTION.right,
      },
      {
        type: FURNITURE_TYPE.refrigerator,
        targetGridPosition: { x: 5, z: 5 },
        angle: 180,
        appearDirection: APPEAR_DIRECTION.left,
      },
      {
        type: FURNITURE_TYPE.chair,
        targetGridPosition: { x: 1, z: 5 },
        angle: 90,
        appearDirection: APPEAR_DIRECTION.left,
      },
    ],
    initialFurniture: [
      {
        type: FURNITURE_TYPE.chair,
        gridPosition: { x: 0, z: 3 },
        angle: 0,
      },
      {
        type: FURNITURE_TYPE.chair,
        gridPosition: { x: 0, z: 4 },
        angle: 0,
      },
      {
        type: FURNITURE_TYPE.chair,
        gridPosition: { x: 2, z: 3 },
        angle: 180,
      },
      {
        type: FURNITURE_TYPE.chair,
        gridPosition: { x: 2, z: 4 },
        angle: 180,
      },
      {
        type: FURNITURE_TYPE.nightstand,
        gridPosition: { x: 5, z: 1 },
        angle: 180,
      },
    ],
    robotCleaner: {
      enabled: false,
      position: { x: 0, z: 0 },
      angle: 0,
    },
  },

  // level 8
  {
    roomType: ROOM_TYPE.SMALL,
    furniture: [
      {
        type: FURNITURE_TYPE.table_big,
        targetGridPosition: { x: 1, z: 3 },
        angle: 0,
        appearDirection: APPEAR_DIRECTION.right,
      },
      {
        type: FURNITURE_TYPE.washing_machine,
        targetGridPosition: { x: 4, z: 3 },
        angle: 180,
        appearDirection: APPEAR_DIRECTION.left,
      },
      {
        type: FURNITURE_TYPE.nightstand,
        targetGridPosition: { x: 3, z: 1 },
        angle: 90,
        appearDirection: APPEAR_DIRECTION.left,
      },
    ],
    initialFurniture: [
      {
        type: FURNITURE_TYPE.table1,
        gridPosition: { x: 1, z: 1 },
        angle: 0,
      },
      {
        type: FURNITURE_TYPE.table2,
        gridPosition: { x: 0, z: 4 },
        angle: 0,
      },
      {
        type: FURNITURE_TYPE.table1,
        gridPosition: { x: 5, z: 1 },
        angle: 0,
      },
      {
        type: FURNITURE_TYPE.table2,
        gridPosition: { x: 4, z: 5 },
        angle: 0,
      },
    ],
    robotCleaner: {
      enabled: true,
      position: { x: 0, z: 0 },
      angle: 0,
    },
  },

  // level 9
  {
    roomType: ROOM_TYPE.SMALL,
    furniture: [
      {
        type: FURNITURE_TYPE.chair,
        targetGridPosition: { x: 0, z: 3 },
        angle: 0,
        appearDirection: APPEAR_DIRECTION.right,
      },
      {
        type: FURNITURE_TYPE.refrigerator,
        targetGridPosition: { x: 4, z: 1 },
        angle: 90,
        appearDirection: APPEAR_DIRECTION.left,
      },
      {
        type: FURNITURE_TYPE.refrigerator,
        targetGridPosition: { x: 3, z: 4 },
        angle: 270,
        appearDirection: APPEAR_DIRECTION.right,
      },
      {
        type: FURNITURE_TYPE.chair,
        targetGridPosition: { x: 0, z: 5 },
        angle: 0,
        appearDirection: APPEAR_DIRECTION.right,
      },
    ],
    initialFurniture: [
      {
        type: FURNITURE_TYPE.chair,
        gridPosition: { x: 0, z: 2 },
        angle: 0,
      },
      {
        type: FURNITURE_TYPE.chair,
        gridPosition: { x: 0, z: 4 },
        angle: 0,
      },
      {
        type: FURNITURE_TYPE.table_big,
        gridPosition: { x: 1, z: 2 },
        angle: 0,
      },
      {
        type: FURNITURE_TYPE.table_big,
        gridPosition: { x: 1, z: 4 },
        angle: 0,
      },
      {
        type: FURNITURE_TYPE.refrigerator,
        gridPosition: { x: 5, z: 5 },
        angle: 180,
      },
    ],
    robotCleaner: {
      enabled: true,
      position: { x: 0, z: 0 },
      angle: 0,
    },
  },

  // level 10
  {
    roomType: ROOM_TYPE.SMALL,
    furniture: [
      {
        type: FURNITURE_TYPE.table_big,
        targetGridPosition: { x: 1, z: 4 },
        angle: 90,
        appearDirection: APPEAR_DIRECTION.right,
      },
      {
        type: FURNITURE_TYPE.nightstand,
        targetGridPosition: { x: 3, z: 2 },
        angle: 0,
        appearDirection: APPEAR_DIRECTION.left,
      },
      {
        type: FURNITURE_TYPE.refrigerator,
        targetGridPosition: { x: 0, z: 4 },
        angle: 0,
        appearDirection: APPEAR_DIRECTION.right,
      },
      {
        type: FURNITURE_TYPE.chair,
        targetGridPosition: { x: 2, z: 5 },
        angle: 90,
        appearDirection: APPEAR_DIRECTION.right,
      },
      {
        type: FURNITURE_TYPE.nightstand,
        targetGridPosition: { x: 0, z: 5 },
        angle: 90,
        appearDirection: APPEAR_DIRECTION.right,
      },
    ],
    initialFurniture: [
      {
        type: FURNITURE_TYPE.washing_machine,
        gridPosition: { x: 5, z: 5 },
        angle: 180,
      },
      {
        type: FURNITURE_TYPE.gas_stove,
        gridPosition: { x: 5, z: 1 },
        angle: 180,
      },
    ],
    robotCleaner: {
      enabled: true,
      position: { x: 0, z: 0 },
      angle: 0,
    },
  },
];

export { LEVELS_CONFIG, APPEAR_DIRECTION };
