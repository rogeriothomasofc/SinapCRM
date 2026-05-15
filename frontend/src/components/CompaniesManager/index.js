import React, { useState, useEffect } from "react";
import {
  makeStyles,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  MenuItem,
  TextField,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  IconButton,
  Select,
  Box,
  Typography,
  Chip,
  Button,
} from "@material-ui/core";
import { Formik, Form, Field } from "formik";
import ButtonWithSpinner from "../ButtonWithSpinner";
import ConfirmationModal from "../ConfirmationModal";

import { 
  Edit as EditIcon,
  Business as BusinessIcon,
  CalendarToday as CalendarIcon,
} from "@material-ui/icons";

import { toast } from "react-toastify";
import useCompanies from "../../hooks/useCompanies";
import usePlans from "../../hooks/usePlans";
import ModalUsers from "../ModalUsers";
import api from "../../services/api";
import { head, isArray } from "lodash";
import { useDate } from "../../hooks/useDate";

import moment from "moment";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  mainPaper: {
    width: "100%",
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
    width: "100%",
    overflowX: "auto",
    borderRadius: 8,
    border: `1px solid ${theme.palette.divider}`,
  },
  table: {
    minWidth: 650,
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
  statusChip: {
    height: 24,
    fontSize: 12,
    fontWeight: 500,
  },
  activeChip: {
    backgroundColor: theme.palette.success.light,
    color: theme.palette.success.dark,
  },
  inactiveChip: {
    backgroundColor: theme.palette.error.light,
    color: theme.palette.error.dark,
  },
  warningRow: {
    backgroundColor: "#fffaed !important",
  },
  dangerRow: {
    backgroundColor: "#fff5f5 !important",
  },
  criticalRow: {
    backgroundColor: "#ffe5e5 !important",
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
  planChip: {
    backgroundColor: theme.palette.info.light,
    color: theme.palette.info.dark,
    fontWeight: 500,
    fontSize: 12,
  },
  dueDateText: {
    fontSize: 13,
    "& .recurrence": {
      fontSize: 11,
      color: theme.palette.text.secondary,
      fontWeight: 500,
    },
  },
}));

