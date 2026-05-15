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
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import brLocale from 'date-fns/locale/pt-BR';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { 
    Button, 
    TextField, 
    Typography, 
    Paper, 
    Box, 
    Grid,
    CircularProgress,
    makeStyles,
    useTheme,
    Avatar
} from '@material-ui/core';
import DateRangeIcon from '@material-ui/icons/DateRange';
import SearchIcon from '@material-ui/icons/Search';
import PeopleIcon from '@material-ui/icons/People';

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
    Legend,
    ChartDataLabels
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
        height: 380,
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
    emptyMessage: {
        textAlign: 'center',
        padding: theme.spacing(4),
        color: theme.palette.text.secondary,
    },
    userAvatar: {
        width: 32,
        height: 32,
        backgroundColor: '#6f42c1',
        fontSize: 14,
        marginRight: theme.spacing(2),
    }
}));

// Função para obter iniciais do nome
const getNameInitials = (name) => {
    if (!name) return "?";
    const names = name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
};

export const ChatsUser = () => {
    const classes = useStyles();
    const theme = useTheme();

    const [initialDate, setInitialDate] = useState(new Date());
    const [finalDate, setFinalDate] = useState(new Date());
    const [ticketsData, setTicketsData] = useState({ data: [] });
    const [loading, setLoading] = useState(false);

    const companyId = localStorage.getItem("companyId");

    useEffect(() => {
        handleGetTicketsInformation();
    }, []);

    // Configuração do gráfico
    const options = {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
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
                        return `Atendente: ${context[0].label}`;
                    },
                    label: (context) => {
                        return `Atendimentos: ${context.parsed.x}`;
                    }
                }
            },
            datalabels: {
                anchor: 'end',
                align: 'end',
                formatter: (value) => value,
                color: '#333',
                font: {
                    weight: 500,
                    size: 11,
                },
                padding: {
                    right: 5
                }
            }
        },
        scales: {
            y: {
                grid: {
                    display: false,
                },
                ticks: {
                    color: '#333',
                }
            },
            x: {
                grid: {
                    borderDash: [3, 3],
                    color: '#f2f2f2',
                },
                ticks: {
                    color: '#333',
                    precision: 0,
                },
                beginAtZero: true,
            }
        },
        animation: {
            duration: 1000,
        },
        layout: {
            padding: {
                left: 10,
                right: 30,
                top: 10,
                bottom: 10
            }
        },
    };

    // Número máximo de barras a exibir
    const maxBarsToShow = 10;

    // Dados para o gráfico
    const chartData = {
        labels: ticketsData?.data?.slice(0, maxBarsToShow).map(item => item.nome) || [],
        datasets: [
            {
                data: ticketsData?.data?.slice(0, maxBarsToShow).map(item => item.quantidade) || [],
                backgroundColor: '#6f42c1',
                hoverBackgroundColor: '#5a32a3',
                borderRadius: 4,
                borderWidth: 0,
            },
        ],
    };

    // Buscar dados de tickets por usuário
    const handleGetTicketsInformation = async () => {
        try {
            setLoading(true);
            const { data } = await api.get(`/dashboard/ticketsUsers?initialDate=${format(initialDate, 'yyyy-MM-dd')}&finalDate=${format(finalDate, 'yyyy-MM-dd')}&companyId=${companyId}`);
            setTicketsData(data);
            setLoading(false);
        } catch (error) {
            setLoading(false);
            toast.error(i18n.t("dashboard.toasts.userChartError"));
        }
    }

    // Verifica se existem dados para mostrar
    const hasData = ticketsData?.data?.length > 0 && ticketsData.data.some(item => item.quantidade > 0);

    return (
        <div className={classes.chartSection}>
            <Typography variant="h6" className={classes.title}>
                <PeopleIcon />
                Total Conversations by Users
            </Typography>

            <div className={classes.controlsContainer}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={5} md={4}>
                        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={brLocale}>
                            <DatePicker
                                value={initialDate}
                                onChange={(newValue) => { setInitialDate(newValue) }}
                                label="Start"
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
                                label="End"
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
                            Filter
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
                    <Bar options={options} data={chartData} />
                ) : (
                    <Typography className={classes.emptyMessage}>
                        No data available for the selected period.
                    </Typography>
                )}
            </div>
        </div>
    );
}