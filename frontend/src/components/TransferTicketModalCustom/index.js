import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress,
  Avatar,
  Typography,
  Box,
  Chip,
  makeStyles,
  Fade,
  InputAdornment
} from "@material-ui/core";
import Autocomplete, { createFilterOptions } from "@material-ui/lab/Autocomplete";

// Ícones
import SearchIcon from "@material-ui/icons/Search";
import PersonOutlineIcon from "@material-ui/icons/PersonOutline";
import CheckCircleOutlineIcon from "@material-ui/icons/CheckCircleOutline";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import ButtonWithSpinner from "../ButtonWithSpinner";
import toastError from "../../errors/toastError";

const filterOptions = createFilterOptions({
  trim: true,
});

const useStyles = makeStyles(theme => ({
  dialog: {
    "& .MuiDialog-paper": {
      borderRadius: 12,
      boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
    }
  },
  
  dialogTitle: {
    padding: "24px 24px 20px",
    "& .MuiTypography-h6": {
      fontSize: "1.125rem",
      fontWeight: 600,
      color: theme.palette.text.primary,
    }
  },
  
  dialogContent: {
    padding: "16px 24px 24px",
  },
  
  autocomplete: {
    "& .MuiOutlinedInput-root": {
      borderRadius: 10,
      backgroundColor: theme.palette.background.default,
      transition: "all 0.3s ease",
      "&:hover": {
        backgroundColor: theme.palette.action.hover,
      },
      "&.Mui-focused": {
        backgroundColor: theme.palette.background.paper,
        boxShadow: `0 0 0 3px ${theme.palette.primary.main}20`,
      }
    },
    "& .MuiInputLabel-root": {
      fontSize: "0.875rem",
    }
  },
  
  listbox: {
    padding: 8,
    "& .MuiAutocomplete-option": {
      borderRadius: 8,
      margin: "2px 0",
      padding: "10px 12px",
      transition: "all 0.2s ease",
      "&:hover": {
        backgroundColor: theme.palette.primary.main + "10",
      },
      '&[aria-selected="true"]': {
        backgroundColor: theme.palette.primary.main + "15",
      }
    }
  },
  
  userOption: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    width: "100%",
  },
  
  avatar: {
    width: 40,
    height: 40,
    fontSize: "0.875rem",
    fontWeight: 700,
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  },
  
  userInfo: {
    flex: 1,
    overflow: "hidden",
  },
  
  userName: {
    fontWeight: 600,
    fontSize: "0.875rem",
    lineHeight: 1.4,
    color: theme.palette.text.primary,
  },
  
  userEmail: {
    fontSize: "0.75rem",
    color: theme.palette.text.secondary,
    lineHeight: 1.4,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  
  onlineChip: {
    height: 18,
    fontSize: "0.65rem",
    fontWeight: 700,
    backgroundColor: "#4caf50",
    color: "#fff",
  },
  
  selectedBox: {
    marginTop: 16,
    padding: 14,
    borderRadius: 10,
    backgroundColor: theme.palette.success.main + "10",
    border: `1.5px solid ${theme.palette.success.main}30`,
    display: "flex",
    alignItems: "center",
    gap: 10,
    animation: "$slideIn 0.3s ease",
  },
  
  "@keyframes slideIn": {
    from: {
      opacity: 0,
      transform: "translateY(-8px)",
    },
    to: {
      opacity: 1,
      transform: "translateY(0)",
    }
  },
  
  selectedIcon: {
    color: theme.palette.success.main,
    fontSize: 20,
  },
  
  selectedText: {
    fontSize: "0.8125rem",
    color: theme.palette.text.primary,
    "& strong": {
      fontWeight: 700,
      color: theme.palette.success.main,
    }
  },
  
  dialogActions: {
    padding: "16px 24px",
    backgroundColor: theme.palette.background.default,
    borderTop: `1px solid ${theme.palette.divider}`,
    gap: 10,
  },
  
  cancelButton: {
    borderRadius: 8,
    textTransform: "none",
    fontWeight: 500,
    color: theme.palette.text.secondary,
    borderColor: theme.palette.divider,
    "&:hover": {
      borderColor: theme.palette.text.secondary,
      backgroundColor: theme.palette.action.hover,
    }
  },
  
  transferButton: {
    borderRadius: 8,
    textTransform: "none",
    fontWeight: 600,
    padding: "6px 20px",
    boxShadow: "none",
    "&:hover": {
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    }
  },
  
  searchIcon: {
    color: theme.palette.text.disabled,
    fontSize: 20,
  },
  
  emptyIcon: {
    color: theme.palette.text.disabled,
    fontSize: 18,
  }
}));

