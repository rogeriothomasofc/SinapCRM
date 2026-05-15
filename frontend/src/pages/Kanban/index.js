import React, { useState, useEffect, useContext } from "react";
import { makeStyles } from "@material-ui/core/styles";
import api from "../../services/api";
import { AuthContext } from "../../context/Auth/AuthContext";
import Board from "react-trello";
import { toast } from "react-toastify";
import { i18n } from "../../translate/i18n";
import { useHistory } from "react-router-dom";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";

const backendUrl = (process.env.REACT_APP_BACKEND_URL || "").replace(/\/$/, "");

const AVATAR_COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#ef4444",
  "#f97316", "#22c55e", "#14b8a6", "#3b82f6",
];

const getAvatarColor = (name = "") => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const isGroup = (number = "") => number.length >= 18;

const formatPhone = (number = "") => {
  if (!number || number.length >= 18) return null;
  if (/^55\d{10,11}$/.test(number)) {
    const ddd = number.slice(2, 4);
    const phone = number.slice(4);
    const fmt = phone.length === 9
      ? `${phone.slice(0, 5)}-${phone.slice(5)}`
      : `${phone.slice(0, 4)}-${phone.slice(4)}`;
    return `+55 (${ddd}) ${fmt}`;
  }
  // Número não reconhecido — não exibe no card
  return null;
};

