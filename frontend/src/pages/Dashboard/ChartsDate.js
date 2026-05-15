import React, { useEffect, useState } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import brLocale from 'date-fns/locale/pt-BR';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { 
    Button, 
    TextField, 
    Typography, 
    Box, 
    Grid,
    CircularProgress,
    makeStyles,
    useTheme
} from '@material-ui/core';
import DateRangeIcon from '@material-ui/icons/DateRange';
import SearchIcon from '@material-ui/icons/Search';
import BarChartIcon from '@material-ui/icons/BarChart';

import api from '../../services/api';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { i18n } from '../../translate/i18n';

// Registrar componentes do chart.js
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

// Estilos integrados - sem dependência externa
const useStyles = makeStyles((theme) => ({
    // Estilo simples para o container principal - sem sombras extras ou bordas arredondadas
    chartSection: {
        marginBottom: theme.spacing(3),
    },
    title: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: theme.spacing(2),
        fontWeight: 500,
        fontSize: '1rem',
        '& svg': {
            marginRight: theme.spacing(1),
            color: '#6f42c1', // Cor roxa específica
        },
    },
    controlsContainer: {
        padding: theme.spacing(2),
        marginBottom: theme.spacing(3),
        borderRadius: 5,
        backgroundColor: '#fff',
        border: '1px solid #dfe0eb',
    },
    dateField: {
        '& .MuiOutlinedInput-root': {
            borderRadius: 4,
        },
    },
    filterButton: {
        borderRadius: 4,
        textTransform: 'none',
        backgroundColor: '#6f42c1', // Cor roxa específica
        color: '#fff',
        fontWeight: 500,
        '&:hover': {
            backgroundColor: '#5a32a3',
        },
    },
    buttonIcon: {
        marginRight: theme.spacing(1),
    },
    chartContainer: {
        height: 350,
        padding: theme.spacing(2),
        backgroundColor: '#fff',
        border: '1px solid #dfe0eb',
        borderRadius: 5,
    },
    loadingContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
    },
    counter: {
        fontWeight: 600,
        color: '#6f42c1', // Cor roxa específica
        marginLeft: theme.spacing(1),
    },
    emptyMessage: {
        textAlign: 'center',
        padding: theme.spacing(4),
        color: theme.palette.text.secondary,
    }
}));

export const ChartsDate = () => {
    const classes = useStyles();
    const theme = useTheme();

    const [initialDate, setInitialDate] = useState(new Date());
    const [finalDate, setFinalDate] = useState(new Date());
    const [ticketsData, setTicketsData] = useState({ data: [], count: 0 });
    const [loading, setLoading] = useState(false);

    const companyId = localStorage.getItem("companyId");

    useEffect(() => {
        handleGetTicketsInformation();
    }, []);

    // Opções configuradas para visual moderno
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                display: false,
            },
            title: {
                display: false,
            },
            tooltip: {
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                titleColor: '#000',
                bodyColor: '#000',
                borderColor: '#dfe0eb',
                borderWidth: 1,
                padding: 12,
                cornerRadius: 5,
                titleFont: {
                    size: 14,
                    weight: 'bold',
                },
                bodyFont: {
                    size: 13,
                },
                callbacks: {
                    title: (context) => {
                        return context[0].label.includes('Das') 
                            ? context[0].label 
                            : `Data: ${context[0].label}`;
                    },
                    label: (context) => {
                        return `Atendimentos: ${context.parsed.y}`;
                    }
                }
            }
        },
        scales: {
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    color: '#333',
                    maxRotation: 45,
                },
            },
            y: {
                grid: {
                    borderDash: [3, 3],
                    color: '#f2f2f2',
                },
                ticks: {
                    color: '#333',
                    precision: 0,
                },
                beginAtZero: true,
            },
        },
        animation: {
            duration: 1000,
        },
        layout: {
            padding: 10
        },
    };

    // Preparação dos dados do gráfico
    const dataCharts = {
        labels: ticketsData?.data?.length > 0 
            ? ticketsData.data.map((item) => (
                item.hasOwnProperty('horario') 
                    ? `Das ${item.horario}:00 às ${item.horario}:59` 
                    : item.data
            )) 
            : [],
        datasets: [
            {
                data: ticketsData?.data?.length > 0 
                    ? ticketsData.data.map((item) => item.total) 
                    : [],
                backgroundColor: '#6f42c1', // Cor roxa específica
                hoverBackgroundColor: '#5a32a3',
                borderRadius: 4,
            },
        ],
    };

    // Buscar dados de tickets
    const handleGetTicketsInformation = async () => {
        try {
            setLoading(true);
            const { data } = await api.get(`/dashboard/ticketsDay?initialDate=${format(initialDate, 'yyyy-MM-dd')}&finalDate=${format(finalDate, 'yyyy-MM-dd')}&companyId=${companyId}`);
            setTicketsData(data);
            setLoading(false);
        } catch (error) {
            setLoading(false);
            toast.error(i18n.t("dashboard.toasts.dateChartError"));
        }
    }

    // Verifica se existem dados para mostrar
    const hasData = ticketsData?.data?.length > 0 && ticketsData.data.some(item => item.total > 0);

    return (
        <div className={classes.chartSection}>
            <Typography variant="h6" className={classes.title}>
                <BarChartIcon />
                {i18n.t("dashboard.charts.date.title")} 
                <span className={classes.counter}>({ticketsData?.count || 0})</span>
            </Typography>

            <div className={classes.controlsContainer}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={5} md={4}>
                        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={brLocale}>
                            <DatePicker
                                value={initialDate}
                                onChange={(newValue) => { setInitialDate(newValue) }}
                                label={i18n.t("dashboard.charts.date.start")}
                                renderInput={(params) => (
                                    <TextField 
                                        fullWidth 
                                        variant="outlined"
                                        size="small"
                                        className={classes.dateField}
                                        {...params} 
                                    />
                                )}
                            />
                        </LocalizationProvider>
                    </Grid>

                    <Grid item xs={12} sm={5} md={4}>
                        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={brLocale}>
                            <DatePicker
                                value={finalDate}
                                onChange={(newValue) => { setFinalDate(newValue) }}
                                label={i18n.t("dashboard.charts.date.end")}
                                renderInput={(params) => (
                                    <TextField 
                                        fullWidth 
                                        variant="outlined"
                                        size="small"
                                        className={classes.dateField}
                                        {...params} 
                                    />
                                )}
                            />
                        </LocalizationProvider>
                    </Grid>

                    <Grid item xs={12} sm={2} md={4}>
                        <Button
                            fullWidth
                            variant="contained"
                            className={classes.filterButton}
                            onClick={handleGetTicketsInformation}
                            disabled={loading}
                            disableElevation
                        >
                            <SearchIcon className={classes.buttonIcon} />
                            {i18n.t("dashboard.charts.date.filter")}
                        </Button>
                    </Grid>
                </Grid>
            </div>
            
            <div className={classes.chartContainer}>
                {loading ? (
                    <div className={classes.loadingContainer}>
                        <CircularProgress />
                    </div>
                ) : hasData ? (
                    <Bar options={options} data={dataCharts} />
                ) : (
                    <Typography className={classes.emptyMessage}>
                        Não há dados para o período selecionado.
                    </Typography>
                )}
            </div>
        </div>
    );
}