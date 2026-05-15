import React, { useState, useContext } from "react";
import { Link as RouterLink } from "react-router-dom";

// Material UI imports
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
import IconButton from "@material-ui/core/IconButton";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import InputAdornment from "@material-ui/core/InputAdornment";

// Icons
import { LanguageOutlined, EmailOutlined, LockOutlined, Visibility, VisibilityOff } from "@material-ui/icons";

// Imports from existing files
import { versionSystem } from "../../../package.json";
import { i18n } from "../../translate/i18n";
import { nomeEmpresa } from "../../../package.json";
import { AuthContext } from "../../context/Auth/AuthContext";
import logo from "../../assets/logo.png";
import LanguageControl from "../../components/LanguageControl";

const Copyright = () => {
	return (
		<Typography variant="body2" color="primary" align="center">
			{"Copyright "}
 			<Link color="primary" href="#">
 				{nomeEmpresa} - v {versionSystem}
 			</Link>{" "}
 			{new Date().getFullYear()}
 			{"."}
 		</Typography>
 	);
};

const useStyles = makeStyles(theme => ({
	root: {
		width: "100vw",
		height: "100vh",
		backgroundColor: theme.palette.primary.main,
		backgroundSize: "cover",
		backgroundPosition: "center",
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",
		position: "relative",
		overflow: "hidden"
	},
	paper: {
		backgroundColor: theme.palette.background.paper,
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		padding: "40px 30px",
		borderRadius: "16px",
		boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
		position: "relative",
		zIndex: 2,
		backdropFilter: "blur(10px)",
		border: "1px solid rgba(255, 255, 255, 0.18)"
	},
	logoContainer: {
		marginBottom: theme.spacing(3),
		textAlign: "center"
	},
	logo: {
		width: "70%",
		maxWidth: "180px",
		margin: "0 auto",
	},
	form: {
		width: "100%",
		marginTop: theme.spacing(1),
	},
	submit: {
		margin: theme.spacing(3, 0, 2),
		padding: "12px 0",
		borderRadius: "8px",
		fontWeight: 600,
		textTransform: "none",
		fontSize: "1rem",
		boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
		transition: "transform 0.2s, box-shadow 0.2s",
		"&:hover": {
			transform: "translateY(-2px)",
			boxShadow: "0 6px 12px rgba(0, 0, 0, 0.15)",
		}
	},
	textField: {
		marginBottom: theme.spacing(2),
		"& .MuiOutlinedInput-root": {
			borderRadius: "8px",
			"& fieldset": {
				transition: "border-color 0.3s",
			},
			"&:hover fieldset": {
				borderColor: theme.palette.primary.main,
			},
		},
	},
	languageControl: {
		position: "absolute",
		top: theme.spacing(2),
		right: theme.spacing(2),
	},
	registerLink: {
		marginTop: theme.spacing(2),
		textAlign: "center",
		"& a": {
			color: theme.palette.primary.main,
			fontWeight: 500,
			transition: "color 0.2s",
			"&:hover": {
				color: theme.palette.primary.dark,
			}
		}
	},
	backgroundCircle: {
		position: "absolute",
		borderRadius: "50%",
		backgroundColor: theme.palette.primary.dark,
		opacity: 0.3,
	},
	circle1: {
		width: "300px",
		height: "300px",
		top: "-100px",
		right: "-100px",
	},
	circle2: {
		width: "500px",
		height: "500px",
		bottom: "-200px",
		left: "-200px",
		backgroundColor: theme.palette.secondary.main,
		opacity: 0.2,
	}
}));

