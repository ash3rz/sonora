import React, { useState, useEffect, useCallback } from "react";

import {
    Badge,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    List,
    ListItem,
    ListItemAvatar,
    Avatar,
    ListItemText,
    ListItemSecondaryAction,
    makeStyles,
    MenuItem,
    Button,
    useMediaQuery,
    Select,
    Typography,
    FormControl,
    InputLabel,
} from "@material-ui/core";
import {
    Delete,
    GetApp,
    People,
    Clear,
    ClearAll,
    Close,
    ShoppingBasket as ShoppingBasketIcon,
} from "@material-ui/icons";

import { build as buildID } from "@cyverse-de/ui-lib";

import constants from "./constants";

import withErrorAnnouncer from "../utils/error/withErrorAnnouncer";

import SharingView from "../sharing";

import * as facade from "../../serviceFacades/bags";
import { Skeleton } from "@material-ui/lab";
import { TYPE as SHARING_TYPE } from "components/sharing/util";

import {
    createNewBagItem,
    FILE_TYPE,
    FOLDER_TYPE,
    ANALYSIS_TYPE,
    APP_TYPE,
} from "./classes";
import { useTranslation } from "i18n";
import { useTheme } from "@material-ui/styles";
import { useUserProfile } from "contexts/userProfile";

const useStyles = makeStyles((theme) => ({
    help: {
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(1),
    },
    paper: {
        width: theme.spacing(60),
        height: theme.spacing(70),
    },
    closeButton: {
        position: "absolute",
        right: theme.spacing(1),
        top: theme.spacing(1),
    },
    button: {
        margin: theme.spacing(2),
        width: theme.spacing(20),

        [theme.breakpoints.down("sm")]: {
            // width: "100%",
            margin: theme.spacing(1),
            width: theme.spacing(20),
        },
    },
    actionContainer: {
        display: "flex",
        flexFlow: "row wrap",
        justifyContent: "flex-end",
    },
    formControl: {
        minWidth: theme.spacing(20),
    },
}));

const BagSkeleton = () => (
    <Skeleton variant="rect" animation="wave" height={100} width="100%" />
);

export const BagUI = ({ removeItem, allItems, isLoading }) => {
    const { t } = useTranslation(["bags", "common"]);

    const classes = useStyles();
    const [filterBy, setFilterBy] = useState(constants.FILTERBY.ALL);

    const [bagItems, setBagItems] = useState([]);

    useEffect(() => {
        switch (filterBy) {
            case constants.FILTERBY.SHAREABLE:
                setBagItems(allItems.filter((item) => item.shareable));
                break;

            case constants.FILTERBY.DOWNLOADABLE:
                setBagItems(allItems.filter((item) => item.downloadable));
                break;

            case constants.FILTERBY.ALL:
            default:
                setBagItems(allItems);
                break;
        }
    }, [allItems, filterBy, setBagItems]);

    const handleFilterChange = (event) => {
        setFilterBy(event.target.value);
    };

    const baseID = buildID(constants.BASEID, constants.DIALOG);
    const filterID = buildID(baseID, constants.FILTER);
    const filterLabelID = buildID(filterID, constants.LABEL);
    const selectID = buildID(filterID, constants.SELECT);
    const listID = buildID(baseID, constants.LIST);

    return (
        <>
            {isLoading ? (
                <BagSkeleton />
            ) : (
                <>
                    <FormControl className={classes.formControl}>
                        <InputLabel id={filterLabelID}>{t("show")}</InputLabel>
                        <Select
                            labelId={filterLabelID}
                            id={selectID}
                            value={filterBy}
                            onChange={handleFilterChange}
                        >
                            <MenuItem
                                value={constants.FILTERBY.ALL}
                                id={buildID(selectID, constants.FILTERBY.ALL)}
                            >
                                {t("all")}
                            </MenuItem>

                            <MenuItem
                                value={constants.FILTERBY.DOWNLOADABLE}
                                id={buildID(
                                    selectID,
                                    constants.FILTERBY.DOWNLOADABLE
                                )}
                            >
                                {t("downloadable")}
                            </MenuItem>

                            <MenuItem
                                value={constants.FILTERBY.SHAREABLE}
                                id={buildID(
                                    selectID,
                                    constants.FILTERBY.SHAREABLE
                                )}
                            >
                                {t("shareable")}
                            </MenuItem>
                        </Select>
                    </FormControl>
                    <List id={listID}>
                        {bagItems.map((item, itemIndex) => {
                            const itemID = buildID(listID, itemIndex);
                            return (
                                <ListItem key={itemID} id={itemID}>
                                    <ListItemAvatar
                                        id={buildID(itemID, constants.AVATAR)}
                                    >
                                        <Avatar>{item.icon(t)}</Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={item.label}
                                        id={buildID(itemID, constants.LABEL)}
                                    />
                                    <ListItemSecondaryAction>
                                        <IconButton
                                            edge="end"
                                            aria-label={t("delete")}
                                            id={buildID(
                                                itemID,
                                                constants.DELETE
                                            )}
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                event.preventDefault();
                                                removeItem(item);
                                            }}
                                        >
                                            <Delete />
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            );
                        })}
                    </List>
                </>
            )}
        </>
    );
};

