import React, {
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { makeStyles } from "@material-ui/core/styles";
import toastError from "../../errors/toastError";
import {
  Badge,
  IconButton,
  List,
  ListItem,
  Paper,
  Typography,
  Box,
  Avatar,
  Divider,
  Fade,
  CircularProgress,
  Popover,
  useTheme,
  Chip,
} from "@material-ui/core";
import ForumIcon from "@material-ui/icons/Forum";
import GroupIcon from "@material-ui/icons/Group";
import NotificationsIcon from "@material-ui/icons/Notifications";
import DoneAllIcon from "@material-ui/icons/DoneAll";
import AccessTimeIcon from "@material-ui/icons/AccessTime";

import api from "../../services/api";
import { isArray } from "lodash";
import { SocketContext } from "../../context/Socket/SocketContext";
import { useDate } from "../../hooks/useDate";
import { AuthContext } from "../../context/Auth/AuthContext";

import notifySound from "../../assets/chat_notify.mp3";
import useSound from "use-sound";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles((theme) => ({
  popoverPaper: {
    width: 380,
    maxHeight: 480,
    overflow: "hidden",
    borderRadius: theme.spacing(1),
    boxShadow: theme.shadows[2],
  },
  header: {
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    borderBottom: `1px solid ${theme.palette.divider}`,
    position: "sticky",
    top: 0,
    zIndex: 10,
    borderTopLeftRadius: theme.spacing(1),
    borderTopRightRadius: theme.spacing(1),
  },
  headerTitle: {
    fontWeight: 600,
    fontSize: "1.125rem",
    color: theme.palette.text.primary,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  notificationCount: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    fontSize: "0.75rem",
    fontWeight: 600,
    padding: "2px 8px",
    borderRadius: theme.spacing(1),
    minWidth: 24,
    textAlign: "center",
  },
  chatList: {
    padding: 0,
    maxHeight: 400,
    overflowY: "auto",
    overflowX: "hidden",
    "&::-webkit-scrollbar": {
      width: "8px",
    },
    "&::-webkit-scrollbar-track": {
      backgroundColor: theme.palette.background.default,
      borderRadius: "4px",
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: theme.palette.action.disabled,
      borderRadius: "4px",
      "&:hover": {
        backgroundColor: theme.palette.action.active,
      },
    },
  },
  chatItem: {
    padding: theme.spacing(1.5, 2),
    cursor: "pointer",
    transition: "all 0.2s ease",
    borderBottom: `1px solid ${theme.palette.divider}`,
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
      transform: "translateX(4px)",
    },
    "&:last-child": {
      borderBottom: "none",
      borderBottomLeftRadius: theme.spacing(0),
      borderBottomRightRadius: theme.spacing(0),
    },
  },
  unreadItem: {
    backgroundColor: theme.palette.action.selected,
    borderLeft: `3px solid ${theme.palette.primary.main}`,
    paddingLeft: theme.spacing(1.625),
  },
  chatContent: {
    display: "flex",
    alignItems: "flex-start",
    gap: theme.spacing(1.5),
    width: "100%",
  },
  chatAvatar: {
    width: 40,
    height: 40,
    backgroundColor: theme.palette.primary.main,
    fontSize: "0.875rem",
  },
  chatInfo: {
    flex: 1,
    minWidth: 0,
  },
  chatHeader: {
    display: "flex",
    alignItems: "center",
    marginBottom: 4,
    gap: theme.spacing(0.5),
  },
  chatTitle: {
    fontWeight: 600,
    fontSize: "0.875rem",
    color: theme.palette.text.primary,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    flex: 1,
  },
  chatTime: {
    fontSize: "0.75rem",
    color: theme.palette.text.disabled,
    display: "flex",
    alignItems: "center",
    gap: 4,
  },
  chatMessage: {
    fontSize: "0.8125rem",
    color: theme.palette.text.secondary,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    display: "block",
    maxWidth: "100%",
  },
  messagePreview: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.5),
  },
  senderName: {
    fontWeight: 600,
    color: theme.palette.primary.main,
  },
  unreadBadge: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    fontSize: "0.7rem",
    height: 20,
    minWidth: 20,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 600,
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(6, 2),
    color: theme.palette.text.secondary,
    minHeight: 200,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: theme.spacing(2),
    opacity: 0.3,
  },
  iconButton: {
    color: "white",
    position: "relative",
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.1)",
    },
  },
  badge: {
    "& .MuiBadge-badge": {
      right: 3,
      top: 3,
      fontSize: "0.65rem",
      height: 16,
      minWidth: 16,
      padding: "0 4px",
    },
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    padding: theme.spacing(2),
  },
  footer: {
    padding: theme.spacing(1.5),
    borderTop: `1px solid ${theme.palette.divider}`,
    textAlign: "center",
    borderBottomLeftRadius: theme.spacing(1),
    borderBottomRightRadius: theme.spacing(1),
  },
  viewAllButton: {
    fontSize: "0.875rem",
    color: theme.palette.primary.main,
    cursor: "pointer",
    "&:hover": {
      textDecoration: "underline",
    },
  },
  onlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    backgroundColor: theme.palette.success.main,
    position: "absolute",
    bottom: 2,
    right: 2,
    border: `2px solid ${theme.palette.background.paper}`,
  },
}));

