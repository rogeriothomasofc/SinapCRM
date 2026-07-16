import React, { useState, useEffect, useContext } from "react";
import { useHistory, useParams } from "react-router-dom";
import { parseISO, format, isSameDay } from "date-fns";
import {
  ListItem, ListItemText, ListItemAvatar, Avatar, Typography,
  Tooltip, IconButton, CircularProgress
} from "@material-ui/core";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import { PanTool, CheckCircle, Replay, Visibility, Android } from '@material-ui/icons';
import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import { AuthContext } from "../../context/Auth/AuthContext";
import { TicketsContext } from "../../context/Tickets/TicketsContext";
import toastError from "../../errors/toastError";
import { v4 as uuidv4 } from "uuid";
import TicketMessagesDialog from "../TicketMessagesDialog";

const useStyles = makeStyles((theme) => ({
  ticket: {
    position: "relative",
    padding: "5px 12px",
    cursor: "pointer",
    borderBottom: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
    transition: "background-color 0.2s ease",
    "&:hover": { 
      backgroundColor: theme.palette.type === 'dark' 
        ? theme.palette.grey[900] 
        : theme.palette.action.hover 
    },
    "&.selected": { 
      backgroundColor: theme.palette.type === 'dark'
        ? `${theme.palette.primary.dark}20`
        : `${theme.palette.primary.main}10`,
      borderLeft: `3px solid ${theme.palette.primary.main}`
    },
    minHeight: 50
  },
  customBadge: {
    position: "absolute",
    top: 3,
    left: 41,
    backgroundColor: "#f44336",
    color: "white",
    height: 16,
    minWidth: 16,
    fontSize: "0.65rem",
    fontWeight: 700,
    boxShadow: "0 2px 4px rgba(244, 67, 54, 0.4)",
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 3px",
    animation: "$pulse 2s infinite",
    zIndex: 1
  },
  "@keyframes pulse": {
    "0%": { transform: "scale(1)" },
    "50%": { transform: "scale(1.05)" },
    "100%": { transform: "scale(1)" }
  },
  avatar: {
    width: 38,
    height: 38,
    fontSize: "1rem"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2
  },
  contactName: {
    fontWeight: 600,
    fontSize: "0.95rem",
    display: "flex",
    alignItems: "center",
    gap: 4,
    lineHeight: 1.2
  },
  time: {
    fontSize: "0.8rem",
    color: theme.palette.text.disabled
  },
  lastMessage: {
    fontSize: "0.85rem",
    color: theme.palette.text.secondary,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    lineHeight: 1.2
  },
  tags: {
    display: "flex",
    gap: 3,
    marginTop: 3,
    flexWrap: "wrap"
  },
  tag: {
    fontSize: "0.7rem",
    padding: "1px 4px",
    borderRadius: 4,
    fontWeight: 600,
    lineHeight: 1.3,
    display: "inline-block",
    border: theme.palette.type === 'dark' ? "1px solid rgba(255,255,255,0.1)" : "none"
  },
  actions: {
    position: "absolute",
    right: 6,
    bottom: 6,
    display: "flex",
    gap: 3
  },
  actionBtn: {
    padding: 3,
    backgroundColor: theme.palette.type === 'dark' 
      ? theme.palette.grey[800] 
      : theme.palette.primary.main,
    color: "white",
    border: theme.palette.type === 'dark' 
      ? `1px solid ${theme.palette.primary.main}40` 
      : 'none',
    transition: "all 0.2s ease",
    "&:hover": { 
      backgroundColor: theme.palette.type === 'dark'
        ? theme.palette.primary.main
        : theme.palette.primary.dark,
      color: "white !important",
      transform: "scale(1.1)",
      boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
      "& .MuiSvgIcon-root": {
        color: "white !important"
      }
    },
    "& .MuiSvgIcon-root": {
      color: theme.palette.type === 'dark' 
        ? theme.palette.primary.light 
        : "white",
    }
  },
  resolveBtn: {
    padding: 3,
    color: theme.palette.type === 'dark' ? green[400] : green[600],
    transition: "all 0.2s ease",
    "&:hover": {
      backgroundColor: theme.palette.type === 'dark' ? "rgba(76,175,80,0.12)" : "rgba(56,142,60,0.08)",
      transform: "scale(1.1)",
    },
    "& .MuiSvgIcon-root": { color: theme.palette.type === 'dark' ? green[400] : green[600] }
  },
  icon: {
    fontSize: "1rem"
  },
  visibilityIcon: {
    fontSize: "1rem",
    opacity: 0.7,
    transition: "opacity 0.2s",
    cursor: "pointer",
    "&:hover": {
      opacity: 1
    }
  },
  androidIcon: {
    fontSize: "0.9rem",
    color: "#ff9800",
    marginLeft: 4
  },
  listItemAvatar: {
    minWidth: 48
  }
}));

