
import AdaptiveThreshold    from './adaptiveThresholding';
import getSkewAngle         from './houghTransform';
import {sharpen, laplacian} from './sharpening';
import correctSkew          from './skewCorrection';

const preprocessImage = (canvasRef) => {
  const canvas = canvasRef.current
  let processedImageData = canvas.getContext('2d').getImageData(0,0,canvas.width, canvas.height);
  
  /**
   * Preprocessing involves follwing steps =>
   * 1. Denoising of Images
   *    1.1 Sharpening    => To remove blur in input images
   *    1.2 Gaussian Blur => To remove noise from back ground
   * 2. Binarization
   *    2.1 Adaptive Threshold 
   * 3. Skew Correction
   *  3.1 Skew Detection using Hough Transformation
   *  3.2 Skew Correctin using Geometrical Transformation
   */

  /**
   * DENOISING IMAGE
   */
  processedImageData = sharpen(processedImageData);
  gaussianBlur(processedImageData, canvas, 1);

  
  /**
   * BINARIZATION
   */
  processedImageData = AdaptiveThreshold(processedImageData, 0.82)

  /**
   * Skew Correction
   */
  let theta = getSkewAngle(processedImageData);
  processedImageData = correctSkew(processedImageData, theta);
  
  /**
   * Image Enhancement
   */
  dilate(processedImageData.data, canvas);
  erode(processedImageData.data, canvas);
  processedImageData = enhance(processedImageData, invertColors(laplacian(processedImageData)));
  
  return processedImageData;
};

let blurRadius;
let blurKernelSize;
let blurKernel;
let blurMult;

function enhance(pixels, edges) {
  let width = pixels.width;
  let height = pixels.height;

  let temporaryCanvas = document.createElement('canvas')
  let temporaryCtx = temporaryCanvas.getContext('2d')
  let outputData = temporaryCtx.createImageData(width, height);

  for(let y=0 ; y<height ; y++) {
    for(let x=0 ; x<width ; x++) {
      let offset = (y * width + x) * 4;
      outputData.data[offset + 0] = 255 ;
      outputData.data[offset + 1] = 255 ;
      outputData.data[offset + 2] = 255 ;
      outputData.data[offset + 3] = 255 ;  
    }
  }

  for(let y=0 ; y<height ; y++) {
    for(let x=0 ; x<width ; x++) {
      let offset = (y * width + x) * 4;
      outputData.data[offset + 0] = 255 - (edges.data[offset+0] ^ pixels.data[offset+0]);
      outputData.data[offset + 1] = 255 - (edges.data[offset+1] ^ pixels.data[offset+1]);
      outputData.data[offset + 2] = 255 - (edges.data[offset+2] ^ pixels.data[offset+2]);
    }
  }
  return outputData;
}
function getARGB (data, i) {
  const offset = i * 4;
  return (
    ((data[offset + 3] << 24) & 0xff000000) |
    ((data[offset] << 16) & 0x00ff0000) |
    ((data[offset + 1] << 8) & 0x0000ff00) |
    (data[offset + 2] & 0x000000ff)
  );
};

function setPixels (pixels, data) {
  let offset = 0;
  for (let i = 0, al = pixels.length; i < al; i++) {
    offset = i * 4;
    pixels[offset + 0] = (data[i] & 0x00ff0000) >>> 16;
    pixels[offset + 1] = (data[i] & 0x0000ff00) >>> 8;
    pixels[offset + 2] = data[i] & 0x000000ff;
    pixels[offset + 3] = (data[i] & 0xff000000) >>> 24;
  }
};

// from https://github.com/processing/p5.js/blob/main/src/image/filters.js
function buildBlurKernel(r) {
let radius = (r * 3.5) | 0;
radius = radius < 1 ? 1 : radius < 248 ? radius : 248;

if (blurRadius !== radius) {
  blurRadius = radius;
  blurKernelSize = (1 + blurRadius) << 1;
  blurKernel = new Int32Array(blurKernelSize);
  blurMult = new Array(blurKernelSize);
  for (let l = 0; l < blurKernelSize; l++) {
    blurMult[l] = new Int32Array(256);
  }

  let bk, bki;
  let bm, bmi;

  for (let i = 1, radiusi = radius - 1; i < radius; i++) {
    blurKernel[radius + i] = blurKernel[radiusi] = bki = radiusi * radiusi;
    bm = blurMult[radius + i];
    bmi = blurMult[radiusi--];
    for (let j = 0; j < 256; j++) {
      bm[j] = bmi[j] = bki * j;
    }
  }
  bk = blurKernel[radius] = radius * radius;
  bm = blurMult[radius];

  for (let k = 0; k < 256; k++) {
    bm[k] = bk * k;
  }
}
}

