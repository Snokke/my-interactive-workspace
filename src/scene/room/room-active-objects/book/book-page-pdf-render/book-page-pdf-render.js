import * as pdfjs from 'pdfjs-dist/build/pdf';
import { BOOK_CONFIG } from '../data/book-config';
import { BOOK_PDF_CONFIG } from './book-pdf-config';
import { MessageDispatcher } from 'black-engine';
import { BOOK_TYPE } from '../data/book-data';

export default class BookPagePDFRender {
  constructor() {

    this.events = new MessageDispatcher();

    this._pdf = {};
    this._currentPage = {};
    this._bitmaps = [];
    this._previousLoadingPercent = 0;

    this._init();
  }

  drawPage(context, pageId) {
    const bitmap = this._getBitmap(pageId);

    if (bitmap) {
      context.drawImage(bitmap, 0, 0, bitmap.width, bitmap.height);
    }
  }

  setCurrentPage(bookType, pageId) {
    this._currentPage[bookType] = pageId;

    this._renderPages(bookType, this._currentPage[bookType] - 1, this._currentPage[bookType] - 2, this._currentPage[bookType] + 2, this._currentPage[bookType] + 3);
  }

  renderTopPages(bookType) {
    this._renderPages(bookType, this._currentPage[bookType], this._currentPage[bookType] + 1);
  }

  loadPDF(bookType) {
    const path = `/pdf/${BOOK_CONFIG.books[bookType].fileName}`;
    const loadingTask = pdfjs.getDocument(path);
    this._previousLoadingPercent = 0;

    loadingTask.onProgress = (progressData) => {
      const percent = Math.round((progressData.loaded / progressData.total) * 100);

      if (percent !== this._previousLoadingPercent) {
        this._previousLoadingPercent = percent;
        this.events.post('onPdfLoadingProgress', percent);
      }
    };

    loadingTask.promise.then((pdf) => {
      this._pdf[bookType] = pdf;

      this._renderPages(bookType, this._currentPage[bookType], this._currentPage[bookType] + 1)

      setTimeout(() => {
        this.events.post('onPdfLoaded', bookType, this._pdf[bookType].numPages);
      }, 200);
    }, (reason) => {
      console.error(reason);
    });
  }

  _init() {
    this._createBitmaps();
    this._initPDFObjects();
  }

  _createBitmaps() {
    const bitmapsCount = 4;

    for (let i = 0; i < bitmapsCount; i++) {
      const bitmap = document.createElement('canvas');
      bitmap.width = BOOK_CONFIG.page.width * BOOK_CONFIG.page.resolution;
      bitmap.height = BOOK_CONFIG.page.height * BOOK_CONFIG.page.resolution;

      const bitmapConfig = {
        bitmap,
        pageId: 0,
      };

      this._bitmaps.push(bitmapConfig);
    }
  }

  _initPDFObjects() {
    for (const type in BOOK_TYPE) {
      const bookType = BOOK_TYPE[type];

      this._pdf[bookType] = null;
      this._currentPage[bookType] = 0;
    }
  }

  _renderPages(bookType, page01, page02, page03, page04) {
    this._clearBitmaps();
    const pagesId = [page01, page02, page03, page04];

    for (let i = 0; i < this._bitmaps.length; i++) {
      const bitmap = this._bitmaps[i].bitmap;

      if (pagesId[i] === undefined || pagesId[i] + 1 <= 0 || pagesId[i] + 1 > this._pdf[bookType].numPages) {
        continue;
      }

      this._pdf[bookType].getPage(pagesId[i] + 1).then((page) => {
        this._bitmaps[i].pageId = pagesId[i];

        const viewport = page.getViewport({
          scale: BOOK_PDF_CONFIG[bookType].scale * BOOK_CONFIG.page.resolution,
          offsetX: BOOK_PDF_CONFIG[bookType].offsetX * BOOK_CONFIG.page.resolution,
          offsetY: BOOK_PDF_CONFIG[bookType].offsetY * BOOK_CONFIG.page.resolution,
        });

        const context = bitmap.getContext('2d');

        const renderContext = {
          canvasContext: context,
          background: 'rgba(0, 0, 0, 0)',
          viewport: viewport,
        };

        page.render(renderContext);
      });
    }
  }

  _clearBitmaps() {
    for (let i = 0; i < this._bitmaps.length; i++) {
      const bitmap = this._bitmaps[i].bitmap;
      const context = bitmap.getContext('2d');

      context.clearRect(0, 0, bitmap.width, bitmap.height);
    }
  }

  _getBitmap(pageId) {
    for (let i = 0; i < this._bitmaps.length; i++) {
      if (this._bitmaps[i].pageId === pageId) {
        return this._bitmaps[i].bitmap;
      }
    }

    return null;
  }
}
