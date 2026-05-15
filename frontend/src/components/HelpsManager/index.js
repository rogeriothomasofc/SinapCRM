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
    Box,
    Typography,
    Button,
    Chip,
} from "@material-ui/core";
import { Formik, Form, Field } from 'formik';
import ButtonWithSpinner from "../ButtonWithSpinner";
import ConfirmationModal from "../ConfirmationModal";

import { 
    Edit as EditIcon,
    Help as HelpIcon,
    VideoLibrary as VideoIcon,
} from "@material-ui/icons";

import { toast } from "react-toastify";
import useHelps from "../../hooks/useHelps";
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
        minWidth: 600,
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
    titleCell: {
        fontWeight: 600,
        fontSize: 14,
    },
    descriptionCell: {
        fontSize: 13,
        color: theme.palette.text.secondary,
        maxWidth: 400,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
    },
    videoChip: {
        backgroundColor: theme.palette.info.light,
        color: theme.palette.info.dark,
        fontWeight: 500,
        fontSize: 11,
        height: 24,
        "& .MuiChip-icon": {
            fontSize: 16,
            color: theme.palette.info.dark,
        },
    },
    iconField: {
        marginRight: 8,
        color: theme.palette.text.secondary,
        fontSize: 20,
    },
}));

export function HelpManagerForm(props) {
    const { onSubmit, onDelete, onCancel, initialValue, loading } = props;
    const classes = useStyles();

    const [record, setRecord] = useState({
        title: '',
        description: '',
        video: '',
        ...initialValue
    });

    useEffect(() => {
        setRecord({
            title: '',
            description: '',
            video: '',
            ...initialValue
        });
    }, [initialValue]);

    const handleSubmit = async (data) => {
        onSubmit(data);
    };

    return (
        <Box className={classes.formSection}>
            <Typography className={classes.sectionTitle}>
                <HelpIcon fontSize="small" />
                {record.id ? "Editar Ajuda" : "Nova Ajuda"}
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
                            <Grid item xs={12} sm={6} md={4}>
                                <Field
                                    as={TextField}
                                    label="Título"
                                    name="title"
                                    variant="outlined"
                                    fullWidth
                                    className={classes.textfield}
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Field
                                    as={TextField}
                                    label="Código do Vídeo"
                                    name="video"
                                    variant="outlined"
                                    fullWidth
                                    className={classes.textfield}
                                    size="small"
                                    placeholder="Ex: dQw4w9WgXcQ"
                                />
                            </Grid>
                            <Grid item xs={12} md={5}>
                                <Field
                                    as={TextField}
                                    label="Descrição"
                                    name="description"
                                    variant="outlined"
                                    fullWidth
                                    className={classes.textfield}
                                    size="small"
                                    multiline
                                    rows={1}
                                />
                            </Grid>
                        </Grid>

                        <Box className={classes.buttonContainer}>
                            <Button
                                onClick={onCancel}
                                variant="outlined"
                                className={classes.button}
                            >
                                {i18n.t('settings.helps.buttons.clean')}
                            </Button>
                            {record.id && (
                                <Button
                                    onClick={() => onDelete(record)}
                                    variant="contained"
                                    color="secondary"
                                    className={classes.button}
                                >
                                    {i18n.t('settings.helps.buttons.delete')}
                                </Button>
                            )}
                            <ButtonWithSpinner
                                loading={loading}
                                type="submit"
                                variant="contained"
                                color="primary"
                                className={classes.button}
                            >
                                {i18n.t('settings.helps.buttons.save')}
                            </ButtonWithSpinner>
                        </Box>
                    </Form>
                )}
            </Formik>
        </Box>
    );
}

export function HelpsManagerGrid(props) {
    const { records, onSelect } = props;
    const classes = useStyles();

    const formatVideoCode = (video) => {
        if (!video) return '-';
        return (
            <Chip
                icon={<VideoIcon />}
                label={video}
                size="small"
                className={classes.videoChip}
            />
        );
    };

    return (
        <Box className={classes.tableContainer}>
            <Table className={classes.table}>
                <TableHead className={classes.tableHeader}>
                    <TableRow>
                        <TableCell className={classes.tableCellAction}></TableCell>
                        <TableCell>{i18n.t("settings.helps.grid.title")}</TableCell>
                        <TableCell>{i18n.t("settings.helps.grid.description")}</TableCell>
                        <TableCell align="center">{i18n.t("settings.helps.grid.video")}</TableCell>
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
                                <Typography className={classes.titleCell}>
                                    {row.title || '-'}
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Typography className={classes.descriptionCell}>
                                    {row.description || '-'}
                                </Typography>
                            </TableCell>
                            <TableCell align="center">
                                {formatVideoCode(row.video)}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Box>
    );
}

export default function HelpsManager() {
    const classes = useStyles();
    const { list, save, update, remove } = useHelps();
    
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [loading, setLoading] = useState(false);
    const [records, setRecords] = useState([]);
    const [record, setRecord] = useState({
        title: '',
        description: '',
        video: ''
    });

    useEffect(() => {
        async function fetchData() {
            await loadHelps();
        }
        fetchData();
    }, []);

    const loadHelps = async () => {
        setLoading(true);
        try {
            const helpList = await list();
            setRecords(helpList);
        } catch (e) {
            toast.error(i18n.t('settings.helps.toasts.errorList'));
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
            await loadHelps();
            handleCancel();
            toast.success(i18n.t('settings.helps.toasts.success'));
        } catch (e) {
            toast.error(i18n.t('settings.helps.toasts.error'));
        }
        setLoading(false);
    };

    const handleDelete = async () => {
        setLoading(true);
        try {
            await remove(record.id);
            await loadHelps();
            handleCancel();
            toast.success(i18n.t('settings.helps.toasts.success'));
        } catch (e) {
            toast.error(i18n.t('settings.helps.toasts.errorOperation'));
        }
        setLoading(false);
    };

    const handleOpenDeleteDialog = () => {
        setShowConfirmDialog(true);
    };

    const handleCancel = () => {
        setRecord({
            title: '',
            description: '',
            video: ''
        });
    };

    const handleSelect = (data) => {
        setRecord({
            id: data.id,
            title: data.title || '',
            description: data.description || '',
            video: data.video || ''
        });
    };

    return (
        <Paper className={classes.mainPaper} elevation={0}>
            <HelpManagerForm 
                initialValue={record} 
                onDelete={handleOpenDeleteDialog} 
                onSubmit={handleSubmit} 
                onCancel={handleCancel} 
                loading={loading}
            />
            
            <Typography className={classes.sectionTitle} style={{ marginTop: 24 }}>
                <VideoIcon fontSize="small" />
                Vídeos de Ajuda Cadastrados
            </Typography>
            
            <HelpsManagerGrid 
                records={records}
                onSelect={handleSelect}
            />
            
            <ConfirmationModal
                title={i18n.t('settings.helps.confirmModal.title')}
                open={showConfirmDialog}
                onClose={() => setShowConfirmDialog(false)}
                onConfirm={handleDelete}
            >
                {i18n.t('settings.helps.confirmModal.confirm')}
            </ConfirmationModal>
        </Paper>
    );
}