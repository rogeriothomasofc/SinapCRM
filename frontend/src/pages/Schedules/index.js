import React, { useState, useEffect, useReducer, useCallback, useContext } from "react";
import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import {
  Paper,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  Typography,
  Box,
  Fade,
  CircularProgress,
  Avatar,
  Tooltip,
  Chip,
} from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import EditIcon from "@material-ui/icons/Edit";
import AddIcon from "@material-ui/icons/Add";
import CalendarTodayIcon from "@material-ui/icons/CalendarToday";
import AccessTimeIcon from "@material-ui/icons/AccessTime";
import WhatsAppIcon from "@material-ui/icons/WhatsApp";
import ScheduleIcon from "@material-ui/icons/Schedule";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import ScheduleModal from "../../components/ScheduleModal";
import ConfirmationModal from "../../components/ConfirmationModal";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import toastError from "../../errors/toastError";
import moment from "moment";
import { SocketContext } from "../../context/Socket/SocketContext";
import { AuthContext } from "../../context/Auth/AuthContext";

function getUrlParam(paramName) {
  const searchParams = new URLSearchParams(window.location.search);
  return searchParams.get(paramName);
}

const reducer = (state, action) => {
  switch (action.type) {
    case "LOAD_SCHEDULES":
      const newSchedules = action.payload;
      const existingIds = new Set(state.map(s => s.id));
      const uniqueNewSchedules = newSchedules.filter(s => !existingIds.has(s.id));
      return [...state, ...uniqueNewSchedules];
      
    case "UPDATE_SCHEDULES":
      const schedule = action.payload;
      const scheduleIndex = state.findIndex((s) => s.id === schedule.id);
      if (scheduleIndex !== -1) {
        // Atualiza o agendamento existente
        const newState = [...state];
        newState[scheduleIndex] = schedule;
        return newState;
      }
      // Só adiciona se for realmente novo
      return [schedule, ...state];
      
    case "DELETE_SCHEDULE":
      return state.filter((s) => s.id !== action.payload);
      
    case "RESET":
      return [];
      
    default:
      return state;
  }
};

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(1.5),
    overflowY: "auto",
    backgroundColor: theme.palette.background.default,
    ...theme.scrollbarStyles,
  },
  searchField: {
    "& .MuiOutlinedInput-root": {
      borderRadius: 6,
      backgroundColor: theme.palette.background.paper,
      "& fieldset": {
        borderColor: "transparent",
      },
      "&:hover fieldset": {
        borderColor: theme.palette.divider,
      },
      "&.Mui-focused fieldset": {
        borderColor: theme.palette.primary.main,
        borderWidth: 1,
      },
    },
    "& .MuiInputBase-input": {
      padding: "8px 12px",
      fontSize: "0.875rem",
    },
  },
  actionButton: {
    borderRadius: 6,
    textTransform: "none",
    fontWeight: 500,
    padding: "6px 16px",
    fontSize: "0.875rem",
    boxShadow: "none",
    "&:hover": {
      boxShadow: theme.shadows[2],
    },
  },
  scheduleRow: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(1, 1.5),
    marginBottom: theme.spacing(0.25),
    borderRadius: 6,
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
    transition: "all 0.2s ease",
    minHeight: 52,
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
      borderColor: theme.palette.primary.main,
    },
  },
  scheduleInfo: {
    display: "flex",
    alignItems: "center",
    flex: 1,
    gap: theme.spacing(1.5),
  },
  avatar: {
    width: 36,
    height: 36,
    backgroundColor: "#e0e0e0",
    fontSize: "0.875rem",
    fontWeight: 500,
    color: "#757575",
  },
  scheduleDetails: {
    flex: 1,
    minWidth: 0,
    display: "grid",
    gridTemplateColumns: "minmax(200px, 1fr) 150px 100px 200px 100px",
    alignItems: "center",
    gap: theme.spacing(2),
  },
  contactName: {
    fontWeight: 400,
    fontSize: "0.875rem",
    color: theme.palette.text.primary,
    minWidth: 100,
    maxWidth: 180,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  scheduleItem: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    fontSize: "0.875rem",
    color: theme.palette.text.primary,
    whiteSpace: "nowrap",
    minWidth: 0,
    "& span": {
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
  },
  messagePreview: {
    fontSize: "0.875rem",
    color: theme.palette.text.secondary,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  statusChip: {
    height: 22,
    fontSize: "0.75rem",
    fontWeight: 500,
  },
  actionButtons: {
    display: "flex",
    gap: theme.spacing(0.5),
    transition: "opacity 0.2s ease",
  },
  iconButton: {
    padding: 6,
    "& .MuiSvgIcon-root": {
      fontSize: "1.25rem",
    },
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
  },
  whatsappIcon: {
    fontSize: 14,
    color: "#25D366",
  },
  emptyItem: {
    display: "block",
    width: "100%",
  },
  emptyState: {
    textAlign: "center",
    padding: theme.spacing(6),
    color: theme.palette.text.secondary,
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    padding: theme.spacing(3),
  },
  headerContent: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },
  scheduleCounter: {
    backgroundColor: theme.palette.action.hover,
    borderRadius: 12,
    padding: "2px 10px",
    fontSize: "0.8125rem",
    fontWeight: 500,
    color: theme.palette.text.secondary,
  },
}));