const defaultSharingResources = () => ({
    [SHARING_TYPE.TOOLS]: [],
    [SHARING_TYPE.APPS]: [],
    [SHARING_TYPE.DATA]: [],
    [SHARING_TYPE.ANALYSES]: [],
    unknown: [],
});

const Bag = ({ menuIconClass, showErrorAnnouncer }) => {
    const theme = useTheme();
    const classes = useStyles();
    const { t } = useTranslation(["bags", "common"]);
    const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

    const [badgeCount, setBadgeCount] = useState(0);
    const [allItems, setAllItems] = useState([]);

    const [bagDlgOpen, setBagDlgOpen] = useState(false);
    const [sharingOpen, setSharingOpen] = useState(false);
    const [sharingResources, setSharingResources] = useState(
        defaultSharingResources()
    );

    const [userProfile] = useUserProfile();

    if (!menuIconClass) {
        menuIconClass = classes.menuIcon;
    }

    // Convert the items into a map that the sharing dialog understands.
    const sharingReducer = useCallback((acc, curr) => {
        const newObj = { ...curr.item };

        switch (newObj.type) {
            case FILE_TYPE:
            case FOLDER_TYPE:
                acc[SHARING_TYPE.DATA] = [...acc.paths, newObj];
                break;
            case APP_TYPE:
                acc[SHARING_TYPE.APPS] = [...acc.apps, newObj];
                break;
            case ANALYSIS_TYPE:
                acc[SHARING_TYPE.ANALYSES] = [...acc.analyses, newObj];
                break;
            default:
                acc.unknown = [...acc.unknown, newObj];
                break;
        }
        return acc;
    }, []);

    const convertItems = useCallback(
        (data) => {
            let converted = [];

            if (data?.contents?.items) {
                converted = data.contents.items.map((item) =>
                    createNewBagItem(item)
                );
            }

            setAllItems(converted);

            setSharingResources(
                converted.reduce(sharingReducer, defaultSharingResources())
            );
        },
        [sharingReducer]
    );

    const { isError: hasErrored, data, isLoading, error } = facade.useBag({
        enabled: userProfile,
        onSuccess: convertItems,
    });

    const removeItem = facade.useBagRemoveItem({
        handleError: (error) => {
            showErrorAnnouncer(t("removeItemError"), error);
        },
    });

    const clearAll = facade.useBagRemoveItems({
        handleError: (error) => {
            showErrorAnnouncer(t("removeAllItemsError"), error);
        },
    });

    useEffect(() => {
        if (hasErrored) {
            showErrorAnnouncer(t("fetchBagError"), error);
        }
    }, [hasErrored, error, showErrorAnnouncer, t]);

    useEffect(() => {
        convertItems(data);
    }, [data, convertItems]);

    useEffect(() => {
        setBadgeCount(allItems.length);
    }, [allItems, setBadgeCount]);

    const handleSharingClick = (event) => {
        event.preventDefault();
        event.stopPropagation();

        setBagDlgOpen(false);
        setSharingOpen(true);
    };

    const handleMenuClick = (event) => {
        event.preventDefault();
        event.stopPropagation();

        setBagDlgOpen(!bagDlgOpen);
    };

    const handleClose = (event) => {
        event.preventDefault();
        event.stopPropagation();

        setBagDlgOpen(false);
    };

    const dialogID = buildID(constants.BASEID, constants.DIALOG);
    return (
        <>
            <IconButton
                className={menuIconClass}
                onClick={handleMenuClick}
                id={buildID(constants.BASEID, constants.MENU)}
            >
                <Badge
                    badgeContent={badgeCount}
                    invisible={badgeCount < 1}
                    color="error"
                    id={buildID(
                        constants.BASEID,
                        constants.MENU,
                        constants.BADGE
                    )}
                >
                    <ShoppingBasketIcon />
                </Badge>
            </IconButton>

            <Dialog
                fullScreen={fullScreen}
                open={bagDlgOpen}
                onClose={handleClose}
                classes={{ paper: classes.paper }}
                id={dialogID}
            >
                <DialogTitle id={buildID(dialogID, constants.TITLE)}>
                    {t("yourItemBag")}

                    <Typography
                        component="p"
                        variant="body1"
                        color="textSecondary"
                        classes={{ root: classes.help }}
                        id={buildID(dialogID, constants.TITLE, constants.HELP)}
                    >
                        {t("bagHelp")}
                    </Typography>

                    <IconButton
                        onClick={handleClose}
                        className={classes.closeButton}
                        id={buildID(
                            dialogID,
                            constants.TITLE,
                            constants.CLOSE,
                            constants.button
                        )}
                    >
                        <Close />
                    </IconButton>
                </DialogTitle>

                <DialogContent dividers>
                    <BagUI
                        allItems={allItems}
                        isLoading={isLoading}
                        removeItem={removeItem}
                    />
                </DialogContent>

                <DialogActions>
                    {fullScreen ? (
                        <IconButton
                            onClick={() => clearAll()}
                            id={buildID(
                                dialogID,
                                constants.CLEARALL,
                                constants.BUTTON
                            )}
                        >
                            <ClearAll />
                        </IconButton>
                    ) : (
                        <Button
                            variant="contained"
                            color="default"
                            className={classes.button}
                            startIcon={<Clear />}
                            size="small"
                            onClick={() => clearAll()}
                            id={buildID(
                                dialogID,
                                constants.CLEARALL,
                                constants.BUTTON
                            )}
                        >
                            {t("clearBag")}
                        </Button>
                    )}

                    {fullScreen ? (
                        <IconButton
                            onClick={() => {}}
                            id={buildID(
                                dialogID,
                                constants.DOWNLOAD,
                                constants.BUTTON
                            )}
                        >
                            <GetApp />
                        </IconButton>
                    ) : (
                        <Button
                            variant="contained"
                            color="primary"
                            className={classes.button}
                            startIcon={<GetApp />}
                            onClick={() => {}}
                            disabled={true}
                            size="small"
                            id={buildID(
                                dialogID,
                                constants.DOWNLOAD,
                                constants.BUTTON
                            )}
                        >
                            {t("download")}
                        </Button>
                    )}

                    {fullScreen ? (
                        <IconButton
                            onClick={handleSharingClick}
                            id={buildID(
                                dialogID,
                                constants.SHARE,
                                constants.BUTTON
                            )}
                        >
                            <People />
                        </IconButton>
                    ) : (
                        <Button
                            variant="contained"
                            color="primary"
                            className={classes.button}
                            startIcon={<People />}
                            onClick={handleSharingClick}
                            size="small"
                            id={buildID(
                                dialogID,
                                constants.SHARE,
                                constants.BUTTON
                            )}
                        >
                            {t("share")}
                        </Button>
                    )}
                </DialogActions>
            </Dialog>

            <SharingView
                open={sharingOpen}
                onClose={() => {
                    setSharingOpen(false);
                }}
                resources={sharingResources}
            />
        </>
    );
};

export { FILE_TYPE, FOLDER_TYPE, ANALYSIS_TYPE, APP_TYPE };
export default withErrorAnnouncer(Bag);
