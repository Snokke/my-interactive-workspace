import { Pane } from 'tweakpane';
import { GUI_CONFIG } from './gui-helper-config';

export default class GUIHelper {
  constructor() {
    this.gui = new Pane({
      title: 'Debug',
    });
    this.gui.hidden = true;

    if (!GUI_CONFIG.openAtStart) {
      this.gui.expanded = false;
    }

    GUIHelper.instance = this;

    return this.gui;
  }

  getFolder(name) {
    const folders = this.gui.children;

    for (let i = 0; i < folders.length; i += 1) {
      const folder = folders[i];

      if (folder.title === name) {
        return folder;
      }
    }

    return null;
  }

  getController(folder, name) {
    for (let i = 0; i < folder.children.length; i += 1) {
      const controller = folder.children[i];

      if (controller.label === name) {
        return controller;
      }
    }

    return null;
  }

  showAfterAssetsLoad() {
    const currentUrl = window.location.href;
    const isDebug = currentUrl.indexOf('#debug') !== -1;

    if (isDebug) {
      this.gui.hidden = false;
    }
  }

  static getGui() {
    return GUIHelper.instance.gui;
  }

  static getFolder(name) {
    return GUIHelper.instance.getFolder(name);
  }

  static getController(folder, name) {
    return GUIHelper.instance.getController(folder, name);
  }
}

GUIHelper.instance = null;
