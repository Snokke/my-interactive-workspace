import * as THREE from 'three';
import DEBUG_CONFIG from '../core/configs/debug-config';
import GUIHelper from '../core/helpers/gui-helper/gui-helper';
import Loader from '../core/loader';
import { LOCKER_PART_TYPE } from './locker/locker-data';
import { ROOM_OBJECT_CONFIG, ROOM_OBJECT_TYPE } from './room-config';

export default class Scene3D extends THREE.Group {
  constructor(camera, outlinePass) {
    super();

    this._camera = camera;
    this._outlinePass = outlinePass;

    this._outlineEnabled = { value: true };
    this._raycaster = null;
    this._roomGroup = null;

    this._roomObject = {};
    this._allMeshes = [];

    this._pointerPosition = new THREE.Vector2();

    this._init();
  }

  update(dt) {
    if (this._outlineEnabled.value) {
      const intersectedMesh = this._checkIntersection(this._pointerPosition.x, this._pointerPosition.y);
      this._checkToGlow(intersectedMesh);
    }
  }

  onClick() {
    this._table.changeState();
  }

  onPointerMove(x, y) {
    this._pointerPosition.set(x, y);
  }

  onPointerDown(x, y) {
    const object = this._checkIntersection(x, y);

    if (object === null) {
      return;
    }

    this._roomObject[object.userData.objectType].onClick(object);
  }

  _checkToGlow(mesh) {
    if (mesh === null || !this._roomObject[mesh.userData.objectType].isInputEnabled()) {
      this._resetGlow();

      return;
    }

    const object = this._roomObject[mesh.userData.objectType];

    switch (mesh.userData.objectType) {
      case ROOM_OBJECT_TYPE.Table:
        this._setGlow(object.getAllMeshes());
        break;

      case ROOM_OBJECT_TYPE.Locker:
        if (mesh.userData.partType === LOCKER_PART_TYPE.BODY) {
          this._setGlow(object.getBodyMesh());
        } else {
          this._setGlow(object.getCaseMesh(mesh.userData.caseId));
        }
        break;
      }
  }

  _setGlow(items) {
    if (DEBUG_CONFIG.wireframe) {
      return;
    }

    this._outlinePass.selectedObjects = items;
  }

  _resetGlow() {
    this._outlinePass.selectedObjects = [];
  }

  _checkIntersection(x, y) {
    const mousePositionX = (x / window.innerWidth) * 2 - 1;
    const mousePositionY = -(y / window.innerHeight) * 2 + 1;
    const mousePosition = new THREE.Vector2(mousePositionX, mousePositionY);

    this._raycaster.setFromCamera(mousePosition, this._camera);
    const intersects = this._raycaster.intersectObjects(this._allMeshes);

    let intersectedObject = null;

    if (intersects.length > 0) {
      intersectedObject = intersects[0].object;
    }

    return intersectedObject;
  }

  _init() {
    this._initRaycaster();

    this._roomGroup = Loader.assets['room'].scene;

    this._initObjects();
    this._initShowAnimationsDebug();
  }

  _initRaycaster() {
    this._raycaster = new THREE.Raycaster();
  }

  _initObjects() {
    for (const key in ROOM_OBJECT_TYPE) {
      const type = ROOM_OBJECT_TYPE[key];
      const config = ROOM_OBJECT_CONFIG[type];

      const group = this._roomGroup.getObjectByName(config.groupName);
      const object = new config.class(group);
      this.add(object);

      this._roomObject[type] = object;
    }

    for (const key in this._roomObject) {
      this._allMeshes.push(...this._roomObject[key].getAllMeshes());
    }
  }

  _initShowAnimationsDebug() {
    const sceneDebugFolder = GUIHelper.getFolder('Scene');

    sceneDebugFolder.addInput(this._outlineEnabled, 'value', { label: 'Outline' })
      .on('change', (outlineState) => {
        this._outlineEnabled.value = outlineState.value;
      });

    sceneDebugFolder.addSeparator();

    let selectedObjectType = ROOM_OBJECT_TYPE.Locker;

    sceneDebugFolder.addBlade({
      view: 'list',
      label: 'Show animation',
      options: [
        { text: 'Table', value: ROOM_OBJECT_TYPE.Table },
        { text: 'Locker', value: ROOM_OBJECT_TYPE.Locker },
      ],
      value: selectedObjectType,
    }).on('change', (objectType) => {
      selectedObjectType = objectType.value;
    });

    sceneDebugFolder.addButton({
      title: 'Start show animation',
    }).on('click', () => {
      this._roomObject[selectedObjectType].show();
    });
  }
}
