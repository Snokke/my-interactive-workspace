import { BOOK_PAGE_NUMBER, BOOK_TEXT_POSITION_TYPE } from "./book-page-data";
import { BOOK_PAGE_TEXT_DATA } from "./book-page-text-data";
import { BOOK_TEXT_STYLE_TYPE } from "./book-text-types";

const BOOK_PAGES = [
  {
    id: 0,
    pageNumber: 1,
    texts: [
      {
        style: BOOK_TEXT_STYLE_TYPE.Regular,
        position: {
          type: BOOK_TEXT_POSITION_TYPE.textArea,
        },
        text: BOOK_PAGE_TEXT_DATA[BOOK_PAGE_NUMBER.Page01],
      },
    ],
    images: [
      // { src: 'snowflake-01', position: { x: 0, y: 0 }, width: 950, height: 1370 },
    ],
  },
  {
    id: 1,
    pageNumber: 2,
    texts: [
      {
        style: BOOK_TEXT_STYLE_TYPE.Regular,
        position: {
          type: BOOK_TEXT_POSITION_TYPE.textArea,
        },
        text: BOOK_PAGE_TEXT_DATA[BOOK_PAGE_NUMBER.Page02],
      },
    ],
    images: [],
  },
  {
    id: 2,
    pageNumber: 3,
    texts: [
      {
        style: BOOK_TEXT_STYLE_TYPE.Regular,
        position: {
          type: BOOK_TEXT_POSITION_TYPE.textArea,
        },
        text: BOOK_PAGE_TEXT_DATA[BOOK_PAGE_NUMBER.Page03],
      },
    ],
    images: [],
  },
  {
    id: 3,
    pageNumber: 4,
    texts: [
      {
        style: BOOK_TEXT_STYLE_TYPE.Regular,
        position: {
          type: BOOK_TEXT_POSITION_TYPE.textArea,
        },
        text: BOOK_PAGE_TEXT_DATA[BOOK_PAGE_NUMBER.Page04],
      },
    ],
    images: [],
  },
  {
    id: 4,
    pageNumber: 5,
    texts: [
      {
        style: BOOK_TEXT_STYLE_TYPE.Regular,
        position: {
          type: BOOK_TEXT_POSITION_TYPE.textArea,
        },
        text: BOOK_PAGE_TEXT_DATA[BOOK_PAGE_NUMBER.Page05],
      },
    ],
    images: [],
  },
  {
    id: 5,
    pageNumber: 6,
    texts: [
      {
        style: BOOK_TEXT_STYLE_TYPE.Regular,
        position: {
          type: BOOK_TEXT_POSITION_TYPE.textArea,
        },
        text: BOOK_PAGE_TEXT_DATA[BOOK_PAGE_NUMBER.Page06],
      },
    ],
    images: [],
  },
  {
    id: 6,
    pageNumber: 7,
    texts: [
      {
        style: BOOK_TEXT_STYLE_TYPE.Regular,
        position: {
          type: BOOK_TEXT_POSITION_TYPE.textArea,
        },
        text: BOOK_PAGE_TEXT_DATA[BOOK_PAGE_NUMBER.Page07],
      },
    ],
    images: [],
  },
  {
    id: 7,
    pageNumber: 8,
    texts: [
      {
        style: BOOK_TEXT_STYLE_TYPE.Regular,
        position: {
          type: BOOK_TEXT_POSITION_TYPE.textArea,
        },
        text: BOOK_PAGE_TEXT_DATA[BOOK_PAGE_NUMBER.Page08],
      },
    ],
    images: [],
  },
]

export { BOOK_PAGES, BOOK_TEXT_POSITION_TYPE };