const TicketListItemCustom = ({ ticket }) => {
  const classes = useStyles();
  const theme = useTheme();
  const history = useHistory();
  const { ticketId } = useParams();
  const { user } = useContext(AuthContext);
  const { setCurrentTicket } = useContext(TicketsContext);
  
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  const handleAction = async (action, id) => {
    setLoading(true);
    try {
      const statusMap = { accept: "open", close: "closed", reopen: "open" };
      await api.put(`/tickets/${id}`, {
        status: statusMap[action],
        userId: user?.id,
        queueId: ticket?.queue?.id
      });
      
      if (action === "accept") {
        const { data } = await api.get("/settings/");
        const setting = data.find(s => s.key === "sendGreetingAccepted");
        if (setting?.value === "enabled" && !ticket.isGroup) {
          await api.post(`/messages/${id}`, {
            read: 1,
            fromMe: true,
            mediaUrl: "",
            body: `*Mensagem Automática:*\n{{ms}} *{{name}}*, meu nome é *${user?.name}* e agora vou prosseguir com seu atendimento!`
          });
        }
      }
      
      history.push(action === "close" ? `/tickets/` : `/tickets/${ticket.uuid}`);
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    if (ticket.status === "pending") return;
    setCurrentTicket({ id: ticket.id, uuid: ticket.uuid, code: uuidv4() });
    history.push(`/tickets/${ticket.uuid}`);
  };

  const isSelected = ticketId && +ticketId === ticket.id;
  const { contact, unreadMessages, updatedAt, lastMessage, whatsapp, user: ticketUser, queue, tags = [] } = ticket;

  return (
    <>
      <ListItem
        button
        onClick={handleClick}
        className={`${classes.ticket} ${isSelected ? 'selected' : ''}`}
      >
        {loading && <CircularProgress size={16} style={{ position: 'absolute', top: '50%', left: '50%', marginTop: -8, marginLeft: -8 }} />}
        
        {unreadMessages > 0 && (
          <div 
            className={classes.customBadge}
            style={unreadMessages > 9 ? { 
              animation: "pulse 1s infinite",
              backgroundColor: "#d32f2f",
              transform: "scale(1.1)"
            } : {}}
          >
            {unreadMessages > 99 ? '99+' : unreadMessages}
          </div>
        )}
        
        <ListItemAvatar className={classes.listItemAvatar}>
          <Avatar src={contact?.profilePicUrl} className={classes.avatar}>{contact?.name?.charAt(0).toUpperCase()}</Avatar>
        </ListItemAvatar>
        
        <ListItemText
          disableTypography
          primary={
            <div className={classes.header}>
              <Typography className={classes.contactName}>
                {contact.name}
                {ticket.chatbot && <Android className={classes.icon} style={{ color: "#ff9800", fontSize: "0.9rem" }} />}
                {user.profile === "admin" && (
                  <Visibility
                    className={classes.icon}
                    style={{ cursor: "pointer", fontSize: "0.95rem" }}
                    onClick={(e) => { e.stopPropagation(); setOpenDialog(true); }}
                  />
                )}
              </Typography>
              <Typography className={classes.time}>
                {isSameDay(parseISO(updatedAt), new Date()) 
                  ? format(parseISO(updatedAt), "HH:mm")
                  : format(parseISO(updatedAt), "dd/MM")}
              </Typography>
            </div>
          }
          secondary={
            <>
              <Typography className={classes.lastMessage}>
                {lastMessage.includes('data:image/png;base64') ? (
                  '📍 Localização'
                ) : (
                  (() => {
                    // Verifica se é uma mensagem com formatação de assinatura (asteriscos)
                    const asteriskPattern = /\*([^*]+)\*/g;
                    if (asteriskPattern.test(lastMessage)) {
                      // Remove todos os asteriscos e renderiza em negrito
                      return <strong>{lastMessage.replace(/\*/g, '')}</strong>;
                    }
                    return lastMessage;
                  })()
                )}
              </Typography>
              
              <div className={classes.tags}>
                {whatsapp?.name && (
                  <span className={classes.tag} style={{ backgroundColor: "#25D36620", color: "#128C7E" }}>
                    {whatsapp.name}
                  </span>
                )}
                {ticketUser?.name && ticket.status !== "pending" && (
                  <span className={classes.tag} style={{ backgroundColor: "#e1bee7", color: "#6a1b9a" }}>
                    {ticketUser.name}
                  </span>
                )}
                {queue?.name && (
                  <span className={classes.tag} style={{ 
                    backgroundColor: queue.color ? `${queue.color}15` : "#f5f5f5",
                    color: queue.color || "#616161"
                  }}>
                    {queue.name}
                  </span>
                )}
                {tags.slice(0, 2).map(tag => (
                  <span key={tag.id} className={classes.tag} style={{
                    backgroundColor: tag.color ? `${tag.color}15` : "#f5f5f5",
                    color: tag.color || "#616161"
                  }}>
                    {tag.name}
                  </span>
                ))}
                {tags.length > 2 && <span className={classes.tag} style={{ backgroundColor: "#f5f5f5", color: "#616161" }}>+{tags.length - 2}</span>}
              </div>
            </>
          }
        />
        
        <div className={classes.actions}>
          {ticket.status === "pending" && (
            <Tooltip title={i18n.t("ticketsList.buttons.accept")}>
              <IconButton
                size="small"
                className={classes.actionBtn}
                onClick={(e) => { e.stopPropagation(); handleAction("accept", ticket.id); }}
              >
                <PanTool style={{ fontSize: "0.75rem" }} />
              </IconButton>
            </Tooltip>
          )}
          
          {ticket.status !== "closed" && ticket.status !== "pending" && (
            <Tooltip title={i18n.t("ticketsList.buttons.closed")}>
              <IconButton
                size="small"
                className={classes.resolveBtn}
                onClick={(e) => { e.stopPropagation(); handleAction("close", ticket.id); }}
              >
                <CheckCircle style={{ fontSize: "1.1rem" }} />
              </IconButton>
            </Tooltip>
          )}
          
          {ticket.status === "closed" && (
            <Tooltip title={i18n.t("ticketsList.buttons.reopen")}>
              <IconButton
                size="small"
                className={classes.actionBtn}
                onClick={(e) => { e.stopPropagation(); handleAction("reopen", ticket.id); }}
              >
                <Replay className={classes.icon} />
              </IconButton>
            </Tooltip>
          )}
        </div>
      </ListItem>
      
      {openDialog && (
        <TicketMessagesDialog
          open={openDialog}
          handleClose={() => setOpenDialog(false)}
          ticketId={ticket.id}
        />
      )}
    </>
  );
};

export default TicketListItemCustom;