const BOOK_PART_TYPE = {
  ClosedBook: 'closed_book',
  BookLeftCover: 'book_left_cover',
  BookLeftPages: 'book_left_pages',
  BookLeftTopPage: 'book_left_top_page',
  BookRightCover: 'book_right_cover',
  BookRightPages: 'book_right_pages',
  BookRightTopPage: 'book_right_top_page',
  BookBackCover: 'book_back_cover',
  BookPageSide01: 'book_page_side01',
  BookPageSide02: 'book_page_side02',
}

const BOOK_PART_ACTIVITY_CONFIG = {
  [BOOK_PART_TYPE.ClosedBook]: true,
  [BOOK_PART_TYPE.BookLeftCover]: true,
  [BOOK_PART_TYPE.BookLeftPages]: true,
  [BOOK_PART_TYPE.BookLeftTopPage]: true,
  [BOOK_PART_TYPE.BookRightCover]: true,
  [BOOK_PART_TYPE.BookRightPages]: true,
  [BOOK_PART_TYPE.BookRightTopPage]: true,
  [BOOK_PART_TYPE.BookBackCover]: true,
  [BOOK_PART_TYPE.BookPageSide01]: false,
  [BOOK_PART_TYPE.BookPageSide02]: false,
}

const OPEN_BOOK_PARTS = [
  BOOK_PART_TYPE.BookLeftCover,
  BOOK_PART_TYPE.BookLeftPages,
  BOOK_PART_TYPE.BookLeftTopPage,
  BOOK_PART_TYPE.BookRightCover,
  BOOK_PART_TYPE.BookRightPages,
  BOOK_PART_TYPE.BookRightTopPage,
  BOOK_PART_TYPE.BookBackCover,
]

const BOOK_SIDE = {
  Left: 'LEFT',
  Right: 'RIGHT',
}

export { BOOK_PART_TYPE, BOOK_PART_ACTIVITY_CONFIG, OPEN_BOOK_PARTS, BOOK_SIDE };
