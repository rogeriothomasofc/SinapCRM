import React, { useState, useEffect, useReducer, useContext } from "react";
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
import SettingsEthernetIcon from "@material-ui/icons/SettingsEthernet";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";

import IntegrationModal from "../../components/QueueIntegrationModal";
import ConfirmationModal from "../../components/ConfirmationModal";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import usePlans from "../../hooks/usePlans";
import { SocketContext } from "../../context/Socket/SocketContext";

const reducer = (state, action) => {
  if (action.type === "LOAD_INTEGRATIONS") {
    const queueIntegration = action.payload;
    const newIntegrations = [];

    queueIntegration.forEach((integration) => {
      const integrationIndex = state.findIndex((u) => u.id === integration.id);
      if (integrationIndex !== -1) {
        state[integrationIndex] = integration;
      } else {
        newIntegrations.push(integration);
      }
    });

    return [...state, ...newIntegrations];
  }

  if (action.type === "UPDATE_INTEGRATIONS") {
    const queueIntegration = action.payload;
    const integrationIndex = state.findIndex((u) => u.id === queueIntegration.id);

    if (integrationIndex !== -1) {
      state[integrationIndex] = queueIntegration;
      return [...state];
    } else {
      return [queueIntegration, ...state];
    }
  }

  if (action.type === "DELETE_INTEGRATION") {
    const integrationId = action.payload;
    const integrationIndex = state.findIndex((u) => u.id === integrationId);
    if (integrationIndex !== -1) {
      state.splice(integrationIndex, 1);
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
  integrationRow: {
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
  integrationInfo: {
    display: "flex",
    alignItems: "center",
    flex: "1 1 auto",
    gap: theme.spacing(1.5),
    minWidth: 0,
  },
  typeContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flex: "0 0 100px",
    marginLeft: theme.spacing(4),
    marginRight: theme.spacing(4),
  },
  integrationIcon: {
    color: theme.palette.primary.main,
    fontSize: "1.5rem",
  },
  integrationDetails: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(0.5),
  },
  integrationName: {
    fontWeight: 500,
    color: theme.palette.text.primary,
    fontSize: "0.875rem",
  },
  integrationId: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.5),
    color: theme.palette.text.secondary,
    fontSize: "0.75rem",
  },
  typeChip: {
    fontWeight: 500,
    minWidth: 85,
    height: 24,
    fontSize: "0.75rem",
    textTransform: "capitalize",
    "& .MuiChip-label": {
      padding: "0 8px",
    },
  },
  actionButtons: {
    display: "flex",
    gap: theme.spacing(0.5),
    flex: "0 0 auto",
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
  integrationCounter: {
    backgroundColor: theme.palette.action.hover,
    borderRadius: 12,
    padding: "2px 10px",
    fontSize: "0.8125rem",
    fontWeight: 500,
    color: theme.palette.text.secondary,
  },
}));

