import * as THREE from 'three';
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js';
import Delayed from '../../../../core/helpers/delayed-call';
import RoomObjectAbstract from '../room-object.abstract';
import { STATIC_MODE_CAMERA_CONFIG } from '../../camera-controller/data/camera-config';
import { Black } from 'black-engine';
import { BOOK_PART_TYPE, BOOK_SIDE, OPEN_BOOK_ACTIVE_PAGES_PARTS, OPEN_BOOK_INACTIVE_PARTS, OPEN_BOOK_PARTS, OPEN_BOOK_TOP_PAGES_PARTS, PAGE_FLIP_DIRECTION, PAGE_MATERIAL_TYPE, PAGE_SIDE } from './data/book-data';
import { BOOK_CONFIG } from './data/book-config';
import vertexShader from './page-shaders/page-vertex.glsl';
import fragmentShader from './page-shaders/page-fragment.glsl';
import Materials from '../../../../core/materials';
import Loader from '../../../../core/loader';
import { SOUNDS_CONFIG } from '../../data/sounds-config';
import SoundHelper from '../../shared-objects/sound-helper';
import BookPagePDFRender from './book-page-pdf-render/book-page-pdf-render';

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
    this._bookPageRender = null;
    this._bookPagePDFRender = null;

    this._currentPage = 0;
    this._pagesCount = 0;

    this._init();
  }

  update(dt) {
    this._debugMenu.update(dt);
  }

  onClick(intersect) {
    if (!this._isInputEnabled) {
      return;
    }

    const roomObject = intersect.object;
    const partType = roomObject.userData.partType;

    if (partType === BOOK_PART_TYPE.ClosedBook || OPEN_BOOK_INACTIVE_PARTS.includes(partType)) {
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
      Black.engine.containerElement.style.cursor = 'grab';
    }

    if (OPEN_BOOK_INACTIVE_PARTS.includes(type) && this._isBookShown) {
      Black.engine.containerElement.style.cursor = 'zoom-out';
    }
  }

  getMeshesForOutline(mesh) {
    return [mesh];
  }

  hideBook() {
    this._isBookShown = false;
    this._parts[BOOK_PART_TYPE.ClosedBook].userData.hideOutline = false;
    this._moveBookToStartPosition();
    this._closeBook();
  }

  setBookActive() {
    this._parts[BOOK_PART_TYPE.ClosedBook].userData.isActive = true;
  }

  setBookInactive() {
    this._parts[BOOK_PART_TYPE.ClosedBook].userData.isActive = false;
  }

  getMeshesForOutlinePreview() {
    const closedBook = this._parts[BOOK_PART_TYPE.ClosedBook];

    return [closedBook];
  }

  _onBookClick() {
    if (!this._isBookShown) {
      this._showBook();
    } else {
      this._onHideBookStart();
    }
  }

  _onHideBookStart() {
    this._debugMenu.disableShowButton();
    this._debugMenu.disablePageFlipButtons();
    this.events.post('onBookClickToHide');
  }

  _showBook() {
    this._isBookShown = true;
    this._debugMenu.disableShowButton();

    this._bookLastPosition.copy(this._wrapper.position);
    const globalPosition = this._wrapper.getWorldPosition(new THREE.Vector3());
    this._bookLastTransform.position.copy(globalPosition);
    this._bookLastTransform.rotation.copy(this._wrapper.rotation);
    this.events.post('onBookClickToShow', this._wrapper, this._roomObjectType);

    this._parts[BOOK_PART_TYPE.ClosedBook].userData.hideOutline = true;
    this._disableActivity();

    this._openBook();

    Delayed.call(STATIC_MODE_CAMERA_CONFIG[this._roomObjectType].objectMoveTime, () => {
      this._enableActivity();
      this._debugMenu.enableShowButton();
      this._debugMenu.onBookShow();
    });
  }

  _moveBookToStartPosition() {
    const base = this._parts[BOOK_PART_TYPE.ClosedBook];
    base.userData.isActive = false;

    const endPosition = this._bookLastTransform.position;
    const endRotation = this._bookLastTransform.rotation;

    new TWEEN.Tween(this._wrapper.position)
      .to({ x: endPosition.x, y: endPosition.y, z: endPosition.z }, STATIC_MODE_CAMERA_CONFIG[this._roomObjectType].objectMoveTime)
      .easing(TWEEN.Easing.Sinusoidal.In)
      .start()
      .onComplete(() => {
        base.userData.isActive = true;
        this.add(this._wrapper);
        this._wrapper.position.copy(this._bookLastPosition);
        this._enableActivity();
        this._debugMenu.onBookHide();
        this._debugMenu.enableShowButton();
        this._debugMenu.disablePageFlipButtons();
      });

    new TWEEN.Tween(this._wrapper.rotation)
      .to({ x: endRotation.x, y: endRotation.y, z: endRotation.z }, STATIC_MODE_CAMERA_CONFIG[this._roomObjectType].objectMoveTime)
      .easing(TWEEN.Easing.Sinusoidal.In)
      .start();
  }

  _openBook() {
    this._drawTopPages();
    this._hideClosedBook();
    this._showOpenBook();
    this._disablePagesActivity();

    this._openBookSide(BOOK_SIDE.Left);
    this._openBookSide(BOOK_SIDE.Right);
    this._moveOutBackCover();
  }

  _closeBook() {
    this._disablePagesActivity();

    this._closeBookSide(BOOK_SIDE.Left);
    this._closeBookSide(BOOK_SIDE.Right);
    this._moveInBackCover();

    Delayed.call(BOOK_CONFIG.openAnimation.duration, () => {
      this._hideOpenBook();
      this._showClosedBook();

      if (this._bookPagePDFRender) {
        this._bookPagePDFRender.renderTopPages();
      }
    });
  }

  _openBookSide(sideType) {
    const config = BOOK_CONFIG.openAnimation;
    const { cover, pages, topPage } = this._partsBySide[sideType];
    const sign = sideType === BOOK_SIDE.Left ? -1 : 1;

    new TWEEN.Tween(cover.rotation)
      .to({ y: sign * Math.PI * 0.5 }, config.duration * 0.8)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .delay(config.duration * 0.2)
      .start();

    new TWEEN.Tween(pages.rotation)
      .to({ y: sign * Math.PI * 0.5 }, config.duration * 0.8)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .delay(config.duration * 0.2)
      .start();

    new TWEEN.Tween(topPage.rotation)
      .to({ y: sign * Math.PI * 0.5 }, config.duration * 0.8)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .delay(config.duration * 0.2)
      .start();

    const startPositionZ = this._startCoverPosition[sideType].z;

    new TWEEN.Tween(cover.position)
      .to({ z: startPositionZ - sign * config.sideCoverOffset }, config.duration)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .start();

    new TWEEN.Tween(pages.position)
      .to({ z: 0 }, config.duration * 0.7)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .start();

    new TWEEN.Tween(topPage.position)
      .to({ z: 0 }, config.duration * 0.7)
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

  _closeBookSide(sideType) {
    const config = BOOK_CONFIG.openAnimation;
    const { cover, pages, topPage } = this._partsBySide[sideType];

    new TWEEN.Tween(cover.rotation)
      .to({ y: 0 }, config.duration)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .start();

    new TWEEN.Tween(pages.rotation)
      .to({ y: 0 }, config.duration)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .start();

    new TWEEN.Tween(topPage.rotation)
      .to({ y: 0 }, config.duration)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .start();

    const startPositionZ = this._startCoverPosition[sideType].z;

    new TWEEN.Tween(cover.position)
      .to({ z: startPositionZ }, config.duration)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .start();

    new TWEEN.Tween(pages.position)
      .to({ z: startPositionZ }, config.duration * 0.7)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .delay(config.duration * 0.3)
      .start();

    new TWEEN.Tween(topPage.position)
      .to({ z: startPositionZ }, config.duration * 0.7)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .delay(config.duration * 0.3)
      .start();
  }

  _moveInBackCover() {
    const config = BOOK_CONFIG.openAnimation;
    const backCover = this._parts[BOOK_PART_TYPE.BookBackCover];

    const startPositionX = this._startCoverPosition.back.x;

    new TWEEN.Tween(backCover.position)
      .to({ x: startPositionX }, config.duration)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .start();
  }

  _flipPage(direction) {
    const progress = { value: 0 };
    this._disablePagesActivity();
    this._drawPagesOnFlipProgress(direction);
    this._playSound();
    this.events.post('onPageMoving');

    const config = this._pageFlipConfigByDirection[direction];
    const pages = config.pages;
    this._showPages(pages[0], pages[1]);

    pages.forEach((page) => {
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
        this._currentPage = direction === PAGE_FLIP_DIRECTION.Forward ? this._currentPage + 2 : this._currentPage - 2;
        this._debugMenu.setCurrentPage(this._currentPage);
        this._hidePages(pages[0], pages[1]);
        this._drawPagesOnFlipEnd(direction);
        this._enablePagesActivity();

        if (this._bookPagePDFRender) {
          this._bookPagePDFRender.setCurrentPage(this._currentPage);
        }

        Delayed.call(10, () => {
          this.events.post('onPageStopMoving');
        })
      });
  }

  _enablePagesActivity() {
    if (this._currentPage + 2 < this._pagesCount) {
      this._parts[BOOK_PART_TYPE.BookRightTopPage].userData.isActive = true;
      this._debugMenu.enableNextPageButton();
    }

    if (this._currentPage >= 2) {
      this._parts[BOOK_PART_TYPE.BookLeftTopPage].userData.isActive = true;
      this._debugMenu.enablePreviousPageButton();
    }
  }

  _disablePagesActivity() {
    this._parts[BOOK_PART_TYPE.BookLeftTopPage].userData.isActive = false;
    this._parts[BOOK_PART_TYPE.BookRightTopPage].userData.isActive = false;
    this._debugMenu.disablePageFlipButtons();
  }

  _disableActivity() {
    for (const partName in this._parts) {
      this._parts[partName].userData.isActive = false;
    }
  }

  _enableActivity() {
    for (const partName in this._parts) {
      this._parts[partName].userData.isActive = true;
    }

    this._disablePagesActivity();
    this._enablePagesActivity();
  }

  _hideOpenBook() {
    OPEN_BOOK_PARTS.forEach((partName) => {
      const part = this._parts[partName];
      part.scale.set(0, 0, 0);
      part.visible = false;
    });
  }

  _showOpenBook() {
    const partsWithoutActivePages = [...OPEN_BOOK_TOP_PAGES_PARTS, ...OPEN_BOOK_INACTIVE_PARTS];

    partsWithoutActivePages.forEach((partName) => {
      const part = this._parts[partName];
      part.scale.set(1, 1, 1);
      part.visible = true;
    });
  }

  _hidePages(pageSide01, pageSide02) {
    pageSide01.scale.set(0, 0, 0);
    pageSide02.scale.set(0, 0, 0);

    pageSide01.visible = false;
    pageSide02.visible = false;
  }

  _showPages(pageSide01, pageSide02) {
    pageSide01.scale.set(1, 1, 1);
    pageSide02.scale.set(1, 1, 1);

    pageSide01.visible = true;
    pageSide02.visible = true;
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

  _drawTopPages() {
    this._drawPage(this._currentPage, this._parts[BOOK_PART_TYPE.BookLeftTopPage], PAGE_SIDE.Left, PAGE_MATERIAL_TYPE.Basic);
    this._drawPage(this._currentPage + 1, this._parts[BOOK_PART_TYPE.BookRightTopPage], PAGE_SIDE.Right, PAGE_MATERIAL_TYPE.Basic);

    if (this._bookPagePDFRender) {
      this._bookPagePDFRender.setCurrentPage(this._currentPage);
    }
  }

  _drawPagesOnFlipProgress(flipDirection) {
    if (flipDirection === PAGE_FLIP_DIRECTION.Forward) {
      this._copyPage(this._parts[BOOK_PART_TYPE.BookRightTopPage], this._parts[BOOK_PART_TYPE.BookRightPageSide01]);
      this._drawPage(this._currentPage + 3, this._parts[BOOK_PART_TYPE.BookRightTopPage], PAGE_SIDE.Right, PAGE_MATERIAL_TYPE.Basic);
      this._drawPage(this._currentPage + 2, this._parts[BOOK_PART_TYPE.BookRightPageSide02], PAGE_SIDE.Left, PAGE_MATERIAL_TYPE.Shader);
    }

    if (flipDirection === PAGE_FLIP_DIRECTION.Backward) {
      this._copyPage(this._parts[BOOK_PART_TYPE.BookLeftTopPage], this._parts[BOOK_PART_TYPE.BookLeftPageSide02]);
      this._drawPage(this._currentPage - 2, this._parts[BOOK_PART_TYPE.BookLeftTopPage], PAGE_SIDE.Left, PAGE_MATERIAL_TYPE.Basic);
      this._drawPage(this._currentPage - 1, this._parts[BOOK_PART_TYPE.BookLeftPageSide01], PAGE_SIDE.Right, PAGE_MATERIAL_TYPE.Shader);
    }
  }

  _drawPagesOnFlipEnd(flipDirection) {
    if (flipDirection === PAGE_FLIP_DIRECTION.Forward) {
      this._drawPage(this._currentPage, this._parts[BOOK_PART_TYPE.BookLeftTopPage], PAGE_SIDE.Left, PAGE_MATERIAL_TYPE.Basic);
    }

    if (flipDirection === PAGE_FLIP_DIRECTION.Backward) {
      this._drawPage(this._currentPage + 1, this._parts[BOOK_PART_TYPE.BookRightTopPage], PAGE_SIDE.Right, PAGE_MATERIAL_TYPE.Basic);
    }
  }

  _updatePageTexture(page, materialType) {
    if (materialType === PAGE_MATERIAL_TYPE.Basic) {
      page.material.map.needsUpdate = true;
    }

    if (materialType === PAGE_MATERIAL_TYPE.Shader) {
      page.userData.texture.needsUpdate = true;
    }
  }

  _init() {
    this._initBookPageRender();
    this._initParts();
    this._addMaterials();
    this._addPartsToScene();
    this._initWrapperGroup();
    this._initOpenBook();
    this._initSounds();
    this._initBookLastPosition();
    this._initDebugMenu();
    this._initSignals();
    this._hideOpenBook();
  }

  _initBookPageRender() {
    if (typeof window === 'undefined' || !('Worker' in window)) {
      console.log('Web Workers not supported in this environment.');

      return;
    }

    const bookPagePDFRender = this._bookPagePDFRender = new BookPagePDFRender();

    bookPagePDFRender.events.on('onPdfLoaded', (msg, pagesCount) => {
      this._pagesCount = pagesCount;
      this._debugMenu.updatePagesCount(pagesCount);
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
    wrapper.add(closedBook);

    OPEN_BOOK_PARTS.forEach((partName) => {
      const part = this._parts[partName];
      wrapper.add(part);

      const partPositionDelta = part.position.clone().sub(closedBook.position);
      part.position.copy(partPositionDelta);
    });

    wrapper.position.copy(closedBook.userData.startPosition);
    closedBook.position.set(0, 0, 0);

    wrapper.rotation.x = -30 * THREE.MathUtils.DEG2RAD;
  }

  _initOpenBook() {
    this._setOpenBookPartsData();
    this._initPagesMaterials();
    this._loadPageTexture();
    this._setOpenBookMaterials();
    this._setActivePagesMaterial();
    this._setPartsSettings();
  }

  _setOpenBookPartsData() {
    OPEN_BOOK_INACTIVE_PARTS.forEach((partName) => {
      const part = this._parts[partName];
      part.userData.hideOutline = true;
    });
  }

  _loadPageTexture() {
    const pageTexture = this._pageTexture = new Image();
    pageTexture.src = '/textures/baked-textures/baked-page.jpg';
  }

  _drawPage(pageId, page, pageSide, materialType) {
    const bitmap = page.userData.bitmap;
    const context = bitmap.getContext('2d');

    context.clearRect(0, 0, bitmap.width, bitmap.height);

    this._drawBakedPageTexture(bitmap, pageSide);

    if (this._bookPagePDFRender) {
      this._bookPagePDFRender.drawPage(context, pageId);
    }

    this._updatePageTexture(page, materialType);
  }

  _copyPage(fromPage, toPage) {
    const bitmap = toPage.userData.bitmap;
    const context = bitmap.getContext('2d');

    context.clearRect(0, 0, bitmap.width, bitmap.height);
    context.drawImage(fromPage.userData.bitmap, 0, 0, bitmap.width, bitmap.height);

    this._updatePageTexture(toPage, PAGE_MATERIAL_TYPE.Shader);
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
    OPEN_BOOK_TOP_PAGES_PARTS.forEach((partName) => {
      const part = this._parts[partName];
      this._createPageMaterial(part);
    });

    OPEN_BOOK_ACTIVE_PAGES_PARTS.forEach((partName) => {
      const part = this._parts[partName];
      this._createShaderPageTexture(part);
    });
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
    const bakedTexture = Loader.assets['baked-textures/baked-opened-book'];
    bakedTexture.flipY = false;

    const bakedMaterial = new THREE.MeshBasicMaterial({
      map: bakedTexture,
    });

    OPEN_BOOK_INACTIVE_PARTS.forEach((partName) => {
      const part = this._parts[partName];
      part.material = bakedMaterial;
    });
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

  _initSounds() {
    this._initSound();
    this._initSoundHelper();
  }

  _initSound() {
    const soundConfig = SOUNDS_CONFIG.objects[this._roomObjectType];

    const sound = this._sound = new THREE.PositionalAudio(this._audioListener);
    this._wrapper.add(sound);

    sound.setRefDistance(soundConfig.refDistance);
    sound.position.x = 0.3;

    sound.setVolume(this._globalVolume * this._objectVolume);

    Loader.events.on('onAudioLoaded', () => {
      sound.setBuffer(Loader.assets['page-flip']);
    });
  }

  _initSoundHelper() {
    const helperSize = SOUNDS_CONFIG.objects[this._roomObjectType].helperSize;
    const soundHelper = this._soundHelper = new SoundHelper(helperSize);
    this._wrapper.add(soundHelper);

    soundHelper.position.copy(this._sound.position);
  }

  _initSignals() {
    this._debugMenu.events.on('onShowBook', () => this._onDebugShowBookClick());
    this._debugMenu.events.on('onNextPageClick', () => this._flipPage(PAGE_FLIP_DIRECTION.Forward));
    this._debugMenu.events.on('onPreviousPageClick', () => this._flipPage(PAGE_FLIP_DIRECTION.Backward));
  }

  _onDebugShowBookClick() {
    if (!this._isBookShown) {
      this._showBook();
    } else {
      this._onHideBookStart();
    }
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
