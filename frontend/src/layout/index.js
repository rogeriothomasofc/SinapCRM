import React, { useState, useContext, useEffect } from "react";
import clsx from "clsx";
import {
  makeStyles,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  Divider,
  MenuItem,
  IconButton,
  Menu,
  Button,
  useTheme,
  useMediaQuery,
  Avatar,
  Box,
  Tooltip,
  List,
  Badge,
} from "@material-ui/core";

// Modern Icons - Usando ícones mais modernos e minimalistas
import MenuOpenIcon from "@material-ui/icons/MenuOpen";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import AccountCircleOutlinedIcon from "@material-ui/icons/AccountCircleOutlined";
import RefreshOutlinedIcon from "@material-ui/icons/RefreshOutlined";
import NotificationsNoneOutlinedIcon from "@material-ui/icons/NotificationsNoneOutlined";
import PowerSettingsNewOutlinedIcon from "@material-ui/icons/PowerSettingsNewOutlined";
import PersonOutlineIcon from "@material-ui/icons/PersonOutline";
import Brightness4OutlinedIcon from '@material-ui/icons/Brightness4Outlined';
import Brightness7OutlinedIcon from '@material-ui/icons/Brightness7Outlined';
import LanguageOutlinedIcon from "@material-ui/icons/LanguageOutlined";
import VolumeUpOutlinedIcon from "@material-ui/icons/VolumeUpOutlined";
import AnnouncementOutlinedIcon from "@material-ui/icons/AnnouncementOutlined";
import SyncOutlinedIcon from "@material-ui/icons/SyncOutlined";
import TranslateOutlinedIcon from "@material-ui/icons/TranslateOutlined";
import AccountBoxOutlinedIcon from "@material-ui/icons/AccountBoxOutlined";
import ExitToAppOutlinedIcon from "@material-ui/icons/ExitToAppOutlined";
import WbSunnyOutlinedIcon from '@material-ui/icons/WbSunnyOutlined';
import NightsStayOutlinedIcon from '@material-ui/icons/NightsStayOutlined';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import SettingsOutlinedIcon from '@material-ui/icons/SettingsOutlined';
import OpenInNewOutlinedIcon from '@material-ui/icons/OpenInNewOutlined';

import api from "../services/api";
import MainListItems from "./MainListItems";
import NotificationsVolume from "../components/NotificationsVolume";
import NotificationsPopOver from "../components/NotificationsPopOver";
import UserModal from "../components/UserModal";
import { AuthContext } from "../context/Auth/AuthContext";
import BackdropLoading from "../components/BackdropLoading";
import { i18n } from "../translate/i18n";
import toastError from "../errors/toastError";

import logo from "../assets/logo.png";
import { SocketContext } from "../context/Socket/SocketContext";

import { useDate } from "../hooks/useDate";

import ColorModeContext from "../layout/themeContext";
import LanguageControl from "../components/LanguageControl";

