import { CARPET_TYPE, PICTURE_TYPE } from './decorations/decorations-config';
import WALL_TYPE from './walls/wall-config';

const ROOM_TYPE = {
  SMALL: 0,
  BIG: 1,
};

const ROOM_CONFIG = {
  [ROOM_TYPE.SMALL]: {
    width: 6,
    depth: 6,
    decorations: {
      carpet: {
        type: CARPET_TYPE.purple,
        position: { x: 0, z: 0 },
        angle: 0,
      },
      pictures: [
        {
          type: PICTURE_TYPE.tomato,
          placement: WALL_TYPE.right,
          position: { x: -1.35, y: 2.22 },
        },
        {
          type: PICTURE_TYPE.cat,
          placement: WALL_TYPE.left,
          position: { x: -2.1, y: 2.22 },
        },
      ],
    },
  },
  [ROOM_TYPE.BIG]: {
    width: 7,
    depth: 6,
    decorations: {
      carpet: {
        type: CARPET_TYPE.purple,
        position: { x: 0, z: 0 },
        angle: 0,
      },
      pictures: [
        {
          type: PICTURE_TYPE.tomato,
          placement: WALL_TYPE.right,
          position: { x: -1.35, y: 2.22 },
        },
        {
          type: PICTURE_TYPE.cat,
          placement: WALL_TYPE.left,
          position: { x: -2.1, y: 2.22 },
        },
      ],
    },
  },
};

export { ROOM_TYPE, ROOM_CONFIG };