export function CompanyForm(props) {
  const { onSubmit, onDelete, onCancel, initialValue, loading } = props;
  const classes = useStyles();
  const [plans, setPlans] = useState([]);
  const [modalUser, setModalUser] = useState(false);
  const [firstUser, setFirstUser] = useState({});

  const [record, setRecord] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    planId: "",
    status: true,
    dueDate: "",
    recurrence: "",
    ...initialValue,
  });

  const { list: listPlans } = usePlans();

  useEffect(() => {
    async function fetchData() {
      const list = await listPlans();
      setPlans(list);
    }
    fetchData();
  }, []);

  useEffect(() => {
    setRecord((prev) => {
      if (moment(initialValue.dueDate).isValid()) {
        initialValue.dueDate = moment(initialValue.dueDate).format("YYYY-MM-DD");
      }
      return {
        ...prev,
        ...initialValue,
      };
    });
  }, [initialValue]);

  const handleSubmit = async (data) => {
    if (data.dueDate === "" || moment(data.dueDate).isValid() === false) {
      data.dueDate = null;
    }
    onSubmit(data);
    setRecord({ ...initialValue, dueDate: "" });
  };

  const handleOpenModalUsers = async () => {
    try {
      const { data } = await api.get("/users/list", {
        params: {
          companyId: initialValue.id,
        },
      });
      if (isArray(data) && data.length) {
        setFirstUser(head(data));
      }
      setModalUser(true);
    } catch (e) {
      toast.error(e);
    }
  };

  const handleCloseModalUsers = () => {
    setFirstUser({});
    setModalUser(false);
  };

  const incrementDueDate = () => {
    const data = { ...record };
    if (data.dueDate !== "" && data.dueDate !== null) {
      switch (data.recurrence) {
        case "MENSAL":
          data.dueDate = moment(data.dueDate).add(1, "month").format("YYYY-MM-DD");
          break;
        case "BIMESTRAL":
          data.dueDate = moment(data.dueDate).add(2, "month").format("YYYY-MM-DD");
          break;
        case "TRIMESTRAL":
          data.dueDate = moment(data.dueDate).add(3, "month").format("YYYY-MM-DD");
          break;
        case "SEMESTRAL":
          data.dueDate = moment(data.dueDate).add(6, "month").format("YYYY-MM-DD");
          break;
        case "ANUAL":
          data.dueDate = moment(data.dueDate).add(12, "month").format("YYYY-MM-DD");
          break;
        default:
          break;
      }
    }
    setRecord(data);
  };

  return (
    <>
      <ModalUsers
        userId={firstUser.id}
        companyId={initialValue.id}
        open={modalUser}
        onClose={handleCloseModalUsers}
      />
      <Box className={classes.formSection}>
        <Typography className={classes.sectionTitle}>
          <BusinessIcon fontSize="small" />
          {record.id ? "Editar Empresa" : "Nova Empresa"}
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
                <Grid item xs={12} sm={6} md={3}>
                  <Field
                    as={TextField}
                    label={i18n.t("settings.company.form.name")}
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
                    label={i18n.t("settings.company.form.email")}
                    name="email"
                    variant="outlined"
                    fullWidth
                    className={classes.textfield}
                    size="small"
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <Field
                    as={TextField}
                    label="Senha"
                    name="password"
                    type="password"
                    variant="outlined"
                    fullWidth
                    className={classes.textfield}
                    size="small"
                    disabled={record.id}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <Field
                    as={TextField}
                    label={i18n.t("settings.company.form.phone")}
                    name="phone"
                    variant="outlined"
                    fullWidth
                    className={classes.textfield}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl variant="outlined" fullWidth size="small" className={classes.select}>
                    <InputLabel>{i18n.t("settings.company.form.plan")}</InputLabel>
                    <Field
                      as={Select}
                      label={i18n.t("settings.company.form.plan")}
                      name="planId"
                      required
                    >
                      {plans.map((plan) => (
                        <MenuItem key={plan.id} value={plan.id}>
                          {plan.name}
                        </MenuItem>
                      ))}
                    </Field>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <FormControl variant="outlined" fullWidth size="small" className={classes.select}>
                    <InputLabel>{i18n.t("settings.company.form.status")}</InputLabel>
                    <Field
                      as={Select}
                      label={i18n.t("settings.company.form.status")}
                      name="status"
                    >
                      <MenuItem value={true}>{i18n.t("settings.company.form.yes")}</MenuItem>
                      <MenuItem value={false}>{i18n.t("settings.company.form.no")}</MenuItem>
                    </Field>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <Field
                    as={TextField}
                    label={i18n.t("settings.company.form.dueDate")}
                    type="date"
                    name="dueDate"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    variant="outlined"
                    fullWidth
                    className={classes.textfield}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <FormControl variant="outlined" fullWidth size="small" className={classes.select}>
                    <InputLabel>{i18n.t("settings.company.form.recurrence")}</InputLabel>
                    <Field
                      as={Select}
                      label={i18n.t("settings.company.form.recurrence")}
                      name="recurrence"
                    >
                      <MenuItem value="MENSAL">{i18n.t("settings.company.form.monthly")}</MenuItem>
                      <MenuItem value="BIMESTRAL">Bimestral</MenuItem>
                      <MenuItem value="TRIMESTRAL">Trimestral</MenuItem>
                      <MenuItem value="SEMESTRAL">Semestral</MenuItem>
                      <MenuItem value="ANUAL">Anual</MenuItem>
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
                  {i18n.t("settings.company.buttons.clear")}
                </Button>
                
                {record.id && (
                  <>
                    <Button
                      onClick={() => onDelete(record)}
                      variant="contained"
                      color="secondary"
                      className={classes.button}
                    >
                      {i18n.t("settings.company.buttons.delete")}
                    </Button>
                    <Button
                      onClick={incrementDueDate}
                      variant="contained"
                      className={classes.button}
                      style={{ backgroundColor: "#ff9800", color: "#fff" }}
                    >
                      {i18n.t("settings.company.buttons.expire")}
                    </Button>
                    <Button
                      onClick={handleOpenModalUsers}
                      variant="contained"
                      className={classes.button}
                    >
                      {i18n.t("settings.company.buttons.user")}
                    </Button>
                  </>
                )}
                
                <ButtonWithSpinner
                  loading={loading}
                  type="submit"
                  variant="contained"
                  color="primary"
                  className={classes.button}
                >
                  {i18n.t("settings.company.buttons.save")}
                </ButtonWithSpinner>
              </Box>
            </Form>
          )}
        </Formik>
      </Box>
    </>
  );
}

