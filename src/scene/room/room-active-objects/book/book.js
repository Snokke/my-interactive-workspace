import * as THREE from 'three';
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js';
import Delayed from '../../../../core/helpers/delayed-call';
import RoomObjectAbstract from '../room-object.abstract';
import { STATIC_MODE_CAMERA_CONFIG } from '../../camera-controller/data/camera-config';
import { Black } from 'black-engine';
import { BOOK_PART_TYPE, BOOK_SIDE, OPEN_BOOK_PARTS, PAGE_FLIP_DIRECTION, PAGE_MATERIAL_TYPE, PAGE_SIDE } from './data/book-data';
import { BOOK_CONFIG } from './data/book-config';
import vertexShader from './page-shaders/page-vertex.glsl';
import fragmentShader from './page-shaders/page-fragment.glsl';
import Materials from '../../../../core/materials';
import Loader from '../../../../core/loader';

export default class Book extends RoomObjectAbstract {
  constructor(meshesGroup, roomObjectType, audioListener) {
    super(meshesGroup, roomObjectType, audioListener);

    this._isBookShown = false;
    this._bookLastTransform = {};
    this._bookLastPosition = new THREE.Vector3();
    this._wrapper = null;
    this._partsBySide = null;
    this._startCoverPosition = null;
    this._pageFlipConfigByDirection = null;

    this._init();
  }

  onClick(intersect) {
    if (!this._isInputEnabled) {
      return;
    }

    const roomObject = intersect.object;
    const partType = roomObject.userData.partType;

    if (partType === BOOK_PART_TYPE.ClosedBook) {
      this._onBookClick();
    }

    if (partType === BOOK_PART_TYPE.BookLeftTopPage) {
      this._flipPage(PAGE_FLIP_DIRECTION.Backward);
    }

    if (partType === BOOK_PART_TYPE.BookRightTopPage) {
      this._flipPage(PAGE_FLIP_DIRECTION.Forward);
    }
  }

  onPointerOver(intersect) {
    if (this._isPointerOver) {
      return;
    }

    super.onPointerOver();

    const roomObject = intersect.object;
    const type = roomObject.userData.partType;

    if (type === BOOK_PART_TYPE.Book) {
      if (this._isBookShown) {
        Black.engine.containerElement.style.cursor = 'zoom-out';
      } else {
        Black.engine.containerElement.style.cursor = 'grab';
      }
    }
  }

  getMeshesForOutline(mesh) {
    const partType = mesh.userData.partType;

    if (partType === BOOK_PART_TYPE.BookLeftTopPage) {
      return [mesh];
    }

    if (partType === BOOK_PART_TYPE.BookRightTopPage) {
      return [mesh];
    }

    return [mesh];
  }

  hideBook() {
    this._isBookShown = false;
    this._parts[BOOK_PART_TYPE.ClosedBook].userData.hideOutline = false;
    this._moveBookToStartPosition();
  }

  setBookActive() {
    this._parts[BOOK_PART_TYPE.ClosedBook].userData.isActive = true;
  }

  setBookInactive() {
    this._parts[BOOK_PART_TYPE.ClosedBook].userData.isActive = false;
  }

  _onBookClick() {
    if (!this._isBookShown) {
      this._showBook();
    } else {
      this.events.post('onBookClickToHide');
    }
  }

  _showBook() {
    this._isBookShown = true;

    this._bookLastPosition.copy(this._wrapper.position);
    const globalPosition = this._wrapper.getWorldPosition(new THREE.Vector3());
    this._bookLastTransform.position.copy(globalPosition);
    this._bookLastTransform.rotation.copy(this._wrapper.rotation);
    this.events.post('onBookClickToShow', this._wrapper, this._roomObjectType);

    this._parts[BOOK_PART_TYPE.ClosedBook].userData.hideOutline = true;
    this._disableActivity();

    Delayed.call(STATIC_MODE_CAMERA_CONFIG.objectMoveTime, () => {
      this._enableActivity();
    });
  }