const Login = () => {
	const classes = useStyles();

	const [user, setUser] = useState({ email: "", password: "" });
	const [showPassword, setShowPassword] = useState(false);

	// Languages
	const [anchorElLanguage, setAnchorElLanguage] = useState(null);
	const [menuLanguageOpen, setMenuLanguageOpen] = useState(false);

	const { handleLogin } = useContext(AuthContext);

	const handleChangeInput = e => {
		setUser({ ...user, [e.target.name]: e.target.value });
	};

	const handleSubmit = e => {
		e.preventDefault();
		handleLogin(user);
	};

	const handleTogglePasswordVisibility = () => {
		setShowPassword(!showPassword);
	};

	const handleMenuLanguage = (event) => {
		setAnchorElLanguage(event.currentTarget);
		setMenuLanguageOpen(true);
	};

	const handleCloseMenuLanguage = () => {
		setAnchorElLanguage(null);
		setMenuLanguageOpen(false);
	};
	
	return (
		<div className={classes.root}>
			{/* Background elements */}
			<div className={`${classes.backgroundCircle} ${classes.circle1}`}></div>
			<div className={`${classes.backgroundCircle} ${classes.circle2}`}></div>
			
			{/* Language control */}
			<div className={classes.languageControl}>
				<IconButton
					aria-label="change language"
					aria-controls="menu-appbar"
					aria-haspopup="true"
					onClick={handleMenuLanguage}
					style={{ color: "white" }}
				>
					<LanguageOutlined />
				</IconButton>
				<Menu
					id="menu-appbar-language"
					anchorEl={anchorElLanguage}
					getContentAnchorEl={null}
					anchorOrigin={{
						vertical: "bottom",
						horizontal: "right",
					}}
					transformOrigin={{
						vertical: "top",
						horizontal: "right",
					}}
					open={menuLanguageOpen}
					onClose={handleCloseMenuLanguage}
				>
					<MenuItem>
						<LanguageControl />
					</MenuItem>
				</Menu>
			</div>
			
			<Container component="main" maxWidth="xs">
				<CssBaseline />
				<Paper elevation={0} className={classes.paper}>
					<div className={classes.logoContainer}>
						<img className={classes.logo} src={logo} alt="Logo" />
					</div>
					<Typography component="h1" variant="h5" gutterBottom>
						{i18n.t("login.title") !== "login.title" ? i18n.t("login.title") : "Login"}
					</Typography>
					<Typography variant="body2" color="textSecondary" paragraph>
						{i18n.t("login.subtitle") !== "login.subtitle" ? i18n.t("login.subtitle") : "Entre com suas credenciais para acessar"}
					</Typography>
					
					<form className={classes.form} noValidate onSubmit={handleSubmit}>
						<TextField
							className={classes.textField}
							variant="outlined"
							required
							fullWidth
							id="email"
							label={i18n.t("login.form.email") || "Email"}
							name="email"
							value={user.email}
							onChange={handleChangeInput}
							autoComplete="email"
							autoFocus
							InputProps={{
								startAdornment: (
									<InputAdornment position="start">
										<EmailOutlined color="action" />
									</InputAdornment>
								),
							}}
						/>
						<TextField
							className={classes.textField}
							variant="outlined"
							required
							fullWidth
							name="password"
							label={i18n.t("login.form.password") || "Senha"}
							type={showPassword ? "text" : "password"}
							id="password"
							value={user.password}
							onChange={handleChangeInput}
							autoComplete="current-password"
							InputProps={{
								startAdornment: (
									<InputAdornment position="start">
										<LockOutlined color="action" />
									</InputAdornment>
								),
								endAdornment: (
									<InputAdornment position="end">
										<IconButton
											aria-label="toggle password visibility"
											onClick={handleTogglePasswordVisibility}
											edge="end"
										>
											{showPassword ? <VisibilityOff /> : <Visibility />}
										</IconButton>
									</InputAdornment>
								),
							}}
						/>
						
						<Button
							type="submit"
							fullWidth
							variant="contained"
							color="primary"
							className={classes.submit}
							disableElevation
						>
							{i18n.t("login.buttons.submit") || "Entrar"}
						</Button>
						
						<div className={classes.registerLink}>
							<Link
								component={RouterLink}
								to="/signup"
								variant="body2"
							>
								{i18n.t("login.buttons.register") || "Não tem uma conta? Registre-se"}
							</Link>
						</div>
					</form>
				</Paper>
				<Box mt={4}><Copyright /></Box>
			</Container>
		</div>
	);
};

export default Login;