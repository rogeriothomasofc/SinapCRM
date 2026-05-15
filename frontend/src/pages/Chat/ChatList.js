import React, { useContext, useState } from "react";
import {
  Box,
  Avatar,
  IconButton,
  Typography,
  makeStyles,
  Fade,
  Tooltip,
  Badge,
  Menu,
  MenuItem,
  useTheme,
} from "@material-ui/core";

import { useHistory, useParams } from "react-router-dom";
import { AuthContext } from "../../context/Auth/AuthContext";
import { useDate } from "../../hooks/useDate";

import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import GroupIcon from "@material-ui/icons/Group";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import DoneAllIcon from "@material-ui/icons/DoneAll";

import ConfirmationModal from "../../components/ConfirmationModal";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles((theme) => ({
  mainContainer: {
    display: "flex",
    flexDirection: "column",
    position: "relative",
    flex: 1,
    height: "100%",
    overflow: "hidden",
    backgroundColor: theme.palette.background.paper,
    borderTopLeftRadius: theme.spacing(1),
    borderBottomLeftRadius: theme.spacing(1),
    minHeight: 0,
  },
  chatList: {
    display: "flex",
    borderRadius: 0,
    flexDirection: "column",
    position: "relative",
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
  chatItem: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(1.5, 2),
    cursor: "pointer",
    transition: "all 0.2s ease",
    borderBottom: `1px solid ${theme.palette.divider}`,
    position: "relative",
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
      "& $actionButtons": {
        opacity: 1,
      },
    },
    "&.selected": {
      backgroundColor: theme.palette.action.selected,
      borderLeft: `3px solid ${theme.palette.primary.main}`,
      paddingLeft: theme.spacing(1.625),
    },
    "&:last-child": {
      borderBottom: "none",
      borderBottomLeftRadius: theme.spacing(0),
    },
  },
  chatAvatar: {
    width: 44,
    height: 44,
    marginRight: theme.spacing(1.5),
    backgroundColor: theme.palette.primary.main,
  },
  chatInfo: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
  },
  chatHeader: {
    display: "flex",
    alignItems: "center",
    marginBottom: 2,
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
    marginLeft: theme.spacing(1),
  },
  chatMessage: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.5),
  },
  lastMessage: {
    fontSize: "0.8125rem",
    color: theme.palette.text.secondary,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    flex: 1,
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
    marginLeft: "auto",
  },
  actionButtons: {
    display: "flex",
    gap: theme.spacing(0.5),
    opacity: 0,
    transition: "opacity 0.2s ease",
    marginLeft: theme.spacing(1),
  },
  iconButton: {
    padding: 6,
    "& .MuiSvgIcon-root": {
      fontSize: "1.125rem",
    },
  },
  menuButton: {
    padding: 4,
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(4),
    color: theme.palette.text.secondary,
    height: "100%",
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: theme.spacing(2),
    opacity: 0.3,
  },
  readIcon: {
    fontSize: "0.875rem",
    color: theme.palette.primary.main,
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 10,
    height: 10,
    borderRadius: "50%",
    backgroundColor: theme.palette.success.main,
    border: `2px solid ${theme.palette.background.paper}`,
  },
}));