  _moveBookToStartPosition() {
    const base = this._parts[BOOK_PART_TYPE.ClosedBook];
    base.userData.isActive = false;

    const endPosition = this._bookLastTransform.position;
    const endRotation = this._bookLastTransform.rotation;

    new TWEEN.Tween(this._wrapper.position)
      .to({ x: endPosition.x, y: endPosition.y, z: endPosition.z }, STATIC_MODE_CAMERA_CONFIG.objectMoveTime)
      .easing(TWEEN.Easing.Sinusoidal.In)
      .start()
      .onComplete(() => {
        base.userData.isActive = true;
        this.add(this._wrapper);
        this._wrapper.position.copy(this._bookLastPosition);
        this._enableActivity();
      });

    new TWEEN.Tween(this._wrapper.rotation)
      .to({ x: endRotation.x, y: endRotation.y, z: endRotation.z }, STATIC_MODE_CAMERA_CONFIG.objectMoveTime)
      .easing(TWEEN.Easing.Sinusoidal.In)
      .start();
  }

  _openBook() {
    this._hideClosedBook();
    this._showOpenBook();
    this._parts[BOOK_PART_TYPE.ClosedBook].visible = false;

    OPEN_BOOK_PARTS.forEach((partName) => {
      this._parts[partName].visible = true;
    });

    this._openBookSide(BOOK_SIDE.Left);
    this._openBookSide(BOOK_SIDE.Right);
    this._moveOutBackCover();
  }

  _openBookSide(sideType) {
    const config = BOOK_CONFIG.openAnimation;

    const { cover, pages, topPage } = this._partsBySide[sideType];

    const sign = sideType === BOOK_SIDE.Left ? -1 : 1;

    new TWEEN.Tween(cover.rotation)
      .to({ y: sign * Math.PI * 0.5 }, config.duration)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .start();

    new TWEEN.Tween(pages.rotation)
      .to({ y: sign * Math.PI * 0.5 }, config.duration)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .start();

    new TWEEN.Tween(topPage.rotation)
      .to({ y: sign * Math.PI * 0.5 }, config.duration)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .start();

    const startPositionZ = this._startCoverPosition[sideType].z;

    new TWEEN.Tween(cover.position)
      .to({ z: startPositionZ - sign * config.sideCoverOffset }, config.duration)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .start();

    new TWEEN.Tween(pages.position)
      .to({ z: 0 }, config.duration)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .start();

    new TWEEN.Tween(topPage.position)
      .to({ z: 0 }, config.duration)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .start();
  }

  _moveOutBackCover() {
    const config = BOOK_CONFIG.openAnimation;
    const backCover = this._parts[BOOK_PART_TYPE.BookBackCover];

    const startPositionX = this._startCoverPosition.back.x;

    new TWEEN.Tween(backCover.position)
      .to({ x: startPositionX + config.backCoverOffset }, config.duration)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .start();
  }

  _flipPage(direction) {
    const progress = { value: 0 };

    const config = this._pageFlipConfigByDirection[direction];
    const pages = config.pages;

    pages.forEach((page) => {
      page.visible = true;
      page.rotation.y = config.startAngle;
      page.material.uniforms.uFlipSign.value = config.flipSign;
    });

    new TWEEN.Tween(progress)
      .to({ value: 1 }, BOOK_CONFIG.page.flipDuration)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .onUpdate(() => {
        pages.forEach((page) => {
          page.material.uniforms.uProgress.value = progress.value;
        });
      })
      .start()
      .onComplete(() => {
        pages.forEach((page) => {
          page.visible = false;
        });
      });
  }

  _disableActivity() {
    Object.values(this._parts).forEach((part) => {
      part.userData.isActive = false;
    });
  }

  _enableActivity() {
    Object.values(this._parts).forEach((part) => {
      part.userData.isActive = true;
    });
  }

  _hideOpenBook() {
    OPEN_BOOK_PARTS.forEach((partName) => {
      const part = this._parts[partName];
      part.scale.set(0, 0, 0);
      part.visible = false;
    });

    this._parts[BOOK_PART_TYPE.BookRightPageSide01].scale.set(0, 0, 0);
    this._parts[BOOK_PART_TYPE.BookRightPageSide02].scale.set(0, 0, 0);
    this._parts[BOOK_PART_TYPE.BookLeftPageSide01].scale.set(0, 0, 0);
    this._parts[BOOK_PART_TYPE.BookLeftPageSide02].scale.set(0, 0, 0);
  }

  _showOpenBook() {
    OPEN_BOOK_PARTS.forEach((partName) => {
      const part = this._parts[partName];
      part.scale.set(1, 1, 1);
      part.visible = true;
    });

    this._parts[BOOK_PART_TYPE.BookRightPageSide01].scale.set(1, 1, 1);
    this._parts[BOOK_PART_TYPE.BookRightPageSide02].scale.set(1, 1, 1);
    this._parts[BOOK_PART_TYPE.BookLeftPageSide01].scale.set(1, 1, 1);
    this._parts[BOOK_PART_TYPE.BookLeftPageSide02].scale.set(1, 1, 1);
  }

