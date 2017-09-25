'use strict';

const fs = require('fs');
const url = require('url');

const _ = require('lodash');

module.exports = class FailCollector {
    static create(hermioneConfig, pluginOpts) {
        return new FailCollector(hermioneConfig, pluginOpts);
    }

    constructor(hermioneConfig, pluginOpts) {
        hermioneConfig = hermioneConfig || {};

        this._browsers = this._getBrowsersCapabilities(hermioneConfig.browsers);
        this._seleniumQuota = this._parseSeleniumQuota(hermioneConfig.gridUrl, pluginOpts);

        this._targetFile = pluginOpts.targetFile;

        this._fails = {};
    }

    _parseSeleniumQuota(gridUrl, pluginOpts) {
        gridUrl = gridUrl || pluginOpts.gridUrl;

        const auth = url.parse(gridUrl).auth;

        return auth ? auth.split(':')[0] : '';
    }

    _getBrowsersCapabilities(browsers) {
        return _.mapValues(browsers || {}, (browserConfig) => browserConfig.desiredCapabilities);
    }

    addFail(fail) {
        const testTitle = fail.fullTitle().trim() + '.' + fail.browserId;

        this._fails[testTitle] = this._fails[testTitle] || [];
        this._fails[testTitle].push(this._formatTestError(fail));
    }

    _formatTestError(fail) {
        return {
            timestamp: new Date(),
            message: fail.err && fail.err.message || 'Unknown Error',
            sessionId: fail.sessionId,
            browserCapabilities: this._browsers[fail.browserId],
            seleniumQuota: this._seleniumQuota
        };
    }

    generateReport() {
        fs.writeFileSync(this._targetFile, JSON.stringify(this._fails, null, 2));
    }
};
