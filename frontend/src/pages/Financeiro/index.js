import React, { useState, useEffect, useReducer } from "react";
import { toast } from "react-toastify";

import { makeStyles } from "@material-ui/core/styles";
import {
  Paper,
  Button,
  Box,
  TextField,
  InputAdornment,
  Typography,
  Avatar,
  Chip,
  Fade,
  IconButton,
} from "@material-ui/core";

import {
  Search as SearchIcon,
  Receipt,
  CalendarToday,
  AttachMoney,
  CheckCircle,
  Warning,
  Schedule,
  Payment,
} from "@material-ui/icons";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import SubscriptionModal from "../../components/SubscriptionModal";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import toastError from "../../errors/toastError";

import moment from "moment";

const reducer = (state, action) => {
  if (action.type === "LOAD_INVOICES") {
    const invoices = action.payload;
    const newUsers = [];

    invoices.forEach((user) => {
      const userIndex = state.findIndex((u) => u.id === user.id);
      if (userIndex !== -1) {
        state[userIndex] = user;
      } else {
        newUsers.push(user);
      }
    });

    return [...state, ...newUsers];
  }

  if (action.type === "UPDATE_USERS") {
    const user = action.payload;
    const userIndex = state.findIndex((u) => u.id === user.id);

    if (userIndex !== -1) {
      state[userIndex] = user;
      return [...state];
    } else {
      return [user, ...state];
    }
  }

  if (action.type === "DELETE_USER") {
    const userId = action.payload;

    const userIndex = state.findIndex((u) => u.id === userId);
    if (userIndex !== -1) {
      state.splice(userIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
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
  invoiceCard: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(2),
    marginBottom: theme.spacing(1),
    borderRadius: 8,
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
    transition: "all 0.2s ease",
    "&:hover": {
      transform: "translateX(4px)",
      borderColor: theme.palette.primary.main,
      boxShadow: theme.shadows[3],
    },
  },
  invoiceCardExpired: {
    backgroundColor: "#ffebee",
    borderColor: "#ffcdd2",
    "&:hover": {
      borderColor: "#f44336",
    },
  },
  invoiceAvatar: {
    width: 40,
    height: 40,
    marginRight: theme.spacing(2),
  },
  avatarPaid: {
    backgroundColor: "#4caf50",
  },
  avatarOpen: {
    backgroundColor: theme.palette.primary.main,
  },
  avatarExpired: {
    backgroundColor: "#f44336",
  },
  invoiceContent: {
    flex: 1,
    minWidth: 0,
  },
  invoiceHeader: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    marginBottom: theme.spacing(0.5),
  },
  invoiceId: {
    fontSize: "0.75rem",
    color: theme.palette.text.secondary,
    fontWeight: 500,
  },
  invoiceDetail: {
    fontSize: "0.9rem",
    fontWeight: 600,
    color: theme.palette.text.primary,
  },
  invoiceInfo: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(3),
    marginTop: theme.spacing(0.5),
  },
  infoItem: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.5),
  },
  infoIcon: {
    fontSize: "1rem",
    color: theme.palette.text.secondary,
  },
  infoText: {
    fontSize: "0.8125rem",
    color: theme.palette.text.secondary,
  },
  invoiceValue: {
    fontSize: "1.25rem",
    fontWeight: 700,
    color: theme.palette.text.primary,
    marginRight: theme.spacing(2),
  },
  statusChip: {
    marginRight: theme.spacing(2),
    fontWeight: 500,
    fontSize: "0.75rem",
  },
  chipPaid: {
    backgroundColor: "#e8f5e9",
    color: "#2e7d32",
  },
  chipOpen: {
    backgroundColor: "#e3f2fd",
    color: "#1565c0",
  },
  chipExpired: {
    backgroundColor: "#ffebee",
    color: "#c62828",
  },
  payButton: {
    borderRadius: 6,
    textTransform: "none",
    fontWeight: 500,
    fontSize: "0.875rem",
    minWidth: 100,
  },
  emptyState: {
    textAlign: "center",
    padding: theme.spacing(6),
    color: theme.palette.text.secondary,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: theme.spacing(2),
    opacity: 0.3,
  },
  headerContent: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },
  invoiceCounter: {
    backgroundColor: theme.palette.action.hover,
    borderRadius: 12,
    padding: "2px 10px",
    fontSize: "0.8125rem",
    fontWeight: 500,
    color: theme.palette.text.secondary,
  },
  summary: {
    display: "flex",
    gap: theme.spacing(2),
    marginBottom: theme.spacing(2),
    flexWrap: "wrap",
  },
  summaryCard: {
    flex: "1 1 200px",
    padding: theme.spacing(1.5),
    borderRadius: 8,
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1.5),
  },
  summaryIcon: {
    width: 36,
    height: 36,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  summaryContent: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: "0.75rem",
    color: theme.palette.text.secondary,
    textTransform: "uppercase",
    fontWeight: 500,
  },
  summaryValue: {
    fontSize: "1.25rem",
    fontWeight: 700,
    color: theme.palette.text.primary,
  },
}));

