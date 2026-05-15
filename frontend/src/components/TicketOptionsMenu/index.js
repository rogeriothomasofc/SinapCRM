import React, { useContext, useEffect, useRef, useState } from "react";
import { 
  MenuItem, 
  Menu, 
  ListItemIcon, 
  ListItemText, 
  Divider,
  Fade,
  makeStyles
} from "@material-ui/core";

// Ícones modernos escolhidos
import EventIcon from "@material-ui/icons/Event"; // Calendário para agendar
import SwapHorizIcon from "@material-ui/icons/SwapHoriz"; // Setas para transferir
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline"; // Lixeira outline

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import ConfirmationModal from "../ConfirmationModal";
import TransferTicketModalCustom from "../TransferTicketModalCustom";
import toastError from "../../errors/toastError";
import { Can } from "../Can";
import { AuthContext } from "../../context/Auth/AuthContext";
import ScheduleModal from "../ScheduleModal";

const useStyles = makeStyles(theme => ({
  menu: {
    "& .MuiPaper-root": {
      borderRadius: 12,
      marginTop: 8,
      minWidth: 200,
      backgroundColor: theme.palette.background.paper,
      boxShadow: "0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)",
      border: `1px solid ${theme.palette.divider}`,
      "& .MuiList-root": {
        padding: 8,
      }
    }
  },
  
  menuItem: {
    borderRadius: 6,
    margin: "2px 0",
    padding: "8px 12px",
    minHeight: 40,
    transition: "all 0.2s ease",
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
      transform: "translateX(2px)",
      "& .MuiListItemIcon-root": {
        color: theme.palette.primary.main,
        transform: "scale(1.1)",
      }
    },
    "&:active": {
      transform: "scale(0.98)",
    }
  },
  
  menuItemDelete: {
    "&:hover": {
      backgroundColor: theme.palette.error.main + "15",
      "& .MuiListItemIcon-root": {
        color: theme.palette.error.main,
      },
      "& .MuiListItemText-primary": {
        color: theme.palette.error.main,
      }
    }
  },
  
  listItemIcon: {
    minWidth: 36,
    color: theme.palette.text.secondary,
    transition: "all 0.2s ease",
    "& .MuiSvgIcon-root": {
      fontSize: 20,
    }
  },
  
  listItemText: {
    "& .MuiListItemText-primary": {
      fontSize: "0.875rem",
      fontWeight: 500,
      color: theme.palette.text.primary,
    }
  },
  
  divider: {
    margin: "4px 8px",
    backgroundColor: theme.palette.divider,
  }
}));

const TicketOptionsMenu = ({ ticket, menuOpen, handleClose, anchorEl }) => {
  const classes = useStyles();
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [transferTicketModalOpen, setTransferTicketModalOpen] = useState(false);
  const isMounted = useRef(true);
  const { user } = useContext(AuthContext);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [contactId, setContactId] = useState(null);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleDeleteTicket = async () => {
    try {
      await api.delete(`/tickets/${ticket.id}`);
    } catch (err) {
      toastError(err);
    }
  };

  const handleOpenConfirmationModal = e => {
    setConfirmationOpen(true);
    handleClose();
  };

  const handleOpenTransferModal = e => {
    setTransferTicketModalOpen(true);
    handleClose();
  };

  const handleCloseTransferTicketModal = () => {
    if (isMounted.current) {
      setTransferTicketModalOpen(false);
    }
  };

  const handleOpenScheduleModal = () => {
    handleClose();
    setContactId(ticket.contact.id);
    setScheduleModalOpen(true);
  };

  const handleCloseScheduleModal = () => {
    setScheduleModalOpen(false);
    setContactId(null);
  };

  return (
    <>
      <Menu
        id="menu-appbar"
        anchorEl={anchorEl}
        getContentAnchorEl={null}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        keepMounted
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        open={menuOpen}
        onClose={handleClose}
        className={classes.menu}
        TransitionComponent={Fade}
        TransitionProps={{ timeout: 200 }}
      >
        <MenuItem 
          onClick={handleOpenScheduleModal}
          className={classes.menuItem}
        >
          <ListItemIcon className={classes.listItemIcon}>
            <EventIcon />
          </ListItemIcon>
          <ListItemText 
            primary={i18n.t("ticketOptionsMenu.schedule")}
            className={classes.listItemText}
          />
        </MenuItem>
        
        <MenuItem 
          onClick={handleOpenTransferModal}
          className={classes.menuItem}
        >
          <ListItemIcon className={classes.listItemIcon}>
            <SwapHorizIcon />
          </ListItemIcon>
          <ListItemText 
            primary={i18n.t("ticketOptionsMenu.transfer")}
            className={classes.listItemText}
          />
        </MenuItem>
        
        <Can
          role={user.profile}
          perform="ticket-options:deleteTicket"
          yes={() => (
            <>
              <Divider className={classes.divider} />
              <MenuItem 
                onClick={handleOpenConfirmationModal}
                className={`${classes.menuItem} ${classes.menuItemDelete}`}
              >
                <ListItemIcon className={classes.listItemIcon}>
                  <DeleteOutlineIcon />
                </ListItemIcon>
                <ListItemText 
                  primary={i18n.t("ticketOptionsMenu.delete")}
                  className={classes.listItemText}
                />
              </MenuItem>
            </>
          )}
        />
      </Menu>
      
      <ConfirmationModal
        title={`${i18n.t("ticketOptionsMenu.confirmationModal.title")}${
          ticket.id
        } ${i18n.t("ticketOptionsMenu.confirmationModal.titleFrom")} ${
          ticket.contact.name
        }?`}
        open={confirmationOpen}
        onClose={setConfirmationOpen}
        onConfirm={handleDeleteTicket}
      >
        {i18n.t("ticketOptionsMenu.confirmationModal.message")}
      </ConfirmationModal>
      
      <TransferTicketModalCustom
        modalOpen={transferTicketModalOpen}
        onClose={handleCloseTransferTicketModal}
        ticketid={ticket.id}
      />
      
      <ScheduleModal
        open={scheduleModalOpen}
        onClose={handleCloseScheduleModal}
        aria-labelledby="form-dialog-title"
        contactId={contactId}
      />
    </>
  );
};

export default TicketOptionsMenu;