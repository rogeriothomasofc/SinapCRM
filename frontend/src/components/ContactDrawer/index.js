import React, { useEffect, useState } from "react";

import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import Drawer from "@material-ui/core/Drawer";
import Link from "@material-ui/core/Link";
import InputLabel from "@material-ui/core/InputLabel";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import Paper from "@material-ui/core/Paper";
import Divider from "@material-ui/core/Divider";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import PersonIcon from "@material-ui/icons/Person";
import PhoneIcon from "@material-ui/icons/Phone";
import EmailIcon from "@material-ui/icons/Email";
import EditIcon from "@material-ui/icons/Edit";
import LabelIcon from "@material-ui/icons/Label";
import EventNoteIcon from "@material-ui/icons/EventNote";
import HistoryIcon from "@material-ui/icons/History";
import TuneIcon from "@material-ui/icons/Tune";
import CircularProgress from "@material-ui/core/CircularProgress";
import Tooltip from "@material-ui/core/Tooltip";
import SyncIcon from "@material-ui/icons/Sync";

import { i18n } from "../../translate/i18n";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

import ContactDrawerSkeleton from "../ContactDrawerSkeleton";
import MarkdownWrapper from "../MarkdownWrapper";
import TabPanel from "../TabPanel";
import ContactModal from "../ContactModal";
import { ContactNotes } from "../ContactNotes";
import { TagsContainer } from "../TagsContainer";
import api from "../../services/api";
import toastError from "../../errors/toastError";

const drawerWidth = 340;

const useStyles = makeStyles(theme => ({
	drawer: {
		width: drawerWidth,
		flexShrink: 0,
	},
	drawerPaper: {
		width: drawerWidth,
		display: "flex",
		borderTop: "1px solid rgba(0, 0, 0, 0.12)",
		borderRight: "1px solid rgba(0, 0, 0, 0.12)",
		borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
		borderTopRightRadius: 4,
		borderBottomRightRadius: 4,
	},
	drawerHeader: {
		display: "flex",
		alignItems: "center",
		padding: theme.spacing(0, 1),
		minHeight: 48,
		justifyContent: "space-between",
		borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
		backgroundColor: theme.palette.contactdrawer,
	},
	tabsBar: {
		backgroundColor: theme.palette.contactdrawer,
		borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
		"& .MuiTab-root": {
			minWidth: 0,
			flex: 1,
			fontSize: "0.7rem",
			textTransform: "none",
			padding: "6px 4px",
		},
	},
	content: {
		display: "flex",
		backgroundColor: theme.palette.contactdrawer,
		flexDirection: "column",
		height: "100%",
		overflowY: "auto",
		...theme.scrollbarStyles,
	},
	// Perfil tab
	profileSection: {
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		padding: "16px 8px 12px",
		gap: 6,
	},
	avatar: {
		width: 72,
		height: 72,
	},
	contactName: {
		fontSize: "1rem",
		fontWeight: 600,
		textAlign: "center",
		lineHeight: 1.3,
	},
	infoBlock: {
		padding: "8px 12px",
	},
	sectionLabel: {
		fontSize: "0.65rem",
		fontWeight: 700,
		textTransform: "uppercase",
		letterSpacing: "0.05em",
		color: theme.palette.text.secondary,
		marginBottom: 8,
	},
	infoRow: {
		display: "flex",
		alignItems: "flex-start",
		gap: 10,
		padding: "5px 0",
	},
	infoIcon: {
		fontSize: 16,
		color: theme.palette.text.secondary,
		marginTop: 2,
		flexShrink: 0,
	},
	infoTextGroup: {
		display: "flex",
		flexDirection: "column",
	},
	infoLabel: {
		fontSize: "0.62rem",
		color: theme.palette.text.secondary,
		textTransform: "uppercase",
		letterSpacing: "0.04em",
		lineHeight: 1.2,
	},
	infoValue: {
		fontSize: "0.84rem",
		lineHeight: 1.35,
	},
	editBtn: {
		fontSize: "0.75rem",
		marginTop: 4,
	},
	tagsSection: {
		padding: "8px 12px",
	},
	notesSection: {
		padding: "8px 12px",
	},
	// Atendimentos tab
	ticketHistoryItem: {
		padding: "8px 12px",
		borderBottom: "1px solid rgba(0, 0, 0, 0.07)",
		cursor: "default",
	},
	ticketStatus: {
		fontSize: "0.65rem",
		textTransform: "uppercase",
		letterSpacing: "0.04em",
		padding: "1px 6px",
		borderRadius: 4,
		fontWeight: 600,
	},
	statusOpen: { backgroundColor: "#e3f2fd", color: "#1565c0" },
	statusClosed: { backgroundColor: "#e8f5e9", color: "#2e7d32" },
	statusPending: { backgroundColor: "#fff8e1", color: "#f57f17" },
	// Gestão tab
	extraInfoItem: {
		padding: "8px 12px",
		marginBottom: 4,
	},
}));

