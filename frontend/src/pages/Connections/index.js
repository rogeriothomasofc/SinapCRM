import React, { useState, useCallback, useContext } from "react";
import { toast } from "react-toastify";

import { makeStyles } from "@material-ui/core/styles";
import { green, red, orange } from "@material-ui/core/colors";
import {
  Button,
  IconButton,
  Paper,
  Tooltip,
  Typography,
  CircularProgress,
  Box,
  Fade,
  Chip,
  useTheme,
  TextField,
  InputAdornment,
} from "@material-ui/core";

import Search from "@material-ui/icons/Search";
import Edit from "@material-ui/icons/Edit";
import CheckCircle from "@material-ui/icons/CheckCircle";
import CropFree from "@material-ui/icons/CropFree";
import DeleteOutline from "@material-ui/icons/DeleteOutline";
import WhatsApp from "@material-ui/icons/WhatsApp";
import Add from "@material-ui/icons/Add";
import Refresh from "@material-ui/icons/Refresh";
import Block from "@material-ui/icons/Block";
import SyncIcon from "@material-ui/icons/Sync";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";

import api from "../../services/api";
import WhatsAppModal from "../../components/WhatsAppModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import QrcodeModal from "../../components/QrcodeModal";
import { i18n } from "../../translate/i18n";
import { WhatsAppsContext } from "../../context/WhatsApp/WhatsAppsContext";
import toastError from "../../errors/toastError";

import { AuthContext } from "../../context/Auth/AuthContext";
import { Can } from "../../components/Can";

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
  connectionRow: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(1.5, 2),
    marginBottom: theme.spacing(0.5),
    borderRadius: 6,
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
    transition: "all 0.2s ease",
    minHeight: 60,
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
      borderColor: theme.palette.primary.main,
    },
  },
  connectionInfo: {
    display: "flex",
    alignItems: "center",
    flex: "1 1 auto",
    gap: theme.spacing(1.5),
    minWidth: 0,
  },
  whatsappIcon: {
    color: "#25D366",
    fontSize: 28,
  },
  connectionDetails: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(0.5),
  },
  connectionName: {
    fontWeight: 500,
    fontSize: "0.875rem",
    color: theme.palette.text.primary,
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.5),
  },
  phoneNumber: {
    fontSize: "0.75rem",
    color: theme.palette.text.secondary,
  },
  statusContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flex: "0 0 120px",
    marginLeft: theme.spacing(4),
    marginRight: theme.spacing(8),
  },
  statusChip: {
    height: 24,
    fontSize: "0.75rem",
    fontWeight: 500,
    minWidth: 100,
    "& .MuiChip-label": {
      padding: "0 8px",
    },
  },
  connectedChip: {
    backgroundColor: green[100],
    color: green[800],
    borderColor: green[300],
  },
  disconnectedChip: {
    backgroundColor: red[100],
    color: red[800],
    borderColor: red[300],
  },
  connectingChip: {
    backgroundColor: orange[100],
    color: orange[800],
    borderColor: orange[300],
  },
  qrcodeChip: {
    backgroundColor: theme.palette.info.light,
    color: theme.palette.info.dark,
    borderColor: theme.palette.info.main,
  },
  centerSection: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flex: "0 0 200px",
    gap: theme.spacing(1),
    marginRight: theme.spacing(2),
  },
  lastUpdate: {
    fontSize: "0.7rem",
    color: theme.palette.text.secondary,
  },
  defaultBadge: {
    color: green[600],
    fontSize: 16,
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
  actionButton: {
    borderRadius: 4,
    textTransform: "none",
    fontSize: "0.75rem",
    padding: "4px 10px",
    minWidth: "auto",
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
  connectionCounter: {
    backgroundColor: theme.palette.action.hover,
    borderRadius: 12,
    padding: "2px 10px",
    fontSize: "0.8125rem",
    fontWeight: 500,
    color: theme.palette.text.secondary,
  },
}));

