import React, { useState, useEffect, useContext, useRef } from "react";
import "emoji-mart/css/emoji-mart.css";
import { Picker } from "emoji-mart";
import MicRecorder from "mic-recorder-to-mp3";
import clsx from "clsx";
import { isNil } from "lodash";

import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import InputBase from "@material-ui/core/InputBase";
import CircularProgress from "@material-ui/core/CircularProgress";
import { green } from "@material-ui/core/colors";
import AttachFileIcon from "@material-ui/icons/AttachFile";
import IconButton from "@material-ui/core/IconButton";
import MoodIcon from "@material-ui/icons/Mood";
import SendIcon from "@material-ui/icons/Send";
import CancelIcon from "@material-ui/icons/Cancel";
import ClearIcon from "@material-ui/icons/Clear";
import MicIcon from "@material-ui/icons/Mic";
import CheckCircleOutlineIcon from "@material-ui/icons/CheckCircleOutline";
import HighlightOffIcon from "@material-ui/icons/HighlightOff";
// Ícones personalizados
import CreateIcon from "@material-ui/icons/Create";

// === OUTRAS OPÇÕES DE ÍCONES ===
// Para o botão de assinar:
// import EditIcon from "@material-ui/icons/Edit";
// import BorderColorIcon from "@material-ui/icons/BorderColor";
// import GestureIcon from "@material-ui/icons/Gesture";
// import DrawIcon from "@material-ui/icons/Draw";

// Para o botão de enviar:
// import SendRoundedIcon from "@material-ui/icons/SendRounded";
// import TelegramIcon from "@material-ui/icons/Telegram";
// import NavigationIcon from "@material-ui/icons/Navigation";
// import NearMeIcon from "@material-ui/icons/NearMe";
// import ArrowUpwardIcon from "@material-ui/icons/ArrowUpward";

import { Fade, Zoom, Tooltip } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { isString, isEmpty, isObject, has } from "lodash";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import axios from "axios";

import RecordingTimer from "./RecordingTimer";
import { ReplyMessageContext } from "../../context/ReplyingMessage/ReplyingMessageContext";
import { AuthContext } from "../../context/Auth/AuthContext";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import toastError from "../../errors/toastError";

import useQuickMessages from "../../hooks/useQuickMessages";

/*
 * MessageInputCustom - Versão Reorganizada
 * 
 * Principais mudanças:
 * 1. Ícones de emoji e anexo movidos para dentro do input (canto direito)
 * 2. Ícone de envio padrão (SendIcon)
 * 3. Ícone CreateIcon no botão de assinatura (apenas ícone, sem switch)
 * 4. Tamanhos dos ícones ajustados (microfone e lápis maiores)
 * 5. Layout responsivo otimizado
 * 
 * Outras opções de ícones disponíveis nos imports comentados
 */

const Mp3Recorder = new MicRecorder({ bitRate: 128 });

// Cor principal da aplicação - mesma do MessagesList
const primaryColor = "#6B63FF";
const primaryColorLight = "#8B85FF";
const primaryColorDark = "#4B43DF";

