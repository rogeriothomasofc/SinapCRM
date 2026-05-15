import React, { useState, useEffect, useCallback } from "react";
import { makeStyles, Paper, Typography, Modal, IconButton, Box, Fade, TextField, InputAdornment, Avatar, Chip } from "@material-ui/core";
import { PlayCircleOutline, Close as CloseIcon, HelpOutline, AccessTime, Search as SearchIcon, Visibility } from "@material-ui/icons";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import { i18n } from "../../translate/i18n";
import useHelps from "../../hooks/useHelps";

const useStyles = makeStyles(theme => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(1.5),
    overflowY: "auto",
    backgroundColor: theme.palette.background.default,
    ...theme.scrollbarStyles,
  },
  searchField: {
    "& .MuiOutlinedInput-root": {
      borderRadius: 6,
      backgroundColor: theme.palette.background.paper,
      "& fieldset": {
        borderColor: "transparent",
      },
      "&:hover fieldset": {
        borderColor: theme.palette.divider,
      },
      "&.Mui-focused fieldset": {
        borderColor: theme.palette.primary.main,
        borderWidth: 1,
      },
    },
    "& .MuiInputBase-input": {
      padding: "8px 12px",
      fontSize: "0.875rem",
    },
  },
  helpCard: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(1, 1.5),
    marginBottom: theme.spacing(0.5),
    borderRadius: 6,
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
    transition: "all 0.2s ease",
    minHeight: 48,
    cursor: "pointer",
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
      borderColor: theme.palette.primary.main,
    },
  },
  helpAvatar: {
    width: 32,
    height: 32,
    backgroundColor: theme.palette.primary.main,
    marginRight: theme.spacing(1.5),
    fontSize: "1rem",
  },
  helpContent: {
    flex: 1,
    minWidth: 0,
  },
  helpTitle: {
    fontWeight: 600,
    fontSize: "0.875rem",
    color: theme.palette.text.primary,
    marginBottom: 2,
  },
  helpDescription: {
    fontSize: "0.8125rem",
    color: theme.palette.text.secondary,
    display: "-webkit-box",
    WebkitLineClamp: 1,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    textOverflow: "ellipsis",
    lineHeight: 1.4,
  },
  durationChip: {
    height: 20,
    fontSize: "0.7rem",
    fontWeight: 500,
    backgroundColor: theme.palette.action.hover,
    color: theme.palette.text.secondary,
    marginLeft: "auto",
    "& .MuiChip-icon": {
      fontSize: "0.75rem",
    },
  },
  actionButtons: {
    display: "flex",
    gap: theme.spacing(0.5),
    marginLeft: theme.spacing(1),
  },
  iconButton: {
    padding: 4,
    "& .MuiSvgIcon-root": {
      fontSize: "1.125rem",
    },
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
  },
  emptyState: {
    textAlign: "center",
    padding: theme.spacing(6),
    color: theme.palette.text.secondary,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: theme.spacing(2),
    opacity: 0.3,
  },
  headerContent: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },
  videoCounter: {
    backgroundColor: theme.palette.action.hover,
    borderRadius: 12,
    padding: "2px 10px",
    fontSize: "0.8125rem",
    fontWeight: 500,
    color: theme.palette.text.secondary,
  },
  videoModal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backdropFilter: "blur(5px)",
  },
  videoModalContent: {
    outline: "none",
    width: "90%",
    maxWidth: 1200,
    aspectRatio: "16/9",
    position: "relative",
    backgroundColor: "#000",
    borderRadius: theme.spacing(1),
    overflow: "hidden",
    boxShadow: theme.shadows[24],
  },
  closeButton: {
    position: "absolute",
    right: 8,
    top: 8,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    color: "#fff",
    zIndex: 1,
    "&:hover": {
      backgroundColor: "rgba(0, 0, 0, 0.9)",
    },
  },
  headerIcon: {
    marginRight: theme.spacing(1),
    color: theme.palette.primary.main,
  },
}));

