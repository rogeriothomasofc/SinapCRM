import React, { useContext, useEffect, useReducer, useState } from "react";
import { toast } from "react-toastify";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";

import { makeStyles } from "@material-ui/core/styles";
import {
  Paper,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  Chip,
  Tooltip,
  Typography,
  Box,
  Fade,
  useTheme,
  CircularProgress,
} from "@material-ui/core";

import SearchIcon from "@material-ui/icons/Search";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import EditIcon from "@material-ui/icons/Edit";
import AddIcon from "@material-ui/icons/Add";
import DescriptionIcon from "@material-ui/icons/Description";
import LocalOfferIcon from "@material-ui/icons/LocalOffer";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";

import { i18n } from "../../translate/i18n";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import PromptModal from "../../components/PromptModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import { AuthContext } from "../../context/Auth/AuthContext";
import usePlans from "../../hooks/usePlans";
import { SocketContext } from "../../context/Socket/SocketContext";

const reducer = (state, action) => {
  if (action.type === "LOAD_PROMPTS") {
    const prompts = action.payload;
    const newPrompts = [];

    if (prompts.length === 0) return [];

    prompts.forEach((prompt) => {
      const promptIndex = state.findIndex((p) => p.id === prompt.id);
      if (promptIndex !== -1) {
        state[promptIndex] = prompt;
      } else {
        newPrompts.push(prompt);
      }
    });

    return [...state, ...newPrompts];
  }

  if (action.type === "UPDATE_PROMPTS") {
    const prompt = action.payload;
    const promptIndex = state.findIndex((p) => p.id === prompt.id);

    if (promptIndex !== -1) {
      state[promptIndex] = prompt;
      return [...state];
    } else {
      return [prompt, ...state];
    }
  }

  if (action.type === "DELETE_PROMPT") {
    const promptId = action.payload;
    const promptIndex = state.findIndex((p) => p.id === promptId);
    if (promptIndex !== -1) {
      state.splice(promptIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const useStyles = makeStyles((theme) => ({
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
  addButton: {
    borderRadius: 6,
    textTransform: "none",
    fontWeight: 500,
    padding: "6px 16px",
    fontSize: "0.875rem",
    boxShadow: "none",
    "&:hover": {
      boxShadow: theme.shadows[2],
    },
  },
  promptRow: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(1, 1.5),
    marginBottom: theme.spacing(0.5),
    borderRadius: 6,
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
    transition: "all 0.2s ease",
    minHeight: 56,
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
      borderColor: theme.palette.primary.main,
    },
  },
  promptInfo: {
    display: "flex",
    alignItems: "center",
    flex: "1 1 auto",
    gap: theme.spacing(1.5),
    minWidth: 0,
  },
  promptIcon: {
    color: theme.palette.primary.main,
    fontSize: "1.5rem",
  },
  promptName: {
    fontWeight: 500,
    color: theme.palette.text.primary,
    fontSize: "0.875rem",
  },
  promptDetails: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2),
    flex: "0 0 auto",
    marginLeft: theme.spacing(2),
  },
  queueChip: {
    fontWeight: 500,
    height: 24,
    fontSize: "0.75rem",
    backgroundColor: theme.palette.action.hover,
    "& .MuiChip-label": {
      padding: "0 8px",
    },
  },
  tokenInfo: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.5),
    color: theme.palette.text.secondary,
    fontSize: "0.8125rem",
  },
  actionButtons: {
    display: "flex",
    gap: theme.spacing(0.5),
    flex: "0 0 auto",
    marginLeft: theme.spacing(2),
  },
  iconButton: {
    padding: 5,
    "& .MuiSvgIcon-root": {
      fontSize: "1.25rem",
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
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    padding: theme.spacing(3),
  },
  headerContent: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },
  promptCounter: {
    backgroundColor: theme.palette.action.hover,
    borderRadius: 12,
    padding: "2px 10px",
    fontSize: "0.8125rem",
    fontWeight: 500,
    color: theme.palette.text.secondary,
  },
}));

