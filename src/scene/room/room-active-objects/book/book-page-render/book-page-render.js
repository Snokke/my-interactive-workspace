import { BOOK_CONFIG } from "../data/book-config";
import { PAGE_SIDE } from "../data/book-data";
import { BOOK_PAGE_CONFIG } from "./data/book-page-config";
import { BOOK_PAGES } from "./data/book-pages-config";
import { BOOK_TEXT_STYLE_CONFIG, BOOK_TEXT_STYLE_TYPE } from "./data/book-text-types";

export default class BookPageRender {
  constructor() {

  }

  drawPage(bitmap, pageId, pageSide) {
    const context = bitmap.getContext('2d');
    const pageData = this._getPageDataById(pageId);

    this._drawTextArea(context);

    pageData.texts.forEach((textData) => {
      this._drawText(textData, context);
    });

    this._drawPageNumber(pageData.pageNumber, pageSide, context);
  }

  _drawText(textData, context) {
    const textStyleConfig = BOOK_TEXT_STYLE_CONFIG[textData.style];
    this._setContextStyle(context, textData.style);

    const x = (BOOK_CONFIG.page.width - BOOK_PAGE_CONFIG.textArea.width) * 0.5 * BOOK_CONFIG.page.resolution;
    const y = (BOOK_CONFIG.page.height - BOOK_PAGE_CONFIG.textArea.height) * 0.5 * BOOK_CONFIG.page.resolution;
    const maxWidth = BOOK_PAGE_CONFIG.textArea.width * BOOK_CONFIG.page.resolution;
    const lineHeight = textStyleConfig.size * textStyleConfig.lineHeightMultiplier * BOOK_CONFIG.page.resolution;

    const formattedText = this._formatText(textData.text);
    const wrappedText = this._wrapText(context, formattedText, x, y, maxWidth, lineHeight);

    wrappedText.forEach((item) => {
      context.fillText(item[0], item[1], item[2]);
    });
  }

  _drawPageImages(imagesData, bitmap, context) {

  }

  _drawPageNumber(pageNumber, pageSide, context) {
    this._setContextStyle(context, BOOK_TEXT_STYLE_TYPE.PageNumber);

    let x;

    if (pageSide === PAGE_SIDE.Left) {
      x = BOOK_PAGE_CONFIG.pageNumber.x * BOOK_CONFIG.page.resolution;
    } else {
      x = (BOOK_CONFIG.page.width - BOOK_PAGE_CONFIG.pageNumber.x) * BOOK_CONFIG.page.resolution;
    }

    const y = BOOK_PAGE_CONFIG.pageNumber.y * BOOK_CONFIG.page.resolution;

    context.fillText(pageNumber, x, y);
  }

  _setContextStyle(context, styleType) {
    const textStyleConfig = BOOK_TEXT_STYLE_CONFIG[styleType];

    context.font = `${textStyleConfig.size * BOOK_CONFIG.page.resolution}px ${textStyleConfig.font}`;
    context.fillStyle = textStyleConfig.fillStyle;
    context.textAlign = textStyleConfig.textAlign;
    context.textBaseline = textStyleConfig.textBaseline;
  }

  _wrapText(context, text, x, y, maxWidth, lineHeight) {
    const paragraphs = text.split('\n');
    const lineArray = [];
    const startX = x;
    x += BOOK_PAGE_CONFIG.paragraph.offsetX * BOOK_CONFIG.page.resolution;

    for (let i = 0; i < paragraphs.length; i++) {
      let paragraph = paragraphs[i];

      while (paragraph[0] === ' ') {
        paragraph = paragraph.slice(1);
      }

      const words = paragraph.split(' ');
      let line = '';
      let testLine = '';

      for (let n = 0; n < words.length; n++) {
        testLine += `${words[n]} `;
        const metrics = context.measureText(testLine);
        let testWidth = metrics.width;

        if (x !== startX) {
          testWidth += BOOK_PAGE_CONFIG.paragraph.offsetX * BOOK_CONFIG.page.resolution;
        }

        if (testWidth > maxWidth && n > 0) {
          lineArray.push([line, x, y]);
          y += lineHeight;
          x = startX;
          line = `${words[n]} `;
          testLine = `${words[n]} `;
        } else {
          line += `${words[n]} `;
        }

        if (n === words.length - 1) {
          lineArray.push([line, x, y]);
        }
      }

      y += lineHeight * BOOK_PAGE_CONFIG.paragraph.firstLineHeightMultiplier;
      x += BOOK_PAGE_CONFIG.paragraph.offsetX * BOOK_CONFIG.page.resolution;
    }

    return lineArray;
  }

  _formatText(text) {
    const paragraphs = text.split('\n\n');

    paragraphs.forEach((paragraph, index) => {
      paragraphs[index] = paragraph.replace(/\n/g, ' ');
    });

    text = paragraphs.join('\n');
    text = this._removeExtraSpaces(text);

    return text;
  }

  _removeExtraSpaces(text) {
    return text.replace(/ {2,}/g, ' ');
  }

  _drawTextArea(context) {
    if (BOOK_PAGE_CONFIG.textArea.show === false) {
      return;
    }

    context.strokeStyle = '#ff0000';

    context.rect(
      (BOOK_CONFIG.page.width - BOOK_PAGE_CONFIG.textArea.width) * 0.5 * BOOK_CONFIG.page.resolution,
      (BOOK_CONFIG.page.height - BOOK_PAGE_CONFIG.textArea.height) * 0.5 * BOOK_CONFIG.page.resolution,
      BOOK_PAGE_CONFIG.textArea.width * BOOK_CONFIG.page.resolution,
      BOOK_PAGE_CONFIG.textArea.height * BOOK_CONFIG.page.resolution,
    );

    context.stroke();
  }

  _getPageDataById(pageId) {
    return BOOK_PAGES.find((page) => page.id === pageId);
  }
}
