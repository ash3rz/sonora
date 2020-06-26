/**
 * @author psarando
 *
 * Form fields for selecting Reference Genome/Sequence/Annotation parameters.
 * Can also display as field loading skeletons while selection lists are fetched
 * from the backed services.
 */
import React from "react";

import messages from "./messages";

import {
    FormFieldLoading,
    FormTextField,
    getMessage,
    withI18N,
} from "@cyverse-de/ui-lib";

import { MenuItem } from "@material-ui/core";

const ReferenceGenomeSelect = withI18N(
    ({ referenceGenomes, referenceGenomesLoading, ...props }) => {
        const selectProps = { ...props };

        if (referenceGenomesLoading) {
            return <FormFieldLoading {...selectProps} />;
        } else if (!referenceGenomes?.length) {
            selectProps.error = true;
            selectProps.helperText = getMessage("errorLoadingReferenceGenomes");
        } else {
            // In the case of relaunch or app integrator default values,
            // the field value object will not be the same instance
            // as the one parsed from the service response.
            selectProps.value =
                referenceGenomes.find(
                    (refGenome) => refGenome.id === props.field.value?.id
                ) || "";
        }

        return (
            <FormTextField select variant="outlined" {...selectProps}>
                {referenceGenomes.map((refGenome) => (
                    <MenuItem key={refGenome.id} value={refGenome}>
                        {refGenome.name}
                    </MenuItem>
                ))}
            </FormTextField>
        );
    },
    messages
);

export default ReferenceGenomeSelect;
