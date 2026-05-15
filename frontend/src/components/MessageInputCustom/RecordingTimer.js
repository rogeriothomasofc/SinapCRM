import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { FiberManualRecord } from "@material-ui/icons";

// Cor principal da aplicação - mesma dos outros componentes
const primaryColor = "#6B63FF";

const useStyles = makeStyles(theme => ({
  timerBox: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "8px 16px",
    backgroundColor: theme.mode === 'light' ? "rgba(255, 68, 68, 0.08)" : "rgba(255, 68, 68, 0.12)",
    borderRadius: 20,
    minWidth: 120,
    justifyContent: "center",
    transition: "all 0.3s ease",
    animation: "$fadeIn 0.3s ease-out",
  },

  "@keyframes fadeIn": {
    from: {
      opacity: 0,
      transform: "scale(0.9)",
    },
    to: {
      opacity: 1,
      transform: "scale(1)",
    },
  },

  recordIcon: {
    color: "#ff4444",
    fontSize: 20,
    animation: "$pulse 1.5s ease-in-out infinite",
  },

  "@keyframes pulse": {
    "0%": {
      opacity: 1,
      transform: "scale(1)",
    },
    "50%": {
      opacity: 0.6,
      transform: "scale(0.95)",
    },
    "100%": {
      opacity: 1,
      transform: "scale(1)",
    },
  },

  timerText: {
    fontSize: "16px",
    fontWeight: 600,
    color: "#ff4444",
    fontFamily: "'Roboto Mono', monospace",
    letterSpacing: "0.5px",
    minWidth: 50,
    textAlign: "center",
    userSelect: "none",
  },

  recordingLabel: {
    fontSize: "14px",
    fontWeight: 500,
    color: theme.mode === 'light' ? "#666" : "#aaa",
    marginLeft: 4,
    animation: "$fadeInOut 2s ease-in-out infinite",
  },

  "@keyframes fadeInOut": {
    "0%": {
      opacity: 0.6,
    },
    "50%": {
      opacity: 1,
    },
    "100%": {
      opacity: 0.6,
    },
  },

  separatorDot: {
    width: 4,
    height: 4,
    borderRadius: "50%",
    backgroundColor: "#ff4444",
    opacity: 0.5,
  },
}));

const RecordingTimer = () => {
  const classes = useStyles();
  const initialState = {
    minutes: 0,
    seconds: 0,
  };
  
  const [timer, setTimer] = useState(initialState);
  const [showLabel, setShowLabel] = useState(true);

  useEffect(() => {
    const interval = setInterval(
      () =>
        setTimer(prevState => {
          if (prevState.seconds === 59) {
            return { ...prevState, minutes: prevState.minutes + 1, seconds: 0 };
          }
          return { ...prevState, seconds: prevState.seconds + 1 };
        }),
      1000
    );

    // Toggle do label "Gravando" a cada 3 segundos
    const labelInterval = setInterval(() => {
      setShowLabel(prev => !prev);
    }, 3000);

    return () => {
      clearInterval(interval);
      clearInterval(labelInterval);
    };
  }, []);

  const addZero = n => {
    return n < 10 ? "0" + n : n;
  };

  // Adiciona um aviso visual quando passa de 1 minuto
  const isLongRecording = timer.minutes >= 1;
  const timerStyle = isLongRecording ? { color: "#ff6666" } : {};

  return (
    <div className={classes.timerBox}>
      <FiberManualRecord className={classes.recordIcon} />
      
      <span className={classes.timerText} style={timerStyle}>
        {`${addZero(timer.minutes)}:${addZero(timer.seconds)}`}
      </span>

      {showLabel && (
        <>
          <div className={classes.separatorDot} />
          <span className={classes.recordingLabel}>
            Gravando
          </span>
        </>
      )}
    </div>
  );
};

export default RecordingTimer;