import React, { useState, useEffect } from "react";
import {
  Box, Button, Chip, CircularProgress, Collapse, Dialog,
  DialogActions, DialogContent, DialogTitle, FormControl,
  IconButton, InputLabel, MenuItem, Select, Switch, TextField,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import AddIcon from "@material-ui/icons/Add";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import { toast } from "react-toastify";
import api from "../../services/api";
import toastError from "../../errors/toastError";

const useStyles = makeStyles(() => ({
  section: {
    border: "1px solid #E0E0E0", borderRadius: 8, marginBottom: 12, overflow: "hidden",
  },
  sectionHeader: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "10px 16px", backgroundColor: "#FAFAFA", cursor: "pointer",
    "&:hover": { backgroundColor: "#F5F5F5" },
  },
  sectionTitle: { fontWeight: 600, fontSize: 14, color: "#333" },
  sectionBody: { padding: "12px 16px" },
  radioRow: {
    display: "flex", alignItems: "center", gap: 8,
    padding: "8px 10px", borderRadius: 6, cursor: "pointer",
    marginBottom: 4, border: "1px solid transparent",
    "&:hover": { backgroundColor: "#F3E5F5" },
  },
  actionCard: {
    border: "1px solid #E0E0E0", borderRadius: 8, padding: 12, marginBottom: 8,
    backgroundColor: "#FAFAFA",
  },
  addActionBtn: {
    width: "100%", border: "1px dashed #BDBDBD", borderRadius: 8, padding: "10px 0",
    color: "#888", textTransform: "none", fontSize: 13,
  },
  ruleRow: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "8px 10px", borderRadius: 6, marginBottom: 4, border: "1px solid #EFEFEF",
    backgroundColor: "#FAFAFA", cursor: "pointer",
  },
  tagChip: { margin: 2, cursor: "pointer", backgroundColor: "#F3E5F5", color: "#673AB7", border: "1px solid #CE93D8" },
  tagChipActive: { backgroundColor: "#673AB7", color: "white" },
  labelChip: { margin: 2, cursor: "pointer", backgroundColor: "#F3E5F5", color: "#673AB7" },
  labelChipSelected: { backgroundColor: "#673AB7", color: "white" },
}));

const ACTION_TYPES = [
  { value: "message",  label: "Enviar Mensagem" },
  { value: "crmTab",   label: "Aba do CRM" },
  { value: "label",    label: "Etiqueta" },
  { value: "transfer", label: "Transferir Atendimento" },
];

const defaultForm = {
  name: "",
  funnelConfig: { tagIds: [] },
  triggerType: "afterTime",
  triggerTime: { days: 0, hours: 0, minutes: 5 },
  actions: [],
  rules: { cancelOnResponse: true, allowGroups: false, customSignature: false },
  active: true,
};

