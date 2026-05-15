import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import {
  Paper,
  Button,
  TextField,
  Typography,
  Box,
  Chip,
  IconButton,
  Grid,
  Divider,
} from "@material-ui/core";

import FileCopyIcon from "@material-ui/icons/FileCopy";
import InfoIcon from "@material-ui/icons/Info";
import VpnKeyIcon from "@material-ui/icons/VpnKey";
import WhatsAppIcon from "@material-ui/icons/WhatsApp";
import SendIcon from "@material-ui/icons/Send";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import ErrorIcon from "@material-ui/icons/Error";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";

import toastError from "../../errors/toastError";
import { toast } from "react-toastify";
import axios from "axios";
import usePlans from "../../hooks/usePlans";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(2),
    overflowY: "auto",
    backgroundColor: theme.palette.background.default,
  },
  section: {
    backgroundColor: theme.palette.background.paper,
    borderRadius: 6,
    border: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(2),
    marginBottom: theme.spacing(1.5),
  },
  infoBox: {
    backgroundColor: theme.palette.info.light,
    border: `1px solid ${theme.palette.info.main}`,
    borderRadius: 4,
    padding: theme.spacing(1.5),
    marginBottom: theme.spacing(2),
  },
  successBox: {
    backgroundColor: theme.palette.success.light,
    border: `1px solid ${theme.palette.success.main}`,
    borderRadius: 4,
    padding: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  errorBox: {
    backgroundColor: theme.palette.error.light,
    border: `1px solid ${theme.palette.error.main}`,
    borderRadius: 4,
    padding: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  code: {
    backgroundColor: theme.palette.background.default,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 4,
    padding: theme.spacing(1),
    fontFamily: "monospace",
    fontSize: "0.75rem",
    position: "relative",
  },
  copyButton: {
    position: "absolute",
    top: 4,
    right: 4,
    padding: 4,
  },
  field: {
    marginBottom: theme.spacing(1.5),
  },
  stepNumber: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    borderRadius: "50%",
    width: 24,
    height: 24,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.75rem",
    fontWeight: 600,
    marginRight: 8,
  },
  stepHeader: {
    display: "flex",
    alignItems: "center",
    marginBottom: 8,
  },
}));

