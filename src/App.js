import React, { Fragment, useState, useEffect } from "react";
import { Camera } from "./components/camera/index";
import { Root, Preview, Footer, GlobalStyle } from "./styles";
import { createWorker } from 'tesseract.js';
import Speech from 'react-speech';
import './App.css';


function App() {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cardImage, setCardImage] = useState();
  const [text, setText] = useState(null);
  const [load, setLoad] = useState(false);

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
    <Fragment>
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
            <h2>Preview</h2>
            <Preview src={cardImage && URL.createObjectURL(cardImage)} />
          </div>
        )}

        {
          load 
          ?
          <div>Loading...</div>
          :
          <div>
            <div>
              {text}
            </div>
            <div>
              {text && (<Speech text={text}/>)}
            </div>
          </div>
        }

        <Footer>
          <button onClick={() => setIsCameraOpen(true)}>Open Camera</button>
        </Footer>
      </Root>
      <GlobalStyle />
    </Fragment>
  );
}
export default App;
