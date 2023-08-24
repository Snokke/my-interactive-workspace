import RoomObjectDebugAbstract from "../room-object-debug.abstract";
import { BOOK_CONFIG } from "./data/book-config";

export default class BookDebugMenu extends RoomObjectDebugAbstract {
  constructor(roomObjectType) {
    super(roomObjectType);

    this._showBookButton = null;
    this._nextPageButton = null;
    this._previousPageButton = null;
    this._currentPageController = null;
    this._currentPage = null;
    this._bookTypeController = null;

    this._currentPageValue = 0;
    this._pagesCount = 0;

    this._time = 0;
    this._stepTime = 0.25;
    this._maxBookNameLength = 23;
    this._currentBookNameOffset = 0;
    this._bookType = BOOK_CONFIG.currentBookType;
    this._bookName = BOOK_CONFIG.books[this._bookType].name;
    this._bookNameDirection = 1;
    this._currentBookName = { value: '' };

    this._init();
    this._checkToDisableFolder();
  }

  update(dt) {
    this._updateBookName(dt);
  }

  onBookShow() {
    this._showBookButton.title = 'Hide book';
  }

  onBookHide() {
    this._showBookButton.title = 'Show book';
  }

  disableShowButton() {
    this._showBookButton.disabled = true;
  }

  enableShowButton() {
    this._showBookButton.disabled = false;
  }

  enableNextPageButton() {
    this._nextPageButton.disabled = false;
  }

  enablePreviousPageButton() {
    this._previousPageButton.disabled = false;
  }

  disablePageFlipButtons() {
    this._nextPageButton.disabled = true;
    this._previousPageButton.disabled = true;
  }

  setCurrentPage(page) {
    this._currentPageValue = page;

    this._currentPage.value = `${this._currentPageValue + 1}-${this._currentPageValue + 2} / ${this._pagesCount}`;
    this._currentPageController.refresh();
  }

  updatePagesCount(count) {
    this._pagesCount = count;
    this.setCurrentPage(this._currentPageValue);
  }

  _updateBookName(dt) {
    this._time += dt;

    if (this._time >= this._stepTime) {
      this._time = 0;

      const fittedBookName = this._bookName.slice(this._currentBookNameOffset, this._maxBookNameLength + this._currentBookNameOffset);
      this._currentBookName.value = fittedBookName;
      this._bookTypeController.refresh();

      this._currentBookNameOffset += this._bookNameDirection;

      if (this._currentBookNameOffset >= this._bookName.length - this._maxBookNameLength) {
        this._bookNameDirection = -1;
      }

      if (this._currentBookNameOffset <= 0) {
        this._bookNameDirection = 1;
      }
    }
  }

  _init() {
    this._bookTypeController = this._debugFolder.addInput(this._currentBookName, 'value', {
      label: 'Book name',
      disabled: true,
    });
    this._bookTypeController.customDisabled = true;

    this._showBookButton = this._debugFolder.addButton({
      title: 'Show book',
    }).on('click', () => this.events.post('onShowBook'));
    this._showBookButton.customDisabled = true;

    this._debugFolder.addSeparator();

    this._currentPage = { value: `${this._currentPageValue + 1}-${this._currentPageValue + 2} / ${this._pagesCount}` };
    this._currentPageController = this._debugFolder.addInput(this._currentPage, 'value', {
      label: 'Pages',
      disabled: true,
    });
    this._currentPageController.customDisabled = true;

    this._nextPageButton = this._debugFolder.addButton({
      title: 'Next page',
      disabled: true,
    }).on('click', () => this.events.post('onNextPageClick'));
    this._nextPageButton.customDisabled = true;

    this._previousPageButton = this._debugFolder.addButton({
      title: 'Previous page',
      disabled: true,
    }).on('click', () => this.events.post('onPreviousPageClick'));
    this._previousPageButton.customDisabled = true;

    this._debugFolder.addSeparator();

    this._debugFolder.addInput(BOOK_CONFIG.page, 'flipDuration', {
      label: 'Flip duration',
      min: 200,
      max: 1500,
      format: (v) => `${Math.round((v / 1000) * 100) / 100}`,
    });
  }
}
