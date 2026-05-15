import React, { useContext, useEffect, useRef, useState } from "react";
import { useParams, useHistory } from "react-router-dom";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  makeStyles,
  Paper,
  Tab,
  Tabs,
  TextField,
  Box,
  Typography,
  Avatar,
  Badge,
  IconButton,
  Fade,
  useTheme,
  Chip,
} from "@material-ui/core";

import AddIcon from "@material-ui/icons/Add";
import GroupIcon from "@material-ui/icons/Group";
import SearchIcon from "@material-ui/icons/Search";
import MoreVertIcon from "@material-ui/icons/MoreVert";

import ChatList from "./ChatList";
import ChatMessages from "./ChatMessages";
import { UsersFilter } from "../../components/UsersFilter";
import api from "../../services/api";
import { SocketContext } from "../../context/Socket/SocketContext";

import { has, isObject } from "lodash";

import { AuthContext } from "../../context/Auth/AuthContext";
import withWidth, { isWidthUp } from "@material-ui/core/withWidth";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles((theme) => ({
  wrapper: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    padding: theme.spacing(1),
    boxSizing: "border-box",
    overflow: "hidden",
  },
  mainContainer: {
    display: "flex",
    flexDirection: "column",
    position: "relative",
    flex: 1,
    height: "100%",
    borderRadius: theme.spacing(1),
    overflow: "hidden",
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
  },
  gridContainer: {
    flex: 1,
    height: "100%",
    display: "flex",
    overflow: "hidden",
    borderRadius: theme.spacing(1),
    minHeight: 0,
  },
  chatListContainer: {
    width: 320,
    borderRight: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    borderTopLeftRadius: theme.spacing(1),
    borderBottomLeftRadius: theme.spacing(1),
    minHeight: 0,
  },
  chatListHeader: {
    padding: theme.spacing(2),
    borderBottom: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
    borderTopLeftRadius: theme.spacing(1),
  },
  chatListTitle: {
    fontWeight: 600,
    fontSize: "1.25rem",
    color: theme.palette.text.primary,
    marginBottom: theme.spacing(1),
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  newChatButton: {
    borderRadius: theme.spacing(1.5),
    textTransform: "none",
    fontWeight: 500,
    fontSize: "0.875rem",
    padding: "6px 16px",
    boxShadow: "none",
    "&:hover": {
      boxShadow: "none",
    },
  },
  searchField: {
    "& .MuiOutlinedInput-root": {
      borderRadius: theme.spacing(1.5),
      backgroundColor: theme.palette.background.default,
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
  chatListContent: {
    flex: 1,
    overflowY: "auto",
    overflowX: "hidden",
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
  messagesContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    backgroundColor: theme.palette.background.default,
    position: "relative",
    borderTopRightRadius: theme.spacing(1),
    borderBottomRightRadius: theme.spacing(1),
    overflow: "hidden",
    minWidth: 0,
    minHeight: 0,
  },
  messagesHeader: {
    padding: theme.spacing(1.5, 2),
    backgroundColor: theme.palette.background.paper,
    borderBottom: `1px solid ${theme.palette.divider}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerInfo: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1.5),
  },
  headerTitle: {
    fontWeight: 600,
    fontSize: "1rem",
    color: theme.palette.text.primary,
  },
  headerSubtitle: {
    fontSize: "0.8125rem",
    color: theme.palette.text.secondary,
  },
  emptyState: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(4),
    color: theme.palette.text.secondary,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: theme.spacing(2),
    opacity: 0.3,
  },
  dialogContent: {
    paddingTop: theme.spacing(1),
  },
  dialogField: {
    marginBottom: theme.spacing(2),
  },
  tabsContainer: {
    borderBottom: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
  },
  onlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    backgroundColor: theme.palette.success.main,
    marginRight: theme.spacing(0.5),
  },
  chatAvatar: {
    width: 40,
    height: 40,
    marginRight: theme.spacing(1.5),
    backgroundColor: theme.palette.primary.main,
  },
  chatItem: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(1.5, 2),
    cursor: "pointer",
    transition: "all 0.2s ease",
    borderBottom: `1px solid ${theme.palette.divider}`,
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
    "&.selected": {
      backgroundColor: theme.palette.action.selected,
      borderLeft: `3px solid ${theme.palette.primary.main}`,
    },
  },
  chatInfo: {
    flex: 1,
    minWidth: 0,
  },
  chatTitle: {
    fontWeight: 600,
    fontSize: "0.875rem",
    color: theme.palette.text.primary,
    marginBottom: 2,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  chatLastMessage: {
    fontSize: "0.8125rem",
    color: theme.palette.text.secondary,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  chatMeta: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: theme.spacing(0.5),
  },
  chatTime: {
    fontSize: "0.75rem",
    color: theme.palette.text.disabled,
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
}));

export function ChatModal({
  open,
  chat,
  type,
  handleClose,
  handleLoadNewChat,
}) {
  const classes = useStyles();
  const [users, setUsers] = useState([]);
  const [title, setTitle] = useState("");

  useEffect(() => {
    setTitle("");
    setUsers([]);
    if (type === "edit" && chat && chat.users) {
      const userList = chat.users.map((u) => ({
        id: u.user?.id || u.userId,
        name: u.user?.name || "Usuário",
      }));
      setUsers(userList);
      setTitle(chat.title || "");
    }
  }, [chat, open, type]);

  const handleSave = async () => {
    try {
      if (!title) {
        alert(i18n.t("chat.toasts.fillTitle"));
        return;
      }

      if (!users || users.length === 0) {
        alert(i18n.t("chat.toasts.fillUser"));
        return;
      }

      if (type === "edit") {
        await api.put(`/chats/${chat.id}`, {
          users,
          title,
        });
        handleClose();
      } else {
        const { data } = await api.post("/chats", {
          users,
          title,
        });
        if (data && handleLoadNewChat) {
          handleLoadNewChat(data);
        }
        handleClose();
      }
    } catch (err) {
      console.error("Error saving chat:", err);
    }
  };  

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        {type === "edit" ? "Editar Conversa" : i18n.t("chat.modal.title")}
      </DialogTitle>
      <DialogContent className={classes.dialogContent}>
        <TextField
          className={classes.dialogField}
          label={i18n.t("chat.modal.titleField")}
          placeholder={i18n.t("chat.modal.titleField")}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          variant="outlined"
          size="small"
          fullWidth
          autoFocus
        />
        <UsersFilter
          onFiltered={(users) => setUsers(users)}
          initialUsers={users}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          {i18n.t("chat.buttons.close")}
        </Button>
        <Button onClick={handleSave} color="primary" variant="contained">
          {i18n.t("chat.buttons.save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function Chat(props) {
  const classes = useStyles();
  const theme = useTheme();
  const { user } = useContext(AuthContext);
  const history = useHistory();

  const [showDialog, setShowDialog] = useState(false);
  const [dialogType, setDialogType] = useState("new");
  const [currentChat, setCurrentChat] = useState({});
  const [chats, setChats] = useState([]);
  const [chatsPageInfo, setChatsPageInfo] = useState({ hasMore: false });
  const [messages, setMessages] = useState([]);
  const [messagesPageInfo, setMessagesPageInfo] = useState({ hasMore: false });
  const [messagesPage, setMessagesPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState(0);
  const [searchChat, setSearchChat] = useState("");
  const isMounted = useRef(true);
  const scrollToBottomRef = useRef();
  const { id } = useParams();

  const socketManager = useContext(SocketContext);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (isMounted.current) {
      findChats().then((data) => {
        if (data && data.records) {
          const { records } = data;
          if (records.length > 0) {
            setChats(records);
            setChatsPageInfo(data);

            if (id && records.length) {
              const chat = records.find((r) => r.uuid === id);
              if (chat) {
                selectChat(chat);
              }
            }
          }
        }
      });
    }
  }, []);

  useEffect(() => {
    if (isObject(currentChat) && has(currentChat, "id")) {
      findMessages(currentChat.id).then(() => {
        if (typeof scrollToBottomRef.current === "function") {
          setTimeout(() => {
            scrollToBottomRef.current();
          }, 300);
        }
      });
    }
  }, [currentChat]);

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    const socket = socketManager.getSocket(companyId);

    const handleChatUser = (data) => {
      if (data.action === "create") {
        setChats((prev) => {
          const chatExists = prev.some(chat => chat.id === data.record.id);
          if (chatExists) return prev;
          return [data.record, ...prev];
        });
      }
      if (data.action === "update") {
        setChats((prev) => prev.map((chat) => {
          if (chat.id === data.record.id) {
            if (currentChat.id === data.record.id) {
              setCurrentChat(data.record);
            }
            return data.record;
          }
          return chat;
        }));
      }
    };

    const handleChat = (data) => {
      if (data.action === "delete") {
        setChats((prev) => prev.filter((c) => c.id !== +data.id));
        if (currentChat.id === +data.id) {
          setMessages([]);
          setMessagesPage(1);
          setMessagesPageInfo({ hasMore: false });
          setCurrentChat({});
          history.push("/chats");
        }
      }
    };

    const handleChatMessage = (data) => {
      if (data.action === "new-message") {
        setMessages((prev) => [...prev, data.newMessage]);
        setChats((prev) => prev.map((chat) => {
          if (chat.id === data.newMessage.chatId) {
            return data.chat;
          }
          return chat;
        }));
        if (scrollToBottomRef.current) {
          scrollToBottomRef.current();
        }
      }

      if (data.action === "update") {
        setChats((prev) => prev.map((chat) => {
          if (chat.id === data.chat.id) {
            return data.chat;
          }
          return chat;
        }));
        if (scrollToBottomRef.current) {
          scrollToBottomRef.current();
        }
      }
    };

    socket.on(`company-${companyId}-chat-user-${user.id}`, handleChatUser);
    socket.on(`company-${companyId}-chat`, handleChat);

    if (isObject(currentChat) && has(currentChat, "id")) {
      socket.on(`company-${companyId}-chat-${currentChat.id}`, handleChatMessage);
    }

    return () => {
      socket.off(`company-${companyId}-chat-user-${user.id}`, handleChatUser);
      socket.off(`company-${companyId}-chat`, handleChat);
      if (isObject(currentChat) && has(currentChat, "id")) {
        socket.off(`company-${companyId}-chat-${currentChat.id}`, handleChatMessage);
      }
    };
  }, [currentChat, socketManager, user.id, history, scrollToBottomRef]);

  const selectChat = (chat) => {
    try {
      setMessages([]);
      setMessagesPage(1);
      setCurrentChat(chat);
      setTab(1);
    } catch (err) {
      console.error("Error selecting chat:", err);
    }
  };

  const sendMessage = async (contentMessage) => {
    if (!contentMessage.trim()) return;
    
    setLoading(true);
    try {
      await api.post(`/chats/${currentChat.id}/messages`, {
        message: contentMessage,
      });
    } catch (err) {
      console.error("Error sending message:", err);
    }
    setLoading(false);
  };

  const deleteChat = async (chat) => {
    try {
      await api.delete(`/chats/${chat.id}`);
    } catch (err) {
      console.error("Error deleting chat:", err);
    }
  };

  const findMessages = async (chatId) => {
    setLoading(true);
    try {
      const { data } = await api.get(
        `/chats/${chatId}/messages?pageNumber=${messagesPage}`
      );
      setMessagesPage((prev) => prev + 1);
      setMessagesPageInfo(data);
      setMessages((prev) => [...data.records, ...prev]);
    } catch (err) {
      console.error("Error loading messages:", err);
    }
    setLoading(false);
  };

  const loadMoreMessages = async () => {
    if (!loading) {
      findMessages(currentChat.id);
    }
  };

  const findChats = async () => {
    try {
      const { data } = await api.get("/chats");
      return data || { records: [], hasMore: false };
    } catch (err) {
      console.log(err);
      return { records: [], hasMore: false };
    }
  };

  const filteredChats = chats.filter(chat => 
    chat.title?.toLowerCase().includes(searchChat.toLowerCase())
  );

  const renderChatList = () => (
    <Box className={classes.chatListContainer}>
      <Box className={classes.chatListHeader}>
        <Typography className={classes.chatListTitle}>
          <span>{i18n.t("chat.chats")}</span>
          {chats.length > 0 && (
            <Chip size="small" label={chats.length} />
          )}
        </Typography>
        <Button
          fullWidth
          startIcon={<AddIcon />}
          onClick={() => {
            setDialogType("new");
            setShowDialog(true);
          }}
          color="primary"
          variant="contained"
          className={classes.newChatButton}
        >
          {i18n.t("chat.buttons.new")}
        </Button>
        <TextField
          fullWidth
          placeholder="Pesquisar conversas..."
          value={searchChat}
          onChange={(e) => setSearchChat(e.target.value)}
          variant="outlined"
          size="small"
          className={classes.searchField}
          style={{ marginTop: 12 }}
          InputProps={{
            startAdornment: <SearchIcon fontSize="small" style={{ marginRight: 8, color: theme.palette.text.secondary }} />,
          }}
        />
      </Box>
      <Box className={classes.chatListContent}>
        <ChatList
          chats={filteredChats}
          handleSelectChat={selectChat}
          handleDeleteChat={deleteChat}
          handleEditChat={() => {
            setDialogType("edit");
            setShowDialog(true);
          }}
          pageInfo={chatsPageInfo}
          loading={loading}
        />
      </Box>
    </Box>
  );

  const renderMessages = () => (
    <Box className={classes.messagesContainer}>
      {isObject(currentChat) && has(currentChat, "id") ? (
        <ChatMessages
          chat={currentChat}
          scrollToBottomRef={scrollToBottomRef}
          pageInfo={messagesPageInfo}
          messages={messages}
          loading={loading}
          handleSendMessage={sendMessage}
          handleLoadMore={loadMoreMessages}
          handleEditChat={() => {
            setDialogType("edit");
            setShowDialog(true);
          }}
        />
      ) : (
        <Box className={classes.emptyState}>
          <GroupIcon className={classes.emptyStateIcon} />
          <Typography variant="h6" gutterBottom>
            {i18n.t("chat.noTicketMessage")}
          </Typography>
          <Typography variant="body2">
            Selecione uma conversa ao lado ou crie uma nova
          </Typography>
        </Box>
      )}
    </Box>
  );

  const renderGrid = () => {
    return (
      <Box className={classes.gridContainer}>
        {renderChatList()}
        {renderMessages()}
      </Box>
    );
  };

  const renderTab = () => {
    return (
      <Box style={{ height: "100%", display: "flex", flexDirection: "column", minHeight: 0 }}>
        <Box className={classes.tabsContainer}>
          <Tabs
            value={tab}
            indicatorColor="primary"
            textColor="primary"
            onChange={(e, v) => setTab(v)}
          >
            <Tab label={i18n.t("chat.chats")} />
            <Tab label={i18n.t("chat.messages")} />
          </Tabs>
        </Box>
        {tab === 0 && (
          <Box style={{ flex: 1, overflow: "hidden", minHeight: 0 }}>
            {renderChatList()}
          </Box>
        )}
        {tab === 1 && (
          <Box style={{ flex: 1, overflow: "hidden", minHeight: 0 }}>
            {renderMessages()}
          </Box>
        )}
      </Box>
    );
  };

  return (
    <>
      <ChatModal
        type={dialogType}
        open={showDialog}
        chat={currentChat}
        handleLoadNewChat={(data) => {
          if (data && data.uuid) {
            setMessages([]);
            setMessagesPage(1);
            setCurrentChat(data);
            setTab(1);
            history.push(`/chats/${data.uuid}`);
          }
        }}
        handleClose={() => setShowDialog(false)}
      />
      <Box className={classes.wrapper}>
        <Paper className={classes.mainContainer} elevation={0} square={false}>
          {isWidthUp("md", props.width) ? renderGrid() : renderTab()}
        </Paper>
      </Box>
    </>
  );
}

export default withWidth()(Chat);