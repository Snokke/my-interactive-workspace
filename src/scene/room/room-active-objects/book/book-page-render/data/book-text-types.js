const BOOK_TEXT_STYLE_TYPE = {
  Regular: 'REGULAR',
  PageNumber: 'PAGE_NUMBER',
}

const BOOK_TEXT_STYLE_CONFIG = {
  [BOOK_TEXT_STYLE_TYPE.Regular]: {
    font: 'Arial',
    size: 25,
    lineHeightMultiplier: 1.2,
    fillStyle: '#000000',
    textAlign: 'left',
    textBaseline: 'top',
  },
  [BOOK_TEXT_STYLE_TYPE.PageNumber]: {
    font: 'Arial',
    size: 35,
    lineHeightMultiplier: 1.2,
    fillStyle: '#000000',
    textAlign: 'center',
    textBaseline: 'middle',
  },
}

export { BOOK_TEXT_STYLE_TYPE, BOOK_TEXT_STYLE_CONFIG };
