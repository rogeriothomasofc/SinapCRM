import React from "react";
import {
  makeStyles,
  Box,
  Typography,
  IconButton,
  Chip,
} from "@material-ui/core";
import {
  Settings as SettingsIcon,
  Business as BusinessIcon,
  LocalOffer as PlansIcon,
  Help as HelpIcon,
} from "@material-ui/icons";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    backgroundColor: theme.palette.background.paper,
    borderBottom: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(2),
  },
  tabsContainer: {
    display: "flex",
    gap: theme.spacing(3),
    alignItems: "center",
  },
  tab: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    padding: theme.spacing(1, 2),
    borderRadius: 8,
    cursor: "pointer",
    transition: "all 0.3s ease",
    position: "relative",
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
  },
  tabActive: {
    backgroundColor: theme.palette.primary.light + "20",
    "&::after": {
      content: '""',
      position: "absolute",
      bottom: -16,
      left: 0,
      right: 0,
      height: 3,
      backgroundColor: theme.palette.primary.main,
      borderRadius: "3px 3px 0 0",
    },
  },
  tabIcon: {
    fontSize: 20,
    color: theme.palette.text.secondary,
  },
  tabIconActive: {
    color: theme.palette.primary.main,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: 500,
    color: theme.palette.text.secondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tabLabelActive: {
    color: theme.palette.primary.main,
    fontWeight: 600,
  },
  badge: {
    marginLeft: theme.spacing(1),
  },
  // Estilo alternativo com cards
  cardContainer: {
    display: "flex",
    gap: theme.spacing(2),
    padding: theme.spacing(2),
  },
  card: {
    flex: 1,
    padding: theme.spacing(2),
    borderRadius: 12,
    border: `2px solid ${theme.palette.divider}`,
    cursor: "pointer",
    transition: "all 0.3s ease",
    textAlign: "center",
    backgroundColor: theme.palette.background.paper,
    "&:hover": {
      borderColor: theme.palette.primary.light,
      transform: "translateY(-2px)",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    },
  },
  cardActive: {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.primary.light + "10",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
  },
  cardIcon: {
    fontSize: 32,
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(1),
  },
  cardIconActive: {
    color: theme.palette.primary.main,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: theme.palette.text.secondary,
  },
  cardLabelActive: {
    color: theme.palette.primary.main,
  },
}));

const tabs = [
  { id: 0, label: "OPÇÕES", icon: SettingsIcon },
  { id: 1, label: "EMPRESAS", icon: BusinessIcon, badge: 5 },
  { id: 2, label: "PLANOS", icon: PlansIcon },
  { id: 3, label: "AJUDA", icon: HelpIcon },
];

// Versão com linha inferior (similar ao original)
export function SettingsTabsLine({ value, onChange }) {
  const classes = useStyles();

  return (
    <Box className={classes.root}>
      <Box className={classes.tabsContainer}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = value === tab.id;
          
          return (
            <Box
              key={tab.id}
              className={`${classes.tab} ${isActive ? classes.tabActive : ""}`}
              onClick={() => onChange(null, tab.id)}
            >
              <Icon className={`${classes.tabIcon} ${isActive ? classes.tabIconActive : ""}`} />
              <Typography className={`${classes.tabLabel} ${isActive ? classes.tabLabelActive : ""}`}>
                {tab.label}
              </Typography>
              {tab.badge && (
                <Chip
                  label={tab.badge}
                  size="small"
                  color="secondary"
                  className={classes.badge}
                />
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

// Versão com cards visuais
export function SettingsTabsCards({ value, onChange }) {
  const classes = useStyles();

  return (
    <Box className={classes.cardContainer}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = value === tab.id;
        
        return (
          <Box
            key={tab.id}
            className={`${classes.card} ${isActive ? classes.cardActive : ""}`}
            onClick={() => onChange(null, tab.id)}
          >
            <Icon className={`${classes.cardIcon} ${isActive ? classes.cardIconActive : ""}`} />
            <Typography className={`${classes.cardLabel} ${isActive ? classes.cardLabelActive : ""}`}>
              {tab.label}
            </Typography>
            {tab.badge && (
              <Chip
                label={`+${tab.badge}`}
                size="small"
                color="secondary"
                style={{ marginTop: 8 }}
              />
            )}
          </Box>
        );
      })}
    </Box>
  );
}

// Exporta a versão padrão (linha)
export default SettingsTabsLine;