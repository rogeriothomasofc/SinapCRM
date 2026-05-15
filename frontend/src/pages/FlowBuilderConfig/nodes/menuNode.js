import {
  ArrowForwardIos,
  ContentCopy,
  Delete,
  DynamicFeed,
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
        backgroundColor: "#FBF8FF",
        padding: "10px",
        borderRadius: "8px",
        boxShadow: "0 2px 6px rgba(156, 39, 176, 0.1)",
        border: "1px solid rgba(156, 39, 176, 0.2)",
        width: "180px",
        position: "relative"
      }}
    >
      {/* Handle de entrada */}
      <Handle
        type="target"
        position="left"
        style={{
          background: "#9C27B0",
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
              color: "#9C27B0",
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
            <ContentCopy sx={{ width: "14px", height: "14px", marginRight: "8px", color: "#9C27B0" }} />
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
            backgroundColor: "rgba(156, 39, 176, 0.1)",
            padding: "4px",
            borderRadius: "4px",
            marginRight: "6px",
            display: "flex"
          }}
        >
          <DynamicFeed
            sx={{
              width: "14px",
              height: "14px",
              color: "#9C27B0"
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
          Menu
        </div>
      </div>
      
      {/* Mensagem principal */}
      <div
        style={{
          color: "#4A5568",
          fontSize: "12px",
          maxHeight: "50px",
          overflow: "hidden",
          marginBottom: "12px",
          backgroundColor: "rgba(156, 39, 176, 0.05)",
          padding: "8px",
          borderRadius: "6px",
          border: "1px solid rgba(156, 39, 176, 0.1)"
        }}
      >
        {data.message}
      </div>
      
      {/* Opções do menu */}
      <div
        style={{
          marginTop: "8px",
          borderTop: "1px solid rgba(156, 39, 176, 0.1)",
          paddingTop: "8px"
        }}
      >
        {data.arrayOption.map((option, index) => (
          <div
            key={option.number}
            style={{
              marginBottom: "12px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              position: "relative"
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                width: "85%"
              }}
            >
              <div
                style={{
                  backgroundColor: "rgba(156, 39, 176, 0.1)",
                  color: "#9C27B0",
                  borderRadius: "4px",
                  padding: "2px 6px",
                  marginRight: "6px",
                  fontSize: "11px",
                  fontWeight: "bold",
                  minWidth: "18px",
                  textAlign: "center"
                }}
              >
                {option.number}
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "#4A5568",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis"
                }}
              >
                {option.value}
              </div>
            </div>
            
            {/* Handle para cada opção */}
            <Handle
              type="source"
              position="right"
              id={"a" + option.number}
              style={{
                background: "#9C27B0",
                width: "14px",
                height: "14px",
                top: "50%",
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
        ))}
      </div>
    </div>
  );
});