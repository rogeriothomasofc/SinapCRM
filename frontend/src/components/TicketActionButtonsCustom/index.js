import React, { useContext, useState, useEffect, useRef } from "react";
import { useHistory } from "react-router-dom";

import { makeStyles, createTheme, ThemeProvider } from "@material-ui/core/styles";
import {
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemText,
  Divider,
  Typography
} from "@material-ui/core";
import {
  Replay,
  CheckCircle,
  Reply,
  AccountTree,
  Event,
  SwapHoriz,
  DeleteOutline
} from "@material-ui/icons";

import { green } from "@material-ui/core/colors";
import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import ButtonWithSpinner from "../ButtonWithSpinner";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import { TicketsContext } from "../../context/Tickets/TicketsContext";
import { Can } from "../Can";
import ConfirmationModal from "../ConfirmationModal";
import TransferTicketModalCustom from "../TransferTicketModalCustom";
import ScheduleModal from "../ScheduleModal";

const useStyles = makeStyles(theme => ({
  actionButtonsContainer: {
    display: "flex",
    alignItems: "center",
    marginLeft: "auto",
    padding: theme.spacing(1),
  },
  actionButtons: {
    display: "flex",
    alignItems: "center",
    "& > *": {
      margin: theme.spacing(0.5),
    },
  },
  iconButton: {
    "& .MuiSvgIcon-root": { fontSize: "1.4rem" },
  },
  returnButton: {
    color: theme.palette.type === "dark" ? theme.palette.grey[400] : theme.palette.grey[700],
  },
  resolveButton: {
    color: theme.palette.type === "dark" ? green[400] : green[600],
  },
  deleteButton: {
    color: theme.palette.error.main,
  },
  tooltips: {
    fontSize: "14px",
    backgroundColor: theme.palette.primary.dark,
    color: "#fff",
  },
}));

