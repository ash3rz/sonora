export default {
    description: "Text input, info text, and env var parameters.",
    requirements: [
        {
            step_number: 0,
        },
    ],
    deleted: false,
    disabled: false,
    name: "Text params",
    system_id: "de",
    label: "Text params",
    id: "1778b1d6-5a83-11ea-9e38-008cfa5ae621",
    app_type: "DE",
    groups: [
        {
            id: "177d4ae8-5a83-11ea-9e38-008cfa5ae621",
            name: "",
            label: "Text Input",
            parameters: [
                {
                    description: "",
                    arguments: [],
                    name: "",
                    type: "Info",
                    validators: [],
                    label:
                        "<h4>Info Text!</h4><p>Can display <b>HTML</b>:</p><p>The <b>Dark Arts</b> better be worried,<br/><em>oh boy</em>!</p>",
                    id:
                        "17794ff6-5a83-11ea-9e38-008cfa5ae621_177d78f6-5a83-11ea-9e38-008cfa5ae621",
                    isVisible: true,
                    required: false,
                },
                {
                    description: "single line text",
                    arguments: [],
                    name: "--text",
                    type: "Text",
                    validators: [
                        {
                            type: "Regex",
                            params: ["[a-zA-Z]+"],
                        },
                        {
                            type: "CharacterLimit",
                            params: [10],
                        },
                    ],
                    label: "Single-line Text",
                    id:
                        "17794ff6-5a83-11ea-9e38-008cfa5ae621_8a4cf0fa-5a83-11ea-9e38-008cfa5ae621",
                    isVisible: true,
                    defaultValue: "defaultxt",
                    required: true,
                },
                {
                    description: "",
                    arguments: [],
                    name: "",
                    type: "MultiLineText",
                    validators: [],
                    label: "Multi-line Text",
                    id:
                        "17794ff6-5a83-11ea-9e38-008cfa5ae621_81301b9e-5a85-11ea-9e38-008cfa5ae621",
                    isVisible: true,
                    required: false,
                },
                {
                    description: "ENV VAR",
                    arguments: [],
                    name: "NEW_ENV_VAR",
                    type: "EnvironmentVariable",
                    validators: [],
                    label: "Environment Variable",
                    id:
                        "17794ff6-5a83-11ea-9e38-008cfa5ae621_58d5a140-5a86-11ea-9e38-008cfa5ae621",
                    isVisible: true,
                    defaultValue: "envvar",
                    required: true,
                },
            ],
            step_number: 0,
        },
    ],
};
