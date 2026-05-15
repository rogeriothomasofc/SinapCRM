import React from "react";
import { Typography, Box, makeStyles } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  titleContainer: {
    marginBottom: theme.spacing(2),
    position: "relative",
    display: "inline-block",
    "&::after": {
      content: '""',
      position: "absolute",
      bottom: -5,
      left: 0,
      width: 40,
      height: 3,
      backgroundColor: theme.palette.primary.main,
      borderRadius: 1.5,
    },
  },
  title: {
    fontWeight: 600,
    fontSize: "1.25rem",
    [theme.breakpoints.up("sm")]: {
      fontSize: "1.5rem",
    },
    color: theme.palette.type === "dark" ? "#fff" : theme.palette.primary.main,
  },
}));

const Title = (props) => {
  const classes = useStyles();
  
  return (
    <Box className={classes.titleContainer}>
      <Typography className={classes.title} variant="h6" component="h2" {...props}>
        {props.children}
      </Typography>
    </Box>
  );
};

export default Title;