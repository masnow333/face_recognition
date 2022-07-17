import './App.css';
import { useEffect, useRef } from 'react';
import * as faceapi from 'face-api.js';


function App() {

  const video = useRef()

  const videoHeight = 480;
  const videoWidth = 640;

  const canvasRef = useRef();

  useEffect(() => {
    run()
  }, [])

  const run = async () => {
    log("run started");
    try {
      await faceapi.nets.tinyFaceDetector.load("/models/");
      await faceapi.loadFaceExpressionModel(`/models/`);
      await faceapi.nets.tinyFaceDetector.loadFromUri("/models/")
      await faceapi.nets.faceLandmark68Net.loadFromUri("/models/")
      await faceapi.nets.faceRecognitionNet.loadFromUri("/models/")
      await faceapi.nets.faceExpressionNet.loadFromUri("/models/")
      let mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" }
      });

      video.current.srcObject = mediaStream;
    } catch (e) {
      log(e.name, e.message, e.stack);
    }
  };

  const log = (...args) => {
    console.log(...args);
  };

  const onPlay = async () => {
    setInterval(async () => {
      if (canvasRef && canvasRef.current) {
        canvasRef.current.innerHTML = faceapi.createCanvasFromMedia(video.current);
        const displaySize = {
          width: videoWidth,
          height: videoHeight
        }

        faceapi.matchDimensions(canvasRef.current, displaySize);

        const detections = await faceapi.detectSingleFace(video.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();
        if(detections){  
  
          const resizedDetections = faceapi.resizeResults(detections, displaySize);
  
          canvasRef && canvasRef.current && canvasRef.current.getContext('2d').clearRect(0, 0, videoWidth, videoHeight);
          // canvasRef && canvasRef.current && faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
          // canvasRef && canvasRef.current && faceapi.draw.drawFaceLandmarks(canvasRef.current, resizedDetections);
  
  
          canvasRef.current.getContext('2d').strokeStyle = 'black';
          canvasRef.current.getContext('2d').lineWidth = 50;
  
          // draw a red line
          canvasRef.current.getContext('2d').beginPath();
          canvasRef.current.getContext('2d').moveTo(detections.landmarks.getLeftEye()[0]._x, detections.landmarks.getLeftEye()[0]._y);
          canvasRef.current.getContext('2d').lineTo(detections.landmarks.getRightEye()[3]._x, detections.landmarks.getRightEye()[3]._y);
          canvasRef.current.getContext('2d').stroke();
        }
      }
    }, 100)
  };
  

  return (
    <div className="App">
      <h1>Face Recognition Webcam</h1>
      <div style={{ width: "100%", height: "100vh", position: "relative" }}>
        <video
          ref={video}
          autoPlay
          muted
          onPlay={onPlay}
          style={{
            position: "absolute",
            width: videoWidth,
            height: videoHeight,
            left: 0,
            right: 0,
            bottom: 0,
            top: 0
          }}
        />
        <canvas ref={canvasRef} className="canvas" />
      </div>

    </div>
  );
}

export default App;