const useStyles = makeStyles((theme) => ({
  mainWrapper: {
    backgroundColor: theme.mode === 'light' ? "#ffffff" : "#1C1C1C",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    borderTop: theme.mode === 'light' ? "1px solid #e0e0e0" : "1px solid #333333",
    transition: "all 0.3s ease",
  },

  newMessageBox: {
    backgroundColor: theme.mode === 'light' ? "#ffffff" : "#1C1C1C",
    width: "100%",
    display: "flex",
    padding: "12px 16px",
    alignItems: "center",
    gap: 8,
  },

  messageInputWrapper: {
    padding: "4px 4px 4px 16px", // Padding ajustado para acomodar os ícones internos
    backgroundColor: theme.mode === 'light' ? "#f5f5f5" : "#2C2C2C",
    display: "flex",
    borderRadius: 25,
    flex: 1,
    alignItems: "center",
    transition: "all 0.2s ease",
    border: theme.mode === 'light' ? "1px solid transparent" : "1px solid #3C3C3C",
    position: "relative", // Para posicionar o emoji picker
    "&:focus-within": {
      backgroundColor: theme.mode === 'light' ? "#ffffff" : "#3C3C3C",
      border: `1px solid ${primaryColor}`,
      boxShadow: `0 0 0 3px ${primaryColor}20`,
    },
  },

  messageInput: {
    paddingLeft: 4,
    flex: 1,
    border: "none",
    fontSize: "15px",
    color: theme.mode === 'light' ? "#303030" : "#e8e8e8",
    "&::placeholder": {
      color: theme.mode === 'light' ? "#999" : "#888",
    },
  },

  sendMessageIcons: {
    color: theme.mode === 'light' ? "#666" : "#aaa",
    transition: "all 0.2s ease",
    "&:hover": {
      color: primaryColor,
    },
  },

  inputInternalIcons: {
    display: "flex",
    alignItems: "center",
    gap: 2,
  },

  inputIconButton: {
    padding: 6,
    "&:hover": {
      backgroundColor: "transparent",
    },
  },

  uploadInput: {
    display: "none",
  },

  viewMediaInputWrapper: {
    display: "flex",
    padding: "16px",
    position: "relative",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: theme.mode === 'light' ? "#f8f8f8" : "#2C2C2C",
    borderTop: theme.mode === 'light' ? "1px solid #e0e0e0" : "1px solid #333333",
    minHeight: 72,
  },

  emojiBox: {
    position: "absolute",
    bottom: 50, // Ajustado para ficar acima do input
    right: 0, // Posicionado à direita
    zIndex: 1000,
    borderRadius: "8px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
    overflow: "hidden",
    animation: "$slideUp 0.3s ease-out",
  },

  "@keyframes slideUp": {
    from: {
      opacity: 0,
      transform: "translateY(10px)",
    },
    to: {
      opacity: 1,
      transform: "translateY(0)",
    },
  },

  circleLoading: {
    color: primaryColor,
    opacity: "70%",
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -20,
    marginTop: -20,
  },

  audioLoading: {
    color: primaryColor,
    opacity: "70%",
  },

  recorderWrapper: {
    display: "flex",
    alignItems: "center",
    alignContent: "middle",
    gap: 12,
    padding: "0 8px",
    backgroundColor: theme.mode === 'light' ? "#f5f5f5" : "#2C2C2C",
    borderRadius: 25,
    animation: "$expandWidth 0.3s ease-out",
  },

  "@keyframes expandWidth": {
    from: {
      width: 48,
      opacity: 0,
    },
    to: {
      width: "auto",
      opacity: 1,
    },
  },

  cancelAudioIcon: {
    color: "#ff4444",
    transition: "all 0.2s ease",
    "&:hover": {
      color: "#ff6666",
      transform: "scale(1.1)",
    },
  },

  sendAudioIcon: {
    color: "#4caf50",
    transition: "all 0.2s ease",
    "&:hover": {
      color: "#66bb6a",
      transform: "scale(1.1)",
    },
  },

  replyginMsgWrapper: {
    display: "flex",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 12,
    paddingLeft: 16,
    paddingRight: 16,
    paddingBottom: 4,
    animation: "$slideDown 0.3s ease-out",
  },

  "@keyframes slideDown": {
    from: {
      opacity: 0,
      transform: "translateY(-10px)",
    },
    to: {
      opacity: 1,
      transform: "translateY(0)",
    },
  },

  replyginMsgContainer: {
    flex: 1,
    marginRight: 12,
    overflowY: "hidden",
    backgroundColor: theme.mode === 'light' ? "#f5f5f5" : "#2C2C2C",
    borderRadius: "12px",
    display: "flex",
    position: "relative",
    maxHeight: 80,
    transition: "all 0.2s ease",
  },

  replyginMsgBody: {
    padding: 12,
    height: "auto",
    display: "block",
    whiteSpace: "pre-wrap",
    overflow: "hidden",
    fontSize: "14px",
    color: theme.mode === 'light' ? "#666" : "#aaa",
  },

  replyginContactMsgSideColor: {
    flex: "none",
    width: "4px",
    backgroundColor: primaryColor,
    borderRadius: "12px 0 0 12px",
  },

  replyginSelfMsgSideColor: {
    flex: "none",
    width: "4px",
    backgroundColor: "#4caf50",
    borderRadius: "12px 0 0 12px",
  },

  messageContactName: {
    display: "flex",
    color: primaryColor,
    fontWeight: 600,
    marginBottom: 4,
    fontSize: "13px",
  },

  iconButton: {
    padding: 10,
    "&:hover": {
      backgroundColor: theme.mode === 'light' ? "#f0f0f0" : "#3C3C3C",
    },
  },

  sendButton: {
    backgroundColor: primaryColor,
    color: "#ffffff",
    padding: 10,
    transition: "all 0.2s ease",
    "&:hover": {
      backgroundColor: primaryColorDark,
      transform: "scale(1.05)",
    },
    "&:disabled": {
      backgroundColor: theme.mode === 'light' ? "#e0e0e0" : "#444444",
      color: theme.mode === 'light' ? "#999" : "#666",
    },
  },

  micButton: {
    backgroundColor: theme.mode === 'light' ? "#f5f5f5" : "#2C2C2C",
    color: primaryColor,
    padding: 10,
    transition: "all 0.2s ease",
    "&:hover": {
      backgroundColor: primaryColorLight + "20",
      transform: "scale(1.05)",
    },
    "&:disabled": {
      backgroundColor: theme.mode === 'light' ? "#f5f5f5" : "#2C2C2C",
      color: theme.mode === 'light' ? "#ccc" : "#555",
    },
  },

  signButton: {
    padding: 10,
    "&:hover": {
      backgroundColor: theme.mode === 'light' ? "#f0f0f0" : "#3C3C3C",
    },
  },

  "@keyframes pulse": {
    "0%": {
      transform: "scale(1)",
    },
    "50%": {
      transform: "scale(1.1)",
    },
    "100%": {
      transform: "scale(1)",
    },
  },

  autocompletePopup: {
    "& .MuiAutocomplete-paper": {
      borderRadius: "12px",
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
      marginTop: 8,
      backgroundColor: theme.mode === 'light' ? "#ffffff" : "#2C2C2C",
    },
    "& .MuiAutocomplete-option": {
      padding: "12px 16px",
      "&:hover": {
        backgroundColor: theme.mode === 'light' ? primaryColor + "10" : primaryColor + "20",
      },
      '&[aria-selected="true"]': {
        backgroundColor: theme.mode === 'light' ? primaryColor + "20" : primaryColor + "30",
      },
    },
  },

  mediaPreview: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flex: 1,
    "& span": {
      fontSize: "15px",
      color: theme.mode === 'light' ? "#303030" : "#e8e8e8",
      fontWeight: 500,
    },
  },

  recordingIndicator: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    "& span": {
      color: "#ff4444",
      fontWeight: 600,
      fontSize: "14px",
    },
  },
}));

