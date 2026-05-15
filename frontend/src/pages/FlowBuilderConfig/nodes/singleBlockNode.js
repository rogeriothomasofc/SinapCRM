import {
  AccessTime,
  ArrowForwardIos,
  ContentCopy,
  Delete,
  Image,
  LibraryBooks,
  Message,
  MicNone,
  Videocam,
  MoreVert
} from "@mui/icons-material";
import React, { memo, useState } from "react";
import { Handle } from "react-flow-renderer";
import { useNodeStorage } from "../../../stores/useNodeStorage";
import { Typography, Tooltip, Menu, MenuItem, Fade } from "@mui/material";

export default memo(({ data, isConnectable, id }) => {
  const storageItems = useNodeStorage();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  
  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleDuplicate = () => {
    storageItems.setNodesStorage(id);
    storageItems.setAct("duplicate");
    handleMenuClose();
  };
  
  const handleDelete = () => {
    storageItems.setNodesStorage(id);
    storageItems.setAct("delete");
    handleMenuClose();
  };

  // Função auxiliar para obter o tipo de conteúdo
  const getContentType = (item) => {
    if (item.includes("message")) return "Mensagem";
    if (item.includes("interval")) return "Intervalo";
    if (item.includes("img")) return "Imagem";
    if (item.includes("audio")) return "Áudio";
    if (item.includes("video")) return "Vídeo";
    return "Conteúdo";
  };

  return (
    <div
      style={{
        backgroundColor: "#F5FAFF",
        padding: "10px",
        borderRadius: "8px",
        border: "1px solid rgba(30, 136, 229, 0.2)",
        boxShadow: "0 2px 6px rgba(30, 136, 229, 0.1)",
        width: "180px",
        position: "relative"
      }}
    >
      {/* Handle de entrada */}
      <Handle
        type="target"
        position="left"
        style={{
          background: "#1E88E5",
          width: "14px",
          height: "14px",
          top: "20px",
          left: "-7px", // Ajustado para posicionar metade da bolinha sobre o bloco
          transform: "translateX(0)", // Removido o transform para posicionar corretamente
          cursor: 'pointer',
          border: "2px solid white",
          display: "flex",           // Flexbox
          alignItems: "center",       // Alinha verticalmente
          justifyContent: "center",    // Alinha horizontalmente
          zIndex: 10                  // Garante que fique acima de outros elementos
        }}
        onConnect={params => console.log("handle onConnect", params)}
        isConnectable={isConnectable}
      >
        <ArrowForwardIos
          sx={{
            color: "#FFFFFF",
            width: "8px",
            height: "8px",
            pointerEvents: "none"
          }}
        />
      </Handle>
      
      {/* Menu de opções */}
      <div
        style={{
          position: "absolute",
          right: "8px",
          top: "8px"
        }}
      >
        <Tooltip title="Opções" placement="top">
          <MoreVert
            onClick={handleMenuClick}
            sx={{ 
              width: "16px", 
              height: "16px", 
              color: "#1E88E5",
              cursor: "pointer",
              opacity: 0.7,
              '&:hover': {
                opacity: 1
              }
            }}
          />
        </Tooltip>
        
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleMenuClose}
          TransitionComponent={Fade}
          PaperProps={{
            style: {
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }
          }}
        >
          <MenuItem onClick={handleDuplicate} style={{ fontSize: '13px' }}>
            <ContentCopy sx={{ width: "14px", height: "14px", marginRight: "8px", color: "#1E88E5" }} />
            Duplicar
          </MenuItem>
          <MenuItem onClick={handleDelete} style={{ fontSize: '13px', color: '#E53E3E' }}>
            <Delete sx={{ width: "14px", height: "14px", marginRight: "8px" }} />
            Excluir
          </MenuItem>
        </Menu>
      </div>

      {/* Cabeçalho do nó */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "8px",
          paddingRight: "20px" // Espaço para o botão de menu
        }}
      >
        <div
          style={{
            backgroundColor: "rgba(30, 136, 229, 0.1)",
            padding: "4px",
            borderRadius: "4px",
            marginRight: "6px",
            display: "flex"
          }}
        >
          <LibraryBooks
            sx={{
              width: "14px",
              height: "14px",
              color: "#1E88E5"
            }}
          />
        </div>
        <div
          style={{
            color: "#2D3748",
            fontSize: "14px",
            fontWeight: "500"
          }}
        >
          Conteúdo
        </div>
      </div>
      
      {/* Lista de itens de conteúdo */}
      <div 
        style={{ 
          // Removida altura máxima e barra de rolagem para permitir crescimento natural
          width: "100%"
        }}
      >
        {data.seq.map((item, index) => (
          <div
            key={index}
            style={{
              backgroundColor: "rgba(30, 136, 229, 0.06)",
              marginBottom: "6px",
              borderRadius: "6px",
              border: "1px solid rgba(30, 136, 229, 0.1)",
              padding: "6px",
              transition: "all 0.2s ease",
              "&:hover": {
                backgroundColor: "rgba(30, 136, 229, 0.1)"
              }
            }}
          >
            {/* Tipo de conteúdo */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "4px"
              }}
            >
              <div
                style={{
                  backgroundColor: "rgba(30, 136, 229, 0.12)",
                  padding: "3px",
                  borderRadius: "4px",
                  display: "flex",
                  marginRight: "4px"
                }}
              >
                {item.includes("message") && <Message sx={{ color: "#1E88E5", fontSize: 14 }} />}
                {item.includes("interval") && <AccessTime sx={{ color: "#1E88E5", fontSize: 14 }} />}
                {item.includes("img") && <Image sx={{ color: "#1E88E5", fontSize: 14 }} />}
                {item.includes("audio") && <MicNone sx={{ color: "#1E88E5", fontSize: 14 }} />}
                {item.includes("video") && <Videocam sx={{ color: "#1E88E5", fontSize: 14 }} />}
              </div>
              <Typography
                sx={{
                  fontSize: "10px",
                  fontWeight: "500",
                  color: "#1E88E5"
                }}
              >
                {getContentType(item)}
              </Typography>
            </div>
            
            {/* Conteúdo do item */}
            <Typography
              sx={{
                fontSize: "11px",
                color: "#4A5568",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                paddingLeft: "2px"
              }}
            >
              {item.includes("interval") 
                ? `${data.elements.filter(itemLoc => itemLoc.number === item)[0].value} segundos`
                : data.elements.filter(itemLoc => itemLoc.number === item)[0].original || 
                  data.elements.filter(itemLoc => itemLoc.number === item)[0].value}
            </Typography>
          </div>
        ))}
      </div>
      
      {/* Handle de saída */}
      <Handle
        type="source"
        position="right"
        id="a"
        style={{
          background: "#1E88E5",
          width: "14px",
          height: "14px",
          top: "auto", // Removida posição fixa no topo
          bottom: "8px", // Posicionado perto do canto inferior
          right: "-7px", // Metade sobre o bloco
          transform: "translateX(0)",
          cursor: 'pointer',
          border: "2px solid white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10
        }}
        isConnectable={isConnectable}
      >
        <ArrowForwardIos
          sx={{
            color: "#FFFFFF",
            width: "8px",
            height: "8px",
            pointerEvents: "none"
          }}
        />
      </Handle>
    </div>
  );
});