const Helps = () => {
  const classes = useStyles();
  const [records, setRecords] = useState([]);
  const { list } = useHelps();
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [searchParam, setSearchParam] = useState("");

  useEffect(() => {
    async function fetchData() {
      const helps = await list();
      setRecords(helps);
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openVideoModal = (video) => {
    setSelectedVideo(video);
  };

  const closeVideoModal = () => {
    setSelectedVideo(null);
  };

  const handleModalClose = useCallback((event) => {
    if (event.key === "Escape") {
      closeVideoModal();
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleModalClose);
    return () => {
      document.removeEventListener("keydown", handleModalClose);
    };
  }, [handleModalClose]);

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  // Função simulada para duração do vídeo
  const getVideoDuration = () => {
    const durations = ['5:30', '8:45', '12:20', '3:15', '10:00'];
    return durations[Math.floor(Math.random() * durations.length)];
  };

  const truncateText = (text, maxLength = 60) => {
    if (!text) return "";
    return text.length > maxLength 
      ? text.substring(0, maxLength) + "..." 
      : text;
  };

  const filteredHelps = records.filter(
    (help) =>
      help.title?.toLowerCase().includes(searchParam) ||
      help.description?.toLowerCase().includes(searchParam)
  );

  const renderVideoModal = () => {
    return (
      <Modal
        open={Boolean(selectedVideo)}
        onClose={closeVideoModal}
        className={classes.videoModal}
      >
        <Fade in={Boolean(selectedVideo)}>
          <div className={classes.videoModalContent}>
            <IconButton
              className={classes.closeButton}
              onClick={closeVideoModal}
              size="small"
            >
              <CloseIcon />
            </IconButton>
            {selectedVideo && (
              <iframe
                style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0 }}
                src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
        </Fade>
      </Modal>
    );
  };

  return (
    <MainContainer>
      <MainHeader>
        <Box className={classes.headerContent}>
          <Title>{i18n.t("helps.title")}</Title>
          {records.length > 0 && (
            <span className={classes.videoCounter}>{records.length}</span>
          )}
        </Box>
        
        <MainHeaderButtonsWrapper>
          <TextField
            placeholder="Buscar vídeo de ajuda..."
            type="search"
            value={searchParam}
            onChange={handleSearch}
            variant="outlined"
            size="small"
            className={classes.searchField}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" style={{ color: theme => theme.palette.text.secondary }} />
                </InputAdornment>
              ),
            }}
          />
        </MainHeaderButtonsWrapper>
      </MainHeader>
      
      <Paper
        className={classes.mainPaper}
        elevation={0}
      >
        {filteredHelps.length === 0 ? (
          <Box className={classes.emptyState}>
            <HelpOutline className={classes.emptyStateIcon} />
            <Typography variant="body1">
              {searchParam 
                ? "Nenhum vídeo de ajuda encontrado" 
                : "Nenhum vídeo de ajuda disponível no momento"}
            </Typography>
          </Box>
        ) : (
          <Box>
            {filteredHelps.map((record, index) => (
              <Fade in={true} timeout={200 + index * 30} key={index}>
                <Box 
                  className={classes.helpCard}
                  onClick={() => openVideoModal(record.video)}
                >
                  <Avatar className={classes.helpAvatar}>
                    <PlayCircleOutline style={{ fontSize: "1.25rem" }} />
                  </Avatar>
                  
                  <Box className={classes.helpContent}>
                    <Typography className={classes.helpTitle}>
                      {record.title}
                    </Typography>
                    <Typography className={classes.helpDescription}>
                      {truncateText(record.description, 80)}
                    </Typography>
                  </Box>

                  <Chip
                    size="small"
                    icon={<AccessTime />}
                    label={getVideoDuration()}
                    className={classes.durationChip}
                  />
                  
                  <Box className={classes.actionButtons}>
                    <IconButton
                      size="small"
                      className={classes.iconButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        openVideoModal(record.video);
                      }}
                    >
                      <Visibility />
                    </IconButton>
                  </Box>
                </Box>
              </Fade>
            ))}
          </Box>
        )}
      </Paper>
      
      {renderVideoModal()}
    </MainContainer>
  );
};

export default Helps;