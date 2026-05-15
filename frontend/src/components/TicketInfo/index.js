import React, { useState, useEffect } from "react";
import {
  Avatar,
  CardHeader,
  Tooltip,
  Chip,
  Collapse,
  Box,
  Typography,
  CircularProgress,
  IconButton
} from "@material-ui/core";
import { Refresh, ErrorOutline } from "@material-ui/icons";
import { makeStyles } from "@material-ui/core/styles";
import { toast } from "react-toastify";
import { i18n } from "../../translate/i18n";
import api from "../../services/api";

const useStyles = makeStyles((theme) => ({
  adBanner: {
    backgroundColor: theme.palette.type === "dark" ? "#4a2700" : "#fff3e0",
    borderLeft: "3px solid #e65100",
    padding: "4px 10px",
    margin: "0 8px 6px 8px",
    borderRadius: 4,
    cursor: "pointer"
  },
  adTitle: {
    fontSize: "0.78rem",
    fontWeight: 600,
    color: "#e65100",
    display: "flex",
    alignItems: "center",
    gap: 6
  },
  adSource: {
    fontSize: "0.72rem",
    color: theme.palette.text.secondary,
    marginTop: 1,
    wordBreak: "break-all"
  },
  capiLog: {
    padding: "6px 10px",
    margin: "0 8px 6px 8px",
    backgroundColor: theme.palette.type === "dark" ? "#1a1a2e" : "#f3f4f6",
    borderRadius: 4
  },
  capiTitle: {
    fontSize: "0.72rem",
    fontWeight: 600,
    color: theme.palette.text.secondary,
    marginBottom: 4
  },
  capiEvent: {
    display: "flex",
    alignItems: "center",
    fontSize: "0.7rem",
    padding: "3px 0",
    gap: 4
  }
}));

const EVENT_LABELS = {
  Lead: "Lead capturado",
  CompleteRegistration: "Atendimento concluído",
  Purchase: "Venda"
};

