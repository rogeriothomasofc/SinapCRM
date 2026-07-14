import React, { useEffect, useState } from "react";
import {
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Paper,
  Typography,
  Box,
  Divider,
  LinearProgress,
  TextField,
  Button,
  Switch,
  FormControlLabel,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { ToastContainer, toast } from 'react-toastify';
import useSettings from "../../hooks/useSettings";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(3),
    borderRadius: 12,
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
    border: `1px solid ${theme.palette.divider}`,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: theme.palette.text.primary,
    marginBottom: theme.spacing(3),
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    "&:not(:first-child)": {
      marginTop: theme.spacing(4),
    }
  },
  formControl: {
    width: "100%",
    "& .MuiOutlinedInput-root": {
      borderRadius: 8,
      fontSize: 14,
      "& fieldset": {
        borderColor: theme.palette.divider,
      },
      "&:hover fieldset": {
        borderColor: theme.palette.primary.light,
      },
      "&.Mui-focused fieldset": {
        borderColor: theme.palette.primary.main,
        borderWidth: 1.5,
      },
    },
    "& .MuiInputLabel-outlined": {
      fontSize: 14,
    },
  },
  loadingProgress: {
    height: 2,
    marginTop: -2,
    borderRadius: 2,
  },
  divider: {
    margin: theme.spacing(3, 0),
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
  },
}));

