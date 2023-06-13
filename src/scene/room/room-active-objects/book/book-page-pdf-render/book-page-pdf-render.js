import * as pdfjs from 'pdfjs-dist/build/pdf';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker?worker';
import { BOOK_CONFIG } from '../data/book-config';
import { BOOK_PDF_CONFIG } from './book-pdf-config';
import { MessageDispatcher } from 'black-engine';

export default class BookPagePDFRender {
  constructor() {

    this.events = new MessageDispatcher();

    this._pdf = null;
    this._pages = [];
    this._bitmaps = [];

    this._currentPage = 0;

    this._init();
  }

  drawPage(context, pageId) {
    const bitmap = this._getBitmap(pageId);

    if (bitmap) {
      context.drawImage(bitmap, 0, 0, bitmap.width, bitmap.height);
    }
  }

  setCurrentPage(pageId) {
    this._currentPage = pageId;

    this._renderPages(this._currentPage - 1, this._currentPage - 2, this._currentPage + 2, this._currentPage + 3);
  }

  renderTopPages() {
    this._renderPages(this._currentPage, this._currentPage + 1);
  }

  _init() {
    this._createBitmaps();
    this._initPDFJS();
    this._loadPDF();
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

  _initPDFJS() {
    window.pdfjsWorker = pdfjsWorker;
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
  }

  _loadPDF() {
    const path = `/pdf/${BOOK_PDF_CONFIG.fileName}`;
    const loadingTask = pdfjs.getDocument(path);

    loadingTask.promise.then((pdf) => {
      this._pdf = pdf;

      this.events.post('onPdfLoaded', this._pdf.numPages);

      this.renderTopPages();
    }, (reason) => {
      console.error(reason);
    });
  }

  _renderPages(page01, page02, page03, page04) {
    this._clearBitmaps();
    const pagesId = [page01, page02, page03, page04];

    for (let i = 0; i < this._bitmaps.length; i++) {
      const bitmap = this._bitmaps[i].bitmap;

      if (pagesId[i] === undefined || pagesId[i] + 1 <= 0 || pagesId[i] + 1 > this._pdf.numPages) {
        continue;
      }

      this._pdf.getPage(pagesId[i] + 1).then((page) => {
        this._bitmaps[i].pageId = pagesId[i];

        const viewport = page.getViewport({
          scale: BOOK_PDF_CONFIG.scale * BOOK_CONFIG.page.resolution,
          offsetX: BOOK_PDF_CONFIG.offsetX * BOOK_CONFIG.page.resolution,
          offsetY: BOOK_PDF_CONFIG.offsetY * BOOK_CONFIG.page.resolution,
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
