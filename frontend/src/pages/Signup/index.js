import React, { useState, useEffect } from "react";
import qs from 'query-string';
import * as Yup from "yup";
import { useHistory } from "react-router-dom";
import { Link as RouterLink } from "react-router-dom";
import { toast } from "react-toastify";
import { Formik, Form, Field } from "formik";
import usePlans from "../../hooks/usePlans";
import moment from "moment";

import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import Link from "@material-ui/core/Link";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Paper from "@material-ui/core/Paper";
import InputMask from 'react-input-mask';
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import Chip from "@material-ui/core/Chip";
import {
  InputAdornment,
  IconButton,
} from "@material-ui/core";

import {
  PersonOutline,
  EmailOutlined,
  PhoneOutlined,
  LockOutlined,
  Visibility,
  VisibilityOff,
  CheckCircle,
  PeopleAlt,
  WhatsApp,
  AccountTree,
  ExpandMore,
  Close,
} from "@material-ui/icons";

import logo from "../../assets/logo.png";
import { i18n } from "../../translate/i18n";
import { openApi } from "../../services/api";
import toastError from "../../errors/toastError";

const Copyright = () => (
  <Typography variant="body2" color="textSecondary" align="center">
    {"Copyright © "}
    <Link color="inherit" href="#">PLW</Link>{" "}
    {new Date().getFullYear()}{"."}
  </Typography>
);

const useStyles = makeStyles(theme => ({
  root: {
    width: "100vw",
    minHeight: "100vh",
    backgroundColor: theme.palette.primary.main,
    backgroundSize: "cover",
    backgroundPosition: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
    padding: theme.spacing(2, 0),
  },
  paper: {
    backgroundColor: theme.palette.background.paper,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "24px 28px",
    borderRadius: "16px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
    position: "relative",
    zIndex: 2,
    maxWidth: "500px",
    width: "100%",
  },
  logoContainer: { marginBottom: theme.spacing(1.5), textAlign: "center" },
  logo: { width: "70%", maxWidth: "150px", margin: "0 auto" },
  form: { width: "100%", marginTop: theme.spacing(0.5) },
  submit: {
    margin: theme.spacing(2, 0, 1),
    padding: "10px 0",
    borderRadius: "8px",
    fontWeight: 600,
    textTransform: "none",
    fontSize: "1rem",
  },
  textField: {
    marginBottom: 0,
    "& .MuiOutlinedInput-root": { borderRadius: "8px" },
  },
  loginLink: {
    marginTop: theme.spacing(2),
    textAlign: "center",
    "& a": { color: theme.palette.primary.main, fontWeight: 500 },
  },
  backgroundCircle: {
    position: "absolute",
    borderRadius: "50%",
    backgroundColor: theme.palette.primary.dark,
    opacity: 0.3,
  },
  circle1: { width: "300px", height: "300px", top: "-100px", right: "-100px" },
  circle2: {
    width: "500px",
    height: "500px",
    bottom: "-200px",
    left: "-200px",
    backgroundColor: theme.palette.secondary.main,
    opacity: 0.2,
  },

  // Plan picker button
  planButton: {
    width: "100%",
    padding: "9px 14px",
    borderRadius: "8px",
    border: `1px solid rgba(0,0,0,0.23)`,
    textAlign: "left",
    textTransform: "none",
    color: theme.palette.text.secondary,
    justifyContent: "space-between",
    "&:hover": { borderColor: theme.palette.primary.main },
  },
  planButtonSelected: {
    color: theme.palette.text.primary,
    borderColor: theme.palette.primary.main,
  },
  planButtonError: {
    borderColor: theme.palette.error.main,
    color: theme.palette.error.main,
  },

  // Plan cards in modal
  dialogTitle: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 24px",
  },
  plansGrid: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: theme.spacing(2),
    padding: theme.spacing(1),
  },
  planCard: {
    border: `2px solid ${theme.palette.divider}`,
    borderRadius: "12px",
    padding: theme.spacing(2.5),
    cursor: "pointer",
    transition: "all 0.2s ease",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    width: "200px",
    flexShrink: 0,
    "&:hover": {
      borderColor: theme.palette.primary.main,
      boxShadow: `0 4px 16px ${theme.palette.primary.main}33`,
      transform: "translateY(-2px)",
    },
  },
  planCardSelected: {
    borderColor: theme.palette.primary.main,
    backgroundColor: `${theme.palette.primary.main}0D`,
  },
  planName: {
    fontWeight: 700,
    fontSize: "1.05rem",
    marginBottom: theme.spacing(1),
  },
  planPrice: {
    fontSize: "1.6rem",
    fontWeight: 800,
    color: theme.palette.primary.main,
    lineHeight: 1.1,
    marginBottom: theme.spacing(0.5),
  },
  planPriceLabel: {
    fontSize: "0.7rem",
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(2),
  },
  planFeatures: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(0.75),
    width: "100%",
    marginBottom: theme.spacing(2),
  },
  planFeatureRow: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.75),
    fontSize: "0.82rem",
    color: theme.palette.text.secondary,
  },
  planFeatureIcon: { fontSize: "0.95rem", color: theme.palette.primary.main },
  selectPlanBtn: {
    marginTop: "auto",
    borderRadius: "8px",
    textTransform: "none",
    fontWeight: 600,
    width: "100%",
  },
  selectedChip: {
    marginLeft: theme.spacing(1),
    height: "18px",
    fontSize: "0.65rem",
  },
}));

const UserSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, i18n.t("signup.formErrors.name.short"))
    .max(50, i18n.t("signup.formErrors.name.long"))
    .required(i18n.t("signup.formErrors.name.required")),
  userName: Yup.string()
    .min(2, "Nome muito curto")
    .max(50, "Nome muito longo")
    .required("Nome do usuário é obrigatório"),
  password: Yup.string()
    .min(5, i18n.t("signup.formErrors.password.short"))
    .max(50, i18n.t("signup.formErrors.password.long"))
    .required(i18n.t("signup.formErrors.password.required")),
  email: Yup.string()
    .email(i18n.t("signup.formErrors.email.invalid"))
    .required(i18n.t("signup.formErrors.email.required")),
  phone: Yup.string()
    .required(i18n.t("signup.formErrors.phone.required") || "Telefone é obrigatório"),
  planId: Yup.string()
    .required(i18n.t("signup.formErrors.plan.required") || "Selecione um plano"),
});

const RECURRENCE_LABEL = {
  MENSAL: "Mensal", TRIMESTRAL: "Trimestral", SEMESTRAL: "Semestral", ANUAL: "Anual"
};

const PlanPickerModal = ({ open, plans, selectedId, onSelect, onClose }) => {
  const classes = useStyles();
  const fmt = (v) => Number(v).toFixed(2).replace(".", ",");

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <div className={classes.dialogTitle}>
        <Typography variant="h6" style={{ fontWeight: 700 }}>
          Escolha seu plano
        </Typography>
        <IconButton size="small" onClick={onClose}>
          <Close />
        </IconButton>
      </div>
      <DialogContent>
        <div className={classes.plansGrid}>
          {plans.map(plan => {
            const isSelected = String(selectedId) === String(plan.id);
            const recLabel = RECURRENCE_LABEL[plan.recurrence] || "Mensal";

            return (
              <div
                key={plan.id}
                className={`${classes.planCard} ${isSelected ? classes.planCardSelected : ""}`}
                onClick={() => { onSelect(plan); onClose(); }}
              >
                <Typography className={classes.planName}>{plan.name}</Typography>
                <Typography className={classes.planPrice}>
                  R$ {fmt(plan.value)}
                </Typography>
                <Typography className={classes.planPriceLabel}>
                  cobrado {recLabel.toLowerCase()}
                </Typography>

                <div className={classes.planFeatures}>
                  <div className={classes.planFeatureRow}>
                    <PeopleAlt className={classes.planFeatureIcon} />
                    <span><strong>{plan.users}</strong> atendente{plan.users !== 1 ? "s" : ""}</span>
                  </div>
                  <div className={classes.planFeatureRow}>
                    <WhatsApp className={classes.planFeatureIcon} />
                    <span><strong>{plan.connections}</strong> WhatsApp{plan.connections !== 1 ? "s" : ""}</span>
                  </div>
                  <div className={classes.planFeatureRow}>
                    <AccountTree className={classes.planFeatureIcon} />
                    <span><strong>{plan.queues}</strong> setor{plan.queues !== 1 ? "es" : ""}</span>
                  </div>
                </div>

                <Button
                  variant={isSelected ? "contained" : "outlined"}
                  color="primary"
                  className={classes.selectPlanBtn}
                  onClick={e => { e.stopPropagation(); onSelect(plan); onClose(); }}
                >
                  {isSelected
                    ? <><CheckCircle style={{ fontSize: 16, marginRight: 4 }} />Selecionado</>
                    : "Selecionar"}
                </Button>
              </div>
            );
          })}
        </div>
        <Box pb={2} />
      </DialogContent>
    </Dialog>
  );
};

