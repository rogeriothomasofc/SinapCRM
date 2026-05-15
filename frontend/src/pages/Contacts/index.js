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
  Typography,
  Box,
  Fade,
  useTheme,
  CircularProgress,
  Avatar,
  Tooltip,
  Chip,
  Menu,
  MenuItem,
} from "@material-ui/core";
import WhatsAppIcon from "@material-ui/icons/WhatsApp";
import SearchIcon from "@material-ui/icons/Search";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import EditIcon from "@material-ui/icons/Edit";
import AddIcon from "@material-ui/icons/Add";
import GetAppIcon from "@material-ui/icons/GetApp";
import PublishIcon from "@material-ui/icons/Publish";
import ContactsIcon from "@material-ui/icons/Contacts";
import EmailIcon from "@material-ui/icons/Email";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import SyncIcon from "@material-ui/icons/Sync";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@material-ui/core";

import api from "../../services/api";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import ContactModal from "../../components/ContactModal";
import ConfirmationModal from "../../components/ConfirmationModal/";

import { i18n } from "../../translate/i18n";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import MainContainer from "../../components/MainContainer";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import { Can } from "../../components/Can";
import NewTicketModal from "../../components/NewTicketModal";
import { SocketContext } from "../../context/Socket/SocketContext";

import { CSVLink } from "react-csv";
import ImportContactsModal from "../../components/ImportContactsModal";

// Formata número para exibição e exportação
const formatContactNumber = (number = "") => {
  if (!number) return { display: "", export: "", valid: false };
  // Número brasileiro: 55 + DDD(2) + 8 ou 9 dígitos
  if (/^55\d{10,11}$/.test(number)) {
    const ddd = number.slice(2, 4);
    const phone = number.slice(4);
    const fmt = phone.length === 9
      ? `${phone.slice(0, 5)}-${phone.slice(5)}`
      : `${phone.slice(0, 4)}-${phone.slice(4)}`;
    const display = `+55 (${ddd}) ${fmt}`;
    return { display, export: display, valid: true };
  }
  // Grupo WhatsApp (18+ dígitos)
  if (number.length >= 18) {
    return { display: number, export: number, valid: false, isGroup: true };
  }
  // Formato incorreto — não segue DDI + DDD + Número
  return { display: number, export: number, valid: false };
};

const reducer = (state, action) => {
  if (action.type === "LOAD_CONTACTS") {
    const contacts = action.payload;
    const newContacts = [];

    contacts.forEach((contact) => {
      const contactIndex = state.findIndex((c) => c.id === contact.id);
      if (contactIndex !== -1) {
        state[contactIndex] = contact;
      } else {
        newContacts.push(contact);
      }
    });

    return [...state, ...newContacts];
  }

  if (action.type === "UPDATE_CONTACTS") {
    const contact = action.payload;
    const contactIndex = state.findIndex((c) => c.id === contact.id);

    if (contactIndex !== -1) {
      state[contactIndex] = contact;
      return [...state];
    } else {
      return [contact, ...state];
    }
  }

  if (action.type === "DELETE_CONTACT") {
    const contactId = action.payload;

    const contactIndex = state.findIndex((c) => c.id === contactId);
    if (contactIndex !== -1) {
      state.splice(contactIndex, 1);
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
  actionButton: {
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
  contactRow: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(1, 1.5),
    marginBottom: theme.spacing(0.25),
    borderRadius: 6,
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
    transition: "all 0.2s ease",
    minHeight: 52,
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
      borderColor: theme.palette.primary.main,
    },
  },
  contactInfo: {
    display: "flex",
    alignItems: "center",
    flex: 1,
    gap: theme.spacing(1.5),
  },
  avatar: {
    width: 36,
    height: 36,
    backgroundColor: "#e0e0e0",
    fontSize: "0.875rem",
    fontWeight: 500,
    color: "#757575",
    "& .MuiSvgIcon-root": {
      fontSize: "1.25rem",
      color: "#757575",
    },
  },
  /* contactDetails: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2),
  }, */
  
  contactDetails: {
  flex: 1,
  minWidth: 0,
  display: "grid",
  gridTemplateColumns: "minmax(250px, 1fr) 250px 250px",
  alignItems: "center",
  gap: theme.spacing(2),
},
  contactName: {
    fontWeight: 400,
    fontSize: "0.875rem",
    color: theme.palette.text.primary,
    minWidth: 100,
    maxWidth: 180,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  contactData: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2.5),
    flexWrap: "nowrap",
  },
  contactItem: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    fontSize: "0.875rem",
    color: theme.palette.text.primary,
    whiteSpace: "nowrap",
    minWidth: 0,
    "& span": {
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
  },
  actionButtons: {
    display: "flex",
    gap: theme.spacing(0.5),
    transition: "opacity 0.2s ease",
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
  whatsappButton: {
    color: "#25D366",
    "&:hover": {
      backgroundColor: "rgba(37, 211, 102, 0.08)",
    },
  },
  whatsappIcon: {
    fontSize: 14,
    color: "#25D366",
  },
  emptyItem: {
    display: "block",
    width: "100%",
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
  contactCounter: {
    backgroundColor: theme.palette.action.hover,
    borderRadius: 12,
    padding: "2px 10px",
    fontSize: "0.8125rem",
    fontWeight: 500,
    color: theme.palette.text.secondary,
  },
  menuButton: {
    marginLeft: theme.spacing(1),
  },
  csvLink: {
    textDecoration: "none",
    color: "inherit",
  },
}));

