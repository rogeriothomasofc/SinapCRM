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
  Avatar,
} from "@material-ui/core";

import SearchIcon from "@material-ui/icons/Search";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import EditIcon from "@material-ui/icons/Edit";
import PeopleIcon from "@material-ui/icons/People";
import GetAppIcon from "@material-ui/icons/GetApp";
import AddIcon from "@material-ui/icons/Add";
import ListAltIcon from "@material-ui/icons/ListAlt";
import ContactsIcon from "@material-ui/icons/Contacts";
import PersonAddIcon from "@material-ui/icons/PersonAdd";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import ContactListDialog from "../../components/ContactListDialog";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";

import planilhaExemplo from "../../assets/planilha.xlsx";
import { SocketContext } from "../../context/Socket/SocketContext";

const reducer = (state, action) => {
  if (action.type === "LOAD_CONTACTLISTS") {
    const contactLists = action.payload;
    const newContactLists = [];

    contactLists.forEach((contactList) => {
      const contactListIndex = state.findIndex((u) => u.id === contactList.id);
      if (contactListIndex !== -1) {
        state[contactListIndex] = contactList;
      } else {
        newContactLists.push(contactList);
      }
    });

    return [...state, ...newContactLists];
  }

  if (action.type === "UPDATE_CONTACTLIST") {
    const contactList = action.payload;
    const contactListIndex = state.findIndex((u) => u.id === contactList.id);

    if (contactListIndex !== -1) {
      state[contactListIndex] = contactList;
      return [...state];
    } else {
      return [contactList, ...state];
    }
  }

  if (action.type === "DELETE_CONTACTLIST") {
    const contactListId = action.payload;

    const contactListIndex = state.findIndex((u) => u.id === contactListId);
    if (contactListIndex !== -1) {
      state.splice(contactListIndex, 1);
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
  downloadButton: {
    borderRadius: 6,
    textTransform: "none",
    fontWeight: 500,
    padding: "6px 16px",
    fontSize: "0.875rem",
    marginRight: theme.spacing(1),
    backgroundColor: theme.palette.success.main,
    color: "#fff",
    boxShadow: "none",
    "&:hover": {
      backgroundColor: theme.palette.success.dark,
      boxShadow: theme.shadows[2],
    },
  },
  listRow: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(2),
    marginBottom: theme.spacing(1),
    borderRadius: 8,
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
    transition: "all 0.2s ease",
    minHeight: 80,
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
      borderColor: theme.palette.primary.main,
      transform: "translateY(-1px)",
      boxShadow: theme.shadows[2],
    },
  },
  listInfo: {
    display: "flex",
    alignItems: "center",
    flex: "1 1 auto",
    gap: theme.spacing(2),
    minWidth: 0,
  },
  listAvatar: {
    width: 48,
    height: 48,
    backgroundColor: theme.palette.primary.main,
    fontSize: "1.5rem",
  },
  listContent: {
    flex: 1,
    minWidth: 0,
  },
  listName: {
    fontWeight: 600,
    color: theme.palette.text.primary,
    fontSize: "0.9375rem",
    marginBottom: theme.spacing(0.5),
  },
  listStats: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2),
  },
  statItem: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.5),
    color: theme.palette.text.secondary,
    fontSize: "0.8125rem",
    "& .MuiSvgIcon-root": {
      fontSize: "1rem",
    },
  },
  contactsChip: {
    fontWeight: 500,
    backgroundColor: theme.palette.action.hover,
    "& .MuiChip-label": {
      display: "flex",
      alignItems: "center",
      gap: theme.spacing(0.5),
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
  listCounter: {
    backgroundColor: theme.palette.action.hover,
    borderRadius: 12,
    padding: "2px 10px",
    fontSize: "0.8125rem",
    fontWeight: 500,
    color: theme.palette.text.secondary,
  },
  statsGrid: {
    display: "flex",
    gap: theme.spacing(3),
    flex: "0 0 auto",
    alignItems: "center",
    marginRight: theme.spacing(2),
  },
  statCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: theme.spacing(1),
    minWidth: 80,
  },
  statValue: {
    fontSize: "1.25rem",
    fontWeight: 600,
    color: theme.palette.text.primary,
    lineHeight: 1,
  },
  statLabel: {
    fontSize: "0.75rem",
    color: theme.palette.text.secondary,
    marginTop: 2,
  },
}));

