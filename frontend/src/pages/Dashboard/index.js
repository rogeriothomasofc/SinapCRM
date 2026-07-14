import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Container,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  TextField,
  FormHelperText,
  Typography,
  Paper,
  Box,
  Fade,
  Divider,
  useTheme,
  useMediaQuery,
  IconButton,
  Collapse,
  Button,
  CircularProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@material-ui/core";

// Ícones
import ChatRoundedIcon from "@material-ui/icons/ChatRounded";
import PeopleAltRoundedIcon from "@material-ui/icons/PeopleAltRounded";
import HourglassEmptyRoundedIcon from "@material-ui/icons/HourglassEmptyRounded";
import CheckCircleRoundedIcon from "@material-ui/icons/CheckCircleRounded";
import AccessTimeRoundedIcon from "@material-ui/icons/AccessTimeRounded";
import TimerRoundedIcon from "@material-ui/icons/TimerRounded";
import FilterListRoundedIcon from "@material-ui/icons/FilterListRounded";
import SearchRoundedIcon from "@material-ui/icons/SearchRounded";
import TrendingUpIcon from "@material-ui/icons/TrendingUp";
import TrendingDownIcon from "@material-ui/icons/TrendingDown";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import CalendarTodayIcon from "@material-ui/icons/CalendarToday";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";

// Gráficos
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from "recharts";

import { toast } from "react-toastify";
import { isEmpty, isArray } from "lodash";
import moment from "moment";

import LinearProgress from '@material-ui/core/LinearProgress';
import StarIcon from '@material-ui/icons/Star';
import api from "../../services/api";
import toastError from "../../errors/toastError";