const Contacts = () => {
  const classes = useStyles();
  const history = useHistory();
  const theme = useTheme();

  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchParam, setSearchParam] = useState("");
  const [contacts, dispatch] = useReducer(reducer, []);
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
  const [contactTicket, setContactTicket] = useState({});
  const [deletingContact, setDeletingContact] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [openModalImport, setOpenModalImport] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  // Sync mensagens
  const today = new Date().toISOString().slice(0, 10);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const [syncDialogOpen, setSyncDialogOpen] = useState(false);
  const [syncingContact, setSyncingContact] = useState(null);
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncDateFrom, setSyncDateFrom] = useState(thirtyDaysAgo);
  const [syncDateTo, setSyncDateTo] = useState(today);

  const handleOpenSyncDialog = (contact) => {
    setSyncingContact(contact);
    setSyncDateFrom(thirtyDaysAgo);
    setSyncDateTo(today);
    setSyncDialogOpen(true);
  };

  const handleSyncMessages = async () => {
    if (!syncingContact) return;
    setSyncLoading(true);
    try {
      const { data } = await api.post(`/contacts/${syncingContact.id}/sync-messages`, {
        dateFrom: syncDateFrom,
        dateTo: syncDateTo,
      });
      toast.success(`${data.synced} mensagem(ns) sincronizada(s) para ${syncingContact.name}.`);
      setSyncDialogOpen(false);
    } catch (err) {
      toastError(err);
    }
    setSyncLoading(false);
  };

  const socketManager = useContext(SocketContext);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchContacts = async () => {
        try {
          const { data } = await api.get("/contacts/", {
            params: { searchParam, pageNumber },
          });
          dispatch({ type: "LOAD_CONTACTS", payload: data.contacts });
          setHasMore(data.hasMore);
          setLoading(false);
        } catch (err) {
          toastError(err);
        }
      };
      fetchContacts();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber]);

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    const socket = socketManager.getSocket(companyId);

    socket.on(`company-${companyId}-contact`, (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_CONTACTS", payload: data.contact });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_CONTACT", payload: +data.contactId });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [socketManager]);

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleOpenContactModal = () => {
    setSelectedContactId(null);
    setContactModalOpen(true);
  };

  const handleCloseContactModal = () => {
    setSelectedContactId(null);
    setContactModalOpen(false);
  };

  const handleCloseOrOpenTicket = (ticket) => {
    setNewTicketModalOpen(false);
    if (ticket !== undefined && ticket.uuid !== undefined) {
      history.push(`/tickets/${ticket.uuid}`);
    }
  };

  const hadleEditContact = (contactId) => {
    setSelectedContactId(contactId);
    setContactModalOpen(true);
  };

  const handleDeleteContact = async (contactId) => {
    try {
      await api.delete(`/contacts/${contactId}`);
      toast.success(i18n.t("contacts.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
    setDeletingContact(null);
    setSearchParam("");
    setPageNumber(1);
  };

  const handleimportContact = async () => {
    try {
      await api.post("/contacts/import");
      history.go(0);
    } catch (err) {
      toastError(err);
    }
  };

  const handleOpenImportModal = () => {
    setOpenModalImport(true);
    handleMenuClose();
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

  const handleCloseModalImport = () => {
    setOpenModalImport(false);
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name?.toLowerCase().includes(searchParam.toLowerCase()) ||
      contact.number?.toLowerCase().includes(searchParam.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchParam.toLowerCase())
  );

  return (
    <MainContainer className={classes.mainContainer}>
      <ImportContactsModal
        open={openModalImport}
        onClose={handleCloseModalImport}
      />
      <NewTicketModal
        modalOpen={newTicketModalOpen}
        initialContact={contactTicket}
        onClose={(ticket) => {
          handleCloseOrOpenTicket(ticket);
        }}
      />
      <ContactModal
        open={contactModalOpen}
        onClose={handleCloseContactModal}
        aria-labelledby="form-dialog-title"
        contactId={selectedContactId}
      />
      <ConfirmationModal
        title={
          deletingContact
            ? `${i18n.t("contacts.confirmationModal.deleteTitle")} ${
                deletingContact.name
              }?`
            : `${i18n.t("contacts.confirmationModal.importTitlte")}`
        }
        open={confirmOpen}
        onClose={setConfirmOpen}
        onConfirm={(e) =>
          deletingContact
            ? handleDeleteContact(deletingContact.id)
            : handleimportContact()
        }
      >
        {deletingContact
          ? `${i18n.t("contacts.confirmationModal.deleteMessage")}`
          : `${i18n.t("contacts.confirmationModal.importMessage")}`}
      </ConfirmationModal>
      
      <MainHeader>
        <Box className={classes.headerContent}>
          <Title>{i18n.t("contacts.title")}</Title>
          {contacts.length > 0 && (
            <span className={classes.contactCounter}>{contacts.length}</span>
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
            onClick={handleOpenContactModal}
            startIcon={<AddIcon />}
            className={classes.actionButton}
            size="small"
          >
            {i18n.t("contacts.buttons.add")}
          </Button>

          <IconButton
            className={classes.menuButton}
            onClick={handleMenuClick}
            size="small"
          >
            <MoreVertIcon />
          </IconButton>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              style: {
                borderRadius: 8,
                marginTop: 8,
              },
            }}
          >
            <MenuItem onClick={handleOpenImportModal}>
              <PublishIcon fontSize="small" style={{ marginRight: 8 }} />
              {i18n.t("contacts.buttons.import")}
            </MenuItem>
            
            <CSVLink 
              className={classes.csvLink}
              separator=";" 
              filename={'contatos.csv'} 
              data={contacts.map((contact) => {
                const { display, valid } = formatContactNumber(contact.number);
                return {
                  nome: contact.name,
                  numero: display,
                  numero_valido: valid ? "sim" : "verificar",
                  email: contact.email,
                };
              })}
            >
              <MenuItem>
                <GetAppIcon fontSize="small" style={{ marginRight: 8 }} />
                {i18n.t("contacts.buttons.export")}
              </MenuItem>
            </CSVLink>
          </Menu>
        </MainHeaderButtonsWrapper>
      </MainHeader>
      
      <Paper
        className={classes.mainPaper}
        elevation={0}
        onScroll={handleScroll}
      >
        {filteredContacts.length === 0 && !loading ? (
          <Box className={classes.emptyState}>
            <ContactsIcon style={{ fontSize: 48, marginBottom: 16, opacity: 0.2 }} />
            <Typography variant="body1">
              {searchParam 
                ? i18n.t("contacts.noResults") || "Nenhum contato encontrado" 
                : i18n.t("contacts.noContacts") || "Nenhum contato cadastrado"}
            </Typography>
          </Box>
        ) : (
          <Box>
            {filteredContacts.map((contact, index) => (
              <Fade in={true} timeout={300 + index * 50} key={contact.id}>
                <Box className={classes.contactRow}>
                  <Box className={classes.contactInfo}>
                    <Avatar 
                      src={contact.profilePicUrl} 
                      className={classes.avatar}
                    >
                      {!contact.profilePicUrl && getInitials(contact.name)}
                    </Avatar>
                    
                    <Box className={classes.contactDetails}>
                      <Typography className={classes.contactName}>
                        {contact.name}
                      </Typography>
                      
                      {contact.number ? (() => {
                        const { display, valid, isGroup } = formatContactNumber(contact.number);
                        return (
                          <Box className={classes.contactItem}>
                            <WhatsAppIcon className={classes.whatsappIcon} />
                            <span style={{ color: valid || isGroup ? "inherit" : "#f59e0b" }}>
                              {display}
                            </span>
                            {!valid && !isGroup && (
                              <Tooltip title="Número incorreto. O formato obrigatório é DDI + DDD + Número (ex: 5511999999999). Edite o contato e corrija." placement="top" arrow>
                                <span style={{ marginLeft: 4, cursor: "help", fontSize: 13 }}>⚠️</span>
                              </Tooltip>
                            )}
                          </Box>
                        );
                      })() : (
                        <Box className={classes.emptyItem} />
                      )}
                      
                      {contact.email ? (
                        <Box className={classes.contactItem}>
                          <EmailIcon style={{ fontSize: 14 }} />
                          <span>{contact.email}</span>
                        </Box>
                      ) : (
                        <Box className={classes.emptyItem} />
                      )}
                    </Box>
                  </Box>

                  <Box className={classes.actionButtons}>
                    <Tooltip title={i18n.t("contacts.buttons.message")} placement="top" arrow>
                      <IconButton
                        size="small"
                        className={`${classes.iconButton} ${classes.whatsappButton}`}
                        onClick={() => {
                          setContactTicket(contact);
                          setNewTicketModalOpen(true);
                        }}
                      >
                        <WhatsAppIcon />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Sincronizar mensagens" placement="top" arrow>
                      <IconButton
                        size="small"
                        className={classes.iconButton}
                        onClick={() => handleOpenSyncDialog(contact)}
                      >
                        <SyncIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title={i18n.t("contacts.buttons.edit")} placement="top" arrow>
                      <IconButton
                        size="small"
                        className={classes.iconButton}
                        onClick={() => hadleEditContact(contact.id)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>

                    <Can
                      role={user.profile}
                      perform="contacts-page:deleteContact"
                      yes={() => (
                        <Tooltip title={i18n.t("contacts.buttons.delete")} placement="top" arrow>
                          <IconButton
                            size="small"
                            className={classes.iconButton}
                            onClick={(e) => {
                              setConfirmOpen(true);
                              setDeletingContact(contact);
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
            <CircularProgress size={32} />
          </Box>
        )}
      </Paper>

      {/* Dialog sincronizar mensagens */}
      <Dialog open={syncDialogOpen} onClose={() => !syncLoading && setSyncDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle style={{ paddingBottom: 8 }}>
          <Box display="flex" alignItems="center" style={{ gap: 8 }}>
            <SyncIcon style={{ fontSize: 20, color: "#6366f1" }} />
            Sincronizar mensagens
          </Box>
          {syncingContact && (
            <Typography variant="body2" style={{ color: "#6b7280", marginTop: 2 }}>
              {syncingContact.name} · {syncingContact.number}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" style={{ gap: 16, paddingTop: 4 }}>
            <TextField
              label="De"
              type="date"
              value={syncDateFrom}
              onChange={(e) => setSyncDateFrom(e.target.value)}
              variant="outlined"
              size="small"
              fullWidth
              InputLabelProps={{ shrink: true }}
              inputProps={{ max: syncDateTo }}
            />
            <TextField
              label="Até"
              type="date"
              value={syncDateTo}
              onChange={(e) => setSyncDateTo(e.target.value)}
              variant="outlined"
              size="small"
              fullWidth
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: syncDateFrom, max: today }}
            />
            <Typography variant="caption" style={{ color: "#9ca3af" }}>
              O WhatsApp disponibiliza histórico dos últimos 30–90 dias no servidor. Períodos mais antigos podem retornar 0 mensagens.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions style={{ padding: "12px 24px" }}>
          <Button onClick={() => setSyncDialogOpen(false)} disabled={syncLoading} size="small">
            Cancelar
          </Button>
          <Button
            onClick={handleSyncMessages}
            variant="contained"
            color="primary"
            size="small"
            disabled={syncLoading || !syncDateFrom || !syncDateTo}
            startIcon={syncLoading ? <CircularProgress size={14} color="inherit" /> : <SyncIcon />}
          >
            {syncLoading ? "Sincronizando…" : "Sincronizar"}
          </Button>
        </DialogActions>
      </Dialog>
    </MainContainer>
  );
};

export default Contacts;