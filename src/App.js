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
    <div>
      {/* Header Section */}

      <section id="header">
        <div className="header container">
          <div>
            <h1>TEXT<span></span></h1>
            <h1>ALOUD<span></span></h1>
            <h1>APP<span></span></h1>
            <a href="http://localhost:3000/" type="button" className="button">GITHUB</a>
          </div>
        </div>
      </section>

      {/* Header Section End */}

      {/* Projects Section */}

        <section id="projects">
          <div className="projects container">
            <div className="projects-top">
              <h1 className="section-title"><span>P</span>roject</h1>
              <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Fuga, nostrum. Magni optio pariatur iusto incidunt ratione officia doloribus distinctio repellat tenetur quaerat! Corrupti eum modi dolore sapiente velit. Corrupti quaerat veniam dignissimos perspiciatis unde necessitatibus ipsum quisquam exercitationem, aliquid alias ab cumque autem ullam magnam. Numquam voluptas quam doloremque voluptatum.</p>
            </div>
            <div className="projects-bottom">
              <div className="projects-item">
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
              </div>
            </div>
          </div>
        </section>

      {/* Projects Section */}
    </div>
  );
}
export default App;
{/* <Fragment>

</Fragment> */}
