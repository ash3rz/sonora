/**
 * @author psarando
 */
import React from "react";

import { useTranslation } from "i18n";
import ids from "../ids";

import { build } from "@cyverse-de/ui-lib";

import { ListItemIcon, ListItemText, MenuItem } from "@material-ui/core";

import { Delete as DeleteIcon } from "@material-ui/icons";

export default function DeleteMenuItem(props) {
    const { baseId, handleDelete, onClose } = props;

    const { t } = useTranslation("common");

    return (
        <MenuItem
            id={build(baseId, ids.DELETE)}
            onClick={() => {
                handleDelete();
                onClose();
            }}
        >
            <ListItemIcon>
                <DeleteIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={t("delete")} />
        </MenuItem>
    );
}