const SignUp = () => {
  const classes = useStyles();
  const history = useHistory();
  const [showPassword, setShowPassword] = useState(false);
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [plans, setPlans] = useState([]);
  const { getPlanList } = usePlans();

  const params = qs.parse(window.location.search);

  const initialState = { name: "", userName: "", email: "", phone: "", password: "", planId: "" };
  const [user] = useState(initialState);
  const dueDate = moment().add(3, "day").format();

  const handleSignUp = async values => {
    Object.assign(values, { recurrence: selectedPlan?.recurrence || "MENSAL" });
    Object.assign(values, { dueDate: dueDate });
    Object.assign(values, { status: "t" });
    Object.assign(values, { campaignsEnabled: true });
    Object.assign(values, { token: process.env.REACT_APP_ENV_TOKEN });
    try {
      await openApi.post("/companies/cadastro", values);
      toast.success(i18n.t("signup.toasts.success"));
      history.push("/login");
    } catch (err) {
      toastError(err);
    }
  };

  useEffect(() => {
    async function fetchData() {
      const list = await getPlanList();
      setPlans(list);
    }
    fetchData();
  }, [getPlanList]);

  return (
    <div className={classes.root}>
      <div className={`${classes.backgroundCircle} ${classes.circle1}`} />
      <div className={`${classes.backgroundCircle} ${classes.circle2}`} />

      <Container component="main" maxWidth="sm">
        <CssBaseline />
        <Paper elevation={0} className={classes.paper}>
          <div className={classes.logoContainer}>
            <img className={classes.logo} src={logo} alt="Logo" />
          </div>

          <Typography component="h1" variant="h6" gutterBottom style={{ fontWeight: 700, marginBottom: 2 }}>
            Cadastrar
          </Typography>
          <Typography variant="caption" color="textSecondary" style={{ marginBottom: 8, display: "block" }}>
            Crie sua conta gratuitamente
          </Typography>

          <Formik
            initialValues={user}
            enableReinitialize={true}
            validationSchema={UserSchema}
            onSubmit={(values, actions) => {
              setTimeout(() => {
                handleSignUp(values);
                actions.setSubmitting(false);
              }, 400);
            }}
          >
            {({ touched, errors, isSubmitting, setFieldValue, setFieldTouched }) => (
              <Form className={classes.form}>
                <Grid container spacing={1}>
                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      className={classes.textField}
                      autoComplete="name"
                      name="name"
                      size="small"
                      error={touched.name && Boolean(errors.name)}
                      helperText={touched.name && errors.name}
                      variant="outlined"
                      fullWidth
                      label="Nome da Empresa"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonOutline color="action" fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      className={classes.textField}
                      autoComplete="username"
                      name="userName"
                      size="small"
                      error={touched.userName && Boolean(errors.userName)}
                      helperText={touched.userName && errors.userName}
                      variant="outlined"
                      fullWidth
                      label="Nome do Usuário"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonOutline color="action" fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      className={classes.textField}
                      variant="outlined"
                      fullWidth
                      size="small"
                      label="Email"
                      name="email"
                      error={touched.email && Boolean(errors.email)}
                      helperText={touched.email && errors.email}
                      autoComplete="email"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailOutlined color="action" fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Field
                      as={InputMask}
                      mask="(99) 99999-9999"
                      name="phone"
                    >
                      {({ field }) => (
                        <TextField
                          {...field}
                          className={classes.textField}
                          variant="outlined"
                          fullWidth
                          size="small"
                          label="Telefone (com DDD)"
                          error={touched.phone && Boolean(errors.phone)}
                          helperText={touched.phone && errors.phone}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <PhoneOutlined color="action" fontSize="small" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      )}
                    </Field>
                  </Grid>

                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      className={classes.textField}
                      variant="outlined"
                      fullWidth
                      size="small"
                      name="password"
                      error={touched.password && Boolean(errors.password)}
                      helperText={touched.password && errors.password}
                      label="Senha"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockOutlined color="action" fontSize="small" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton size="small" onClick={() => setShowPassword(v => !v)} edge="end">
                              {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Button
                      variant="outlined"
                      className={`${classes.planButton} ${
                        selectedPlan ? classes.planButtonSelected : ""
                      } ${touched.planId && errors.planId ? classes.planButtonError : ""}`}
                      onClick={() => { setFieldTouched("planId", true); setPlanModalOpen(true); }}
                      endIcon={<ExpandMore />}
                    >
                      {selectedPlan ? (
                        <span>
                          {selectedPlan.name}
                          <Chip
                            label={`R$ ${Number(selectedPlan.value).toFixed(2).replace(".", ",")} · ${RECURRENCE_LABEL[selectedPlan.recurrence] || "Mensal"}`}
                            size="small"
                            color="primary"
                            className={classes.selectedChip}
                          />
                        </span>
                      ) : "Selecionar plano"}
                    </Button>
                    {touched.planId && errors.planId && (
                      <Typography variant="caption" color="error" style={{ marginLeft: 14 }}>
                        {errors.planId}
                      </Typography>
                    )}

                    <PlanPickerModal
                      open={planModalOpen}
                      plans={plans}
                      selectedId={selectedPlan?.id}
                      onSelect={plan => {
                        setSelectedPlan(plan);
                        setFieldValue("planId", plan.id);
                      }}
                      onClose={() => setPlanModalOpen(false)}
                    />
                  </Grid>
                </Grid>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  className={classes.submit}
                  disabled={isSubmitting}
                >
                  Cadastrar
                </Button>

                <Grid container justifyContent="center">
                  <Grid item className={classes.loginLink}>
                    <Link component={RouterLink} to="/login" variant="body2">
                      Já tem uma conta? Faça login!
                    </Link>
                  </Grid>
                </Grid>
              </Form>
            )}
          </Formik>
        </Paper>
        <Box mt={4}><Copyright /></Box>
      </Container>
    </div>
  );
};

export default SignUp;