const Prompts = () => {
  const classes = useStyles();
  const theme = useTheme();
  const history = useHistory();

  const [prompts, dispatch] = useReducer(reducer, []);
  const [loading, setLoading] = useState(false);
  const [searchParam, setSearchParam] = useState("");

  const [promptModalOpen, setPromptModalOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const { user } = useContext(AuthContext);
  const { getPlanCompany } = usePlans();
  const companyId = user.companyId;

  const socketManager = useContext(SocketContext);

  useEffect(() => {
    async function fetchData() {
      const planConfigs = await getPlanCompany(undefined, companyId);
      if (!planConfigs.plan.useOpenAi) {
        toast.error("Esta empresa não possui permissão para acessar essa página! Estamos lhe redirecionando.");
        setTimeout(() => {
          history.push(`/`);
        }, 1000);
      }
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        await getPrompts();
        setLoading(false);
      } catch (err) {
        toastError(err);
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const socket = socketManager.getSocket(companyId);

    socket.on(`company-${companyId}-prompt`, (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_PROMPTS", payload: data.prompt });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_PROMPT", payload: data.promptId });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [companyId, socketManager]);

  const getPrompts = async () => {
    const { data } = await api.get("/prompt");
    dispatch({ type: "LOAD_PROMPTS", payload: data.prompts });
  };

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleOpenPromptModal = () => {
    setPromptModalOpen(true);
    setSelectedPrompt(null);
  };

  const handleClosePromptModal = () => {
    setPromptModalOpen(false);
    setSelectedPrompt(null);
  };

  const handleEditPrompt = (prompt) => {
    setSelectedPrompt(prompt);
    setPromptModalOpen(true);
  };

  const handleCloseConfirmationModal = () => {
    setConfirmModalOpen(false);
    setSelectedPrompt(null);
  };

  const handleDeletePrompt = async (promptId) => {
    try {
      const { data } = await api.delete(`/prompt/${promptId}`);
      dispatch({ type: "DELETE_PROMPT", payload: promptId });
      toast.info(i18n.t(data.message));
      setConfirmModalOpen(false);
    } catch (err) {
      toastError(err);
    }
    setSelectedPrompt(null);
  };

  const filteredPrompts = prompts.filter(prompt => 
    prompt.name.toLowerCase().includes(searchParam.toLowerCase()) ||
    (prompt.queue?.name && prompt.queue.name.toLowerCase().includes(searchParam.toLowerCase()))
  );

  return (
    <MainContainer>
      <ConfirmationModal
        title={
          selectedPrompt &&
          `${i18n.t("prompts.confirmationModal.deleteTitle")} ${selectedPrompt.name}?`
        }
        open={confirmModalOpen}
        onClose={handleCloseConfirmationModal}
        onConfirm={() => handleDeletePrompt(selectedPrompt.id)}
      >
        {i18n.t("prompts.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      
      <PromptModal
        open={promptModalOpen}
        onClose={handleClosePromptModal}
        promptId={selectedPrompt?.id}
        refreshPrompts={getPrompts}
      />
      
      <MainHeader>
        <Box className={classes.headerContent}>
          <Title>{i18n.t("prompts.title")}</Title>
          {prompts.length > 0 && (
            <span className={classes.promptCounter}>{prompts.length}</span>
          )}
        </Box>
        
        <MainHeaderButtonsWrapper>
          <TextField
            placeholder="Buscar prompt ou fila..."
            type="search"
            value={searchParam}
            onChange={handleSearch}
            variant="outlined"
            size="small"
            className={classes.searchField}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" style={{ color: theme.palette.text.secondary }} />
                </InputAdornment>
              ),
            }}
          />
          
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenPromptModal}
            startIcon={<AddIcon />}
            className={classes.addButton}
            size="small"
          >
            {i18n.t("prompts.buttons.add")}
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>
      
      <Paper
        className={classes.mainPaper}
        elevation={0}
      >
        {filteredPrompts.length === 0 && !loading ? (
          <Box className={classes.emptyState}>
            <DescriptionIcon style={{ fontSize: 32, marginBottom: 8, opacity: 0.2 }} />
            <Typography variant="body2">
              {searchParam 
                ? "Nenhum resultado encontrado" 
                : "Nenhum prompt criado"}
            </Typography>
          </Box>
        ) : (
          <Box>
            {filteredPrompts.map((prompt, index) => (
              <Fade in={true} timeout={200 + index * 30} key={prompt.id}>
                <Box className={classes.promptRow}>
                  <Box className={classes.promptInfo}>
                    <DescriptionIcon className={classes.promptIcon} />
                    
                    <Box>
                      <Typography className={classes.promptName}>
                        {prompt.name}
                      </Typography>
                    </Box>
                  </Box>

                  <Box className={classes.promptDetails}>
                    {prompt.queue && (
                      <Chip
                        icon={<LocalOfferIcon style={{ fontSize: "1rem" }} />}
                        label={prompt.queue.name}
                        size="small"
                        className={classes.queueChip}
                      />
                    )}
                    
                    <Typography variant="caption" className={classes.tokenInfo}>
                      Max tokens: {prompt.maxTokens || "Padrão"}
                    </Typography>
                  </Box>

                  <Box className={classes.actionButtons}>
                    <Tooltip title="Editar prompt">
                      <IconButton
                        size="small"
                        className={classes.iconButton}
                        onClick={() => handleEditPrompt(prompt)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Excluir prompt">
                      <IconButton
                        size="small"
                        className={classes.iconButton}
                        onClick={() => {
                          setSelectedPrompt(prompt);
                          setConfirmModalOpen(true);
                        }}
                      >
                        <DeleteOutlineIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </Fade>
            ))}
          </Box>
        )}
        
        {loading && (
          <Box className={classes.loadingContainer}>
            <CircularProgress size={24} />
          </Box>
        )}
      </Paper>
    </MainContainer>
  );
};

export default Prompts;