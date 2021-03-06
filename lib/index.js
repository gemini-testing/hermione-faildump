'use strict';

const parseConfig = require('./config');
const FailCollector = require('./fail-collector');

module.exports = (hermione, pluginOpts) => {
    const config = parseConfig(pluginOpts);
    if (!config.enabled) {
        return;
    }

    const failCollector = FailCollector.create(hermione.config, config);

    hermione.on(hermione.events.SUITE_FAIL, (fail) => failCollector.addFail(fail));
    hermione.on(hermione.events.TEST_FAIL, (fail) => failCollector.addFail(fail));
    hermione.on(hermione.events.RETRY, (retry) => failCollector.addFail(retry));
    // `data` already contains `error` in its property `err`
    hermione.on(hermione.events.ERROR, (error, data) => failCollector.addFail(data));

    hermione.on(hermione.events.RUNNER_END, () => failCollector.generateReport());
};
