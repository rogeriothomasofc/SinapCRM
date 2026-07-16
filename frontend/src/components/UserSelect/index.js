import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import Chip from "@material-ui/core/Chip";
import Avatar from "@material-ui/core/Avatar";
import api from "../../services/api";
import toastError from "../../errors/toastError";

const useStyles = makeStyles(() => ({
  chips: { display: "flex", flexWrap: "wrap" },
  chip: { margin: 2 },
}));

const UserSelect = ({ selectedUserIds = [], onChange, title = "Atendentes" }) => {
  const classes = useStyles();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    api.get("/users/list")
      .then(({ data }) => setUsers(data))
      .catch(toastError);
  }, []);

  return (
    <FormControl fullWidth margin="dense" variant="outlined">
      <InputLabel shrink={selectedUserIds.length > 0}>{title}</InputLabel>
      <Select
        label={title}
        multiple
        value={selectedUserIds}
        onChange={e => onChange(e.target.value)}
        MenuProps={{
          anchorOrigin: { vertical: "bottom", horizontal: "left" },
          transformOrigin: { vertical: "top", horizontal: "left" },
          getContentAnchorEl: null,
        }}
        renderValue={selected => (
          <div className={classes.chips}>
            {selected.map(id => {
              const user = users.find(u => u.id === id);
              return user ? (
                <Chip
                  key={id}
                  avatar={
                    <Avatar src={user.avatarUrl || undefined}>
                      {user.name[0]}
                    </Avatar>
                  }
                  label={user.name}
                  className={classes.chip}
                  size="small"
                />
              ) : null;
            })}
          </div>
        )}
      >
        {users.map(user => (
          <MenuItem key={user.id} value={user.id}>
            <Avatar
              src={user.avatarUrl || undefined}
              style={{ width: 28, height: 28, marginRight: 8, fontSize: 13 }}
            >
              {user.name[0]}
            </Avatar>
            {user.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default UserSelect;