const TransferTicketModal = ({ modalOpen, onClose, ticketid }) => {
  const classes = useStyles();
  const history = useHistory();
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    if (!modalOpen || searchParam.length < 3) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchUsers = async () => {
        try {
          const { data } = await api.get("/users/", {
            params: { searchParam },
          });
          setOptions(data.users);
          setLoading(false);
        } catch (err) {
          setLoading(false);
          toastError(err);
        }
      };
      fetchUsers();
    }, 500);
    
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, modalOpen]);

  const handleClose = () => {
    onClose();
    setSearchParam("");
    setSelectedUser(null);
    setOptions([]);
  };

  const handleSaveTicket = async e => {
    e.preventDefault();
    if (!ticketid || !selectedUser) return;
    
    setLoading(true);
    try {
      await api.put(`/tickets/${ticketid}`, {
        userId: selectedUser.id,
        queueId: null,
        status: "open",
      });
      setLoading(false);
      history.push(`/tickets`);
    } catch (err) {
      setLoading(false);
      toastError(err);
    }
  };

  const renderUserOption = (option) => (
    <div className={classes.userOption}>
      <Avatar className={classes.avatar}>
        {option.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
      </Avatar>
      <div className={classes.userInfo}>
        <Typography className={classes.userName}>
          {option.name}
          {option.online && (
            <Chip
              label="Online"
              className={classes.onlineChip}
              style={{ marginLeft: 8 }}
            />
          )}
        </Typography>
        <Typography className={classes.userEmail}>
          {option.email}
        </Typography>
      </div>
    </div>
  );

  return (
    <Dialog
      open={modalOpen}
      onClose={handleClose}
      className={classes.dialog}
      maxWidth="sm"
      fullWidth
      TransitionComponent={Fade}
      TransitionProps={{ timeout: 400 }}
    >
      <form onSubmit={handleSaveTicket}>
        <DialogTitle className={classes.dialogTitle}>
          {i18n.t("transferTicketModal.title")}
        </DialogTitle>
        
        <DialogContent className={classes.dialogContent}>
          <Autocomplete
            className={classes.autocomplete}
            classes={{ listbox: classes.listbox }}
            getOptionLabel={option => option.name || ""}
            value={selectedUser}
            onChange={(e, newValue) => setSelectedUser(newValue)}
            options={options}
            filterOptions={filterOptions}
            freeSolo
            autoHighlight
            noOptionsText={
              <Box display="flex" alignItems="center" gap={1} p={1}>
                <PersonOutlineIcon className={classes.emptyIcon} />
                <Typography variant="body2" color="textSecondary">
                  {searchParam.length < 3 
                    ? "Digite pelo menos 3 caracteres" 
                    : i18n.t("transferTicketModal.noOptions")
                  }
                </Typography>
              </Box>
            }
            loading={loading}
            renderOption={renderUserOption}
            renderInput={params => (
              <TextField
                {...params}
                label={i18n.t("transferTicketModal.fieldLabel")}
                placeholder="Buscar por nome..."
                variant="outlined"
                required
                autoFocus
                fullWidth
                onChange={e => setSearchParam(e.target.value)}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon className={classes.searchIcon} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <React.Fragment>
                      {loading ? (
                        <CircularProgress color="inherit" size={20} />
                      ) : null}
                      {params.InputProps.endAdornment}
                    </React.Fragment>
                  ),
                }}
              />
            )}
          />
          
          {selectedUser && (
            <Fade in={true}>
              <Box className={classes.selectedBox}>
                <CheckCircleOutlineIcon className={classes.selectedIcon} />
                <Typography className={classes.selectedText}>
                  Transferindo para <strong>{selectedUser.name}</strong>
                </Typography>
              </Box>
            </Fade>
          )}
        </DialogContent>
        
        <DialogActions className={classes.dialogActions}>
          <Button
            onClick={handleClose}
            disabled={loading}
            variant="outlined"
            className={classes.cancelButton}
          >
            {i18n.t("transferTicketModal.buttons.cancel")}
          </Button>
          <ButtonWithSpinner
            variant="contained"
            type="submit"
            color="primary"
            loading={loading}
            disabled={!selectedUser}
            className={classes.transferButton}
          >
            Transferir Ticket
          </ButtonWithSpinner>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TransferTicketModal;