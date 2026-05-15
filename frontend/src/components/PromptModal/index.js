import React, { useState, useEffect, useRef } from "react";

import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import CircularProgress from "@material-ui/core/CircularProgress";
import { i18n } from "../../translate/i18n";
import { MenuItem, FormControl, InputLabel, Select, Menu, Grid } from "@material-ui/core";
import { Visibility, VisibilityOff } from "@material-ui/icons";
import { InputAdornment, IconButton } from "@material-ui/core";
import QueueSelectSingle from "../../components/QueueSelectSingle";

import api from "../../services/api";
import toastError from "../../errors/toastError";

const useStyles = makeStyles(theme => ({
    root: {
        display: "flex",
        flexWrap: "wrap",
    },
    multFieldLine: {
        display: "flex",
        "& > *:not(:last-child)": {
            marginRight: theme.spacing(1),
        },
    },

    btnWrapper: {
        position: "relative",
    },

    buttonProgress: {
        color: green[500],
        position: "absolute",
        top: "50%",
        left: "50%",
        marginTop: -12,
        marginLeft: -12,
    },
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120,
    },
    colorAdorment: {
        width: 20,
        height: 20,
    },
}));

const PromptSchema = Yup.object().shape({
    name: Yup.string().min(5, i18n.t("promptModal.formErrors.name.short")).max(100, i18n.t("promptModal.formErrors.name.long")).required(i18n.t("promptModal.formErrors.name.required")),
    prompt: Yup.string().min(50, i18n.t("promptModal.formErrors.prompt.short")).required(i18n.t("promptModal.formErrors.prompt.required")),
    model: Yup.string().required(i18n.t("promptModal.formErrors.modal.required")),
    maxTokens: Yup.number().required(i18n.t("promptModal.formErrors.maxTokens.required")),
    temperature: Yup.number().required(i18n.t("promptModal.formErrors.temperature.required")),
    apiKey: Yup.string().required(i18n.t("promptModal.formErrors.apikey.required")),
    queueId: Yup.number().required(i18n.t("promptModal.formErrors.queueId.required")),
    maxMessages: Yup.number().required(i18n.t("promptModal.formErrors.maxMessages.required"))
});

