import React from "react";
import { Scatter } from "@wq/chart";
import PropTypes from "prop-types";

export default function AnalystScatter({ data, options }) {
    return (
        <Scatter
            datasets={data && data.datasets}
            x={options.value}
            y={options.value2}
            label={options.date}
        />
    );
}

AnalystScatter.propTypes = {
    data: PropTypes.object,
    options: PropTypes.object,
};

AnalystScatter.getAnalystMode = (data, columnTypes) => {
    if (
        columnTypes.date &&
        columnTypes.numeric &&
        columnTypes.numeric.length > 1
    ) {
        return {
            name: "scatter",
            label: "Scatter",
            dateColumns: columnTypes.date,
            valueColumns: columnTypes.numeric,
        };
    }
};
