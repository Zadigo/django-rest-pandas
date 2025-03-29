import { useState, useEffect, useMemo } from "react";
import { useComponents } from "@wq/react";
import { get as getPandasCsv } from "@wq/pandas";
import { labelWithIcon } from "./components/Icon.jsx";

export function useAnalyst(props) {
    const config = useAnalystConfig(props),
        [data, dataError] = useAnalystData(
            config.url || null,
            config.data || null,
            config.fields || null,
            config.url_format || null,
        ),
        modes = useAnalystModes(data, config),
        [form, options, setOptions] = useAnalystForm(modes),
        ActiveMode = modes.find(
            (mode) => mode.name === (options.mode || "table"),
        )?.component;

    return {
        ...config,
        data,
        error: config.error || dataError || (data ? null : "Loading..."),
        modes,
        form: form.some((field) => field.type !== "hidden") ? form : null,
        options,
        setOptions,
        ActiveMode,
    };
}

export function useAnalystConfig(props) {
    const {
        url,
        data,
        fields,
        title,
        formats,
        initial_rows,
        initialRows,
        initial_order,
        initialOrder,
        id_column,
        idColumn,
        id_url_prefix,
        idUrlPrefix,
        modes,
        url_format,
        urlFormat,
    } = props || {};

    if (!url && !data) {
        return {
            error: "Specify either url or data",
        };
    }

    return {
        url,
        data,
        fields,
        title,
        formats,
        initial_rows: initial_rows || initialRows,
        initial_order: initial_order || initialOrder,
        id_column: id_column || idColumn,
        id_url_prefix: id_url_prefix || idUrlPrefix,
        modes,
        url_format: url_format || urlFormat,
    };
}

export function useAnalystData(url, initialData, fields, urlFormat) {
    const [data, setData] = useState(initialData),
        [error, setError] = useState(null);

    useEffect(() => {
        if (!url) {
            return;
        }
        async function loadData() {
            try {
                let data;
                if (urlFormat === "json" || url.endsWith("json")) {
                    const response = await fetch(url);
                    data = await response.json();
                } else {
                    data = await getPandasCsv(url, { flatten: true, fields });
                }
                if (data && data.length > 0) {
                    setData(data);
                } else {
                    setError("No data found.");
                }
            } catch (e) {
                console.error(e);
                setError("Error loading data.");
            }
        }
        loadData();
    }, [url, urlFormat]);

    useEffect(() => {
        setData(initialData);
    }, [initialData]);

    return [data, error];
}

export function useAnalystModes(data, config) {
    const components = useComponents();
    return useMemo(() => {
        const modes = [],
            columnTypes = findColumns(data);

        for (const component of Object.values(components)) {
            if (component.getAnalystMode) {
                const mode = component.getAnalystMode(data, columnTypes);
                if (mode) {
                    modes.push({ ...mode, component });
                }
            }
        }
        if (config && config.modes) {
            return config.modes
                .map((modeName) => modes.find((mode) => mode.name === modeName))
                .filter(Boolean);
        } else {
            return modes;
        }
    }, [data, config, components]);
}

function findColumns(data) {
    const columns = {},
        datasets = (data && data.datasets) || [{ data: data || [] }];
    for (const dataset of datasets) {
        for (const row of dataset.data) {
            for (const [key, val] of Object.entries(row)) {
                if (isNumeric(val)) {
                    columns[key] = "numeric";
                } else if (isDate(val) && columns[key] !== "numeric") {
                    columns[key] = "date";
                } else if (val && !columns[key]) {
                    columns[key] = "string";
                }
            }
        }
    }
    const columnTypes = {};
    for (const [key, type] of Object.entries(columns)) {
        if (!columnTypes[type]) {
            columnTypes[type] = [];
        }
        columnTypes[type].push(key);
    }
    return columnTypes;
}

function isNumeric(value) {
    return typeof value === "number";
}

function isDate(value) {
    return (
        value instanceof Date ||
        (typeof value === "string" && value.match(/^\d{4}-\d{2}-\d{2}$/))
    );
}

function useAnalystForm(modes) {
    const [options, setOptions] = useState(defaultOptions),
        form = useMemo(
            () => makeForm(modes, options.mode),
            [modes, options.mode],
        );

    useEffect(() => {
        const nextOptions = {},
            currOptions = options || {};
        for (const field of form) {
            if (
                field.choices &&
                field.choices.length > 0 &&
                !currOptions[field.name]
            ) {
                nextOptions[field.name] =
                    field.choices[
                        field.name === "value2" && field.choices.length > 1
                            ? 1
                            : 0
                    ].name;
            } else if (currOptions[field.name] === undefined) {
                nextOptions[field.name] = "";
            }
        }
        if (Object.keys(nextOptions).length > 0) {
            setOptions({ ...options, ...nextOptions });
        }
    }, [form, options]);
    return [form, options, setOptions];
}

const defaultOptions = { mode: "", date: "", value: "", value2: "", group: "" };

function makeForm(modes, currentMode) {
    if (!modes) {
        return [];
    }
    const modeInfo = modes.find((mode) => mode.name === currentMode),
        form = [
            {
                type: modes.length > 1 ? "select one" : "hidden",
                name: "mode",
                label: "",
                bind: { required: true },
                fullwidth: true,
                choices: modes.map(({ name, label }) => ({
                    name,
                    label: labelWithIcon(label, name),
                })),
            },
        ];

    if (modeInfo && modeInfo.dateColumns && modeInfo.dateColumns.length > 0) {
        form.push({
            name: "date",
            type: modeInfo.dateColumns.length > 1 ? "select one" : "hidden",
            label: "Date",
            control:
                modeInfo.dateColumns.length > 1
                    ? { appearance: "select" }
                    : null,
            bind: { required: true },
            choices: modeInfo.dateColumns.map((name) => ({
                name,
                label: name,
            })),
        });
    }

    if (modeInfo && modeInfo.valueColumns && modeInfo.valueColumns.length > 0) {
        form.push({
            name: "value",
            type: modeInfo.valueColumns.length > 1 ? "select one" : "hidden",
            control:
                modeInfo.valueColumns.length > 1
                    ? { appearance: "select" }
                    : null,
            label: currentMode === "scatter" ? "X" : "Value",
            bind: { required: true },
            choices: modeInfo.valueColumns.map((name) => ({
                name,
                label: name,
            })),
        });
        if (currentMode == "scatter") {
            form.push({
                name: "value2",
                type: "select one",
                control: { appearance: "select" },
                label: "Y",
                bind: { required: true },
                choices: modeInfo.valueColumns.map((name) => ({
                    name,
                    label: name,
                })),
            });
        }
    }

    if (currentMode === "boxplot" && modeInfo && modeInfo.dateColumns) {
        form.push({
            name: "group",
            type: "select one",
            control: { appearance: "select" },
            label: "Group",
            bind: { required: true },

            choices: [
                { name: "all", label: "All Data" },
                { name: "year", label: "Year" },
                { name: "month", label: "Month" },
            ],
        });
    }

    return form;
}
