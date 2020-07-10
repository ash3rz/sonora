import React, { useLayoutEffect, useState } from "react";

import { withI18N, getMessage as msg } from "@cyverse-de/ui-lib";

import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    Paper,
    TableRow,
    Typography,
    useTheme,
    useMediaQuery,
    IconButton,
} from "@material-ui/core";

// import { Skeleton } from "@material-ui/lab";
import { KeyboardArrowUp, KeyboardArrowDown } from "@material-ui/icons";

import { useTable, useExpanded } from "react-table";

import ActionButtons from "./actionButtons";

import messages from "./messages";
import ids from "./ids";
import { id } from "./functions";
import useStyles from "./styles";

const ExtendedDataCard = ({
    columns,
    row,
    collapseID,
    showActions = false,
    handleExit,
    handleSaveAndExit,
    handleExtendTimeLimit,
    handleUploadOutputs,
    handleDownloadInputs,
}) => {
    const classes = useStyles();
    const theme = useTheme();
    const isMedium = useMediaQuery(theme.breakpoints.down("md"));

    let display = "inline";
    if (isMedium) {
        display = "block";
    }

    // These should be the column IDs of the columns displayed in the
    // ExtendedDataCard, which currently corresponds to the hidden columns.
    const columnIDs = columns.map((c) => c.id);

    // Find only the cells for the hidden columns.
    const filteredCells = row.allCells.filter((row) => {
        return columnIDs.includes(row.column.id);
    });

    return (
        <Box margin={1}>
            <div
                className={`${classes.extended} ${classes.actions}`}
                {...row.getRowProps()}
            >
                {filteredCells.map((cell) => {
                    return (
                        <div className={classes.dataEntry}>
                            <Typography
                                variant="body2"
                                align="left"
                                display={display}
                                // id={id(collapseID, column.field, "label")}
                                classes={{ root: classes.dataEntryLabel }}
                            >
                                {cell.render("Header")}
                            </Typography>

                            <Typography
                                variant="body2"
                                align="left"
                                display={display}
                                // id={id(collapseID, column.field, "value")}
                            >
                                {cell.render("Cell")}
                            </Typography>
                        </div>
                    );
                })}
            </div>

            {showActions && (
                <ActionButtons
                    row={row}
                    handleDownloadInputs={handleDownloadInputs}
                    handleUploadOutputs={handleUploadOutputs}
                    handleExtendTimeLimit={handleExtendTimeLimit}
                    handleExit={handleExit}
                    handleSaveAndExit={handleSaveAndExit}
                />
            )}
        </Box>
    );
};

const CollapsibleTableRow = ({
    row,
    visibleColumns,
    hiddenColumns,
    baseID,
    showActions,
    handleExit,
    handleSaveAndExit,
    handleExtendTimeLimit,
    handleUploadOutputs,
    handleDownloadInputs,
}) => {
    const classes = useStyles();

    const rowID = id(baseID, "row");
    const collapseID = id(rowID, "collapse");

    return (
        <>
            <TableRow
                className={classes.row}
                key={rowID}
                id={rowID}
                {...row.getRowProps()}
            >
                {row.cells.map((cell) => {
                    return (
                        <TableCell {...cell.getCellProps()}>
                            {cell.render("Cell")}
                        </TableCell>
                    );
                })}
            </TableRow>

            {row.isExpanded ? (
                <TableRow key={collapseID} id={collapseID}>
                    <TableCell
                        style={{
                            paddingBottom: 0,
                            paddingTop: 0,
                            width: "90%",
                        }}
                        colSpan={visibleColumns.length}
                    >
                        <ExtendedDataCard
                            columns={hiddenColumns}
                            row={row}
                            collapseID={collapseID}
                            showActions={showActions}
                            handleExit={handleExit}
                            handleSaveAndExit={handleSaveAndExit}
                            handleExtendTimeLimit={handleExtendTimeLimit}
                            handleUploadOutputs={handleUploadOutputs}
                            handleDownloadInputs={handleDownloadInputs}
                        />
                    </TableCell>
                </TableRow>
            ) : null}
        </>
    );
};

export const ExpanderColumn = {
    id: "expander",
    Header: () => null,
    Cell: ({ row }) => (
        <span {...row.getToggleRowExpandedProps()}>
            <IconButton aria-label={msg("expandRow")} size="small">
                {row.isExpanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
            </IconButton>
        </span>
    ),
};

const CollapsibleTable = ({
    columns,
    data,
    title,
    showActions = false,
    handleExit,
    handleSaveAndExit,
    handleExtendTimeLimit,
    handleDownloadInputs,
    handleUploadOutputs,
}) => {
    const classes = useStyles();
    const theme = useTheme();

    const isXL = useMediaQuery(theme.breakpoints.up("xl"));
    const isLarge = useMediaQuery(theme.breakpoints.up("lg"));
    const isMedium = useMediaQuery(theme.breakpoints.up("md"));
    const isSmall = useMediaQuery(theme.breakpoints.up("sm"));

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        prepareRow,
        setHiddenColumns,
        rows,
        visibleColumns,
        //state: { expanded },
    } = useTable(
        {
            columns,
            data,
        },
        useExpanded
    );

    const [hiddenColumnObjs, setHiddenColumnObjs] = useState([]);

    useLayoutEffect(() => {
        let numCols;

        if (isXL) {
            numCols = 7;
        } else if (isLarge) {
            numCols = 6;
        } else if (isMedium) {
            numCols = 4;
        } else if (isSmall) {
            numCols = 2;
        } else {
            numCols = 7;
        }

        const hidden = columns.slice(numCols);
        setHiddenColumnObjs(hidden);
        setHiddenColumns(hidden.map((column) => column.id));
    }, [setHiddenColumns, columns, isXL, isLarge, isMedium, isSmall]);

    const tableID = id(ids.ROOT);

    return (
        <Paper className={classes.paper}>
            <Typography
                variant="h5"
                id={id(tableID, "title")}
                className={classes.title}
            >
                {title}
            </Typography>

            <TableContainer classes={{ root: classes.root }}>
                <Table
                    id={tableID}
                    classes={{ root: classes.table }}
                    {...getTableProps()}
                >
                    <TableHead>
                        {headerGroups.map((headerGroup) => (
                            <tr {...headerGroup.getHeaderGroupProps()}>
                                {headerGroup.headers.map((column) => (
                                    <th {...column.getHeaderProps()}>
                                        {column.render("Header")}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </TableHead>

                    <TableBody {...getTableBodyProps()}>
                        {rows?.map((row, index) => {
                            prepareRow(row);

                            return (
                                <CollapsibleTableRow
                                    row={row}
                                    key={row.original.externalID}
                                    baseID={row.original.externalID}
                                    visibleColumns={visibleColumns}
                                    hiddenColumns={hiddenColumnObjs}
                                    handleExit={handleExit}
                                    handleSaveAndExit={handleSaveAndExit}
                                    handleExtendTimeLimit={
                                        handleExtendTimeLimit
                                    }
                                    handleDownloadInputs={handleDownloadInputs}
                                    handleUploadOutputs={handleUploadOutputs}
                                    showActions={showActions}
                                />
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
};

export default withI18N(CollapsibleTable, messages);
