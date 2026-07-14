import React, { useState, useEffect } from "react";
import {
    makeStyles,
    Paper,
    Grid,
    TextField,
    Table,
    TableHead,
    TableBody,
    TableCell,
    TableRow,
    IconButton,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Box,
    Typography,
    Chip,
    Button,
} from "@material-ui/core";
import { Formik, Form, Field } from 'formik';
import ButtonWithSpinner from "../ButtonWithSpinner";
import ConfirmationModal from "../ConfirmationModal";

import {
    Edit as EditIcon,
    CheckCircle as CheckIcon,
    Cancel as CancelIcon,
    LocalOffer as PlanIcon,
    ViewList as ListIcon,
} from "@material-ui/icons";

import { toast } from "react-toastify";
import usePlans from "../../hooks/usePlans";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles(theme => ({
    root: {
        width: '100%'
    },
    mainPaper: {
        width: '100%',
        padding: theme.spacing(3),
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
        border: `1px solid ${theme.palette.divider}`,
    },
    formSection: {
        marginBottom: theme.spacing(3),
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 600,
        color: theme.palette.text.primary,
        marginBottom: theme.spacing(2),
        display: "flex",
        alignItems: "center",
        gap: theme.spacing(1),
    },
    tableContainer: {
        width: '100%',
        overflowX: "auto",
        borderRadius: 8,
        border: `1px solid ${theme.palette.divider}`,
    },
    table: {
        minWidth: 1000,
    },
    tableHeader: {
        backgroundColor: theme.palette.grey[50],
        "& th": {
            fontWeight: 600,
            fontSize: 13,
            color: theme.palette.text.secondary,
            borderBottom: `2px solid ${theme.palette.divider}`,
        },
    },
    tableRow: {
        "&:hover": {
            backgroundColor: theme.palette.action.hover,
        },
        transition: "background-color 0.2s",
    },
    tableCellAction: {
        width: 48,
        padding: 8,
    },
    textfield: {
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
    select: {
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
    buttonContainer: {
        display: "flex",
        gap: theme.spacing(1),
        justifyContent: "flex-end",
        marginTop: theme.spacing(2),
    },
    button: {
        borderRadius: 8,
        textTransform: "none",
        fontWeight: 500,
        padding: "8px 16px",
    },
    editButton: {
        color: theme.palette.primary.main,
        padding: 8,
        "&:hover": {
            backgroundColor: theme.palette.primary.light + "20",
        },
    },
    valueCell: {
        fontWeight: 600,
        color: theme.palette.success.main,
        fontSize: 14,
    },
    limitCell: {
        fontWeight: 500,
        fontSize: 14,
    },
    planName: {
        fontWeight: 600,
        fontSize: 14,
    },
}));

export function PlanManagerForm(props) {
    const { onSubmit, onDelete, onCancel, initialValue, loading } = props;
    const classes = useStyles();

    const [record, setRecord] = useState({
        name: '',
        users: 0,
        connections: 0,
        queues: 0,
        value: 0,
        useCampaigns: true,
        useSchedules: true,
        useInternalChat: true,
        useExternalApi: true,
        useKanban: true,
        useOpenAi: true,
        useIntegrations: true,
    });

    useEffect(() => {
        setRecord(initialValue);
    }, [initialValue]);

    const handleSubmit = async (data) => {
        onSubmit(data);
    };

    return (
        <Box className={classes.formSection}>
            <Typography className={classes.sectionTitle}>
                <PlanIcon fontSize="small" />
                {record.id ? "Editar Plano" : "Novo Plano"}
            </Typography>
            
            <Formik
                enableReinitialize
                initialValues={record}
                onSubmit={(values, { resetForm }) =>
                    setTimeout(() => {
                        handleSubmit(values);
                        resetForm();
                    }, 500)
                }
            >
                {() => (
                    <Form>
                        <Grid container spacing={2}>
                            {/* Primeira linha - Informações básicas */}
                            <Grid item xs={12} sm={6} md={3}>
                                <Field
                                    as={TextField}
                                    label={i18n.t("plans.form.name")}
                                    name="name"
                                    variant="outlined"
                                    fullWidth
                                    className={classes.textfield}
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={2}>
                                <Field
                                    as={TextField}
                                    label={i18n.t("plans.form.value")}
                                    name="value"
                                    variant="outlined"
                                    fullWidth
                                    className={classes.textfield}
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={12} sm={4} md={2}>
                                <Field
                                    as={TextField}
                                    label={i18n.t("plans.form.users")}
                                    name="users"
                                    variant="outlined"
                                    fullWidth
                                    className={classes.textfield}
                                    size="small"
                                    type="number"
                                />
                            </Grid>
                            <Grid item xs={12} sm={4} md={2}>
                                <Field
                                    as={TextField}
                                    label={i18n.t("plans.form.connections")}
                                    name="connections"
                                    variant="outlined"
                                    fullWidth
                                    className={classes.textfield}
                                    size="small"
                                    type="number"
                                />
                            </Grid>
                            <Grid item xs={12} sm={4} md={2}>
                                <Field
                                    as={TextField}
                                    label={i18n.t("plans.form.queues")}
                                    name="queues"
                                    variant="outlined"
                                    fullWidth
                                    className={classes.textfield}
                                    size="small"
                                    type="number"
                                />
                            </Grid>

                            {/* Segunda linha - Recursos */}
                            <Grid item xs={12} sm={6} md={3}>
                                <FormControl variant="outlined" fullWidth size="small" className={classes.select}>
                                    <InputLabel>{i18n.t("plans.form.campaigns")}</InputLabel>
                                    <Field
                                        as={Select}
                                        label={i18n.t("plans.form.campaigns")}
                                        name="useCampaigns"
                                    >
                                        <MenuItem value={true}>{i18n.t("plans.form.enabled")}</MenuItem>
                                        <MenuItem value={false}>{i18n.t("plans.form.disabled")}</MenuItem>
                                    </Field>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <FormControl variant="outlined" fullWidth size="small" className={classes.select}>
                                    <InputLabel>{i18n.t("plans.form.schedules")}</InputLabel>
                                    <Field
                                        as={Select}
                                        label={i18n.t("plans.form.schedules")}
                                        name="useSchedules"
                                    >
                                        <MenuItem value={true}>{i18n.t("plans.form.enabled")}</MenuItem>
                                        <MenuItem value={false}>{i18n.t("plans.form.disabled")}</MenuItem>
                                    </Field>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <FormControl variant="outlined" fullWidth size="small" className={classes.select}>
                                    <InputLabel>{i18n.t("plans.form.internalChat")}</InputLabel>
                                    <Field
                                        as={Select}
                                        label={i18n.t("plans.form.internalChat")}
                                        name="useInternalChat"
                                    >
                                        <MenuItem value={true}>{i18n.t("plans.form.enabled")}</MenuItem>
                                        <MenuItem value={false}>{i18n.t("plans.form.disabled")}</MenuItem>
                                    </Field>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <FormControl variant="outlined" fullWidth size="small" className={classes.select}>
                                    <InputLabel>{i18n.t("plans.form.externalApi")}</InputLabel>
                                    <Field
                                        as={Select}
                                        label={i18n.t("plans.form.externalApi")}
                                        name="useExternalApi"
                                    >
                                        <MenuItem value={true}>{i18n.t("plans.form.enabled")}</MenuItem>
                                        <MenuItem value={false}>{i18n.t("plans.form.disabled")}</MenuItem>
                                    </Field>
                                </FormControl>
                            </Grid>

                            {/* Terceira linha - Mais recursos */}
                            <Grid item xs={12} sm={6} md={3}>
                                <FormControl variant="outlined" fullWidth size="small" className={classes.select}>
                                    <InputLabel>{i18n.t("plans.form.kanban")}</InputLabel>
                                    <Field
                                        as={Select}
                                        label={i18n.t("plans.form.kanban")}
                                        name="useKanban"
                                    >
                                        <MenuItem value={true}>{i18n.t("plans.form.enabled")}</MenuItem>
                                        <MenuItem value={false}>{i18n.t("plans.form.disabled")}</MenuItem>
                                    </Field>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <FormControl variant="outlined" fullWidth size="small" className={classes.select}>
                                    <InputLabel>Open.AI</InputLabel>
                                    <Field
                                        as={Select}
                                        label="Open.AI"
                                        name="useOpenAi"
                                    >
                                        <MenuItem value={true}>{i18n.t("plans.form.enabled")}</MenuItem>
                                        <MenuItem value={false}>{i18n.t("plans.form.disabled")}</MenuItem>
                                    </Field>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <FormControl variant="outlined" fullWidth size="small" className={classes.select}>
                                    <InputLabel>{i18n.t("plans.form.integrations")}</InputLabel>
                                    <Field
                                        as={Select}
                                        label={i18n.t("plans.form.integrations")}
                                        name="useIntegrations"
                                    >
                                        <MenuItem value={true}>{i18n.t("plans.form.enabled")}</MenuItem>
                                        <MenuItem value={false}>{i18n.t("plans.form.disabled")}</MenuItem>
                                    </Field>
                                </FormControl>
                            </Grid>
                        </Grid>

                        <Box className={classes.buttonContainer}>
                            <Button
                                onClick={onCancel}
                                variant="outlined"
                                className={classes.button}
                            >
                                {i18n.t("plans.form.clear")}
                            </Button>
                            {record.id !== undefined && (
                                <Button
                                    onClick={() => onDelete(record)}
                                    variant="contained"
                                    color="secondary"
                                    className={classes.button}
                                >
                                    {i18n.t("plans.form.delete")}
                                </Button>
                            )}
                            <ButtonWithSpinner
                                loading={loading}
                                type="submit"
                                variant="contained"
                                color="primary"
                                className={classes.button}
                            >
                                {i18n.t("plans.form.save")}
                            </ButtonWithSpinner>
                        </Box>
                    </Form>
                )}
            </Formik>
        </Box>
    );
}

export function PlansManagerGrid(props) {
    const { records, onSelect } = props;
    const classes = useStyles();

    const renderFeatureIcon = (value) => {
        return value ? (
            <CheckIcon style={{ fontSize: 20, color: "#4caf50" }} />
        ) : (
            <CancelIcon style={{ fontSize: 20, color: "#f44336" }} />
        );
    };

    return (
        <Box className={classes.tableContainer}>
            <Table className={classes.table}>
                <TableHead className={classes.tableHeader}>
                    <TableRow>
                        <TableCell className={classes.tableCellAction}></TableCell>
                        <TableCell>{i18n.t("plans.form.name")}</TableCell>
                        <TableCell align="center">{i18n.t("plans.form.value")}</TableCell>
                        <TableCell align="center">{i18n.t("plans.form.users")}</TableCell>
                        <TableCell align="center">{i18n.t("plans.form.connections")}</TableCell>
                        <TableCell align="center">{i18n.t("plans.form.queues")}</TableCell>
                        <TableCell align="center">{i18n.t("plans.form.campaigns")}</TableCell>
                        <TableCell align="center">{i18n.t("plans.form.schedules")}</TableCell>
                        <TableCell align="center">{i18n.t("plans.form.internalChat")}</TableCell>
                        <TableCell align="center">{i18n.t("plans.form.externalApi")}</TableCell>
                        <TableCell align="center">{i18n.t("plans.form.kanban")}</TableCell>
                        <TableCell align="center">Open.AI</TableCell>
                        <TableCell align="center">{i18n.t("plans.form.integrations")}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {records.map((row) => (
                        <TableRow key={row.id} className={classes.tableRow}>
                            <TableCell className={classes.tableCellAction}>
                                <IconButton
                                    onClick={() => onSelect(row)}
                                    className={classes.editButton}
                                    size="small"
                                >
                                    <EditIcon fontSize="small" />
                                </IconButton>
                            </TableCell>
                            <TableCell>
                                <Typography className={classes.planName}>
                                    {row.name || '-'}
                                </Typography>
                            </TableCell>
                            <TableCell align="center" className={classes.valueCell}>
                                {i18n.t("plans.form.money")} {row.value ? row.value.toLocaleString('pt-br', { minimumFractionDigits: 2 }) : '0,00'}
                            </TableCell>
                            <TableCell align="center" className={classes.limitCell}>{row.users || 0}</TableCell>
                            <TableCell align="center" className={classes.limitCell}>{row.connections || 0}</TableCell>
                            <TableCell align="center" className={classes.limitCell}>{row.queues || 0}</TableCell>
                            <TableCell align="center">{renderFeatureIcon(row.useCampaigns)}</TableCell>
                            <TableCell align="center">{renderFeatureIcon(row.useSchedules)}</TableCell>
                            <TableCell align="center">{renderFeatureIcon(row.useInternalChat)}</TableCell>
                            <TableCell align="center">{renderFeatureIcon(row.useExternalApi)}</TableCell>
                            <TableCell align="center">{renderFeatureIcon(row.useKanban)}</TableCell>
                            <TableCell align="center">{renderFeatureIcon(row.useOpenAi)}</TableCell>
                            <TableCell align="center">{renderFeatureIcon(row.useIntegrations)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Box>
    );
}

export default function PlansManager() {
    const classes = useStyles();
    const { list, save, update, remove } = usePlans();

    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [loading, setLoading] = useState(false);
    const [records, setRecords] = useState([]);
    const [record, setRecord] = useState({
        name: '',
        users: 0,
        connections: 0,
        queues: 0,
        value: 0,
        useCampaigns: true,
        useSchedules: true,
        useInternalChat: true,
        useExternalApi: true,
        useKanban: true,
        useOpenAi: true,
        useIntegrations: true,
    });

    useEffect(() => {
        async function fetchData() {
            await loadPlans();
        }
        fetchData();
    }, []);

    const loadPlans = async () => {
        setLoading(true);
        try {
            const planList = await list();
            setRecords(planList);
        } catch (e) {
            toast.error(i18n.t("plans.toasts.errorList"));
        }
        setLoading(false);
    };

    const handleSubmit = async (data) => {
        setLoading(true);
        try {
            if (data.id !== undefined) {
                await update(data);
            } else {
                await save(data);
            }
            await loadPlans();
            handleCancel();
            toast.success(i18n.t("plans.toasts.success"));
        } catch (e) {
            toast.error(i18n.t("plans.toasts.error"));
        }
        setLoading(false);
    };

    const handleDelete = async () => {
        setLoading(true);
        try {
            await remove(record.id);
            await loadPlans();
            handleCancel();
            toast.success(i18n.t("plans.toasts.success"));
        } catch (e) {
            toast.error(i18n.t("plans.toasts.errorOperation"));
        }
        setLoading(false);
    };

    const handleOpenDeleteDialog = () => {
        setShowConfirmDialog(true);
    };

    const handleCancel = () => {
        setRecord({
            id: undefined,
            name: '',
            users: 0,
            connections: 0,
            queues: 0,
            value: 0,
            useCampaigns: true,
            useSchedules: true,
            useInternalChat: true,
            useExternalApi: true,
            useKanban: true,
            useOpenAi: true,
            useIntegrations: true,
        });
    };

    const handleSelect = (data) => {
        setRecord({
            id: data.id,
            name: data.name || '',
            users: data.users || 0,
            connections: data.connections || 0,
            queues: data.queues || 0,
            value: data.value?.toLocaleString('pt-br', { minimumFractionDigits: 0 }) || 0,
            useCampaigns: data.useCampaigns !== false,
            useSchedules: data.useSchedules !== false,
            useInternalChat: data.useInternalChat !== false,
            useExternalApi: data.useExternalApi !== false,
            useKanban: data.useKanban !== false,
            useOpenAi: data.useOpenAi !== false,
            useIntegrations: data.useIntegrations !== false,
        });
    };

    return (
        <Paper className={classes.mainPaper} elevation={0}>
            <PlanManagerForm
                initialValue={record}
                onDelete={handleOpenDeleteDialog}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                loading={loading}
            />
            
            <Typography className={classes.sectionTitle} style={{ marginTop: 24 }}>
                <ListIcon fontSize="small" />
                Planos Cadastrados
            </Typography>
            
            <PlansManagerGrid
                records={records}
                onSelect={handleSelect}
            />
            
            <ConfirmationModal
                title={i18n.t("plans.confirm.title")}
                open={showConfirmDialog}
                onClose={() => setShowConfirmDialog(false)}
                onConfirm={handleDelete}
            >
                {i18n.t("plans.confirm.message")}
            </ConfirmationModal>
        </Paper>
    );
}