// from https://github.com/processing/p5.js/blob/main/src/image/filters.js
function blurARGB(pixels, canvas, radius) {
const width = canvas.width;
const height = canvas.height;
const numPackedPixels = width * height;
const argb = new Int32Array(numPackedPixels);
for (let j = 0; j < numPackedPixels; j++) {
  argb[j] = getARGB(pixels, j);
}
let sum, cr, cg, cb, ca;
let read, ri, ym, ymi, bk0;
const a2 = new Int32Array(numPackedPixels);
const r2 = new Int32Array(numPackedPixels);
const g2 = new Int32Array(numPackedPixels);
const b2 = new Int32Array(numPackedPixels);
let yi = 0;
buildBlurKernel(radius);
let x, y, i;
let bm;
for (y = 0; y < height; y++) {
  for (x = 0; x < width; x++) {
    cb = cg = cr = ca = sum = 0;
    read = x - blurRadius;
    if (read < 0) {
      bk0 = -read;
      read = 0;
    } else {
      if (read >= width) {
        break;
      }
      bk0 = 0;
    }
    for (i = bk0; i < blurKernelSize; i++) {
      if (read >= width) {
        break;
      }
      const c = argb[read + yi];
      bm = blurMult[i];
      ca += bm[(c & -16777216) >>> 24];
      cr += bm[(c & 16711680) >> 16];
      cg += bm[(c & 65280) >> 8];
      cb += bm[c & 255];
      sum += blurKernel[i];
      read++;
    }
    ri = yi + x;
    a2[ri] = ca / sum;
    r2[ri] = cr / sum;
    g2[ri] = cg / sum;
    b2[ri] = cb / sum;
  }
  yi += width;
}
yi = 0;
ym = -blurRadius;
ymi = ym * width;
for (y = 0; y < height; y++) {
  for (x = 0; x < width; x++) {
    cb = cg = cr = ca = sum = 0;
    if (ym < 0) {
      bk0 = ri = -ym;
      read = x;
    } else {
      if (ym >= height) {
        break;
      }
      bk0 = 0;
      ri = ym;
      read = x + ymi;
    }
    for (i = bk0; i < blurKernelSize; i++) {
      if (ri >= height) {
        break;
      }
      bm = blurMult[i];
      ca += bm[a2[read]];
      cr += bm[r2[read]];
      cg += bm[g2[read]];
      cb += bm[b2[read]];
      sum += blurKernel[i];
      ri++;
      read += width;
    }
    argb[x + yi] =
      ((ca / sum) << 24) |
      ((cr / sum) << 16) |
      ((cg / sum) << 8) |
      (cb / sum);
  }
  yi += width;
  ymi += width;
  ym++;
}
setPixels(pixels, argb);
}

function gaussianBlur(pixels, canvas, radius) {
    blurARGB(pixels, canvas, radius);
}

function dilate(pixels, canvas) {
  let currIdx = 0;
  const maxIdx = pixels.length ? pixels.length / 4 : 0;
  const out = new Int32Array(maxIdx);
  let currRowIdx, maxRowIdx, colOrig, colOut, currLum;

  let idxRight, idxLeft, idxUp, idxDown;
  let colRight, colLeft, colUp, colDown;
  let lumRight, lumLeft, lumUp, lumDown;

  while (currIdx < maxIdx) {
    currRowIdx = currIdx;
    maxRowIdx = currIdx + canvas.width;
    while (currIdx < maxRowIdx) {
      colOrig = colOut = getARGB(pixels, currIdx);
      idxLeft = currIdx - 1;
      idxRight = currIdx + 1;
      idxUp = currIdx - canvas.width;
      idxDown = currIdx + canvas.width;

      if (idxLeft < currRowIdx) {
        idxLeft = currIdx;
      }
      if (idxRight >= maxRowIdx) {
        idxRight = currIdx;
      }
      if (idxUp < 0) {
        idxUp = 0;
      }
      if (idxDown >= maxIdx) {
        idxDown = currIdx;
      }
      colUp = getARGB(pixels, idxUp);
      colLeft = getARGB(pixels, idxLeft);
      colDown = getARGB(pixels, idxDown);
      colRight = getARGB(pixels, idxRight);

      //compute luminance
      currLum =
        77 * ((colOrig >> 16) & 0xff) +
        151 * ((colOrig >> 8) & 0xff) +
        28 * (colOrig & 0xff);
      lumLeft =
        77 * ((colLeft >> 16) & 0xff) +
        151 * ((colLeft >> 8) & 0xff) +
        28 * (colLeft & 0xff);
      lumRight =
        77 * ((colRight >> 16) & 0xff) +
        151 * ((colRight >> 8) & 0xff) +
        28 * (colRight & 0xff);
      lumUp =
        77 * ((colUp >> 16) & 0xff) +
        151 * ((colUp >> 8) & 0xff) +
        28 * (colUp & 0xff);
      lumDown =
        77 * ((colDown >> 16) & 0xff) +
        151 * ((colDown >> 8) & 0xff) +
        28 * (colDown & 0xff);

      if (lumLeft < currLum) {
        colOut = colLeft;
        currLum = lumLeft;
      }
      if (lumRight < currLum) {
        colOut = colRight;
        currLum = lumRight;
      }
      if (lumUp < currLum) {
        colOut = colUp;
        currLum = lumUp;
      }
      if (lumDown < currLum) {
        colOut = colDown;
        currLum = lumDown;
      }

      out[currIdx++] = colOut;
    }
  }
  setPixels(pixels, out);
};

