import React, { useContext, useEffect, useReducer, useState } from "react";
import { Link as RouterLink, useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import {
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  List,
  Badge,
  Tooltip,
} from "@material-ui/core";

import DashboardOutlinedIcon from "@material-ui/icons/DashboardOutlined";
import SettingsOutlinedIcon from "@material-ui/icons/SettingsOutlined";
import PeopleOutlinedIcon from "@material-ui/icons/PeopleOutlined";
import PermContactCalendarOutlinedIcon from "@material-ui/icons/PermContactCalendarOutlined";
import AccountTreeOutlinedIcon from "@material-ui/icons/AccountTreeOutlined";
import EventOutlinedIcon from "@material-ui/icons/EventOutlined";
import EventAvailableOutlinedIcon from "@material-ui/icons/EventAvailableOutlined";
import ExpandLessOutlinedIcon from "@material-ui/icons/ExpandLessOutlined";
import ExpandMoreOutlinedIcon from "@material-ui/icons/ExpandMoreOutlined";
import ListAltOutlinedIcon from "@material-ui/icons/ListAltOutlined";
import ForumOutlinedIcon from "@material-ui/icons/ForumOutlined";
import ViewComfyOutlinedIcon from '@material-ui/icons/ViewComfyOutlined';
import ChatBubbleOutlineOutlinedIcon from '@material-ui/icons/ChatBubbleOutlineOutlined';
import FlashOnOutlinedIcon from "@material-ui/icons/FlashOnOutlined";
import RepeatOneOutlinedIcon from '@material-ui/icons/RepeatOne';

import { i18n } from "../translate/i18n";
import { AuthContext } from "../context/Auth/AuthContext";
import { Can } from "../components/Can";
import { SocketContext } from "../context/Socket/SocketContext";
import { isArray } from "lodash";
import api from "../services/api";
import toastError from "../errors/toastError";
import usePlans from "../hooks/usePlans";

// Cores do tema principal do software (manter consistente)
const mainThemeColor = {
  light: '#5d8aff',
  main: '#2563eb',
  dark: '#1a44a8',
  contrastText: '#ffffff'
};

const secondaryThemeColor = {
  light: '#ff6e59',
  main: '#ff3f20',
  dark: '#c52100',
  contrastText: '#ffffff'
};

const useStyles = makeStyles((theme) => ({
  listItem: {
    padding: theme.spacing(0.8, 1.5),
    borderRadius: theme.spacing(1),
    marginBottom: theme.spacing(0.3),
    marginTop: theme.spacing(0.3),
    marginLeft: theme.spacing(0.5),
    marginRight: theme.spacing(1),
    transition: "all 0.2s ease",
    "&:hover": {
      backgroundColor: theme.palette.type === 'dark' 
        ? 'rgba(255, 255, 255, 0.08)' 
        : 'rgba(0, 0, 0, 0.04)',
    },
  },
  listItemActive: {
    backgroundColor: 'transparent',
    "& $listItemIcon": {
      color: theme.palette.primary.main,
    },
    "& $listItemText": {
      "& span": {
        color: theme.palette.primary.main,
        fontWeight: 600,
      }
    },
  },
  listItemIcon: {
    minWidth: 36,
    color: theme.palette.type === 'dark' 
      ? theme.palette.grey[400] 
      : theme.palette.text.secondary,
    marginRight: theme.spacing(0.5),
    "& svg": {
      fontSize: 24,
    }
  },
  listItemText: {
    fontSize: 14,
    fontWeight: 500,
    margin: 0,
    "& span": {
      fontSize: 14,
      color: theme.palette.type === 'dark' 
        ? theme.palette.grey[200] 
        : theme.palette.text.primary,
    }
  },
  divider: {
    margin: theme.spacing(1, 0),
    backgroundColor: theme.palette.type === 'dark' 
      ? 'rgba(255, 255, 255, 0.12)' 
      : 'rgba(0, 0, 0, 0.06)',
  },
  nestedList: {
    paddingLeft: theme.spacing(2.5),
  },
  badge: {
    marginRight: theme.spacing(1),
    "& .MuiBadge-badge": {
      backgroundColor: theme.palette.type === 'dark' 
        ? theme.palette.error.main 
        : theme.palette.secondary.main,
    }
  },
  versionInfo: {
    fontSize: 11,
    padding: theme.spacing(1, 2),
    textAlign: "right",
    fontWeight: 500,
    color: theme.palette.type === 'dark' 
      ? theme.palette.grey[500] 
      : theme.palette.text.secondary,
  },
  connectionWarning: {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
    height: 16,
    width: 16,
    fontSize: 10,
    marginLeft: 8,
  },
  expandIcon: {
    color: theme.palette.type === 'dark' 
      ? theme.palette.grey[400] 
      : theme.palette.text.secondary,
  }
}));

function ListItemLink(props) {
  const { icon, primary, to, className, badge, badgeColor, collapsed } = props;
  const classes = useStyles();
  const history = useHistory();
  const isActive = history.location.pathname === to;

  const renderLink = React.useMemo(
    () =>
      React.forwardRef((itemProps, ref) => (
        <RouterLink to={to} ref={ref} {...itemProps} />
      )),
    [to]
  );

  const item = (
    <li>
      <ListItem
        button
        dense
        component={renderLink}
        className={`${classes.listItem} ${isActive ? classes.listItemActive : ''} ${className || ''}`}
        style={collapsed ? { justifyContent: "center", paddingLeft: 0, paddingRight: 0 } : {}}
      >
        {icon ? (
          <ListItemIcon
            className={classes.listItemIcon}
            style={collapsed ? { minWidth: 0, justifyContent: "center", marginRight: 0 } : {}}
          >
            {badge ? (
              <Badge
                color={badgeColor || "secondary"}
                variant="dot"
                invisible={!badge}
                className={classes.badge}
              >
                {icon}
              </Badge>
            ) : (
              icon
            )}
          </ListItemIcon>
        ) : null}
        {!collapsed && (
          <ListItemText
            primary={primary}
            primaryTypographyProps={{ className: classes.listItemText }}
          />
        )}
      </ListItem>
    </li>
  );

  if (collapsed) {
    return (
      <Tooltip title={primary} placement="right" arrow>
        {item}
      </Tooltip>
    );
  }

  return item;
}

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

const MainListItems = (props) => {
  const classes = useStyles();
  const { drawerClose, collapsed } = props;
  const { user } = useContext(AuthContext);
  const [openCampaignSubmenu, setOpenCampaignSubmenu] = useState(false);
  const [openFlowsSubmenu, setOpenFlowsSubmenu] = useState(false);
  const [showCampaigns, setShowCampaigns] = useState(false);
  const [showKanban, setShowKanban] = useState(false);
  const history = useHistory();

  const [invisible, setInvisible] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchParam] = useState("");
  const [chats, dispatch] = useReducer(reducer, []);
  const { getPlanCompany } = usePlans();
  
  const socketManager = useContext(SocketContext);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    async function fetchData() {
      const companyId = user.companyId;
      const planConfigs = await getPlanCompany(undefined, companyId);

      setShowCampaigns(planConfigs.plan.useCampaigns);
      setShowKanban(planConfigs.plan.useKanban);
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchChats();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParam, pageNumber]);

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    const socket = socketManager.getSocket(companyId);

    socket.on(`company-${companyId}-chat`, (data) => {
      if (data.action === "new-message") {
        dispatch({ type: "CHANGE_CHAT", payload: data });
      }
      if (data.action === "update") {
        dispatch({ type: "CHANGE_CHAT", payload: data });
      }
    });
    return () => {
      socket.disconnect();
    };
  }, [socketManager]);

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
    if (unreadsCount > 0) {
      setInvisible(false);
    } else {
      setInvisible(true);
    }
  }, [chats, user.id]);

  useEffect(() => {
    if (localStorage.getItem("cshow")) {
      setShowCampaigns(true);
    }
  }, []);

  const fetchChats = async () => {
    try {
      const { data } = await api.get("/chats/", {
        params: { searchParam, pageNumber },
      });
      dispatch({ type: "LOAD_CHATS", payload: data.records });
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <div onClick={drawerClose}>

      {/* 1. Dashboard */}
      <Can
        role={user.profile}
        perform="dashboard:view"
        yes={() => (
          <ListItemLink to="/" primary="Dashboard" icon={<DashboardOutlinedIcon />} collapsed={collapsed} />
        )}
      />

      {/* 2. Atendimentos */}
      <ListItemLink
        to="/tickets"
        primary={i18n.t("mainDrawer.listItems.tickets")}
        icon={<ChatBubbleOutlineOutlinedIcon />}
        collapsed={collapsed}
      />

      {/* 3. Kanban */}
      {showKanban && (
        <ListItemLink to="/kanban" primary="Kanban" icon={<ViewComfyOutlinedIcon />} collapsed={collapsed} />
      )}

      {/* 4. Contatos */}
      <ListItemLink
        to="/contacts"
        primary={i18n.t("mainDrawer.listItems.contacts")}
        icon={<PermContactCalendarOutlinedIcon />}
        collapsed={collapsed}
      />

      {/* 5-6. Campanhas + Fluxos (admin) */}
      <Can
        role={user.profile}
        perform="drawer-admin-items:view"
        yes={() => (
          <>
            {showCampaigns && (
              <>
                {collapsed ? (
                  /* Modo encolhido: apenas ícone + tooltip */
                  <>
                    <Tooltip title={i18n.t("mainDrawer.listItems.campaigns")} placement="right" arrow>
                      <li>
                        <ListItem
                          button
                          onClick={() => history.push("/campaigns")}
                          className={classes.listItem}
                          style={{ justifyContent: "center", paddingLeft: 0, paddingRight: 0 }}
                        >
                          <ListItemIcon className={classes.listItemIcon} style={{ minWidth: 0, justifyContent: "center", marginRight: 0 }}>
                            <EventAvailableOutlinedIcon />
                          </ListItemIcon>
                        </ListItem>
                      </li>
                    </Tooltip>
                    <Tooltip title={i18n.t("mainDrawer.listItems.flows")} placement="right" arrow>
                      <li>
                        <ListItem
                          button
                          onClick={() => history.push("/flowbuilders")}
                          className={classes.listItem}
                          style={{ justifyContent: "center", paddingLeft: 0, paddingRight: 0 }}
                        >
                          <ListItemIcon className={classes.listItemIcon} style={{ minWidth: 0, justifyContent: "center", marginRight: 0 }}>
                            <AccountTreeOutlinedIcon />
                          </ListItemIcon>
                        </ListItem>
                      </li>
                    </Tooltip>
                  </>
                ) : (
                  <>
                    {/* Campanhas expandido */}
                    <ListItem
                      button
                      onClick={() => setOpenCampaignSubmenu((prev) => !prev)}
                      className={classes.listItem}
                    >
                      <ListItemIcon className={classes.listItemIcon}>
                        <EventAvailableOutlinedIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={i18n.t("mainDrawer.listItems.campaigns")}
                        primaryTypographyProps={{ className: classes.listItemText }}
                      />
                      {openCampaignSubmenu
                        ? <ExpandLessOutlinedIcon fontSize="small" className={classes.expandIcon} />
                        : <ExpandMoreOutlinedIcon fontSize="small" className={classes.expandIcon} />}
                    </ListItem>
                    <Collapse in={openCampaignSubmenu} timeout="auto" unmountOnExit className={classes.nestedList}>
                      <List component="div" disablePadding>
                        <ListItem button onClick={() => history.push("/campaigns")} className={classes.listItem}>
                          <ListItemIcon className={classes.listItemIcon}><ListAltOutlinedIcon /></ListItemIcon>
                          <ListItemText primary="Listagem" primaryTypographyProps={{ className: classes.listItemText }} />
                        </ListItem>
                        <ListItem button onClick={() => history.push("/contact-lists")} className={classes.listItem}>
                          <ListItemIcon className={classes.listItemIcon}><PeopleOutlinedIcon /></ListItemIcon>
                          <ListItemText primary="Listas de Contatos" primaryTypographyProps={{ className: classes.listItemText }} />
                        </ListItem>
                        <ListItem button onClick={() => history.push("/campaigns-config")} className={classes.listItem}>
                          <ListItemIcon className={classes.listItemIcon}><SettingsOutlinedIcon /></ListItemIcon>
                          <ListItemText primary="Configurações" primaryTypographyProps={{ className: classes.listItemText }} />
                        </ListItem>
                      </List>
                    </Collapse>

                    {/* Fluxos expandido */}
                    <ListItem
                      button
                      onClick={() => setOpenFlowsSubmenu((prev) => !prev)}
                      className={classes.listItem}
                    >
                      <ListItemIcon className={classes.listItemIcon}>
                        <AccountTreeOutlinedIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={i18n.t("mainDrawer.listItems.flows")}
                        primaryTypographyProps={{ className: classes.listItemText }}
                      />
                      {openFlowsSubmenu
                        ? <ExpandLessOutlinedIcon fontSize="small" className={classes.expandIcon} />
                        : <ExpandMoreOutlinedIcon fontSize="small" className={classes.expandIcon} />}
                    </ListItem>
                    <Collapse in={openFlowsSubmenu} timeout="auto" unmountOnExit className={classes.nestedList}>
                      <List component="div" disablePadding>
                        <ListItem button onClick={() => history.push("/phrase-lists")} className={classes.listItem}>
                          <ListItemIcon className={classes.listItemIcon}><EventAvailableOutlinedIcon /></ListItemIcon>
                          <ListItemText primary="Campanha" primaryTypographyProps={{ className: classes.listItemText }} />
                        </ListItem>
                        <ListItem button onClick={() => history.push("/flowbuilders")} className={classes.listItem}>
                          <ListItemIcon className={classes.listItemIcon}><AccountTreeOutlinedIcon /></ListItemIcon>
                          <ListItemText primary="Conversa" primaryTypographyProps={{ className: classes.listItemText }} />
                        </ListItem>
                        <ListItem button onClick={() => history.push("/followup")} className={classes.listItem}>
                          <ListItemIcon className={classes.listItemIcon}><RepeatOneOutlinedIcon /></ListItemIcon>
                          <ListItemText primary="Follow-up" primaryTypographyProps={{ className: classes.listItemText }} />
                        </ListItem>
                      </List>
                    </Collapse>
                  </>
                )}
              </>
            )}
          </>
        )}
      />

      {/* 7. Respostas Rápidas */}
      <ListItemLink
        to="/quick-messages"
        primary={i18n.t("mainDrawer.listItems.quickMessages")}
        icon={<FlashOnOutlinedIcon />}
        collapsed={collapsed}
      />

      {/* 8. Agendamentos */}
      <ListItemLink
        to="/schedules"
        primary={i18n.t("mainDrawer.listItems.schedules")}
        icon={<EventOutlinedIcon />}
        collapsed={collapsed}
      />

      {/* 9. Chat Interno */}
      <ListItemLink
        to="/chats"
        primary={i18n.t("mainDrawer.listItems.chats")}
        icon={<ForumOutlinedIcon />}
        badge={!invisible}
        collapsed={collapsed}
      />

      {/* 10. Configurações (admin) */}
      <Can
        role={user.profile}
        perform="drawer-admin-items:view"
        yes={() => (
          <ListItemLink
            to="/settings"
            primary={i18n.t("mainDrawer.listItems.settings")}
            icon={<SettingsOutlinedIcon />}
            collapsed={collapsed}
          />
        )}
      />

    </div>
  );
};

export default MainListItems;