const EmojiOptions = (props) => {
  const { disabled, showEmoji, setShowEmoji, handleAddEmoji } = props;
  const classes = useStyles();
  return (
    <>
      <Tooltip title="Emojis" placement="top">
        <IconButton
          aria-label="emojiPicker"
          component="span"
          disabled={disabled}
          onClick={(e) => setShowEmoji((prevState) => !prevState)}
          className={classes.inputIconButton}
          size="small"
        >
          <MoodIcon className={classes.sendMessageIcons} />
        </IconButton>
      </Tooltip>
      {showEmoji ? (
        <div className={classes.emojiBox}>
          <Picker
            perLine={16}
            showPreview={false}
            showSkinTones={false}
            onSelect={handleAddEmoji}
            theme="auto"
          />
        </div>
      ) : null}
    </>
  );
};

const SignSwitch = (props) => {
  const { setSignMessage, signMessage } = props;
  const classes = useStyles();
  const primaryColor = "#6B63FF"; // Cor principal do app
  
  // Sempre mostra apenas o ícone do lápis
  return (
    <Tooltip title={i18n.t("messagesInput.signMessage")} placement="top">
      <IconButton
        aria-label="toggle-sign"
        component="span"
        onClick={() => setSignMessage(!signMessage)}
        className={classes.signButton}
        size="small"
        style={{ 
          color: signMessage ? primaryColor : "#999",
          transition: "color 0.2s ease",
          animation: signMessage ? "pulse 2s ease-in-out infinite" : "none"
        }}
      >
        <CreateIcon style={{ fontSize: 22 }} />
      </IconButton>
    </Tooltip>
  );
};

