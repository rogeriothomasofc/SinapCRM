import React, { useState, useContext, useRef } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  Paper,
  Typography,
  TextField,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import PaletteOutlinedIcon from "@material-ui/icons/PaletteOutlined";
import ImageOutlinedIcon from "@material-ui/icons/ImageOutlined";
import CloudUploadOutlinedIcon from "@material-ui/icons/CloudUploadOutlined";
import CheckCircleOutlineIcon from "@material-ui/icons/CheckCircleOutline";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { toast } from "react-toastify";
import { WhitelabelContext } from "../../context/Whitelabel/WhitelabelContext";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    ...theme.scrollbarStyles,
    overflowY: "scroll",
    flex: 1,
    padding: theme.spacing(2.5, 3),
  },
  section: {
    marginBottom: theme.spacing(2),
  },
  colRight: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(1.5),
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.75),
  },
  card: {
    padding: theme.spacing(3),
    borderRadius: 12,
    border: `1px solid ${theme.palette.type === "dark" ? "rgba(255,255,255,0.08)" : "#EBEBEB"}`,
  },
  colorRow: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2),
    marginTop: theme.spacing(2),
  },
  colorSwatch: {
    width: 44,
    height: 44,
    borderRadius: 10,
    border: "2px solid rgba(0,0,0,0.12)",
    cursor: "pointer",
    transition: "transform 0.15s",
    "&:hover": { transform: "scale(1.08)" },
    padding: 0,
    overflow: "hidden",
    "& input[type=color]": {
      width: "150%",
      height: "150%",
      margin: "-25%",
      cursor: "pointer",
      border: "none",
      padding: 0,
      background: "none",
    },
  },
  uploadArea: {
    border: `2px dashed ${theme.palette.type === "dark" ? "rgba(255,255,255,0.15)" : "#D0D0D0"}`,
    borderRadius: 10,
    padding: theme.spacing(2.5),
    textAlign: "center",
    cursor: "pointer",
    transition: "border-color 0.2s",
    "&:hover": {
      borderColor: theme.palette.primary.main,
    },
  },
  preview: {
    maxHeight: 80,
    maxWidth: 220,
    objectFit: "contain",
    borderRadius: 6,
    marginTop: theme.spacing(1.5),
  },
  faviconPreview: {
    width: 32,
    height: 32,
    objectFit: "contain",
    borderRadius: 4,
    marginTop: theme.spacing(1.5),
  },
  saveBtn: {
    marginTop: theme.spacing(2.5),
    borderRadius: 8,
    textTransform: "none",
    fontWeight: 600,
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
  },
  hint: {
    fontSize: 11,
    color: theme.palette.text.secondary,
    marginTop: theme.spacing(0.5),
  },
}));

const backendUrl = (process.env.REACT_APP_BACKEND_URL || "").replace(/\/$/, "");

const toAbsUrl = (path) => (path ? `${backendUrl}${path}` : null);

