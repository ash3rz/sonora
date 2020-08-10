import { makeStyles } from "@material-ui/styles";

export default makeStyles((theme) => ({
    actionsRoot: {
        marginLeft: "auto",
    },
    avatar: {
        background: theme.palette.white,
    },
    cardHeaderDefault: {
        background: (props) => props.color,
        marginBottom: theme.spacing(2),
    },
    avatarIcon: {
        color: (props) => props.color,
    },
    cardHeaderContent: {
        width: "75%",
    },
    cardHeaderText: {
        color: theme.palette.white,
    },
    dashboardCard: {
        display: "flex",
        flexDirection: "column",
        marginTop: theme.spacing(2),

        width: (props) => props.width,
        height: (props) => props.height,

        [theme.breakpoints.up("xs")]: {
            marginRight: theme.spacing(0),
        },

        [theme.breakpoints.up("sm")]: {
            marginRight: theme.spacing(2),
        },

        [theme.breakpoints.up("lg")]: {
            marginRight: theme.spacing(2),
        },
    },
    dashboardVideo: {
        width: (props) => props.width,
        height: (props) => props.height,
        float: "none",
        clear: "both",
        marginRight: theme.spacing(2),
        marginTop: theme.spacing(2),
    },
    eventsItem: {
        marginTop: theme.spacing(2),
        width: "100%",
    },
    newsItem: {
        marginTop: theme.spacing(2),
        width: "100%",
        paddingRight: theme.spacing(2),

        [theme.breakpoints.up("lg")]: {
            width: "47%",
        },
    },
}));