const MessagesAPI = () => {
  const classes = useStyles();
  const history = useHistory();
  const { getPlanCompany } = usePlans();

  useEffect(() => {
    async function fetchData() {
      const companyId = localStorage.getItem("companyId");
      const planConfigs = await getPlanCompany(undefined, companyId);
      if (!planConfigs.plan.useExternalApi) {
        toast.error("Sem permissão para usar a API");
        setTimeout(() => history.push(`/`), 1000);
      }
    }
    fetchData();
  }, [getPlanCompany, history]);

  const endpoint = process.env.REACT_APP_BACKEND_URL + '/api/messages/send';
  
  const copy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado!");
  };

  const [token, setToken] = useState('');
  const [number, setNumber] = useState('');
  const [message, setMessage] = useState('');
  const [file, setFile] = useState(null);

  const send = async (isMedia = false) => {
    try {
      if (isMedia) {
        const data = new FormData();
        data.append('number', number);
        data.append('medias', file);
        await axios.post(endpoint, data, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-type': 'multipart/form-data'
          }
        });
      } else {
        await axios.post(endpoint, 
          { number, body: message },
          { headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-type': 'application/json'
          }}
        );
      }
      toast.success('Mensagem enviada com sucesso!');
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <MainContainer>
      <MainHeader>
        <Title>API WhatsApp - Documentação Completa</Title>
      </MainHeader>

      <Paper className={classes.mainPaper} elevation={0}>
        {/* Introdução */}
        <Box className={classes.infoBox}>
          <Box display="flex" alignItems="center" gap={1} marginBottom={1}>
            <InfoIcon color="primary" />
            <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
              O que é esta API?
            </Typography>
          </Box>
          <Typography variant="body2">
            Esta API permite que você envie mensagens do WhatsApp diretamente de outros sistemas, sites ou aplicativos. 
            É como ter um "robô" que envia mensagens automaticamente para seus clientes usando sua conta do WhatsApp.
          </Typography>
        </Box>

        {/* Como Funciona */}
        <Box className={classes.section}>
          <Typography variant="subtitle1" gutterBottom style={{ fontWeight: 600 }}>
            Como Funciona - Passo a Passo
          </Typography>
          
          <Box className={classes.stepHeader}>
            <span className={classes.stepNumber}>1</span>
            <Typography variant="body2">
              <strong>Obtenha seu Token de API</strong> - É como uma "senha especial" que identifica sua empresa
            </Typography>
          </Box>
          <Typography variant="caption" color="textSecondary" style={{ marginLeft: 32, marginBottom: 16, display: 'block' }}>
            Vá em Configurações → API → Gerar Token
          </Typography>

          <Box className={classes.stepHeader}>
            <span className={classes.stepNumber}>2</span>
            <Typography variant="body2">
              <strong>Prepare os dados</strong> - Você precisa de 2 informações básicas
            </Typography>
          </Box>
          <Box style={{ marginLeft: 32, marginBottom: 16 }}>
            <Chip icon={<WhatsAppIcon />} label="Número do destinatário" size="small" style={{ marginRight: 8 }} />
            <Chip icon={<SendIcon />} label="Mensagem ou arquivo" size="small" />
          </Box>

          <Box className={classes.stepHeader}>
            <span className={classes.stepNumber}>3</span>
            <Typography variant="body2">
              <strong>Envie para nosso servidor</strong> - Use o endereço abaixo
            </Typography>
          </Box>
        </Box>

        {/* Endpoint */}
        <Box className={classes.section}>
          <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom={1}>
            <Typography variant="subtitle2" style={{ fontWeight: 600 }}>
              Endereço da API (Endpoint)
            </Typography>
            <IconButton size="small" onClick={() => copy(endpoint)}>
              <FileCopyIcon fontSize="small" />
            </IconButton>
          </Box>
          <Box className={classes.code}>
            <Chip label="POST" size="small" color="primary" style={{ marginRight: 8 }} />
            <code>{endpoint}</code>
          </Box>
          <Typography variant="caption" color="textSecondary" style={{ marginTop: 4, display: 'block' }}>
            💡 Este é o endereço que seu sistema deve usar para enviar mensagens
          </Typography>
        </Box>

        {/* Teste Rápido */}
        <Box className={classes.section}>
          <Typography variant="subtitle1" gutterBottom style={{ fontWeight: 600 }}>
            Área de Teste - Envie uma mensagem agora!
          </Typography>
          
          <Divider style={{ marginBottom: 16 }} />
          
          <TextField
            size="small"
            variant="outlined"
            label="Token de API"
            placeholder="Cole aqui o token gerado nas configurações"
            fullWidth
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className={classes.field}
            helperText="Exemplo: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            InputProps={{
              startAdornment: <VpnKeyIcon style={{ marginRight: 8, color: '#999' }} />
            }}
          />
          
          <TextField
            size="small"
            variant="outlined"
            label="Número do WhatsApp"
            placeholder="5511999999999"
            fullWidth
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            className={classes.field}
            helperText="Formato: código do país (55) + DDD + número (sem espaços ou traços)"
            InputProps={{
              startAdornment: <WhatsAppIcon style={{ marginRight: 8, color: '#999' }} />
            }}
          />
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Box style={{ border: '1px dashed #ddd', borderRadius: 4, padding: 16 }}>
                <Typography variant="subtitle2" gutterBottom>
                  💬 Enviar Texto
                </Typography>
                <TextField
                  size="small"
                  variant="outlined"
                  placeholder="Digite sua mensagem aqui"
                  fullWidth
                  multiline
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className={classes.field}
                />
                <Button
                  size="small"
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={() => send(false)}
                  disabled={!token || !number || !message}
                  startIcon={<SendIcon />}
                >
                  Enviar Mensagem de Texto
                </Button>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Box style={{ border: '1px dashed #ddd', borderRadius: 4, padding: 16 }}>
                <Typography variant="subtitle2" gutterBottom>
                  📎 Enviar Arquivo
                </Typography>
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  style={{ marginBottom: 16, width: '100%' }}
                  accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                />
                <Typography variant="caption" color="textSecondary" style={{ display: 'block', marginBottom: 8 }}>
                  Aceita: Imagens, Vídeos, Áudios, PDFs e Documentos
                </Typography>
                <Button
                  size="small"
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={() => send(true)}
                  disabled={!token || !number || !file}
                  startIcon={<SendIcon />}
                >
                  Enviar Arquivo
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Exemplos de Código */}
        <Box className={classes.section}>
          <Typography variant="subtitle1" gutterBottom style={{ fontWeight: 600 }}>
            Exemplos para Programadores
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>📋 Formato da Mensagem de Texto</Typography>
              <Box className={classes.code}>
                <IconButton size="small" className={classes.copyButton} onClick={() => copy('{"number": "5511999999999", "body": "Sua mensagem aqui"}')}>
                  <FileCopyIcon fontSize="small" />
                </IconButton>
                <pre style={{ margin: 0 }}>
{`{
  "number": "5511999999999",
  "body": "Sua mensagem aqui"
}`}
                </pre>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>🔐 Cabeçalhos Obrigatórios</Typography>
              <Box className={classes.code}>
                <IconButton size="small" className={classes.copyButton} onClick={() => copy('Authorization: Bearer SEU_TOKEN_AQUI\nContent-Type: application/json')}>
                  <FileCopyIcon fontSize="small" />
                </IconButton>
                <pre style={{ margin: 0 }}>
{`Authorization: Bearer SEU_TOKEN_AQUI
Content-Type: application/json`}
                </pre>
              </Box>
            </Grid>
          </Grid>
          
          <Box marginTop={2}>
            <Typography variant="subtitle2" gutterBottom>💻 Exemplo Completo (CURL)</Typography>
            <Box className={classes.code}>
              <IconButton size="small" className={classes.copyButton} onClick={() => copy(`curl -X POST ${endpoint} -H "Authorization: Bearer SEU_TOKEN" -H "Content-Type: application/json" -d '{"number":"5511999999999","body":"Olá!"}'`)}>
                <FileCopyIcon fontSize="small" />
              </IconButton>
              <code style={{ fontSize: '0.7rem' }}>{`curl -X POST ${endpoint} -H "Authorization: Bearer SEU_TOKEN" -H "Content-Type: application/json" -d '{"number":"5511999999999","body":"Olá!"}'`}</code>
            </Box>
          </Box>
        </Box>

        {/* Respostas e Erros */}
        <Box className={classes.section}>
          <Typography variant="subtitle1" gutterBottom style={{ fontWeight: 600 }}>
            Respostas da API
          </Typography>
          
          <Box className={classes.successBox}>
            <Box display="flex" alignItems="center" gap={1}>
              <CheckCircleIcon style={{ color: 'green', fontSize: 20 }} />
              <Typography variant="body2">
                <strong>Sucesso (200):</strong> Mensagem enviada! Você receberá um ID da mensagem.
              </Typography>
            </Box>
          </Box>

          <Box className={classes.errorBox}>
            <Box display="flex" alignItems="center" gap={1}>
              <ErrorIcon style={{ color: 'red', fontSize: 20 }} />
              <Typography variant="body2">
                <strong>Erro 401:</strong> Token inválido - Verifique se copiou corretamente
              </Typography>
            </Box>
          </Box>

          <Box className={classes.errorBox}>
            <Box display="flex" alignItems="center" gap={1}>
              <ErrorIcon style={{ color: 'red', fontSize: 20 }} />
              <Typography variant="body2">
                <strong>Erro 400:</strong> Dados incorretos - Verifique o formato do número
              </Typography>
            </Box>
          </Box>

          <Box className={classes.errorBox}>
            <Box display="flex" alignItems="center" gap={1}>
              <ErrorIcon style={{ color: 'red', fontSize: 20 }} />
              <Typography variant="body2">
                <strong>Erro 429:</strong> Muitas mensagens - Aguarde 1 minuto
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Limites e Informações */}
        <Box>
          <Typography variant="subtitle2" gutterBottom style={{ fontWeight: 600 }}>
            Limites e Restrições
          </Typography>
          <Box display="flex" gap={1} flexWrap="wrap">
            <Chip icon={<InfoIcon />} label="Máximo: 100 mensagens/minuto" size="small" />
            <Chip label="Imagens: até 5MB" size="small" variant="outlined" />
            <Chip label="Vídeos: até 16MB" size="small" variant="outlined" />
            <Chip label="Documentos: até 100MB" size="small" variant="outlined" />
            <Chip label="WhatsApp deve estar conectado" size="small" color="secondary" />
          </Box>
        </Box>
      </Paper>
    </MainContainer>
  );
};

export default MessagesAPI;