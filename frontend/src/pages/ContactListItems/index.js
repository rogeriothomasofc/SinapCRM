import React, {
  useState,
  useEffect,
  useReducer,
  useContext,
  useRef,
} from "react";

import { toast } from "react-toastify";
import { useParams, useHistory } from "react-router-dom";

import { makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import SearchIcon from "@material-ui/icons/Search";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";
import IconButton from "@material-ui/core/IconButton";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import EditIcon from "@material-ui/icons/Edit";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import BlockIcon from "@material-ui/icons/Block";
import PersonAddIcon from "@material-ui/icons/PersonAdd";
import Checkbox from "@material-ui/core/Checkbox";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import CircularProgress from "@material-ui/core/CircularProgress";
import Avatar from "@material-ui/core/Avatar";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";

import api from "../../services/api";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import ContactListItemModal from "../../components/ContactListItemModal";
import ConfirmationModal from "../../components/ConfirmationModal/";

import { i18n } from "../../translate/i18n";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import MainContainer from "../../components/MainContainer";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import { Can } from "../../components/Can";
import useContactLists from "../../hooks/useContactLists";
import { Grid } from "@material-ui/core";

import planilhaExemplo from "../../assets/planilha.xlsx";
import { SocketContext } from "../../context/Socket/SocketContext";

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
    padding: theme.spacing(1),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
  contactRow: {
    display: "flex",
    alignItems: "center",
    padding: "8px 4px",
    borderRadius: 8,
    cursor: "pointer",
    "&:hover": { backgroundColor: "rgba(103,58,183,0.06)" },
  },
  avatar: {
    width: 36,
    height: 36,
    fontSize: 14,
    backgroundColor: "#673AB7",
    marginRight: 12,
    flexShrink: 0,
  },
  contactName: { fontWeight: 500, fontSize: 14, lineHeight: 1.2 },
  contactNumber: { fontSize: 12, color: "#888" },
  selectedCount: {
    fontSize: 13,
    color: "#673AB7",
    fontWeight: 600,
    marginLeft: 8,
  },
}));

