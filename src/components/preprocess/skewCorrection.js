function correctSkew(pixels, theta) {
    let width = pixels.width;
    let height = pixels.height;
    let data = pixels.data;

    let tcanvas = document.createElement('canvas')
    let tctx    = tcanvas.getContext('2d')
    let tpixels = tctx.createImageData(width, height);
    let tdata   = tpixels.data;

    for(let y=0 ; y < height ; y++) {
        for(let x=0 ; x < width ; x++) {
            let toffset = (y * width + x) * 4;
            tdata[toffset + 0] = 255;
            tdata[toffset + 1] = 255;
            tdata[toffset + 2] = 255;
            tdata[toffset + 3] = 255;
        }
    }

    for(let y=0 ; y < height ; y++) {
        for(let x=0 ; x < width ; x++) {
            let offset = (y * width + x) * 4;
            if(data[offset] === 0) {
                let x_dash = Math.round(transformX(x, y, width / 2, height / 2, theta));
                let y_dash = Math.round(transformY(x, y, width / 2, height / 2, theta));
                if(safe(x_dash, y_dash, width, height)) {
                    let toffset = (y_dash * width + x_dash) * 4;
                    tdata[toffset + 0] = data[offset + 0];
                    tdata[toffset + 1] = data[offset + 1];
                    tdata[toffset + 2] = data[offset + 2];
                    tdata[toffset + 3] = data[offset + 3];
                }
            }
        }
    }

    return tpixels;
}
function transformX(x, y, xm, ym, theta){
    return ((x-xm)*Math.cos(theta))-((y-ym)*Math.sin(theta))+xm;
}
function transformY(x, y, xm, ym, theta){
    return ((x-xm)*Math.sin(theta))+((y-ym)*Math.cos(theta))+ym;
}
function safe(x, y, width, height) {
    return ((x>=0) && (x<width) && (y>=0) && (y<height));
}

export default correctSkew;