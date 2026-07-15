import React, { useEffect, useState } from "react";
import {
  makeStyles, Paper, Typography, Switch, TextField,
  Button, Divider, CircularProgress, Tooltip, Chip,
  FormControlLabel, Grid, Box, FormControl, InputLabel, Select, MenuItem,
} from "@material-ui/core";
import { toast } from "react-toastify";
import RestoreIcon from "@material-ui/icons/Restore";
import AccessTimeIcon from "@material-ui/icons/AccessTime";
import ScheduleIcon from "@material-ui/icons/Schedule";
import AvTimerIcon from "@material-ui/icons/AvTimer";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";

const useStyles = makeStyles((theme) => ({
  root: { flex: 1, backgroundColor: theme.palette.background.paper },
  mainPaper: {
    ...theme.scrollbarStyles,
    overflowY: "scroll",
    flex: 1,
    padding: theme.spacing(2),
  },
  card: {
    padding: theme.spacing(3),
    marginBottom: theme.spacing(2),
    borderRadius: 12,
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing(1),
  },
  label: { fontWeight: 600, fontSize: "0.95rem" },
  desc: { color: theme.palette.text.secondary, fontSize: "0.8rem", marginBottom: theme.spacing(1.5) },
  vars: { display: "flex", flexWrap: "wrap", gap: 6, marginBottom: theme.spacing(1.5) },
  actions: { display: "flex", justifyContent: "flex-end", gap: 8, marginTop: theme.spacing(1.5) },
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
  intervalHeader: { display: "flex", alignItems: "center", marginBottom: theme.spacing(1) },
  intervalIcon: { marginRight: theme.spacing(1), fontSize: "1.25rem", color: theme.palette.primary.main },
  intervalTitle: { fontWeight: 500, fontSize: "0.875rem" },
  formControl: { minWidth: "100%" },
}));

const EVENT_CONFIG = {
  order_confirmed: {
    label: "Pedido confirmado",
    desc: "Enviada assim que o pedido é confirmado (pagamento aprovado ou confirmação manual).",
    vars: ["{{nome}}", "{{total}}", "{{loja}}", "{{pedido}}"],
    timing: null,
  },
  cart_abandoned: {
    label: "Carrinho abandonado",
    desc: "Enviada após o tempo configurado sem o cliente finalizar o pedido.",
    vars: ["{{nome}}", "{{loja}}", "{{itens}}", "{{total}}", "{{link}}"],
    timing: { field: "whatsappAutomationCartMinutes", default: 30, options: [
      { value: 10, label: "10 minutos" }, { value: 15, label: "15 minutos" },
      { value: 20, label: "20 minutos" }, { value: 30, label: "30 minutos" },
      { value: 45, label: "45 minutos" }, { value: 60, label: "1 hora" },
      { value: 120, label: "2 horas" }, { value: 180, label: "3 horas" },
    ]},
  },
  back_in_stock: {
    label: "Produto voltou ao estoque",
    desc: "Enviada quando um produto que o cliente queria volta a estar disponível.",
    vars: ["{{nome}}", "{{loja}}", "{{produto}}", "{{link}}"],
    timing: null,
  },
  payment_pix_pending: {
    label: "Pix aguardando comprovante",
    desc: "Enviada após o tempo configurado sem comprovante de pagamento.",
    vars: ["{{nome}}", "{{loja}}", "{{total}}", "{{pedido}}"],
    timing: { field: "paymentReminderHours", default: 2, options: [
      { value: 1, label: "1 hora" }, { value: 2, label: "2 horas" },
      { value: 3, label: "3 horas" }, { value: 4, label: "4 horas" },
      { value: 6, label: "6 horas" }, { value: 12, label: "12 horas" },
      { value: 24, label: "24 horas" },
    ]},
  },
  payment_gateway_pending: {
    label: "Pagamento pendente (gateway)",
    desc: "Enviada após o mesmo tempo configurado no Pix, sem pagamento via gateway.",
    vars: ["{{nome}}", "{{loja}}", "{{total}}", "{{pedido}}"],
    timing: { field: "paymentReminderHours", default: 2, sharedWith: "payment_pix_pending", options: [
      { value: 1, label: "1 hora" }, { value: 2, label: "2 horas" },
      { value: 3, label: "3 horas" }, { value: 4, label: "4 horas" },
      { value: 6, label: "6 horas" }, { value: 12, label: "12 horas" },
      { value: 24, label: "24 horas" },
    ]},
  },
};

