import React from "react";
import {
  Box,
  Button,
  Grid,
  Paper,
  TextField,
  Typography,
  makeStyles,
  Fade,
  Tooltip,
  Divider
} from "@material-ui/core";

// Ícones modernos
import FilterListRoundedIcon from "@material-ui/icons/FilterListRounded";
import SearchRoundedIcon from "@material-ui/icons/SearchRounded";
import DateRangeRoundedIcon from "@material-ui/icons/DateRangeRounded";

// Estilo próprio para este componente
const useStyles = makeStyles((theme) => ({
  filterPaper: {
    padding: theme.spacing(3),
    borderRadius: 16,
    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
    backgroundColor: theme.palette.background.paper,
    marginBottom: theme.spacing(3),
    overflow: "hidden",
    transition: "all 0.3s ease",
    "&:hover": {
      boxShadow: "0 6px 25px rgba(0,0,0,0.1)",
    },
  },
  filterTitle: {
    fontWeight: 600,
    marginBottom: theme.spacing(2),
    display: "flex",
    alignItems: "center",
    "& .MuiSvgIcon-root": {
      marginRight: theme.spacing(1),
      color: theme.palette.primary.main,
    },
  },
  dateField: {
    "& .MuiInputBase-root": {
      borderRadius: 8,
    },
    "& .MuiInputLabel-shrink": {
      fontWeight: 500,
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: theme.palette.type === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
    },
    "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: theme.palette.primary.main,
    },
  },
  dateIcon: {
    color: theme.palette.text.secondary,
  },
  filterButton: {
    height: "100%",
    borderRadius: 8,
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
    textTransform: "none",
    fontWeight: 500,
    fontSize: "1rem",
    transition: "all 0.3s ease",
    background: theme.palette.type === 'dark' 
      ? "linear-gradient(135deg, #667EEA 0%, #764BA2 100%)" 
      : "linear-gradient(135deg, #6A11CB 0%, #2575FC 100%)",
    color: "#fff",
    "&:hover": {
      boxShadow: "0 6px 15px rgba(0, 0, 0, 0.15)",
      transform: "translateY(-2px)",
      background: theme.palette.type === 'dark' 
        ? "linear-gradient(135deg, #764BA2 0%, #667EEA 100%)"
        : "linear-gradient(135deg, #2575FC 0%, #6A11CB 100%)",
    },
  },
  dateContainer: {
    display: "flex",
    flexDirection: "column",
    [theme.breakpoints.up("sm")]: {
      flexDirection: "row",
      alignItems: "center",
    },
  },
  dateLabel: {
    marginBottom: theme.spacing(1),
    marginRight: theme.spacing(2),
    display: "flex",
    alignItems: "center",
    "& .MuiSvgIcon-root": {
      marginRight: theme.spacing(1),
    },
    [theme.breakpoints.up("sm")]: {
      marginBottom: 0,
      width: 70,
    },
  },
  divider: {
    margin: theme.spacing(2, 0),
  },
}));

const Filters = ({
  classes: parentClasses,
  setDateStartTicket,
  setDateEndTicket,
  dateStartTicket,
  dateEndTicket,
  setQueueTicket,
  queueTicket,
}) => {
  const classes = useStyles();
  const [queues] = React.useState(queueTicket);
  const [dateStart, setDateStart] = React.useState(dateStartTicket);
  const [dateEnd, setDateEnd] = React.useState(dateEndTicket);

  const handleFilter = () => {
    setQueueTicket(queues);
    setDateStartTicket(dateStart);
    setDateEndTicket(dateEnd);
  };

  return (
    <Grid item xs={12}>
      <Fade in timeout={800}>
        <Paper className={classes.filterPaper} elevation={0}>
          <Typography variant="h6" className={classes.filterTitle}>
            <FilterListRoundedIcon />
            Filtros
          </Typography>
          
          <Divider className={classes.divider} />
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={10}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box className={classes.dateContainer}>
                    <Typography variant="subtitle2" className={classes.dateLabel}>
                      <DateRangeRoundedIcon className={classes.dateIcon} fontSize="small" />
                      De:
                    </Typography>
                    <TextField
                      fullWidth
                      name="dateStart"
                      className={classes.dateField}
                      variant="outlined"
                      InputLabelProps={{
                        shrink: true,
                      }}
                      type="date"
                      value={dateStart}
                      onChange={(e) => setDateStart(e.target.value)}
                      inputProps={{
                        max: dateEnd,
                      }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box className={classes.dateContainer}>
                    <Typography variant="subtitle2" className={classes.dateLabel}>
                      <DateRangeRoundedIcon className={classes.dateIcon} fontSize="small" />
                      Até:
                    </Typography>
                    <TextField
                      fullWidth
                      name="dateEnd"
                      className={classes.dateField}
                      variant="outlined"
                      InputLabelProps={{
                        shrink: true,
                      }}
                      type="date"
                      value={dateEnd}
                      onChange={(e) => setDateEnd(e.target.value)}
                      inputProps={{
                        min: dateStart,
                      }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </Grid>
            
            <Grid item xs={12} md={2}>
              <Tooltip title="Aplicar filtros">
                <Button
                  fullWidth
                  className={classes.filterButton}
                  onClick={handleFilter}
                  startIcon={<SearchRoundedIcon />}
                  size="large"
                >
                  Filtrar
                </Button>
              </Tooltip>
            </Grid>
          </Grid>
        </Paper>
      </Fade>
    </Grid>
  );
};

export default Filters;