export default function ChatList({
  chats,
  handleSelectChat,
  handleDeleteChat,
  handleEditChat,
  pageInfo,
  loading,
}) {
  const classes = useStyles();
  const theme = useTheme();
  const history = useHistory();
  const { user } = useContext(AuthContext);
  const { datetimeToClient } = useDate();

  const [confirmationModal, setConfirmModalOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState({});
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuChat, setMenuChat] = useState(null);

  const { id } = useParams();

  const handleMenuOpen = (event, chat) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setMenuChat(chat);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuChat(null);
  };

  const goToMessages = async (chat) => {
    const unreads = unreadMessages(chat);
    if (unreads > 0) {
      try {
        await api.post(`/chats/${chat.id}/read`, { userId: user.id });
      } catch (err) {
        console.error("Error marking messages as read:", err);
      }
    }

    if (id !== chat.uuid) {
      history.push(`/chats/${chat.uuid}`);
      handleSelectChat(chat);
    }
  };

  const handleDelete = () => {
    handleDeleteChat(selectedChat);
    setConfirmModalOpen(false);
  };

  const handleEdit = async (chat) => {
    handleMenuClose();
    await goToMessages(chat);
    handleEditChat(chat);
  };

  const handleDeleteClick = (chat) => {
    handleMenuClose();
    setSelectedChat(chat);
    setConfirmModalOpen(true);
  };

  const unreadMessages = (chat) => {
    if (!chat || !chat.users) return 0;
    const currentUser = chat.users.find((u) => u.userId === user.id);
    return currentUser ? currentUser.unreads : 0;
  };

  const formatTime = (date) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return messageDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return "Ontem";
    } else {
      return messageDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    }
  };

  if (!Array.isArray(chats) || chats.length === 0) {
    return (
      <Box className={classes.mainContainer}>
        <Box className={classes.emptyState}>
          <GroupIcon className={classes.emptyStateIcon} />
          <Typography variant="body1">
            Nenhuma conversa ainda
          </Typography>
          <Typography variant="body2" style={{ marginTop: 8 }}>
            Crie uma nova conversa para começar
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <>
      <ConfirmationModal
        title={i18n.t("chat.confirm.title")}
        open={confirmationModal}
        onClose={setConfirmModalOpen}
        onConfirm={handleDelete}
      >
        {i18n.t("chat.confirm.message")}
      </ConfirmationModal>
      
      <Menu
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {menuChat && (
          <>
            <MenuItem onClick={() => handleEdit(menuChat)}>
              <EditIcon fontSize="small" style={{ marginRight: 8 }} />
              Editar
            </MenuItem>
            <MenuItem onClick={() => handleDeleteClick(menuChat)}>
              <DeleteIcon fontSize="small" style={{ marginRight: 8 }} />
              Excluir
            </MenuItem>
          </>
        )}
      </Menu>

      <Box className={classes.mainContainer}>
        <Box className={classes.chatList}>
          {chats.map((chat, index) => {
            const unreads = unreadMessages(chat);
            const isSelected = chat.uuid === id;
            const isOwner = chat.ownerId === user.id;

            return (
              <Fade in={true} timeout={200 + index * 30} key={chat.id}>
                <Box
                  className={`${classes.chatItem} ${isSelected ? 'selected' : ''}`}
                  onClick={() => goToMessages(chat)}
                >
                  <Badge
                    badgeContent={unreads}
                    color="primary"
                    invisible={unreads === 0}
                    overlap="circle"
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right',
                    }}
                  >
                    <Avatar className={classes.chatAvatar}>
                      <GroupIcon />
                    </Avatar>
                    <Box className={classes.onlineIndicator} />
                  </Badge>

                  <Box className={classes.chatInfo}>
                    <Box className={classes.chatHeader}>
                      <Typography className={classes.chatTitle}>
                        {chat.title}
                      </Typography>
                      {chat.updatedAt && (
                        <Typography className={classes.chatTime}>
                          {formatTime(chat.updatedAt)}
                        </Typography>
                      )}
                    </Box>
                    
                    <Box className={classes.chatMessage}>
                      <Typography className={classes.lastMessage}>
                        {chat.lastMessage || "Clique para iniciar a conversa"}
                      </Typography>
                      {chat.lastMessage && unreads === 0 && (
                        <DoneAllIcon className={classes.readIcon} />
                      )}
                    </Box>
                  </Box>

                  {isOwner && (
                    <Box className={classes.actionButtons}>
                      <Tooltip title="Opções" placement="top">
                        <IconButton
                          className={classes.menuButton}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMenuOpen(e, chat);
                          }}
                          size="small"
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  )}
                </Box>
              </Fade>
            );
          })}
        </Box>
      </Box>
    </>
  );
}