const FileInput = (props) => {
  const { handleChangeMedias, disableOption } = props;
  const classes = useStyles();
  return (
    <>
      <input
        multiple
        type="file"
        id="upload-button"
        disabled={disableOption()}
        className={classes.uploadInput}
        onChange={handleChangeMedias}
      />
      <label htmlFor="upload-button">
        <Tooltip title={i18n.t("messagesInput.sendFile")} placement="top">
          <IconButton
            aria-label="upload"
            component="span"
            disabled={disableOption()}
            className={classes.inputIconButton}
            size="small"
          >
            <AttachFileIcon className={classes.sendMessageIcons} />
          </IconButton>
        </Tooltip>
      </label>
    </>
  );
};

const ActionButtons = (props) => {
  const {
    inputMessage,
    loading,
    recording,
    ticketStatus,
    handleSendMessage,
    handleCancelAudio,
    handleUploadAudio,
    handleStartRecording,
  } = props;
  const classes = useStyles();
  
  if (inputMessage) {
    return (
      <Zoom in={true} timeout={200}>
        <Tooltip title={i18n.t("messagesInput.sendMessage")} placement="top">
          <IconButton
            aria-label="sendMessage"
            component="span"
            onClick={handleSendMessage}
            disabled={loading}
            className={classes.sendButton}
            size="small"
          >
            <SendIcon />
          </IconButton>
        </Tooltip>
      </Zoom>
    );
  } else if (recording) {
    return (
      <Fade in={true} timeout={300}>
        <div className={classes.recorderWrapper}>
          <Tooltip title={i18n.t("messagesInput.cancelRecording")} placement="top">
            <IconButton
              aria-label="cancelRecording"
              component="span"
              fontSize="large"
              disabled={loading}
              onClick={handleCancelAudio}
              size="small"
            >
              <HighlightOffIcon className={classes.cancelAudioIcon} />
            </IconButton>
          </Tooltip>
          
          {loading ? (
            <div>
              <CircularProgress className={classes.audioLoading} size={24} />
            </div>
          ) : (
            <div className={classes.recordingIndicator}>
              <RecordingTimer />
            </div>
          )}

          <Tooltip title={i18n.t("messagesInput.sendAudio")} placement="top">
            <IconButton
              aria-label="sendRecordedAudio"
              component="span"
              onClick={handleUploadAudio}
              disabled={loading}
              size="small"
            >
              <CheckCircleOutlineIcon className={classes.sendAudioIcon} />
            </IconButton>
          </Tooltip>
        </div>
      </Fade>
    );
  } else {
    return (
      <Zoom in={true} timeout={200}>
        <Tooltip title={i18n.t("messagesInput.recordAudio")} placement="top">
          <IconButton
            aria-label="showRecorder"
            component="span"
            disabled={loading || ticketStatus !== "open"}
            onClick={handleStartRecording}
            className={classes.micButton}
            size="small"
          >
            <MicIcon />
          </IconButton>
        </Tooltip>
      </Zoom>
    );
  }
};

