const BOOK_PART_TYPE = {
  ClosedBook: 'closed_book',
  BookLeftCover: 'book_left_cover',
  BookLeftPages: 'book_left_pages',
  BookLeftTopPage: 'book_left_top_page',
  BookRightCover: 'book_right_cover',
  BookRightPages: 'book_right_pages',
  BookRightTopPage: 'book_right_top_page',
  BookBackCover: 'book_back_cover',
  BookRightPageSide01: 'book_right_page_side01',
  BookRightPageSide02: 'book_right_page_side02',
  BookLeftPageSide01: 'book_left_page_side01',
  BookLeftPageSide02: 'book_left_page_side02',
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
  [BOOK_PART_TYPE.BookRightPageSide01]: false,
  [BOOK_PART_TYPE.BookRightPageSide02]: false,
  [BOOK_PART_TYPE.BookLeftPageSide01]: false,
  [BOOK_PART_TYPE.BookLeftPageSide02]: false,
}

const OPEN_BOOK_PARTS = [
  BOOK_PART_TYPE.BookLeftCover,
  BOOK_PART_TYPE.BookLeftPages,
  BOOK_PART_TYPE.BookLeftTopPage,
  BOOK_PART_TYPE.BookRightCover,
  BOOK_PART_TYPE.BookRightPages,
  BOOK_PART_TYPE.BookRightTopPage,
  BOOK_PART_TYPE.BookBackCover,
  BOOK_PART_TYPE.BookRightPageSide01,
  BOOK_PART_TYPE.BookRightPageSide02,
  BOOK_PART_TYPE.BookLeftPageSide01,
  BOOK_PART_TYPE.BookLeftPageSide02,
]

const OPEN_BOOK_ACTIVE_PAGES_PARTS = [
  BOOK_PART_TYPE.BookRightPageSide01,
  BOOK_PART_TYPE.BookRightPageSide02,
  BOOK_PART_TYPE.BookLeftPageSide01,
  BOOK_PART_TYPE.BookLeftPageSide02,
]

const OPEN_BOOK_TOP_PAGES_PARTS = [
  BOOK_PART_TYPE.BookLeftTopPage,
  BOOK_PART_TYPE.BookRightTopPage,
]

const OPEN_BOOK_INACTIVE_PARTS = [
  BOOK_PART_TYPE.BookLeftCover,
  BOOK_PART_TYPE.BookLeftPages,
  BOOK_PART_TYPE.BookRightCover,
  BOOK_PART_TYPE.BookRightPages,
  BOOK_PART_TYPE.BookBackCover,
]

const BOOK_TYPE = {
  SICP: 'SICP',
  Algorithms: 'ALGORITHMS',
}

const BOOK_SIDE = {
  Left: 'LEFT',
  Right: 'RIGHT',
}

const PAGE_SIDE = {
  Left: 'LEFT',
  Right: 'RIGHT',
}

const PAGE_MATERIAL_TYPE = {
  Basic: 'BASIC',
  Shader: 'SHADER',
}

const PAGE_FLIP_DIRECTION = {
  Forward: 'FORWARD',
  Backward: 'BACKWARD',
}

export {
  BOOK_PART_TYPE,
  BOOK_PART_ACTIVITY_CONFIG,
  BOOK_SIDE,
  PAGE_SIDE,
  PAGE_MATERIAL_TYPE,
  PAGE_FLIP_DIRECTION,
  OPEN_BOOK_PARTS,
  OPEN_BOOK_INACTIVE_PARTS,
  OPEN_BOOK_ACTIVE_PAGES_PARTS,
  OPEN_BOOK_TOP_PAGES_PARTS,
  BOOK_TYPE,
};
