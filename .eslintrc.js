module.exports = {
    globals: {
        __PATH_PREFIX__: true,
    },
    parser: '@typescript-eslint/parser',
    plugins: [
      "@typescript-eslint",
      "import",
    ],
    parserOptions: {
        "ecmaFeatures": {
            "jsx": true
        },
        "ecmaVersion": 2018,
        "sourceType": "module"
    },
    extends: [
        'plugin:react/recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended'
    ],
    rules: {
        "@typescript-eslint/indent": [
            "error",
            4
        ],
        "brace-style": [
            "error",
            "allman"
        ],
        "linebreak-style": [
            2,
            "unix"
        ],
        "quotes": [
            "error",
            "double",
            {
              "allowTemplateLiterals": true
            }
        ],
        "semi": [
            "error",
            "always"
        ],
        "eol-last": [
            "error",
            "always"
        ],
        "@typescript-eslint/no-empty-interface": [
            "off",
        ],
        "no-throw-literal": [
            "error",
        ],
        "@typescript-eslint/no-use-before-define": [
            "off",
        ],
        "one-var": [
            "error",
            "never",
        ],
        "no-trailing-spaces": [
            "error",
        ],
        "no-nested-ternary": [
            "error",
        ],
        "newline-before-return": [
            "error",
        ],
        "@typescript-eslint/no-namespace": [
            "error",
        ],
        "no-multi-spaces": [
            "error",
        ],
        "import/first": [
            "error",
        ],
        "import/no-cycle": [
            "error",
        ],
        "import/no-default-export": [
            "error",
        ],
        "import/newline-after-import": [
            "error",
            {
                count: 2,
            },
        ],
        "comma-style": [
            "error",
            "last",
        ],
        "comma-dangle": [
            "error",
            {
                "arrays": "only-multiline",
                "objects": "only-multiline",
                "imports": "never",
                "exports": "never",
                "functions": "never",
            }
        ],
        "no-multiple-empty-lines": [
            "error",
            {
                max: 2,
            }
        ],
        "space-before-function-paren": [
            2,
            {
                "anonymous": "always",
                "named": "never"
            }
        ]
    }
};