const FollowUpModal = ({ open, onClose, onSave, data, tags = [] }) => {
  const classes = useStyles();
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [queues, setQueues] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [sections, setSections] = useState({ funnel: true, trigger: true, actions: true, rules: true });

  // Busca filas e todas as etiquetas quando o modal abre
  useEffect(() => {
    if (!open) return;
    api.get("/queue").then(({ data }) => setQueues(data || [])).catch(() => {});
    api.get("/tags/list").then(({ data }) => setAllTags(data?.tags || data || [])).catch(() => {});
  }, [open]);

  useEffect(() => {
    if (open) {
      setForm(data ? {
        name: data.name || "",
        funnelConfig: data.funnelConfig || { tagIds: [] },
        triggerType: data.triggerType || "afterTime",
        triggerTime: data.triggerTime || { days: 0, hours: 0, minutes: 5 },
        actions: data.actions || [],
        rules: data.rules || { cancelOnResponse: true, allowGroups: false, customSignature: false },
        active: data.active !== undefined ? data.active : true,
      } : { ...defaultForm, actions: [], funnelConfig: { tagIds: [] } });
    }
  }, [open, data]);

  const toggleSection = (key) => setSections(s => ({ ...s, [key]: !s[key] }));

  const toggleFunnelTag = (tagId) => {
    const current = form.funnelConfig.tagIds || [];
    const next = current.includes(tagId) ? current.filter(id => id !== tagId) : [...current, tagId];
    setForm(f => ({ ...f, funnelConfig: { ...f.funnelConfig, tagIds: next } }));
  };

  const setTriggerTime = (field, value) => {
    setForm(f => ({ ...f, triggerTime: { ...f.triggerTime, [field]: parseInt(value) || 0 } }));
  };

  const addAction = () => {
    setForm(f => ({ ...f, actions: [...f.actions, { type: "message", content: "" }] }));
  };

  const updateAction = (idx, patch) => {
    setForm(f => {
      const acts = [...f.actions];
      acts[idx] = { ...acts[idx], ...patch };
      return { ...f, actions: acts };
    });
  };

  const removeAction = (idx) => {
    setForm(f => ({ ...f, actions: f.actions.filter((_, i) => i !== idx) }));
  };

  const toggleActionLabel = (idx, tagId) => {
    const current = form.actions[idx]?.tagIds || [];
    const next = current.includes(tagId) ? current.filter(id => id !== tagId) : [...current, tagId];
    updateAction(idx, { tagIds: next });
  };

  const setRule = (key) => {
    setForm(f => ({ ...f, rules: { ...f.rules, [key]: !f.rules[key] } }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("Informe o nome do follow-up"); return; }
    setLoading(true);
    try {
      if (data?.id) {
        await api.put(`/followup/${data.id}`, form);
        toast.success("Follow-up atualizado");
      } else {
        await api.post("/followup", form);
        toast.success("Follow-up criado");
      }
      onSave();
    } catch (err) { toastError(err); }
    finally { setLoading(false); }
  };

  const SectionHeader = ({ label, sectionKey }) => (
    <Box className={classes.sectionHeader} onClick={() => toggleSection(sectionKey)}>
      <Typography className={classes.sectionTitle}>{label}</Typography>
      {sections[sectionKey]
        ? <ExpandLessIcon fontSize="small" style={{ color: "#888" }} />
        : <ExpandMoreIcon fontSize="small" style={{ color: "#888" }} />}
    </Box>
  );

  const renderActionContent = (action, idx) => {
    switch (action.type) {
      case "message":
        return (
          <TextField
            multiline rows={4} fullWidth variant="outlined" size="small"
            placeholder="Digite a mensagem que será enviada ao contato..."
            value={action.content || ""}
            onChange={e => updateAction(idx, { content: e.target.value })}
            inputProps={{ style: { fontSize: 13 } }}
          />
        );

      case "crmTab":
        return (
          <FormControl variant="outlined" size="small" fullWidth>
            <InputLabel>Selecionar aba do CRM</InputLabel>
            <Select
              label="Selecionar aba do CRM"
              value={action.tagId || ""}
              onChange={e => {
                const tag = tags.find(t => t.id === e.target.value);
                updateAction(idx, { tagId: e.target.value, tagName: tag?.name || "" });
              }}
            >
              {tags.length === 0 && <MenuItem disabled>Nenhuma aba cadastrada</MenuItem>}
              {tags.map(tag => (
                <MenuItem key={tag.id} value={tag.id} style={{ fontSize: 13 }}>
                  <Box style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {tag.color && (
                      <Box style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: tag.color, flexShrink: 0 }} />
                    )}
                    {tag.name}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case "label":
        return (
          <Box>
            <Typography style={{ fontSize: 11, color: "#777", marginBottom: 6 }}>
              Selecione as etiquetas a aplicar no contato:
            </Typography>
            {allTags.length === 0 ? (
              <Typography style={{ fontSize: 12, color: "#aaa" }}>Nenhuma etiqueta cadastrada</Typography>
            ) : (
              <Box style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {allTags.map(tag => {
                  const selected = (action.tagIds || []).includes(tag.id);
                  return (
                    <Chip
                      key={tag.id}
                      label={tag.name}
                      size="small"
                      onClick={() => toggleActionLabel(idx, tag.id)}
                      style={{
                        cursor: "pointer",
                        backgroundColor: selected ? (tag.color || "#673AB7") : "#F5F5F5",
                        color: selected ? "#fff" : "#555",
                        border: `1px solid ${tag.color || "#BDBDBD"}`,
                        fontWeight: selected ? 600 : 400,
                      }}
                    />
                  );
                })}
              </Box>
            )}
            {(action.tagIds || []).length > 0 && (
              <Typography style={{ fontSize: 11, color: "#673AB7", marginTop: 4 }}>
                {(action.tagIds || []).length} etiqueta(s) selecionada(s)
              </Typography>
            )}
          </Box>
        );

      case "transfer":
        return (
          <FormControl variant="outlined" size="small" fullWidth>
            <InputLabel>Selecionar fila de atendimento</InputLabel>
            <Select
              label="Selecionar fila de atendimento"
              value={action.queueId || ""}
              onChange={e => {
                const queue = queues.find(q => q.id === e.target.value);
                updateAction(idx, { queueId: e.target.value, queueName: queue?.name || "" });
              }}
            >
              {queues.length === 0 && <MenuItem disabled>Nenhuma fila cadastrada</MenuItem>}
              {queues.map(q => (
                <MenuItem key={q.id} value={q.id} style={{ fontSize: 13 }}>
                  <Box style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {q.color && (
                      <Box style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: q.color, flexShrink: 0 }} />
                    )}
                    {q.name}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" scroll="paper">
      <DialogTitle style={{ fontWeight: 700 }}>
        {data?.id ? "Editar Follow-up" : "Criar Follow Up"}
      </DialogTitle>

      <DialogContent dividers style={{ padding: "16px 20px" }}>
        {/* Nome */}
        <TextField
          label="Nome do follow up"
          placeholder="Insira o nome do follow up"
          fullWidth variant="outlined" size="small"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          style={{ marginBottom: 16 }}
        />

        {/* Configurações Do Funil */}
        <Box className={classes.section}>
          <SectionHeader label="Configurações Do Funil" sectionKey="funnel" />
          <Collapse in={sections.funnel}>
            <Box className={classes.sectionBody}>
              <Typography style={{ fontSize: 12, color: "#777", marginBottom: 8 }}>
                Selecione as abas do CRM onde este follow-up será disparado:
              </Typography>
              {tags.length === 0 ? (
                <Typography style={{ fontSize: 12, color: "#aaa" }}>Nenhuma aba de CRM cadastrada</Typography>
              ) : (
                <Box style={{ display: "flex", flexWrap: "wrap" }}>
                  {tags.map(tag => {
                    const active = (form.funnelConfig.tagIds || []).includes(tag.id);
                    return (
                      <Chip
                        key={tag.id} label={tag.name} size="small"
                        onClick={() => toggleFunnelTag(tag.id)}
                        style={{
                          margin: 2, cursor: "pointer",
                          backgroundColor: active ? (tag.color || "#673AB7") : "#F5F5F5",
                          color: active ? "#fff" : "#555",
                          border: `1px solid ${tag.color || "#BDBDBD"}`,
                          fontWeight: active ? 600 : 400,
                        }}
                      />
                    );
                  })}
                </Box>
              )}
              {!(form.funnelConfig.tagIds?.length) && (
                <Typography style={{ fontSize: 11, color: "#aaa", marginTop: 6 }}>
                  Nenhuma selecionada = aplica a todos os tickets
                </Typography>
              )}
            </Box>
          </Collapse>
        </Box>

        {/* Acionamento Do Follow Up */}
        <Box className={classes.section}>
          <SectionHeader label="Acionamento Do Follow Up" sectionKey="trigger" />
          <Collapse in={sections.trigger}>
            <Box className={classes.sectionBody}>
              {[
                { value: "enter",     label: "Disparar imediatamente ao entrar no funil" },
                { value: "exit",      label: "Disparar imediatamente ao sair do funil" },
                { value: "afterTime", label: "Disparar após um tempo definido" },
              ].map(opt => (
                <Box
                  key={opt.value}
                  className={classes.radioRow}
                  style={form.triggerType === opt.value ? { backgroundColor: "rgba(103,58,183,0.06)", borderColor: "rgba(103,58,183,0.2)" } : {}}
                  onClick={() => setForm(f => ({ ...f, triggerType: opt.value }))}
                >
                  <Box style={{
                    width: 18, height: 18, borderRadius: "50%",
                    border: `2px solid ${form.triggerType === opt.value ? "#673AB7" : "#BDBDBD"}`,
                    backgroundColor: form.triggerType === opt.value ? "#673AB7" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    {form.triggerType === opt.value && (
                      <Box style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "white" }} />
                    )}
                  </Box>
                  <Typography style={{ fontSize: 13, color: form.triggerType === opt.value ? "#512DA8" : "#444" }}>
                    {opt.label}
                  </Typography>
                </Box>
              ))}

              {form.triggerType === "afterTime" && (
                <Box style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  {[{ field: "days", label: "Dias" }, { field: "hours", label: "Horas" }, { field: "minutes", label: "Minutos" }].map(({ field, label }) => (
                    <Box key={field} style={{ flex: 1 }}>
                      <Typography style={{ fontSize: 11, color: "#777", marginBottom: 4 }}>{label}</Typography>
                      <TextField
                        type="number" variant="outlined" size="small" fullWidth
                        value={form.triggerTime[field]}
                        onChange={e => setTriggerTime(field, e.target.value)}
                        inputProps={{ min: 0, style: { textAlign: "center" } }}
                      />
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </Collapse>
        </Box>

        {/* Ação do Follow Up */}
        <Box className={classes.section}>
          <SectionHeader label="Ação do Follow Up" sectionKey="actions" />
          <Collapse in={sections.actions}>
            <Box className={classes.sectionBody}>
              {form.actions.length === 0 && (
                <Box style={{ textAlign: "center", padding: "16px 0", color: "#aaa" }}>
                  <Typography style={{ fontSize: 13 }}>Nenhuma ação foi atribuída</Typography>
                  <Typography style={{ fontSize: 11, marginTop: 4 }}>
                    Adicione ações para configurar o que será feito ao disparar o follow-up
                  </Typography>
                </Box>
              )}

              {form.actions.map((action, idx) => (
                <Box key={idx} className={classes.actionCard}>
                  {/* Seletor do tipo de ação */}
                  <Box style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                    <FormControl variant="outlined" size="small" style={{ minWidth: 200 }}>
                      <InputLabel>Tipo de ação</InputLabel>
                      <Select
                        label="Tipo de ação"
                        value={action.type}
                        onChange={e => updateAction(idx, { type: e.target.value, content: "", tagId: undefined, tagIds: [], queueId: undefined })}
                      >
                        {ACTION_TYPES.map(a => (
                          <MenuItem key={a.value} value={a.value} style={{ fontSize: 13 }}>{a.label}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <IconButton size="small" onClick={() => removeAction(idx)} style={{ color: "#e53935" }}>
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Box>

                  {/* Conteúdo específico por tipo */}
                  {renderActionContent(action, idx)}
                </Box>
              ))}

              <Button className={classes.addActionBtn} onClick={addAction} startIcon={<AddIcon style={{ fontSize: 16 }} />}>
                Adicionar Ação
              </Button>
            </Box>
          </Collapse>
        </Box>

        {/* Regras de Acionamento */}
        <Box className={classes.section}>
          <SectionHeader label="Regras de Acionamento" sectionKey="rules" />
          <Collapse in={sections.rules}>
            <Box className={classes.sectionBody}>
              {[
                { key: "cancelOnResponse", label: "Cancelar envio do Follow Up caso o cliente responda" },
                { key: "allowGroups",      label: "Permitir responder em grupos" },
                { key: "customSignature",  label: "Personalizar ou desativar a assinatura" },
              ].map(r => (
                <Box
                  key={r.key} className={classes.ruleRow}
                  onClick={() => setRule(r.key)}
                  style={{
                    borderColor: form.rules[r.key] ? "rgba(103,58,183,0.2)" : "#EFEFEF",
                    backgroundColor: form.rules[r.key] ? "rgba(103,58,183,0.04)" : "#FAFAFA",
                  }}
                >
                  <Typography style={{ fontSize: 13, color: form.rules[r.key] ? "#512DA8" : "#444", flex: 1 }}>
                    {r.label}
                  </Typography>
                  <Box onClick={e => e.stopPropagation()}>
                    <Switch size="small" color="primary" checked={!!form.rules[r.key]} onChange={() => setRule(r.key)} />
                  </Box>
                </Box>
              ))}
            </Box>
          </Collapse>
        </Box>
      </DialogContent>

      <DialogActions style={{ padding: "12px 20px", gap: 8 }}>
        <Button onClick={onClose} variant="outlined" color="secondary"
          style={{ textTransform: "none", borderRadius: 20 }}>
          Cancelar
        </Button>
        <Button onClick={handleSave} variant="contained" color="primary"
          disabled={loading} style={{ textTransform: "none", borderRadius: 20, minWidth: 80 }}>
          {loading ? <CircularProgress size={20} style={{ color: "white" }} /> : (data?.id ? "Salvar" : "Criar")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FollowUpModal;
