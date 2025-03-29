import React from "react";
import { Series } from "@wq/chart";
import PropTypes from "prop-types";

export default function AnalystSeries({ data, options }) {
    return (
        <Series
            datasets={data && data.datasets}
            x={options.date}
            y={options.value}
        />
    );
}

AnalystSeries.propTypes = {
    data: PropTypes.object,
    options: PropTypes.object,
};

AnalystSeries.getAnalystMode = (data, columnTypes) => {
    if (columnTypes.date && columnTypes.numeric) {
        return {
            name: "series",
            label: "Series",
            dateColumns: columnTypes.date,
            valueColumns: columnTypes.numeric,
        };
    }
};
