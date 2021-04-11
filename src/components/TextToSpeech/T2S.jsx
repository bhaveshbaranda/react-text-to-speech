import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { createWorker } from 'tesseract.js';
import { useSpeechSynthesis } from 'react-speech-kit'
import './style.css'
import './style1.css'

function T2S() {

  const webcamRef = useRef(null);
  
  const [imgSrc,  setImgSrc ] = useState(null);
  const [textOcr, setTextOcr] = useState(null);
  const [load,    setLoad   ] = useState(false);

  const { speak } = useSpeechSynthesis();

  const capture = useCallback(() => {
    setLoad(true)
    const imageSrc = webcamRef.current.getScreenshot();
    setImgSrc(imageSrc)

    const worker = createWorker({
        logger: m => console.log(m),
    });
    

    const doOCR = async () => {
        await worker.load();
        await worker.loadLanguage('eng');
        await worker.initialize('eng');
        const { data: { text } } = await worker.recognize(imageSrc);
        await setTextOcr(text);
        await setLoad(false);
        await speak({text: text});
    };
    doOCR();


  }, [webcamRef, setImgSrc]
  );

  return (
      <div className="main">

          <div className="pimg1">
          </div>

          <div className="pimg2">
              <div className="ptext">
                  <div className="border">
                      Text Aloud App
                  </div>
              </div>
          </div>

          <section className="section section-dark">
              
                <div className="container">
                    <div className="row row-big">
                        <div className="col">
                                <Webcam videoConstraints={{facingMode:{exact:"environment"}}}id="video"audio = {false} ref = {webcamRef} screenshotFormat = "image/jpeg"/>
                        </div>
                            
                            
                    </div>
                    
                    <div className="row row-big">
                        {
                            load
                            ?
                                <div className="col">Loading...</div>
                            :
                                imgSrc
                                ?
                                    <div className="col">
                                        <img id="image"crossOrigin='Anonymous'src={imgSrc}/>
                                    </div>
                                :
                                    <div className="col">No Preview Available</div>
                        }
                    </div>
                    
                    <div className="row row-big">
                        {
                                load
                                ?
                                    <div className="col">Loading...</div>
                                :
                                    imgSrc
                                    ?
                                        <div className="col">
                                            <div id="preview">
                                                <p>
                                                    {textOcr}
                                                </p>
                                            </div>
                                        </div>
                                    :
                                        <div className="col">No Preview Available</div>
                            }
                    </div>

                    <div className="row row-small">
                        <button id="button"onClick={capture}size='big'style={{margin:10}}>Capture</button>
                    </div>

                </div>

          </section>

          <div className="pimg3">
          </div>

          <section className="section section-dark">
              <h2>Our Team</h2>
              <ul id="list">
                  <li>Sudip Pradhan [16EC32008]</li>
                  <li>Myakala Venkatesh [16EC32003]</li>
                  <li>Bhavesh Baranda [16EC35005]</li>
                  <li>Sajid Eqbal Rehman [16EC32005]</li>
                  <li>Himanshu Mittal [16EC35013]</li>
              </ul>
          </section>

          <div className="pimg1">
          </div>

      </div>
  );
}


export default T2S;