const CustomInput = (props) => {
  const {
    loading,
    inputRef,
    ticketStatus,
    inputMessage,
    setInputMessage,
    handleSendMessage,
    handleInputPaste,
    disableOption,
    handleQuickAnswersClick,
    handleChangeMedias,
    showEmoji,
    setShowEmoji,
    handleAddEmoji,
  } = props;
  const classes = useStyles();
  const [quickMessages, setQuickMessages] = useState([]);
  const [options, setOptions] = useState([]);
  const [popupOpen, setPopupOpen] = useState(false);

  const { user } = useContext(AuthContext);

  const { list: listQuickMessages } = useQuickMessages();

  useEffect(() => {
    async function fetchData() {
      const companyId = localStorage.getItem("companyId");
      const messages = await listQuickMessages({ companyId, userId: user.id });
      const options = messages.map((m) => {
        let truncatedMessage = m.message;
        if (isString(truncatedMessage) && truncatedMessage.length > 35) {
          truncatedMessage = m.message.substring(0, 35) + "...";
        }
        return {
          value: m.message,
          label: `/${m.shortcode} - ${truncatedMessage}`,
          mediaPath: m.mediaPath,
        };
      });
      setQuickMessages(options);
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (
      isString(inputMessage) &&
      !isEmpty(inputMessage) &&
      inputMessage.length > 1
    ) {
      const firstWord = inputMessage.charAt(0);
      setPopupOpen(firstWord.indexOf("/") > -1);

      const filteredOptions = quickMessages.filter(
        (m) => m.label.indexOf(inputMessage) > -1
      );
      setOptions(filteredOptions);
    } else {
      setPopupOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputMessage]);

  const onKeyPress = (e) => {
    if (loading || e.shiftKey) return;
    else if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const onPaste = (e) => {
    if (ticketStatus === "open") {
      handleInputPaste(e);
    }
  };

  const renderPlaceholder = () => {
    if (ticketStatus === "open") {
      return i18n.t("messagesInput.placeholderOpen");
    }
    return i18n.t("messagesInput.placeholderClosed");
  };

  const setInputRef = (input) => {
    if (input) {
      input.focus();
      inputRef.current = input;
    }
  };

  return (
    <div className={classes.messageInputWrapper}>
      <Autocomplete
        freeSolo
        open={popupOpen}
        id="grouped-demo"
        value={inputMessage}
        options={options}
        closeIcon={null}
        className={classes.autocompletePopup}
        getOptionLabel={(option) => {
          if (isObject(option)) {
            return option.label;
          } else {
            return option;
          }
        }}
        onChange={(event, opt) => {
          if (isObject(opt) && has(opt, "value") && isNil(opt.mediaPath)) {
            setInputMessage(opt.value);
            setTimeout(() => {
              inputRef.current.scrollTop = inputRef.current.scrollHeight;
            }, 200);
          } else if (isObject(opt) && has(opt, "value") && !isNil(opt.mediaPath)) {
            handleQuickAnswersClick(opt);

            setTimeout(() => {
              inputRef.current.scrollTop = inputRef.current.scrollHeight;
            }, 200);
          }
        }}
        onInputChange={(event, opt, reason) => {
          if (reason === "input") {
            setInputMessage(event.target.value);
          }
        }}
        onPaste={onPaste}
        onKeyPress={onKeyPress}
        style={{ width: "100%" }}
        renderInput={(params) => {
          const { InputLabelProps, InputProps, ...rest } = params;
          return (
            <InputBase
              {...params.InputProps}
              {...rest}
              disabled={disableOption()}
              inputRef={setInputRef}
              placeholder={renderPlaceholder()}
              multiline
              className={classes.messageInput}
              maxRows={5}
            />
          );
        }}
      />
      
      {/* Ícones dentro do input à direita */}
      <div className={classes.inputInternalIcons}>
        <FileInput
          disableOption={disableOption}
          handleChangeMedias={handleChangeMedias}
        />
        
        <EmojiOptions
          disabled={disableOption()}
          handleAddEmoji={handleAddEmoji}
          showEmoji={showEmoji}
          setShowEmoji={setShowEmoji}
        />
      </div>
    </div>
  );
};

const MessageInputCustom = (props) => {
  const { ticketStatus, ticketId } = props;
  const classes = useStyles();

  const [medias, setMedias] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const inputRef = useRef();
  const { setReplyingMessage, replyingMessage } =
    useContext(ReplyMessageContext);
  const { user } = useContext(AuthContext);

  const [signMessage, setSignMessage] = useLocalStorage("signOption", true);

  useEffect(() => {
    inputRef.current.focus();
  }, [replyingMessage]);

  useEffect(() => {
    inputRef.current.focus();
    return () => {
      setInputMessage("");
      setShowEmoji(false);
      setMedias([]);
      setReplyingMessage(null);
    };
  }, [ticketId, setReplyingMessage]);

  const handleAddEmoji = (e) => {
    let emoji = e.native;
    setInputMessage((prevState) => prevState + emoji);
  };

  const handleChangeMedias = (e) => {
    if (!e.target.files) {
      return;
    }

    const selectedMedias = Array.from(e.target.files);
    setMedias(selectedMedias);
  };

  const handleInputPaste = (e) => {
    if (e.clipboardData.files[0]) {
      setMedias([e.clipboardData.files[0]]);
    }
  };

  const handleUploadQuickMessageMedia = async (blob, message) => {
    setLoading(true);
    try {
      const extension = blob.type.split("/")[1];

      const formData = new FormData();
      const filename = `${new Date().getTime()}.${extension}`;
      formData.append("medias", blob, filename);
      formData.append("body",  message);
      formData.append("fromMe", true);

      await api.post(`/messages/${ticketId}`, formData);
    } catch (err) {
      toastError(err);
      setLoading(false);
    }
    setLoading(false);
  };
  
  const handleQuickAnswersClick = async (value) => {
    if (value.mediaPath) {
      try {
        const { data } = await axios.get(value.mediaPath, {
          responseType: "blob",
        });

        handleUploadQuickMessageMedia(data, value.value);
        setInputMessage("");
        return;
      } catch (err) {
        toastError(err);
      }
    }

    setInputMessage("");
    setInputMessage(value.value);
  };

  const handleUploadMedia = async (e) => {
    setLoading(true);
    e.preventDefault();

    const formData = new FormData();
    formData.append("fromMe", true);
    medias.forEach((media) => {
      formData.append("medias", media);
      formData.append("body", media.name);
    });

    try {
      await api.post(`/messages/${ticketId}`, formData);
    } catch (err) {
      toastError(err);
    }

    setLoading(false);
    setMedias([]);
  };

  const handleSendMessage = async () => {
    if (inputMessage.trim() === "") return;
    setLoading(true);

    const message = {
      read: 1,
      fromMe: true,
      mediaUrl: "",
      body: signMessage
        ? `*${user?.name}:*\n${inputMessage.trim()}`
        : inputMessage.trim(),
      quotedMsg: replyingMessage,
    };
    try {
      await api.post(`/messages/${ticketId}`, message);
    } catch (err) {
      toastError(err);
    }

    setInputMessage("");
    setShowEmoji(false);
    setLoading(false);
    setReplyingMessage(null);
  };

  const handleStartRecording = async () => {
    setLoading(true);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await Mp3Recorder.start();
      setRecording(true);
      setLoading(false);
    } catch (err) {
      toastError(err);
      setLoading(false);
    }
  };

  const handleUploadAudio = async () => {
    setLoading(true);
    try {
      const [, blob] = await Mp3Recorder.stop().getMp3();
      if (blob.size < 10000) {
        setLoading(false);
        setRecording(false);
        return;
      }

      const formData = new FormData();
      const filename = `audio-record-site-${new Date().getTime()}.mp3`;
      formData.append("medias", blob, filename);
      formData.append("body", filename);
      formData.append("fromMe", true);

      await api.post(`/messages/${ticketId}`, formData);
    } catch (err) {
      toastError(err);
    }

    setRecording(false);
    setLoading(false);
  };

  const handleCancelAudio = async () => {
    try {
      await Mp3Recorder.stop().getMp3();
      setRecording(false);
    } catch (err) {
      toastError(err);
    }
  };

  const disableOption = () => {
    return loading || recording || ticketStatus !== "open";
  };

  const renderReplyingMessage = (message) => {
    return (
      <Fade in={true} timeout={300}>
        <div className={classes.replyginMsgWrapper}>
          <div className={classes.replyginMsgContainer}>
            <span
              className={clsx(classes.replyginContactMsgSideColor, {
                [classes.replyginSelfMsgSideColor]: !message.fromMe,
              })}
            ></span>
            <div className={classes.replyginMsgBody}>
              {!message.fromMe && (
                <span className={classes.messageContactName}>
                  {message.contact?.name}
                </span>
              )}
              {message.body}
            </div>
          </div>
          <Tooltip title={i18n.t("messagesInput.clearReply")} placement="top">
            <IconButton
              aria-label="showRecorder"
              component="span"
              disabled={loading || ticketStatus !== "open"}
              onClick={() => setReplyingMessage(null)}
              className={classes.iconButton}
              size="small"
            >
              <ClearIcon className={classes.sendMessageIcons} />
            </IconButton>
          </Tooltip>
        </div>
      </Fade>
    );
  };

  if (medias.length > 0)
    return (
      <Paper elevation={0} square className={classes.viewMediaInputWrapper}>
        <Tooltip title={i18n.t("messagesInput.cancelUpload")} placement="top">
          <IconButton
            aria-label="cancel-upload"
            component="span"
            onClick={(e) => setMedias([])}
            className={classes.iconButton}
          >
            <CancelIcon style={{ color: "#ff4444" }} />
          </IconButton>
        </Tooltip>

        {loading ? (
          <div style={{ position: "relative", width: 40, height: 40 }}>
            <CircularProgress className={classes.circleLoading} size={40} />
          </div>
        ) : (
          <div className={classes.mediaPreview}>
            <AttachFileIcon color="primary" />
            <span>{medias[0]?.name}</span>
          </div>
        )}
        
        <Tooltip title={i18n.t("messagesInput.sendFile")} placement="top">
          <IconButton
            aria-label="send-upload"
            component="span"
            onClick={handleUploadMedia}
            disabled={loading}
            className={classes.sendButton}
          >
            <SendIcon />
          </IconButton>
        </Tooltip>
      </Paper>
    );
  else {
    return (
      <Paper square elevation={0} className={classes.mainWrapper}>
        {replyingMessage && renderReplyingMessage(replyingMessage)}
        <div className={classes.newMessageBox}>
          <SignSwitch
            setSignMessage={setSignMessage}
            signMessage={signMessage}
          />

          <CustomInput
            loading={loading}
            inputRef={inputRef}
            ticketStatus={ticketStatus}
            inputMessage={inputMessage}
            setInputMessage={setInputMessage}
            handleSendMessage={handleSendMessage}
            handleInputPaste={handleInputPaste}
            disableOption={disableOption}
            handleQuickAnswersClick={handleQuickAnswersClick}
            handleChangeMedias={handleChangeMedias}
            showEmoji={showEmoji}
            setShowEmoji={setShowEmoji}
            handleAddEmoji={handleAddEmoji}
          />

          <ActionButtons
            inputMessage={inputMessage}
            loading={loading}
            recording={recording}
            ticketStatus={ticketStatus}
            handleSendMessage={handleSendMessage}
            handleCancelAudio={handleCancelAudio}
            handleUploadAudio={handleUploadAudio}
            handleStartRecording={handleStartRecording}
          />
        </div>
      </Paper>
    );
  }
};

export default MessageInputCustom;