function erode(pixels, canvas) {
  let currIdx = 0;
  const maxIdx = pixels.length ? pixels.length / 4 : 0;
  const out = new Int32Array(maxIdx);
  let currRowIdx, maxRowIdx, colOrig, colOut, currLum;
 
  let idxRight, idxLeft, idxUp, idxDown;
  let colRight, colLeft, colUp, colDown;
  let lumRight, lumLeft, lumUp, lumDown;
 
  while (currIdx < maxIdx) {
    currRowIdx = currIdx;
    maxRowIdx = currIdx + canvas.width;
    while (currIdx < maxRowIdx) {
      colOrig = colOut = getARGB(pixels, currIdx);
      idxLeft = currIdx - 1;
      idxRight = currIdx + 1;
      idxUp = currIdx - canvas.width;
      idxDown = currIdx + canvas.width;
 
      if (idxLeft < currRowIdx) {
        idxLeft = currIdx;
      }
      if (idxRight >= maxRowIdx) {
        idxRight = currIdx;
      }
      if (idxUp < 0) {
        idxUp = 0;
      }
      if (idxDown >= maxIdx) {
        idxDown = currIdx;
      }
      colUp = getARGB(pixels, idxUp);
      colLeft = getARGB(pixels, idxLeft);
      colDown = getARGB(pixels, idxDown);
      colRight = getARGB(pixels, idxRight);
 
      //compute luminance
      currLum =
        77 * ((colOrig >> 16) & 0xff) +
        151 * ((colOrig >> 8) & 0xff) +
        28 * (colOrig & 0xff);
      lumLeft =
        77 * ((colLeft >> 16) & 0xff) +
        151 * ((colLeft >> 8) & 0xff) +
        28 * (colLeft & 0xff);
      lumRight =
        77 * ((colRight >> 16) & 0xff) +
        151 * ((colRight >> 8) & 0xff) +
        28 * (colRight & 0xff);
      lumUp =
        77 * ((colUp >> 16) & 0xff) +
        151 * ((colUp >> 8) & 0xff) +
        28 * (colUp & 0xff);
      lumDown =
        77 * ((colDown >> 16) & 0xff) +
        151 * ((colDown >> 8) & 0xff) +
        28 * (colDown & 0xff);
 
      if (lumLeft > currLum) {
        colOut = colLeft;
        currLum = lumLeft;
      }
      if (lumRight > currLum) {
        colOut = colRight;
        currLum = lumRight;
      }
      if (lumUp > currLum) {
        colOut = colUp;
        currLum = lumUp;
      }
      if (lumDown > currLum) {
        colOut = colDown;
        currLum = lumDown;
      }
      out[currIdx++] = colOut;
    }
  }
  setPixels(pixels, out);
};

function invertColors(pixels) {
  let canvasWidth  = pixels.width;
  let canvasHeight = pixels.height;
  
  let temporaryCanvas = document.createElement('canvas')
  let temporaryCtx = temporaryCanvas.getContext('2d')
  let outputData = temporaryCtx.createImageData(canvasWidth, canvasHeight)

  for(let y=0 ; y<canvasHeight ; y++) {
    for(let x=0 ; x<canvasWidth ; x++) {
      let offset = (y * canvasWidth + x) * 4;
      outputData.data[offset + 0] = 255 ;
      outputData.data[offset + 1] = 255 ;
      outputData.data[offset + 2] = 255 ;
      outputData.data[offset + 3] = 255 ;  
    }
  }

  for(let y=0 ; y<canvasHeight ; y++) {
    for(let x=0 ; x<canvasWidth ; x++) {
      let offset = (y * canvasWidth + x) * 4;
      outputData.data[offset + 0] = 255 - pixels.data[offset + 0];
      outputData.data[offset + 1] = 255 - pixels.data[offset + 1];
      outputData.data[offset + 2] = 255 - pixels.data[offset + 2]; 
    }
  }
  return outputData;
}



 
export default preprocessImage;