  _showClosedBook() {
    const closedBook = this._parts[BOOK_PART_TYPE.ClosedBook];
    closedBook.scale.set(1, 1, 1);
    closedBook.visible = true;
  }

  _hideClosedBook() {
    const closedBook = this._parts[BOOK_PART_TYPE.ClosedBook];
    closedBook.scale.set(0, 0, 0);
    closedBook.visible = false;
  }

  _init() {
    this._initParts();
    this._addMaterials();
    this._addPartsToScene();
    this._initWrapperGroup();
    this._initOpenBook();
    this._initBookLastPosition();

    this._hideOpenBook();

    Delayed.call(500, () => {
      this._openBook();
    });
  }

  _addMaterials() {
    const closedBook = this._parts[BOOK_PART_TYPE.ClosedBook];

    const material = Materials.getMaterial(Materials.type.bakedSmallObjects);
    closedBook.material = material;
  }

  _initWrapperGroup() {
    const wrapper = this._wrapper = new THREE.Group();
    this.add(wrapper);

    const closedBook = this._parts[BOOK_PART_TYPE.ClosedBook];
    const bookLeftCover = this._parts[BOOK_PART_TYPE.BookLeftCover];
    const bookLeftPages = this._parts[BOOK_PART_TYPE.BookLeftPages];
    const bookLeftTopPage = this._parts[BOOK_PART_TYPE.BookLeftTopPage];
    const bookRightCover = this._parts[BOOK_PART_TYPE.BookRightCover];
    const bookRightPages = this._parts[BOOK_PART_TYPE.BookRightPages];
    const bookRightTopPage = this._parts[BOOK_PART_TYPE.BookRightTopPage];
    const bookBackCover = this._parts[BOOK_PART_TYPE.BookBackCover];
    const bookRightPageSide01 = this._parts[BOOK_PART_TYPE.BookRightPageSide01];
    const bookRightPageSide02 = this._parts[BOOK_PART_TYPE.BookRightPageSide02];
    const bookLeftPageSide01 = this._parts[BOOK_PART_TYPE.BookLeftPageSide01];
    const bookLeftPageSide02 = this._parts[BOOK_PART_TYPE.BookLeftPageSide02];

    wrapper.add(closedBook, bookLeftCover, bookLeftPages, bookLeftTopPage, bookRightCover, bookRightPages, bookRightTopPage, bookBackCover, bookRightPageSide01, bookRightPageSide02, bookLeftPageSide01, bookLeftPageSide02);

    const bookLeftCoverDelta = bookLeftCover.position.clone().sub(closedBook.position);
    const bookLeftPagesDelta = bookLeftPages.position.clone().sub(closedBook.position);
    const bookLeftTopPageDelta = bookLeftTopPage.position.clone().sub(closedBook.position);
    const bookRightCoverDelta = bookRightCover.position.clone().sub(closedBook.position);
    const bookRightPagesDelta = bookRightPages.position.clone().sub(closedBook.position);
    const bookRightTopPageDelta = bookRightTopPage.position.clone().sub(closedBook.position);
    const bookBackCoverDelta = bookBackCover.position.clone().sub(closedBook.position);
    const bookRightPageSide01Delta = bookRightPageSide01.position.clone().sub(closedBook.position);
    const bookRightPageSide02Delta = bookRightPageSide02.position.clone().sub(closedBook.position);
    const bookLeftPageSide01Delta = bookLeftPageSide01.position.clone().sub(closedBook.position);
    const bookLeftPageSide02Delta = bookLeftPageSide02.position.clone().sub(closedBook.position);

    wrapper.position.copy(closedBook.userData.startPosition);
    closedBook.position.set(0, 0, 0);
    bookLeftCover.position.copy(bookLeftCoverDelta);
    bookLeftPages.position.copy(bookLeftPagesDelta);
    bookLeftTopPage.position.copy(bookLeftTopPageDelta);
    bookRightCover.position.copy(bookRightCoverDelta);
    bookRightPages.position.copy(bookRightPagesDelta);
    bookRightTopPage.position.copy(bookRightTopPageDelta);
    bookBackCover.position.copy(bookBackCoverDelta);
    bookRightPageSide01.position.copy(bookRightPageSide01Delta);
    bookRightPageSide02.position.copy(bookRightPageSide02Delta);
    bookLeftPageSide01.position.copy(bookLeftPageSide01Delta);
    bookLeftPageSide02.position.copy(bookLeftPageSide02Delta);

    wrapper.position.set(0, 5, 0);
    // wrapper.rotation.y = Math.PI;
    wrapper.rotation.z = -Math.PI * 0.5;
    // wrapper.rotation.x = -30 * Math.PI / 180;
  }