const drawerWidth = 132;

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    height: "100vh",
    overflow: "hidden",
    backgroundColor: theme.mode === 'dark' ? '#121212' : '#f5f6fb',
    '& ::-webkit-scrollbar': { width: '6px', height: '6px' },
    '& ::-webkit-scrollbar-track': { background: 'transparent', borderRadius: '3px' },
    '& ::-webkit-scrollbar-thumb': {
      background: theme.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
      borderRadius: '3px',
    },
  },
  // ── SIDEBAR ────────────────────────────────────────────
  sidebar: {
    width: drawerWidth,
    flexShrink: 0,
    position: 'relative',
    backgroundColor: theme.mode === 'dark' ? '#1c1c1c' : theme.palette.primary.main,
    borderRadius: '0 24px 24px 0',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    zIndex: 20,
    [theme.breakpoints.down('xs')]: { display: 'none' },
  },
  sidebarLogo: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px 8px 16px',
    minHeight: 80,
    flexShrink: 0,
  },
  logo: {
    height: 48,
    width: 48,
    objectFit: 'contain',
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  sidebarNav: {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    padding: '20px 12px',
  },
  sidebarBottom: {
    flexShrink: 0,
    display: 'flex',
    justifyContent: 'center',
    padding: '8px 8px 16px',
  },
  versionInfo: {
    fontSize: 10,
    fontWeight: 500,
    color: 'rgba(255,255,255,0.35)',
  },
  // ── RIGHT PANEL ────────────────────────────────────────
  rightPanel: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
    position: 'relative',
    zIndex: 5,
    backgroundColor: theme.mode === 'dark' ? '#1e1e1e' : '#fff',
    borderBottom: theme.mode === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e5e5e5',
    marginLeft: -24,
    padding: '16px 32px 16px 64px',
    minHeight: 96,
    gap: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: 500,
    color: theme.palette.text.primary,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  content: {
    flex: 1,
    overflow: 'auto',
  },
  // ── ACTION BUTTONS in header ───────────────────────────
  iconButton: {
    width: 40,
    height: 40,
    minWidth: 40,
    minHeight: 40,
    padding: 0,
    margin: theme.spacing(0, 0.5),
    color: '#fff',
    backgroundColor: theme.palette.primary.main,
    borderRadius: 12,
    flexShrink: 0,
    "&:hover": {
      backgroundColor: theme.palette.primary.main,
      opacity: 0.9,
    },
    "& .MuiSvgIcon-root": { color: '#fff', fontSize: 18 },
    "& .MuiTouchRipple-root": { borderRadius: 12 },
  },
  iconButtonLabel: {
    fontSize: 18,
    color: '#fff',
  },
  onlineAvatar: {
    width: 32,
    height: 32,
    fontSize: '0.75rem',
    fontWeight: 700,
    outline: `2px solid ${theme.mode === 'dark' ? '#1e1e1e' : '#fff'}`,
    marginLeft: -10,
    cursor: 'default',
  },
  userAvatar: {
    width: 32,
    height: 32,
    fontSize: '0.8rem',
    fontWeight: 700,
    cursor: 'pointer',
  },
  onlineDot: {
    backgroundColor: '#4caf50',
    outline: `2px solid ${theme.mode === 'dark' ? '#1e1e1e' : '#fff'}`,
    borderRadius: '50%',
    width: 10,
    height: 10,
  },
  overflowChip: {
    width: 32,
    height: 32,
    fontSize: '0.7rem',
    fontWeight: 700,
    backgroundColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.12)' : theme.palette.primary.main,
    color: '#fff',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -6,
    border: `2px solid ${theme.mode === 'dark' ? '#1e1e1e' : '#fff'}`,
    flexShrink: 0,
  },
  openInNewButton: {
    height: 40,
    paddingLeft: 14,
    paddingRight: 16,
    color: '#fff',
    backgroundColor: theme.palette.primary.main,
    borderRadius: 12,
    textTransform: 'none',
    fontSize: 13,
    fontWeight: 500,
    flexShrink: 0,
    "&:hover": {
      backgroundColor: theme.palette.primary.main,
      opacity: 0.9,
    },
    "& .MuiSvgIcon-root": { color: '#fff', fontSize: 18 },
  },
}));

