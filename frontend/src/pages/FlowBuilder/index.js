import React, { useState, useEffect, useReducer, useContext, useRef } from "react";
import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";

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
import FileCopyIcon from "@material-ui/icons/FileCopy";
import BuildIcon from "@material-ui/icons/Build";
import AccountTreeIcon from "@material-ui/icons/AccountTree";
import GetAppIcon from "@material-ui/icons/GetApp";
import PublishIcon from "@material-ui/icons/Publish";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import NewTicketModal from "../../components/NewTicketModal";
import FlowBuilderModal from "../../components/FlowBuilderModal";

const reducer = (state, action) => {
  if (action.type === "LOAD_FLOWS") {
    const flows = action.payload;
    const newFlows = [];

    flows.forEach((flow) => {
      const flowIndex = state.findIndex((f) => f.id === flow.id);
      if (flowIndex !== -1) {
        state[flowIndex] = flow;
      } else {
        newFlows.push(flow);
      }
    });

    return [...state, ...newFlows];
  }

  if (action.type === "UPDATE_FLOW") {
    const flow = action.payload;
    const flowIndex = state.findIndex((f) => f.id === flow.id);

    if (flowIndex !== -1) {
      state[flowIndex] = flow;
      return [...state];
    } else {
      return [flow, ...state];
    }
  }

  if (action.type === "DELETE_FLOW") {
    const flowId = action.payload;
    const flowIndex = state.findIndex((f) => f.id === flowId);
    if (flowIndex !== -1) {
      state.splice(flowIndex, 1);
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
  flowRow: {
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
  flowInfo: {
    display: "flex",
    alignItems: "center",
    flex: "1 1 auto",
    gap: theme.spacing(1.5),
    minWidth: 0,
  },
  statusContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flex: "0 0 100px",
    marginLeft: theme.spacing(4),
    marginRight: theme.spacing(4),
  },
  flowIcon: {
    color: theme.palette.primary.main,
    fontSize: "1.5rem",
  },
  flowName: {
    fontWeight: 500,
    color: theme.palette.text.primary,
    fontSize: "0.875rem",
  },
  statusChip: {
    fontWeight: 500,
    minWidth: 85,
    height: 24,
    fontSize: "0.75rem",
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
  flowCounter: {
    backgroundColor: theme.palette.action.hover,
    borderRadius: 12,
    padding: "2px 10px",
    fontSize: "0.8125rem",
    fontWeight: 500,
    color: theme.palette.text.secondary,
  },
}));

const FlowBuilder = () => {
  const classes = useStyles();
  const theme = useTheme();
  const history = useHistory();
  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchParam, setSearchParam] = useState("");
  const [flows, dispatch] = useReducer(reducer, []);
  const [selectedFlowId, setSelectedFlowId] = useState(null);
  const [selectedFlowName, setSelectedFlowName] = useState(null);
  const [flowModalOpen, setFlowModalOpen] = useState(false);
  const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
  const [contactTicket, setContactTicket] = useState({});
  const [deletingFlow, setDeletingFlow] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmDuplicateOpen, setConfirmDuplicateOpen] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [reloadData, setReloadData] = useState(false);
  const importRef = useRef(null);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchFlows = async () => {
        try {
          const { data } = await api.get("/flowbuilder");
          dispatch({ type: "LOAD_FLOWS", payload: data.flows });
          setHasMore(data.hasMore);
        } catch (err) {
          toastError(err);
        } finally {
          setLoading(false);
        }
      };
      fetchFlows();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber, reloadData]);

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleOpenFlowModal = () => {
    setSelectedFlowId(null);
    setSelectedFlowName(null);
    setFlowModalOpen(true);
  };

  const handleCloseFlowModal = () => {
    setSelectedFlowId(null);
    setSelectedFlowName(null);
    setFlowModalOpen(false);
  };

  const handleEditFlow = (flow) => {
    setSelectedFlowId(flow.id);
    setSelectedFlowName(flow.name);
    setFlowModalOpen(true);
  };

  const handleBuildFlow = (flow) => {
    history.push(`/flowbuilder/${flow.id}`);
  };

  const handleDeleteFlow = async (flowId) => {
    try {
      await api.delete(`/flowbuilder/${flowId}`);
      
      // Atualiza o estado local imediatamente
      dispatch({ type: "DELETE_FLOW", payload: flowId });
      
      toast.success("Fluxo excluído com sucesso");
      setDeletingFlow(null);
      setConfirmOpen(false);
      
      // Também recarrega os dados do servidor para garantir sincronização
      setReloadData((old) => !old);
    } catch (err) {
      toastError(err);
    }
  };

  const handleDuplicateFlow = async (flowId) => {
    try {
      await api.post(`/flowbuilder/duplicate`, { flowId: flowId });
      toast.success("Fluxo duplicado com sucesso");
      setDeletingFlow(null);
      setReloadData((old) => !old);
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

  const filteredFlows = flows.filter(flow =>
    flow.name.toLowerCase().includes(searchParam.toLowerCase())
  );

  const handleExportFlow = async (e, flow) => {
    e.stopPropagation();
    try {
      const { data } = await api.get(`/flowbuilder/flow/${flow.id}`);
      const exportData = {
        name: flow.name,
        nodes: data.flow.flow?.nodes || [],
        connections: data.flow.flow?.connections || [],
        trigger: data.flow.flow?.trigger || null,
        variables: data.flow.variables || [],
      };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${flow.name.replace(/\s+/g, "_")}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Fluxo exportado com sucesso");
    } catch (err) {
      toastError(err);
    }
  };

  const handleImportFlow = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = "";
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const json = JSON.parse(ev.target.result);
        if (!json.name && !json.nodes) {
          toast.error("Arquivo inválido: não é um fluxo exportado");
          return;
        }
        await api.post("/flowbuilder/import", json);
        toast.success(`Fluxo "${json.name}" importado com sucesso`);
        setReloadData((old) => !old);
      } catch {
        toast.error("Erro ao importar: verifique o arquivo JSON");
      }
    };
    reader.readAsText(file);
  };

  return (
    <MainContainer>
      <NewTicketModal
        modalOpen={newTicketModalOpen}
        initialContact={contactTicket}
        onClose={(ticket) => {
          setNewTicketModalOpen(false);
          if (ticket !== undefined && ticket.uuid !== undefined) {
            history.push(`/tickets/${ticket.uuid}`);
          }
        }}
      />

      <FlowBuilderModal
        open={flowModalOpen}
        onClose={handleCloseFlowModal}
        aria-labelledby="form-dialog-title"
        flowId={selectedFlowId}
        nameWebhook={selectedFlowName}
        onSave={() => setReloadData((old) => !old)}
      />

      <ConfirmationModal
        title={deletingFlow ? `Excluir fluxo "${deletingFlow.name}"?` : ""}
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => deletingFlow && handleDeleteFlow(deletingFlow.id)}
      >
        Tem certeza que deseja deletar este fluxo? Todas as integrações relacionadas serão perdidas.
      </ConfirmationModal>

      <ConfirmationModal
        title={deletingFlow ? `Duplicar fluxo "${deletingFlow.name}"?` : ""}
        open={confirmDuplicateOpen}
        onClose={() => setConfirmDuplicateOpen(false)}
        onConfirm={() => deletingFlow && handleDuplicateFlow(deletingFlow.id)}
      >
        Tem certeza que deseja duplicar este fluxo?
      </ConfirmationModal>

      <MainHeader>
        <Box className={classes.headerContent}>
          <Title>Fluxos de Conversa</Title>
          {flows.length > 0 && (
            <span className={classes.flowCounter}>{flows.length}</span>
          )}
        </Box>
        
        <MainHeaderButtonsWrapper>
          <TextField
            placeholder="Buscar fluxo..."
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

          <input
            ref={importRef}
            type="file"
            accept=".json"
            style={{ display: "none" }}
            onChange={handleImportFlow}
          />

          <Button
            variant="outlined"
            size="small"
            onClick={() => importRef.current && importRef.current.click()}
            startIcon={<PublishIcon />}
            className={classes.addButton}
            style={{ borderColor: "#673AB7", color: "#673AB7" }}
          >
            Importar
          </Button>

          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenFlowModal}
            startIcon={<AddIcon />}
            className={classes.addButton}
            size="small"
          >
            Adicionar Fluxo
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>
      
      <Paper
        className={classes.mainPaper}
        elevation={0}
        onScroll={handleScroll}
      >
        {filteredFlows.length === 0 && !loading ? (
          <Box className={classes.emptyState}>
            <AccountTreeIcon style={{ fontSize: 32, marginBottom: 8, opacity: 0.2 }} />
            <Typography variant="body2">
              {searchParam 
                ? "Nenhum resultado encontrado" 
                : "Nenhum fluxo criado"}
            </Typography>
          </Box>
        ) : (
          <Box>
            {filteredFlows.map((flow, index) => (
              <Fade in={true} timeout={200 + index * 30} key={flow.id}>
                <Box 
                  className={classes.flowRow}
                  onClick={() => handleBuildFlow(flow)}
                >
                  <Box className={classes.flowInfo}>
                    <AccountTreeIcon className={classes.flowIcon} />
                    
                    <Typography className={classes.flowName}>
                      {flow.name}
                    </Typography>
                  </Box>

                  <Box className={classes.statusContainer}>
                    <Chip
                      size="small"
                      className={classes.statusChip}
                      label={flow.active ? "Ativo" : "Desativado"}
                      color={flow.active ? "primary" : "default"}
                      variant={flow.active ? "default" : "outlined"}
                    />
                  </Box>

                  <Box className={classes.actionButtons}>
                    <Tooltip title="Editar nome">
                      <IconButton
                        size="small"
                        className={classes.iconButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditFlow(flow);
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Editar fluxo">
                      <IconButton
                        size="small"
                        className={classes.iconButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBuildFlow(flow);
                        }}
                      >
                        <BuildIcon />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Duplicar">
                      <IconButton
                        size="small"
                        className={classes.iconButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingFlow(flow);
                          setConfirmDuplicateOpen(true);
                        }}
                      >
                        <FileCopyIcon />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Exportar">
                      <IconButton
                        size="small"
                        className={classes.iconButton}
                        onClick={(e) => handleExportFlow(e, flow)}
                      >
                        <GetAppIcon />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Excluir">
                      <IconButton
                        size="small"
                        className={classes.iconButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingFlow(flow);
                          setConfirmOpen(true);
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

export default FlowBuilder;