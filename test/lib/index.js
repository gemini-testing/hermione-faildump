'use strict';

const EventEmitter = require('events').EventEmitter;

const hermioneEvents = require('hermione/lib/constants/runner-events');

const config = require('../../lib/config');
const faildump = require('../../lib');
const FailCollector = require('../../lib/fail-collector');

describe('hermione-faildump', () => {
    const sandbox = sinon.sandbox.create();

    let hermione;

    const initHermioneWithPlugin = (hermioneConfig, pluginConfig) => {
        hermione = new EventEmitter();

        hermione.events = hermioneEvents;
        hermione.config = hermioneConfig || {};

        faildump(hermione, pluginConfig || {});
    };

    beforeEach(() => {
        initHermioneWithPlugin();

        sandbox.spy(FailCollector, 'create');

        sandbox.stub(FailCollector.prototype, 'addFail');
        sandbox.stub(FailCollector.prototype, 'generateReport');
    });

    afterEach(() => sandbox.restore());

    it('should pass hermione config and plugin config to a contructor of a fail collector', () => {
        initHermioneWithPlugin({hermione: 'config'});

        assert.calledWithMatch(FailCollector.create, {hermione: 'config'}, config());
    });

    it('should handle an error emitted by event `SUITE_FAIL`', () => {
        hermione.emit(hermione.events.SUITE_FAIL, {some: 'data'});

        assert.calledWith(FailCollector.prototype.addFail, {some: 'data'});
    });

    it('should handle an error emmitted by event `TEST_FAIL`', () => {
        hermione.emit(hermione.events.TEST_FAIL, {some: 'data'});

        assert.calledWith(FailCollector.prototype.addFail, {some: 'data'});
    });

    it('should handle an error emmitted by event `RETRY`', () => {
        hermione.emit(hermione.events.RETRY, {some: 'data'});

        assert.calledWith(FailCollector.prototype.addFail, {some: 'data'});
    });

    it('should handle an error emmitted by event `ERROR`', () => {
        hermione.emit(hermione.events.ERROR, null, {some: 'data'});

        assert.calledWith(FailCollector.prototype.addFail, {some: 'data'});
    });

    it('should generate a faildump report on event `RUNNER_END`', () => {
        hermione.emit(hermione.events.RUNNER_END);

        assert.called(FailCollector.prototype.generateReport);
    });
});