const Connections = () => {
  const classes = useStyles();
  const theme = useTheme();

  const { user } = useContext(AuthContext);
  const { whatsApps, loading } = useContext(WhatsAppsContext);
  const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedWhatsApp, setSelectedWhatsApp] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  
  const confirmationModalInitialState = {
    action: "",
    title: "",
    message: "",
    whatsAppId: "",
    open: false,
  };
  const [confirmModalInfo, setConfirmModalInfo] = useState(
    confirmationModalInitialState
  );
  const [syncingContacts, setSyncingContacts] = useState({});

  const handleSyncContacts = async whatsAppId => {
    setSyncingContacts(prev => ({ ...prev, [whatsAppId]: true }));
    try {
      const { data } = await api.post(`/whatsapp/${whatsAppId}/sync-contacts`);
      toast.success(`Sincronização concluída: ${data.synced} contatos atualizados.`);
    } catch (err) {
      toastError(err);
    }
    setSyncingContacts(prev => ({ ...prev, [whatsAppId]: false }));
  };

  const handleStartWhatsAppSession = async whatsAppId => {
    try {
      await api.post(`/whatsappsession/${whatsAppId}`);
    } catch (err) {
      toastError(err);
    }
  };

  const handleRequestNewQrCode = async whatsAppId => {
    try {
      await api.put(`/whatsappsession/${whatsAppId}`);
    } catch (err) {
      toastError(err);
    }
  };

  const handleOpenWhatsAppModal = () => {
    setSelectedWhatsApp(null);
    setWhatsAppModalOpen(true);
  };

  const handleCloseWhatsAppModal = useCallback(() => {
    setWhatsAppModalOpen(false);
    setSelectedWhatsApp(null);
  }, [setSelectedWhatsApp, setWhatsAppModalOpen]);

  const handleOpenQrModal = whatsApp => {
    setSelectedWhatsApp(whatsApp);
    setQrModalOpen(true);
  };

  const handleCloseQrModal = useCallback(() => {
    setSelectedWhatsApp(null);
    setQrModalOpen(false);
  }, [setQrModalOpen, setSelectedWhatsApp]);

  const handleEditWhatsApp = whatsApp => {
    setSelectedWhatsApp(whatsApp);
    setWhatsAppModalOpen(true);
  };

  const handleOpenConfirmationModal = (action, whatsAppId) => {
    if (action === "disconnect") {
      setConfirmModalInfo({
        action: action,
        title: i18n.t("connections.confirmationModal.disconnectTitle"),
        message: i18n.t("connections.confirmationModal.disconnectMessage"),
        whatsAppId: whatsAppId,
      });
    }

    if (action === "delete") {
      setConfirmModalInfo({
        action: action,
        title: i18n.t("connections.confirmationModal.deleteTitle"),
        message: i18n.t("connections.confirmationModal.deleteMessage"),
        whatsAppId: whatsAppId,
      });
    }
    setConfirmModalOpen(true);
  };

  const handleSubmitConfirmationModal = async () => {
    if (confirmModalInfo.action === "disconnect") {
      try {
        await api.delete(`/whatsappsession/${confirmModalInfo.whatsAppId}`);
      } catch (err) {
        toastError(err);
      }
    }

    if (confirmModalInfo.action === "delete") {
      try {
        await api.delete(`/whatsapp/${confirmModalInfo.whatsAppId}`);
        toast.success(i18n.t("connections.toasts.deleted"));
      } catch (err) {
        toastError(err);
      }
    }

    setConfirmModalInfo(confirmationModalInitialState);
  };

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}/${month} ${hours}:${minutes}`;
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      CONNECTED: { 
        label: "Conectado", 
        className: classes.connectedChip,
        variant: "outlined"
      },
      DISCONNECTED: { 
        label: "Desconectado", 
        className: classes.disconnectedChip,
        variant: "outlined"
      },
      OPENING: { 
        label: "Conectando", 
        className: classes.connectingChip,
        variant: "outlined",
        icon: <CircularProgress size={12} style={{ color: orange[800] }} />
      },
      qrcode: { 
        label: "QR Code", 
        className: classes.qrcodeChip,
        variant: "outlined"
      },
      TIMEOUT: { 
        label: "Timeout", 
        className: classes.connectingChip,
        variant: "outlined"
      },
      PAIRING: { 
        label: "Pareando", 
        className: classes.connectingChip,
        variant: "outlined"
      }
    };
    
    const config = statusConfig[status] || statusConfig.DISCONNECTED;
    
    return (
      <Chip
        size="small"
        label={config.label}
        className={`${classes.statusChip} ${config.className}`}
        variant={config.variant}
        icon={config.icon}
      />
    );
  };

  const filteredConnections = whatsApps?.filter(whatsApp => 
    whatsApp.name.toLowerCase().includes(searchParam.toLowerCase()) ||
    (whatsApp.number && whatsApp.number.includes(searchParam))
  ) || [];

  return (
    <MainContainer>
      <ConfirmationModal
        title={confirmModalInfo.title}
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleSubmitConfirmationModal}
      >
        {confirmModalInfo.message}
      </ConfirmationModal>
      
      <QrcodeModal
        open={qrModalOpen}
        onClose={handleCloseQrModal}
        whatsAppId={!whatsAppModalOpen && selectedWhatsApp?.id}
      />
      
      <WhatsAppModal
        open={whatsAppModalOpen}
        onClose={handleCloseWhatsAppModal}
        whatsAppId={!qrModalOpen && selectedWhatsApp?.id}
      />
      
      <MainHeader>
        <Box className={classes.headerContent}>
          <Title>{i18n.t("connections.title")}</Title>
          {whatsApps?.length > 0 && (
            <span className={classes.connectionCounter}>{whatsApps.length}</span>
          )}
        </Box>
        
        <MainHeaderButtonsWrapper>
          <TextField
            placeholder="Buscar conexão..."
            type="search"
            value={searchParam}
            onChange={handleSearch}
            variant="outlined"
            size="small"
            className={classes.searchField}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" style={{ color: theme.palette.text.secondary }} />
                </InputAdornment>
              ),
            }}
          />
          
          <Can
            role={user.profile}
            perform="connections-page:addConnection"
            yes={() => (
              <Button
                variant="contained"
                color="primary"
                onClick={handleOpenWhatsAppModal}
                startIcon={<Add />}
                className={classes.addButton}
                size="small"
              >
                {i18n.t("connections.buttons.add")}
              </Button>
            )}
          />
        </MainHeaderButtonsWrapper>
      </MainHeader>
      
      <Paper className={classes.mainPaper} elevation={0}>
        {loading ? (
          <Box className={classes.loadingContainer}>
            <CircularProgress size={24} />
          </Box>
        ) : filteredConnections.length === 0 ? (
          <Box className={classes.emptyState}>
            <WhatsApp style={{ fontSize: 32, marginBottom: 8, opacity: 0.2 }} />
            <Typography variant="body2">
              {searchParam 
                ? "Nenhum resultado encontrado"
                : i18n.t("connections.noConnections") || "Nenhuma conexão configurada"}
            </Typography>
          </Box>
        ) : (
          <Box>
            {filteredConnections.map((whatsApp, index) => (
              <Fade in={true} timeout={200 + index * 30} key={whatsApp.id}>
                <Box className={classes.connectionRow}>
                  <Box className={classes.connectionInfo}>
                    <WhatsApp className={classes.whatsappIcon} />
                    
                    <Box className={classes.connectionDetails}>
                      <Box className={classes.connectionName}>
                        {whatsApp.name}
                        {whatsApp.isDefault && (
                          <Tooltip title={i18n.t("connections.default") || "Padrão"} arrow>
                            <CheckCircle className={classes.defaultBadge} />
                          </Tooltip>
                        )}
                      </Box>
                      {whatsApp.number && (
                        <Typography className={classes.phoneNumber}>
                          {whatsApp.number}
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  <Box className={classes.statusContainer}>
                    {getStatusChip(whatsApp.status)}
                  </Box>

                  <Box className={classes.centerSection}>
                    {whatsApp.status === "qrcode" && (
                      <Can
                        role={user.profile}
                        perform="connections-page:actionButtons"
                        yes={() => (
                          <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            onClick={() => handleOpenQrModal(whatsApp)}
                            className={classes.actionButton}
                            startIcon={<CropFree />}
                          >
                            QR Code
                          </Button>
                        )}
                      />
                    )}
                    {(whatsApp.status === "CONNECTED" || whatsApp.status === "PAIRING" || whatsApp.status === "TIMEOUT") && (
                      <Can
                        role={user.profile}
                        perform="connections-page:actionButtons"
                        yes={() => (
                          <Button
                            size="small"
                            variant="outlined"
                            color="secondary"
                            onClick={() => handleOpenConfirmationModal("disconnect", whatsApp.id)}
                            className={classes.actionButton}
                            startIcon={<Block />}
                          >
                            Desconectar
                          </Button>
                        )}
                      />
                    )}
                    {whatsApp.status === "DISCONNECTED" && (
                      <Can
                        role={user.profile}
                        perform="connections-page:actionButtons"
                        yes={() => (
                          <>
                            <Button
                              size="small"
                              variant="outlined"
                              color="primary"
                              onClick={() => handleStartWhatsAppSession(whatsApp.id)}
                              className={classes.actionButton}
                              startIcon={<Refresh />}
                            >
                              Reconectar
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleRequestNewQrCode(whatsApp.id)}
                              className={classes.actionButton}
                              startIcon={<CropFree />}
                            >
                              Novo QR
                            </Button>
                          </>
                        )}
                      />
                    )}
                    {(whatsApp.status === "OPENING" || whatsApp.status === "CONNECTED") && (
                      <Typography className={classes.lastUpdate}>
                        {formatDate(whatsApp.updatedAt)}
                      </Typography>
                    )}
                  </Box>

                  <Box className={classes.actionButtons}>
                    <Can
                      role={user.profile}
                      perform="connections-page:editOrDeleteConnection"
                      yes={() => (
                        <>
                          <Tooltip title="Sincronizar Contatos">
                            <span>
                              <IconButton
                                size="small"
                                className={classes.iconButton}
                                onClick={() => handleSyncContacts(whatsApp.id)}
                                disabled={!!syncingContacts[whatsApp.id]}
                              >
                                {syncingContacts[whatsApp.id]
                                  ? <CircularProgress size={16} color="inherit" />
                                  : <SyncIcon fontSize="small" />}
                              </IconButton>
                            </span>
                          </Tooltip>

                          <Tooltip title={i18n.t("connections.buttons.edit") || "Editar"}>
                            <IconButton
                              size="small"
                              className={classes.iconButton}
                              onClick={() => handleEditWhatsApp(whatsApp)}
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title={i18n.t("connections.buttons.delete") || "Excluir"}>
                            <IconButton
                              size="small"
                              className={classes.iconButton}
                              onClick={() => handleOpenConfirmationModal("delete", whatsApp.id)}
                            >
                              <DeleteOutline />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    />
                  </Box>
                </Box>
              </Fade>
            ))}
          </Box>
        )}
      </Paper>
    </MainContainer>
  );
};

export default Connections;