const DIAGNOSES = {
  ctwa_clid_expired: { label: "Click ID expirado", fix: "O ctwa_clid expira em 7 dias. Não é possível reenviar.", canRetry: false },
  invalid_token: { label: "Token inválido", fix: "Gere um novo token na Meta for Developers e salve em Configurações → Rastreamento.", canRetry: true },
  no_waba_linked: { label: "WABA não vinculado", fix: "Vincule o WhatsApp Business ao pixel em Meta Events Manager.", canRetry: true },
  pixel_not_found: { label: "Pixel não encontrado", fix: "Verifique o Pixel ID em Configurações → Rastreamento.", canRetry: true },
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

const TicketInfo = ({ contact, ticket, onClick }) => {
  const classes = useStyles();
  const { user } = ticket;
  const [userName, setUserName] = useState("");
  const [contactName, setContactName] = useState("");
  const [showLog, setShowLog] = useState(false);
  const [capiEvents, setCapiEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [retrying, setRetrying] = useState({});

  useEffect(() => {
    if (contact) {
      setContactName(contact.name);
      if (document.body.offsetWidth < 600 && contact.name.length > 10) {
        setContactName(contact.name.substring(0, 10) + "...");
      }
    }
    if (user && contact) {
      setUserName(`${i18n.t("messagesList.header.assignedTo")} ${user.name}`);
      if (document.body.offsetWidth < 600) {
        setUserName(user.name);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleToggleLog = async (e) => {
    e.stopPropagation();
    if (!showLog && capiEvents.length === 0) {
      setLoadingEvents(true);
      try {
        const { data } = await api.get(`/ad-tracking/tickets/${ticket.id}/capi-events`);
        setCapiEvents(data);
      } catch (_) {}
      setLoadingEvents(false);
    }
    setShowLog((v) => !v);
  };

  const handleRetry = async (e, eventId) => {
    e.stopPropagation();
    setRetrying(r => ({ ...r, [eventId]: true }));
    try {
      const { data: newEvent } = await api.post(`/ad-tracking/capi-events/${eventId}/retry`);
      setCapiEvents(prev => [...prev, newEvent]);
      toast.success("Evento reenviado!");
    } catch (err) {
      toast.error(err?.response?.data?.error || "Falha ao reenviar evento");
    } finally {
      setRetrying(r => ({ ...r, [eventId]: false }));
    }
  };

  return (
    <>
      <CardHeader
        onClick={onClick}
        style={{ cursor: "pointer" }}
        titleTypographyProps={{ noWrap: true }}
        subheaderTypographyProps={{ noWrap: true }}
        avatar={<Avatar src={contact.profilePicUrl} alt="contact_image" />}
        title={`${contactName} #${ticket.id}`}
        subheader={
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {ticket.user && userName}
            {ticket.ctwaClid && (
              <Chip
                label="📢 Anúncio"
                size="small"
                style={{
                  backgroundColor: "#fff3e0",
                  color: "#e65100",
                  fontSize: "0.65rem",
                  height: 18,
                  fontWeight: 600
                }}
              />
            )}
          </span>
        }
      />

      {ticket.ctwaClid && (
        <>
          <Box className={classes.adBanner} onClick={handleToggleLog}>
            <div className={classes.adTitle}>
              📢 {ticket.adTitle || "Anúncio (sem título)"}
              <span style={{ marginLeft: "auto", fontSize: "0.65rem", opacity: 0.7 }}>
                {showLog ? "▲ ocultar log" : "▼ ver eventos CAPI"}
              </span>
            </div>
            {ticket.adSourceUrl && (
              <div className={classes.adSource}>🔗 {ticket.adSourceUrl}</div>
            )}
          </Box>

          <Collapse in={showLog}>
            <Box className={classes.capiLog}>
              <div className={classes.capiTitle}>Log de eventos Meta CAPI</div>
              {loadingEvents && <CircularProgress size={12} />}
              {!loadingEvents && capiEvents.length === 0 && (
                <Typography style={{ fontSize: "0.7rem", color: "#999" }}>
                  Nenhum evento registrado
                </Typography>
              )}
              {capiEvents.map((ev) => {
                const failed = ev.status === "failed";
                const diagCode = failed ? diagnoseMsgCode(ev.errorMessage) : null;
                const diag = diagCode ? DIAGNOSES[diagCode] : null;
                return (
                  <div key={ev.id} className={classes.capiEvent}>
                    <span style={{ flex: 1 }}>{EVENT_LABELS[ev.eventName] || ev.eventName}</span>

                    {failed && diag && (
                      <Tooltip title={`${diag.label} — ${diag.fix}`} arrow>
                        <ErrorOutline style={{ fontSize: 13, color: "#dc2626", cursor: "help" }} />
                      </Tooltip>
                    )}

                    <span style={{ color: failed ? "#f44336" : "#4caf50", fontWeight: 600, fontSize: "0.68rem" }}>
                      {failed ? "✗ Falhou" : "✓ Enviado"}
                    </span>

                    {failed && diag?.canRetry && (
                      <Tooltip title="Reenviar este evento" arrow>
                        <span>
                          <IconButton
                            size="small"
                            disabled={retrying[ev.id]}
                            onClick={(e) => handleRetry(e, ev.id)}
                            style={{ padding: 2, color: "#2563eb" }}
                          >
                            {retrying[ev.id]
                              ? <CircularProgress size={11} />
                              : <Refresh style={{ fontSize: 13 }} />}
                          </IconButton>
                        </span>
                      </Tooltip>
                    )}

                    <Tooltip title={new Date(ev.createdAt).toLocaleString("pt-BR")} arrow>
                      <span style={{ opacity: 0.55, cursor: "default", fontSize: "0.68rem" }}>
                        {new Date(ev.createdAt).toLocaleDateString("pt-BR")}
                      </span>
                    </Tooltip>
                  </div>
                );
              })}
            </Box>
          </Collapse>
        </>
      )}
    </>
  );
};

export default TicketInfo;
