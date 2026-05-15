import React, { useState, useEffect } from "react";
import {
  Grid,
  TextField,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Divider,
  makeStyles,
} from "@material-ui/core";
import { toast } from "react-toastify";
import api from "../../services/api";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    padding: theme.spacing(2),
  },
  section: {
    marginBottom: theme.spacing(3),
  },
  sectionTitle: {
    fontWeight: 600,
    marginBottom: theme.spacing(2),
    color: theme.palette.text.secondary,
    fontSize: "0.85rem",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  divider: {
    margin: theme.spacing(2, 0),
  },
  saveButton: {
    marginTop: theme.spacing(2),
  },
}));

const EMPTY_STATE = {
  payment_gateway: "",
  efi_client_id: "",
  efi_client_secret: "",
  efi_pix_key: "",
  efi_pix_cert: "",
  efi_sandbox: "true",
  asaas_api_key: "",
  asaas_env: "sandbox",
  trial_days: "7",
};

const PaymentSettings = () => {
  const classes = useStyles();
  const [form, setForm] = useState(EMPTY_STATE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/platform-settings");
        setForm((prev) => ({ ...prev, ...data }));
      } catch {
        toast.error("Erro ao carregar configurações de pagamento.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put("/platform-settings", form);
      toast.success("Configurações de pagamento salvas com sucesso!");
    } catch {
      toast.error("Erro ao salvar configurações de pagamento.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <div className={classes.root}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography className={classes.sectionTitle}>Gateway de Pagamento</Typography>
        </Grid>

        <Grid item xs={12} sm={4}>
          <FormControl fullWidth variant="outlined" size="small">
            <InputLabel>Gateway ativo</InputLabel>
            <Select
              name="payment_gateway"
              value={form.payment_gateway}
              onChange={handleChange}
              label="Gateway ativo"
            >
              <MenuItem value="">Nenhum</MenuItem>
              <MenuItem value="efi">EFI / Gerencianet</MenuItem>
              <MenuItem value="asaas">Asaas</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <Divider className={classes.divider} />
          <Typography className={classes.sectionTitle}>EFI / Gerencianet (PIX)</Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            size="small"
            variant="outlined"
            label="Client ID"
            name="efi_client_id"
            value={form.efi_client_id}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            size="small"
            variant="outlined"
            label="Client Secret"
            name="efi_client_secret"
            value={form.efi_client_secret}
            onChange={handleChange}
            type="password"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            size="small"
            variant="outlined"
            label="Chave PIX"
            name="efi_pix_key"
            value={form.efi_pix_key}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            size="small"
            variant="outlined"
            label="Certificado (.p12 — nome do arquivo)"
            name="efi_pix_cert"
            value={form.efi_pix_cert}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <FormControl fullWidth variant="outlined" size="small">
            <InputLabel>Ambiente EFI</InputLabel>
            <Select
              name="efi_sandbox"
              value={form.efi_sandbox}
              onChange={handleChange}
              label="Ambiente EFI"
            >
              <MenuItem value="true">Sandbox (testes)</MenuItem>
              <MenuItem value="false">Produção</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <Divider className={classes.divider} />
          <Typography className={classes.sectionTitle}>Asaas</Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            size="small"
            variant="outlined"
            label="API Key"
            name="asaas_api_key"
            value={form.asaas_api_key}
            onChange={handleChange}
            type="password"
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <FormControl fullWidth variant="outlined" size="small">
            <InputLabel>Ambiente Asaas</InputLabel>
            <Select
              name="asaas_env"
              value={form.asaas_env}
              onChange={handleChange}
              label="Ambiente Asaas"
            >
              <MenuItem value="sandbox">Sandbox (testes)</MenuItem>
              <MenuItem value="production">Produção</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            disabled={saving}
            className={classes.saveButton}
          >
            {saving ? <CircularProgress size={20} /> : "Salvar configurações"}
          </Button>
        </Grid>
      </Grid>
    </div>
  );
};

export default PaymentSettings;