const QueueIntegration = () => {
  const classes = useStyles();
  const theme = useTheme();
  const history = useHistory();

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [deletingIntegration, setDeletingIntegration] = useState(null);
  const [integrationModalOpen, setIntegrationModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [queueIntegration, dispatch] = useReducer(reducer, []);
  const { user } = useContext(AuthContext);
  const { getPlanCompany } = usePlans();
  const companyId = user.companyId;

  const socketManager = useContext(SocketContext);

  const getIntegrationColor = (type) => {
    const colors = {
      dialogflow: "#FF9800",
      n8n: "#FF6D00",
      webhook: "#2196F3",
      typebot: "#9C27B0",
    };
    return colors[type] || "#757575";
  };

  useEffect(() => {
    async function fetchData() {
      const planConfigs = await getPlanCompany(undefined, companyId);
      if (!planConfigs.plan.useIntegrations) {
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
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchIntegrations = async () => {
        try {
          const { data } = await api.get("/queueIntegration/", {
            params: { searchParam, pageNumber },
          });
          dispatch({ type: "LOAD_INTEGRATIONS", payload: data.queueIntegrations });
          setHasMore(data.hasMore);
          setLoading(false);
        } catch (err) {
          toastError(err);
        }
      };
      fetchIntegrations();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber]);

  useEffect(() => {
    const socket = socketManager.getSocket(companyId);

    socket.on(`company-${companyId}-queueIntegration`, (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_INTEGRATIONS", payload: data.queueIntegration });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_INTEGRATION", payload: +data.integrationId });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [companyId, socketManager]);

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleOpenIntegrationModal = () => {
    setSelectedIntegration(null);
    setIntegrationModalOpen(true);
  };

  const handleCloseIntegrationModal = () => {
    setSelectedIntegration(null);
    setIntegrationModalOpen(false);
  };

  const handleEditIntegration = (integration) => {
    setSelectedIntegration(integration);
    setIntegrationModalOpen(true);
  };

  const handleDeleteIntegration = async (integrationId) => {
    try {
      await api.delete(`/queueIntegration/${integrationId}`);
      
      // Atualiza o estado local imediatamente
      dispatch({ type: "DELETE_INTEGRATION", payload: integrationId });
      
      toast.success(i18n.t("queueIntegration.toasts.deleted"));
      setDeletingIntegration(null);
      setConfirmModalOpen(false);
    } catch (err) {
      toastError(err);
    }
  };

  const loadMore = () => {
    setPageNumber((prevState) => prevState + 1);
  };

  const handleScroll = (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      loadMore();
    }
  };

  const filteredIntegrations = queueIntegration.filter(integration => 
    integration.name.toLowerCase().includes(searchParam.toLowerCase()) ||
    integration.type.toLowerCase().includes(searchParam.toLowerCase())
  );

  return (
    <MainContainer>
      <ConfirmationModal
        title={
          deletingIntegration &&
          `${i18n.t("queueIntegration.confirmationModal.deleteTitle")} ${deletingIntegration.name}?`
        }
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={() => deletingIntegration && handleDeleteIntegration(deletingIntegration.id)}
      >
        {i18n.t("queueIntegration.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      
      <IntegrationModal
        open={integrationModalOpen}
        onClose={handleCloseIntegrationModal}
        aria-labelledby="form-dialog-title"
        integrationId={selectedIntegration && selectedIntegration.id}
      />
      
      <MainHeader>
        <Box className={classes.headerContent}>
          <Title>{i18n.t("queueIntegration.title")}</Title>
          {queueIntegration.length > 0 && (
            <span className={classes.integrationCounter}>{queueIntegration.length}</span>
          )}
        </Box>
        
        <MainHeaderButtonsWrapper>
          <TextField
            placeholder={i18n.t("queueIntegration.searchPlaceholder")}
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
            onClick={handleOpenIntegrationModal}
            startIcon={<AddIcon />}
            className={classes.addButton}
            size="small"
          >
            {i18n.t("queueIntegration.buttons.add")}
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>
      
      <Paper
        className={classes.mainPaper}
        elevation={0}
        onScroll={handleScroll}
      >
        {filteredIntegrations.length === 0 && !loading ? (
          <Box className={classes.emptyState}>
            <SettingsEthernetIcon style={{ fontSize: 32, marginBottom: 8, opacity: 0.2 }} />
            <Typography variant="body2">
              {searchParam 
                ? "Nenhum resultado encontrado" 
                : "Nenhuma integração configurada"}
            </Typography>
          </Box>
        ) : (
          <Box>
            {filteredIntegrations.map((integration, index) => (
              <Fade in={true} timeout={200 + index * 30} key={integration.id}>
                <Box className={classes.integrationRow}>
                  <Box className={classes.integrationInfo}>
                    <SettingsEthernetIcon className={classes.integrationIcon} />
                    
                    <Box className={classes.integrationDetails}>
                      <Typography className={classes.integrationName}>
                        {integration.name}
                      </Typography>
                      
                      <Box className={classes.integrationId}>
                        <Typography variant="caption">
                          ID: {integration.id}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Box className={classes.typeContainer}>
                    <Chip
                      label={integration.type}
                      size="small"
                      className={classes.typeChip}
                      style={{
                        backgroundColor: `${getIntegrationColor(integration.type)}20`,
                        color: getIntegrationColor(integration.type),
                        borderColor: getIntegrationColor(integration.type),
                      }}
                      variant="outlined"
                    />
                  </Box>

                  <Box className={classes.actionButtons}>
                    <Tooltip title="Editar integração">
                      <IconButton
                        size="small"
                        className={classes.iconButton}
                        onClick={() => handleEditIntegration(integration)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Excluir integração">
                      <IconButton
                        size="small"
                        className={classes.iconButton}
                        onClick={() => {
                          setDeletingIntegration(integration);
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

export default QueueIntegration;