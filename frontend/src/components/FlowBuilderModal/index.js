import React, { useState, useEffect, useRef } from "react";
import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";

// Material UI imports
import { makeStyles, alpha } from "@material-ui/core/styles";
import { 
  Button, 
  Dialog, 
  DialogContent,
  Typography,
  IconButton,
  CircularProgress,
  Box,
  Slide
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import FlowIcon from "@material-ui/icons/AccountTree";
import AddIcon from "@material-ui/icons/Add";
import EditIcon from "@material-ui/icons/Edit";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import toastError from "../../errors/toastError";

// Transição para entrada do modal
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// Estilos modernizados
const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
  },
  dialog: {
    "& .MuiDialog-paper": {
      borderRadius: 12,
      boxShadow: "0 8px 40px rgba(0, 0, 0, 0.12)",
      overflow: "visible"
    }
  },
  dialogHeader: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(3, 3, 2),
    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.05)}`,
    position: "relative"
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: theme.palette.text.primary,
    flex: 1
  },
  iconHeader: {
    background: theme.palette.primary.main,
    color: "white",
    width: 42,
    height: 42,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing(2),
    boxShadow: `0 4px 10px ${alpha(theme.palette.primary.main, 0.3)}`
  },
  closeButton: {
    position: "absolute",
    top: 12,
    right: 12,
    color: theme.palette.text.secondary,
    background: alpha(theme.palette.divider, 0.05),
    '&:hover': {
      background: alpha(theme.palette.divider, 0.1),
    }
  },
  dialogContent: {
    padding: theme.spacing(3),
  },
  textField: {
    width: "100%",
    marginBottom: theme.spacing(1),
    '& .MuiOutlinedInput-root': {
      borderRadius: 10,
      backgroundColor: alpha(theme.palette.background.default, 0.6),
      transition: 'all 0.3s',
      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
      '&:hover': {
        backgroundColor: alpha(theme.palette.background.default, 0.9),
        border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
      },
      '&.Mui-focused': {
        backgroundColor: 'white',
        boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
        border: `1px solid ${theme.palette.primary.main}`,
      },
    },
    '& .MuiInputLabel-outlined': {
      fontSize: 14,
      transform: 'translate(14px, 14px) scale(1)',
      '&.MuiInputLabel-shrink': {
        transform: 'translate(14px, -6px) scale(0.75)',
      },
    },
    '& .MuiOutlinedInput-input': {
      padding: '14px 16px',
    },
    '& .MuiOutlinedInput-notchedOutline': {
      border: 'none',
    },
  },
  helperText: {
    marginLeft: 4,
    fontSize: 12,
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: theme.spacing(1.5),
    padding: theme.spacing(2, 3, 3),
  },
  cancelButton: {
    borderRadius: 8,
    textTransform: 'none',
    fontWeight: 500,
    padding: theme.spacing(1.2, 2.5),
    boxShadow: 'none',
    color: theme.palette.text.secondary,
    backgroundColor: alpha(theme.palette.divider, 0.08),
    '&:hover': {
      backgroundColor: alpha(theme.palette.divider, 0.15),
      boxShadow: 'none',
    },
  },
  submitButton: {
    borderRadius: 8,
    textTransform: 'none',
    fontWeight: 500,
    padding: theme.spacing(1.2, 2.5),
    boxShadow: `0 4px 10px ${alpha(theme.palette.primary.main, 0.25)}`,
    '&:hover': {
      boxShadow: `0 6px 15px ${alpha(theme.palette.primary.main, 0.35)}`,
    },
  },
  buttonProgress: {
    color: "white",
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12,
  },
  errorText: {
    color: theme.palette.error.main,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  inputContainer: {
    position: "relative",
    marginBottom: theme.spacing(3),
  },
  formLabel: {
    fontSize: 14,
    fontWeight: 500,
    marginBottom: theme.spacing(1),
    color: theme.palette.text.primary,
    display: "block",
  }
}));

// Schema de validação
const ContactSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Muito curto!")
    .max(50, "Muito longo!")
    .required("Digite um nome!"),
});

const FlowBuilderModal = ({
  open,
  onClose,
  flowId,
  nameWebhook = "",
  initialValues,
  onSave,
}) => {
  const classes = useStyles();
  const isMounted = useRef(true);

  const [contact, setContact] = useState({
    name: nameWebhook,
  });

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleClose = () => {
    onClose();
    setContact({
      name: "",
    });
  };

  const handleSaveContact = async (values) => {
    if (flowId) {
      try {
        await api.put("/flowbuilder", {
          name: values.name,
          flowId,
        });
        onSave(values.name);
        handleClose();
        toast.success(i18n.t("webhookModal.toasts.update"));
      } catch (err) {
        toastError(err);
      }
    } else {
      try {
        await api.post("/flowbuilder", {
          name: values.name,
        });
        onSave(values.name);
        handleClose();
        toast.success(i18n.t("webhookModal.saveSuccess"));
      } catch (err) {
        toastError(err);
      }
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="sm" 
      fullWidth 
      className={classes.dialog}
      TransitionComponent={Transition}
    >
      <div className={classes.dialogHeader}>
        <div className={classes.iconHeader}>
          {flowId ? <EditIcon /> : <AddIcon />}
        </div>
        <Typography className={classes.dialogTitle}>
          {flowId ? `Editar Fluxo` : `Adicionar Fluxo`}
        </Typography>
        <IconButton 
          className={classes.closeButton} 
          onClick={handleClose}
          size="small"
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </div>

      <Formik
        initialValues={contact}
        enableReinitialize={true}
        validationSchema={ContactSchema}
        onSubmit={(values, actions) => {
          setTimeout(() => {
            handleSaveContact(values);
            actions.setSubmitting(false);
          }, 400);
        }}
      >
        {({ errors, touched, isSubmitting }) => (
          <Form>
            <DialogContent className={classes.dialogContent}>
              <div className={classes.inputContainer}>
                <label htmlFor="name" className={classes.formLabel}>
                  Nome do Fluxo
                </label>
                <Field
                  className={classes.textField}
                  id="name"
                  name="name"
                  placeholder="Digite o nome do fluxo"
                  autoFocus
                  type="text"
                  as="input"
                />
                {errors.name && touched.name && (
                  <div className={classes.errorText}>{errors.name}</div>
                )}
              </div>
            </DialogContent>

            <Box className={classes.actions}>
              <Button
                onClick={handleClose}
                className={classes.cancelButton}
                disabled={isSubmitting}
              >
                {i18n.t("contactModal.buttons.cancel")}
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                className={classes.submitButton}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <CircularProgress size={24} className={classes.buttonProgress} />
                ) : flowId ? (
                  i18n.t("contactModal.buttons.okEdit")
                ) : (
                  i18n.t("contactModal.buttons.okAdd")
                )}
              </Button>
            </Box>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default FlowBuilderModal;