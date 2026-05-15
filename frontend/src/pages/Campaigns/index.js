/* eslint-disable no-unused-vars */

import React, { useState, useEffect, useReducer, useContext } from "react";
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
import DescriptionIcon from "@material-ui/icons/Description";
import AddIcon from "@material-ui/icons/Add";
import PlayCircleOutlineIcon from "@material-ui/icons/PlayCircleOutline";
import PauseCircleOutlineIcon from "@material-ui/icons/PauseCircleOutline";
import SendIcon from "@material-ui/icons/Send";
import ScheduleIcon from "@material-ui/icons/Schedule";
import DoneIcon from "@material-ui/icons/Done";
import WhatsAppIcon from "@material-ui/icons/WhatsApp";
import ListIcon from "@material-ui/icons/List";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import CampaignModal from "../../components/CampaignModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";
import { isArray } from "lodash";
import { useDate } from "../../hooks/useDate";
import { SocketContext } from "../../context/Socket/SocketContext";

const reducer = (state, action) => {
  if (action.type === "LOAD_CAMPAIGNS") {
    const campaigns = action.payload;
    const newCampaigns = [];

    if (isArray(campaigns)) {
      campaigns.forEach((campaign) => {
        const campaignIndex = state.findIndex((u) => u.id === campaign.id);
        if (campaignIndex !== -1) {
          state[campaignIndex] = campaign;
        } else {
          newCampaigns.push(campaign);
        }
      });
    }

    return [...state, ...newCampaigns];
  }

  if (action.type === "UPDATE_CAMPAIGNS") {
    const campaign = action.payload;
    const campaignIndex = state.findIndex((u) => u.id === campaign.id);

    if (campaignIndex !== -1) {
      state[campaignIndex] = campaign;
      return [...state];
    } else {
      return [campaign, ...state];
    }
  }

  if (action.type === "DELETE_CAMPAIGN") {
    const campaignId = action.payload;

    const campaignIndex = state.findIndex((u) => u.id === campaignId);
    if (campaignIndex !== -1) {
      state.splice(campaignIndex, 1);
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
  campaignRow: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(1.5, 2),
    marginBottom: theme.spacing(0.75),
    borderRadius: 8,
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
    transition: "all 0.2s ease",
    minHeight: 72,
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
      borderColor: theme.palette.primary.main,
      transform: "translateY(-1px)",
      boxShadow: theme.shadows[1],
    },
  },
  campaignInfo: {
    display: "flex",
    alignItems: "center",
    flex: "1 1 auto",
    gap: theme.spacing(2),
    minWidth: 0,
  },
  campaignIcon: {
    color: theme.palette.primary.main,
    fontSize: "1.75rem",
    opacity: 0.9,
    transform: "rotate(-45deg)",
  },
  campaignContent: {
    flex: 1,
    minWidth: 0,
  },
  campaignName: {
    fontWeight: 600,
    color: theme.palette.text.primary,
    fontSize: "0.9375rem",
    marginBottom: theme.spacing(0.5),
  },
  campaignMeta: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2),
    flexWrap: "wrap",
  },
  metaItem: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.5),
    color: theme.palette.text.secondary,
    fontSize: "0.8125rem",
    "& .MuiSvgIcon-root": {
      fontSize: "1rem",
    },
  },
  statusChip: {
    fontWeight: 500,
    height: 24,
    fontSize: "0.75rem",
    "& .MuiChip-label": {
      padding: "0 8px",
    },
  },
  actionButtons: {
    display: "flex",
    gap: theme.spacing(0.75),
    flex: "0 0 auto",
    marginLeft: theme.spacing(2),
  },
  iconButton: {
    padding: 6,
    "& .MuiSvgIcon-root": {
      fontSize: "1.25rem",
    },
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
  },
  emptyState: {
    textAlign: "center",
    padding: theme.spacing(8),
    color: theme.palette.text.secondary,
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    padding: theme.spacing(4),
  },
  headerContent: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },
  campaignCounter: {
    backgroundColor: theme.palette.action.hover,
    borderRadius: 12,
    padding: "2px 10px",
    fontSize: "0.8125rem",
    fontWeight: 500,
    color: theme.palette.text.secondary,
  },
}));