const InfoRow = ({ icon: Icon, label, value, link, classes }) => {
	if (!value) return null;
	const content = link
		? <Link href={link} style={{ fontSize: "0.84rem" }}>{value}</Link>
		: <span className={classes.infoValue}>{value}</span>;
	return (
		<div className={classes.infoRow}>
			<Icon className={classes.infoIcon} />
			<div className={classes.infoTextGroup}>
				<span className={classes.infoLabel}>{label}</span>
				{content}
			</div>
		</div>
	);
};

const statusLabel = { open: "Aberto", closed: "Encerrado", pending: "Pendente" };
const statusClass = { open: "statusOpen", closed: "statusClosed", pending: "statusPending" };

const ContactDrawer = ({ open, handleDrawerClose, contact, ticket, loading }) => {
	const classes = useStyles();
	const [tab, setTab] = useState("perfil");
	const [modalOpen, setModalOpen] = useState(false);
	const [ticketHistory, setTicketHistory] = useState([]);
	const [historyLoading, setHistoryLoading] = useState(false);
	const [syncing, setSyncing] = useState(false);
	const [profilePicUrl, setProfilePicUrl] = useState(null);

	useEffect(() => {
		setProfilePicUrl(contact?.profilePicUrl || null);
	}, [contact]);

	const handleSyncWhatsapp = async () => {
		if (!contact?.id || syncing) return;
		setSyncing(true);
		try {
			const { data } = await api.post(`/contacts/${contact.id}/sync-whatsapp`);
			setProfilePicUrl(data.profilePicUrl);
		} catch (err) {
			toastError(err);
		} finally {
			setSyncing(false);
		}
	};

	useEffect(() => {
		setTab("perfil");
	}, [open, contact]);

	useEffect(() => {
		if (tab !== "atendimentos" || !contact?.id) return;
		let cancelled = false;
		setHistoryLoading(true);
		api.get(`/contacts/${contact.id}/tickets`)
			.then(({ data }) => {
				if (!cancelled) setTicketHistory(data || []);
			})
			.catch(toastError)
			.finally(() => { if (!cancelled) setHistoryLoading(false); });
		return () => { cancelled = true; };
	}, [tab, contact?.id]);

	return (
		<>
			<ContactModal
				open={modalOpen}
				onClose={() => setModalOpen(false)}
				contactId={contact?.id}
			/>
			<Drawer
				className={classes.drawer}
				variant="persistent"
				anchor="right"
				open={open}
				PaperProps={{ style: { position: "absolute" } }}
				BackdropProps={{ style: { position: "absolute" } }}
				ModalProps={{
					container: document.getElementById("drawer-container"),
					style: { position: "absolute" },
				}}
				classes={{ paper: classes.drawerPaper }}
			>
				{/* Header */}
				<div className={classes.drawerHeader}>
					<IconButton size="small" onClick={handleDrawerClose}>
						<CloseIcon fontSize="small" />
					</IconButton>
					<Typography variant="subtitle2">
						{i18n.t("contactDrawer.header")}
					</Typography>
					<IconButton size="small" onClick={() => setModalOpen(true)}>
						<EditIcon fontSize="small" />
					</IconButton>
				</div>

				{/* Tabs */}
				<Tabs
					value={tab}
					onChange={(_, v) => setTab(v)}
					className={classes.tabsBar}
					indicatorColor="primary"
					textColor="primary"
					variant="fullWidth"
				>
					<Tab icon={<PersonIcon style={{ fontSize: 16 }} />} label="Perfil" value="perfil" />
					<Tab icon={<HistoryIcon style={{ fontSize: 16 }} />} label="Atend." value="atendimentos" />
					<Tab icon={<TuneIcon style={{ fontSize: 16 }} />} label="Gestão" value="gestao" />
				</Tabs>

				{loading ? (
					<ContactDrawerSkeleton classes={classes} />
				) : (
					<div className={classes.content}>

						{/* ===== PERFIL ===== */}
						<TabPanel value={tab} name="perfil">
							{/* Avatar + nome */}
							<div className={classes.profileSection}>
								<div style={{ position: "relative", display: "inline-block" }}>
									<Avatar
										src={profilePicUrl}
										alt={contact?.name}
										className={classes.avatar}
									/>
									<Tooltip title="Sincronizar foto com WhatsApp">
										<IconButton
											size="small"
											onClick={handleSyncWhatsapp}
											disabled={syncing}
											style={{
												position: "absolute",
												bottom: -4,
												right: -4,
												backgroundColor: "#fff",
												border: "1px solid #ddd",
												padding: 3,
											}}
										>
											{syncing
												? <CircularProgress size={12} />
												: <SyncIcon style={{ fontSize: 14 }} />}
										</IconButton>
									</Tooltip>
								</div>
								<Typography className={classes.contactName}>{contact?.name}</Typography>
								<Button
									size="small"
									variant="outlined"
									color="primary"
									startIcon={<EditIcon style={{ fontSize: 14 }} />}
									className={classes.editBtn}
									onClick={() => setModalOpen(true)}
								>
									{i18n.t("contactDrawer.buttons.edit")}
								</Button>
							</div>

							<Divider />

							{/* Dados de contato */}
							<div className={classes.infoBlock}>
								<div className={classes.sectionLabel}>Contato</div>
								<InfoRow icon={PhoneIcon} label="Telefone" value={contact?.number} link={`tel:${contact?.number}`} classes={classes} />
								<InfoRow icon={EmailIcon} label="E-mail" value={contact?.email} link={`mailto:${contact?.email}`} classes={classes} />
							</div>

							{/* Etiquetas */}
							{ticket && (
								<>
									<Divider />
									<div className={classes.tagsSection}>
										<div className={classes.sectionLabel}>
											<LabelIcon style={{ fontSize: 11, verticalAlign: "middle", marginRight: 4 }} />
											Etiquetas
										</div>
										<TagsContainer ticket={ticket} />
									</div>
								</>
							)}

							{/* Agendamentos / Notas */}
							{ticket && (
								<>
									<Divider />
									<div className={classes.notesSection}>
										<div className={classes.sectionLabel}>
											<EventNoteIcon style={{ fontSize: 11, verticalAlign: "middle", marginRight: 4 }} />
											{i18n.t("ticketOptionsMenu.appointmentsModal.title")}
										</div>
										<ContactNotes ticket={ticket} />
									</div>
								</>
							)}
						</TabPanel>

						{/* ===== ATENDIMENTOS ===== */}
						<TabPanel value={tab} name="atendimentos">
							<div className={classes.infoBlock}>
								<div className={classes.sectionLabel}>Histórico de atendimentos</div>
							</div>
							{historyLoading ? (
								<div style={{ display: "flex", justifyContent: "center", padding: 24 }}>
									<CircularProgress size={28} />
								</div>
							) : ticketHistory.length === 0 ? (
								<Typography style={{ padding: "8px 12px", fontSize: "0.82rem", color: "#888" }}>
									Nenhum atendimento encontrado.
								</Typography>
							) : (
								ticketHistory.map(t => (
									<div key={t.id} className={classes.ticketHistoryItem}>
										<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
											<Typography style={{ fontSize: "0.78rem", fontWeight: 600 }}>
												#{t.id} — {t.queue?.name || "Sem fila"}
											</Typography>
											<span className={`${classes.ticketStatus} ${classes[statusClass[t.status]]}`}>
												{statusLabel[t.status] || t.status}
											</span>
										</div>
										<Typography style={{ fontSize: "0.72rem", color: "#888" }}>
											{t.lastMessage
												? t.lastMessage.substring(0, 60) + (t.lastMessage.length > 60 ? "…" : "")
												: "Sem mensagens"}
										</Typography>
										{t.updatedAt && (
											<Typography style={{ fontSize: "0.68rem", color: "#aaa", marginTop: 2 }}>
												{format(parseISO(t.updatedAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
											</Typography>
										)}
									</div>
								))
							)}
						</TabPanel>

						{/* ===== GESTÃO ===== */}
						<TabPanel value={tab} name="gestao">
							<div className={classes.infoBlock}>
								<div className={classes.sectionLabel}>{i18n.t("contactDrawer.extraInfo")}</div>
							</div>
							{contact?.extraInfo?.length > 0 ? (
								contact.extraInfo.map(info => (
									<Paper
										key={info.id}
										square
										variant="outlined"
										className={classes.extraInfoItem}
									>
										<InputLabel style={{ fontSize: "0.72rem" }}>{info.name}</InputLabel>
										<Typography component="div" noWrap style={{ paddingTop: 2, fontSize: "0.84rem" }}>
											<MarkdownWrapper>{info.value}</MarkdownWrapper>
										</Typography>
									</Paper>
								))
							) : (
								<Typography style={{ padding: "0 12px 12px", fontSize: "0.82rem", color: "#888" }}>
									Nenhuma informação extra cadastrada.
								</Typography>
							)}
						</TabPanel>

					</div>
				)}
			</Drawer>
		</>
	);
};

export default ContactDrawer;
