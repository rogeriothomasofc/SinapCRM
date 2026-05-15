import {
  ArrowForwardIos,
  CallSplit,
  ContentCopy,
  Delete,
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
        backgroundColor: "#FFF5F2",
        padding: "10px",
        borderRadius: "8px",
        border: "1px solid rgba(255, 87, 33, 0.2)",
        boxShadow: "0 2px 6px rgba(255, 87, 33, 0.1)",
        width: "180px",
        position: "relative",
        zIndex: 1 // Bloco em uma camada mais baixa
      }}
    >
      {/* Handle de entrada - passa por trás do bloco */}
      <Handle
        type="target"
        position="left"
        style={{
          background: "#FF5721",
          width: "14px",
          height: "14px",
          top: "20px",
          left: "0px", // Movido para dentro do bloco
          transform: "translateX(-50%)", // Metade para fora do bloco
          cursor: 'pointer',
          border: "2px solid white",
          display: "flex",           
          alignItems: "center",       
          justifyContent: "center",   
          zIndex: 0 // Abaixo do bloco para passar atrás         
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
              color: "#FF5721",
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
            <ContentCopy sx={{ width: "14px", height: "14px", marginRight: "8px", color: "#FF5721" }} />
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
            backgroundColor: "rgba(255, 87, 33, 0.1)",
            padding: "4px",
            borderRadius: "4px",
            marginRight: "6px",
            display: "flex"
          }}
        >
          <CallSplit
            sx={{
              width: "14px",
              height: "14px",
              color: "#FF5721"
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
          Randomizador
        </div>
      </div>
      
      {/* Primeira opção com porcentagem */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "rgba(255, 87, 33, 0.05)",
          padding: "8px 10px",
          borderRadius: "6px",
          marginBottom: "10px",
          border: "1px solid rgba(255, 87, 33, 0.1)",
          position: "relative"
        }}
      >
        <div
          style={{
            fontSize: "13px",
            color: "#4A5568",
            fontWeight: "500"
          }}
        >
          Opção 1
        </div>
        <div
          style={{
            fontSize: "14px",
            color: "#FF5721",
            fontWeight: "bold",
            backgroundColor: "rgba(255, 87, 33, 0.1)",
            padding: "2px 6px",
            borderRadius: "4px"
          }}
        >
          {`${data.percent}%`}
        </div>
        
        {/* Handle para primeira opção - passa pela frente do bloco */}
        <Handle
          type="source"
          position="right"
          id="a"
          style={{
            background: "#FF5721",
            width: "14px",
            height: "14px",
            top: "50%",
            right: "0px", // Movido para dentro do bloco
            transform: "translateX(50%)", // Metade para fora do bloco
            cursor: 'pointer',
            border: "2px solid white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2 // Acima do bloco para passar na frente
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
      
      {/* Segunda opção com porcentagem */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "rgba(255, 87, 33, 0.05)",
          padding: "8px 10px",
          borderRadius: "6px",
          border: "1px solid rgba(255, 87, 33, 0.1)",
          position: "relative"
        }}
      >
        <div
          style={{
            fontSize: "13px",
            color: "#4A5568",
            fontWeight: "500"
          }}
        >
          Opção 2
        </div>
        <div
          style={{
            fontSize: "14px",
            color: "#FF5721",
            fontWeight: "bold",
            backgroundColor: "rgba(255, 87, 33, 0.1)",
            padding: "2px 6px",
            borderRadius: "4px"
          }}
        >
          {`${100 - data.percent}%`}
        </div>
        
        {/* Handle para segunda opção - passa pela frente do bloco */}
        <Handle
          type="source"
          position="right"
          id="b"
          style={{
            background: "#FF5721",
            width: "14px",
            height: "14px",
            top: "50%",
            right: "0px", // Movido para dentro do bloco
            transform: "translateX(50%)", // Metade para fora do bloco
            cursor: 'pointer',
            border: "2px solid white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2 // Acima do bloco para passar na frente
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
    </div>
  );
});