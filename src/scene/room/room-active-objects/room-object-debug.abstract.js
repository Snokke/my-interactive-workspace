import * as THREE from 'three';
import { MessageDispatcher } from 'black-engine';
import GUIHelper from '../../../core/helpers/gui-helper/gui-helper';
import { ROOM_CONFIG, ROOM_OBJECT_CONFIG } from '../data/room-config';
import { DEBUG_MENU_START_STATE } from '../../../core/configs/debug-menu-start-state';
import { ROOM_OBJECT_ENABLED_CONFIG } from '../data/room-objects-enabled-config';

export default class RoomObjectDebugAbstract extends THREE.Group {
  constructor(roomObjectType) {
    super();

    this.events = new MessageDispatcher();

    this._roomObjectType = roomObjectType;

    this._debugFolder = null;
    this._folderLabel = ROOM_OBJECT_CONFIG[this._roomObjectType].debugFolderLabel;

    this._initDebugFolder();
  }

  enable() {
    this._debugFolder.children.forEach((child) => {
      if (child.customDisabled) {
        return;
      }

      child.disabled = false;
    });

    this._debugFolder.title = this._folderLabel;
  }

  disable() {
    this._debugFolder.children.forEach((child) => {
      if (child.label === 'Enabled') {
        return;
      }

      child.disabled = true;
    });

    this._debugFolder.title = `${this._folderLabel} (disabled)`;
  }

  openFolder() {
    this._debugFolder.expanded = true;
  }

  closeFolder() {
    this._debugFolder.expanded = false;
  }

  hideFolder() {
    this._debugFolder.hidden = true;
  }

  showFolder() {
    this._debugFolder.hidden = false;
  }

  _initDebugFolder() {
    const roomObjectsFolder = GUIHelper.getFolder('Active room objects');

    const debugFolder = this._debugFolder = roomObjectsFolder.addFolder({
      title: this._folderLabel,
      expanded: DEBUG_MENU_START_STATE[this._roomObjectType],
    });

    debugFolder.addInput(ROOM_OBJECT_ENABLED_CONFIG, this._roomObjectType, {
      label: 'Enabled',
    })
      .on('change', (enabled) => {
        if (enabled.value) {
          this.enable();
        } else {
          this.disable();
        }
      });

    debugFolder.addSeparator();
  }

  _checkToDisableFolder() {
    if (!ROOM_OBJECT_ENABLED_CONFIG[this._roomObjectType]) {
      this.disable();
    }
  }
}
