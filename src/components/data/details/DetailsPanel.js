/**
 * @author aramsey
 *
 * A component for displaying the details on a data resource.
 * Intended to be within a TabPanel.
 */
import React, { useState } from "react";

import { build, CopyTextArea, formatDate } from "@cyverse-de/ui-lib";
import {
    Button,
    Divider,
    Grid,
    makeStyles,
    MenuItem,
    Select,
} from "@material-ui/core";
import { Link } from "@material-ui/icons";

import { useTranslation } from "i18n";
import { queryCache, useMutation, useQuery } from "react-query";

import { getFileSize } from "../listing/FileSize";
import ids from "../ids";
import styles from "../styles";
import TagSearch from "../TagSearch";
import {
    getResourceDetails,
    updateInfoType,
    DATA_DETAILS_QUERY_KEY,
} from "../../../serviceFacades/filesystem";
import { getHost } from "components/utils/getHost";
import { useDataNavigationLink } from "components/data/utils";

import GridLabelValue from "../../utils/GridLabelValue";
import GridLoading from "../../utils/GridLoading";
import isQueryLoading from "../../utils/isQueryLoading";
import ErrorTypography from "../../utils/error/ErrorTypography";
import DEErrorDialog from "../../utils/error/DEErrorDialog";

const useStyles = makeStyles(styles);

function DetailsTabPanel(props) {
    const classes = useStyles();
    const {
        baseId,
        resource,
        infoTypes,
        setSelfPermission,
        onPublicLinksSelected,
    } = props;
    const { t } = useTranslation("data");
    const [details, setDetails] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);
    const [errorDialogOpen, setErrorDialogOpen] = useState(false);
    const [errorObject, setErrorObject] = useState(null);
    const partialLink = useDataNavigationLink(
        resource?.path,
        resource?.id,
        resource?.type
    )[1];

    const resourcePath = resource.path;

    const fetchDetailsKey = [DATA_DETAILS_QUERY_KEY, { paths: [resourcePath] }];

    const { isFetching } = useQuery({
        queryKey: fetchDetailsKey,
        queryFn: getResourceDetails,
        config: {
            enabled: true,
            onSuccess: (resp) => {
                const details = resp?.paths[resourcePath];
                setDetails(details);
                setSelfPermission(details?.permission);
            },
            onError: (e) => {
                setErrorMessage(t("detailsError"));
                setErrorObject(e);
            },
        },
    });

    const [changeInfoType, { status: updateInfoTypeStatus }] = useMutation(
        updateInfoType,
        {
            onSuccess: () => queryCache.invalidateQueries(fetchDetailsKey),
            onError: (e) => {
                setErrorMessage(t("updateInfoTypeError"));
                setErrorObject(e);
            },
        }
    );

    const onInfoTypeChange = (event) => {
        const type = event.target.value;
        changeInfoType({ path: resourcePath, infoType: type });
    };

    if (isQueryLoading([isFetching, updateInfoTypeStatus])) {
        return <GridLoading baseId={baseId} rows={10} />;
    }

    if (!details || errorMessage) {
        return (
            <>
                <ErrorTypography
                    errorMessage={errorMessage}
                    onDetailsClick={() => setErrorDialogOpen(true)}
                />
                <DEErrorDialog
                    open={errorDialogOpen}
                    baseId={baseId}
                    errorObject={errorObject}
                    handleClose={() => {
                        setErrorDialogOpen(false);
                    }}
                />
            </>
        );
    }

    const isFile = details.type !== "dir";
    return (
        <>
            <Grid container spacing={2}>
                {isFile && (
                    <GridLabelValue label={t("type")}>
                        {details["content-type"]}
                    </GridLabelValue>
                )}
                {isFile && (
                    <GridLabelValue
                        label={t("infoType")}
                        id={build(baseId, ids.INFO_TYPES, ids.LABEL)}
                    >
                        {infoTypes && infoTypes.length > 0 ? (
                            <Select
                                labelId={build(
                                    baseId,
                                    ids.INFO_TYPES,
                                    ids.LABEL
                                )}
                                id={build(baseId, ids.INFO_TYPES)}
                                value={details.infoType}
                                onChange={onInfoTypeChange}
                            >
                                {infoTypes.map((type) => (
                                    <MenuItem key={type} value={type}>
                                        {type}
                                    </MenuItem>
                                ))}
                            </Select>
                        ) : (
                            <>{details.infoType}</>
                        )}
                    </GridLabelValue>
                )}
                {isFile && (
                    <GridLabelValue label={t("fileSize")}>
                        {getFileSize(details["file-size"])}
                    </GridLabelValue>
                )}
                <GridLabelValue label={t("modified")}>
                    {formatDate(details["date-modified"])}
                </GridLabelValue>
                <GridLabelValue label={t("created")}>
                    {formatDate(details["date-created"])}
                </GridLabelValue>
                {isFile && (
                    <GridLabelValue label={t("md5")}>
                        <CopyTextArea
                            text={details.md5}
                            debugIdPrefix={build(baseId, ids.md5)}
                        />
                    </GridLabelValue>
                )}
                <GridLabelValue
                    id={build(baseId, ids.PATH, ids.LABEL)}
                    label={t("path")}
                >
                    <CopyTextArea
                        text={details.path}
                        multiline
                        debugIdPrefix={build(baseId, ids.PATH)}
                    />
                </GridLabelValue>
                <GridLabelValue label={t("deLink")}>
                    <CopyTextArea
                        text={`${getHost()}${partialLink}`}
                        debugIdPrefix={build(baseId, ids.md5)}
                    />
                </GridLabelValue>
                {isFile && (
                    <Grid item xs={6}>
                        <Button
                              id={build(baseId, ids.PATH_LINK_BTN)}
                            color="primary"
                            variant="outlined"
                            startIcon={<Link />}
                            onClick={onPublicLinksSelected}
                        >
                            {t("publicLink")}
                        </Button>
                    </Grid>
                )}
            </Grid>
            <Divider className={classes.dividerMargins} />
            <TagSearch id={build(baseId, ids.TAG_SEARCH)} resource={resource} />
        </>
    );
}

export default DetailsTabPanel;
