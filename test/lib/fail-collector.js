'use strict';

const fs = require('fs');

const _ = require('lodash');

const defaults = require('../../lib/defaults');
const FailCollector = require('../../lib/fail-collector');

describe('FailCollector', () => {
    const sandbox = sinon.sandbox.create();

    const createFailCollector = (opts) => {
        opts = opts || {};

        return FailCollector.create(opts.hermioneConfig, opts.pluginConfig);
    };

    const generateFaildump = (fails, failCollector) => {
        fails = [].concat(fails);
        failCollector = failCollector || createFailCollector();

        fails.forEach((fail) => {
            fail.fullTitle = sinon.stub().returns(fail.title);

            failCollector.addFail(fail);
        });
        failCollector.generateReport();

        return JSON.parse(fs.writeFileSync.lastCall.args[1]);
    };

    beforeEach(() => {
        sandbox.stub(fs, 'writeFileSync');
    });

    afterEach(() => sandbox.restore());

    it('should generate faildump report in the default file', () => {
        const failCollector = createFailCollector();

        failCollector.generateReport();

        assert.calledWith(fs.writeFileSync, defaults.targetFile);
    });

    it('should generate faildump report in the specified file', () => {
        const failCollector = createFailCollector({pluginConfig: {targetFile: 'awesome-faildump.json'}});

        failCollector.generateReport();

        assert.calledWith(fs.writeFileSync, 'awesome-faildump.json');
    });

    it('should add fails to faildump', () => {
        const faildump = generateFaildump([
            {title: 'first-test', browserId: 'bro1'}, {title: 'second-test', browserId: 'bro2'}
        ]);

        assert.deepEqual(_.keys(faildump), ['first-test.bro1', 'second-test.bro2']);
    });

    it('should consider one test in various browsers as different tests', () => {
        const faildump = generateFaildump([{title: 'test', browserId: 'bro1'}, {title: 'test', browserId: 'bro2'}]);

        assert.deepEqual(_.keys(faildump), ['test.bro1', 'test.bro2']);
    });

    it('should add all test fails to faildump', () => {
        const faildump = generateFaildump([{title: 'test', browserId: 'bro'}, {title: 'test', browserId: 'bro'}]);

        assert.lengthOf(faildump['test.bro'], 2);
    });

    describe('generation of faildump item', () => {
        it('should contain property `timestamp`', () => {
            const faildump = generateFaildump({title: 'test', browserId: 'bro'});

            assert.isOk(faildump['test.bro'][0].timestamp); // Can not stub `Date` constructor to test the value
        });

        it('should contain property `message` passed from an original fail', () => {
            const faildump = generateFaildump({title: 'test', err: {message: 'awesome-error'}, browserId: 'bro'});

            assert.equal(faildump['test.bro'][0].message, 'awesome-error');
        });

        it('should handle cases when original fail does not have error message', () => {
            const faildump = generateFaildump({title: 'test', browserId: 'bro'});

            assert.equal(faildump['test.bro'][0].message, 'Unknown Error');
        });

        it('should contain property `sessionId` passed from an original fail', () => {
            const faildump = generateFaildump({title: 'test', sessionId: '100500', browserId: 'bro'});

            assert.equal(faildump['test.bro'][0].sessionId, '100500');
        });

        it('should contain property `browserCapabilities`', () => {
            const failCollector = createFailCollector({
                hermioneConfig: {
                    browsers: {
                        bro: {
                            desiredCapabilities: {version: '100500'}
                        }
                    }
                }
            });

            const faildump = generateFaildump({title: 'test', browserId: 'bro'}, failCollector);

            assert.deepEqual(faildump['test.bro'][0].browserCapabilities, {version: '100500'});
        });

        it('should contain property `seleniumQuota` parsed from grid url auth', () => {
            const failCollector = createFailCollector({hermioneConfig: {grid: 'http://login:pass@sg.ru:4444/wd/hub'}});
            const faildump = generateFaildump({title: 'test', browserId: 'bro'}, failCollector);

            assert.equal(faildump['test.bro'][0].seleniumQuota, 'login');
        });

        it('should handle cases when grid url does not contain auth', () => {
            const failCollector = createFailCollector({hermioneConfig: {grid: 'http://sg.ru:4444/wd/hub'}});
            const faildump = generateFaildump({title: 'test', browserId: 'bro'}, failCollector);

            assert.equal(faildump['test.bro'][0].seleniumQuota, '');
        });

        it('should handle cases when grid url does not contain password in auth', () => {
            const failCollector = createFailCollector({hermioneConfig: {grid: 'http://login@sg.ru:4444/wd/hub'}});
            const faildump = generateFaildump({title: 'test', browserId: 'bro'}, failCollector);

            assert.equal(faildump['test.bro'][0].seleniumQuota, 'login');
        });
    });
});
