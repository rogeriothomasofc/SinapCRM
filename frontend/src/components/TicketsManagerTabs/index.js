import React, { useContext, useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";

import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import SearchIcon from "@material-ui/icons/Search";
import InputBase from "@material-ui/core/InputBase";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Badge from "@material-ui/core/Badge";
import FolderOpenIcon from "@material-ui/icons/FolderOpen";
import CheckCircleOutlineIcon from "@material-ui/icons/CheckCircleOutline";
import AddCircleOutlineIcon from "@material-ui/icons/AddCircleOutline";
import AssignmentTurnedInIcon from "@material-ui/icons/AssignmentTurnedIn";
import HourglassEmptyIcon from "@material-ui/icons/HourglassEmpty";
import LocalOfferIcon from "@material-ui/icons/LocalOffer";
import PeopleOutlineIcon from "@material-ui/icons/PeopleOutline";
import FilterListIcon from "@material-ui/icons/FilterList";
import Chip from "@material-ui/core/Chip";
import Divider from "@material-ui/core/Divider";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";

import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";

import NewTicketModal from "../NewTicketModal";
import TicketsList from "../TicketsListCustom";
import TabPanel from "../TabPanel";

import { i18n } from "../../translate/i18n";
import { AuthContext } from "../../context/Auth/AuthContext";
import { Can } from "../Can";
import TicketsQueueSelect from "../TicketsQueueSelect";
import { TagsFilter } from "../TagsFilter";
import { UsersFilter } from "../UsersFilter";

const useStyles = makeStyles(theme => ({
	// Container principal - garante 100% altura e largura sem espaçamentos
	root: {
		height: "100%",
		width: "100%",
		padding: 0,
		margin: 0,
		display: "flex",
		flexDirection: "column",
	},

	// Wrapper principal do tickets
	ticketsWrapper: {
		position: "relative",
		display: "flex",
		height: "100%",
		width: "100%",
		flexDirection: "column",
		overflow: "hidden",
		//borderRadius: 0,
		backgroundColor: theme.palette.background.paper,
		boxShadow: "none",
		border: "none",
		// Controle total dos espaçamentos:
		marginTop: 0,
		marginRight: 0,    // 👈 Sem margem direita
		marginBottom: 0,
		marginLeft: 0,
		// Sem padding interno para colar nos componentes adjacentes
		padding: 0,
	},

	tabsHeader: {
		flex: "0 0 auto",
		backgroundColor: theme.palette.background.paper,
		borderBottom: `1px solid ${theme.palette.divider}`,
		height: 48,
		borderTopLeftRadius: 12,
		borderTopRightRadius: 0,
		"& .MuiTabs-root": {
			height: 48,
		},
		"& .MuiTabs-indicator": {
			height: 2,
		},
	},

	tabsInternal: {
		flex: "0 0 auto",
		backgroundColor: theme.palette.background.default,
		borderBottom: `1px solid ${theme.palette.divider}`,
		height: 40,
		"& .MuiTabs-root": {
			height: 40,
		},
		"& .MuiTabs-indicator": {
			height: 2,
		},
	},

	tab: {
		height: 48,
		minHeight: 0,
		minWidth: 100,
		padding: "4px 8px",
		textTransform: "none",
		fontWeight: 500,
		fontSize: "0.813rem",
		"& .MuiTab-wrapper": {
			flexDirection: "row",
			"& > *:first-child": {
				marginBottom: "0 !important",
				marginRight: 4,
			},
		},
		"&.Mui-selected": {
			fontWeight: 600,
		},
	},

	internalTab: {
		height: 40,
		minHeight: 0,
		minWidth: 100,
		padding: "2px 8px",
		textTransform: "none",
		fontWeight: 500,
		fontSize: "0.813rem",
		"& .MuiTab-wrapper": {
			flexDirection: "row",
			"& > *:first-child": {
				marginBottom: "0 !important",
				marginRight: 3,
			},
		},
		"&.Mui-selected": {
			fontWeight: 600,
		},
	},

	ticketOptionsBox: {
		flex: "0 0 auto",
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
		backgroundColor: theme.palette.background.default,
		padding: "6px 12px",
		borderBottom: `1px solid ${theme.palette.divider}`,
		gap: theme.spacing(0.5),
		height: 44,
	},

	serachInputWrapper: {
		flex: 1,
		display: "flex",
		alignItems: "center",
		borderRadius: 16,
		backgroundColor: theme.palette.background.paper,
		padding: "0 12px",
		height: 32,
		border: `1px solid ${theme.palette.divider}`,
		transition: "all 0.2s ease",
		"&:hover": {
			borderColor: theme.palette.text.secondary,
		},
		"&:focus-within": {
			borderColor: theme.palette.primary.main,
			boxShadow: `0 0 0 2px ${theme.palette.primary.main}25`,
		},
	},

	searchIcon: {
		color: theme.palette.text.secondary,
		fontSize: 18,
		marginRight: 8,
	},

	searchInput: {
		flex: 1,
		fontSize: "0.813rem",
		"& input": {
			padding: 0,
		},
	},

	newTicketButton: {
		minWidth: 32,
		width: 32,
		height: 32,
		padding: 0,
		borderRadius: "50%",
		"& .MuiIconButton-label": {
			fontSize: 20,
		},
	},

	badge: {
		"& .MuiBadge-badge": {
			fontSize: "0.7rem",
			height: 16,
			minWidth: 16,
			padding: "0 3px",
		},
	},

	ticketsListWrapper: {
		flex: 1,
		display: "flex",
		flexDirection: "column",
		overflow: "hidden",
		backgroundColor: theme.palette.background.default,
		borderBottomLeftRadius: 12,
		borderBottomRightRadius: 0,
		minHeight: 0,
		position: "relative",
	},

	filterSection: {
		flex: "0 0 auto",
		padding: "6px 12px",
		backgroundColor: theme.palette.background.paper,
		borderBottom: `1px solid ${theme.palette.divider}`,
		display: "flex",
		alignItems: "center",
		gap: theme.spacing(1),
		height: 36,
		"& .MuiFormControl-root": {
			minWidth: 140,
			maxWidth: 240,
		},
		"& .MuiOutlinedInput-root": {
			height: 28,
			fontSize: "0.813rem",
		},
		"& .MuiInputLabel-root": {
			fontSize: "0.813rem",
			transform: "translate(16px, 4px) scale(1)",
			"&.MuiInputLabel-shrink": {
				transform: "translate(16px, -7px) scale(0.7)",
			},
		},
		"& .MuiSelect-select": {
			paddingTop: 3,
			paddingBottom: 3,
		},
	},

	filterChip: {
		height: 28,
		fontSize: "0.813rem",
		"& .MuiChip-label": {
			padding: "0 8px",
		},
		"& .MuiChip-icon": {
			fontSize: 16,
			marginLeft: 4,
		},
		"& .MuiChip-deleteIcon": {
			fontSize: 18,
		},
	},

	compactSwitch: {
		marginLeft: "auto",
		"& .MuiFormControlLabel-label": {
			fontSize: "0.813rem",
			marginLeft: 4,
			whiteSpace: "nowrap",
		},
		"& .MuiSwitch-root": {
			width: 32,
			height: 18,
			padding: 0,
			"& .MuiSwitch-switchBase": {
				padding: 1,
				"&.Mui-checked": {
					transform: "translateX(14px)",
				},
			},
			"& .MuiSwitch-thumb": {
				width: 14,
				height: 14,
			},
		},
	},

	compactQueue: {
		"& .MuiFormControl-root": {
			minWidth: 110,
		},
		"& .MuiOutlinedInput-root": {
			height: 32,
			fontSize: "0.813rem",
		},
		"& .MuiInputLabel-root": {
			fontSize: "0.813rem",
		},
		"& .MuiSelect-icon": {
			fontSize: 20,
		},
	},
	
	tabIcon: {
		fontSize: 18,
	},
	
	chipIcon: {
		fontSize: 16,
	},
	
	filterIcon: {
		fontSize: 16,
	},
	
	buttonIcon: {
		fontSize: 18,
	},

	tabPanelContainer: {
		flex: 1,
		display: "flex",
		flexDirection: "column",
		overflow: "hidden",
		height: "100%",
	},
}));

const TicketsManagerTabs = () => {
	const classes = useStyles();
	const history = useHistory();

	const [searchParam, setSearchParam] = useState("");
	const [tab, setTab] = useState("open");
	const [tabOpen, setTabOpen] = useState("pending");
	const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
	const [showAllTickets, setShowAllTickets] = useState(false);
	const searchInputRef = useRef();
	const { user } = useContext(AuthContext);
	const { profile } = user;

	const [openCount, setOpenCount] = useState(0);
	const [pendingCount, setPendingCount] = useState(0);

	const userQueueIds = user.queues.map((q) => q.id);
	const [selectedQueueIds, setSelectedQueueIds] = useState(userQueueIds || []);
	const [selectedTags, setSelectedTags] = useState([]);
	const [selectedUsers, setSelectedUsers] = useState([]);

	useEffect(() => {
		if (user.profile.toUpperCase() === "ADMIN") {
			setShowAllTickets(true);
		}
	}, []);

	useEffect(() => {
		if (tab === "search") {
			searchInputRef.current.focus();
		}
	}, [tab]);

	let searchTimeout;

	const handleSearch = (e) => {
		const searchedTerm = e.target.value.toLowerCase();

		clearTimeout(searchTimeout);

		if (searchedTerm === "") {
			setSearchParam(searchedTerm);
			setTab("open");
			return;
		}

		searchTimeout = setTimeout(() => {
			setSearchParam(searchedTerm);
		}, 500);
	};

	const handleChangeTab = (e, newValue) => {
		setTab(newValue);
	};

	const handleChangeTabOpen = (e, newValue) => {
		setTabOpen(newValue);
	};

	const applyPanelStyle = (status) => {
		if (tabOpen !== status) {
			return { width: 0, height: 0, overflow: "hidden" };
		}
	};

	const handleCloseOrOpenTicket = (ticket) => {
		setNewTicketModalOpen(false);
		if (ticket !== undefined && ticket.uuid !== undefined) {
			history.push(`/tickets/${ticket.uuid}`);
		}
	};

	const handleSelectedTags = (selecteds) => {
		const tags = selecteds.map((t) => t.id);
		setSelectedTags(tags);
	};

	const handleSelectedUsers = (selecteds) => {
		const users = selecteds.map((t) => t.id);
		setSelectedUsers(users);
	};

	return (
		<div className={classes.root}>
			<NewTicketModal
				modalOpen={newTicketModalOpen}
				onClose={(ticket) => {
					handleCloseOrOpenTicket(ticket);
				}}
			/>
			
			{/* Paper principal sem espaçamentos extras */}
			<Paper elevation={0} className={classes.ticketsWrapper}>
				<Paper elevation={0} square className={classes.tabsHeader}>
					<Tabs
						value={tab}
						onChange={handleChangeTab}
						variant="fullWidth"
						indicatorColor="primary"
						textColor="primary"
					>
						<Tab
							value={"open"}
							icon={<FolderOpenIcon className={classes.tabIcon} />}
							label={i18n.t("tickets.tabs.open.title")}
							classes={{ root: classes.tab }}
						/>
						<Tab
							value={"closed"}
							icon={<CheckCircleOutlineIcon className={classes.tabIcon} />}
							label={i18n.t("tickets.tabs.closed.title")}
							classes={{ root: classes.tab }}
						/>
						<Tab
							value={"search"}
							icon={<FilterListIcon className={classes.tabIcon} />}
							label={i18n.t("tickets.tabs.search.title")}
							classes={{ root: classes.tab }}
						/>
					</Tabs>
				</Paper>
				
				<Paper square elevation={0} className={classes.ticketOptionsBox}>
					{tab === "search" ? (
						<div className={classes.serachInputWrapper}>
							<SearchIcon className={classes.searchIcon} />
							<InputBase
								className={classes.searchInput}
								inputRef={searchInputRef}
								placeholder={i18n.t("tickets.search.placeholder")}
								type="search"
								onChange={handleSearch}
							/>
						</div>
					) : (
						<>
							<Tooltip title={i18n.t("ticketsManager.buttons.newTicket")}>
								<IconButton
									color="primary"
									onClick={() => setNewTicketModalOpen(true)}
									className={classes.newTicketButton}
									size="small"
								>
									<AddCircleOutlineIcon className={classes.buttonIcon} />
								</IconButton>
							</Tooltip>
							
							<Divider orientation="vertical" flexItem style={{ margin: "0 5px" }} />
							
							<div className={classes.compactQueue}>
								<TicketsQueueSelect
									selectedQueueIds={selectedQueueIds}
									userQueues={user?.queues}
									onChange={(values) => setSelectedQueueIds(values)}
								/>
							</div>
							
							{selectedTags.length > 0 && (
								<>
									<Divider orientation="vertical" flexItem style={{ margin: "0 5px" }} />
									<Chip
										size="small"
										icon={<LocalOfferIcon className={classes.chipIcon} />}
										label={`${selectedTags.length} tags`}
										onDelete={() => setSelectedTags([])}
										className={classes.filterChip}
										color="primary"
										variant="outlined"
									/>
								</>
							)}
							
							{selectedUsers.length > 0 && (
								<Chip
									size="small"
									icon={<PeopleOutlineIcon className={classes.chipIcon} />}
									label={`${selectedUsers.length} users`}
									onDelete={() => setSelectedUsers([])}
									className={classes.filterChip}
									color="primary"
									variant="outlined"
								/>
							)}
							
							<Can
								role={user.profile}
								perform="tickets-manager:showall"
								yes={() => (
									<FormControlLabel
										className={classes.compactSwitch}
										label={i18n.t("tickets.buttons.showAll")}
										labelPlacement="end"
										control={
											<Switch
												size="small"
												checked={showAllTickets}
												onChange={() =>
													setShowAllTickets((prevState) => !prevState)
												}
												name="showAllTickets"
												color="primary"
											/>
										}
									/>
								)}
							/>
						</>
					)}
				</Paper>
				
				<div className={classes.ticketsListWrapper}>
					<TabPanel value={tab} name="open" className={classes.tabPanelContainer}>
						<Paper elevation={0} square className={classes.tabsInternal}>
							<Tabs
								value={tabOpen}
								onChange={handleChangeTabOpen}
								indicatorColor="primary"
								textColor="primary"
								variant="fullWidth"
							>
								<Tab
									icon={<HourglassEmptyIcon className={classes.tabIcon} />}
									label={
										<Badge
											className={classes.badge}
											badgeContent={pendingCount}
											color="secondary"
										>
											{i18n.t("ticketsList.pendingHeader")}
										</Badge>
									}
									value={"pending"}
									classes={{ root: classes.internalTab }}
								/>
								<Tab
									icon={<AssignmentTurnedInIcon className={classes.tabIcon} />}
									label={
										<Badge
											className={classes.badge}
											badgeContent={openCount}
											color="primary"
										>
											{i18n.t("ticketsList.assignedHeader")}
										</Badge>
									}
									value={"open"}
									classes={{ root: classes.internalTab }}
								/>
							</Tabs>
						</Paper>
						<Paper className={classes.tabPanelContainer} elevation={0}>
							<TicketsList
								status="pending"
								selectedQueueIds={selectedQueueIds}
								updateCount={(val) => setPendingCount(val)}
								style={applyPanelStyle("pending")}
							/>
							<TicketsList
								status="open"
								showAll={showAllTickets}
								selectedQueueIds={selectedQueueIds}
								updateCount={(val) => setOpenCount(val)}
								style={applyPanelStyle("open")}
							/>
						</Paper>
					</TabPanel>
					
					<TabPanel value={tab} name="closed" className={classes.tabPanelContainer}>
						<TicketsList
							status="closed"
							showAll={true}
							selectedQueueIds={selectedQueueIds}
						/>
					</TabPanel>
					
					<TabPanel value={tab} name="search" className={classes.tabPanelContainer}>
						<div className={classes.filterSection}>
							<FilterListIcon className={classes.filterIcon} color="action" />
							<Typography variant="caption" style={{ fontWeight: 600, fontSize: "0.875rem" }}>
								Filtros:
							</Typography>
							
							<div style={{ flex: 1, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
								<TagsFilter onFiltered={handleSelectedTags} />

								{profile === "admin" && (
									<>
										<Divider orientation="vertical" flexItem style={{ height: 20, alignSelf: "center" }} />
										<UsersFilter onFiltered={handleSelectedUsers} />
									</>
								)}
							</div>

							{(selectedTags.length > 0 || selectedUsers.length > 0) && (
								<>
									<Divider orientation="vertical" flexItem style={{ height: 20, alignSelf: "center" }} />
									<Button
										size="small"
										style={{ fontSize: "0.875rem", padding: "3px 8px", minHeight: 30 }}
										onClick={() => {
											setSelectedTags([]);
											setSelectedUsers([]);
										}}
									>
										Limpar
									</Button>
								</>
							)}
						</div>
						<TicketsList
							searchParam={searchParam}
							showAll={true}
							tags={selectedTags}
							users={selectedUsers}
							selectedQueueIds={selectedQueueIds}
						/>
					</TabPanel>
				</div>
			</Paper>
		</div>
	);
};

export default TicketsManagerTabs;