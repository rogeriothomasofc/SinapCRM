import React, { useState, useEffect } from "react";
import {
  makeStyles,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Switch,
  Typography,
  Box,
  Chip,
} from "@material-ui/core";
import { Formik, Form, FieldArray } from "formik";
import ButtonWithSpinner from "../ButtonWithSpinner";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles((theme) => ({
  fullWidth: { width: "100%" },
  buttonContainer: { textAlign: "center", marginTop: theme.spacing(3) },
  row: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(1, 0),
    borderBottom: "1px solid #f0f0f0",
    "&:last-child": { borderBottom: "none" },
  },
  weekdayLabel: {
    fontWeight: 500,
    fontSize: 14,
    width: 120,
    flexShrink: 0,
  },
  closedChip: {
    backgroundColor: "#f5f5f5",
    color: "#999",
    fontSize: 12,
    height: 28,
  },
  timeSelects: {
    display: "flex",
    gap: theme.spacing(2),
    flex: 1,
  },
}));

const TIME_OPTIONS = (() => {
  const opts = [];
  for (let h = 0; h < 24; h++) {
    for (let m of [0, 30]) {
      const hh = String(h).padStart(2, "0");
      const mm = String(m).padStart(2, "0");
      opts.push(`${hh}:${mm}`);
    }
  }
  return opts;
})();

const DEFAULT_SCHEDULES = [
  { weekday: "Segunda-feira", weekdayEn: "monday",    startTime: "08:00", endTime: "18:00", enabled: true  },
  { weekday: "Terça-feira",   weekdayEn: "tuesday",   startTime: "08:00", endTime: "18:00", enabled: true  },
  { weekday: "Quarta-feira",  weekdayEn: "wednesday", startTime: "08:00", endTime: "18:00", enabled: true  },
  { weekday: "Quinta-feira",  weekdayEn: "thursday",  startTime: "08:00", endTime: "18:00", enabled: true  },
  { weekday: "Sexta-feira",   weekdayEn: "friday",    startTime: "08:00", endTime: "18:00", enabled: true  },
  { weekday: "Sábado",        weekdayEn: "saturday",  startTime: "08:00", endTime: "12:00", enabled: true  },
  { weekday: "Domingo",       weekdayEn: "sunday",    startTime: "",      endTime: "",       enabled: false },
];

function mergeWithDefaults(saved) {
  return DEFAULT_SCHEDULES.map((def) => {
    const s = saved.find((x) => x.weekdayEn === def.weekdayEn);
    if (!s) return def;
    const hasTime = s.startTime && s.endTime;
    return {
      ...def,
      startTime: hasTime ? s.startTime : def.startTime,
      endTime:   hasTime ? s.endTime   : def.endTime,
      enabled:   hasTime,
    };
  });
}

function TimeSelect({ label, value, onChange }) {
  const classes = useStyles();
  return (
    <FormControl variant="outlined" margin="dense" style={{ flex: 1 }}>
      <InputLabel>{label}</InputLabel>
      <Select value={value || ""} onChange={(e) => onChange(e.target.value)} label={label}>
        {TIME_OPTIONS.map((t) => (
          <MenuItem key={t} value={t}>{t}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

function SchedulesForm({ initialValues, onSubmit, loading, labelSaveButton }) {
  const classes = useStyles();
  const [schedules, setSchedules] = useState(DEFAULT_SCHEDULES);

  useEffect(() => {
    if (Array.isArray(initialValues) && initialValues.length > 0) {
      setSchedules(mergeWithDefaults(initialValues));
    }
  }, [initialValues]);

  const handleSubmit = (values) => {
    const data = values.schedules.map((s) => ({
      weekday:   s.weekday,
      weekdayEn: s.weekdayEn,
      startTime: s.enabled ? s.startTime : "",
      endTime:   s.enabled ? s.endTime   : "",
    }));
    setTimeout(() => onSubmit(data), 500);
  };

  return (
    <Formik
      enableReinitialize
      initialValues={{ schedules }}
      onSubmit={handleSubmit}
    >
      {({ values, setFieldValue }) => (
        <Form className={classes.fullWidth}>
          <FieldArray
            name="schedules"
            render={() => (
              <Box>
                {values.schedules.map((item, index) => (
                  <Box key={item.weekdayEn} className={classes.row}>
                    <Switch
                      size="small"
                      checked={item.enabled}
                      onChange={(e) => setFieldValue(`schedules[${index}].enabled`, e.target.checked)}
                      color="primary"
                    />
                    <Typography className={classes.weekdayLabel}>{item.weekday}</Typography>

                    {item.enabled ? (
                      <Box className={classes.timeSelects}>
                        <TimeSelect
                          label={i18n.t("settings.schedules.form.initialHour")}
                          value={item.startTime}
                          onChange={(val) => setFieldValue(`schedules[${index}].startTime`, val)}
                        />
                        <TimeSelect
                          label={i18n.t("settings.schedules.form.finalHour")}
                          value={item.endTime}
                          onChange={(val) => setFieldValue(`schedules[${index}].endTime`, val)}
                        />
                      </Box>
                    ) : (
                      <Chip label="Fechado" className={classes.closedChip} />
                    )}
                  </Box>
                ))}
              </Box>
            )}
          />
          <div className={classes.buttonContainer}>
            <ButtonWithSpinner loading={loading} type="submit" color="primary" variant="contained">
              {labelSaveButton ?? i18n.t("settings.schedules.form.save")}
            </ButtonWithSpinner>
          </div>
        </Form>
      )}
    </Formik>
  );
}

export default SchedulesForm;
