import React from "react";
import { useComponents, withWQ, createFallbackComponent } from "@wq/react";
import { useAnalyst } from "./hooks.js";
import { AnalystIcon, Table, Series, Scatter, Boxplot } from "./icons.js";
import PropTypes from "prop-types";

import {
    AnalystDownload,
    AnalystTable,
    AnalystForm,
    AnalystSeries,
    AnalystScatter,
    AnalystBoxplot,
} from "./components/index.js";

const AnalystDefaults = {
    components: {
        AnalystDownload,
        AnalystForm,
        AnalystTable,
        AnalystSeries,
        AnalystScatter,
        AnalystBoxplot,
    },
    icons: {
        Analyst: AnalystIcon,
        Table,
        Series,
        Scatter,
        Boxplot,
    },
};

const AnalystFallback = {
    components: {
        View: createFallbackComponent("View", "@wq/material"),
        Typography: createFallbackComponent("Typography", "@wq/material"),
    },
};

function Analyst({ children, ...props }) {
    const { View, Typography, AnalystDownload, AnalystForm, AnalystTable } =
            useComponents(),
        {
            url,
            data,
            fields,
            error,
            title,
            formats,
            initial_rows,
            initial_order,
            id_column,
            id_url_prefix,
            form,
            options,
            setOptions,
            ActiveMode = AnalystTable,
        } = useAnalyst(props);

    if (error) {
        return (
            <View sx={{ p: 2 }}>
                {title && <Typography variant="h5">{title}</Typography>}
                {children}
                <Typography>{error}</Typography>
            </View>
        );
    }

    return (
        <View
            style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
            }}
        >
            {formats && (
                <AnalystDownload url={url} title={title} formats={formats} />
            )}
            {!formats && title && <Typography variant="h5">{title}</Typography>}
            {children}
            {form && (
                <AnalystForm
                    form={form}
                    options={options}
                    setOptions={setOptions}
                />
            )}
            {ActiveMode && (
                <ActiveMode
                    data={data}
                    options={options}
                    fields={fields}
                    initial_rows={initial_rows}
                    initial_order={initial_order}
                    id_column={id_column}
                    id_url_prefix={id_url_prefix}
                />
            )}
        </View>
    );
}

Analyst.propTypes = {
    children: PropTypes.node,
};

export default withWQ(Analyst, {
    defaults: AnalystDefaults,
    fallback: AnalystFallback,
});