export default function Whitelabel() {
  const classes = useStyles();
  const { name: wlName, logoUrl, faviconUrl, primaryColor, secondaryColor, reload } = useContext(WhitelabelContext);

  const [name, setName] = useState(wlName || "SinapCRM");
  const [primary, setPrimary] = useState(primaryColor || "#682ee2");
  const [secondary, setSecondary] = useState(secondaryColor || "#ff5722");
  const [saving, setSaving] = useState(false);

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(toAbsUrl(logoUrl));
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const [faviconFile, setFaviconFile] = useState(null);
  const [faviconPreview, setFaviconPreview] = useState(toAbsUrl(faviconUrl));
  const [uploadingFavicon, setUploadingFavicon] = useState(false);

  const logoRef = useRef();
  const faviconRef = useRef();

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleFaviconChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFaviconFile(file);
    setFaviconPreview(URL.createObjectURL(file));
  };

  const handleSaveGeneral = async () => {
    setSaving(true);
    try {
      await api.put("/whitelabel", { name, primaryColor: primary, secondaryColor: secondary });
      await reload();
      toast.success("Configurações salvas! Recarregue a página para aplicar as cores.");
    } catch (err) {
      toastError(err);
    }
    setSaving(false);
  };

  const handleUploadLogo = async () => {
    if (!logoFile) return;
    setUploadingLogo(true);
    try {
      const fd = new FormData();
      fd.append("logo", logoFile);
      await api.post("/whitelabel/logo", fd, { headers: { "Content-Type": "multipart/form-data" } });
      await reload();
      setLogoFile(null);
      toast.success("Logo atualizado com sucesso!");
    } catch (err) {
      toastError(err);
    }
    setUploadingLogo(false);
  };

  const handleUploadFavicon = async () => {
    if (!faviconFile) return;
    setUploadingFavicon(true);
    try {
      const fd = new FormData();
      fd.append("favicon", faviconFile);
      await api.post("/whitelabel/favicon", fd, { headers: { "Content-Type": "multipart/form-data" } });
      await reload();
      setFaviconFile(null);
      toast.success("Favicon atualizado com sucesso!");
    } catch (err) {
      toastError(err);
    }
    setUploadingFavicon(false);
  };

  return (
    <MainContainer>
      <MainHeader>
        <Title>Identidade Visual</Title>
      </MainHeader>

      <Paper className={classes.mainPaper} elevation={1}>
        <Grid container spacing={3} alignItems="flex-start">

          {/* Coluna esquerda: Marca e Cores */}
          <Grid item xs={12} md={7}>
            <Typography className={classes.sectionTitle}>
              <PaletteOutlinedIcon style={{ fontSize: 14 }} /> Marca e Cores
            </Typography>
            <Paper className={classes.card} elevation={0}>
              <TextField
                label="Nome do sistema"
                value={name}
                onChange={(e) => setName(e.target.value)}
                variant="outlined"
                size="small"
                fullWidth
                inputProps={{ maxLength: 60 }}
              />
              <Typography style={{ marginTop: 20, fontWeight: 600, fontSize: 13 }}>
                Cores do tema
              </Typography>
              <Grid container spacing={3} style={{ marginTop: 4 }}>
                <Grid item xs={12} sm={6}>
                  <Typography style={{ fontSize: 12, color: "#888", marginBottom: 6 }}>Cor primária</Typography>
                  <Box className={classes.colorRow}>
                    <Box className={classes.colorSwatch} style={{ backgroundColor: primary }}>
                      <input
                        type="color"
                        value={primary}
                        onChange={(e) => setPrimary(e.target.value)}
                        title="Cor primária"
                      />
                    </Box>
                    <TextField
                      value={primary}
                      onChange={(e) => setPrimary(e.target.value)}
                      size="small"
                      variant="outlined"
                      inputProps={{ maxLength: 7, style: { fontFamily: "monospace", fontSize: 13 } }}
                      style={{ width: 110 }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography style={{ fontSize: 12, color: "#888", marginBottom: 6 }}>Cor secundária</Typography>
                  <Box className={classes.colorRow}>
                    <Box className={classes.colorSwatch} style={{ backgroundColor: secondary }}>
                      <input
                        type="color"
                        value={secondary}
                        onChange={(e) => setSecondary(e.target.value)}
                        title="Cor secundária"
                      />
                    </Box>
                    <TextField
                      value={secondary}
                      onChange={(e) => setSecondary(e.target.value)}
                      size="small"
                      variant="outlined"
                      inputProps={{ maxLength: 7, style: { fontFamily: "monospace", fontSize: 13 } }}
                      style={{ width: 110 }}
                    />
                  </Box>
                </Grid>
              </Grid>
              <Button
                variant="contained"
                color="primary"
                disableElevation
                onClick={handleSaveGeneral}
                disabled={saving}
                startIcon={saving ? <CircularProgress size={14} color="inherit" /> : <CheckCircleOutlineIcon />}
                className={classes.saveBtn}
              >
                {saving ? "Salvando…" : "Salvar"}
              </Button>
            </Paper>
          </Grid>

          {/* Coluna direita: Logotipo + Favicon */}
          <Grid item xs={12} md={5}>
            <Box className={classes.colRight}>

              {/* Logotipo */}
              <Box>
                <Typography className={classes.sectionTitle}>
                  <ImageOutlinedIcon style={{ fontSize: 14 }} /> Logotipo
                </Typography>
                <Paper className={classes.card} elevation={0}>
                  <Box className={classes.uploadArea} onClick={() => logoRef.current.click()}>
                    <CloudUploadOutlinedIcon style={{ fontSize: 28, color: "#aaa" }} />
                    <Typography style={{ fontSize: 12, color: "#888", marginTop: 6 }}>
                      Clique para selecionar
                    </Typography>
                    <Typography className={classes.hint}>PNG, JPG ou SVG · máx. 2 MB · 200×60px</Typography>
                    <input
                      type="file"
                      accept="image/*"
                      ref={logoRef}
                      style={{ display: "none" }}
                      onChange={handleLogoChange}
                    />
                  </Box>
                  {logoPreview && (
                    <Box mt={1.5}>
                      <Typography style={{ fontSize: 11, color: "#888", marginBottom: 6 }}>Prévia:</Typography>
                      <Box style={{ background: "#f5f5f5", borderRadius: 8, padding: "10px 16px", display: "inline-block" }}>
                        <img src={logoPreview} alt="logo preview" className={classes.preview} />
                      </Box>
                    </Box>
                  )}
                  <Button
                    variant="contained"
                    color="primary"
                    disableElevation
                    onClick={handleUploadLogo}
                    disabled={!logoFile || uploadingLogo}
                    startIcon={uploadingLogo ? <CircularProgress size={14} color="inherit" /> : <CloudUploadOutlinedIcon />}
                    className={classes.saveBtn}
                  >
                    {uploadingLogo ? "Enviando…" : "Enviar Logo"}
                  </Button>
                </Paper>
              </Box>

              {/* Favicon */}
              <Box>
                <Typography className={classes.sectionTitle}>
                  <ImageOutlinedIcon style={{ fontSize: 14 }} /> Favicon
                </Typography>
                <Paper className={classes.card} elevation={0}>
                  <Box className={classes.uploadArea} onClick={() => faviconRef.current.click()}>
                    <CloudUploadOutlinedIcon style={{ fontSize: 28, color: "#aaa" }} />
                    <Typography style={{ fontSize: 12, color: "#888", marginTop: 6 }}>
                      Clique para selecionar
                    </Typography>
                    <Typography className={classes.hint}>ICO, PNG ou SVG · 32×32px</Typography>
                    <input
                      type="file"
                      accept="image/*,.ico"
                      ref={faviconRef}
                      style={{ display: "none" }}
                      onChange={handleFaviconChange}
                    />
                  </Box>
                  {faviconPreview && (
                    <Box mt={1.5} display="flex" alignItems="center" style={{ gap: 10 }}>
                      <Typography style={{ fontSize: 11, color: "#888" }}>Prévia:</Typography>
                      <img src={faviconPreview} alt="favicon preview" className={classes.faviconPreview} />
                    </Box>
                  )}
                  <Button
                    variant="contained"
                    color="primary"
                    disableElevation
                    onClick={handleUploadFavicon}
                    disabled={!faviconFile || uploadingFavicon}
                    startIcon={uploadingFavicon ? <CircularProgress size={14} color="inherit" /> : <CloudUploadOutlinedIcon />}
                    className={classes.saveBtn}
                  >
                    {uploadingFavicon ? "Enviando…" : "Enviar Favicon"}
                  </Button>
                </Paper>
              </Box>

            </Box>
          </Grid>

        </Grid>
      </Paper>
    </MainContainer>
  );
}
