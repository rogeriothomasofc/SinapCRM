import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

import { makeStyles } from "@material-ui/core/styles";
import {
  Paper,
  Button,
  IconButton,
  TextField,
  Typography,
  Box,
  Fade,
  useTheme,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  Tooltip,
  Divider,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@material-ui/core";

import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import AddIcon from "@material-ui/icons/Add";
import SaveIcon from "@material-ui/icons/Save";
import SettingsIcon from "@material-ui/icons/Settings";
import TimerIcon from "@material-ui/icons/Timer";
import CodeIcon from "@material-ui/icons/Code";
import CloseIcon from "@material-ui/icons/Close";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import AccessTimeIcon from "@material-ui/icons/AccessTime";
import ScheduleIcon from "@material-ui/icons/Schedule";
import AvTimerIcon from "@material-ui/icons/AvTimer";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import ConfirmationModal from "../../components/ConfirmationModal";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(2),
    overflowY: "auto",
    backgroundColor: theme.palette.background.default,
    ...theme.scrollbarStyles,
  },
  sectionCard: {
    marginBottom: theme.spacing(2),
    borderRadius: 8,
    border: `1px solid ${theme.palette.divider}`,
    overflow: "hidden",
    transition: "all 0.2s ease",
    "&:hover": {
      boxShadow: theme.shadows[2],
    },
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    borderBottom: `1px solid ${theme.palette.divider}`,
    cursor: "pointer",
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
  },
  sectionIcon: {
    marginRight: theme.spacing(2),
    color: theme.palette.primary.main,
  },
  sectionTitle: {
    flex: 1,
    fontWeight: 600,
    fontSize: "1rem",
  },
  sectionContent: {
    padding: theme.spacing(3),
    backgroundColor: theme.palette.background.paper,
  },
  intervalCard: {
    padding: theme.spacing(2),
    borderRadius: 8,
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.default,
    marginBottom: theme.spacing(2),
    transition: "all 0.2s ease",
    "&:hover": {
      borderColor: theme.palette.primary.main,
      backgroundColor: theme.palette.background.paper,
    },
  },
  intervalHeader: {
    display: "flex",
    alignItems: "center",
    marginBottom: theme.spacing(1),
  },
  intervalIcon: {
    marginRight: theme.spacing(1),
    fontSize: "1.25rem",
    color: theme.palette.primary.main,
  },
  intervalTitle: {
    fontWeight: 500,
    fontSize: "0.875rem",
    color: theme.palette.text.primary,
  },
  formControl: {
    minWidth: "100%",
  },
  variableRow: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(1.5),
    marginBottom: theme.spacing(1),
    borderRadius: 6,
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.default,
    transition: "all 0.2s ease",
    "&:hover": {
      backgroundColor: theme.palette.background.paper,
      borderColor: theme.palette.primary.main,
    },
  },
  variableKey: {
    fontFamily: "monospace",
    backgroundColor: theme.palette.action.hover,
    padding: "4px 8px",
    borderRadius: 4,
    fontSize: "0.875rem",
    fontWeight: 500,
    color: theme.palette.primary.main,
  },
  variableValue: {
    flex: 1,
    marginLeft: theme.spacing(2),
    color: theme.palette.text.secondary,
    fontSize: "0.875rem",
  },
  addVariableForm: {
    padding: theme.spacing(2),
    borderRadius: 8,
    backgroundColor: theme.palette.background.default,
    border: `1px solid ${theme.palette.primary.main}`,
    marginTop: theme.spacing(2),
  },
  actionButtons: {
    display: "flex",
    gap: theme.spacing(1),
    justifyContent: "flex-end",
    marginTop: theme.spacing(2),
  },
  saveButton: {
    borderRadius: 6,
    textTransform: "none",
    fontWeight: 500,
    padding: "8px 24px",
    boxShadow: "none",
    "&:hover": {
      boxShadow: theme.shadows[2],
    },
  },
  emptyVariables: {
    textAlign: "center",
    padding: theme.spacing(4),
    color: theme.palette.text.secondary,
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    padding: theme.spacing(4),
  },
  headerContent: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },
  infoChip: {
    marginLeft: theme.spacing(1),
  },
}));

const initialSettings = {
  messageInterval: 20,
  longerIntervalAfter: 20,
  greaterInterval: 60,
  variables: [],
};

