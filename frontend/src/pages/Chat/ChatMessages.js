import React, { useContext, useEffect, useRef, useState } from "react";
import {
  Box,
  FormControl,
  IconButton,
  InputBase,
  makeStyles,
  Paper,
  Typography,
  Avatar,
  Fade,
  CircularProgress,
  Chip,
  useTheme,
  Tooltip,
} from "@material-ui/core";
import SendIcon from "@material-ui/icons/Send";
import AttachFileIcon from "@material-ui/icons/AttachFile";
import EmojiEmotionsIcon from "@material-ui/icons/EmojiEmotions";
import DoneIcon from "@material-ui/icons/Done";
import DoneAllIcon from "@material-ui/icons/DoneAll";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import GroupIcon from "@material-ui/icons/Group";

import { AuthContext } from "../../context/Auth/AuthContext";
import { useDate } from "../../hooks/useDate";
import api from "../../services/api";

const useStyles = makeStyles((theme) => ({
  mainContainer: {
    display: "flex",
    flexDirection: "column",
    position: "relative",
    flex: 1,
    overflow: "hidden",
    height: "100%",
    backgroundColor: theme.palette.background.default,
    borderTopRightRadius: theme.spacing(1),
    borderBottomRightRadius: theme.spacing(1),
    minHeight: 0,
  },
  messagesHeader: {
    position: "sticky",
    top: 0,
    zIndex: 10,
    padding: theme.spacing(1.5, 2),
    backgroundColor: theme.palette.background.paper,
    borderBottom: `1px solid ${theme.palette.divider}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopRightRadius: theme.spacing(1),
  },
  headerInfo: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1.5),
  },
  headerAvatar: {
    width: 40,
    height: 40,
    backgroundColor: theme.palette.primary.main,
  },
  headerTitle: {
    fontWeight: 600,
    fontSize: "1rem",
    color: theme.palette.text.primary,
  },
  headerSubtitle: {
    fontSize: "0.8125rem",
    color: theme.palette.text.secondary,
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.5),
  },
  onlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    backgroundColor: theme.palette.success.main,
  },
  messageList: {
    position: "relative",
    overflowY: "auto",
    flex: 1,
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.default,
    display: "flex",
    flexDirection: "column",
    minHeight: 0,
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
  dateChip: {
    display: "flex",
    justifyContent: "center",
    margin: theme.spacing(2, 0),
  },
  dateBadge: {
    backgroundColor: theme.palette.action.hover,
    color: theme.palette.text.secondary,
    padding: theme.spacing(0.5, 2),
    borderRadius: theme.spacing(1),
    fontSize: "0.75rem",
    fontWeight: 500,
  },
  loadMoreContainer: {
    display: "flex",
    justifyContent: "center",
    padding: theme.spacing(2),
  },
  loadMoreButton: {
    color: theme.palette.primary.main,
    cursor: "pointer",
    fontSize: "0.875rem",
    "&:hover": {
      textDecoration: "underline",
    },
  },
  messageRow: {
    display: "flex",
    marginBottom: theme.spacing(1.5),
    "&.sent": {
      justifyContent: "flex-end",
    },
    "&.received": {
      justifyContent: "flex-start",
    },
  },
  messageGroup: {
    display: "flex",
    alignItems: "flex-end",
    gap: theme.spacing(1),
    maxWidth: "70%",
    "&.sent": {
      flexDirection: "row-reverse",
    },
  },
  messageAvatar: {
    width: 32,
    height: 32,
    fontSize: "0.875rem",
    backgroundColor: theme.palette.primary.main,
    marginBottom: 4,
  },
  messageBubbleWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  senderName: {
    fontSize: "0.75rem",
    fontWeight: 600,
    marginBottom: 2,
    marginLeft: theme.spacing(1),
    color: theme.palette.primary.main,
  },
  messageBubble: {
    position: "relative",
    padding: theme.spacing(1, 1.5),
    borderRadius: theme.spacing(1),
    wordBreak: "break-word",
    transition: "all 0.15s ease",
    "&.sent": {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
      borderBottomRightRadius: theme.spacing(0.25),
    },
    "&.received": {
      backgroundColor: theme.palette.background.paper,
      color: theme.palette.text.primary,
      borderBottomLeftRadius: theme.spacing(0.25),
      border: `1px solid ${theme.palette.divider}`,
    },
    "&:hover": {
      transform: "scale(1.02)",
    },
  },
  messageText: {
    fontSize: "0.875rem",
    lineHeight: 1.4,
    margin: 0,
    whiteSpace: "pre-wrap",
  },
  messageFooter: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.5),
    marginTop: 4,
    "&.sent": {
      justifyContent: "flex-end",
    },
  },
  messageTime: {
    fontSize: "0.7rem",
    opacity: 0.7,
  },
  messageStatus: {
    display: "flex",
    alignItems: "center",
    "& .MuiSvgIcon-root": {
      fontSize: "0.875rem",
    },
  },
  inputArea: {
    position: "relative",
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    borderTop: `1px solid ${theme.palette.divider}`,
    borderBottomRightRadius: theme.spacing(1),
  },
  inputContainer: {
    display: "flex",
    alignItems: "flex-end",
    gap: theme.spacing(1),
  },
  inputWrapper: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    backgroundColor: theme.palette.background.default,
    borderRadius: theme.spacing(1.5),
    border: `1px solid ${theme.palette.divider}`,
    transition: "border-color 0.2s",
    "&:focus-within": {
      borderColor: theme.palette.primary.main,
    },
  },
  input: {
    flex: 1,
    padding: "10px 16px",
    fontSize: "0.875rem",
    "& textarea": {
      resize: "none",
      "&::-webkit-scrollbar": {
        width: "4px",
      },
    },
  },
  inputButton: {
    padding: 8,
    "& .MuiSvgIcon-root": {
      fontSize: "1.25rem",
    },
  },
  sendButton: {
    minWidth: 40,
    width: 40,
    height: 40,
    borderRadius: "50%",
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    "&:hover": {
      backgroundColor: theme.palette.primary.dark,
    },
    "&:disabled": {
      backgroundColor: theme.palette.action.disabledBackground,
    },
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    padding: theme.spacing(4),
    color: theme.palette.text.secondary,
  },
  typingIndicator: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    padding: theme.spacing(1, 2),
    color: theme.palette.text.secondary,
    fontSize: "0.875rem",
    fontStyle: "italic",
  },
}));

export default function ChatMessages({
  chat,
  messages,
  handleSendMessage,
  handleLoadMore,
  scrollToBottomRef,
  pageInfo,
  loading,
  handleEditChat,
}) {
  const classes = useStyles();
  const theme = useTheme();
  const { user } = useContext(AuthContext);
  const { datetimeToClient } = useDate();
  const baseRef = useRef();
  const [contentMessage, setContentMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const scrollToBottom = () => {
    if (baseRef.current) {
      baseRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  };

  const unreadMessages = (chat) => {
    if (chat !== undefined && chat.users) {
      const currentUser = chat.users.find((u) => u.userId === user.id);
      return currentUser?.unreads > 0;
    }
    return false;
  };

  const markMessagesAsRead = async () => {
    if (chat && chat.id && unreadMessages(chat)) {
      try {
        await api.post(`/chats/${chat.id}/read`, { userId: user.id });
        // Também pode ser necessário marcar mensagens individuais
        if (messages && messages.length > 0) {
          const unreadMessageIds = messages
            .filter(msg => msg.senderId !== user.id && !msg.read && !msg.viewed)
            .map(msg => msg.id);
          
          if (unreadMessageIds.length > 0) {
            // Se houver endpoint para marcar mensagens individuais
            // await api.post(`/chats/${chat.id}/messages/read`, { messageIds: unreadMessageIds });
          }
        }
      } catch (err) {
        console.error("Error marking messages as read:", err);
      }
    }
  };

  useEffect(() => {
    markMessagesAsRead();
    if (scrollToBottomRef) {
      scrollToBottomRef.current = scrollToBottom;
    }
  }, [chat]);

  useEffect(() => {
    scrollToBottom();
    // Marca mensagens como lidas quando novas mensagens chegam
    if (messages && messages.length > 0) {
      const timer = setTimeout(() => {
        markMessagesAsRead();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [messages]);

  const handleScroll = (e) => {
    const { scrollTop } = e.currentTarget;
    if (!pageInfo?.hasMore || loading) return;
    if (scrollTop < 100) {
      handleLoadMore();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (contentMessage.trim() !== "") {
        handleSendMessage(contentMessage);
        setContentMessage("");
      }
    }
  };

  const handleSend = () => {
    if (contentMessage.trim() !== "") {
      handleSendMessage(contentMessage);
      setContentMessage("");
    }
  };

  const formatMessageTime = (date) => {
    return new Date(date).toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDateDivider = (date) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return "Hoje";
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return "Ontem";
    } else {
      return messageDate.toLocaleDateString('pt-BR', { 
        day: 'numeric', 
        month: 'long' 
      });
    }
  };

  const shouldShowDateDivider = (currentMessage, previousMessage) => {
    if (!previousMessage) return true;
    
    const currentDate = new Date(currentMessage.createdAt).toDateString();
    const previousDate = new Date(previousMessage.createdAt).toDateString();
    
    return currentDate !== previousDate;
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

  const renderMessage = (item, key, previousMessage) => {
    const isSent = item.senderId === user.id;
    const showDateDivider = shouldShowDateDivider(item, previousMessage);
    const showAvatar = !isSent && (!previousMessage || previousMessage.senderId !== item.senderId);
    
    // Debug - remover depois de testar
    if (isSent && key === messages.length - 1) {
      console.log("Message status debug:", {
        id: item.id,
        read: item.read,
        viewed: item.viewed,
        readAt: item.readAt,
        createdAt: item.createdAt
      });
    }

    return (
      <React.Fragment key={key}>
        {showDateDivider && (
          <Box className={classes.dateChip}>
            <Typography className={classes.dateBadge}>
              {formatDateDivider(item.createdAt)}
            </Typography>
          </Box>
        )}
        
        <Fade in={true} timeout={300}>
          <Box className={`${classes.messageRow} ${isSent ? 'sent' : 'received'}`}>
            <Box className={`${classes.messageGroup} ${isSent ? 'sent' : 'received'}`}>
              {!isSent && (
                showAvatar ? (
                  <Avatar className={classes.messageAvatar}>
                    {getInitials(item.sender?.name)}
                  </Avatar>
                ) : (
                  <Box style={{ width: 32 }} />
                )
              )}
              
              <Box className={classes.messageBubbleWrapper}>
                {!isSent && showAvatar && chat.users?.length > 2 && (
                  <Typography className={classes.senderName}>
                    {item.sender?.name}
                  </Typography>
                )}
                
                <Paper 
                  className={`${classes.messageBubble} ${isSent ? 'sent' : 'received'}`}
                  elevation={0}
                >
                  <Typography className={classes.messageText}>
                    {item.message}
                  </Typography>
                  
                  <Box className={`${classes.messageFooter} ${isSent ? 'sent' : 'received'}`}>
                    <Typography className={classes.messageTime}>
                      {formatMessageTime(item.createdAt)}
                    </Typography>
                    {isSent && (
                      <Box className={classes.messageStatus}>
                        {/* Verifica múltiplas propriedades possíveis para o status de leitura */}
                        {(item.read || item.viewed || item.readAt) ? (
                          <Tooltip title="Lida">
                            <DoneAllIcon 
                              style={{ 
                                color: theme.palette.primary.contrastText,
                                fontSize: "0.875rem" 
                              }} 
                            />
                          </Tooltip>
                        ) : (
                          <Tooltip title="Enviada">
                            <DoneIcon 
                              style={{ 
                                opacity: 0.7,
                                color: theme.palette.primary.contrastText,
                                fontSize: "0.875rem" 
                              }} 
                            />
                          </Tooltip>
                        )}
                      </Box>
                    )}
                  </Box>
                </Paper>
              </Box>
            </Box>
          </Box>
        </Fade>
      </React.Fragment>
    );
  };

  return (
    <Paper className={classes.mainContainer} elevation={0}>
      {chat && chat.id && (
        <Box className={classes.messagesHeader}>
          <Box className={classes.headerInfo}>
            <Avatar className={classes.headerAvatar}>
              {chat.title ? (
                getInitials(chat.title)
              ) : (
                <GroupIcon />
              )}
            </Avatar>
            <Box>
              <Typography className={classes.headerTitle}>
                {chat.title || "Chat sem nome"}
              </Typography>
              <Box className={classes.headerSubtitle}>
                <Box className={classes.onlineIndicator} />
                {chat.users?.length || 0} participantes
              </Box>
            </Box>
          </Box>
          
          {handleEditChat && (
            <Box>
              <Tooltip title="Opções">
                <IconButton 
                  size="small"
                  onClick={() => {
                    if (handleEditChat) {
                      handleEditChat();
                    }
                  }}
                >
                  <MoreVertIcon />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Box>
      )}
      
      <div onScroll={handleScroll} className={classes.messageList}>
        {pageInfo?.hasMore && (
          <Box className={classes.loadMoreContainer}>
            {loading ? (
              <CircularProgress size={24} />
            ) : (
              <Typography 
                className={classes.loadMoreButton}
                onClick={handleLoadMore}
              >
                Carregar mensagens anteriores
              </Typography>
            )}
          </Box>
        )}
        
        {(!messages || messages.length === 0) ? (
          <Box className={classes.emptyState}>
            <Typography variant="h6" style={{ marginBottom: 8 }}>
              Nenhuma mensagem ainda
            </Typography>
            <Typography variant="body2">
              Envie a primeira mensagem para iniciar a conversa
            </Typography>
          </Box>
        ) : (
          Array.isArray(messages) && messages.map((item, key) => 
            renderMessage(item, key, messages[key - 1])
          )
        )}
        
        {isTyping && (
          <Box className={classes.typingIndicator}>
            <Typography variant="body2">
              Alguém está digitando...
            </Typography>
          </Box>
        )}
        
        <div ref={baseRef} />
      </div>
      
      <Box className={classes.inputArea}>
        <Box className={classes.inputContainer}>
          <Box className={classes.inputWrapper}>
            <InputBase
              multiline
              maxRows={4}
              placeholder="Digite uma mensagem..."
              value={contentMessage}
              onChange={(e) => setContentMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className={classes.input}
            />
            <Tooltip title="Anexar arquivo">
              <IconButton className={classes.inputButton} size="small">
                <AttachFileIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Emojis">
              <IconButton className={classes.inputButton} size="small">
                <EmojiEmotionsIcon />
              </IconButton>
            </Tooltip>
          </Box>
          <IconButton
            onClick={handleSend}
            className={classes.sendButton}
            disabled={!contentMessage.trim()}
            color="primary"
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Box>
    </Paper>
  );
}