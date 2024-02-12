module.exports = {
    "plugins": [
        [
            "@babel/plugin-proposal-optional-chaining-assign",
            {
                "version": "2023-07"
            }
        ]
    ],
    "presets": [
        [
            "@babel/preset-env",
            {
                "useBuiltIns": "entry",
                "corejs": "3.34"
            }
        ]
    ]
}
