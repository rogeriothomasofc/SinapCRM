import React, { useState, useEffect, useContext } from "react";
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
import TextFieldsIcon from "@material-ui/icons/TextFields";
import AnnouncementIcon from "@material-ui/icons/Announcement";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";
import { Can } from "../../components/Can";
import { AuthContext } from "../../context/Auth/AuthContext";
import CampaignModalPhrase from "../../components/CampaignModalPhrase";

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
    padding: theme.spacing(1, 1.5),
    marginBottom: theme.spacing(0.5),
    borderRadius: 6,
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
    transition: "all 0.2s ease",
    minHeight: 48,
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
      borderColor: theme.palette.primary.main,
    },
  },
  campaignInfo: {
    display: "flex",
    alignItems: "center",
    flex: "1 1 auto",
    gap: theme.spacing(1.5),
    minWidth: 0,
  },
  campaignIcon: {
    color: theme.palette.primary.main,
    fontSize: "1.5rem",
  },
  campaignName: {
    fontWeight: 500,
    color: theme.palette.text.primary,
    fontSize: "0.875rem",
  },
  statusContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flex: "0 0 100px",
    marginLeft: theme.spacing(4),
    marginRight: theme.spacing(4),
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
  campaignCounter: {
    backgroundColor: theme.palette.action.hover,
    borderRadius: 12,
    padding: "2px 10px",
    fontSize: "0.8125rem",
    fontWeight: 500,
    color: theme.palette.text.secondary,
  },
}));

const CampaignsPhrase = () => {
  const classes = useStyles();
  const theme = useTheme();
  const history = useHistory();
  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [searchParam, setSearchParam] = useState("");
  const [campaignflows, setCampaignFlows] = useState([]);
  const [ModalOpenPhrase, setModalOpenPhrase] = useState(false);
  const [campaignflowSelected, setCampaignFlowSelected] = useState();
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [deletingCampaign, setDeletingCampaign] = useState(null);

  const handleDeleteCampaign = async (campaignId) => {
    try {
      await api.delete(`/flowcampaign/${campaignId}`);
      toast.success("Campanha excluída com sucesso");
      getCampaigns();
      setDeletingCampaign(null);
    } catch (err) {
      toastError(err);
    }
  };

  const getCampaigns = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/flowcampaign");
      setCampaignFlows(data.flow || []);
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  const onSaveModal = () => {
    getCampaigns();
    setModalOpenPhrase(false);
  };

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleEditCampaign = (campaign) => {
    setCampaignFlowSelected(campaign.id);
    setModalOpenPhrase(true);
  };

  const handleOpenCampaignModal = () => {
    setCampaignFlowSelected(null);
    setModalOpenPhrase(true);
  };

  useEffect(() => {
    getCampaigns();
  }, []);

  const filteredCampaigns = campaignflows.filter(campaign => 
    campaign.name.toLowerCase().includes(searchParam.toLowerCase())
  );

  return (
    <MainContainer>
      <ConfirmationModal
        title={deletingCampaign ? `Excluir campanha "${deletingCampaign.name}"?` : ""}
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={() => deletingCampaign && handleDeleteCampaign(deletingCampaign.id)}
      >
        {i18n.t("campaigns.confirmationModal.deleteMessage")}
      </ConfirmationModal>

      <CampaignModalPhrase
        open={ModalOpenPhrase}
        onClose={() => setModalOpenPhrase(false)}
        FlowCampaignId={campaignflowSelected}
        onSave={onSaveModal}
      />

      <MainHeader>
        <Box className={classes.headerContent}>
          <Title>Campanhas</Title>
          {campaignflows.length > 0 && (
            <span className={classes.campaignCounter}>{campaignflows.length}</span>
          )}
        </Box>
        
        <MainHeaderButtonsWrapper>
          <TextField
            placeholder="Buscar campanha..."
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
            Nova Campanha
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>
      
      <Paper
        className={classes.mainPaper}
        elevation={0}
      >
        {filteredCampaigns.length === 0 && !loading ? (
          <Box className={classes.emptyState}>
            <AnnouncementIcon style={{ fontSize: 32, marginBottom: 8, opacity: 0.2 }} />
            <Typography variant="body2">
              {searchParam 
                ? "Nenhum resultado encontrado" 
                : "Nenhuma campanha criada"}
            </Typography>
          </Box>
        ) : (
          <Box>
            {filteredCampaigns.map((campaign, index) => (
              <Fade in={true} timeout={200 + index * 30} key={campaign.id}>
                <Box className={classes.campaignRow}>
                  <Box className={classes.campaignInfo}>
                    <TextFieldsIcon className={classes.campaignIcon} />
                    
                    <Typography className={classes.campaignName}>
                      {campaign.name}
                    </Typography>
                  </Box>

                  <Box className={classes.statusContainer}>
                    <Chip
                      size="small"
                      className={classes.statusChip}
                      label={campaign.status ? "Ativo" : "Desativado"}
                      color={campaign.status ? "primary" : "default"}
                      variant={campaign.status ? "default" : "outlined"}
                    />
                  </Box>

                  <Box className={classes.actionButtons}>
                    <Tooltip title="Editar campanha">
                      <IconButton
                        size="small"
                        className={classes.iconButton}
                        onClick={() => handleEditCampaign(campaign)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    
                    <Can
                      role={user.profile}
                      perform="contacts-page:deleteContact"
                      yes={() => (
                        <Tooltip title="Excluir campanha">
                          <IconButton
                            size="small"
                            className={classes.iconButton}
                            onClick={() => {
                              setDeletingCampaign(campaign);
                              setConfirmModalOpen(true);
                            }}
                          >
                            <DeleteOutlineIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    />
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

export default CampaignsPhrase;