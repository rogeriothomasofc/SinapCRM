import React, { useState, useEffect, useCallback } from "react";
import {
  Box, Button, IconButton, Paper, Switch, Table, TableBody,
  TableCell, TableHead, TableRow, Typography, Chip, CircularProgress,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import AddIcon from "@material-ui/icons/Add";
import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/Delete";
import RepeatOneIcon from "@material-ui/icons/RepeatOne";
import { toast } from "react-toastify";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import MainContainer from "../../components/MainContainer";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import FollowUpModal from "../../components/FollowUpModal";

const useStyles = makeStyles((theme) => ({
  root: { padding: theme.spacing(2) },
  addBtn: { marginLeft: "auto" },
  chip: { marginRight: 4, marginBottom: 2, fontSize: 11 },
  emptyBox: {
    display: "flex", flexDirection: "column", alignItems: "center",
    justifyContent: "center", padding: 60, color: "#aaa",
  },
  tableHead: {
    "& th": { fontWeight: 700, color: "#555", fontSize: 13, backgroundColor: "#f9f9f9" },
  },
  row: { "&:hover": { backgroundColor: "#fafafa" } },
}));

const triggerLabel = (f) => {
  if (!f) return "—";
  if (f.triggerType === "enter") return "Ao entrar no funil";
  if (f.triggerType === "exit") return "Ao sair do funil";
  if (f.triggerType === "afterTime") {
    const t = f.triggerTime || {};
    const parts = [];
    if (t.days) parts.push(`${t.days} Dia${t.days > 1 ? "s" : ""}`);
    if (t.hours) parts.push(`${t.hours} Hora${t.hours > 1 ? "s" : ""}`);
    if (t.minutes) parts.push(`${t.minutes} Min`);
    return `Após um tempo: ${parts.join(" e ") || "0 Min"}`;
  }
  return "—";
};

const FollowUpPage = () => {
  const classes = useStyles();
  const [followUps, setFollowUps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [tags, setTags] = useState([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [fuRes, tagRes] = await Promise.all([
        api.get("/followup"),
        api.get("/tags/kanban"),
      ]);
      setFollowUps(fuRes.data);
      setTags(tagRes.data.lista || tagRes.data || []);
    } catch (err) { toastError(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleToggle = async (item) => {
    try {
      await api.put(`/followup/${item.id}`, { ...item, active: !item.active });
      setFollowUps(prev => prev.map(f => f.id === item.id ? { ...f, active: !f.active } : f));
    } catch (err) { toastError(err); }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/followup/${id}`);
      setFollowUps(prev => prev.filter(f => f.id !== id));
      toast.success("Follow-up excluído");
    } catch (err) { toastError(err); }
  };

  const handleSave = () => { setModalOpen(false); setSelected(null); fetchData(); };

  const tagName = (id) => {
    const t = tags.find(t => t.id === id || t.id === parseInt(id));
    return t ? t.name : `#${id}`;
  };

  const activeRules = (f) => {
    const r = f.rules || {};
    const labels = [];
    if (r.cancelOnResponse) labels.push("Cancelar após receber uma mensagem");
    if (r.allowGroups) labels.push("Permitir grupos");
    if (r.customSignature) labels.push("Assinatura personalizada");
    return labels;
  };

  return (
    <MainContainer>
      <MainHeader style={{ display: "flex", alignItems: "center" }}>
        <Title>Follow-up</Title>
        <Button
          variant="contained"
          color="primary"
          className={classes.addBtn}
          startIcon={<AddIcon />}
          onClick={() => { setSelected(null); setModalOpen(true); }}
          style={{ marginLeft: "auto", borderRadius: 20, textTransform: "none", fontWeight: 600 }}
        >
          Criar
        </Button>
      </MainHeader>

      <FollowUpModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setSelected(null); }}
        onSave={handleSave}
        data={selected}
        tags={tags}
      />

      <Box className={classes.root}>
        {loading ? (
          <Box style={{ display: "flex", justifyContent: "center", padding: 40 }}>
            <CircularProgress />
          </Box>
        ) : followUps.length === 0 ? (
          <Box className={classes.emptyBox}>
            <RepeatOneIcon style={{ fontSize: 64, opacity: 0.2, marginBottom: 12 }} />
            <Typography variant="h6" style={{ opacity: 0.4 }}>Nenhum follow-up criado ainda</Typography>
            <Typography variant="body2" style={{ opacity: 0.3, marginTop: 4 }}>
              Clique em "Criar" para configurar seu primeiro follow-up
            </Typography>
          </Box>
        ) : (
          <Paper elevation={0} style={{ borderRadius: 12, border: "1px solid #eee", overflow: "hidden" }}>
            <Table size="small">
              <TableHead className={classes.tableHead}>
                <TableRow>
                  <TableCell>Nome</TableCell>
                  <TableCell>Tipo de acionamento</TableCell>
                  <TableCell>Funis</TableCell>
                  <TableCell>Regras ativas</TableCell>
                  <TableCell align="center">Ativo</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {followUps.map((f) => (
                  <TableRow key={f.id} className={classes.row}>
                    <TableCell>
                      <Typography style={{ fontWeight: 600, fontSize: 14 }}>{f.name}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography style={{ fontSize: 13, color: "#555" }}>{triggerLabel(f)}</Typography>
                    </TableCell>
                    <TableCell>
                      {(f.funnelConfig?.tagIds || []).map(id => (
                        <Chip key={id} label={tagName(id)} size="small"
                          className={classes.chip}
                          style={{ backgroundColor: "#E8F5E9", color: "#2E7D32", border: "1px solid #A5D6A7" }} />
                      ))}
                      {!(f.funnelConfig?.tagIds?.length) && <Typography style={{ fontSize: 12, color: "#aaa" }}>Todos</Typography>}
                    </TableCell>
                    <TableCell>
                      {activeRules(f).map((r, i) => (
                        <Chip key={i} label={r} size="small" className={classes.chip}
                          style={{ backgroundColor: "#333", color: "#fff" }} />
                      ))}
                      {activeRules(f).length === 0 && <Typography style={{ fontSize: 12, color: "#aaa" }}>Nenhuma</Typography>}
                    </TableCell>
                    <TableCell align="center">
                      <Switch size="small" color="primary" checked={!!f.active} onChange={() => handleToggle(f)} />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => { setSelected(f); setModalOpen(true); }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(f.id)} style={{ color: "#e53935" }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        )}
      </Box>
    </MainContainer>
  );
};

export default FollowUpPage;