const CampaignsConfig = () => {
  const classes = useStyles();
  const theme = useTheme();

  const [settings, setSettings] = useState(initialSettings);
  const [showVariablesForm, setShowVariablesForm] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState(null);
  const [variable, setVariable] = useState({ key: "", value: "" });
  const [loading, setLoading] = useState(true);
  const [sectionsExpanded, setSectionsExpanded] = useState({
    intervals: true,
    variables: true,
  });

  useEffect(() => {
    api.get("/campaign-settings").then(({ data }) => {
      const settingsList = [];
      if (Array.isArray(data) && data.length > 0) {
        data.forEach((item) => {
          settingsList.push([item.key, JSON.parse(item.value)]);
        });
        setSettings(Object.fromEntries(settingsList));
      }
      setLoading(false);
    });
  }, []);

  const handleOnChangeVariable = (e) => {
    if (e.target.value !== null) {
      const changedProp = {};
      changedProp[e.target.name] = e.target.value;
      setVariable((prev) => ({ ...prev, ...changedProp }));
    }
  };

  const handleOnChangeSettings = (e) => {
    const changedProp = {};
    changedProp[e.target.name] = e.target.value;
    setSettings((prev) => ({ ...prev, ...changedProp }));
  };

  const addVariable = () => {
    if (!variable.key || !variable.value) {
      toast.error("Preencha todos os campos");
      return;
    }

    setSettings((prev) => {
      const variablesExists = settings.variables.filter(
        (v) => v.key === variable.key
      );
      const variables = prev.variables;
      if (variablesExists.length === 0) {
        variables.push(Object.assign({}, variable));
        setVariable({ key: "", value: "" });
        setShowVariablesForm(false);
        toast.success("Variável adicionada");
      } else {
        toast.error("Esta variável já existe");
      }
      return { ...prev, variables };
    });
  };

  const removeVariable = () => {
    const newList = settings.variables.filter((v) => v.key !== selectedKey);
    setSettings((prev) => ({ ...prev, variables: newList }));
    setSelectedKey(null);
    toast.success("Variável removida");
  };

  const saveSettings = async () => {
    await api.post("/campaign-settings", { settings });
    toast.success(i18n.t("campaigns.toasts.configSaved"));
  };

  const toggleSection = (section) => {
    setSectionsExpanded((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  if (loading) {
    return (
      <MainContainer>
        <Box className={classes.loadingContainer}>
          <CircularProgress />
        </Box>
      </MainContainer>
    );
  }

  return (
    <MainContainer>
      <ConfirmationModal
        title={i18n.t("campaigns.confirmationModal.deleteTitle")}
        open={confirmationOpen}
        onClose={() => setConfirmationOpen(false)}
        onConfirm={removeVariable}
      >
        {i18n.t("campaigns.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      
      <MainHeader>
        <Box className={classes.headerContent}>
          <Title>{i18n.t("campaignsConfig.title")}</Title>
          <Chip
            icon={<SettingsIcon style={{ fontSize: "1rem" }} />}
            label="Configurações Globais"
            size="small"
            color="primary"
            variant="outlined"
          />
        </Box>
        
        <MainHeaderButtonsWrapper>
          <Button
            variant="contained"
            color="primary"
            onClick={saveSettings}
            startIcon={<SaveIcon />}
            className={classes.saveButton}
            size="small"
          >
            {i18n.t("campaigns.config.save")}
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>
      
      <Paper className={classes.mainPaper} elevation={0}>
        {/* Seção de Intervalos */}
        <Fade in={true} timeout={300}>
          <Card className={classes.sectionCard}>
            <Box
              className={classes.sectionHeader}
              onClick={() => toggleSection("intervals")}
            >
              <TimerIcon className={classes.sectionIcon} />
              <Typography className={classes.sectionTitle}>
                {i18n.t("campaigns.config.interval")}
              </Typography>
              {sectionsExpanded.intervals ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </Box>
            
            {sectionsExpanded.intervals && (
              <Box className={classes.sectionContent}>
                <Box className={classes.intervalCard}>
                  <Box className={classes.intervalHeader}>
                    <AccessTimeIcon className={classes.intervalIcon} />
                    <Typography className={classes.intervalTitle}>
                      Intervalo entre mensagens
                    </Typography>
                  </Box>
                  <FormControl
                    variant="outlined"
                    className={classes.formControl}
                    size="small"
                  >
                    <InputLabel id="messageInterval-label">
                      {i18n.t("campaigns.config.randomInterval")}
                    </InputLabel>
                    <Select
                      name="messageInterval"
                      id="messageInterval"
                      labelId="messageInterval-label"
                      label={i18n.t("campaigns.config.randomInterval")}
                      value={settings.messageInterval}
                      onChange={(e) => handleOnChangeSettings(e)}
                    >
                      <MenuItem value={0}>{i18n.t("campaigns.config.noInterval")}</MenuItem>
                      <MenuItem value={5}>5 {i18n.t("campaigns.config.seconds")}</MenuItem>
                      <MenuItem value={10}>10 {i18n.t("campaigns.config.seconds")}</MenuItem>
                      <MenuItem value={15}>15 {i18n.t("campaigns.config.seconds")}</MenuItem>
                      <MenuItem value={20}>20 {i18n.t("campaigns.config.seconds")}</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                <Box className={classes.intervalCard}>
                  <Box className={classes.intervalHeader}>
                    <ScheduleIcon className={classes.intervalIcon} />
                    <Typography className={classes.intervalTitle}>
                      Aplicar intervalo maior após X mensagens
                    </Typography>
                  </Box>
                  <FormControl
                    variant="outlined"
                    className={classes.formControl}
                    size="small"
                  >
                    <InputLabel id="longerIntervalAfter-label">
                      {i18n.t("campaigns.config.biggerInterval")}
                    </InputLabel>
                    <Select
                      name="longerIntervalAfter"
                      id="longerIntervalAfter"
                      labelId="longerIntervalAfter-label"
                      label={i18n.t("campaigns.config.biggerInterval")}
                      value={settings.longerIntervalAfter}
                      onChange={(e) => handleOnChangeSettings(e)}
                    >
                      <MenuItem value={0}>{i18n.t("campaigns.config.notDefined")}</MenuItem>
                      <MenuItem value={1}>1 {i18n.t("campaigns.config.second")}</MenuItem>
                      <MenuItem value={5}>5 {i18n.t("campaigns.config.seconds")}</MenuItem>
                      <MenuItem value={10}>10 {i18n.t("campaigns.config.seconds")}</MenuItem>
                      <MenuItem value={15}>15 {i18n.t("campaigns.config.seconds")}</MenuItem>
                      <MenuItem value={20}>20 {i18n.t("campaigns.config.seconds")}</MenuItem>
                      <MenuItem value={30}>30 {i18n.t("campaigns.config.seconds")}</MenuItem>
                      <MenuItem value={40}>40 {i18n.t("campaigns.config.seconds")}</MenuItem>
                      <MenuItem value={60}>60 {i18n.t("campaigns.config.seconds")}</MenuItem>
                      <MenuItem value={80}>80 {i18n.t("campaigns.config.seconds")}</MenuItem>
                      <MenuItem value={100}>100 {i18n.t("campaigns.config.seconds")}</MenuItem>
                      <MenuItem value={120}>120 {i18n.t("campaigns.config.seconds")}</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                <Box className={classes.intervalCard}>
                  <Box className={classes.intervalHeader}>
                    <AvTimerIcon className={classes.intervalIcon} />
                    <Typography className={classes.intervalTitle}>
                      Intervalo maior (segundos)
                    </Typography>
                  </Box>
                  <FormControl
                    variant="outlined"
                    className={classes.formControl}
                    size="small"
                  >
                    <InputLabel id="greaterInterval-label">
                      {i18n.t("campaigns.config.greaterInterval")}
                    </InputLabel>
                    <Select
                      name="greaterInterval"
                      id="greaterInterval"
                      labelId="greaterInterval-label"
                      label={i18n.t("campaigns.config.greaterInterval")}
                      value={settings.greaterInterval}
                      onChange={(e) => handleOnChangeSettings(e)}
                    >
                      <MenuItem value={0}>{i18n.t("campaigns.config.noInterval")}</MenuItem>
                      <MenuItem value={1}>1 {i18n.t("campaigns.config.second")}</MenuItem>
                      <MenuItem value={5}>5 {i18n.t("campaigns.config.seconds")}</MenuItem>
                      <MenuItem value={10}>10 {i18n.t("campaigns.config.seconds")}</MenuItem>
                      <MenuItem value={15}>15 {i18n.t("campaigns.config.seconds")}</MenuItem>
                      <MenuItem value={20}>20 {i18n.t("campaigns.config.seconds")}</MenuItem>
                      <MenuItem value={30}>30 {i18n.t("campaigns.config.seconds")}</MenuItem>
                      <MenuItem value={40}>40 {i18n.t("campaigns.config.seconds")}</MenuItem>
                      <MenuItem value={60}>60 {i18n.t("campaigns.config.seconds")}</MenuItem>
                      <MenuItem value={80}>80 {i18n.t("campaigns.config.seconds")}</MenuItem>
                      <MenuItem value={100}>100 {i18n.t("campaigns.config.seconds")}</MenuItem>
                      <MenuItem value={120}>120 {i18n.t("campaigns.config.seconds")}</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>
            )}
          </Card>
        </Fade>

        {/* Seção de Variáveis */}
        <Fade in={true} timeout={400}>
          <Card className={classes.sectionCard}>
            <Box
              className={classes.sectionHeader}
              onClick={() => toggleSection("variables")}
            >
              <CodeIcon className={classes.sectionIcon} />
              <Typography className={classes.sectionTitle}>
                Variáveis Personalizadas
              </Typography>
              {settings.variables.length > 0 && (
                <Chip
                  label={settings.variables.length}
                  size="small"
                  className={classes.infoChip}
                />
              )}
              {sectionsExpanded.variables ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </Box>
            
            {sectionsExpanded.variables && (
              <Box className={classes.sectionContent}>
                {!showVariablesForm && (
                  <Button
                    onClick={() => setShowVariablesForm(true)}
                    color="primary"
                    variant="outlined"
                    startIcon={<AddIcon />}
                    fullWidth
                    style={{ marginBottom: 16 }}
                  >
                    {i18n.t("campaigns.config.addVariable")}
                  </Button>
                )}

                {showVariablesForm && (
                  <Fade in={true}>
                    <Box className={classes.addVariableForm}>
                      <Typography variant="subtitle2" style={{ marginBottom: 16 }}>
                        Adicionar nova variável
                      </Typography>
                      
                      <TextField
                        label={i18n.t("campaigns.config.shortcut")}
                        variant="outlined"
                        value={variable.key}
                        name="key"
                        onChange={handleOnChangeVariable}
                        fullWidth
                        size="small"
                        style={{ marginBottom: 12 }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Typography style={{ color: theme.palette.text.secondary }}>
                                {"{"}
                              </Typography>
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <Typography style={{ color: theme.palette.text.secondary }}>
                                {"}"}
                              </Typography>
                            </InputAdornment>
                          ),
                        }}
                      />
                      
                      <TextField
                        label={i18n.t("campaigns.config.content")}
                        variant="outlined"
                        value={variable.value}
                        name="value"
                        onChange={handleOnChangeVariable}
                        fullWidth
                        size="small"
                        multiline
                        rows={2}
                      />
                      
                      <Box className={classes.actionButtons}>
                        <Button
                          onClick={() => {
                            setShowVariablesForm(false);
                            setVariable({ key: "", value: "" });
                          }}
                          color="default"
                          startIcon={<CloseIcon />}
                        >
                          {i18n.t("campaigns.config.close")}
                        </Button>
                        <Button
                          onClick={addVariable}
                          color="primary"
                          variant="contained"
                          startIcon={<AddIcon />}
                        >
                          {i18n.t("campaigns.config.add")}
                        </Button>
                      </Box>
                    </Box>
                  </Fade>
                )}

                {settings.variables.length === 0 && !showVariablesForm ? (
                  <Box className={classes.emptyVariables}>
                    <CodeIcon style={{ fontSize: 32, marginBottom: 8, opacity: 0.3 }} />
                    <Typography variant="body2">
                      Nenhuma variável personalizada criada
                    </Typography>
                  </Box>
                ) : (
                  <Box style={{ marginTop: showVariablesForm ? 16 : 0 }}>
                    {settings.variables.map((v, index) => (
                      <Fade in={true} timeout={200 + index * 50} key={v.key}>
                        <Box className={classes.variableRow}>
                          <span className={classes.variableKey}>{`{${v.key}}`}</span>
                          <Typography className={classes.variableValue}>
                            {v.value}
                          </Typography>
                          <Tooltip title="Remover variável">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedKey(v.key);
                                setConfirmationOpen(true);
                              }}
                            >
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Fade>
                    ))}
                  </Box>
                )}
              </Box>
            )}
          </Card>
        </Fade>
      </Paper>
    </MainContainer>
  );
};

export default CampaignsConfig;