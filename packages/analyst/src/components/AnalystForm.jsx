import React, { useCallback } from "react";
import { useComponents, withWQ, createFallbackComponent } from "@wq/react";
import PropTypes from "prop-types";

const AnalystFormFallback = {
    components: {
        Grid: createFallbackComponent("Grid", "@wq/material"),
        View: createFallbackComponent("View", "@wq/material"),
        AutoForm: createFallbackComponent("AutoForm", "@wq/form", "AutoForm"),
        AutoInput: createFallbackComponent("AutoInput", "@wq/form", "AutoForm"),
    },
};

function AnalystForm({ form, options, setOptions, wq, children }) {
    const useValidate = useCallback(() => {
            function validate(newOptions) {
                setOptions(newOptions);
            }
            validate.onChange = true;
            return validate;
        }, [setOptions]),
        { AutoForm, AutoInput } = useComponents();

    return (
        <AutoForm
            form={form}
            data={options}
            hideSubmit
            wq={{
                ...wq,
                components: {
                    ...(wq || {}).components,
                    AutoInput: GridInput,
                    FormRoot: GridFormRoot,
                    BaseAutoInput: AutoInput,
                    useValidate,
                },
            }}
        >
            {children}
        </AutoForm>
    );
}

AnalystForm.propTypes = {
    form: PropTypes.arrayOf(PropTypes.object),
    options: PropTypes.object,
    setOptions: PropTypes.func,
    wq: PropTypes.object,
    children: PropTypes.node,
};

function GridFormRoot({ children }) {
    const { View, Grid } = useComponents();
    return (
        <View sx={{ p: 2 }}>
            <Grid container spacing={1}>
                {children}
            </Grid>
        </View>
    );
}

GridFormRoot.propTypes = {
    children: PropTypes.node,
};

function GridInput(props) {
    const { BaseAutoInput: AutoInput, Grid } = useComponents();
    if (props.type === "hidden") {
        return <AutoInput {...props} />;
    } else if (props.fullwidth) {
        return (
            <Grid item xs={12} lg={6} xl={4}>
                <AutoInput {...props} />
            </Grid>
        );
    } else {
        return (
            <Grid item xs={12} md={6} lg={3} xl={2}>
                <AutoInput {...props} />
            </Grid>
        );
    }
}

GridInput.propTypes = {
    type: PropTypes.string,
    fullwidth: PropTypes.bool,
};

export default withWQ(AnalystForm, { fallback: AnalystFormFallback });