const PromptModal = ({ open, onClose, promptId, refreshPrompts }) => {
    const classes = useStyles();
    const [selectedModel, setSelectedModel] = useState("gpt-3.5-turbo-1106");
    const [showApiKey, setShowApiKey] = useState(false);
    const importRef = useRef(null);

    const handleToggleApiKey = () => {
        setShowApiKey(!showApiKey);
    };

    const handleImportAgent = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        e.target.value = "";
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const json = JSON.parse(ev.target.result);
                const aiNode = json.nodes?.find((n) => n.type === "ai" || n.type === "openai");
                const nd = aiNode?.data || {};
                setPrompt((prev) => ({
                    ...prev,
                    name: json.name || prev.name,
                    prompt: nd.prompt || prev.prompt,
                    apiKey: nd.apiKey || prev.apiKey,
                    maxTokens: nd.maxTokens || prev.maxTokens || 100,
                    temperature: nd.temperature ?? prev.temperature ?? 1,
                    maxMessages: nd.maxHistoryMessages || prev.maxMessages || 10,
                }));
                if (nd.model) setSelectedModel(nd.model);
            } catch {
                alert("Arquivo inválido: não é um JSON válido");
            }
        };
        reader.readAsText(file);
    };

    const initialState = {
        name: "",
        prompt: "",
        model: "gpt-3.5-turbo-1106",
        maxTokens: 100,
        temperature: 1,
        apiKey: "",
        queueId: '',
        maxMessages: 10
    };

    const [prompt, setPrompt] = useState(initialState);

    useEffect(() => {
        const fetchPrompt = async () => {
            if (!promptId) {
                setPrompt(initialState);
                return;
            }
            try {
                const { data } = await api.get(`/prompt/${promptId}`);
                setPrompt(prevState => {
                    return { ...prevState, ...data };
                });
                
                setSelectedModel(data.model);
            } catch (err) { 
                toastError(err);
            }
        };

        fetchPrompt();
    }, [promptId, open]);

    const handleClose = () => {
        setPrompt(initialState);
        setSelectedModel("gpt-3.5-turbo-1106");
        onClose();
    };

    const handleChangeModel = (e) => {
        setSelectedModel(e.target.value);
    };

    const handleSavePrompt = async values => {
        const promptData = { ...values, model: selectedModel };
        console.log(promptData);
        if (!values.queueId) {
            toastError(i18n.t("promptModal.setor"));
            return;
        }
        try {
            if (promptId) {
                await api.put(`/prompt/${promptId}`, promptData);
            } else {
                await api.post("/prompt", promptData);
            }
            toast.success(i18n.t("promptModal.success"));
            refreshPrompts(  )
        } catch (err) {
            toastError(err);
        }
        handleClose();
    };

    return (
        <div className={classes.root}>
            <Dialog
                open={open}
                onClose={handleClose}
                maxWidth="md"
                scroll="paper"
                fullWidth
            >
                <DialogTitle id="form-dialog-title" disableTypography>
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 500, flex: 1 }}>
                            {promptId ? `${i18n.t("promptModal.title.edit")}` : `${i18n.t("promptModal.title.add")}`}
                        </h2>
                        <input ref={importRef} type="file" accept=".json" style={{ display: "none" }} onChange={handleImportAgent} />
                        <Button size="small" variant="contained" color="primary" onClick={() => importRef.current && importRef.current.click()}>
                            Importar Agente
                        </Button>
                    </div>
                </DialogTitle>
                <Formik
                    initialValues={prompt}
                    enableReinitialize={true}
                    validationSchema={PromptSchema}
                    onSubmit={(values, actions) => {
                        setTimeout(() => {
                            handleSavePrompt(values);
                            actions.setSubmitting(false);
                        }, 400);
                    }}
                >
                    {({ touched, errors, isSubmitting, values }) => (
                        <Form style={{ width: "100%" }}>
                            <DialogContent dividers>
                                <Field
                                    as={TextField}
                                    label={i18n.t("promptModal.form.name")}
                                    name="name"
                                    error={touched.name && Boolean(errors.name)}
                                    helperText={touched.name && errors.name}
                                    variant="outlined"
                                    margin="dense"
                                    fullWidth
                                />
                                <FormControl fullWidth margin="dense" variant="outlined">
                                    <Field
                                        as={TextField}
                                        label={i18n.t("promptModal.form.apikey")}
                                        name="apiKey"
                                        type={showApiKey ? 'text' : 'password'}
                                        error={touched.apiKey && Boolean(errors.apiKey)}
                                        helperText={touched.apiKey && errors.apiKey}
                                        variant="outlined"
                                        margin="dense"
                                        fullWidth
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton onClick={handleToggleApiKey}>
                                                        {showApiKey ? <VisibilityOff /> : <Visibility />}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </FormControl>
                                <Field
                                    as={TextField}
                                    label={i18n.t("promptModal.form.prompt")}
                                    name="prompt"
                                    error={touched.prompt && Boolean(errors.prompt)}
                                    helperText={touched.prompt && errors.prompt}
                                    variant="outlined"
                                    margin="dense"
                                    fullWidth
                                    rows={10}
                                    multiline={true}
                                />
                                <QueueSelectSingle touched={touched} errors={errors}/>
                                <div className={classes.multFieldLine}>
                                    <FormControl fullWidth margin="dense" variant="outlined">
                                    <InputLabel>{i18n.t("promptModal.form.model")}</InputLabel>
                                        <Select
                                            id="type-select"
                                            labelWidth={60}
                                            name="model"
                                            value={selectedModel}
                                            onChange={handleChangeModel}
                                            multiple={false}
                                        >
                                            <MenuItem key={"gpt-3.5"} value={"gpt-3.5-turbo-1106"}>
                                                GPT 3.5 turbo
                                            </MenuItem>
                                            <MenuItem key={"gpt-4"} value={"gpt-4o-mini"}>
                                                GPT 4.0
                                            </MenuItem>
                                        </Select>
                                    </FormControl>
                                    <Field
                                        as={TextField}
                                        label={i18n.t("promptModal.form.temperature")}
                                        name="temperature"
                                        error={touched.temperature && Boolean(errors.temperature)}
                                        helperText={touched.temperature && errors.temperature}
                                        variant="outlined"
                                        margin="dense"
                                        fullWidth
                                        type="number"
                                        inputProps={{
                                            step: "0.1",
                                            min: "0",
                                            max: "1"
                                        }}
                                    />
                                </div>
                                
                                <div className={classes.multFieldLine}>
                                    <Field
                                        as={TextField}
                                        label={i18n.t("promptModal.form.max_tokens")}
                                        name="maxTokens"
                                        error={touched.maxTokens && Boolean(errors.maxTokens)}
                                        helperText={touched.maxTokens && errors.maxTokens}
                                        variant="outlined"
                                        margin="dense"
                                        fullWidth
                                    />
                                    <Field
                                        as={TextField}
                                        label={i18n.t("promptModal.form.max_messages")}
                                        name="maxMessages"
                                        error={touched.maxMessages && Boolean(errors.maxMessages)}
                                        helperText={touched.maxMessages && errors.maxMessages}
                                        variant="outlined"
                                        margin="dense"
                                        fullWidth
                                    />
                                </div>
                            </DialogContent>
                            <DialogActions>
                                <Button
                                    onClick={handleClose}
                                    color="secondary"
                                    disabled={isSubmitting}
                                    variant="outlined"
                                >
                                    {i18n.t("promptModal.buttons.cancel")}
                                </Button>
                                <Button
                                    type="submit"
                                    color="primary"
                                    disabled={isSubmitting}
                                    variant="contained"
                                    className={classes.btnWrapper}
                                >
                                    {promptId
                                        ? `${i18n.t("promptModal.buttons.okEdit")}`
                                        : `${i18n.t("promptModal.buttons.okAdd")}`}
                                    {isSubmitting && (
                                        <CircularProgress
                                            size={24}
                                            className={classes.buttonProgress}
                                        />
                                    )}
                                </Button>
                            </DialogActions>
                        </Form>
                    )}
                </Formik>
            </Dialog>
        </div>
    );
};

export default PromptModal;