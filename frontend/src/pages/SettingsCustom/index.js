import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import { makeStyles, Paper, Grid, Box, Typography, Divider } from "@material-ui/core";

import SchedulesForm from "../../components/SchedulesForm";
import Options from "../../components/Settings/Options";

import SyncOutlinedIcon from "@material-ui/icons/SyncOutlined";
import PeopleOutlinedIcon from "@material-ui/icons/PeopleOutlined";
import AccountTreeOutlinedIcon from "@material-ui/icons/AccountTreeOutlined";
import LabelOutlinedIcon from "@material-ui/icons/LabelOutlined";
import AllInclusiveOutlinedIcon from "@material-ui/icons/AllInclusiveOutlined";
import EventOutlinedIcon from "@material-ui/icons/EventOutlined";
import TuneOutlinedIcon from "@material-ui/icons/TuneOutlined";

import { i18n } from "../../translate/i18n.js";
import { toast } from "react-toastify";
import useCompanies from "../../hooks/useCompanies";
import useAuth from "../../hooks/useAuth.js";
import useSettings from "../../hooks/useSettings";
import usePlans from "../../hooks/usePlans";

const useStyles = makeStyles((theme) => ({
  root: { flex: 1, backgroundColor: theme.palette.background.paper },
  mainPaper: {
    ...theme.scrollbarStyles,
    overflowY: "scroll",
    flex: 1,
    padding: "24px",
  },
  hubSection: { marginBottom: theme.spacing(3) },
  sectionLabel: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(1),
    paddingLeft: theme.spacing(0.5),
  },
  card: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1.5),
    padding: theme.spacing(1.5, 2),
    borderRadius: 10,
    border: `1px solid ${theme.palette.type === "dark" ? "rgba(255,255,255,0.1)" : "#EBEBEB"}`,
    cursor: "pointer",
    transition: "all 0.18s ease",
    backgroundColor: theme.palette.background.paper,
    "&:hover": {
      borderColor: theme.palette.primary.main,
      backgroundColor: theme.palette.type === "dark"
        ? "rgba(255,255,255,0.05)"
        : `${theme.palette.primary.main}08`,
      transform: "translateY(-1px)",
      boxShadow: `0 4px 12px ${theme.palette.primary.main}22`,
    },
  },
  cardIcon: {
    color: theme.palette.primary.main,
    display: "flex",
    alignItems: "center",
    "& svg": { fontSize: 22 },
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: 600,
    color: theme.palette.text.primary,
  },
  cardDesc: {
    fontSize: 11,
    color: theme.palette.text.secondary,
    marginTop: 1,
  },
  hubDivider: { margin: theme.spacing(3, 0, 2) },
  generalTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(2),
  },
}));

const NavCard = ({ icon, label, description, onClick }) => {
  const classes = useStyles();
  return (
    <Box className={classes.card} onClick={onClick}>
      <Box className={classes.cardIcon}>{icon}</Box>
      <Box>
        <Typography className={classes.cardLabel}>{label}</Typography>
        {description && <Typography className={classes.cardDesc}>{description}</Typography>}
      </Box>
    </Box>
  );
};

const SettingsCustom = () => {
  const classes = useStyles();
  const history = useHistory();
  const [schedules, setSchedules] = useState([]);
  const [company, setCompany] = useState({});
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState({});
  const [settings, setSettings] = useState({});
  const [schedulesEnabled, setSchedulesEnabled] = useState(false);
  const [planConfig, setPlanConfig] = useState({});

  const { getCurrentUserInfo } = useAuth();
  const { find, updateSchedules } = useCompanies();
  const { getAll: getAllSettings } = useSettings();
  const { getPlanCompany } = usePlans();

  useEffect(() => {
    async function findData() {
      setLoading(true);
      try {
        const companyId = localStorage.getItem("companyId");
        const company = await find(companyId);
        const settingList = await getAllSettings();
        setCompany(company);
        setSchedules(company.schedules);
        setSettings(settingList);

        if (Array.isArray(settingList)) {
          const scheduleType = settingList.find((d) => d.key === "scheduleType");
          if (scheduleType) setSchedulesEnabled(scheduleType.value === "company");
        }

        const user = await getCurrentUserInfo();
        setCurrentUser(user);

        const plan = await getPlanCompany(undefined, companyId);
        setPlanConfig(plan?.plan || {});
      } catch (e) {
        toast.error(e);
      }
      setLoading(false);
    }
    findData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmitSchedules = async (data) => {
    setLoading(true);
    try {
      setSchedules(data);
      await updateSchedules({ id: company.id, schedules: data });
      toast.success(i18n.t("settings.schedulesUpdated"));
    } catch (e) {
      toast.error(e);
    }
    setLoading(false);
  };

  const go = (path) => history.push(path);

  const HUB_SECTIONS = [
    {
      label: "Atendimento",
      items: [
        { icon: <SyncOutlinedIcon />, label: "Conexões", desc: "Números de WhatsApp conectados", path: "/connections", always: true },
        { icon: <AccountTreeOutlinedIcon />, label: "Setores", desc: "Filas de atendimento", path: "/queues", always: true },
        { icon: <LabelOutlinedIcon />, label: "Etiquetas", desc: "Tags e abas do CRM", path: "/tags", always: true },
        { icon: <EventOutlinedIcon />, label: "Horários", desc: "Horário de funcionamento do atendimento", path: null, action: "schedules", always: false },
      ],
    },
    {
      label: "Automação",
      items: [
        { icon: <AllInclusiveOutlinedIcon />, label: "IA / Prompts", desc: "Configurações de inteligência artificial", path: "/prompts", always: planConfig.useOpenAi },
        { icon: <AllInclusiveOutlinedIcon />, label: "Automações WhatsApp", desc: "Templates de mensagens automáticas da loja", path: "/ws-automations", always: true },
      ],
    },
  ];

  return (
    <MainContainer className={classes.root}>
      <MainHeader>
        <Title>{i18n.t("settings.title")}</Title>
      </MainHeader>

      <Paper className={classes.mainPaper} elevation={1}>

        <Options
          settings={settings}
          scheduleTypeChanged={(value) => setSchedulesEnabled(value === "company")}
        />

        <Divider className={classes.hubDivider} />

        <Grid container spacing={2} style={{ marginBottom: 8 }}>
          {HUB_SECTIONS.flatMap((section) =>
            section.items.filter((item) => item.always)
          ).map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.label}>
              <NavCard
                icon={item.icon}
                label={item.label}
                description={item.desc}
                onClick={() => item.path ? go(item.path) : null}
              />
            </Grid>
          ))}
        </Grid>

        {schedulesEnabled && (
          <Box mt={4}>
            <Divider style={{ marginBottom: 24 }} />
            <Box style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <EventOutlinedIcon style={{ fontSize: 18, color: "#888" }} />
              <Typography className={classes.generalTitle}>HORÁRIOS DE ATENDIMENTO</Typography>
            </Box>
            <SchedulesForm
              loading={loading}
              onSubmit={handleSubmitSchedules}
              initialValues={schedules}
            />
          </Box>
        )}

      </Paper>
    </MainContainer>
  );
};

export default SettingsCustom;
