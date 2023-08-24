import { BOOK_TYPE } from "./book-data";

const BOOK_CONFIG = {
  currentBookType: BOOK_TYPE.SICP,
  openAnimation: {
    duration: 450,
    sideCoverOffset: 0.04,
    backCoverOffset: 0.009,
  },
  page: {
    width: 950,
    height: 1370,
    resolution: 0.6,
    flipDuration: 650,
  },
  books: {
    [BOOK_TYPE.SICP]: {
      fileName: 'sicp.pdf',
      name: ' Structure and Interpretation of Computer Programs - 2nd Edition ',
    },
    [BOOK_TYPE.Algorithms]: {
      fileName: 'algorithms.pdf',
      name: ' Algorithms - 4th Edition ',
    },
  }
}

export { BOOK_CONFIG };
