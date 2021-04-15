
function preCalculateTables(sin, cos, angles) {
    for (let index = 0, theta = 0; index < angles; index++, theta += Math.PI / angles ) {
        cos[index] = Math.cos(theta);
        sin[index] = Math.sin(theta);
    }
}

function Accumulate(x, y, width, height, acc, sin, cos, angles) {
    let r_max = Math.sqrt(width*width + height*height);
    for(let i = 0 ; i < angles ; i++) {
        let r_theta = r_max  + (x - (width / 2)) * cos[i] + (y - (height / 2)) * sin[i];
        r_theta >>= 1;
        if(acc[i]===undefined)
        {
            acc[i] = [];
        }
        
        if (acc[i][r_theta] === undefined) {
            acc[i][r_theta] = 0;
        }
        else {
            acc[i][r_theta]++;
        }
    }
}

function calculateSkewAngle(acc, angles) {
    let max        = 0;
    let best_r     = 0;
    let best_theta = 0;
    for(let i=0 ; i<angles ; i++) {
        for(let j=0 ; j<acc[i].length ; j++) {
            if(acc[i][j] > max) {
                max = acc[i][j];
                best_r = j;
                best_theta = i;
            }
        }
    }
    return (best_theta * Math.PI) / angles;
}

function houghTransform(pixels, angles, acc) {
    let cos = new Array(angles);
    let sin = new Array(angles);
    preCalculateTables(sin, cos, angles);

    let width  = pixels.width
    let height = pixels.height;

    for(let y=0 ; y<height ; y++) {
        for(let x=0 ; x<width ; x++) {
            let offset = (y * width + x) * 4;
            if(pixels.data[offset] === 0) {
                Accumulate(x, y, width, height, acc, sin, cos, angles);
            }
        }
    }
    
}

function getSkewAngle(pixels) {
    let angles = 360;
    let acc = new Array(angles);
    houghTransform(pixels, angles, acc);
    let skew = calculateSkewAngle(acc, angles);
    return ((Math.PI / 2) - skew);
}

export default getSkewAngle;