import React from "react";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import ChatBubbleOutlineOutlinedIcon from "@material-ui/icons/ChatBubbleOutlineOutlined";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100vw",
    height: "100vh",
    backgroundColor: theme.palette.primary.main,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  paper: {
    backgroundColor: theme.palette.background.paper,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "48px 40px",
    borderRadius: 16,
    textAlign: "center",
    maxWidth: 360,
    width: "100%",
  },
  icon: {
    fontSize: 48,
    color: theme.palette.primary.main,
    marginBottom: theme.spacing(2),
  },
}));

const Login = () => {
  const classes = useStyles();
  return (
    <Box className={classes.root}>
      <Paper elevation={3} className={classes.paper}>
        <ChatBubbleOutlineOutlinedIcon className={classes.icon} />
        <Typography variant="h6" gutterBottom style={{ fontWeight: 700 }}>
          Acesso restrito
        </Typography>
        <Typography variant="body2" color="textSecondary">
          O AtendéChat é acessado pelo painel da loja.
          <br />
          Abra o painel da loja e clique em <strong>AtendéChat</strong> para entrar.
        </Typography>
      </Paper>
    </Box>
  );
};

export default Login;