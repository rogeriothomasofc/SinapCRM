import {
  ArrowForwardIos,
  ContentCopy,
  Delete,
  ChatBubbleOutline,
  MoreVert
} from "@mui/icons-material";
import React, { memo, useState } from "react";
import { Handle } from "react-flow-renderer";
import { useNodeStorage } from "../../../stores/useNodeStorage";
import { Tooltip, Menu, MenuItem, Fade } from "@mui/material";

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

  return (
    <div
      style={{
        backgroundColor: "#2D3748",
        padding: "16px",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        border: "1px solid rgba(255,255,255,0.1)",
        position: "relative",
        width: "220px",
        transition: "all 0.2s ease"
      }}
    >
      {/* Handle de entrada com efeito de brilho */}
      <Handle
        type="target"
        position="left"
        style={{
          background: "linear-gradient(135deg, #4299E1, #3182CE)",
          width: "16px",
          height: "16px",
          top: "24px",
          left: "-9px",
          cursor: 'pointer',
          border: "2px solid rgba(255,255,255,0.7)",
          boxShadow: "0 0 8px rgba(66, 153, 225, 0.6)",
          zIndex: 10
        }}
        onConnect={params => console.log("handle onConnect", params)}
        isConnectable={isConnectable}
      >
        <ArrowForwardIos
          sx={{
            color: "#FFFFFF",
            width: "8px",
            height: "8px",
            marginLeft: "2px",
            marginTop: "2px",
            pointerEvents: "none"
          }}
        />
      </Handle>
      
      {/* Menu de opções */}
      <div
        style={{
          position: "absolute",
          right: "10px",
          top: "10px"
        }}
      >
        <Tooltip title="Opções" placement="top">
          <MoreVert
            onClick={handleMenuClick}
            sx={{ 
              width: "18px", 
              height: "18px", 
              color: "rgba(255,255,255,0.7)",
              cursor: "pointer",
              '&:hover': {
                color: "#FFFFFF"
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
              backgroundColor: '#1A202C',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
            }
          }}
        >
          <MenuItem onClick={handleDuplicate} style={{ color: '#E2E8F0', fontSize: '14px' }}>
            <ContentCopy sx={{ width: "16px", height: "16px", marginRight: "8px", color: "#4299E1" }} />
            Duplicar
          </MenuItem>
          <MenuItem onClick={handleDelete} style={{ color: '#FC8181', fontSize: '14px' }}>
            <Delete sx={{ width: "16px", height: "16px", marginRight: "8px" }} />
            Excluir
          </MenuItem>
        </Menu>
      </div>

      {/* Cabeçalho do nó */}
      <div
        style={{
          color: "#E2E8F0",
          fontSize: "15px",
          fontWeight: "500",
          display: "flex",
          alignItems: "center",
          marginBottom: "10px",
          background: "rgba(66, 153, 225, 0.15)",
          padding: "6px 10px",
          borderRadius: "8px",
        }}
      >
        <div 
          style={{
            background: "rgba(66, 153, 225, 0.2)",
            padding: "6px",
            borderRadius: "8px",
            marginRight: "8px",
            display: "flex",
            alignItems: "center"
          }}
        >
          <ChatBubbleOutline
            sx={{
              width: "16px",
              height: "16px",
              color: "#4299E1"
            }}
          />
        </div>
        <div>Mensagem</div>
      </div>
      
      {/* Conteúdo da mensagem */}
      <div 
        style={{ 
          color: "#CBD5E0", 
          fontSize: "13px", 
          lineHeight: "1.5",
          padding: "8px 10px", 
          backgroundColor: "rgba(0,0,0,0.2)", 
          borderRadius: "8px",
          maxHeight: "100px",
          overflow: "auto",
          wordBreak: "break-word",
          border: "1px solid rgba(255,255,255,0.05)"
        }}
      >
        {data.label}
      </div>
      
      {/* Handle de saída com efeito de brilho */}
      <Handle
        type="source"
        position="right"
        id="a"
        style={{
          background: "linear-gradient(135deg, #4299E1, #3182CE)",
          width: "16px",
          height: "16px",
          top: "70%",
          right: "-9px",
          cursor: 'pointer',
          border: "2px solid rgba(255,255,255,0.7)",
          boxShadow: "0 0 8px rgba(66, 153, 225, 0.6)",
          zIndex: 10
        }}
        isConnectable={isConnectable}
      >
        <ArrowForwardIos
          sx={{
            color: "#FFFFFF",
            width: "8px",
            height: "8px",
            marginLeft: "2px",
            marginTop: "2px",
            pointerEvents: "none"
          }}
        />
      </Handle>
    </div>
  );
});