  _initOpenBook() {
    this._initPagesMaterials();
    this._loadPageTexture();
    this._setOpenBookMaterials();
    this._setActivePagesMaterial();
    this._setPartsSettings();
  }

  _loadPageTexture() {
    const pageTexture = this._pageTexture = new Image();
    pageTexture.src = '/textures/baked-page.jpg';

    pageTexture.onload = () => this._drawPages();
  }

  _drawPages() {
    this._drawPage('Page 01', this._parts[BOOK_PART_TYPE.BookLeftTopPage], PAGE_SIDE.Left, PAGE_MATERIAL_TYPE.Basic);
    this._drawPage('Page 02', this._parts[BOOK_PART_TYPE.BookRightPageSide01], PAGE_SIDE.Right, PAGE_MATERIAL_TYPE.Shader);
    this._drawPage('Page 03', this._parts[BOOK_PART_TYPE.BookRightPageSide02], PAGE_SIDE.Left, PAGE_MATERIAL_TYPE.Shader);
    this._drawPage('Page 05', this._parts[BOOK_PART_TYPE.BookLeftPageSide01], PAGE_SIDE.Right, PAGE_MATERIAL_TYPE.Shader);
    this._drawPage('Page 06', this._parts[BOOK_PART_TYPE.BookLeftPageSide02], PAGE_SIDE.Left, PAGE_MATERIAL_TYPE.Shader);
    this._drawPage('Page 04', this._parts[BOOK_PART_TYPE.BookRightTopPage], PAGE_SIDE.Right, PAGE_MATERIAL_TYPE.Basic);
  }

  _drawPage(text, page, type, materialType) {
    const bitmap = page.userData.bitmap;
    const context = bitmap.getContext('2d');

    context.clearRect(0, 0, bitmap.width, bitmap.height);

    this._drawBakedPageTexture(bitmap, type);

    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle = '#000000';

    context.font = `40px Arial`;
    context.fillText(text, bitmap.width * 0.5, bitmap.height * 0.5);

    if (materialType === PAGE_MATERIAL_TYPE.Basic) {
      page.material.map.needsUpdate = true;
    }

    if (materialType === PAGE_MATERIAL_TYPE.Shader) {
      page.userData.texture.needsUpdate = true;
    }
  }

  _drawBakedPageTexture(bitmap, type) {
    const context = bitmap.getContext('2d');

    if (type === PAGE_SIDE.Right) {
      context.translate(bitmap.width, 0);
      context.scale(-1, 1);
      context.drawImage(this._pageTexture, 0, 0, bitmap.width, bitmap.height);
      context.setTransform(1, 0, 0, 1, 0, 0);
    } else {
      context.drawImage(this._pageTexture, 0, 0, bitmap.width, bitmap.height);
    }
  }

  _initPagesMaterials() {
    this._createPageMaterial(this._parts[BOOK_PART_TYPE.BookLeftTopPage]);
    this._createPageMaterial(this._parts[BOOK_PART_TYPE.BookRightTopPage]);

    this._createShaderPageTexture(this._parts[BOOK_PART_TYPE.BookLeftPageSide01]);
    this._createShaderPageTexture(this._parts[BOOK_PART_TYPE.BookLeftPageSide02]);

    this._createShaderPageTexture(this._parts[BOOK_PART_TYPE.BookRightPageSide01]);
    this._createShaderPageTexture(this._parts[BOOK_PART_TYPE.BookRightPageSide02]);
  }

  _createPageMaterial(page) {
    const bitmap = this._createPageBitmap();

    const texture = this._texture01 = new THREE.Texture(bitmap);
    texture.flipY = false;
    const material = new THREE.MeshBasicMaterial({ map: texture });

    page.material = material;
    page.userData.bitmap = bitmap;
  }

  _createShaderPageTexture(page) {
    const bitmap = this._createPageBitmap();
    page.userData.bitmap = bitmap;

    const texture = new THREE.Texture(bitmap);
    texture.flipY = false;

    page.userData.texture = texture;
  }