const formatRelativeTime = (dateStr) => {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "agora";
  if (mins < 60) return `${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(dateStr).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
};

// Detecta tipo da última mensagem e retorna ícone + texto
const parseLastMessage = (msg = "") => {
  if (!msg) return { icon: "💬", text: "Sem mensagens" };
  const lower = msg.toLowerCase();
  if (lower.includes("audio") || lower.includes("áudio") || lower.includes("ptt"))
    return { icon: "🎤", text: "Áudio" };
  if (lower.includes("imagem") || lower.includes("image") || lower.includes("foto"))
    return { icon: "🖼️", text: "Imagem" };
  if (lower.includes("vídeo") || lower.includes("video"))
    return { icon: "🎥", text: "Vídeo" };
  if (lower.includes("document") || lower.includes("arquivo") || lower.includes("pdf"))
    return { icon: "📄", text: "Documento" };
  if (lower.includes("sticker"))
    return { icon: "🎭", text: "Sticker" };
  return { icon: null, text: msg };
};

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    overflow: "hidden",
  },
  boardWrapper: {
    flex: 1,
    overflow: "auto",
    padding: theme.spacing(1.5),
    backgroundColor: theme.palette.type === "dark" ? "#13131f" : "#eef0f4",
    "& .react-trello-board": {
      backgroundColor: "transparent",
      padding: 0,
      height: "100%",
    },
    "& .react-trello-lane": {
      backgroundColor: theme.palette.type === "dark" ? "#1e1e2e" : "#f8f9fb",
      borderRadius: 12,
      boxShadow: "none",
      border: `1px solid ${theme.palette.type === "dark" ? "rgba(255,255,255,0.06)" : "#e2e5ea"}`,
      marginRight: 12,
      minWidth: 260,
      maxWidth: 280,
      "& header": {
        borderBottom: `1px solid ${theme.palette.type === "dark" ? "rgba(255,255,255,0.07)" : "#e8eaed"}`,
        borderRadius: "12px 12px 0 0",
        padding: "12px 14px",
        "& .lane-header-name": {
          fontSize: 13,
          fontWeight: 700,
          color: theme.palette.type === "dark" ? "#e5e7eb" : "#111827",
          fontFamily: theme.typography.fontFamily,
        },
        "& .lane-header-label": {
          backgroundColor: theme.palette.type === "dark" ? "rgba(99,102,241,0.25)" : "#ede9fe",
          color: theme.palette.type === "dark" ? "#a5b4fc" : "#7c3aed",
          borderRadius: 20,
          padding: "1px 9px",
          fontSize: 11,
          fontWeight: 700,
        },
      },
      "& .lane-footer": { display: "none" },
      "& article.react-trello-card": {
        backgroundColor: theme.palette.type === "dark" ? "#252538" : "#ffffff",
        borderRadius: 10,
        border: `1px solid ${theme.palette.type === "dark" ? "rgba(255,255,255,0.06)" : "#e8eaed"}`,
        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
        padding: 0,
        margin: "6px 8px",
        cursor: "pointer",
        transition: "box-shadow 0.15s, border-color 0.15s",
        "&:hover": {
          boxShadow: "0 4px 14px rgba(0,0,0,0.10)",
          borderColor: theme.palette.primary.main,
        },
        "& header": { display: "none" },
        "& .card-description": { width: "100%" },
      },
    },
    "&::-webkit-scrollbar": { height: 6, width: 6 },
    "&::-webkit-scrollbar-thumb": {
      background: theme.palette.type === "dark" ? "#3a3a50" : "#c7cdd4",
      borderRadius: 6,
    },
  },

  // Card interno
  card: {
    display: "flex",
    flexDirection: "column",
  },
  cardBody: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    padding: "10px 12px 8px",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: "50%",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 16,
    fontWeight: 700,
    color: "#fff",
    overflow: "hidden",
    boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
  },
  avatarImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  nameRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 4,
  },
  name: {
    fontSize: 13,
    fontWeight: 700,
    color: theme.palette.type === "dark" ? "#f1f5f9" : "#0f172a",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    flex: 1,
  },
  time: {
    fontSize: 10,
    color: theme.palette.type === "dark" ? "#6b7280" : "#9ca3af",
    flexShrink: 0,
    whiteSpace: "nowrap",
  },
  subRow: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    marginTop: 2,
  },
  ticketId: {
    fontSize: 10,
    color: "#9ca3af",
    fontWeight: 500,
    flexShrink: 0,
  },
  queuePill: {
    fontSize: 10,
    fontWeight: 700,
    borderRadius: 20,
    padding: "1px 7px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: 100,
  },
  groupPill: {
    fontSize: 10,
    fontWeight: 700,
    borderRadius: 20,
    padding: "1px 7px",
    backgroundColor: theme.palette.type === "dark" ? "rgba(234,179,8,0.2)" : "#fef9c3",
    color: "#b45309",
    flexShrink: 0,
  },
  lastMsg: {
    marginTop: 4,
    fontSize: 12,
    color: theme.palette.type === "dark" ? "#94a3b8" : "#64748b",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "flex",
    alignItems: "center",
    gap: 4,
  },
  cardFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "6px 12px 8px",
    borderTop: `1px solid ${theme.palette.type === "dark" ? "rgba(255,255,255,0.05)" : "#f1f5f9"}`,
  },
  assignee: {
    fontSize: 11,
    color: theme.palette.type === "dark" ? "#818cf8" : "#6366f1",
    fontWeight: 500,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "65%",
    display: "flex",
    alignItems: "center",
    gap: 3,
  },
  button: {
    background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
    border: "none",
    padding: "6px 0",
    color: "white",
    fontWeight: 600,
    borderRadius: "0 0 10px 10px",
    fontSize: 12,
    cursor: "pointer",
    width: "100%",
    letterSpacing: 0.2,
    transition: "opacity 0.15s",
    "&:hover": { opacity: 0.88 },
  },
}));

const KanbanCard = ({ ticket, onView, classes }) => {
  const [imgError, setImgError] = useState(false);

  const avatarColor = getAvatarColor(ticket.contact.name);
  const initial = (ticket.contact.name || "?").charAt(0).toUpperCase();
  const queueColor = ticket.queue?.color;
  const queueName = ticket.queue?.name;
  const assigneeName = ticket.user?.name;
  const timeAgo = formatRelativeTime(ticket.updatedAt);
  const group = isGroup(ticket.contact.number);
  const { icon: msgIcon, text: msgText } = parseLastMessage(ticket.lastMessage);

  const rawPic = ticket.contact.profilePicUrl;
  const picUrl = !imgError && rawPic && !rawPic.includes("nopicture")
    ? rawPic.startsWith("http") ? rawPic : `${backendUrl}${rawPic}`
    : null;

  const noName = ticket.contact.name === ticket.contact.number;
  const displayName = group
    ? (noName ? `Grupo ${ticket.contact.number.slice(-6)}` : ticket.contact.name)
    : ticket.contact.businessName && ticket.contact.businessName !== ticket.contact.name
      ? ticket.contact.businessName
      : noName
        ? formatPhone(ticket.contact.number) || ticket.contact.number
        : ticket.contact.name;

  // Subtítulo: para grupos mostra "Grupo" + nome do contato se tiver; para pessoas mostra o número formatado
  const subtitle = group
    ? (!noName ? ticket.contact.name : null)
    : (noName ? null : formatPhone(ticket.contact.number));

  return (
    <div className={classes.card}>
      <div className={classes.cardBody}>
        {/* Avatar */}
        <div className={classes.avatar} style={{ backgroundColor: picUrl ? "transparent" : avatarColor }}>
          {picUrl
            ? <img src={picUrl} alt={displayName} className={classes.avatarImg} onError={() => setImgError(true)} />
            : initial}
        </div>

        {/* Info */}
        <div className={classes.info}>
          {/* Nome + tempo */}
          <div className={classes.nameRow}>
            <span className={classes.name}>{displayName}</span>
            <span className={classes.time}>{timeAgo}</span>
          </div>

          {/* Ticket ID + fila + grupo */}
          <div className={classes.subRow}>
            <span className={classes.ticketId}>#{ticket.id}</span>
            {group && <span className={classes.groupPill}>Grupo</span>}
            {queueName && (
              <span
                className={classes.queuePill}
                style={{
                  backgroundColor: queueColor ? queueColor + "22" : "#e0e7ff",
                  color: queueColor || "#6366f1",
                }}
              >
                {queueName}
              </span>
            )}
          </div>

          {/* Subtítulo: número formatado ou nome do remetente no grupo */}
          {subtitle && (
            <div className={classes.lastMsg} style={{ fontStyle: "normal", marginTop: 2, fontSize: 11, color: "#9ca3af" }}>
              {group ? "👤 " : "📱 "}{subtitle}
            </div>
          )}

          {/* Última mensagem */}
          <div className={classes.lastMsg}>
            {msgIcon && <span>{msgIcon}</span>}
            <span>{msgText}</span>
          </div>
        </div>
      </div>

      {/* Rodapé: atendente */}
      <div className={classes.cardFooter}>
        <span className={classes.assignee}>
          {assigneeName ? <>👤 {assigneeName}</> : <span style={{ color: "#9ca3af" }}>Sem atendente</span>}
        </span>
      </div>

      {/* Botão */}
      <button className={classes.button} onClick={() => onView(ticket.uuid)}>
        {i18n.t("kanban.seeTicket")}
      </button>
    </div>
  );
};

const Kanban = () => {
  const classes = useStyles();
  const history = useHistory();

  const [tags, setTags] = useState([]);
  const [file, setFile] = useState({ lanes: [] });
  const [tickets, setTickets] = useState([]);
  const { user } = useContext(AuthContext);
  const { profile } = user;
  const jsonString = user.queues.map((queue) => queue.UserQueue.queueId);

  const fetchTags = async () => {
    try {
      const response = await api.get("/tags/kanban");
      setTags(response.data.lista ?? []);
      await fetchTickets(jsonString);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => { fetchTags(); }, []);

  const fetchTickets = async (ids) => {
    try {
      const { data } = await api.get("/ticket/kanban", {
        params: { queueIds: JSON.stringify(ids), showAll: profile === "admin" },
      });
      setTickets(data.tickets);
    } catch (err) {
      console.log(err);
      setTickets([]);
    }
  };

  const handleView = (uuid) => history.push("/tickets/" + uuid);

  const buildCard = (ticket) => ({
    id: ticket.id.toString(),
    label: "",
    title: "",
    draggable: true,
    description: <KanbanCard ticket={ticket} onView={handleView} classes={classes} />,
  });

  const popularCards = () => {
    const open = tickets.filter((t) => t.tags.length === 0);
    const lanes = [
      {
        id: "lane0",
        title: i18n.t("kanban.open"),
        label: open.length.toString(),
        cards: open.map(buildCard),
        style: { borderTop: "3px solid #3b82f6" },
      },
      ...tags.map((tag) => {
        const tagged = tickets.filter((t) => t.tags.map((tg) => tg.id).includes(tag.id));
        return {
          id: tag.id.toString(),
          title: tag.name,
          label: tagged.length.toString(),
          cards: tagged.map(buildCard),
          style: { borderTop: `3px solid ${tag.color}` },
          labelStyle: { backgroundColor: tag.color + "25", color: tag.color },
        };
      }),
    ];
    setFile({ lanes });
  };

  useEffect(() => { popularCards(); }, [tags, tickets]);

  const handleCardMove = async (cardId, sourceLaneId, targetLaneId) => {
    try {
      await api.delete(`/ticket-tags/${targetLaneId}`);
      toast.success(i18n.t("kanban.toasts.removed"));
      await api.put(`/ticket-tags/${targetLaneId}/${sourceLaneId}`);
      toast.success(i18n.t("kanban.toasts.added"));
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <MainContainer className={classes.root}>
      <MainHeader>
        <Title>Kanban</Title>
      </MainHeader>
      <div className={classes.boardWrapper}>
        <Board
          data={file}
          onCardMoveAcrossLanes={handleCardMove}
          style={{ backgroundColor: "transparent" }}
        />
      </div>
    </MainContainer>
  );
};

export default Kanban;