const Campaigns = () => {
  const classes = useStyles();
  const theme = useTheme();
  const history = useHistory();

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [deletingCampaign, setDeletingCampaign] = useState(null);
  const [campaignModalOpen, setCampaignModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [campaigns, dispatch] = useReducer(reducer, []);

  const { datetimeToClient } = useDate();
  const socketManager = useContext(SocketContext);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      fetchCampaigns();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParam, pageNumber]);

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    const socket = socketManager.getSocket(companyId);

    socket.on(`company-${companyId}-campaign`, (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_CAMPAIGNS", payload: data.record });
      }
      if (data.action === "delete") {
        dispatch({ type: "DELETE_CAMPAIGN", payload: +data.id });
      }
    });
    return () => {
      socket.disconnect();
    };
  }, [socketManager]);

  const fetchCampaigns = async () => {
    try {
      const { data } = await api.get("/campaigns/", {
        params: { searchParam, pageNumber },
      });
      dispatch({ type: "LOAD_CAMPAIGNS", payload: data.records });
      setHasMore(data.hasMore);
      setLoading(false);
    } catch (err) {
      toastError(err);
    }
  };

  const handleOpenCampaignModal = () => {
    setSelectedCampaign(null);
    setCampaignModalOpen(true);
  };

  const handleCloseCampaignModal = () => {
    setSelectedCampaign(null);
    setCampaignModalOpen(false);
  };

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleEditCampaign = (campaign) => {
    setSelectedCampaign(campaign);
    setCampaignModalOpen(true);
  };

  const handleDeleteCampaign = async (campaignId) => {
    try {
      await api.delete(`/campaigns/${campaignId}`);
      toast.success(i18n.t("campaigns.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
    setDeletingCampaign(null);
    setSearchParam("");
    setPageNumber(1);
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

  const formatStatus = (val) => {
    switch (val) {
      case "INATIVA":
        return i18n.t("campaigns.status.inactive");
      case "PROGRAMADA":
        return i18n.t("campaigns.status.programmed");
      case "EM_ANDAMENTO":
        return i18n.t("campaigns.status.inProgress");
      case "CANCELADA":
        return i18n.t("campaigns.status.canceled");
      case "FINALIZADA":
        return i18n.t("campaigns.status.finished");
      default:
        return val;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "INATIVA":
        return "default";
      case "PROGRAMADA":
        return "primary";
      case "EM_ANDAMENTO":
        return "secondary";
      case "CANCELADA":
        return "default";
      case "FINALIZADA":
        return "primary";
      default:
        return "default";
    }
  };

  const cancelCampaign = async (campaign) => {
    try {
      await api.post(`/campaigns/${campaign.id}/cancel`);
      toast.success(i18n.t("campaigns.toasts.cancel"));
      setPageNumber(1);
      fetchCampaigns();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const restartCampaign = async (campaign) => {
    try {
      await api.post(`/campaigns/${campaign.id}/restart`);
      toast.success(i18n.t("campaigns.toasts.restart"));
      setPageNumber(1);
      fetchCampaigns();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <MainContainer>
      <ConfirmationModal
        title={
          deletingCampaign &&
          `${i18n.t("campaigns.confirmationModal.deleteTitle")} ${
            deletingCampaign.name
          }?`
        }
        open={confirmModalOpen}
        onClose={setConfirmModalOpen}
        onConfirm={() => handleDeleteCampaign(deletingCampaign.id)}
      >
        {i18n.t("campaigns.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      
      <CampaignModal
        resetPagination={() => {
          setPageNumber(1);
          fetchCampaigns();
        }}
        open={campaignModalOpen}
        onClose={handleCloseCampaignModal}
        aria-labelledby="form-dialog-title"
        campaignId={selectedCampaign && selectedCampaign.id}
      />
      
      <MainHeader>
        <Box className={classes.headerContent}>
          <Title>{i18n.t("campaigns.title")}</Title>
          {campaigns.length > 0 && (
            <span className={classes.campaignCounter}>{campaigns.length}</span>
          )}
        </Box>
        
        <MainHeaderButtonsWrapper>
          <TextField
            placeholder={i18n.t("campaigns.searchPlaceholder")}
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
            onClick={handleOpenCampaignModal}
            startIcon={<AddIcon />}
            className={classes.addButton}
            size="small"
          >
            {i18n.t("campaigns.buttons.add")}
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>
      
      <Paper
        className={classes.mainPaper}
        elevation={0}
        onScroll={handleScroll}
      >
        {campaigns.length === 0 && !loading ? (
          <Box className={classes.emptyState}>
            <SendIcon style={{ fontSize: 48, marginBottom: 16, opacity: 0.3, transform: "rotate(-45deg)" }} />
            <Typography variant="h6" style={{ marginBottom: 8 }}>
              {searchParam 
                ? "Nenhuma campanha encontrada" 
                : "Nenhuma campanha criada"}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {searchParam 
                ? "Tente buscar com outros termos" 
                : "Clique no botão acima para criar sua primeira campanha"}
            </Typography>
          </Box>
        ) : (
          <Box>
            {campaigns.map((campaign, index) => (
              <Fade in={true} timeout={200 + index * 30} key={campaign.id}>
                <Box className={classes.campaignRow}>
                  <Box className={classes.campaignInfo}>
                    <SendIcon className={classes.campaignIcon} />
                    
                    <Box className={classes.campaignContent}>
                      <Typography className={classes.campaignName}>
                        {campaign.name}
                      </Typography>
                      
                      <Box className={classes.campaignMeta}>
                        <Chip
                          label={formatStatus(campaign.status)}
                          size="small"
                          color={getStatusColor(campaign.status)}
                          className={classes.statusChip}
                        />
                        
                        {campaign.contactListId && (
                          <Box className={classes.metaItem}>
                            <ListIcon />
                            <span>{campaign.contactList.name}</span>
                          </Box>
                        )}
                        
                        {campaign.whatsappId && (
                          <Box className={classes.metaItem}>
                            <WhatsAppIcon />
                            <span>{campaign.whatsapp.name}</span>
                          </Box>
                        )}
                        
                        {campaign.scheduledAt && (
                          <Box className={classes.metaItem}>
                            <ScheduleIcon />
                            <span>{datetimeToClient(campaign.scheduledAt)}</span>
                          </Box>
                        )}
                        
                        {campaign.completedAt && (
                          <Box className={classes.metaItem}>
                            <DoneIcon />
                            <span>{datetimeToClient(campaign.completedAt)}</span>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </Box>

                  <Box className={classes.actionButtons}>
                    {campaign.status === "EM_ANDAMENTO" && (
                      <Tooltip title={i18n.t("campaigns.table.stopCampaign")}>
                        <IconButton
                          size="small"
                          className={classes.iconButton}
                          onClick={() => cancelCampaign(campaign)}
                          color="secondary"
                        >
                          <PauseCircleOutlineIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    
                    {campaign.status === "CANCELADA" && (
                      <Tooltip title="Reiniciar campanha">
                        <IconButton
                          size="small"
                          className={classes.iconButton}
                          onClick={() => restartCampaign(campaign)}
                          color="primary"
                        >
                          <PlayCircleOutlineIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    
                    <Tooltip title="Ver relatório">
                      <IconButton
                        size="small"
                        className={classes.iconButton}
                        onClick={() => history.push(`/campaign/${campaign.id}/report`)}
                      >
                        <DescriptionIcon />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Editar campanha">
                      <IconButton
                        size="small"
                        className={classes.iconButton}
                        onClick={() => handleEditCampaign(campaign)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Excluir campanha">
                      <IconButton
                        size="small"
                        className={classes.iconButton}
                        onClick={() => {
                          setConfirmModalOpen(true);
                          setDeletingCampaign(campaign);
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
            <CircularProgress size={28} />
          </Box>
        )}
      </Paper>
    </MainContainer>
  );
};

export default Campaigns;