import React, { useState, useEffect, useContext, useRef } from "react";
import { toast } from "react-toastify";
import moment from "moment";
import { head, isArray } from "lodash";
import { makeStyles } from "@material-ui/core/styles";
import {
  Box, Button, CircularProgress, Dialog, DialogActions, DialogContent,
  DialogTitle, FormControl, IconButton, MenuItem,
  Select, Switch, Tab, Tabs, TextField, Typography,
} from "@material-ui/core";
import AccessTimeIcon from "@material-ui/icons/AccessTime";
import CloseIcon from "@material-ui/icons/Close";
import AttachFileIcon from "@material-ui/icons/AttachFile";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import Autocomplete from "@material-ui/lab/Autocomplete";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import ConfirmationModal from "../ConfirmationModal";

const useStyles = makeStyles((theme) => ({
  dialogTitle: {
    padding: "16px 20px 8px",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  titleContent: { display: "flex", alignItems: "center", gap: 8 },
  clockIcon: { color: theme.palette.primary.main, fontSize: 26, marginTop: 1 },
  subtitle: { color: "#777", fontSize: 12, marginTop: 2 },
  dateField: {
    "& .MuiOutlinedInput-root": { borderRadius: 8, fontSize: 15 },
    "& .MuiInputLabel-root": { fontWeight: 600 },
  },
  quickBtnRow: { display: "flex", gap: 8, marginTop: 8 },
  quickBtn: {
    borderRadius: 20, textTransform: "none", fontSize: 12,
    padding: "4px 14px", border: "1px solid #ccc", color: "#444",
    backgroundColor: "#f5f5f5",
    "&:hover": { backgroundColor: "#ebebeb", borderColor: "#aaa" },
  },
  tabs: { borderBottom: "1px solid #e0e0e0", marginBottom: 12 },
  tab: { textTransform: "none", fontWeight: 600, minWidth: 80 },
  msgField: {
    "& .MuiOutlinedInput-root": { borderRadius: 8, fontSize: 14 },
  },
  signatureBox: {
    border: "1px solid #e0e0e0", borderRadius: 8, padding: "10px 14px",
    display: "flex", alignItems: "center", justifyContent: "space-between",
    backgroundColor: "#fafafa",
  },
  recurrenceRow: { display: "flex", gap: 12, alignItems: "flex-start" },
  recurrenceSelect: {
    flex: 2,
    "& .MuiOutlinedInput-root": { borderRadius: 8 },
  },
  repetitionsField: {
    flex: 1,
    "& .MuiOutlinedInput-root": { borderRadius: 8 },
  },
  attachBtn: {
    border: "2px dashed #ccc", borderRadius: 8, padding: "10px 0",
    width: "100%", textTransform: "none", color: "#888", fontSize: 13,
    "&:hover": { borderColor: "#aaa", backgroundColor: "#fafafa" },
  },
  attachedFile: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    border: "1px solid #e0e0e0", borderRadius: 8, padding: "8px 12px",
    backgroundColor: "#f5f5f5",
  },
  cancelBtn: {
    borderRadius: 8, textTransform: "none", fontWeight: 600,
    border: "1px solid #ccc", color: "#555",
  },
  submitBtn: {
    borderRadius: 8, textTransform: "none", fontWeight: 600,
    paddingLeft: 24, paddingRight: 24,
  },
}));

const RECURRENCE_OPTIONS = [
  { value: "none",    label: "Sem repetição" },
  { value: "daily",   label: "Diário" },
  { value: "weekly",  label: "Semanal" },
  { value: "monthly", label: "Mensal" },
];

const calcNextDate = (base, recurrence, index) => {
  const m = moment(base);
  if (recurrence === "daily")   return m.add(index, "days").format("YYYY-MM-DDTHH:mm");
  if (recurrence === "weekly")  return m.add(index, "weeks").format("YYYY-MM-DDTHH:mm");
  if (recurrence === "monthly") return m.add(index, "months").format("YYYY-MM-DDTHH:mm");
  return base;
};