const Schedules = () => {
  const classes = useStyles();
  const history = useHistory();
  const theme = useTheme();

  const { user } = useContext(AuthContext);
  const socketManager = useContext(SocketContext);

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [deletingSchedule, setDeletingSchedule] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [schedules, dispatch] = useReducer(reducer, []);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [contactId, setContactId] = useState(+getUrlParam("contactId"));

  const fetchSchedules = useCallback(async () => {
    try {
      const { data } = await api.get("/schedules/", {
        params: { searchParam, pageNumber },
      });
      dispatch({ type: "LOAD_SCHEDULES", payload: data.schedules });
      setHasMore(data.hasMore);
      setLoading(false);
    } catch (err) {
      toastError(err);
    }
  }, [searchParam, pageNumber]);

  const handleOpenScheduleModalFromContactId = useCallback(() => {
    if (contactId) {
      setSelectedSchedule(null);
      setScheduleModalOpen(true);
    }
  }, [contactId]);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      fetchSchedules();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber, fetchSchedules]);

  useEffect(() => {
    handleOpenScheduleModalFromContactId();
    const companyId = localStorage.getItem("companyId");
    const socket = socketManager.getSocket(companyId);

    const handleScheduleUpdate = (data) => {
      if (data.action === "update" || data.action === "create") {
        // Evita duplicação verificando se já existe
        dispatch({ type: "UPDATE_SCHEDULES", payload: data.schedule });
      } else if (data.action === "delete") {
        dispatch({ type: "DELETE_SCHEDULE", payload: +data.scheduleId });
      }
    };

    socket.on(`company-${companyId}-schedule`, handleScheduleUpdate);

    return () => {
      socket.off(`company-${companyId}-schedule`, handleScheduleUpdate);
    };
  }, [handleOpenScheduleModalFromContactId, socketManager]);

  const cleanContact = () => {
    setContactId("");
  };

  const handleOpenScheduleModal = () => {
    setSelectedSchedule(null);
    setScheduleModalOpen(true);
  };

  const handleCloseScheduleModal = useCallback(() => {
    setSelectedSchedule(null);
    setScheduleModalOpen(false);
    if (contactId) {
      cleanContact();
    }
  }, [contactId]);

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleEditSchedule = (schedule) => {
    setSelectedSchedule(schedule);
    setScheduleModalOpen(true);
  };

  const handleDeleteSchedule = async (scheduleId) => {
    try {
      await api.delete(`/schedules/${scheduleId}`);
      toast.success(i18n.t("schedules.toasts.deleted"));
      dispatch({ type: "DELETE_SCHEDULE", payload: scheduleId });
    } catch (err) {
      toastError(err);
    }
    setDeletingSchedule(null);
    setConfirmModalOpen(false);
  };

  const loadMore = () => {
    setPageNumber((prevState) => prevState + 1);
  };

  const handleScroll = (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      loadMore();
    }
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getScheduleStatus = (schedule) => {
    const now = moment();
    const scheduleTime = moment(schedule.sendAt);

    if (schedule.sentAt || schedule.status === "ENVIADA") {
      return { label: "Enviado", color: "default", style: { backgroundColor: "#4caf50", color: "#fff" } };
    } else if (schedule.status === "ERRO") {
      return { label: "Erro", color: "error" };
    } else if (scheduleTime.isBefore(now)) {
      return { label: "Atrasado", color: "error" };
    } else if (scheduleTime.diff(now, "hours") < 1) {
      return { label: "Em breve", color: "warning" };
    }
    return { label: "Agendado", color: "primary" };
  };

  const filteredSchedules = schedules
    .filter(
      (schedule) =>
        schedule.contact?.name?.toLowerCase().includes(searchParam) ||
        schedule.body?.toLowerCase().includes(searchParam)
    )
    .sort((a, b) => moment(a.sendAt).diff(moment(b.sendAt)));

  return (
    <MainContainer>
      <ConfirmationModal
        title={`${i18n.t("schedules.confirmationModal.deleteTitle")}`}
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={() => handleDeleteSchedule(deletingSchedule.id)}
      >
        {i18n.t("schedules.confirmationModal.deleteMessage")}
      </ConfirmationModal>

      <ScheduleModal
        open={scheduleModalOpen}
        onClose={handleCloseScheduleModal}
        reload={fetchSchedules}
        scheduleId={selectedSchedule?.id}
        contactId={contactId}
        cleanContact={cleanContact}
      />

      <MainHeader>
        <Box className={classes.headerContent}>
          <Title>{i18n.t("schedules.title")}</Title>
          {schedules.length > 0 && (
            <span className={classes.scheduleCounter}>{schedules.length}</span>
          )}
        </Box>

        <MainHeaderButtonsWrapper>
          <TextField
            placeholder={i18n.t("contacts.searchPlaceholder")}
            type="search"
            value={searchParam}
            onChange={handleSearch}
            variant="outlined"
            size="small"
            className={classes.searchField}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" style={{ color: theme.palette.text.secondary }} />
                </InputAdornment>
              ),
            }}
          />

          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenScheduleModal}
            startIcon={<AddIcon />}
            className={classes.actionButton}
            size="small"
          >
            {i18n.t("schedules.buttons.add")}
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>

      <Paper
        className={classes.mainPaper}
        elevation={0}
        onScroll={handleScroll}
      >
        {filteredSchedules.length === 0 && !loading ? (
          <Box className={classes.emptyState}>
            <ScheduleIcon style={{ fontSize: 48, marginBottom: 16, opacity: 0.2 }} />
            <Typography variant="body1">
              {searchParam
                ? i18n.t("schedules.noResults") || "Nenhum agendamento encontrado"
                : i18n.t("schedules.noSchedules") || "Nenhum agendamento cadastrado"}
            </Typography>
          </Box>
        ) : (
          <Box>
            {filteredSchedules.map((schedule, index) => {
              const status = getScheduleStatus(schedule);
              
              return (
                <Fade
                  in={true}
                  timeout={300 + index * 50}
                  key={schedule.id}
                >
                  <Box className={classes.scheduleRow}                  >
                    <Box className={classes.scheduleInfo}>
                      <Avatar
                        className={classes.avatar}
                      >
                        {getInitials(schedule.contact?.name || "?")}
                      </Avatar>

                      <Box className={classes.scheduleDetails}>
                        <Typography className={classes.contactName}>
                          {schedule.contact.name}
                        </Typography>

                        <Box className={classes.scheduleItem}>
                          <CalendarTodayIcon style={{ fontSize: 14, color: theme.palette.text.secondary }} />
                          <span>
                            {moment(schedule.sendAt).format("DD/MM/YYYY")}
                          </span>
                        </Box>

                        <Box className={classes.scheduleItem}>
                          <AccessTimeIcon style={{ fontSize: 14, color: theme.palette.text.secondary }} />
                          <span>
                            {moment(schedule.sendAt).format("HH:mm")}
                          </span>
                        </Box>

                        {schedule.contact.number ? (
                          <Box className={classes.scheduleItem}>
                            <WhatsAppIcon className={classes.whatsappIcon} />
                            <span>{schedule.contact.number}</span>
                          </Box>
                        ) : (
                          <Box className={classes.emptyItem} />
                        )}

                        <Chip
                          label={status.label}
                          color={status.color}
                          size="small"
                          className={classes.statusChip}
                          style={status.style || {}}
                        />
                      </Box>
                    </Box>

                    <Box className={classes.actionButtons}>
                      <Tooltip title={i18n.t("schedules.buttons.edit")} placement="top" arrow>
                        <IconButton
                          size="small"
                          className={classes.iconButton}
                          onClick={() => handleEditSchedule(schedule)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title={i18n.t("schedules.buttons.delete")} placement="top" arrow>
                        <IconButton
                          size="small"
                          className={classes.iconButton}
                          onClick={() => {
                            setDeletingSchedule(schedule);
                            setConfirmModalOpen(true);
                          }}
                        >
                          <DeleteOutlineIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </Fade>
              );
            })}
          </Box>
        )}

        {loading && (
          <Box className={classes.loadingContainer}>
            <CircularProgress size={32} />
          </Box>
        )}
      </Paper>
    </MainContainer>
  );
};

export default Schedules;