// ── Modal de seleção de contatos existentes ──────────────────────────────────
const SelectContactsModal = ({ open, onClose, contactListId, onAdded }) => {
  const classes = useStyles();
  const [search, setSearch] = useState("");
  const [allContacts, setAllContacts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSearch("");
    setSelected([]);
    setLoading(true);
    api
      .get("/contacts", { params: { pageNumber: 1, searchParam: "" } })
      .then(({ data }) => {
        setAllContacts(data.contacts || []);
        setFiltered(data.contacts || []);
      })
      .catch(toastError)
      .finally(() => setLoading(false));
  }, [open]);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      allContacts.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.number || "").includes(q)
      )
    );
  }, [search, allContacts]);

  const toggle = (contact) => {
    setSelected((prev) =>
      prev.find((c) => c.id === contact.id)
        ? prev.filter((c) => c.id !== contact.id)
        : [...prev, contact]
    );
  };

  const isSelected = (contact) => !!selected.find((c) => c.id === contact.id);

  const toggleAll = () => {
    if (selected.length === filtered.length) {
      setSelected([]);
    } else {
      setSelected([...filtered]);
    }
  };

  const handleConfirm = async () => {
    if (selected.length === 0) return;
    setSaving(true);
    try {
      await Promise.all(
        selected.map((c) =>
          api.post("/contact-list-items", {
            name: c.name,
            number: c.number,
            email: c.email || "",
            contactListId,
          })
        )
      );
      toast.success(`${selected.length} contato(s) adicionado(s) com sucesso!`);
      onAdded();
      onClose();
    } catch (err) {
      toastError(err);
    } finally {
      setSaving(false);
    }
  };

  const initials = (name) =>
    name
      ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
      : "?";

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <span>Selecionar Contatos</span>
          {selected.length > 0 && (
            <span className={classes.selectedCount}>
              {selected.length} selecionado(s)
            </span>
          )}
        </Box>
      </DialogTitle>
      <DialogContent dividers style={{ padding: "8px 16px" }}>
        <TextField
          fullWidth
          autoFocus
          placeholder="Buscar por nome ou número..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          variant="outlined"
          size="small"
          style={{ marginBottom: 8 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon style={{ color: "#aaa", fontSize: 18 }} />
              </InputAdornment>
            ),
          }}
        />
        {loading ? (
          <Box display="flex" justifyContent="center" padding={3}>
            <CircularProgress size={32} />
          </Box>
        ) : filtered.length === 0 ? (
          <Box display="flex" justifyContent="center" padding={3}>
            <Typography style={{ color: "#aaa" }}>Nenhum contato encontrado</Typography>
          </Box>
        ) : (
          <>
            <Box
              className={classes.contactRow}
              onClick={toggleAll}
              style={{ borderBottom: "1px solid #f0f0f0", marginBottom: 4 }}
            >
              <Checkbox
                checked={filtered.length > 0 && selected.length === filtered.length}
                indeterminate={selected.length > 0 && selected.length < filtered.length}
                color="primary"
                size="small"
              />
              <Typography style={{ fontSize: 13, color: "#555", fontWeight: 600 }}>
                Selecionar todos ({filtered.length})
              </Typography>
            </Box>
            <Box style={{ maxHeight: 340, overflowY: "auto" }}>
              {filtered.map((contact) => (
                <Box
                  key={contact.id}
                  className={classes.contactRow}
                  onClick={() => toggle(contact)}
                >
                  <Checkbox
                    checked={isSelected(contact)}
                    color="primary"
                    size="small"
                  />
                  <Avatar className={classes.avatar}>{initials(contact.name)}</Avatar>
                  <Box>
                    <Typography className={classes.contactName}>{contact.name}</Typography>
                    <Typography className={classes.contactNumber}>{contact.number}</Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </>
        )}
      </DialogContent>
      <DialogActions style={{ padding: "12px 16px" }}>
        <Button onClick={onClose} disabled={saving}>
          Cancelar
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="primary"
          disabled={selected.length === 0 || saving}
          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <PersonAddIcon />}
        >
          {saving ? "Adicionando..." : `Adicionar ${selected.length > 0 ? `(${selected.length})` : ""}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ── Página principal ──────────────────────────────────────────────────────────
const ContactListItems = () => {
  const classes = useStyles();

  const { user } = useContext(AuthContext);
  const { contactListId } = useParams();
  const history = useHistory();

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchParam, setSearchParam] = useState("");
  const [contacts, dispatch] = useReducer(reducer, []);
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [contactListItemModalOpen, setContactListItemModalOpen] = useState(false);
  const [selectContactsOpen, setSelectContactsOpen] = useState(false);
  const [deletingContact, setDeletingContact] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [contactList, setContactList] = useState({});
  const [refreshCount, setRefreshCount] = useState(0);
  const fileUploadRef = useRef(null);

  const { findById: findContactList } = useContactLists();
  const socketManager = useContext(SocketContext);

  useEffect(() => {
    findContactList(contactListId).then((data) => {
      setContactList(data);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contactListId]);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchContacts = async () => {
        try {
          const { data } = await api.get(`contact-list-items`, {
            params: { searchParam, pageNumber, contactListId },
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
  }, [searchParam, pageNumber, contactListId, refreshCount]);

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    const socket = socketManager.getSocket(companyId);

    socket.on(`company-${companyId}-ContactListItem`, (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_CONTACTS", payload: data.record });
      }
      if (data.action === "delete") {
        dispatch({ type: "DELETE_CONTACT", payload: +data.id });
      }
      if (data.action === "reload") {
        dispatch({ type: "LOAD_CONTACTS", payload: data.records });
      }
    });

    socket.on(`company-${companyId}-ContactListItem-${contactListId}`, (data) => {
      if (data.action === "reload") {
        dispatch({ type: "LOAD_CONTACTS", payload: data.records });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [contactListId, socketManager]);

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleOpenContactListItemModal = () => {
    setSelectedContactId(null);
    setContactListItemModalOpen(true);
  };

  const handleCloseContactListItemModal = () => {
    setSelectedContactId(null);
    setContactListItemModalOpen(false);
  };

  const hadleEditContact = (contactId) => {
    setSelectedContactId(contactId);
    setContactListItemModalOpen(true);
  };

  const handleDeleteContact = async (contactId) => {
    try {
      await api.delete(`/contact-list-items/${contactId}`);
      toast.success(i18n.t("contacts.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
    setDeletingContact(null);
    setSearchParam("");
    setPageNumber(1);
  };

  const handleImportContacts = async () => {
    try {
      const formData = new FormData();
      formData.append("file", fileUploadRef.current.files[0]);
      await api.request({
        url: `contact-lists/${contactListId}/upload`,
        method: "POST",
        data: formData,
      });
    } catch (err) {
      toastError(err);
    }
  };

  const handleAfterSelect = () => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
    setSearchParam("");
    setRefreshCount(c => c + 1);
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

  const goToContactLists = () => {
    history.push("/contact-lists");
  };

  return (
    <MainContainer className={classes.mainContainer}>
      <ContactListItemModal
        open={contactListItemModalOpen}
        onClose={handleCloseContactListItemModal}
        aria-labelledby="form-dialog-title"
        contactId={selectedContactId}
      />
      <SelectContactsModal
        open={selectContactsOpen}
        onClose={() => setSelectContactsOpen(false)}
        contactListId={contactListId}
        onAdded={handleAfterSelect}
      />
      <ConfirmationModal
        title={
          deletingContact
            ? `${i18n.t("contactListItems.confirmationModal.deleteTitle")} ${deletingContact.name}?`
            : `${i18n.t("contactListItems.confirmationModal.importTitlte")}`
        }
        open={confirmOpen}
        onClose={setConfirmOpen}
        onConfirm={() =>
          deletingContact
            ? handleDeleteContact(deletingContact.id)
            : handleImportContacts()
        }
      >
        {deletingContact ? (
          `${i18n.t("contactListItems.confirmationModal.deleteMessage")}`
        ) : (
          <>
            {i18n.t("contactListItems.confirmationModal.importMessage")}
            <a href={planilhaExemplo} download="planilha.xlsx">
              {i18n.t("contactListItems.download")}
            </a>
          </>
        )}
      </ConfirmationModal>
      <MainHeader>
        <Grid style={{ width: "99.6%" }} container>
          <Grid xs={12} sm={5} item>
            <Title>{contactList.name}</Title>
          </Grid>
          <Grid xs={12} sm={7} item>
            <Grid spacing={2} container>
              <Grid xs={12} sm={4} item>
                <TextField
                  fullWidth
                  placeholder={i18n.t("contactListItems.searchPlaceholder")}
                  type="search"
                  value={searchParam}
                  onChange={handleSearch}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon style={{ color: "gray" }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid xs={4} sm={2} item>
                <Button fullWidth variant="outlined" color="primary" onClick={goToContactLists}>
                  {i18n.t("contactListItems.buttons.lists")}
                </Button>
              </Grid>
              <Grid xs={4} sm={2} item>
                <Button
                  fullWidth
                  variant="outlined"
                  color="primary"
                  onClick={() => {
                    fileUploadRef.current.value = null;
                    fileUploadRef.current.click();
                  }}
                >
                  {i18n.t("contactListItems.buttons.import")}
                </Button>
              </Grid>
              <Grid xs={4} sm={4} item>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={() => setSelectContactsOpen(true)}
                  startIcon={<PersonAddIcon />}
                >
                  Adicionar
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </MainHeader>
      <Paper
        className={classes.mainPaper}
        variant="outlined"
        onScroll={handleScroll}
      >
        <>
          <input
            style={{ display: "none" }}
            id="upload"
            name="file"
            type="file"
            accept=".xls,.xlsx"
            onChange={() => setConfirmOpen(true)}
            ref={fileUploadRef}
          />
        </>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="center" style={{ width: "0%" }}>#</TableCell>
              <TableCell>{i18n.t("contactListItems.table.name")}</TableCell>
              <TableCell align="center">{i18n.t("contactListItems.table.number")}</TableCell>
              <TableCell align="center">{i18n.t("contactListItems.table.email")}</TableCell>
              <TableCell align="center">{i18n.t("contactListItems.table.actions")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <>
              {contacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell align="center" style={{ width: "0%" }}>
                    <IconButton>
                      {contact.isWhatsappValid ? (
                        <CheckCircleIcon titleAccess="Whatsapp Válido" htmlColor="green" />
                      ) : (
                        <BlockIcon titleAccess="Whatsapp Inválido" htmlColor="grey" />
                      )}
                    </IconButton>
                  </TableCell>
                  <TableCell>{contact.name}</TableCell>
                  <TableCell align="center">{contact.number}</TableCell>
                  <TableCell align="center">{contact.email}</TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => hadleEditContact(contact.id)}>
                      <EditIcon />
                    </IconButton>
                    <Can
                      role={user.profile}
                      perform="contacts-page:deleteContact"
                      yes={() => (
                        <IconButton
                          size="small"
                          onClick={() => {
                            setConfirmOpen(true);
                            setDeletingContact(contact);
                          }}
                        >
                          <DeleteOutlineIcon />
                        </IconButton>
                      )}
                    />
                  </TableCell>
                </TableRow>
              ))}
              {loading && <TableRowSkeleton columns={4} />}
            </>
          </TableBody>
        </Table>
      </Paper>
    </MainContainer>
  );
};

export default ContactListItems;