const Invoices = () => {
  const classes = useStyles();

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [invoices, dispatch] = useReducer(reducer, []);
  const [storagePlans, setStoragePlans] = useState([]);
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [contactModalOpen, setContactModalOpen] = useState(false);

  const handleOpenContactModal = (invoices) => {
    setStoragePlans(invoices);
    setSelectedContactId(null);
    setContactModalOpen(true);
  };

  const handleCloseContactModal = () => {
    setSelectedContactId(null);
    setContactModalOpen(false);
  };

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchInvoices = async () => {
        try {
          const { data } = await api.get("/invoices/all", {
            params: { searchParam, pageNumber },
          });
          dispatch({ type: "LOAD_INVOICES", payload: data });
          setHasMore(data.hasMore);
          setLoading(false);
        } catch (err) {
          toastError(err);
        }
      };
      fetchInvoices();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber]);

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

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const getInvoiceStatus = (record) => {
    const hoje = moment(moment()).format("DD/MM/yyyy");
    const vencimento = moment(record.dueDate).format("DD/MM/yyyy");
    var diff = moment(vencimento, "DD/MM/yyyy").diff(moment(hoje, "DD/MM/yyyy"));
    var dias = moment.duration(diff).asDays();
    const status = record.status;
    
    if (status === "paid") {
      return { status: i18n.t("invoices.paid"), type: "paid" };
    }
    if (dias < 0) {
      return { status: i18n.t("invoices.expired"), type: "expired" };
    } else {
      return { status: i18n.t("invoices.open"), type: "open" };
    }
  };

  const getStatusIcon = (type) => {
    switch (type) {
      case "paid":
        return <CheckCircle />;
      case "expired":
        return <Warning />;
      case "open":
        return <Schedule />;
      default:
        return <Receipt />;
    }
  };

  const getStatusChipClass = (type) => {
    switch (type) {
      case "paid":
        return classes.chipPaid;
      case "expired":
        return classes.chipExpired;
      case "open":
        return classes.chipOpen;
      default:
        return "";
    }
  };

  const getAvatarClass = (type) => {
    switch (type) {
      case "paid":
        return classes.avatarPaid;
      case "expired":
        return classes.avatarExpired;
      case "open":
        return classes.avatarOpen;
      default:
        return "";
    }
  };

  const calculateSummary = () => {
    const total = invoices.reduce((acc, inv) => acc + inv.value, 0);
    const paid = invoices.filter(inv => inv.status === "paid").reduce((acc, inv) => acc + inv.value, 0);
    const pending = total - paid;
    
    return { total, paid, pending };
  };

  const filteredInvoices = invoices.filter(
    (invoice) =>
      invoice.detail?.toLowerCase().includes(searchParam) ||
      invoice.id.toString().includes(searchParam)
  );

  const summary = calculateSummary();

  return (
    <MainContainer>
      <SubscriptionModal
        open={contactModalOpen}
        onClose={handleCloseContactModal}
        aria-labelledby="form-dialog-title"
        Invoice={storagePlans}
        contactId={selectedContactId}
      />
      
      <MainHeader>
        <Box className={classes.headerContent}>
          <Title>{i18n.t("invoices.title")}</Title>
          {invoices.length > 0 && (
            <span className={classes.invoiceCounter}>{invoices.length}</span>
          )}
        </Box>
        
        <MainHeaderButtonsWrapper>
          <TextField
            placeholder="Buscar fatura..."
            type="search"
            value={searchParam}
            onChange={handleSearch}
            variant="outlined"
            size="small"
            className={classes.searchField}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </MainHeaderButtonsWrapper>
      </MainHeader>
      
      <Paper className={classes.mainPaper} elevation={0} onScroll={handleScroll}>
        {/* Summary Cards */}
        <Box className={classes.summary}>
          <Box className={classes.summaryCard}>
            <Box className={classes.summaryIcon} style={{ backgroundColor: "#e3f2fd" }}>
              <AttachMoney style={{ color: "#1976d2" }} />
            </Box>
            <Box className={classes.summaryContent}>
              <Typography className={classes.summaryLabel}>Total</Typography>
              <Typography className={classes.summaryValue}>
                {summary.total.toLocaleString("pt-br", { style: "currency", currency: "BRL" })}
              </Typography>
            </Box>
          </Box>
          
          <Box className={classes.summaryCard}>
            <Box className={classes.summaryIcon} style={{ backgroundColor: "#e8f5e9" }}>
              <CheckCircle style={{ color: "#4caf50" }} />
            </Box>
            <Box className={classes.summaryContent}>
              <Typography className={classes.summaryLabel}>Pago</Typography>
              <Typography className={classes.summaryValue} style={{ color: "#4caf50" }}>
                {summary.paid.toLocaleString("pt-br", { style: "currency", currency: "BRL" })}
              </Typography>
            </Box>
          </Box>
          
          <Box className={classes.summaryCard}>
            <Box className={classes.summaryIcon} style={{ backgroundColor: "#fff3e0" }}>
              <Schedule style={{ color: "#ff9800" }} />
            </Box>
            <Box className={classes.summaryContent}>
              <Typography className={classes.summaryLabel}>Pendente</Typography>
              <Typography className={classes.summaryValue} style={{ color: "#ff9800" }}>
                {summary.pending.toLocaleString("pt-br", { style: "currency", currency: "BRL" })}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Invoice List */}
        {filteredInvoices.length === 0 ? (
          <Box className={classes.emptyState}>
            <Receipt className={classes.emptyStateIcon} />
            <Typography variant="body1">
              {searchParam ? "Nenhuma fatura encontrada" : "Nenhuma fatura disponível"}
            </Typography>
          </Box>
        ) : (
          <Box>
            {filteredInvoices.map((invoice, index) => {
              const statusInfo = getInvoiceStatus(invoice);
              const isExpired = statusInfo.type === "expired";
              
              return (
                <Fade in={true} timeout={200 + index * 30} key={invoice.id}>
                  <Box 
                    className={`${classes.invoiceCard} ${isExpired ? classes.invoiceCardExpired : ""}`}
                  >
                    <Avatar className={`${classes.invoiceAvatar} ${getAvatarClass(statusInfo.type)}`}>
                      {getStatusIcon(statusInfo.type)}
                    </Avatar>
                    
                    <Box className={classes.invoiceContent}>
                      <Box className={classes.invoiceHeader}>
                        <Typography className={classes.invoiceId}>
                          #{invoice.id}
                        </Typography>
                        <Typography className={classes.invoiceDetail}>
                          {invoice.detail}
                        </Typography>
                      </Box>
                      
                      <Box className={classes.invoiceInfo}>
                        <Box className={classes.infoItem}>
                          <CalendarToday className={classes.infoIcon} />
                          <Typography className={classes.infoText}>
                            Vencimento: {moment(invoice.dueDate).format("DD/MM/YYYY")}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    
                    <Typography className={classes.invoiceValue}>
                      {invoice.value.toLocaleString("pt-br", { 
                        style: "currency", 
                        currency: "BRL" 
                      })}
                    </Typography>
                    
                    <Chip
                      size="small"
                      label={statusInfo.status}
                      className={`${classes.statusChip} ${getStatusChipClass(statusInfo.type)}`}
                    />
                    
                    {statusInfo.type !== "paid" && (
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        className={classes.payButton}
                        onClick={() => handleOpenContactModal(invoice)}
                        startIcon={<Payment />}
                      >
                        {i18n.t("invoices.PAY")}
                      </Button>
                    )}
                  </Box>
                </Fade>
              );
            })}
          </Box>
        )}
      </Paper>
    </MainContainer>
  );
};

export default Invoices;