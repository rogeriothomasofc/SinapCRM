import React, { useContext, useEffect, useState } from "react";
import { Link as RouterLink, useHistory, useLocation } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import {
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  List,
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
import ViewComfyOutlinedIcon from '@material-ui/icons/ViewComfyOutlined';
import ChatBubbleOutlineOutlinedIcon from '@material-ui/icons/ChatBubbleOutlineOutlined';
import FlashOnOutlinedIcon from "@material-ui/icons/FlashOnOutlined";

import { i18n } from "../translate/i18n";
import { AuthContext } from "../context/Auth/AuthContext";
import { Can } from "../components/Can";
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
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: 104,
    minHeight: 92,
    padding: "8px 4px",
    borderRadius: 14,
    marginBottom: 4,
    marginLeft: "auto",
    marginRight: "auto",
    transition: "background-color 160ms ease, transform 160ms ease",
    "&:hover": {
      backgroundColor: 'rgba(0, 0, 0, 0.12)',
    },
    "& .MuiListItem-root": {
      flexDirection: "column",
    },
  },
  listItemActive: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    "& $listItemIcon": {
      color: '#fff',
    },
    "& $listItemText": {
      color: '#fff',
      fontWeight: 700,
    },
  },
  listItemIcon: {
    minWidth: "unset",
    color: 'rgba(255, 255, 255, 0.85)',
    margin: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    "& svg": {
      fontSize: 32,
      color: 'rgba(255, 255, 255, 0.85)',
      display: "block",
    }
  },
  listItemText: {
    margin: 0,
    flex: "none",
    textAlign: "center",
    fontSize: 13,
    fontWeight: 500,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 1.2,
  },
  divider: {
    margin: theme.spacing(1, 0),
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  nestedList: {
    paddingLeft: theme.spacing(2.5),
  },
  versionInfo: {
    fontSize: 11,
    padding: theme.spacing(1, 2),
    textAlign: "center",
    fontWeight: 500,
    color: 'rgba(255, 255, 255, 0.4)',
  },
  connectionWarning: {
    backgroundColor: theme.palette.error.main,
    color: '#fff',
    height: 16,
    width: 16,
    fontSize: 10,
    marginLeft: 8,
  },
  expandIcon: {
    color: 'rgba(255, 255, 255, 0.6)',
  }
}));

function ListItemLink(props) {
  const { icon, primary, to, className, collapsed } = props;
  const classes = useStyles();
  const history = useHistory();
  const location = useLocation();
  const isActive = location.pathname === to;

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
        component={renderLink}
        className={`${classes.listItem} ${isActive ? classes.listItemActive : ''} ${className || ''}`}
      >
        {icon ? (
          <ListItemIcon className={classes.listItemIcon}>
            {icon}
          </ListItemIcon>
        ) : null}
        <ListItemText
          primary={primary}
          classes={{ primary: classes.listItemText }}
        />
      </ListItem>
    </li>
  );

  return item;
}

const MainListItems = (props) => {
  const classes = useStyles();
  const { drawerClose, collapsed } = props;
  const { user } = useContext(AuthContext);
  const [openCampaignSubmenu, setOpenCampaignSubmenu] = useState(false);
  const [openFlowsSubmenu, setOpenFlowsSubmenu] = useState(false);
  const [showCampaigns, setShowCampaigns] = useState(false);
  const [showKanban, setShowKanban] = useState(false);
  const history = useHistory();

  const { getPlanCompany } = usePlans();

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
    if (localStorage.getItem("cshow")) {
      setShowCampaigns(true);
    }
  }, []);

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

                    {/* Fluxos — link direto */}
                    <ListItemLink
                      to="/flowbuilders"
                      primary={i18n.t("mainDrawer.listItems.flows")}
                      icon={<AccountTreeOutlinedIcon />}
                      collapsed={collapsed}
                    />
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

      {/* 9. Configurações (admin) */}
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