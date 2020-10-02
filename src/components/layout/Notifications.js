/**
 * @author sriram
 *
 * A component that displays recent notifications to the users. Updates the unseen count.
 *
 */

import React, { useCallback, useEffect, useState } from "react";

import { useTranslation } from "i18n";
import Link from "next/link";

import ids from "./ids";
import constants from "../../constants";
import { useGotoOutputFolderLink } from "components/analyses/utils";
import analysisStatus from "components/models/analysisStatus";
import { useNotifications } from "contexts/pushNotifications";

import NotificationsMenu from "../notifications/NotificationsMenu";
import { announce, AnnouncerConstants, build } from "@cyverse-de/ui-lib";

import {
    Badge,
    Button,
    IconButton,
    Tooltip,
    Typography,
} from "@material-ui/core";
import { useTheme } from "@material-ui/core/styles";
import NotificationsIcon from "@material-ui/icons/Notifications";

const ANALYSIS_EMAIL_TEMPLATE = "analysis_status_change";

function getDisplayMessage(notification) {
    return notification.type === "data" &&
        notification["email_template"] !== ANALYSIS_EMAIL_TEMPLATE
        ? notification.subject
        : notification.message.text;
}

const GotoOutputFolderButton = React.forwardRef((props, ref) => {
    const { onClick, href } = props;
    const { t } = useTranslation("analyses");
    const theme = useTheme();
    return (
        <Button
            size="small"
            href={href}
            onClick={onClick}
            ref={ref}
            color="primary"
            title={t("goOutputFolder")}
            variant="outlined"
        >
            <Typography
                variant="button"
                style={{ color: theme.palette.primary.contrastText }}
            >
                {t("goOutputFolder")}
            </Typography>
        </Button>
    );
});

function AnalysisCustomAction(props) {
    const { outputFolderPath } = props;
    const [outputFolderHref, outputFolderAs] = useGotoOutputFolderLink(
        outputFolderPath
    );
    return (
        <Link href={outputFolderHref} as={outputFolderAs} passHref>
            <GotoOutputFolderButton />
        </Link>
    );
}

function Notifications(props) {
    const { t } = useTranslation("common");
    const [currentNotification] = useNotifications();
    const theme = useTheme();
    const [unSeenCount, setUnSeenCount] = useState(0);
    const [notificationMssg, setNotificationMssg] = useState(null);

    const displayAnalysisNotification = useCallback(
        (notification, status) => {
            const text = notification?.message?.text;
            const outputFolderPath =
                notification?.payload?.analysisresultsfolder;

            const completed = status === analysisStatus.COMPLETED;
            const failed = status === analysisStatus.FAILED;

            const variant = completed
                ? AnnouncerConstants.SUCCESS
                : failed
                ? AnnouncerConstants.ERROR
                : AnnouncerConstants.INFO;

            const CustomAction =
                (completed || failed) && outputFolderPath
                    ? () => (
                          <AnalysisCustomAction
                              outputFolderPath={outputFolderPath}
                          />
                      )
                    : null;

            announce({
                text,
                variant,
                CustomAction,
            });
        },
        []
    );

    const displayNotification = useCallback(
        (notification, category) => {
            let analysisStatus =
                category.toLowerCase() ===
                    constants.NOTIFICATION_CATEGORY.ANALYSIS.toLowerCase() ||
                notification["email_template"] === ANALYSIS_EMAIL_TEMPLATE
                    ? notification.payload.status
                    : "";

            if (analysisStatus) {
                displayAnalysisNotification(notification, analysisStatus);
            } else {
                announce({
                    text: getDisplayMessage(notification),
                });
            }
        },
        [displayAnalysisNotification]
    );

    const handleMessage = useCallback(
        (notifiMessage) => {
            let push_msg = null;
            try {
                push_msg = JSON.parse(notifiMessage);
            } catch (e) {
                return;
            }
            if (push_msg?.total) {
                setUnSeenCount(push_msg.total);
            }
            const message = push_msg?.message;
            if (message) {
                const category = message.type;
                displayNotification(message, category);
                setNotificationMssg(message);
            }
        },
        [displayNotification]
    );

    useEffect(() => {
        handleMessage(currentNotification);
    }, [currentNotification, handleMessage]);

    return (
        <>
        <Tooltip title={t("newNotificationAriaLabel")} placement="bottom" arrow>
            <IconButton
                id={build(ids.APP_BAR_BASE, ids.NOTIFICATION_BTN)}
                aria-label={t("newNotificationAriaLabel")}
                style={{ color: theme.palette.primary.contrastText }}
            >
                <Badge badgeContent={unSeenCount} color="error">
                    <NotificationsIcon />
                </Badge>
            </IconButton>
        </Tooltip>

        <NotificationsMenu
            unSeenCount={unSeenCount}
            notificationMssg={notificationMssg}
        />
        </>
    );
}

export default Notifications;