const ScheduleModal = ({ open, onClose, scheduleId, contactId, cleanContact, reload }) => {
  const classes = useStyles();
  const { user } = useContext(AuthContext);

  const [sendAt, setSendAt] = useState(moment().add(1, "hour").format("YYYY-MM-DDTHH:mm"));
  const [body, setBody] = useState("");
  const [signature, setSignature] = useState(true);
  const [recurrence, setRecurrence] = useState("none");
  const [repetitions, setRepetitions] = useState(1);
  const [activeTab, setActiveTab] = useState(0);
  const [attachment, setAttachment] = useState(null);
  const [scheduleContactId, setScheduleContactId] = useState(contactId || "");
  const [contacts, setContacts] = useState([]);
  const [currentContact, setCurrentContact] = useState({ id: "", name: "" });
  const [loading, setLoading] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [mediaPath, setMediaPath] = useState(null);
  const [mediaName, setMediaName] = useState(null);
  const [existingScheduleId, setExistingScheduleId] = useState(null);
  const attachmentRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const { companyId } = user;

    (async () => {
      try {
        if (!contactId) {
          const { data: list } = await api.get("/contacts/list", { params: { companyId } });
          if (isArray(list)) setContacts(list.map(c => ({ id: c.id, name: c.name })));
        }

        if (scheduleId) {
          const { data } = await api.get(`/schedules/${scheduleId}`);
          setSendAt(moment(data.sendAt).format("YYYY-MM-DDTHH:mm"));
          setBody(data.body || "");
          setRecurrence(data.recurrence || "none");
          setRepetitions(data.repetitions || 1);
          setMediaPath(data.mediaPath || null);
          setMediaName(data.mediaName || null);
          setExistingScheduleId(data.id);
          if (data.contact) setCurrentContact(data.contact);
          setScheduleContactId(data.contactId);
        } else {
          setSendAt(moment().add(1, "hour").format("YYYY-MM-DDTHH:mm"));
          setBody("");
          setRecurrence("none");
          setRepetitions(1);
          setAttachment(null);
          setMediaPath(null);
          setMediaName(null);
          setExistingScheduleId(null);
          if (contactId) setScheduleContactId(contactId);
        }
      } catch (err) {
        toastError(err);
      }
    })();
  }, [open, scheduleId, contactId, user]);

  const handleClose = () => {
    setBody("");
    setAttachment(null);
    onClose();
  };

  const handleQuickDate = (type) => {
    if (type === "30min") setSendAt(moment().add(30, "minutes").format("YYYY-MM-DDTHH:mm"));
    if (type === "tomorrow") setSendAt(moment().add(1, "day").startOf("day").add(9, "hours").format("YYYY-MM-DDTHH:mm"));
    if (type === "1week") setSendAt(moment().add(1, "week").format("YYYY-MM-DDTHH:mm"));
  };

  const uploadMedia = async (id, file) => {
    const formData = new FormData();
    formData.append("file", file);
    await api.post(`/schedules/${id}/media-upload`, formData);
  };

  const handleSave = async () => {
    if (!body.trim() && activeTab === 0) { toast.error("Digite uma mensagem"); return; }
    if (activeTab === 1 && !attachment && !mediaPath) { toast.error("Selecione um arquivo"); return; }
    if (!scheduleContactId) { toast.error("Selecione um contato"); return; }

    setLoading(true);
    try {
      const finalBody = signature ? `${body}\n\n*${user.name}*` : body;
      const base = { body: finalBody, contactId: scheduleContactId, userId: user.id, recurrence, repetitions };

      if (existingScheduleId) {
        await api.put(`/schedules/${existingScheduleId}`, { ...base, sendAt });
        if (attachment) await uploadMedia(existingScheduleId, attachment);
        toast.success("Agendamento atualizado");
      } else {
        const reps = recurrence !== "none" ? Math.max(1, repetitions) : 1;
        for (let i = 0; i < reps; i++) {
          const scheduledAt = i === 0 ? sendAt : calcNextDate(sendAt, recurrence, i);
          const { data } = await api.post("/schedules", { ...base, sendAt: scheduledAt });
          if (attachment && i === 0) await uploadMedia(data.id, attachment);
        }
        toast.success(reps > 1 ? `${reps} agendamentos criados` : "Mensagem agendada");
      }

      if (typeof reload === "function") reload();
      if (contactId && typeof cleanContact === "function") {
        cleanContact();
      }
      handleClose();
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMedia = async () => {
    if (attachment) { setAttachment(null); attachmentRef.current.value = null; }
    if (mediaPath && existingScheduleId) {
      await api.delete(`/schedules/${existingScheduleId}/media-upload`);
      setMediaPath(null);
      setMediaName(null);
      toast.success("Arquivo removido");
      if (typeof reload === "function") reload();
    }
  };

  const hasMedia = attachment || mediaPath;

  return (
    <>
      <ConfirmationModal
        title="Remover arquivo"
        open={confirmationOpen}
        onClose={() => setConfirmationOpen(false)}
        onConfirm={handleDeleteMedia}
      >
        Deseja remover o arquivo anexado?
      </ConfirmationModal>

      <input
        type="file"
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
        ref={attachmentRef}
        style={{ display: "none" }}
        onChange={e => { const f = head(e.target.files); if (f) setAttachment(f); }}
      />

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth scroll="paper">
        {/* Header */}
        <DialogTitle disableTypography className={classes.dialogTitle}>
          <Box className={classes.titleContent}>
            <AccessTimeIcon className={classes.clockIcon} />
            <Box>
              <Typography variant="h6" style={{ fontWeight: 700, fontSize: 18, lineHeight: 1.2 }}>
                Agendar Mensagem
              </Typography>
              <Typography className={classes.subtitle}>
                Agende uma mensagem para ser enviada automaticamente
              </Typography>
            </Box>
          </Box>
          <IconButton size="small" onClick={handleClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Contato — só mostra se não vier pré-definido */}
          {!contactId && (
            <Box>
              <Typography variant="body2" style={{ fontWeight: 600, marginBottom: 6 }}>Contato *</Typography>
              <Autocomplete
                options={contacts}
                value={currentContact}
                onChange={(_, c) => {
                  setCurrentContact(c || { id: "", name: "" });
                  setScheduleContactId(c ? c.id : "");
                }}
                getOptionLabel={o => o.name || ""}
                getOptionSelected={(o, v) => o.id === v.id}
                renderInput={params => (
                  <TextField {...params} variant="outlined" size="small" placeholder="Selecionar contato"
                    style={{ "& .MuiOutlinedInput-root": { borderRadius: 8 } }} />
                )}
              />
            </Box>
          )}

          {/* Data e hora */}
          <Box>
            <Typography variant="body2" style={{ fontWeight: 600, marginBottom: 6 }}>
              Data e hora *
            </Typography>
            <TextField
              type="datetime-local"
              value={sendAt}
              onChange={e => setSendAt(e.target.value)}
              variant="outlined"
              fullWidth
              size="small"
              className={classes.dateField}
              InputLabelProps={{ shrink: true }}
            />
            <Box className={classes.quickBtnRow}>
              <Button className={classes.quickBtn} onClick={() => handleQuickDate("30min")}>+30 min</Button>
              <Button className={classes.quickBtn} onClick={() => handleQuickDate("tomorrow")}>Amanhã</Button>
              <Button className={classes.quickBtn} onClick={() => handleQuickDate("1week")}>+1 semana</Button>
            </Box>
          </Box>

          {/* Tabs Texto / Arquivo */}
          <Box>
            <Tabs
              value={activeTab}
              onChange={(_, v) => setActiveTab(v)}
              indicatorColor="primary"
              textColor="primary"
              className={classes.tabs}
            >
              <Tab label="Texto" className={classes.tab} />
              <Tab label="Arquivo" className={classes.tab} />
            </Tabs>

            {activeTab === 0 && (
              <Box>
                <Typography variant="body2" style={{ fontWeight: 600, marginBottom: 6 }}>Mensagem *</Typography>
                <TextField
                  multiline
                  rows={5}
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder="Digite a mensagem a ser agendada..."
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  className={classes.msgField}
                />
              </Box>
            )}

            {activeTab === 1 && (
              <Box>
                {hasMedia ? (
                  <Box className={classes.attachedFile}>
                    <Box style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <AttachFileIcon fontSize="small" style={{ color: "#888" }} />
                      <Typography style={{ fontSize: 13, color: "#444" }}>
                        {attachment ? attachment.name : mediaName}
                      </Typography>
                    </Box>
                    <IconButton size="small" onClick={() => setConfirmationOpen(true)} style={{ color: "#e53935" }}>
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ) : (
                  <Button
                    className={classes.attachBtn}
                    startIcon={<AttachFileIcon />}
                    onClick={() => attachmentRef.current.click()}
                  >
                    Clique para anexar um arquivo
                  </Button>
                )}
              </Box>
            )}
          </Box>

          {/* Assinatura */}
          <Box className={classes.signatureBox}>
            <Box>
              <Typography style={{ fontWeight: 600, fontSize: 14 }}>Assinatura</Typography>
              <Typography style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
                Será adicionada como <strong>*{user?.name}*</strong>:
              </Typography>
            </Box>
            <Switch
              checked={signature}
              onChange={() => setSignature(v => !v)}
              color="primary"
              size="small"
            />
          </Box>

          {/* Recorrência */}
          <Box className={classes.recurrenceRow}>
            <Box className={classes.recurrenceSelect}>
              <Typography variant="body2" style={{ fontWeight: 600, marginBottom: 6 }}>Recorrência</Typography>
              <FormControl variant="outlined" size="small" fullWidth>
                <Select
                  value={recurrence}
                  onChange={e => { setRecurrence(e.target.value); if (e.target.value === "none") setRepetitions(1); }}
                  style={{ borderRadius: 8 }}
                >
                  {RECURRENCE_OPTIONS.map(o => (
                    <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {recurrence !== "none" && (
              <Box className={classes.repetitionsField}>
                <Typography variant="body2" style={{ fontWeight: 600, marginBottom: 6 }}>Repetições</Typography>
                <TextField
                  type="number"
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={repetitions}
                  onChange={e => setRepetitions(Math.max(1, parseInt(e.target.value) || 1))}
                  inputProps={{ min: 1, max: 52, style: { textAlign: "center" } }}
                  style={{ "& .MuiOutlinedInput-root": { borderRadius: 8 } }}
                />
              </Box>
            )}
          </Box>

        </DialogContent>

        <DialogActions style={{ padding: "12px 20px", gap: 8 }}>
          <Button onClick={handleClose} className={classes.cancelBtn} variant="outlined" disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            color="primary"
            variant="contained"
            className={classes.submitBtn}
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} style={{ color: "white" }} /> : (existingScheduleId ? "Salvar" : "Agendar")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ScheduleModal;
