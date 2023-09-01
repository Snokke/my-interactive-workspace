const CV_CONFIG = {
  width: 210,
  height: 297,
  resolution: 3,
  fileName: 'andrii-babintsev-cv.pdf',
  page: {
    scale: 0.345,
    offsetX: 0,
    offsetY: 3,
  },
  links: {
    linkedIn: 'https://www.linkedin.com/in/andriibabintsev/',
    email: 'mailto:andrii.babintsev@gmail.com',
    pdf: 'https://www.andriibabintsev.com/pdf/andrii-babintsev-cv.pdf',
  }
}

const CV_LINKS_CONFIG = [
  {
    partTypeKey: 'LinkedIn',
    partTypeValue: 'linkedin',
    x: 0.262,
    y: -0.427,
    width: 0.222,
    height: 0.017,
    texture: null,
  },
  {
    partTypeKey: 'EMail',
    partTypeValue: 'email',
    x: 0.251,
    y: -0.447,
    width: 0.2,
    height: 0.017,
    texture: null,
  },
  {
    partTypeKey: 'OpenPDF',
    partTypeValue: 'open-pdf',
    x: 0,
    y: 0.52,
    width: 0.482 * 0.35,
    height: 0.175 * 0.35,
    texture: 'open-pdf-button',
  }
]

export { CV_CONFIG, CV_LINKS_CONFIG };