const reducer = (state, action) => {
  if (action.type === "LOAD_CHATS") {
    const chats = action.payload;
    const newChats = [];

    if (isArray(chats)) {
      chats.forEach((chat) => {
        const chatIndex = state.findIndex((u) => u.id === chat.id);
        if (chatIndex !== -1) {
          state[chatIndex] = chat;
        } else {
          newChats.push(chat);
        }
      });
    }

    return [...state, ...newChats];
  }

  if (action.type === "UPDATE_CHATS") {
    const chat = action.payload;
    const chatIndex = state.findIndex((u) => u.id === chat.id);

    if (chatIndex !== -1) {
      state[chatIndex] = chat;
      return [...state];
    } else {
      return [chat, ...state];
    }
  }

  if (action.type === "DELETE_CHAT") {
    const chatId = action.payload;

    const chatIndex = state.findIndex((u) => u.id === chatId);
    if (chatIndex !== -1) {
      state.splice(chatIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }

  if (action.type === "CHANGE_CHAT") {
    const changedChats = state.map((chat) => {
      if (chat.id === action.payload.chat.id) {
        return action.payload.chat;
      }
      return chat;
    });
    return changedChats;
  }
};

export default function ChatPopover() {
  const classes = useStyles();
  const theme = useTheme();
  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [searchParam] = useState("");
  const [chats, dispatch] = useReducer(reducer, []);
  const [invisible, setInvisible] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const { datetimeToClient } = useDate();
  const [play] = useSound(notifySound);
  const soundAlertRef = useRef();

  const socketManager = useContext(SocketContext);

  useEffect(() => {
    soundAlertRef.current = play;

    if (!("Notification" in window)) {
      console.log("This browser doesn't support notifications");
    } else {
      Notification.requestPermission();
    }
  }, [play]);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      fetchChats();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber]);

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    const socket = socketManager.getSocket(companyId);
    if (!socket) {
      return () => {}; 
    }
    
    socket.on(`company-${companyId}-chat`, (data) => {
      if (data.action === "new-message") {
        dispatch({ type: "CHANGE_CHAT", payload: data });
        const userIds = data.newMessage.chat.users.map(userObj => userObj.userId);

        if (userIds.includes(user.id) && data.newMessage.senderId !== user.id) {
          soundAlertRef.current();
          showNotification(data);
        }
      }
      if (data.action === "update") {
        dispatch({ type: "CHANGE_CHAT", payload: data });
      }
    });
    return () => {
      socket.disconnect();
    };
  }, [socketManager, user.id]);

  useEffect(() => {
    let unreadsCount = 0;
    if (chats.length > 0) {
      for (let chat of chats) {
        for (let chatUser of chat.users) {
          if (chatUser.userId === user.id) {
            unreadsCount += chatUser.unreads;
          }
        }
      }
    }
    setUnreadCount(unreadsCount);
    setInvisible(unreadsCount === 0);
  }, [chats, user.id]);

  const showNotification = (data) => {
    if ("Notification" in window && Notification.permission === "granted") {
      const notification = new Notification("Nova mensagem", {
        body: data.newMessage.message,
        icon: "/icon-192x192.png",
      });
      
      notification.onclick = () => {
        window.focus();
        goToMessages(data.chat);
      };
    }
  };

  const fetchChats = async () => {
    try {
      const { data } = await api.get("/chats/", {
        params: { searchParam, pageNumber },
      });
      dispatch({ type: "LOAD_CHATS", payload: data.records });
      setHasMore(data.hasMore);
      setLoading(false);
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

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    markAllAsRead();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const markAllAsRead = async () => {
    // Implementar lógica para marcar todas como lidas
    setInvisible(true);
  };

  const goToMessages = (chat) => {
    handleClose();
    window.location.href = `/chats/${chat.uuid}`;
  };

  const getUserUnreads = (chat) => {
    const currentUser = chat.users?.find((u) => u.userId === user.id);
    return currentUser?.unreads || 0;
  };

  const formatTime = (date) => {
    const messageDate = new Date(date);
    const now = new Date();
    const diffMs = now - messageDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Agora";
    if (diffMins < 60) return `${diffMins}min`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    
    return messageDate.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit' 
    });
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

  const open = Boolean(anchorEl);
  const id = open ? "chat-popover" : undefined;

  const renderChatItem = (chat, index) => {
    const unreads = getUserUnreads(chat);
    const hasUnread = unreads > 0;
    
    return (
      <Fade in={true} timeout={200 + index * 30} key={chat.id}>
        <ListItem 
          className={`${classes.chatItem} ${hasUnread ? classes.unreadItem : ''}`}
          onClick={() => goToMessages(chat)}
          disableGutters
        >
          <Box className={classes.chatContent}>
            <Box position="relative">
              <Avatar className={classes.chatAvatar}>
                <GroupIcon fontSize="small" />
              </Avatar>
              <Box className={classes.onlineIndicator} />
            </Box>
            
            <Box className={classes.chatInfo}>
              <Box className={classes.chatHeader}>
                <Typography className={classes.chatTitle}>
                  {chat.title || "Chat sem nome"}
                </Typography>
                <Typography className={classes.chatTime}>
                  <AccessTimeIcon style={{ fontSize: 12 }} />
                  {formatTime(chat.updatedAt)}
                </Typography>
              </Box>
              
              <Box className={classes.messagePreview}>
                {chat.lastMessage ? (
                  <>
                    {chat.lastMessageSender && (
                      <Typography component="span" className={classes.senderName}>
                        {chat.lastMessageSender.id === user.id ? "Você:" : `${chat.lastMessageSender.name}:`}
                      </Typography>
                    )}
                    <Typography className={classes.chatMessage}>
                      {chat.lastMessage}
                    </Typography>
                  </>
                ) : (
                  <Typography className={classes.chatMessage} style={{ fontStyle: "italic" }}>
                    Nenhuma mensagem ainda
                  </Typography>
                )}
              </Box>
            </Box>
            
            {hasUnread && (
              <Box className={classes.unreadBadge}>
                {unreads}
              </Box>
            )}
          </Box>
        </ListItem>
      </Fade>
    );
  };

  return (
    <>
      <IconButton
        aria-describedby={id}
        className={classes.iconButton}
        onClick={handleClick}
      >
        <Badge 
          badgeContent={unreadCount} 
          color="secondary" 
          invisible={invisible}
          className={classes.badge}
          max={99}
        >
          <ForumIcon />
        </Badge>
      </IconButton>
      
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        classes={{
          paper: classes.popoverPaper,
        }}
      >
        <Box className={classes.header}>
          <Typography className={classes.headerTitle}>
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <NotificationsIcon fontSize="small" />
              Notificações de Chat
            </span>
            {unreadCount > 0 && (
              <span className={classes.notificationCount}>
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Typography>
        </Box>
        
        <List className={classes.chatList} onScroll={handleScroll}>
          {isArray(chats) && chats.length > 0 ? (
            chats.map((chat, index) => renderChatItem(chat, index))
          ) : (
            <Box className={classes.emptyState}>
              <ForumIcon className={classes.emptyStateIcon} />
              <Typography variant="body1" gutterBottom>
                {i18n.t("mainDrawer.appBar.notRegister")}
              </Typography>
              <Typography variant="body2">
                Suas conversas aparecerão aqui
              </Typography>
            </Box>
          )}
          
          {loading && (
            <Box className={classes.loadingContainer}>
              <CircularProgress size={24} />
            </Box>
          )}
        </List>
        
        {chats.length > 0 && (
          <Box className={classes.footer}>
            <Typography 
              className={classes.viewAllButton}
              onClick={() => {
                handleClose();
                window.location.href = "/chats";
              }}
            >
              Ver todas as conversas
            </Typography>
          </Box>
        )}
      </Popover>
    </>
  );
}