const TicketActionButtonsCustom = ({ ticket }) => {
  const classes = useStyles();
  const history = useHistory();
  const isMounted = useRef(true);
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);
  const { setCurrentTicket } = useContext(TicketsContext);

  // Setor menu
  const [queueAnchorEl, setQueueAnchorEl] = useState(null);
  const [queues, setQueues] = useState([]);

  // Modals
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);

  useEffect(() => {
    isMounted.current = true;
    api.get("/queue").then(({ data }) => { if (isMounted.current) setQueues(data); }).catch(() => {});
    return () => { isMounted.current = false; };
  }, []);

  const customTheme = createTheme({ palette: { primary: green } });

  const handleUpdateTicketStatus = async (e, status, userId) => {
    setLoading(true);
    try {
      await api.put(`/tickets/${ticket.id}`, {
        status,
        userId: userId || null,
        useIntegration: status === "closed" ? false : ticket.useIntegration,
        promptId: status === "closed" ? false : ticket.promptId,
        integrationId: status === "closed" ? false : ticket.integrationId,
      });
      setLoading(false);
      if (status === "open") {
        setCurrentTicket({ ...ticket, code: "#open" });
      } else {
        setCurrentTicket({ id: null, code: null });
        history.push("/tickets");
      }
    } catch (err) {
      setLoading(false);
      toastError(err);
    }
  };

  const handleSelectQueue = async (queueId) => {
    setQueueAnchorEl(null);
    setLoading(true);
    try {
      await api.put(`/tickets/${ticket.id}`, { queueId: queueId || null });
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTicket = async () => {
    try {
      await api.delete(`/tickets/${ticket.id}`);
    } catch (err) {
      toastError(err);
    }
  };

  const renderClosedTicketButtons = () => (
    <ButtonWithSpinner
      loading={loading}
      startIcon={<Replay style={{ fontSize: "1.2rem" }} />}
      size="small"
      variant="outlined"
      color="primary"
      onClick={e => handleUpdateTicketStatus(e, "open", user?.id)}
    >
      {i18n.t("messagesList.header.buttons.reopen")}
    </ButtonWithSpinner>
  );

  const renderPendingTicketButtons = () => (
    <ButtonWithSpinner
      loading={loading}
      size="small"
      variant="contained"
      color="primary"
      onClick={e => handleUpdateTicketStatus(e, "open", user?.id)}
    >
      {i18n.t("messagesList.header.buttons.accept")}
    </ButtonWithSpinner>
  );

  const renderOpenTicketButtons = () => (
    <>
      {/* Setor */}
      <Tooltip title="Setor" classes={{ tooltip: classes.tooltips }}>
        <IconButton
          size="small"
          onClick={e => setQueueAnchorEl(e.currentTarget)}
          disabled={loading}
          className={classes.iconButton}
          style={{ color: ticket.queue?.color || "#888" }}
        >
          <AccountTree />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={queueAnchorEl}
        open={Boolean(queueAnchorEl)}
        onClose={() => setQueueAnchorEl(null)}
        getContentAnchorEl={null}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <MenuItem disabled>
          <Typography variant="caption" color="textSecondary">Selecionar setor</Typography>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleSelectQueue(null)}>
          <ListItemText primary="Sem setor" primaryTypographyProps={{ style: { fontSize: "0.85rem", color: "#888" } }} />
        </MenuItem>
        {queues.map(q => (
          <MenuItem
            key={q.id}
            selected={ticket.queueId === q.id}
            onClick={() => handleSelectQueue(q.id)}
          >
            <span style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: q.color, display: "inline-block", marginRight: 8, flexShrink: 0 }} />
            <ListItemText primary={q.name} primaryTypographyProps={{ style: { fontSize: "0.85rem" } }} />
          </MenuItem>
        ))}
      </Menu>

      {/* Agendamento */}
      <Tooltip title={i18n.t("ticketOptionsMenu.schedule")} classes={{ tooltip: classes.tooltips }}>
        <IconButton
          size="small"
          onClick={() => setScheduleModalOpen(true)}
          disabled={loading}
          className={classes.iconButton}
        >
          <Event />
        </IconButton>
      </Tooltip>

      {/* Transferir */}
      <Tooltip title={i18n.t("ticketOptionsMenu.transfer")} classes={{ tooltip: classes.tooltips }}>
        <IconButton
          size="small"
          onClick={() => setTransferModalOpen(true)}
          disabled={loading}
          className={classes.iconButton}
        >
          <SwapHoriz />
        </IconButton>
      </Tooltip>

      {/* Retornar */}
      <Tooltip title={i18n.t("messagesList.header.buttons.return")} classes={{ tooltip: classes.tooltips }}>
        <IconButton
          onClick={e => handleUpdateTicketStatus(e, "pending", null)}
          className={`${classes.returnButton} ${classes.iconButton}`}
          disabled={loading}
          size="small"
        >
          <Reply />
        </IconButton>
      </Tooltip>

      {/* Resolver */}
      <ThemeProvider theme={customTheme}>
        <Tooltip title={i18n.t("messagesList.header.buttons.resolve")} classes={{ tooltip: classes.tooltips }}>
          <IconButton
            onClick={e => handleUpdateTicketStatus(e, "closed", user?.id)}
            color="primary"
            disabled={loading}
            className={`${classes.resolveButton} ${classes.iconButton}`}
            size="small"
          >
            <CheckCircle />
          </IconButton>
        </Tooltip>
      </ThemeProvider>

      {/* Excluir (só admin) */}
      <Can
        role={user.profile}
        perform="ticket-options:deleteTicket"
        yes={() => (
          <Tooltip title={i18n.t("ticketOptionsMenu.delete")} classes={{ tooltip: classes.tooltips }}>
            <IconButton
              size="small"
              onClick={() => setConfirmationOpen(true)}
              disabled={loading}
              className={`${classes.deleteButton} ${classes.iconButton}`}
            >
              <DeleteOutline />
            </IconButton>
          </Tooltip>
        )}
      />
    </>
  );

  return (
    <div className={classes.actionButtonsContainer}>
      <div className={classes.actionButtons}>
        {ticket.status === "closed" && renderClosedTicketButtons()}
        {ticket.status === "open" && renderOpenTicketButtons()}
        {ticket.status === "pending" && renderPendingTicketButtons()}
      </div>

      <ConfirmationModal
        title={`${i18n.t("ticketOptionsMenu.confirmationModal.title")}${ticket.id} ${i18n.t("ticketOptionsMenu.confirmationModal.titleFrom")} ${ticket.contact.name}?`}
        open={confirmationOpen}
        onClose={setConfirmationOpen}
        onConfirm={handleDeleteTicket}
      >
        {i18n.t("ticketOptionsMenu.confirmationModal.message")}
      </ConfirmationModal>

      <TransferTicketModalCustom
        modalOpen={transferModalOpen}
        onClose={() => { if (isMounted.current) setTransferModalOpen(false); }}
        ticketid={ticket.id}
      />

      <ScheduleModal
        open={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        aria-labelledby="form-dialog-title"
        contactId={ticket.contact?.id}
      />
    </div>
  );
};

export default TicketActionButtonsCustom;
