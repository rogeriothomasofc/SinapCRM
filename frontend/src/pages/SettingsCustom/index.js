import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import { makeStyles, Paper, Tabs, Tab, Grid, Box, Typography, Divider } from "@material-ui/core";

import TabPanel from "../../components/TabPanel";
import SchedulesForm from "../../components/SchedulesForm";
import CompaniesManager from "../../components/CompaniesManager";
import PlansManager from "../../components/PlansManager";
import HelpsManager from "../../components/HelpsManager";
import Options from "../../components/Settings/Options";
import PaymentSettings from "../../components/Settings/PaymentSettings";
import OnlyForSuperUser from "../../components/OnlyForSuperUser";

import SyncOutlinedIcon from "@material-ui/icons/SyncOutlined";
import PeopleOutlinedIcon from "@material-ui/icons/PeopleOutlined";
import AccountTreeOutlinedIcon from "@material-ui/icons/AccountTreeOutlined";
import LabelOutlinedIcon from "@material-ui/icons/LabelOutlined";
import AttachFileOutlinedIcon from "@material-ui/icons/AttachFileOutlined";
import AllInclusiveOutlinedIcon from "@material-ui/icons/AllInclusiveOutlined";
import DeviceHubOutlinedIcon from "@material-ui/icons/DeviceHubOutlined";
import CodeOutlinedIcon from "@material-ui/icons/CodeOutlined";
import AttachMoneyOutlinedIcon from "@material-ui/icons/AttachMoneyOutlined";
import HelpOutlineOutlinedIcon from "@material-ui/icons/HelpOutlineOutlined";
import TuneOutlinedIcon from "@material-ui/icons/TuneOutlined";
import BrushOutlinedIcon from "@material-ui/icons/BrushOutlined";

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
  },
  tab: { backgroundColor: theme.palette.options, borderRadius: 4 },
  paper: {
    ...theme.scrollbarStyles,
    overflowY: "scroll",
    padding: theme.spacing(2),
    display: "flex",
    alignItems: "center",
    width: "100%",
  },
  container: { width: "100%", maxHeight: "100%" },

  // Hub styles
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
    marginBottom: theme.spacing(1.5),
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
  const [tab, setTab] = useState("options");
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

  const handleTabChange = (event, newValue) => {
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
        const u = await getCurrentUserInfo();
        setCurrentUser(u);
      } catch (e) {
        toast.error(e);
      }
      setLoading(false);
    }
    findData();
    setTab(newValue);
  };

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

  const isSuper = () => currentUser.super;
  const go = (path) => history.push(path);

  const HUB_SECTIONS = [
    {
      label: "WhatsApp",
      items: [
        { icon: <SyncOutlinedIcon />, label: "Conexões", desc: "Gerencie seus números conectados", path: "/connections", always: true },
      ],
    },
    {
      label: "Equipe",
      items: [
        { icon: <PeopleOutlinedIcon />, label: "Usuários", desc: "Atendentes e permissões", path: "/users", always: true },
        { icon: <AccountTreeOutlinedIcon />, label: "Setores", desc: "Filas de atendimento", path: "/queues", always: true },
      ],
    },
    {
      label: "Atendimento",
      items: [
        { icon: <LabelOutlinedIcon />, label: "Etiquetas", desc: "Tags e abas do CRM", path: "/tags", always: true },
        { icon: <AttachFileOutlinedIcon />, label: "Arquivos", desc: "Biblioteca de arquivos", path: "/files", always: true },
      ],
    },
    {
      label: "Automação",
      items: [
        { icon: <AllInclusiveOutlinedIcon />, label: "IA / Prompts", desc: "Configurações de inteligência artificial", path: "/prompts", show: planConfig.useOpenAi },
        { icon: <DeviceHubOutlinedIcon />, label: "Integrações", desc: "Integrações com sistemas externos", path: "/queue-integration", show: planConfig.useIntegrations },
        { icon: <CodeOutlinedIcon />, label: "API Externa", desc: "Acesso via API para envio de mensagens", path: "/messages-api", show: planConfig.useExternalApi },
      ],
    },
    {
      label: "Sistema",
      items: [
        { icon: <AttachMoneyOutlinedIcon />, label: "Financeiro", desc: "Assinatura e pagamentos", path: "/financeiro", always: true },
        { icon: <HelpOutlineOutlinedIcon />, label: "Ajuda", desc: "Tutoriais e suporte", path: "/helps", always: true },
        { icon: <BrushOutlinedIcon />, label: "Identidade Visual", desc: "Logo, cores e nome do sistema", path: "/whitelabel", show: isSuper() },
      ],
    },
  ];

  return (
    <MainContainer className={classes.root}>
      <MainHeader>
        <Title>{i18n.t("settings.title")}</Title>
      </MainHeader>

      <Paper className={classes.mainPaper} elevation={1} style={{ padding: "20px 24px" }}>

        {/* Cards de navegação */}
        {HUB_SECTIONS.map((section) => {
          const visibleItems = section.items.filter(item => item.always || item.show);
          if (!visibleItems.length) return null;
          return (
            <Box key={section.label} className={classes.hubSection}>
              <Typography className={classes.sectionLabel}>{section.label}</Typography>
              <Grid container spacing={2}>
                {visibleItems.map((item) => (
                  <Grid item xs={12} sm={6} md={4} key={item.path}>
                    <NavCard
                      icon={item.icon}
                      label={item.label}
                      description={item.desc}
                      onClick={() => go(item.path)}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          );
        })}

        <Divider className={classes.hubDivider} />

        {/* Configurações Gerais (abas existentes) */}
        <Box style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <TuneOutlinedIcon style={{ fontSize: 18, color: "#888" }} />
          <Typography className={classes.generalTitle}>CONFIGURAÇÕES GERAIS</Typography>
        </Box>

        <Tabs
          value={tab}
          indicatorColor="primary"
          textColor="primary"
          scrollButtons="on"
          variant="scrollable"
          onChange={handleTabChange}
          className={classes.tab}
        >
          <Tab label={i18n.t("settings.tabs.options")} value={"options"} />
          {schedulesEnabled && <Tab label={i18n.t("settings.tabs.schedules")} value={"schedules"} />}
          {isSuper() ? <Tab label={i18n.t("settings.tabs.companies")} value={"companies"} /> : null}
          {isSuper() ? <Tab label={i18n.t("settings.tabs.plans")} value={"plans"} /> : null}
          {isSuper() ? <Tab label={i18n.t("settings.tabs.helps")} value={"helps"} /> : null}
          {isSuper() ? <Tab label="Pagamentos" value={"payments"} /> : null}
        </Tabs>

        <Paper className={classes.paper} elevation={0}>
          <TabPanel className={classes.container} value={tab} name={"schedules"}>
            <SchedulesForm loading={loading} onSubmit={handleSubmitSchedules} initialValues={schedules} />
          </TabPanel>
          <OnlyForSuperUser user={currentUser} yes={() => (
            <TabPanel className={classes.container} value={tab} name={"companies"}>
              <CompaniesManager />
            </TabPanel>
          )} />
          <OnlyForSuperUser user={currentUser} yes={() => (
            <TabPanel className={classes.container} value={tab} name={"plans"}>
              <PlansManager />
            </TabPanel>
          )} />
          <OnlyForSuperUser user={currentUser} yes={() => (
            <TabPanel className={classes.container} value={tab} name={"helps"}>
              <HelpsManager />
            </TabPanel>
          )} />
          <TabPanel className={classes.container} value={tab} name={"options"}>
            <Options settings={settings} scheduleTypeChanged={(value) => setSchedulesEnabled(value === "company")} />
          </TabPanel>
          <OnlyForSuperUser user={currentUser} yes={() => (
            <TabPanel className={classes.container} value={tab} name={"payments"}>
              <PaymentSettings />
            </TabPanel>
          )} />
        </Paper>
      </Paper>
    </MainContainer>
  );
};

export default SettingsCustom;