import ButtonWithSpinner from "../../components/ButtonWithSpinner";
import useDashboard from "../../hooks/useDashboard";
import useContacts from "../../hooks/useContacts";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.type === 'dark' ? '#0a0a0a' : '#f7f9fc',
    minHeight: '100vh',
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  container: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    [theme.breakpoints.up("sm")]: {
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
    },
  },
  pageHeader: {
    marginBottom: theme.spacing(2),
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 700,
    color: theme.palette.text.primary,
    letterSpacing: '-0.5px',
  },
  dateRange: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    padding: theme.spacing(0.5, 1.5),
    backgroundColor: theme.palette.type === 'dark' ? '#1a1a1a' : '#ffffff',
    borderRadius: 8,
    border: `1px solid ${theme.palette.type === 'dark' ? '#2a2a2a' : '#e8ecf1'}`,
    color: theme.palette.text.secondary,
    fontSize: 12,
  },
  metricsRow: {
    marginBottom: theme.spacing(3),
  },
  metricCard: {
    // Alteração principal: cor de fundo baseada no tema
    backgroundColor: theme.palette.type === 'dark' 
      ? '#1a1a1a' 
      : theme.palette.primary.main, // Cor principal no modo claro
    borderRadius: 10,
    padding: theme.spacing(2),
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: theme.palette.type === 'dark' ? 'none' : '0 2px 8px rgba(0,0,0,0.04)',
  },
  metricContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '100%',
  },
  metricInfo: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 16,
    fontWeight: 600,
    // Cor do texto baseada no tema
    color: theme.palette.type === 'dark' 
      ? theme.palette.text.primary 
      : '#ffffff', // Branco no modo claro
    marginBottom: theme.spacing(0.6),
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  metricValue: {
    fontSize: 26,
    fontWeight: 700,
    // Cor do texto baseada no tema
    color: theme.palette.type === 'dark' 
      ? theme.palette.text.primary 
      : '#ffffff', // Branco no modo claro
    lineHeight: 1.2,
  },
  metricChange: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.4),
    marginTop: theme.spacing(0.6),
    fontSize: 10,
    fontWeight: 500,
  },
  positiveChange: {
    // Cor de crescimento baseada no tema
    color: theme.palette.type === 'dark' 
      ? theme.palette.primary.main 
      : '#ffffff', // Branco no modo claro
  },
  negativeChange: {
    // Cor de queda baseada no tema
    color: theme.palette.type === 'dark' 
      ? theme.palette.error.main 
      : '#ffffff', // Branco no modo claro
  },
  metricIconBox: {
    width: 45,
    height: 45,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: theme.spacing(1.6),
    // Fundo do ícone baseado no tema
    backgroundColor: theme.palette.type === 'dark' 
      ? `${theme.palette.primary.main}15` 
      : 'rgba(255, 255, 255, 0.2)', // Branco transparente no modo claro
    '& svg': {
      fontSize: 19,
      // Cor do ícone baseada no tema
      color: theme.palette.type === 'dark' 
        ? theme.palette.primary.main 
        : '#ffffff', // Branco no modo claro
    },
  },
  chartCard: {
    backgroundColor: theme.palette.type === 'dark' ? '#1a1a1a' : '#ffffff',
    borderRadius: 12,
    padding: theme.spacing(2.5),
    height: '100%',
    border: theme.palette.type === 'dark' ? '1px solid #2a2a2a' : 'none',
    boxShadow: theme.palette.type === 'dark' ? 'none' : '0 2px 8px rgba(0,0,0,0.04)',
  },
  chartHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: theme.palette.text.primary,
  },
  chartSubtitle: {
    fontSize: 12,
    color: theme.palette.text.secondary,
    marginTop: 2,
  },
  filterSection: {
    marginBottom: theme.spacing(2),
  },
  filterButton: {
    textTransform: 'none',
    borderRadius: 8,
    padding: theme.spacing(0.75, 1.5),
    backgroundColor: `${theme.palette.primary.main}15`,
    color: theme.palette.type === 'dark' ? '#ffffff' : theme.palette.primary.main,
    fontWeight: 600,
    fontSize: 13,
    border: `1px solid ${theme.palette.primary.main}30`,
    '&:hover': {
      backgroundColor: `${theme.palette.primary.main}25`,
    },
  },
  filterContent: {
    marginTop: theme.spacing(1.5),
    padding: theme.spacing(2.5),
    backgroundColor: theme.palette.type === 'dark' ? '#1a1a1a' : '#ffffff',
    borderRadius: 12,
    border: theme.palette.type === 'dark' ? '1px solid #2a2a2a' : 'none',
    boxShadow: theme.palette.type === 'dark' ? 'none' : '0 2px 8px rgba(0,0,0,0.04)',
  },
  applyButton: {
    borderRadius: 8,
    textTransform: 'none',
    fontWeight: 600,
    padding: theme.spacing(1.25, 2.5),
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.type === 'dark' ? '#1a1a1a' : '#ffffff',
    fontSize: 13,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
  },
  statItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: theme.spacing(1, 0),
    borderBottom: `1px solid ${theme.palette.divider}`,
    '&:last-child': {
      borderBottom: 'none',
    },
  },
  statLabel: {
    fontSize: 12,
    color: theme.palette.text.secondary,
  },
  statValue: {
    fontSize: 12,
    fontWeight: 600,
    color: theme.palette.text.primary,
  },
  tableCard: {
    backgroundColor: theme.palette.type === 'dark' ? '#1a1a1a' : '#ffffff',
    borderRadius: 12,
    padding: theme.spacing(2.5),
    border: theme.palette.type === 'dark' ? '1px solid #2a2a2a' : 'none',
    boxShadow: theme.palette.type === 'dark' ? 'none' : '0 2px 8px rgba(0,0,0,0.04)',
  },
  compactTable: {
    '& th': {
      fontSize: 11,
      padding: theme.spacing(1.5),
    },
    '& td': {
      fontSize: 12,
      padding: theme.spacing(1.5),
    },
  },
  dateField: {
    '& .MuiInputAdornment-root svg': {
      color: theme.palette.type === 'dark' ? '#ffffff' : theme.palette.text.secondary,
    },
    '& .MuiOutlinedInput-root': {
      '& .MuiInputAdornment-root svg': {
        color: theme.palette.type === 'dark' ? '#ffffff' : theme.palette.text.secondary,
      },
    },
  },
}));