  _createPageBitmap() {
    const bitmap = document.createElement('canvas');
    bitmap.width = BOOK_CONFIG.page.width * BOOK_CONFIG.page.resolution;
    bitmap.height = BOOK_CONFIG.page.height * BOOK_CONFIG.page.resolution;

    return bitmap;
  }

  _setOpenBookMaterials() {
    const bakedTexture = Loader.assets['baked-opened-book'];
    bakedTexture.flipY = false;

    const bakedMaterial = new THREE.MeshBasicMaterial({
      map: bakedTexture,
    });

    this._parts[BOOK_PART_TYPE.BookBackCover].material = bakedMaterial;
    this._parts[BOOK_PART_TYPE.BookLeftCover].material = bakedMaterial;
    this._parts[BOOK_PART_TYPE.BookRightCover].material = bakedMaterial;
    this._parts[BOOK_PART_TYPE.BookLeftPages].material = bakedMaterial;
    this._parts[BOOK_PART_TYPE.BookRightPages].material = bakedMaterial;
  }

  _setActivePagesMaterial() {
    const bookRightPageSide01 = this._parts[BOOK_PART_TYPE.BookRightPageSide01];
    const bookRightPageSide02 = this._parts[BOOK_PART_TYPE.BookRightPageSide02];
    this._setActivePageMaterial(bookRightPageSide01, bookRightPageSide02);

    const bookLeftPageSide01 = this._parts[BOOK_PART_TYPE.BookLeftPageSide01];
    const bookLeftPageSide02 = this._parts[BOOK_PART_TYPE.BookLeftPageSide02];
    this._setActivePageMaterial(bookLeftPageSide01, bookLeftPageSide02);
  }

  _setActivePageMaterial(pageSide01, pageSide02) {
    pageSide01.position.z = pageSide02.position.z = 0;
    pageSide01.visible = pageSide02.visible = false;

    this._setActivePageMaterialBySide(pageSide01);
    this._setActivePageMaterialBySide(pageSide02);
  }

  _setActivePageMaterialBySide(mesh) {
    const texture = mesh.userData.texture;

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uProgress: { value: 0 },
        uTexture: { value: texture },
        uFlipSign: { value: 1 },
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
    });

    mesh.material = material;

    const startPositionZ = new Float32Array(mesh.geometry.attributes.position.count);

    for (let i = 0; i < startPositionZ.length; i += 1) {
      const z = mesh.geometry.attributes.position.array[i * 3 + 2];
      startPositionZ[i] = z;
    }

    const startPositionAttribute = new THREE.BufferAttribute(startPositionZ, 1);

    mesh.geometry.setAttribute('startPositionZ', startPositionAttribute);
  }

  _setPartsSettings() {
    this._partsBySide = {
      [BOOK_SIDE.Left]: {
        cover: this._parts[BOOK_PART_TYPE.BookLeftCover],
        pages: this._parts[BOOK_PART_TYPE.BookLeftPages],
        topPage: this._parts[BOOK_PART_TYPE.BookLeftTopPage],
      },
      [BOOK_SIDE.Right]: {
        cover: this._parts[BOOK_PART_TYPE.BookRightCover],
        pages: this._parts[BOOK_PART_TYPE.BookRightPages],
        topPage: this._parts[BOOK_PART_TYPE.BookRightTopPage],
      }
    };

    this._startCoverPosition = {
      [BOOK_SIDE.Left]: this._partsBySide[BOOK_SIDE.Left].cover.position.clone(),
      [BOOK_SIDE.Right]: this._partsBySide[BOOK_SIDE.Right].cover.position.clone(),
      back: this._parts[BOOK_PART_TYPE.BookBackCover].position.clone(),
    };

    this._pageFlipConfigByDirection = {
      [PAGE_FLIP_DIRECTION.Forward]: {
        pages: [
          this._parts[BOOK_PART_TYPE.BookRightPageSide01],
          this._parts[BOOK_PART_TYPE.BookRightPageSide02],
        ],
        startAngle: Math.PI * 0.5,
        flipSign: -1,
      },
      [PAGE_FLIP_DIRECTION.Backward]: {
        pages: [
          this._parts[BOOK_PART_TYPE.BookLeftPageSide01],
          this._parts[BOOK_PART_TYPE.BookLeftPageSide02],
        ],
        startAngle: -Math.PI * 0.5,
        flipSign: 1,
      },
    }
  }

  _initBookLastPosition() {
    this._bookLastTransform = {
      position: new THREE.Vector3(),
      rotation: new THREE.Euler(),
    };
  }
}