const ContactLists = () => {
  const classes = useStyles();
  const theme = useTheme();
  const history = useHistory();

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedContactList, setSelectedContactList] = useState(null);
  const [deletingContactList, setDeletingContactList] = useState(null);
  const [contactListModalOpen, setContactListModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [contactLists, dispatch] = useReducer(reducer, []);

  const socketManager = useContext(SocketContext);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchContactLists = async () => {
        try {
          const { data } = await api.get("/contact-lists/", {
            params: { searchParam, pageNumber },
          });
          dispatch({ type: "LOAD_CONTACTLISTS", payload: data.records });
          setHasMore(data.hasMore);
          setLoading(false);
        } catch (err) {
          toastError(err);
        }
      };
      fetchContactLists();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber]);

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    const socket = socketManager.getSocket(companyId);

    socket.on(`company-${companyId}-ContactList`, (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_CONTACTLIST", payload: data.record });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_CONTACTLIST", payload: +data.id });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [socketManager]);

  const handleOpenContactListModal = () => {
    setSelectedContactList(null);
    setContactListModalOpen(true);
  };

  const handleCloseContactListModal = () => {
    setSelectedContactList(null);
    setContactListModalOpen(false);
  };

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleEditContactList = (contactList) => {
    setSelectedContactList(contactList);
    setContactListModalOpen(true);
  };

  const handleDeleteContactList = async (contactListId) => {
    try {
      await api.delete(`/contact-lists/${contactListId}`);
      toast.success(i18n.t("contactLists.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
    setDeletingContactList(null);
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

  const goToContacts = (id) => {
    history.push(`/contact-lists/${id}/contacts`);
  };

  const getTotalContacts = () => {
    return contactLists.reduce((total, list) => total + (list.contactsCount || 0), 0);
  };

  return (
    <MainContainer>
      <ConfirmationModal
        title={
          deletingContactList &&
          `${i18n.t("contactLists.confirmationModal.deleteTitle")} ${
            deletingContactList.name
          }?`
        }
        open={confirmModalOpen}
        onClose={setConfirmModalOpen}
        onConfirm={() => handleDeleteContactList(deletingContactList.id)}
      >
        {i18n.t("contactLists.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      
      <ContactListDialog
        open={contactListModalOpen}
        onClose={handleCloseContactListModal}
        aria-labelledby="form-dialog-title"
        contactListId={selectedContactList && selectedContactList.id}
      />
      
      <MainHeader>
        <Box className={classes.headerContent}>
          <Title>{i18n.t("contactLists.title")}</Title>
          {contactLists.length > 0 && (
            <span className={classes.listCounter}>{contactLists.length}</span>
          )}
        </Box>
        
        <MainHeaderButtonsWrapper>
          <TextField
            placeholder={i18n.t("contacts.searchPlaceholder")}
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
            startIcon={<GetAppIcon />}
            className={classes.downloadButton}
            size="small"
            component="a"
            href={planilhaExemplo}
            download="planilha.xlsx"
          >
            Planilha Exemplo
          </Button>
          
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenContactListModal}
            startIcon={<AddIcon />}
            className={classes.addButton}
            size="small"
          >
            {i18n.t("contactLists.buttons.add")}
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>
      
      <Paper
        className={classes.mainPaper}
        elevation={0}
        onScroll={handleScroll}
      >
        {contactLists.length === 0 && !loading ? (
          <Box className={classes.emptyState}>
            <ListAltIcon style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }} />
            <Typography variant="h6" style={{ marginBottom: 8 }}>
              {searchParam 
                ? "Nenhuma lista encontrada" 
                : "Nenhuma lista de contatos criada"}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {searchParam 
                ? "Tente buscar com outros termos" 
                : "Clique no botão acima para criar sua primeira lista"}
            </Typography>
          </Box>
        ) : (
          <Box>
            {contactLists.length > 0 && (
              <Box className={classes.statsGrid} style={{ marginBottom: 16 }}>
                <Box className={classes.statCard}>
                  <Typography className={classes.statValue}>
                    {getTotalContacts()}
                  </Typography>
                  <Typography className={classes.statLabel}>
                    Total de Contatos
                  </Typography>
                </Box>
              </Box>
            )}
            
            {contactLists.map((contactList, index) => (
              <Fade in={true} timeout={200 + index * 30} key={contactList.id}>
                <Box className={classes.listRow}>
                  <Box className={classes.listInfo}>
                    <Avatar className={classes.listAvatar}>
                      <ContactsIcon />
                    </Avatar>
                    
                    <Box className={classes.listContent}>
                      <Typography className={classes.listName}>
                        {contactList.name}
                      </Typography>
                      
                      <Box className={classes.listStats}>
                        <Chip
                          icon={<PeopleIcon style={{ fontSize: "1rem" }} />}
                          label={`${contactList.contactsCount || 0} contatos`}
                          size="small"
                          className={classes.contactsChip}
                        />
                        
                        <Box className={classes.statItem}>
                          <PersonAddIcon />
                          <span>Atualizado recentemente</span>
                        </Box>
                      </Box>
                    </Box>
                  </Box>

                  <Box className={classes.actionButtons}>
                    <Tooltip title="Ver contatos">
                      <IconButton
                        size="small"
                        className={classes.iconButton}
                        onClick={() => goToContacts(contactList.id)}
                        color="primary"
                      >
                        <PeopleIcon />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Editar lista">
                      <IconButton
                        size="small"
                        className={classes.iconButton}
                        onClick={() => handleEditContactList(contactList)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Excluir lista">
                      <IconButton
                        size="small"
                        className={classes.iconButton}
                        onClick={() => {
                          setConfirmModalOpen(true);
                          setDeletingContactList(contactList);
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

export default ContactLists;