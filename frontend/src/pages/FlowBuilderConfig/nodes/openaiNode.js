import {
  ArrowForwardIos,
  ContentCopy,
  Delete,
  MoreVert
} from "@mui/icons-material";
import React, { memo, useState } from "react";
import { Handle } from "react-flow-renderer";
import { useNodeStorage } from "../../../stores/useNodeStorage";
import { Typography, Tooltip, Menu, MenuItem, Fade } from "@mui/material";
import { SiOpenai } from "react-icons/si";

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
        backgroundColor: "#F0FBFD",
        padding: "10px",
        borderRadius: "8px",
        border: "1px solid rgba(0, 188, 212, 0.2)",
        boxShadow: "0 2px 6px rgba(0, 188, 212, 0.1)",
        width: "180px",
        position: "relative"
      }}
    >
      {/* Handle de entrada */}
      <Handle
        type="target"
        position="left"
        style={{
          background: "#00BCD4",
          width: "14px",
          height: "14px",
          top: "20px",
          left: "-7px",
          transform: "translateX(0)",
          cursor: 'pointer',
          border: "2px solid white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
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
              color: "#00BCD4",
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
            <ContentCopy sx={{ width: "14px", height: "14px", marginRight: "8px", color: "#00BCD4" }} />
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
          paddingRight: "20px"
        }}
      >
        <div
          style={{
            backgroundColor: "rgba(0, 188, 212, 0.1)",
            padding: "4px",
            borderRadius: "4px",
            marginRight: "6px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <SiOpenai
            style={{
              width: "14px",
              height: "14px",
              color: "#00BCD4"
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
          OpenAI
        </div>
      </div>
      
      {/* Conteúdo do OpenAI */}
      <div
        style={{
          backgroundColor: "rgba(0, 188, 212, 0.06)",
          borderRadius: "6px",
          border: "1px solid rgba(0, 188, 212, 0.1)",
          padding: "8px",
          marginBottom: "6px"
        }}
      >
        <Typography
          style={{
            fontSize: "12px",
            color: "#4A5568",
            textAlign: "center",
            fontWeight: "500"
          }}
        >
          {data?.config?.model || data?.model || "GPT Integration"}
        </Typography>
      </div>
      
      {/* Informação adicional */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
          marginTop: "4px"
        }}
      >
        <div
          style={{
            fontSize: "11px",
            color: "#718096",
            backgroundColor: "rgba(0, 188, 212, 0.08)",
            padding: "3px 6px",
            borderRadius: "4px",
            fontWeight: "500"
          }}
        >
          AI Powered
        </div>
      </div>
      
      {/* Handle de saída */}
      <Handle
        type="source"
        position="right"
        id="a"
        style={{
          background: "#00BCD4",
          width: "14px",
          height: "14px",
          top: "auto",
          bottom: "8px",
          right: "-7px",
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