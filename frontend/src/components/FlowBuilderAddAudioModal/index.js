import React, { useState, useEffect, useRef } from "react";
import * as Yup from "yup";
import { Formik, FieldArray, Form, Field } from "formik";
import { toast } from "react-toastify";

// Material UI imports
import { makeStyles, alpha } from "@material-ui/core/styles";
import { 
  Button, 
  Dialog, 
  DialogContent,
  Typography,
  IconButton,
  CircularProgress,
  Box,
  Slide,
  Paper
} from "@material-ui/core";
import { 
  Stack, 
  Checkbox,
  LinearProgress 
} from "@mui/material";
import CloseIcon from "@material-ui/icons/Close";
import AudiotrackIcon from "@material-ui/icons/Audiotrack";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import MicIcon from "@material-ui/icons/Mic";
import Compressor from "compressorjs";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import toastError from "../../errors/toastError";

// Transição para entrada do modal
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// Estilos modernizados
const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    flexWrap: "wrap"
  },
  dialog: {
    "& .MuiDialog-paper": {
      borderRadius: 16,
      boxShadow: "0 8px 40px rgba(0, 0, 0, 0.12)",
      overflow: "visible"
    }
  },
  dialogHeader: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(3, 3, 2),
    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.05)}`,
    position: "relative"
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: theme.palette.text.primary,
    flex: 1
  },
  iconHeader: {
    background: theme.palette.primary.main,
    color: "white",
    width: 42,
    height: 42,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing(2),
    boxShadow: `0 4px 10px ${alpha(theme.palette.primary.main, 0.3)}`
  },
  closeButton: {
    position: "absolute",
    top: 12,
    right: 12,
    color: theme.palette.text.secondary,
    background: alpha(theme.palette.divider, 0.05),
    '&:hover': {
      background: alpha(theme.palette.divider, 0.1),
    }
  },
  dialogContent: {
    padding: theme.spacing(3),
  },
  audioPlayer: {
    width: "100%",
    height: 60,
    borderRadius: 12,
    padding: theme.spacing(0, 2),
    margin: theme.spacing(1, 0, 3),
    background: `linear-gradient(90deg, ${alpha(theme.palette.primary.light, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.2)} 100%)`,
    boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.1)}`,
    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
    '& audio': {
      width: '100%',
      outline: 'none',
      height: '100%',
    }
  },
  recordOption: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(1.5),
    borderRadius: 12,
    background: alpha(theme.palette.background.default, 0.7),
    border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
    marginBottom: theme.spacing(3),
  },
  recordText: {
    fontSize: 14,
    fontWeight: 500,
    color: theme.palette.text.primary,
  },
  uploadButton: {
    borderRadius: 10,
    padding: theme.spacing(1.5, 3),
    textTransform: 'none',
    fontWeight: 500,
    fontSize: 15,
    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
    backgroundColor: theme.palette.primary.main,
    color: 'white',
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
      boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
    },
  },
  uploadIcon: {
    marginRight: theme.spacing(1),
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: theme.spacing(1.5),
    padding: theme.spacing(2, 3, 3),
    borderTop: `1px solid ${alpha(theme.palette.divider, 0.05)}`,
  },
  cancelButton: {
    borderRadius: 8,
    textTransform: 'none',
    fontWeight: 500,
    padding: theme.spacing(1, 2.5),
    boxShadow: 'none',
    color: theme.palette.text.secondary,
    backgroundColor: alpha(theme.palette.divider, 0.08),
    '&:hover': {
      backgroundColor: alpha(theme.palette.divider, 0.15),
      boxShadow: 'none',
    },
  },
  submitButton: {
    borderRadius: 8,
    textTransform: 'none',
    fontWeight: 500,
    padding: theme.spacing(1, 2.5),
    boxShadow: `0 4px 10px ${alpha(theme.palette.primary.main, 0.25)}`,
    '&:hover': {
      boxShadow: `0 6px 15px ${alpha(theme.palette.primary.main, 0.35)}`,
    },
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(4),
    gap: theme.spacing(2)
  },
  loadingText: {
    fontSize: 14,
    fontWeight: 500,
    color: theme.palette.text.secondary,
    marginTop: theme.spacing(2)
  },
  progressBar: {
    width: "100%",
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(2),
    borderRadius: 4,
  },
  emptyStateContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(4, 2),
    margin: theme.spacing(2, 0),
    backgroundColor: alpha(theme.palette.background.default, 0.6),
    borderRadius: 12,
    border: `1px dashed ${alpha(theme.palette.divider, 0.3)}`,
  },
  emptyStateIcon: {
    fontSize: 48,
    color: alpha(theme.palette.text.secondary, 0.3),
    marginBottom: theme.spacing(2)
  },
  emptyStateText: {
    fontSize: 14,
    color: theme.palette.text.secondary,
    textAlign: "center"
  },
  successIcon: {
    color: theme.palette.success.main,
    marginRight: theme.spacing(1)
  }
}));