export function CompaniesManagerGrid(props) {
  const { records, onSelect } = props;
  const classes = useStyles();
  const { dateToClient } = useDate();

  const getRowClass = (record) => {
    if (moment(record.dueDate).isValid()) {
      const now = moment();
      const dueDate = moment(record.dueDate);
      const diff = dueDate.diff(now, "days");
      
      if (diff === 5) return classes.warningRow;
      if (diff >= -3 && diff <= 4) return classes.dangerRow;
      if (diff === -4) return classes.criticalRow;
    }
    return "";
  };

  return (
    <Box className={classes.tableContainer}>
      <Table className={classes.table}>
        <TableHead className={classes.tableHeader}>
          <TableRow>
            <TableCell className={classes.tableCellAction}></TableCell>
            <TableCell>{i18n.t("settings.company.form.name")}</TableCell>
            <TableCell>{i18n.t("settings.company.form.email")}</TableCell>
            <TableCell>{i18n.t("settings.company.form.phone")}</TableCell>
            <TableCell>{i18n.t("settings.company.form.plan")}</TableCell>
            <TableCell align="center">{i18n.t("settings.company.form.status")}</TableCell>
            <TableCell>{i18n.t("settings.company.form.createdAt")}</TableCell>
            <TableCell>{i18n.t("settings.company.form.expire")}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {records.map((row) => (
            <TableRow key={row.id} className={`${classes.tableRow} ${getRowClass(row)}`}>
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
                <Typography variant="body2" style={{ fontWeight: 500 }}>
                  {row.name || "-"}
                </Typography>
              </TableCell>
              <TableCell>{row.email || "-"}</TableCell>
              <TableCell>{row.phone || "-"}</TableCell>
              <TableCell>
                {row.plan ? (
                  <Chip 
                    label={row.plan.name} 
                    size="small" 
                    className={classes.planChip}
                  />
                ) : "-"}
              </TableCell>
              <TableCell align="center">
                <Chip
                  label={row.status ? "Ativo" : "Inativo"}
                  size="small"
                  className={row.status ? classes.activeChip : classes.inactiveChip}
                />
              </TableCell>
              <TableCell>{dateToClient(row.createdAt)}</TableCell>
              <TableCell>
                <Box className={classes.dueDateText}>
                  {dateToClient(row.dueDate)}
                  {row.recurrence && (
                    <Typography variant="caption" className="recurrence" display="block">
                      {row.recurrence}
                    </Typography>
                  )}
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}

export default function CompaniesManager() {
  const classes = useStyles();
  const { list, save, update, remove } = useCompanies();

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [record, setRecord] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    planId: "",
    status: true,
    dueDate: "",
    recurrence: "",
  });

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    setLoading(true);
    try {
      const companyList = await list();
      setRecords(companyList);
    } catch (e) {
      toast.error(i18n.t("settings.company.toasts.errorList"));
    }
    setLoading(false);
  };

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      if (data.id) {
        await update(data);
      } else {
        await save(data);
      }
      await loadCompanies();
      handleCancel();
      toast.success(i18n.t("settings.company.toasts.success"));
    } catch (e) {
      toast.error(i18n.t("settings.company.toasts.error"));
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await remove(record.id);
      await loadCompanies();
      handleCancel();
      toast.success(i18n.t("settings.company.toasts.success"));
    } catch (e) {
      toast.error(i18n.t("settings.company.toasts.errorOperation"));
    }
    setLoading(false);
  };

  const handleOpenDeleteDialog = () => {
    setShowConfirmDialog(true);
  };

  const handleCancel = () => {
    setRecord({
      id: undefined,
      name: "",
      email: "",
      password: "",
      phone: "",
      planId: "",
      status: true,
      dueDate: "",
      recurrence: "",
    });
  };

  const handleSelect = (data) => {
    setRecord({
      id: data.id,
      name: data.name || "",
      phone: data.phone || "",
      email: data.email || "",
      password: "",
      planId: data.planId || "",
      status: data.status !== false,
      dueDate: data.dueDate || "",
      recurrence: data.recurrence || "",
    });
  };

  return (
    <Paper className={classes.mainPaper} elevation={0}>
      <CompanyForm
        initialValue={record}
        onDelete={handleOpenDeleteDialog}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
      />
      
      <Typography className={classes.sectionTitle} style={{ marginTop: 24 }}>
        <CalendarIcon fontSize="small" />
        Empresas Cadastradas
      </Typography>
      
      <CompaniesManagerGrid records={records} onSelect={handleSelect} />
      
      <ConfirmationModal
        title={i18n.t("settings.company.confirmModal.title")}
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleDelete}
      >
        {i18n.t("settings.company.confirmModal.message")}
      </ConfirmationModal>
    </Paper>
  );
}