import { ContentCopy, Delete, MicNone, PlayArrow, Pause } from "@mui/icons-material";
import React, { memo, useState, useRef, useEffect } from "react";
import { Handle } from "react-flow-renderer";
import { useNodeStorage } from "../../../stores/useNodeStorage";

export default memo(({ data, isConnectable, id }) => {
  const link =
    process.env.REACT_APP_BACKEND_URL === "http://localhost:8090"
      ? "http://localhost:8090"
      : process.env.REACT_APP_BACKEND_URL;
  
  const storageItems = useNodeStorage();
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  
  // Controle do player de áudio
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  // Atualiza o tempo atual enquanto o áudio é reproduzido
  useEffect(() => {
    if (audioRef.current) {
      const updateTime = () => {
        setCurrentTime(audioRef.current.currentTime);
      };
      
      const handleEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
      };
      
      const handleLoadedData = () => {
        setDuration(audioRef.current.duration);
      };
      
      audioRef.current.addEventListener('timeupdate', updateTime);
      audioRef.current.addEventListener('ended', handleEnded);
      audioRef.current.addEventListener('loadeddata', handleLoadedData);
      
      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener('timeupdate', updateTime);
          audioRef.current.removeEventListener('ended', handleEnded);
          audioRef.current.removeEventListener('loadeddata', handleLoadedData);
        }
      };
    }
  }, []);
  
  // Formata o tempo para exibição (mm:ss)
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  return (
    <div
      style={{
        background: "linear-gradient(45deg, #2D3748, #1A202C)",
        padding: "14px",
        borderRadius: "12px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        width: "280px"
      }}
    >
      <Handle
        type="target"
        position="left"
        style={{ 
          background: "#3182CE", 
          border: "2px solid #EBF8FF",
          width: "12px",
          height: "12px"
        }}
        onConnect={params => console.log("handle onConnect", params)}
        isConnectable={isConnectable}
      />
      
      {/* Cabeçalho com título e ações */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "10px"
        }}
      >
        <div
          style={{
            color: "#E2E8F0",
            fontSize: "16px",
            fontWeight: "500",
            display: "flex",
            alignItems: "center"
          }}
        >
          <MicNone
            sx={{
              width: "20px",
              height: "20px",
              marginRight: "8px",
              color: "#63B3ED"
            }}
          />
          <span>Áudio</span>
        </div>
        
        <div
          style={{
            display: "flex",
            gap: "8px"
          }}
        >
          <ContentCopy
            onClick={() => {
              storageItems.setNodesStorage(id);
              storageItems.setAct("duplicate");
            }}
            sx={{ 
              width: "16px", 
              height: "16px", 
              color: "#A0AEC0",
              cursor: "pointer",
              transition: "all 0.2s",
              "&:hover": {
                color: "#E2E8F0"
              }
            }}
          />
          <Delete
            onClick={() => {
              storageItems.setNodesStorage(id);
              storageItems.setAct("delete");
            }}
            sx={{ 
              width: "16px", 
              height: "16px", 
              color: "#FC8181",
              cursor: "pointer",
              transition: "all 0.2s",
              "&:hover": {
                color: "#FEB2B2"
              }
            }}
          />
        </div>
      </div>
      
      {/* Badge com tipo de áudio */}
      <div
        style={{
          display: "inline-block",
          background: data.record ? "rgba(72, 187, 120, 0.2)" : "rgba(66, 153, 225, 0.2)",
          color: data.record ? "#48BB78" : "#4299E1",
          padding: "4px 8px",
          borderRadius: "4px",
          fontSize: "12px",
          fontWeight: "500",
          marginBottom: "10px"
        }}
      >
        {data.record ? "Gravado na hora" : "Áudio enviado"}
      </div>
      
      {/* Player de áudio customizado */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          background: "rgba(0, 0, 0, 0.2)",
          padding: "10px",
          borderRadius: "8px"
        }}
      >
        <audio 
          ref={audioRef} 
          src={`${link}/public/${data.url}`}
          style={{ display: "none" }}
        />
        
        {/* Controles e barra de progresso */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px"
          }}
        >
          <button
            onClick={togglePlay}
            style={{
              background: "#4299E1",
              border: "none",
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
              color: "white"
            }}
          >
            {isPlaying ? 
              <Pause sx={{ width: "20px", height: "20px" }} /> : 
              <PlayArrow sx={{ width: "20px", height: "20px" }} />
            }
          </button>
          
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column"
            }}
          >
            {/* Barra de progresso */}
            <div
              style={{
                width: "100%",
                height: "4px",
                background: "rgba(255, 255, 255, 0.1)",
                borderRadius: "2px",
                overflow: "hidden",
                marginBottom: "4px"
              }}
            >
              <div
                style={{
                  width: `${(currentTime / duration) * 100}%`,
                  height: "100%",
                  background: "#4299E1",
                  borderRadius: "2px",
                  transition: "width 0.1s"
                }}
              />
            </div>
            
            {/* Tempo */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "12px",
                color: "#A0AEC0"
              }}
            >
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>
      </div>
      
      <Handle
        type="source"
        position="right"
        id="a"
        style={{ 
          background: "#3182CE", 
          border: "2px solid #EBF8FF",
          width: "12px",
          height: "12px"
        }}
        isConnectable={isConnectable}
      />
    </div>
  );
});