export default function Options(props) {
  const { settings, scheduleTypeChanged } = props;
  const classes = useStyles();
  const [userRating, setUserRating] = useState("disabled");
  const [scheduleType, setScheduleType] = useState("disabled");
  const [callType, setCallType] = useState("enabled");
  const [chatbotType, setChatbotType] = useState("");
  const [CheckMsgIsGroup, setCheckMsgIsGroupType] = useState("enabled");
  const [SendGreetingAccepted, setSendGreetingAccepted] = useState("disabled");
  const [SettingsTransfTicket, setSettingsTransfTicket] = useState("disabled");
  const [sendGreetingMessageOneQueues, setSendGreetingMessageOneQueues] = useState("disabled");

  const [loadingUserRating, setLoadingUserRating] = useState(false);
  const [loadingScheduleType, setLoadingScheduleType] = useState(false);
  const [loadingCallType, setLoadingCallType] = useState(false);
  const [loadingChatbotType, setLoadingChatbotType] = useState(false);
  const [loadingCheckMsgIsGroup, setCheckMsgIsGroup] = useState(false);
  const [loadingSendGreetingAccepted, setLoadingSendGreetingAccepted] = useState(false);
  const [loadingSettingsTransfTicket, setLoadingSettingsTransfTicket] = useState(false);
  const [loadingSendGreetingMessageOneQueues, setLoadingSendGreetingMessageOneQueues] = useState(false);

  const { update } = useSettings();

  useEffect(() => {
    if (Array.isArray(settings) && settings.length) {
      const userRating = settings.find((s) => s.key === "userRating");
      if (userRating) {
        setUserRating(userRating.value);
      }
      const scheduleType = settings.find((s) => s.key === "scheduleType");
      if (scheduleType) {
        setScheduleType(scheduleType.value);
      }
      const callType = settings.find((s) => s.key === "call");
      if (callType) {
        setCallType(callType.value);
      }
      const CheckMsgIsGroup = settings.find((s) => s.key === "CheckMsgIsGroup");
      if (CheckMsgIsGroup) {
        setCheckMsgIsGroupType(CheckMsgIsGroup.value);
      }
      const SendGreetingAccepted = settings.find((s) => s.key === "sendGreetingAccepted");
      if (SendGreetingAccepted) {
        setSendGreetingAccepted(SendGreetingAccepted.value);
      }
      const SettingsTransfTicket = settings.find((s) => s.key === "sendMsgTransfTicket");
      if (SettingsTransfTicket) {
        setSettingsTransfTicket(SettingsTransfTicket.value);
      }
      const sendGreetingMessageOneQueues = settings.find((s) => s.key === "sendGreetingMessageOneQueues");
      if (sendGreetingMessageOneQueues) {
        setSendGreetingMessageOneQueues(sendGreetingMessageOneQueues.value)
      }
      const chatbotType = settings.find((s) => s.key === "chatBotType");
      if (chatbotType) {
        setChatbotType(chatbotType.value);
      }
    }
  }, [settings]);

  async function handleChangeUserRating(value) {
    setUserRating(value);
    setLoadingUserRating(true);
    await update({
      key: "userRating",
      value,
    });
    toast.success(i18n.t("settings.options.toasts.success"));
    setLoadingUserRating(false);
  }

  async function handleSendGreetingMessageOneQueues(value) {
    setSendGreetingMessageOneQueues(value);
    setLoadingSendGreetingMessageOneQueues(true);
    await update({
      key: "sendGreetingMessageOneQueues",
      value,
    });
    toast.success(i18n.t("settings.options.toasts.success"));
    setLoadingSendGreetingMessageOneQueues(false);
  }

  async function handleScheduleType(value) {
    setScheduleType(value);
    setLoadingScheduleType(true);
    await update({
      key: "scheduleType",
      value,
    });
    toast.success(i18n.t("settings.options.toasts.success"));
    setLoadingScheduleType(false);
    if (typeof scheduleTypeChanged === "function") {
      scheduleTypeChanged(value);
    }
  }

  async function handleCallType(value) {
    setCallType(value);
    setLoadingCallType(true);
    await update({
      key: "call",
      value,
    });
    toast.success(i18n.t("settings.options.toasts.success"));
    setLoadingCallType(false);
  }

  async function handleChatbotType(value) {
    setChatbotType(value);
    setLoadingChatbotType(true);
    await update({
      key: "chatBotType",
      value,
    });
    toast.success(i18n.t("settings.options.toasts.success"));
    setLoadingChatbotType(false);
  }

  async function handleGroupType(value) {
    setCheckMsgIsGroupType(value);
    setCheckMsgIsGroup(true);
    await update({
      key: "CheckMsgIsGroup",
      value,
    });
    toast.success(i18n.t("settings.options.toasts.success"));
    setCheckMsgIsGroup(false);
  }

  async function handleSendGreetingAccepted(value) {
    setSendGreetingAccepted(value);
    setLoadingSendGreetingAccepted(true);
    await update({
      key: "sendGreetingAccepted",
      value,
    });
    toast.success(i18n.t("settings.options.toasts.success"));
    setLoadingSendGreetingAccepted(false);
  }

  async function handleSettingsTransfTicket(value) {
    setSettingsTransfTicket(value);
    setLoadingSettingsTransfTicket(true);
    await update({
      key: "sendMsgTransfTicket",
      value,
    });
    toast.success(i18n.t("settings.options.toasts.success"));
    setLoadingSettingsTransfTicket(false);
  }


  return (
    <Box className={classes.container}>
      <Paper className={classes.paper}>
        <Typography className={classes.sectionTitle}>
          Configurações do Sistema
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl variant="outlined" className={classes.formControl} size="small">
              <InputLabel id="ratings-label">
                {i18n.t("settings.options.fields.ratings.title")}
              </InputLabel>
              <Select
                labelId="ratings-label"
                value={userRating}
                onChange={(e) => handleChangeUserRating(e.target.value)}
                label={i18n.t("settings.options.fields.ratings.title")}
              >
                <MenuItem value="disabled">{i18n.t("settings.options.fields.ratings.disabled")}</MenuItem>
                <MenuItem value="enabled">{i18n.t("settings.options.fields.ratings.enabled")}</MenuItem>
              </Select>
              {loadingUserRating && <LinearProgress className={classes.loadingProgress} />}
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl variant="outlined" className={classes.formControl} size="small">
              <InputLabel id="schedule-type-label">
                {i18n.t("settings.options.fields.expedientManager.title")}
              </InputLabel>
              <Select
                labelId="schedule-type-label"
                value={scheduleType}
                onChange={(e) => handleScheduleType(e.target.value)}
                label={i18n.t("settings.options.fields.expedientManager.title")}
              >
                <MenuItem value="disabled">{i18n.t("settings.options.fields.disabled")}</MenuItem>
                <MenuItem value="queue">{i18n.t("settings.options.fields.expedientManager.queue")}</MenuItem>
                <MenuItem value="company">{i18n.t("settings.options.fields.expedientManager.company")}</MenuItem>
              </Select>
              {loadingScheduleType && <LinearProgress className={classes.loadingProgress} />}
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl variant="outlined" className={classes.formControl} size="small">
              <InputLabel id="group-type-label">
                {i18n.t("settings.options.fields.ignoreMessages.title")}
              </InputLabel>
              <Select
                labelId="group-type-label"
                value={CheckMsgIsGroup}
                onChange={(e) => handleGroupType(e.target.value)}
                label={i18n.t("settings.options.fields.ignoreMessages.title")}
              >
                <MenuItem value="disabled">{i18n.t("settings.options.fields.disabled")}</MenuItem>
                <MenuItem value="enabled">{i18n.t("settings.options.fields.active")}</MenuItem>
              </Select>
              {loadingCheckMsgIsGroup && <LinearProgress className={classes.loadingProgress} />}
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl variant="outlined" className={classes.formControl} size="small">
              <InputLabel id="call-type-label">
                {i18n.t("settings.options.fields.acceptCall.title")}
              </InputLabel>
              <Select
                labelId="call-type-label"
                value={callType}
                onChange={(e) => handleCallType(e.target.value)}
                label={i18n.t("settings.options.fields.acceptCall.title")}
              >
                <MenuItem value="disabled">{i18n.t("settings.options.fields.acceptCall.disabled")}</MenuItem>
                <MenuItem value="enabled">{i18n.t("settings.options.fields.acceptCall.enabled")}</MenuItem>
              </Select>
              {loadingCallType && <LinearProgress className={classes.loadingProgress} />}
            </FormControl>
          </Grid>
        </Grid>

        <Divider className={classes.divider} />

        <Typography className={classes.sectionTitle}>
          Configurações de Mensagens
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl variant="outlined" className={classes.formControl} size="small">
              <InputLabel id="chatbot-type-label">
                {i18n.t("settings.options.fields.chatbotType.title")}
              </InputLabel>
              <Select
                labelId="chatbot-type-label"
                value={chatbotType}
                onChange={(e) => handleChatbotType(e.target.value)}
                label={i18n.t("settings.options.fields.chatbotType.title")}
              >
                <MenuItem value="text">{i18n.t("settings.options.fields.chatbotType.text")}</MenuItem>
              </Select>
              {loadingChatbotType && <LinearProgress className={classes.loadingProgress} />}
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl variant="outlined" className={classes.formControl} size="small">
              <InputLabel id="sendGreetingAccepted-label">
                {i18n.t("settings.options.fields.sendGreetingAccepted.title")}
              </InputLabel>
              <Select
                labelId="sendGreetingAccepted-label"
                value={SendGreetingAccepted}
                onChange={(e) => handleSendGreetingAccepted(e.target.value)}
                label={i18n.t("settings.options.fields.sendGreetingAccepted.title")}
              >
                <MenuItem value="disabled">{i18n.t("settings.options.fields.disabled")}</MenuItem>
                <MenuItem value="enabled">{i18n.t("settings.options.fields.enabled")}</MenuItem>
              </Select>
              {loadingSendGreetingAccepted && <LinearProgress className={classes.loadingProgress} />}
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl variant="outlined" className={classes.formControl} size="small">
              <InputLabel id="sendMsgTransfTicket-label">
                {i18n.t("settings.options.fields.sendMsgTransfTicket.title")}
              </InputLabel>
              <Select
                labelId="sendMsgTransfTicket-label"
                value={SettingsTransfTicket}
                onChange={(e) => handleSettingsTransfTicket(e.target.value)}
                label={i18n.t("settings.options.fields.sendMsgTransfTicket.title")}
              >
                <MenuItem value="disabled">{i18n.t("settings.options.fields.disabled")}</MenuItem>
                <MenuItem value="enabled">{i18n.t("settings.options.fields.enabled")}</MenuItem>
              </Select>
              {loadingSettingsTransfTicket && <LinearProgress className={classes.loadingProgress} />}
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl variant="outlined" className={classes.formControl} size="small">
              <InputLabel id="sendGreetingMessageOneQueues-label">
                {i18n.t("settings.options.fields.sendGreetingMessageOneQueues.title")}
              </InputLabel>
              <Select
                labelId="sendGreetingMessageOneQueues-label"
                value={sendGreetingMessageOneQueues}
                onChange={(e) => handleSendGreetingMessageOneQueues(e.target.value)}
                label={i18n.t("settings.options.fields.sendGreetingMessageOneQueues.title")}
              >
                <MenuItem value="disabled">{i18n.t("settings.options.fields.disabled")}</MenuItem>
                <MenuItem value="enabled">{i18n.t("settings.options.fields.enabled")}</MenuItem>
              </Select>
              {loadingSendGreetingMessageOneQueues && <LinearProgress className={classes.loadingProgress} />}
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      <ToastContainer />
    </Box>
  );
}