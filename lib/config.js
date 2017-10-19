'use strict';

const configParser = require('gemini-configparser');

const root = configParser.root;
const section = configParser.section;
const option = configParser.option;

const ENV_PREFIX = 'hermione_faildump_';
const CLI_PREFIX = '--faildump-';

const is = (type, name) => {
    return (value) => {
        if (typeof value !== type) {
            throw new Error(`"${name}" must be a ${type}`);
        }
    };
};

const getParser = () => {
    return root(section({
        enabled: option({
            defaultValue: true,
            parseEnv: JSON.parse,
            validate: is('boolean', 'enabled')
        }),
        targetFile: option({
            defaultValue: 'hermione-faildump.json',
            validate: is('string', 'targetFile')
        }),
        gridUrl: option({
            defaultValue: 'http://localhost:4444/wd/hub',
            validate: is('string', 'gridUrl')
        })
    }), {envPrefix: ENV_PREFIX, cliPrefix: CLI_PREFIX});
};

module.exports = (options) => {
    const env = process.env;

    return getParser()({options, env, argv: []});
};
