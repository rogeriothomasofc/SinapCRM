import { ArrowForwardIos, RocketLaunch } from "@mui/icons-material";
import React, { memo } from "react";
import { Handle } from "react-flow-renderer";

export default memo(({ data, isConnectable }) => {
  return (
    <div
      style={{
        backgroundColor: "#F0FFF4",
        padding: "8px 12px",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(72, 187, 120, 0.1)",
        border: '1px solid rgba(72, 187, 120, 0.25)',
        maxWidth: "180px"
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
        }}
      >
        <RocketLaunch
          sx={{
            width: "16px",
            height: "16px",
            marginRight: "6px",
            color: "#38A169"
          }}
        />
        <div
          style={{
            color: "#2D3748",
            fontSize: "14px",
            fontWeight: "500"
          }}
        >
          Início do fluxo
        </div>
      </div>
      
     <Handle
  type="source"
  position="right"
  id="a"
  style={{
    background: "#38A169",
    width: "14px",
    height: "14px",
    top: "50%",
    right: "-7px",
    cursor: 'pointer',
    border: "2px solid white",
    display: "flex",           // 👉 Flexbox
    alignItems: "center",       // 👉 Alinha verticalmente
    justifyContent: "center"    // 👉 Alinha horizontalmente
  }}
  isConnectable={isConnectable}
>
  <ArrowForwardIos
    sx={{
      color: "#FFFFFF",
      width: "8px",
      height: "8px",
      pointerEvents: 'none'
    }}
  />
</Handle>

    </div>
  );
});