const FlowBuilderAddAudioModal = ({ open, onSave, onUpdate, data, close }) => {
  const classes = useStyles();
  const isMounted = useRef(true);

  const [activeModal, setActiveModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [record, setRecord] = useState(false);
  const [preview, setPreview] = useState();
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const [labels, setLabels] = useState({
    title: "Adicionar áudio ao fluxo",
    btn: "Adicionar"
  });

  const [textDig, setTextDig] = useState();
  const [medias, setMedias] = useState([]);

  useEffect(() => {
    if (open === "edit") {
      setLabels({
        title: "Editar áudio",
        btn: "Salvar"
      });
      setPreview(process.env.REACT_APP_BACKEND_URL + '/public/' + data.data.url)
      setRecord(data.data.record)
      setActiveModal(true);
    } else if (open === "create") {
      setLabels({
        title: "Adicionar áudio ao fluxo",
        btn: "Adicionar"
      });
      setTextDig("");
      setActiveModal(true);
      setUploadSuccess(false);
    } else {
      setActiveModal(false);
    }
  }, [open]);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleClose = () => {
    close(null);
    setActiveModal(false);
  };

  const handleSaveContact = async () => {
    if (open === "edit") {
      handleClose();
      onUpdate({
        ...data,
        data: { url: data.data.url,
        record: record }
      });
      return;
    } else if (open === "create") {
      setLoading(true);
      const formData = new FormData();
      formData.append("fromMe", true);

      medias.forEach(async (media, idx) => {
        const file = media;

        if (!file) {
          return;
        }

        if (media?.type.split("/")[0] == "image") {
          new Compressor(file, {
            quality: 0.7,

            async success(media) {
              formData.append("medias", media);
              formData.append("body", media.name);
            },
            error(err) {
              alert("erro");
              console.log(err.message);
            }
          });
        } else {
          formData.append("medias", media);
          formData.append("body", media.name);
        }
      });

      setTimeout(async () => {
        console.log(formData);
        await api.post("/flowbuilder/audio", formData).then(res => {
          handleClose();
          onSave({
            url: res.data.name,
            record: record
          });
          toast.success("Áudio adicionado com sucesso!");
          setLoading(false);
          setMedias([]);
          setPreview();
          setUploadSuccess(true);
        }).catch(err => {
          setLoading(false);
          toastError(err);
        });
      }, 1000);
    }
  };

  const handleChangeMedias = e => {
    if (!e.target.files) {
      return;
    }

    if(e.target.files[0].size > 5000000){
      toast.error("Arquivo é muito grande! 5MB máximo")
      return
    }

    const selectedMedias = Array.from(e.target.files);
    setPreview((URL.createObjectURL(e.target.files[0])));
    setMedias(selectedMedias);
    setUploadSuccess(true);
  };

  return (
    <Dialog 
      open={activeModal} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      className={classes.dialog}
      TransitionComponent={Transition}
    >
      <div className={classes.dialogHeader}>
        <div className={classes.iconHeader}>
          <AudiotrackIcon />
        </div>
        <Typography className={classes.dialogTitle}>
          {labels.title}
        </Typography>
        <IconButton 
          className={classes.closeButton} 
          onClick={handleClose}
          size="small"
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </div>

      <DialogContent className={classes.dialogContent}>
        {preview ? (
          <>
            {/* Player de áudio estilizado */}
            <Box className={classes.audioPlayer}>
              <audio controls="controls">
                <source src={preview} type="audio/mp3" />
                seu navegador não suporta HTML5
              </audio>
            </Box>

            {/* Opção de gravação */}
            <Box className={classes.recordOption}>
              <Checkbox 
                checked={record} 
                onChange={() => setRecord(!record)}
                color="primary"
              />
              <Box display="flex" alignItems="center">
                <MicIcon style={{ marginRight: 8, color: record ? '#f50057' : '#9e9e9e' }} />
                <Typography className={classes.recordText}>
                  Enviar como áudio gravado na hora
                </Typography>
              </Box>
            </Box>
            
            {uploadSuccess && open === "create" && (
              <Box display="flex" alignItems="center" mb={2}>
                <CheckCircleIcon className={classes.successIcon} />
                <Typography variant="body2">
                  Áudio carregado com sucesso!
                </Typography>
              </Box>
            )}
          </>
        ) : (
          // Estado vazio - nenhum áudio selecionado
          <>
            {!loading && open !== "edit" ? (
              <Box className={classes.emptyStateContainer}>
                <AudiotrackIcon className={classes.emptyStateIcon} />
                <Typography className={classes.emptyStateText}>
                  Nenhum áudio selecionado. Faça upload de um arquivo de áudio para continuar.
                </Typography>
                <Box mt={3}>
                  <Button
                    variant="contained"
                    color="primary"
                    component="label"
                    className={classes.uploadButton}
                    startIcon={<CloudUploadIcon className={classes.uploadIcon} />}
                  >
                    Selecionar Áudio
                    <input
                      type="file"
                      accept="audio/ogg, audio/mp3"
                      disabled={loading}
                      hidden
                      onChange={handleChangeMedias}
                    />
                  </Button>
                </Box>
              </Box>
            ) : null}
          </>
        )}

        {/* Estado de carregamento */}
        {loading && (
          <Box className={classes.loadingContainer}>
            <CircularProgress size={48} color="primary" />
            <LinearProgress className={classes.progressBar} />
            <Typography className={classes.loadingText}>
              Enviando áudio, aguarde...
            </Typography>
          </Box>
        )}
      </DialogContent>

      <Box className={classes.actions}>
        {!loading && (
          <>
            <Button
              onClick={() => {
                handleClose();
                setMedias([]);
                setPreview();
              }}
              className={classes.cancelButton}
            >
              {i18n.t("contactModal.buttons.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={loading || (!preview && open === "create")}
              color="primary"
              variant="contained"
              className={classes.submitButton}
              onClick={handleSaveContact}
            >
              {`${labels.btn}`}
            </Button>
          </>
        )}
      </Box>
    </Dialog>
  );
};

export default FlowBuilderAddAudioModal;