const DEFAULT_STORE_CONFIG = {
  whatsappAutomationOrderEnabled: true,
  whatsappAutomationCartEnabled: true,
  whatsappAutomationCartMinutes: 30,
  whatsappAutomationStockEnabled: true,
  paymentReminderEnabled: false,
  paymentReminderHours: 2,
  whatsappSendDelaySeconds: 8,
  whatsappPauseEveryCount: 8,
  whatsappPauseSeconds: 180,
  autoCancelHours: 48,
};

export default function WsAutomations() {
  const classes = useStyles();
  const [automations, setAutomations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [storeConfig, setStoreConfig] = useState(null);
  const [storeConfigLoading, setStoreConfigLoading] = useState(true);
  const [storeConfigSaving, setStoreConfigSaving] = useState(false);

  useEffect(() => {
    api.get("/ws-automation")
      .then((r) => setAutomations(r.data))
      .catch(toastError)
      .finally(() => setLoading(false));

    api.get("/ws-store-config")
      .then((r) => setStoreConfig(r.data))
      .catch(() => setStoreConfig(DEFAULT_STORE_CONFIG))
      .finally(() => setStoreConfigLoading(false));
  }, []);

  const updateStoreConfig = (patch) => setStoreConfig((prev) => ({ ...prev, ...patch }));

  const saveStoreConfig = async () => {
    setStoreConfigSaving(true);
    try {
      const { data } = await api.patch("/ws-store-config", storeConfig);
      setStoreConfig(data);
      toast.success("Configurações salvas!");
    } catch (err) {
      toastError(err);
    } finally {
      setStoreConfigSaving(false);
    }
  };

  const update = (eventType, patch) => {
    setAutomations((prev) =>
      prev.map((a) => (a.eventType === eventType ? { ...a, ...patch } : a))
    );
  };

  const save = async (eventType) => {
    const auto = automations.find((a) => a.eventType === eventType);
    if (!auto) return;
    setSaving((s) => ({ ...s, [eventType]: true }));
    try {
      const cfg = EVENT_CONFIG[eventType];
      const saves = [
        api.put(`/ws-automation/${eventType}`, { message: auto.message, enabled: auto.enabled }),
      ];
      if (cfg?.timing && storeConfig) {
        saves.push(api.patch("/ws-store-config", { [cfg.timing.field]: storeConfig[cfg.timing.field] }));
      }
      const [{ data }] = await Promise.all(saves);
      update(eventType, { ...data, isCustom: true });
      toast.success("Automação salva!");
    } catch (err) {
      toastError(err);
    } finally {
      setSaving((s) => ({ ...s, [eventType]: false }));
    }
  };

  const reset = async (eventType) => {
    setSaving((s) => ({ ...s, [eventType]: true }));
    try {
      const { data } = await api.delete(`/ws-automation/${eventType}`);
      update(eventType, data);
      toast.success("Template resetado para o padrão.");
    } catch (err) {
      toastError(err);
    } finally {
      setSaving((s) => ({ ...s, [eventType]: false }));
    }
  };

  if (loading) {
    return (
      <MainContainer>
        <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
          <CircularProgress />
        </div>
      </MainContainer>
    );
  }

  return (
    <MainContainer className={classes.root}>
      <MainHeader>
        <Title>Automações WhatsApp</Title>
      </MainHeader>

      <Paper className={classes.mainPaper} elevation={1}>
        <Typography variant="body2" color="textSecondary" style={{ marginBottom: 16 }}>
          Configure as mensagens automáticas enviadas pelo WhatsApp da loja. Use as variáveis indicadas em cada automação.
        </Typography>

      {automations.map((auto) => {
        const cfg = EVENT_CONFIG[auto.eventType] || {};
        const isSaving = saving[auto.eventType];

        return (
          <Paper key={auto.eventType} className={classes.card} elevation={1}>
            <div className={classes.header}>
              <div>
                <Typography className={classes.label}>{cfg.label || auto.eventType}</Typography>
                {auto.isCustom && (
                  <Chip label="Personalizado" size="small" color="primary" style={{ marginLeft: 8, height: 18, fontSize: 11 }} />
                )}
              </div>
              <Switch
                checked={auto.enabled}
                onChange={(e) => update(auto.eventType, { enabled: e.target.checked })}
                color="primary"
                size="small"
              />
            </div>

            <Typography className={classes.desc}>{cfg.desc}</Typography>

            {cfg.timing && storeConfig && (
              <Box className={classes.intervalCard}>
                <Box className={classes.intervalHeader}>
                  <AccessTimeIcon className={classes.intervalIcon} />
                  <Typography className={classes.intervalTitle}>
                    Disparar após
                    {cfg.timing.sharedWith ? " (mesmo tempo do Pix)" : ""}
                  </Typography>
                </Box>
                <FormControl variant="outlined" className={classes.formControl} size="small">
                  <InputLabel>Tempo de espera</InputLabel>
                  <Select
                    label="Tempo de espera"
                    value={storeConfig[cfg.timing.field] ?? cfg.timing.default}
                    onChange={(e) => updateStoreConfig({ [cfg.timing.field]: e.target.value })}
                  >
                    {cfg.timing.options.map(({ value, label }) => (
                      <MenuItem key={value} value={value}>{label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            )}

            {cfg.vars?.length > 0 && (
              <div className={classes.vars}>
                <Typography variant="caption" color="textSecondary" style={{ alignSelf: "center" }}>
                  Variáveis:
                </Typography>
                {cfg.vars.map((v) => (
                  <Chip key={v} label={v} size="small" variant="outlined" style={{ fontFamily: "monospace", fontSize: 11 }} />
                ))}
              </div>
            )}

            <TextField
              value={auto.message}
              onChange={(e) => update(auto.eventType, { message: e.target.value })}
              multiline
              rows={4}
              variant="outlined"
              fullWidth
              size="small"
            />

            <div className={classes.actions}>
              {auto.isCustom && (
                <Tooltip title="Voltar para o template padrão">
                  <Button
                    size="small"
                    startIcon={<RestoreIcon />}
                    onClick={() => reset(auto.eventType)}
                    disabled={isSaving}
                  >
                    Resetar
                  </Button>
                </Tooltip>
              )}
              <Button
                size="small"
                variant="contained"
                color="primary"
                onClick={() => save(auto.eventType)}
                disabled={isSaving}
              >
                {isSaving ? <CircularProgress size={16} /> : "Salvar"}
              </Button>
            </div>

            <Divider style={{ marginTop: 0 }} />
          </Paper>
        );
      })}

      {/* Configurações de disparo da loja (lidas/salvas no WhatsApp Store) */}
      <Divider style={{ margin: "8px 0 16px" }} />
      <Typography variant="subtitle1" style={{ fontWeight: 600, marginBottom: 12 }}>
        Configurações de disparo
      </Typography>

      {storeConfigLoading ? (
        <CircularProgress size={24} />
      ) : storeConfig && (
        <Paper className={classes.card} elevation={1}>
          {/* Intervalos — mesmo estilo do Configurações de Campanha */}
          <Typography className={classes.label} style={{ marginBottom: 4 }}>
            Intervalos entre envios
          </Typography>
          <Typography className={classes.desc}>
            Controla a cadência dos disparos automáticos para evitar bloqueio do WhatsApp.
          </Typography>

          <Box className={classes.intervalCard}>
            <Box className={classes.intervalHeader}>
              <AccessTimeIcon className={classes.intervalIcon} />
              <Typography className={classes.intervalTitle}>Intervalo entre mensagens</Typography>
            </Box>
            <FormControl variant="outlined" className={classes.formControl} size="small">
              <InputLabel>Intervalo de Envio Aleatório</InputLabel>
              <Select
                label="Intervalo de Envio Aleatório"
                value={storeConfig.whatsappSendDelaySeconds ?? 8}
                onChange={(e) => updateStoreConfig({ whatsappSendDelaySeconds: e.target.value })}
              >
                <MenuItem value={0}>Sem intervalo</MenuItem>
                <MenuItem value={5}>5 segundos</MenuItem>
                <MenuItem value={8}>8 segundos</MenuItem>
                <MenuItem value={10}>10 segundos</MenuItem>
                <MenuItem value={15}>15 segundos</MenuItem>
                <MenuItem value={20}>20 segundos</MenuItem>
                <MenuItem value={30}>30 segundos</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box className={classes.intervalCard}>
            <Box className={classes.intervalHeader}>
              <ScheduleIcon className={classes.intervalIcon} />
              <Typography className={classes.intervalTitle}>Aplicar pausa longa após X mensagens</Typography>
            </Box>
            <FormControl variant="outlined" className={classes.formControl} size="small">
              <InputLabel>Pausar a cada</InputLabel>
              <Select
                label="Pausar a cada"
                value={storeConfig.whatsappPauseEveryCount ?? 8}
                onChange={(e) => updateStoreConfig({ whatsappPauseEveryCount: e.target.value })}
              >
                <MenuItem value={0}>Nunca pausar</MenuItem>
                <MenuItem value={5}>5 mensagens</MenuItem>
                <MenuItem value={8}>8 mensagens</MenuItem>
                <MenuItem value={10}>10 mensagens</MenuItem>
                <MenuItem value={15}>15 mensagens</MenuItem>
                <MenuItem value={20}>20 mensagens</MenuItem>
                <MenuItem value={30}>30 mensagens</MenuItem>
                <MenuItem value={50}>50 mensagens</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box className={classes.intervalCard}>
            <Box className={classes.intervalHeader}>
              <AvTimerIcon className={classes.intervalIcon} />
              <Typography className={classes.intervalTitle}>Duração da pausa longa</Typography>
            </Box>
            <FormControl variant="outlined" className={classes.formControl} size="small">
              <InputLabel>Duração da Pausa</InputLabel>
              <Select
                label="Duração da Pausa"
                value={storeConfig.whatsappPauseSeconds ?? 180}
                onChange={(e) => updateStoreConfig({ whatsappPauseSeconds: e.target.value })}
              >
                <MenuItem value={30}>30 segundos</MenuItem>
                <MenuItem value={60}>1 minuto</MenuItem>
                <MenuItem value={120}>2 minutos</MenuItem>
                <MenuItem value={180}>3 minutos</MenuItem>
                <MenuItem value={300}>5 minutos</MenuItem>
                <MenuItem value={600}>10 minutos</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Divider style={{ marginBottom: 16 }} />

          {/* Cancelamento automático */}
          <Typography className={classes.label} style={{ marginBottom: 4 }}>
            Cancelamento automático
          </Typography>
          <Typography className={classes.desc}>
            Pedidos sem pagamento são cancelados automaticamente após o tempo configurado.
          </Typography>
          <Box className={classes.intervalCard}>
            <Box className={classes.intervalHeader}>
              <AvTimerIcon className={classes.intervalIcon} />
              <Typography className={classes.intervalTitle}>Cancelar pedido após</Typography>
            </Box>
            <FormControl variant="outlined" className={classes.formControl} size="small">
              <InputLabel>Tempo para cancelar</InputLabel>
              <Select
                label="Tempo para cancelar"
                value={storeConfig.autoCancelHours ?? 48}
                onChange={(e) => updateStoreConfig({ autoCancelHours: e.target.value })}
              >
                <MenuItem value={0}>Não cancelar automaticamente</MenuItem>
                <MenuItem value={6}>6 horas</MenuItem>
                <MenuItem value={12}>12 horas</MenuItem>
                <MenuItem value={24}>24 horas</MenuItem>
                <MenuItem value={48}>48 horas</MenuItem>
                <MenuItem value={72}>72 horas</MenuItem>
                <MenuItem value={120}>5 dias</MenuItem>
                <MenuItem value={168}>7 dias</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <div className={classes.actions}>
            <Button
              size="small"
              variant="contained"
              color="primary"
              onClick={saveStoreConfig}
              disabled={storeConfigSaving}
            >
              {storeConfigSaving ? <CircularProgress size={16} /> : "Salvar configurações"}
            </Button>
          </div>
        </Paper>
      )}
      </Paper>
    </MainContainer>
  );
}