const Dashboard = () => {
  const classes = useStyles();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  
  // Estados originais do seu código
  const [counters, setCounters] = useState({});
  const [attendants, setAttendants] = useState([]);
  const [period, setPeriod] = useState(0);
  const [filterType, setFilterType] = useState(1);
  const [dateFrom, setDateFrom] = useState(moment("1", "D").format("YYYY-MM-DD"));
  const [dateTo, setDateTo] = useState(moment().format("YYYY-MM-DD"));
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const { find } = useDashboard();

  useEffect(() => {
    async function firstLoad() {
      await fetchData();
    }
    setTimeout(() => {
      firstLoad();
    }, 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  async function handleChangePeriod(value) {
    setPeriod(value);
  }

  async function handleChangeFilterType(value) {
    setFilterType(value);
    if (value === 1) {
      setPeriod(0);
    } else {
      setDateFrom("");
      setDateTo("");
    }
  }

  async function fetchData() {
    setLoading(true);

    let params = {};

    if (period > 0) {
      params = {
        days: period,
      };
    }

    if (!isEmpty(dateFrom) && moment(dateFrom).isValid()) {
      params = {
        ...params,
        date_from: moment(dateFrom).format("YYYY-MM-DD"),
      };
    }

    if (!isEmpty(dateTo) && moment(dateTo).isValid()) {
      params = {
        ...params,
        date_to: moment(dateTo).format("YYYY-MM-DD"),
      };
    }

    if (Object.keys(params).length === 0) {
      toast.error(i18n.t("dashboard.toasts.selectFilterError"));
      setLoading(false);
      return;
    }

    const data = await find(params);

    setCounters(data.counters);
    if (isArray(data.attendants)) {
      setAttendants(data.attendants);
    } else {
      setAttendants([]);
    }

    setLoading(false);
  }

  function formatTime(minutes) {
    return moment()
      .startOf("day")
      .add(minutes, "minutes")
      .format("HH[h] mm[m]");
  }

  const GetContacts = (all) => {
    let props = {};
    if (all) {
      props = {};
    }
    const { count } = useContacts(props);
    return count;
  };

  // Dados para os gráficos baseados nos counters reais
  const totalTickets = (counters.supportFinished || 0) + (counters.supportHappening || 0) + (counters.supportPending || 0);

  // Cores primárias do tema para o gráfico de pizza
  const pieColors = [
    theme.palette.primary.main,
    `${theme.palette.primary.main}80`,
    `${theme.palette.primary.main}40`,
  ];

  const pieChartData = [
    { 
      name: i18n.t("dashboard.status.finished") || 'Finalizados', 
      value: counters.supportFinished || 0, 
      percentage: counters.supportFinished ? 
        ((counters.supportFinished / totalTickets) * 100).toFixed(1) : 0,
      color: pieColors[0]
    },
    { 
      name: i18n.t("dashboard.status.inProgress") || 'Em Andamento', 
      value: counters.supportHappening || 0, 
      percentage: counters.supportHappening ? 
        ((counters.supportHappening / totalTickets) * 100).toFixed(1) : 0,
      color: pieColors[1]
    },
    { 
      name: i18n.t("dashboard.status.pending") || 'Pendentes', 
      value: counters.supportPending || 0, 
      percentage: counters.supportPending ? 
        ((counters.supportPending / totalTickets) * 100).toFixed(1) : 0,
      color: pieColors[2]
    },
  ];

  const performanceData = attendants.map(att => ({
    name: att.name?.split(' ')[0] || 'Atendente',
    atendimentos: att.ticketsCount || att.tickets || 0,
    tempo: att.avgSupportTime || 0,
  })).slice(0, 7);

  // Cálculo de mudanças reais baseado em dados anteriores
  const calculateChange = (current, previous) => {
    if (!previous || previous === 0) {
      return 0;
    }
    return Number(((current - previous) / previous * 100).toFixed(1));
  };

  const metrics = [
    {
      label: i18n.t("dashboard.counters.inTalk"),
      value: counters.supportHappening || 0,
      change: calculateChange(counters.supportHappening, counters.previousSupportHappening),
      icon: <ChatRoundedIcon />,
    },
    {
      label: i18n.t("dashboard.counters.waiting"),
      value: counters.supportPending || 0,
      change: calculateChange(counters.supportPending, counters.previousSupportPending),
      icon: <HourglassEmptyRoundedIcon />,
    },
    {
      label: i18n.t("dashboard.counters.finished"),
      value: counters.supportFinished || 0,
      change: calculateChange(counters.supportFinished, counters.previousSupportFinished),
      icon: <CheckCircleRoundedIcon />,
    },
    {
      label: i18n.t("dashboard.counters.newContacts"),
      value: GetContacts(true) || 0,
      change: calculateChange(GetContacts(true), counters.previousNewContacts),
      icon: <PeopleAltRoundedIcon />,
    },
    {
      label: i18n.t("dashboard.counters.averageTalkTime"),
      value: formatTime(counters.avgSupportTime || 0),
      change: calculateChange(counters.avgSupportTime, counters.previousAvgSupportTime),
      icon: <AccessTimeRoundedIcon />,
      isTime: true,
    },
    {
      label: i18n.t("dashboard.counters.averageWaitTime"),
      value: formatTime(counters.avgWaitTime || 0),
      change: calculateChange(counters.avgWaitTime, counters.previousAvgWaitTime),
      icon: <TimerRoundedIcon />,
      isTime: true,
    },
  ];

  // Custom tooltip compacto
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Box
          style={{
            backgroundColor: theme.palette.background.paper,
            padding: '8px',
            borderRadius: '6px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography variant="caption" style={{ fontWeight: 600, marginBottom: 2 }}>
            {label}
          </Typography>
          {payload.map((entry, index) => (
            <Typography
              key={index}
              variant="caption"
              style={{ color: entry.color, display: 'block', fontSize: 11 }}
            >
              {entry.name}: {entry.value}
            </Typography>
          ))}
        </Box>
      );
    }
    return null;
  };
  
  function renderFilters() {
    if (filterType === 1) {
      return (
        <>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label={i18n.t("dashboard.filters.initialDate")}
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              fullWidth
              variant="outlined"
              size="small"
              className={classes.dateField}
              InputLabelProps={{
                shrink: true,
              }}
              inputProps={{
                max: dateTo
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label={i18n.t("dashboard.filters.finalDate")}
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              fullWidth
              variant="outlined"
              size="small"
              className={classes.dateField}
              InputLabelProps={{
                shrink: true,
              }}
              inputProps={{
                min: dateFrom
              }}
            />
          </Grid>
        </>
      );
    } else {
      return (
        <Grid item xs={12} sm={6} md={3}>
          <FormControl variant="outlined" fullWidth size="small">
            <InputLabel>{i18n.t("dashboard.periodSelect.title")}</InputLabel>
            <Select
              value={period}
              onChange={(e) => handleChangePeriod(e.target.value)}
              label={i18n.t("dashboard.periodSelect.title")}
            >
              <MenuItem value={0}>{i18n.t("dashboard.periodSelect.options.none")}</MenuItem>
              <MenuItem value={3}>{i18n.t("dashboard.periodSelect.options.last3")}</MenuItem>
              <MenuItem value={7}>{i18n.t("dashboard.periodSelect.options.last7")}</MenuItem>
              <MenuItem value={15}>{i18n.t("dashboard.periodSelect.options.last15")}</MenuItem>
              <MenuItem value={30}>{i18n.t("dashboard.periodSelect.options.last30")}</MenuItem>
              <MenuItem value={60}>{i18n.t("dashboard.periodSelect.options.last60")}</MenuItem>
              <MenuItem value={90}>{i18n.t("dashboard.periodSelect.options.last90")}</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      );
    }
  }

  return (
    <Box className={classes.root}>
      <Container maxWidth="lg" className={classes.container}>
        {/* Header Compacto */}
        <Box className={classes.pageHeader}>
          <Typography className={classes.pageTitle}>
            {i18n.t("dashboard.title") || "Dashboard"}
          </Typography>
          <Box className={classes.dateRange}>
            <CalendarTodayIcon style={{ fontSize: 16 }} />
            <Typography variant="caption">
              {dateFrom && dateTo ? 
                `${moment(dateFrom).format("DD/MM")} - ${moment(dateTo).format("DD/MM/YY")}` :
                moment().format("DD MMM YYYY")
              }
            </Typography>
          </Box>
        </Box>

        {/* Filter Section - Agora acima dos cards */}
        <Box className={classes.filterSection}>
          <Button
            onClick={() => setShowFilters(!showFilters)}
            className={classes.filterButton}
            startIcon={<FilterListRoundedIcon style={{ fontSize: 16 }} />}
            endIcon={showFilters ? <ExpandLessIcon style={{ fontSize: 16 }} /> : <ExpandMoreIcon style={{ fontSize: 16 }} />}
            size="small"
          >
            {i18n.t("dashboard.filters.title") || "Filtros"}
          </Button>
          
          <Collapse in={showFilters}>
            <Paper className={classes.filterContent} elevation={0}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl variant="outlined" fullWidth size="small">
                    <InputLabel>{i18n.t("dashboard.filters.filterType.title")}</InputLabel>
                    <Select
                      value={filterType}
                      onChange={(e) => handleChangeFilterType(e.target.value)}
                      label={i18n.t("dashboard.filters.filterType.title")}
                    >
                      <MenuItem value={1}>{i18n.t("dashboard.filters.filterType.options.perDate")}</MenuItem>
                      <MenuItem value={2}>{i18n.t("dashboard.filters.filterType.options.perPeriod")}</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                {renderFilters()}
                
                <Grid item xs={12} sm={6} md={3}>
                  <ButtonWithSpinner
                    loading={loading}
                    onClick={() => fetchData()}
                    variant="contained"
                    fullWidth
                    className={classes.applyButton}
                    startIcon={<SearchRoundedIcon style={{ fontSize: 16 }} />}
                    size="small"
                  >
                    {i18n.t("dashboard.buttons.filter")}
                  </ButtonWithSpinner>
                </Grid>
              </Grid>
            </Paper>
          </Collapse>
        </Box>

        {/* Metrics Cards - 6 cards compactos (3x3) */}
        <Grid container spacing={3} className={classes.metricsRow}>
          {metrics.map((metric, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Paper className={classes.metricCard} elevation={0}>
                <Box className={classes.metricContent}>
                  <Box className={classes.metricInfo}>
                    <Typography className={classes.metricLabel}>
                      {metric.label}
                    </Typography>
                    <Typography className={classes.metricValue}>
                      {metric.value}
                    </Typography>
                    {metric.change !== 0 && (
                      <Box className={`${classes.metricChange} ${metric.change > 0 ? classes.positiveChange : classes.negativeChange}`}>
                        {metric.change > 0 ? 
                          <TrendingUpIcon style={{ fontSize: 11 }} /> : 
                          <TrendingDownIcon style={{ fontSize: 11 }} />
                        }
                        <span>{Math.abs(metric.change)}%</span>
                      </Box>
                    )}
                  </Box>
                  <Box className={classes.metricIconBox}>
                    {metric.icon}
                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {loading ? (
          <Box className={classes.loadingContainer}>
            <CircularProgress size={40} />
          </Box>
        ) : (
          <>
            {/* Charts Section Compacto */}
            <Grid container spacing={2} style={{ marginBottom: 16 }}>
              {/* Performance dos Atendentes */}
              {attendants.length > 0 && (
                <Grid item xs={12} lg={8}>
                  <Paper className={classes.chartCard} elevation={0}>
                    <Box className={classes.chartHeader}>
                      <Box>
                        <Typography className={classes.chartTitle}>
                          {i18n.t("dashboard.charts.performanceTitle") || "Performance dos Atendentes"}
                        </Typography>
                        <Typography className={classes.chartSubtitle}>
                          {i18n.t("dashboard.charts.performanceSubtitle") || "Atendimentos realizados no período"}
                        </Typography>
                      </Box>
                    </Box>
                    {performanceData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={performanceData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} vertical={false} />
                          <XAxis 
                            dataKey="name" 
                            stroke={theme.palette.text.secondary} 
                            tick={{ fontSize: 11 }}
                            axisLine={false}
                          />
                          <YAxis 
                            stroke={theme.palette.text.secondary} 
                            tick={{ fontSize: 11 }}
                            axisLine={false}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar 
                            dataKey="atendimentos" 
                            fill={theme.palette.primary.main} 
                            radius={[6, 6, 0, 0]}
                            barSize={30}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <Box textAlign="center" py={6}>
                        <Typography color="textSecondary" variant="caption">
                          {i18n.t("dashboard.noData.performance") || "Nenhum dado de performance disponível"}
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                </Grid>
              )}

              {/* Distribuição de Status Compacto */}
              <Grid item xs={12} lg={attendants.length > 0 ? 4 : 12}>
                <Paper className={classes.chartCard} elevation={0}>
                  <Box className={classes.chartHeader}>
                    <Box>
                      <Typography className={classes.chartTitle}>
                        Distribuição de Status
                      </Typography>
                      <Typography variant="h5" style={{ fontWeight: 700, marginTop: 4 }}>
                        {totalTickets}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Total de Atendimentos
                      </Typography>
                    </Box>
                  </Box>
                  
                  {totalTickets > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height={140}>
                        <PieChart>
                          <Pie
                            data={pieChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={60}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {pieChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                      <Box mt={1}>
                        {pieChartData.map((item, index) => (
                          <Box key={index} display="flex" justifyContent="space-between" mb={0.5}>
                            <Box display="flex" alignItems="center" gap={0.5}>
                              <Box width={8} height={8} borderRadius={1} bgcolor={item.color} />
                              <Typography variant="caption" style={{ fontSize: 11 }}>{item.name}</Typography>
                            </Box>
                            <Box display="flex" alignItems="center" gap={0.5}>
                              <Typography variant="caption" style={{ fontWeight: 600, fontSize: 11 }}>
                                {item.value}
                              </Typography>
                              <Typography variant="caption" color="textSecondary" style={{ fontSize: 10 }}>
                                ({item.percentage}%)
                              </Typography>
                            </Box>
                          </Box>
                        ))}
                      </Box>

                      {/* Estatísticas adicionais compactas */}
                      <Box mt={2}>
                        <Box className={classes.statItem}>
                          <Typography className={classes.statLabel}>
                            {i18n.t("dashboard.averageTalkTime") || "Tempo Médio"}
                          </Typography>
                          <Typography className={classes.statValue}>
                            {formatTime(counters.avgSupportTime || 0)}
                          </Typography>
                        </Box>
                        <Box className={classes.statItem}>
                          <Typography className={classes.statLabel}>
                            {i18n.t("dashboard.averageWaitTime") || "Espera Média"}
                          </Typography>
                          <Typography className={classes.statValue}>
                            {formatTime(counters.avgWaitTime || 0)}
                          </Typography>
                        </Box>
                      </Box>
                    </>
                  ) : (
                    <Box textAlign="center" py={3}>
                      <Typography color="textSecondary" variant="caption">
                        {i18n.t("dashboard.noData.tickets") || "Nenhum atendimento no período"}
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Grid>
            </Grid>

            {/* Table Section Compacta */}
            {attendants.length > 0 && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Paper className={classes.tableCard} elevation={0}>
                    <Box mb={1.5}>
                      <Typography className={classes.chartTitle}>
                        {i18n.t("dashboard.attendants.title") || "Status dos Atendentes"}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {attendants.length} {i18n.t("dashboard.attendants.active") || "atendentes ativos"}
                      </Typography>
                    </Box>
                    
                    {/* Tabela Compacta */}
                    <Box sx={{ overflowX: 'auto' }}>
                      <table className={classes.compactTable} style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr>
                            <th style={{
                              textAlign: 'left',
                              color: theme.palette.text.secondary,
                              fontWeight: 600,
                              borderBottom: `1px solid ${theme.palette.divider}`,
                            }}>
                              ATENDENTE
                            </th>
                            <th style={{
                              textAlign: 'center',
                              color: theme.palette.text.secondary,
                              fontWeight: 600,
                              borderBottom: `1px solid ${theme.palette.divider}`,
                            }}>
                              STATUS
                            </th>
                            <th style={{
                              textAlign: 'center',
                              color: theme.palette.text.secondary,
                              fontWeight: 600,
                              borderBottom: `1px solid ${theme.palette.divider}`,
                            }}>
                              ATENDIMENTOS
                            </th>
                            <th style={{
                              textAlign: 'center',
                              color: theme.palette.text.secondary,
                              fontWeight: 600,
                              borderBottom: `1px solid ${theme.palette.divider}`,
                            }}>
                              TEMPO MÉDIO
                            </th>
                            <th style={{
                              textAlign: 'center',
                              color: theme.palette.text.secondary,
                              fontWeight: 600,
                              borderBottom: `1px solid ${theme.palette.divider}`,
                            }}>
                              CONCLUSÃO
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {attendants.map((attendant, index) => {
                            const totalTickets = (attendant.ticketsCount || attendant.tickets || 0);
                            const closedTickets = (attendant.closedTickets || Math.floor(totalTickets * 0.75));
                            const completionRate = totalTickets > 0 ? ((closedTickets / totalTickets) * 100).toFixed(0) : 0;
                            const isOnline = attendant.online || attendant.status === 'online';
                            
                            return (
                              <tr key={index}>
                                <td style={{
                                  borderBottom: `1px solid ${theme.palette.divider}`,
                                }}>
                                  <Typography style={{ fontWeight: 600, fontSize: 12 }}>
                                    {attendant.name}
                                  </Typography>
                                </td>
                                <td style={{
                                  borderBottom: `1px solid ${theme.palette.divider}`,
                                  textAlign: 'center',
                                }}>
                                  <Chip
                                    label={isOnline ? 'Online' : 'Offline'}
                                    size="small"
                                    style={{
                                      height: 20,
                                      backgroundColor: isOnline ? `${theme.palette.success.main}15` : `${theme.palette.error.main}15`,
                                      color: isOnline ? theme.palette.success.main : theme.palette.error.main,
                                      fontWeight: 600,
                                      fontSize: 10,
                                    }}
                                  />
                                </td>
                                <td style={{
                                  borderBottom: `1px solid ${theme.palette.divider}`,
                                  textAlign: 'center',
                                }}>
                                  <Typography style={{ fontSize: 14, fontWeight: 700, color: theme.palette.primary.main }}>
                                    {totalTickets}
                                  </Typography>
                                </td>
                                <td style={{
                                  borderBottom: `1px solid ${theme.palette.divider}`,
                                  textAlign: 'center',
                                }}>
                                  <Typography style={{ fontSize: 12, fontWeight: 600 }}>
                                    {formatTime(attendant.avgSupportTime || 0)}
                                  </Typography>
                                </td>
                                <td style={{
                                  borderBottom: `1px solid ${theme.palette.divider}`,
                                  textAlign: 'center',
                                }}>
                                  <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                                    <Box style={{ flex: 1, maxWidth: 60 }}>
                                      <Box
                                        style={{
                                          height: 4,
                                          backgroundColor: `${theme.palette.primary.main}20`,
                                          borderRadius: 2,
                                          overflow: 'hidden',
                                        }}
                                      >
                                        <Box
                                          style={{
                                            height: '100%',
                                            width: `${completionRate}%`,
                                            backgroundColor: theme.palette.primary.main,
                                            transition: 'width 0.3s ease',
                                          }}
                                        />
                                      </Box>
                                    </Box>
                                    <Typography style={{ 
                                      fontSize: 11, 
                                      fontWeight: 600,
                                      color: theme.palette.primary.main,
                                      minWidth: 30,
                                    }}>
                                      {completionRate}%
                                    </Typography>
                                  </Box>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </Box>

                    {/* Resumo compacto no rodapé */}
                    <Box 
                      mt={2} 
                      pt={1.5} 
                      borderTop={`1px solid ${theme.palette.divider}`}
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Box display="flex" gap={3}>
                        <Box>
                          <Typography variant="caption" color="textSecondary" style={{ fontSize: 10, display: 'block', marginBottom: 4 }}>
                            TOTAL
                          </Typography>
                          <Typography style={{ fontSize: 16, fontWeight: 700, color: theme.palette.primary.main }}>
                            {attendants.reduce((sum, att) => sum + (att.ticketsCount || att.tickets || 0), 0)}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="textSecondary" style={{ fontSize: 10, display: 'block', marginBottom: 4 }}>
                            TEMPO MÉDIO
                          </Typography>
                          <Typography style={{ fontSize: 16, fontWeight: 700, color: theme.palette.primary.main }}>
                            {formatTime(
                              Math.round(
                                attendants.reduce((sum, att) => sum + (att.avgSupportTime || 0), 0) / 
                                attendants.length
                              )
                            )}
                          </Typography>
                        </Box>
                      </Box>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Typography variant="caption" style={{ fontSize: 10, color: theme.palette.text.secondary }}>
                          <span style={{ color: theme.palette.primary.main, fontWeight: 600 }}>
                            {attendants.filter(a => a.online || a.status === 'online').length}
                          </span> online • 
                          <span style={{ marginLeft: 4 }}>
                            {attendants.filter(a => !a.online && a.status !== 'online').length}
                          </span> offline
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            )}

          </>
        )}

      </Container>
    </Box>
  );
};

export default Dashboard;

