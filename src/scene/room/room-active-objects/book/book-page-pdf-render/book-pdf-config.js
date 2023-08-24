import { BOOK_TYPE } from "../data/book-data";

const BOOK_PDF_CONFIG = {
  [BOOK_TYPE.SICP]: {
    scale: 2.5,
    offsetX: -50,
    offsetY: -30,
  },
  [BOOK_TYPE.Algorithms]: {
    scale: 1.85,
    offsetX: -170,
    offsetY: 10,
  },
}

export { BOOK_PDF_CONFIG };
