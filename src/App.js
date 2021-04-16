import React, { Fragment, useState, useEffect } from "react";
import { Camera } from "./components/camera/index";
import { Root, Preview, Footer, GlobalStyle } from "./styles";
import { createWorker } from 'tesseract.js';
import { useSpeechSynthesis } from 'react-speech-kit';
import './App.css';


function App() {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cardImage, setCardImage] = useState();
  const [text, setText] = useState(null);
  const [load, setLoad] = useState(false);
  const { speak } = useSpeechSynthesis();

  useEffect(()=>{

    async function opticalCharacterRecognition() {
      const worker = createWorker({
        logger: m => console.log(m),
      });
      try {
        await worker.load();
        await worker.loadLanguage('eng');
        await worker.initialize('eng');
        const { data: { text } } = await worker.recognize(URL.createObjectURL(cardImage));
        setText(text);
        console.log(text);
      } catch (error) {
        console.log(error);
      }
    }
    if(!text && cardImage) {
      setLoad(true);
      opticalCharacterRecognition();
    }

  }, [cardImage]);

  useEffect(()=>{
    if(load) setLoad(false);
  },[text]);

  return (
    <div>
      {/* Header Section */}

      <section id="header">
        <div className="header container">
          <div>
            <h1>TEXT<span></span></h1>
            <h1>ALOUD<span></span></h1>
            <h1>APP<span></span></h1>
            <a href="https://github.com/bhaveshbaranda/react-text-to-speech.git" type="button" className="button">GITHUB</a>
          </div>
        </div>
      </section>

      {/* Header Section End */}

      {/* Projects Section */}
      <section id="card">
        <div class="card container">
          <div class="card-items">
            <div class="card-item">
                <h1 className="section-title"><span>T</span>ext <span>T</span>o<span> S</span>peech</h1>
                <Root>
                    {isCameraOpen && (
                      <Camera
                        onCapture={blob => setCardImage(blob)}
                        onClear={() => {
                          setCardImage(undefined);
                          setText(null);
                          setLoad(false);
                        }}
                      />
                    )}
                    {cardImage && (
                      <div>
                        <Preview src={cardImage && URL.createObjectURL(cardImage)} />
                      </div>
                    )}  
                </Root>
                    
                {
                      load 
                      ?
                      <a type="button" className="button"onClick={() => speak({text:"Loading..."})}>Loading...</a>
                      :
                      text===null
                      ?
                      <div/>
                      :
                      <a type="button" className="button"onClick={() => speak({text:text})}>{text}</a>
                }                    
                <a type="button" className="button"onClick={() => setIsCameraOpen(true)}>Open Camera</a>
            </div>
          </div>
        </div>
      </section>
      {/* End Projects Section */}

      

      {/* Footer Section */}
      <section id="footer">
        <div class="footer container">
          <h2>Your Complete Web Solution</h2>
          <div class="social-icon">
            <div class="social-item">
              <a href="https://www.facebook.com/"><img src="https://img.icons8.com/fluent/48/000000/facebook-new.png"/></a>
            </div>
            <div class="social-item">
              <a href="https://www.instagram.com/"><img src="https://img.icons8.com/fluent/48/000000/instagram-new.png"/></a>
            </div>
            <div class="social-item">
              <a href="https://twitter.com/?lang=en"><img src="https://img.icons8.com/fluent/50/000000/twitter.png"/></a>
            </div>
            <div class="social-item">
              <a href="https://github.com/bhaveshbaranda/react-text-to-speech.git"><img src="https://img.icons8.com/fluent/48/000000/github.png"/></a>
            </div>
          </div>
        </div>
      </section>
      {/* End Footer Section */}
    </div>
  );
}
export default App;

