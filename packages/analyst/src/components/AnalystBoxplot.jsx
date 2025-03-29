import React from "react";
import { Boxplot } from "@wq/chart";
import PropTypes from "prop-types";

export default function AnalystBoxplot({ data, options }) {
    return (
        <Boxplot
            datasets={data && data.datasets}
            x={options.date}
            y={options.value}
            group={options.group}
        />
    );
}

AnalystBoxplot.propTypes = {
    data: PropTypes.object,
    options: PropTypes.object,
};

AnalystBoxplot.getAnalystMode = (data, columnTypes) => {
    if (columnTypes.numeric) {
        return {
            name: "boxplot",
            label: "Box",
            dateColumns: columnTypes.date,
            valueColumns: columnTypes.numeric,
        };
    }
};