const LoggedInLayout = ({ children, themeToggle }) => {
  const [drawerOpen, setDrawerOpen] = useState(true);
  const classes = useStyles({ drawerOpen });
  
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const { handleLogout, loading } = useContext(AuthContext);
  const [drawerVariant, setDrawerVariant] = useState("permanent");
  const { user } = useContext(AuthContext);

  const wsLogoUrl = user?.company?.settings?.find?.(s => s.key === "wsLogoUrl")?.value || null;

  const theme = useTheme();
  const { colorMode } = useContext(ColorModeContext);
  const crmTheme = useContext(ColorModeContext);

  useEffect(() => {
    const settings = user && user.company && user.company.settings;
    const colorSetting = settings && settings.find(function(s) { return s.key === "wsPrimaryColor"; });
    const color = colorSetting && colorSetting.value;
    if (color && crmTheme.setPrimaryColor) crmTheme.setPrimaryColor(color);
  }, [user]);
  const greaterThenSm = useMediaQuery(theme.breakpoints.up("sm"));

  const [volume, setVolume] = useState(localStorage.getItem("volume") || 1);
  const [onlineUsers, setOnlineUsers] = useState([]);

  const { dateToClient } = useDate();

  // Languages
  const [anchorElLanguage, setAnchorElLanguage] = useState(null);
  const [menuLanguageOpen, setMenuLanguageOpen] = useState(false);

  const socketManager = useContext(SocketContext);

  useEffect(() => {
    if (document.body.offsetWidth > 1200) {
      setDrawerOpen(true);
    }
  }, []);

  useEffect(() => {
    if (document.body.offsetWidth < 600) {
      setDrawerVariant("temporary");
    } else {
      setDrawerVariant("permanent");
    }
  }, [drawerOpen]);

  useEffect(() => {
    const fetchOnlineUsers = async () => {
      try {
        const { data } = await api.get("/users/list");
        setOnlineUsers((Array.isArray(data) ? data : []).filter(u => u.online));
      } catch (_) {}
    };
    fetchOnlineUsers();
    const interval = setInterval(fetchOnlineUsers, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    const userId = localStorage.getItem("userId");

    const socket = socketManager.getSocket(companyId);

    socket.on(`company-${companyId}-auth`, (data) => {
      if (data.user.id === +userId) {
        toastError("Sua conta foi acessada em outro computador.");
        setTimeout(() => {
          localStorage.clear();
          window.location.reload();
        }, 1000);
      }
    });

    socket.emit("userStatus");
    const interval = setInterval(() => {
      socket.emit("userStatus");
    }, 1000 * 60 * 5);

    return () => {
      socket.disconnect();
      clearInterval(interval);
    };
  }, [socketManager]);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
    setMenuOpen(true);
  };

  const handlemenuLanguage = (event) => {
    setAnchorElLanguage(event.currentTarget);
    setMenuLanguageOpen(true);
  }

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setMenuOpen(false);
  };

  const handleCloseMenuLanguage = () => {
    setAnchorElLanguage(null);
    setMenuLanguageOpen(false);
  }

  const handleOpenUserModal = () => {
    setUserModalOpen(true);
    handleCloseMenu();
  };

  const handleClickLogout = () => {
    handleCloseMenu();
    handleLogout();
  };

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const drawerClose = () => {
    if (document.body.offsetWidth < 600) {
      setDrawerOpen(false);
    }
  };

  const handleRefreshPage = () => {
    window.location.reload(false);
  }

  const toggleColorMode = () => {
    colorMode.toggleColorMode();
  }

  const getUserInitials = (name) => {
    if (!name) return "U";
    const names = name.split(" ");
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  const stringToColor = (str) => {
    if (!str) return "#6B63FF";
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    const h = hash % 360;
    return `hsl(${Math.abs(h)}, 55%, 45%)`;
  };

  if (loading) {
    return <BackdropLoading />;
  }

  return (
    <div className={classes.root}>

      {/* ── SIDEBAR ── */}
      <div className={classes.sidebar}>
        <div className={classes.sidebarNav}>
          <List disablePadding>
            <MainListItems drawerClose={drawerClose} collapsed={false} />
          </List>
        </div>

        <div className={classes.sidebarBottom}>
          <Typography className={classes.versionInfo}>v8.0.1</Typography>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className={classes.rightPanel}>

        {/* HEADER */}
        <div className={classes.header}>
          {window.self !== window.top && (
            <Button
              className={classes.openInNewButton}
              startIcon={<OpenInNewOutlinedIcon />}
              onClick={() => window.open(window.location.href, '_blank')}
            >
              Abrir em nova aba
            </Button>
          )}

          <Box flex={1} />

          <Box display="flex" alignItems="center">

            {onlineUsers.length > 0 && (
              <Box display="flex" alignItems="center" mr={0.5} ml={0.5} style={{ paddingLeft: 10 }}>
                {onlineUsers.slice(0, 4).map((u) => (
                  <Tooltip key={u.id} title={u.name}>
                    <Badge
                      overlap="circle"
                      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                      badgeContent={<span className={classes.onlineDot} />}
                    >
                      {u.avatarUrl ? (
                        <Avatar className={classes.onlineAvatar} src={u.avatarUrl} alt={u.name} />
                      ) : (
                        <Avatar className={classes.onlineAvatar} style={{ backgroundColor: stringToColor(u.name) }}>
                          {getUserInitials(u.name)}
                        </Avatar>
                      )}
                    </Badge>
                  </Tooltip>
                ))}
                {onlineUsers.length > 4 && (
                  <Tooltip title={onlineUsers.slice(4).map(u => u.name).join(", ")}>
                    <div className={classes.overflowChip}>+{onlineUsers.length - 4}</div>
                  </Tooltip>
                )}
              </Box>
            )}

            <Tooltip title={i18n.t("mainDrawer.appBar.language")}>
              <IconButton className={classes.iconButton} onClick={handlemenuLanguage}>
                <TranslateOutlinedIcon className={classes.iconButtonLabel} />
              </IconButton>
            </Tooltip>
            <Menu
              id="menu-appbar-language"
              anchorEl={anchorElLanguage}
              getContentAnchorEl={null}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              open={menuLanguageOpen}
              onClose={handleCloseMenuLanguage}
            >
              <MenuItem><LanguageControl /></MenuItem>
            </Menu>

            <Tooltip title={theme.mode === 'dark' ? i18n.t("mainDrawer.appBar.lightMode") : i18n.t("mainDrawer.appBar.darkMode")}>
              <IconButton className={classes.iconButton} onClick={toggleColorMode}>
                {theme.mode === 'dark'
                  ? <WbSunnyOutlinedIcon className={classes.iconButtonLabel} />
                  : <NightsStayOutlinedIcon className={classes.iconButtonLabel} />}
              </IconButton>
            </Tooltip>

            <NotificationsVolume setVolume={setVolume} volume={volume} />

            <Tooltip title={i18n.t("mainDrawer.appBar.refresh")}>
              <IconButton className={classes.iconButton} onClick={handleRefreshPage}>
                <SyncOutlinedIcon className={classes.iconButtonLabel} />
              </IconButton>
            </Tooltip>

            {user.id && (
              <NotificationsPopOver volume={volume} />
            )}

          </Box>
        </div>

        {/* CONTENT */}
        <main className={classes.content}>
          {children ? children : null}
        </main>
      </div>

      <UserModal
        open={userModalOpen}
        onClose={() => setUserModalOpen(false)}
        userId={user && user.id}
      />
    </div>
  );
};

export default LoggedInLayout;