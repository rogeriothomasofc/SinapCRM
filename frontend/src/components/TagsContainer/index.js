import { Chip, TextField, makeStyles } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import React, { useEffect, useRef, useState } from "react";
import { isArray, isString } from "lodash";
import toastError from "../../errors/toastError";
import api from "../../services/api";

const useStyles = makeStyles((theme) => ({
  autocomplete: {
    marginTop: '-4px',
    '& .MuiAutocomplete-inputRoot': {
      padding: '0px 2px',
      minHeight: '24px',
    },
    '& .MuiAutocomplete-input': {
      minWidth: '40px !important',
      padding: '1px 2px !important',
      fontSize: '0.7rem',
    },
    '& .MuiOutlinedInput-notchedOutline': {
      border: 'none',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      border: 'none',
    },
    '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
      border: 'none',
    },
    '& .MuiAutocomplete-listbox': {
      '& .MuiAutocomplete-option': {
        minHeight: '28px',
        fontSize: '0.75rem',
      }
    }
  },
  tag: {
    height: '14px',
    margin: '0px 1px',
    fontWeight: 500,
    borderRadius: 2,
    fontSize: "0.6rem",
    textTransform: 'uppercase',
    border: 'none',
    '& .MuiChip-label': {
      padding: '0 4px',
      lineHeight: '14px',
    },
    '& .MuiChip-deleteIcon': {
      width: '12px',
      height: '12px',
      marginLeft: '1px',
      marginRight: '1px',
    }
  },
  dropdown: {
    maxWidth: '90vw',
    [theme.breakpoints.up('sm')]: {
      minWidth: 300,
      maxWidth: 400,
    }
  }
}));

export function TagsContainer({ ticket }) {
  const classes = useStyles();
  const [tags, setTags] = useState([]);
  const [selecteds, setSelecteds] = useState([]);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (isMounted.current) {
      loadTags().then(() => {
        if (Array.isArray(ticket.tags)) {
          setSelecteds(ticket.tags);
        } else {
          setSelecteds([]);
        }
      });
    }
  }, [ticket]);

  const createTag = async (data) => {
    try {
      const { data: responseData } = await api.post(`/tags`, data);
      return responseData;
    } catch (err) {
      toastError(err);
    }
  };

  const loadTags = async () => {
    try {
      const { data } = await api.get(`/tags/list`);
      setTags(data);
    } catch (err) {
      toastError(err);
    }
  };

  const syncTags = async (data) => {
    try {
      const { data: responseData } = await api.post(`/tags/sync`, data);
      return responseData;
    } catch (err) {
      toastError(err);
    }
  };

  const onChange = async (value, reason) => {
    let optionsChanged = [];
    if (reason === "create-option") {
      if (isArray(value)) {
        for (let item of value) {
          if (isString(item)) {
            const newTag = await createTag({ name: item });
            optionsChanged.push(newTag);
          } else {
            optionsChanged.push(item);
          }
        }
      }
      await loadTags();
    } else {
      optionsChanged = value;
    }
    setSelecteds(optionsChanged);
    await syncTags({ ticketId: ticket.id, tags: optionsChanged });
  };

  const getContrastColor = (hexColor) => {
    // Se não tiver cor, retorna preto
    if (!hexColor) return '#000';
    
    // Remove # se existir
    const hex = hexColor.replace('#', '');
    
    // Converte para RGB
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calcula luminância
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Retorna branco para cores escuras, preto para cores claras
    return luminance > 0.5 ? '#000' : '#FFF';
  };

  return (
    <Autocomplete
      multiple
      size="small"
      options={tags}
      value={selecteds}
      freeSolo
      onChange={(e, v, r) => onChange(v, r)}
      getOptionLabel={(option) => option.name}
      className={classes.autocomplete}
      renderTags={(value, getTagProps) =>
        value.map((option, index) => (
          <Chip
            key={index}
            className={classes.tag}
            style={{
              backgroundColor: option.color || '#e0e0e0',
              color: getContrastColor(option.color),
            }}
            label={option.name}
            {...getTagProps({ index })}
            size="small"
          />
        ))
      }
      renderInput={(params) => (
        <TextField 
          {...params} 
          variant="outlined" 
          placeholder="+"
          size="small"
        />
      )}
      PaperComponent={({ children }) => (
        <div className={classes.dropdown}>
          {children}
        </div>
      )}
    />
  );
}