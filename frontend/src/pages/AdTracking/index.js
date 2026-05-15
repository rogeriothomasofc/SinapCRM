import React, { useState, useCallback } from "react";
import {
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Box,
  Tooltip,
  IconButton
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import {
  TrendingUp,
  CheckCircleOutline,
  AssignmentTurnedIn,
  Refresh,
  ErrorOutline
} from "@material-ui/icons";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { toast } from "react-toastify";

const useStyles = makeStyles((theme) => ({
  statCard: {
    padding: theme.spacing(2.5),
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2),
    borderRadius: 8
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  statValue: {
    fontSize: "2rem",
    fontWeight: 700,
    lineHeight: 1
  },
  statLabel: {
    fontSize: "0.82rem",
    color: theme.palette.text.secondary,
    marginTop: 2
  },
  sectionTitle: {
    fontWeight: 600,
    marginBottom: theme.spacing(1),
    marginTop: theme.spacing(2),
    fontSize: "0.95rem"
  },
  tableContainer: { borderRadius: 8 },
  adRow: {
    "&:hover": { backgroundColor: theme.palette.action.hover }
  },
  statusChip: {
    fontSize: "0.7rem",
    height: 22,
    fontWeight: 600
  },
  scrollable: {
    overflowY: "auto",
    flex: 1
  },
  failedRow: {
    backgroundColor: theme.palette.type === "dark" ? "#2a1a1a" : "#fff5f5",
    "&:hover": { backgroundColor: theme.palette.type === "dark" ? "#331a1a" : "#ffe8e8" }
  }
}));

const statusLabels = {
  open: { label: "Aberto", color: "#2563eb" },
  pending: { label: "Aguardando", color: "#f59e0b" },
  closed: { label: "Concluído", color: "#10b981" }
};

const eventNames = {
  Lead: "Lead capturado",
  CompleteRegistration: "Atendimento concluído",
  Purchase: "Venda"
};

const ERROR_DIAGNOSES = {
  ctwa_clid_expired: { label: "Click ID expirado", fix: "O ctwa_clid expira em 7 dias. Não é possível reenviar.", canRetry: false },
  invalid_token: { label: "Token inválido", fix: "Atualize o token em Configurações → Meta CAPI.", canRetry: true },
  no_waba_linked: { label: "WABA não vinculado", fix: "Vincule o WhatsApp Business ao pixel em Meta Events Manager.", canRetry: true },
  pixel_not_found: { label: "Pixel não encontrado", fix: "Verifique o Pixel ID em Configurações → Meta CAPI.", canRetry: true },
  permission_denied: { label: "Sem permissão", fix: "O token precisa da permissão ads_management.", canRetry: true },
  unknown: { label: "Erro desconhecido", fix: "Verifique as credenciais do Meta CAPI em Configurações.", canRetry: true }
};

function diagnoseMsgCode(errorMessage) {
  if (!errorMessage) return null;
  const msg = errorMessage.toLowerCase();
  if (msg.includes("ctwa_clid") || msg.includes("ctwaclid")) return "ctwa_clid_expired";
  if ((msg.includes("invalid") || msg.includes("expired")) && (msg.includes("token") || msg.includes("access"))) return "invalid_token";
  if (msg.includes("waba") || msg.includes("whatsapp_business_account")) return "no_waba_linked";
  if (msg.includes("pixel") || msg.includes("dataset") || msg.includes('"code":190')) return "pixel_not_found";
  if (msg.includes("permission") || msg.includes("403")) return "permission_denied";
  return "unknown";
}

export default function AdTracking() {
  const classes = useStyles();

  const today = new Date().toISOString().slice(0, 10);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const [startDate, setStartDate] = useState(thirtyDaysAgo);
  const [endDate, setEndDate] = useState(today);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [retrying, setRetrying] = useState({});

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/ad-tracking/stats", { params: { startDate, endDate } });
      setStats(data);
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => { fetchStats(); }, []);

  const handleRetry = async (eventId) => {
    setRetrying(r => ({ ...r, [eventId]: true }));
    try {
      await api.post(`/ad-tracking/capi-events/${eventId}/retry`);
      toast.success("Evento reenviado com sucesso!");
      fetchStats();
    } catch (err) {
      toastError(err);
    } finally {
      setRetrying(r => ({ ...r, [eventId]: false }));
    }
  };

  return (
    <MainContainer>
      <MainHeader>
        <Title>📢 Rastreamento de Anúncios</Title>
        <MainHeaderButtonsWrapper>
          <TextField
            label="Data inicial"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            size="small"
            variant="outlined"
          />
          <TextField
            label="Data final"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            size="small"
            variant="outlined"
          />
          <Button
            variant="contained"
            color="primary"
            onClick={fetchStats}
            disabled={loading}
            disableElevation
          >
            {loading ? <CircularProgress size={18} color="inherit" /> : "Filtrar"}
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>

      <div className={classes.scrollable}>
        {stats && (
          <>
            <Grid container spacing={2} style={{ marginBottom: 8 }}>
              <Grid item xs={12} sm={4}>
                <Paper className={classes.statCard} elevation={1}>
                  <Box className={classes.statIcon} style={{ backgroundColor: "#eff6ff" }}>
                    <TrendingUp style={{ color: "#2563eb" }} />
                  </Box>
                  <div>
                    <div className={classes.statValue}>{stats.total}</div>
                    <div className={classes.statLabel}>Atendimentos de anúncios</div>
                  </div>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper className={classes.statCard} elevation={1}>
                  <Box className={classes.statIcon} style={{ backgroundColor: "#f0fdf4" }}>
                    <CheckCircleOutline style={{ color: "#10b981" }} />
                  </Box>
                  <div>
                    <div className={classes.statValue}>{stats.closed}</div>
                    <div className={classes.statLabel}>Atendimentos concluídos</div>
                  </div>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper className={classes.statCard} elevation={1}>
                  <Box className={classes.statIcon} style={{ backgroundColor: "#fff7ed" }}>
                    <AssignmentTurnedIn style={{ color: "#f59e0b" }} />
                  </Box>
                  <div>
                    <div className={classes.statValue}>{stats.conversionRate}%</div>
                    <div className={classes.statLabel}>Taxa de conversão</div>
                  </div>
                </Paper>
              </Grid>
            </Grid>

            {stats.failedEvents && stats.failedEvents.length > 0 && (
              <>
                <Typography className={classes.sectionTitle} style={{ color: "#dc2626" }}>
                  ⚠ Eventos CAPI com falha ({stats.failedEvents.length})
                </Typography>
                <TableContainer component={Paper} className={classes.tableContainer} elevation={1}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Evento</strong></TableCell>
                        <TableCell><strong>Atendimento #</strong></TableCell>
                        <TableCell><strong>Diagnóstico</strong></TableCell>
                        <TableCell><strong>Data</strong></TableCell>
                        <TableCell align="center"><strong>Reenviar</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {stats.failedEvents.map((ev) => {
                        const diagCode = diagnoseMsgCode(ev.errorMessage);
                        const diag = ERROR_DIAGNOSES[diagCode] || ERROR_DIAGNOSES.unknown;
                        return (
                          <TableRow key={ev.id} className={classes.failedRow}>
                            <TableCell>{eventNames[ev.eventName] || ev.eventName}</TableCell>
                            <TableCell>#{ev.ticketId}</TableCell>
                            <TableCell>
                              <Tooltip title={diag.fix} arrow>
                                <span style={{ display: "flex", alignItems: "center", gap: 4, cursor: "help" }}>
                                  <ErrorOutline style={{ fontSize: 14, color: "#dc2626" }} />
                                  <span style={{ fontSize: "0.75rem", color: "#dc2626" }}>{diag.label}</span>
                                </span>
                              </Tooltip>
                            </TableCell>
                            <TableCell style={{ fontSize: "0.75rem" }}>
                              {new Date(ev.createdAt).toLocaleDateString("pt-BR")}
                            </TableCell>
                            <TableCell align="center">
                              <Tooltip title={diag.canRetry ? "Reenviar este evento ao Meta CAPI" : diag.fix} arrow>
                                <span>
                                  <IconButton
                                    size="small"
                                    disabled={!diag.canRetry || retrying[ev.id]}
                                    onClick={() => handleRetry(ev.id)}
                                    style={{ color: diag.canRetry ? "#2563eb" : "#ccc" }}
                                  >
                                    {retrying[ev.id]
                                      ? <CircularProgress size={14} />
                                      : <Refresh fontSize="small" />}
                                  </IconButton>
                                </span>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}

            {stats.byAd && stats.byAd.length > 0 && (
              <>
                <Typography className={classes.sectionTitle}>Performance por anúncio</Typography>
                <TableContainer component={Paper} className={classes.tableContainer} elevation={1}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Anúncio</strong></TableCell>
                        <TableCell align="center"><strong>Atendimentos</strong></TableCell>
                        <TableCell align="center"><strong>Concluídos</strong></TableCell>
                        <TableCell align="center"><strong>Conversão</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {stats.byAd.map((ad, i) => (
                        <TableRow key={i} className={classes.adRow}>
                          <TableCell>{ad.title}</TableCell>
                          <TableCell align="center">{ad.count}</TableCell>
                          <TableCell align="center">{ad.closed}</TableCell>
                          <TableCell align="center">
                            {ad.count > 0 ? ((ad.closed / ad.count) * 100).toFixed(0) + "%" : "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}

            {stats.tickets && stats.tickets.length > 0 && (
              <>
                <Typography className={classes.sectionTitle} style={{ marginTop: 20 }}>
                  Últimos atendimentos de anúncios
                </Typography>
                <TableContainer component={Paper} className={classes.tableContainer} elevation={1}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>#</strong></TableCell>
                        <TableCell><strong>Contato</strong></TableCell>
                        <TableCell><strong>Anúncio</strong></TableCell>
                        <TableCell align="center"><strong>Status</strong></TableCell>
                        <TableCell><strong>Data</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {stats.tickets.map((t) => {
                        const s = statusLabels[t.status] || { label: t.status, color: "#666" };
                        return (
                          <TableRow key={t.id} className={classes.adRow}>
                            <TableCell>{t.id}</TableCell>
                            <TableCell>
                              {t.contact?.name || "—"}
                              {t.contact?.number && (
                                <div style={{ fontSize: "0.7rem", color: "#888" }}>{t.contact.number}</div>
                              )}
                            </TableCell>
                            <TableCell>
                              {t.adTitle || <span style={{ color: "#aaa" }}>sem título</span>}
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                label={s.label}
                                className={classes.statusChip}
                                style={{ backgroundColor: s.color + "20", color: s.color }}
                              />
                            </TableCell>
                            <TableCell>{new Date(t.createdAt).toLocaleDateString("pt-BR")}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}

            {stats.total === 0 && (
              <Box style={{ textAlign: "center", padding: 48, color: "#aaa" }}>
                <Typography variant="h6">Nenhum atendimento de anúncio encontrado</Typography>
                <Typography variant="body2" style={{ marginTop: 8 }}>
                  Quando clientes vierem por anúncios do WhatsApp, aparecerão aqui.
                </Typography>
              </Box>
            )}
          </>
        )}
      </div>
    </MainContainer>
  );
}
