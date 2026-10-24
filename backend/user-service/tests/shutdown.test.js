const { registerShutdown } = require('../src/shutdown');

const fakeLogger = () => ({ info: jest.fn(), error: jest.fn() });

describe('registerShutdown', () => {
    afterEach(() => {
        process.removeAllListeners('SIGTERM');
        process.removeAllListeners('SIGINT');
    });

    it('closes the server, then the pool, then exits cleanly', async () => {
        const order = [];
        const server = { close: (cb) => (order.push('server'), cb()) };
        const pool = { end: async () => order.push('pool') };
        const exit = jest.fn((code) => order.push(`exit ${code}`));

        const shutdown = registerShutdown({ server, pool, logger: fakeLogger(), exit });
        shutdown('SIGTERM');
        await new Promise(setImmediate);

        expect(order).toEqual(['server', 'pool', 'exit 0']);
    });

    it('runs only once when signals repeat', async () => {
        const server = { close: jest.fn((cb) => cb()) };
        const pool = { end: jest.fn(async () => {}) };
        const shutdown = registerShutdown({ server, pool, logger: fakeLogger(), exit: jest.fn() });

        shutdown('SIGTERM');
        shutdown('SIGINT');
        await new Promise(setImmediate);

        expect(server.close).toHaveBeenCalledTimes(1);
    });

    it('exits with 1 when the pool fails to close', async () => {
        const exit = jest.fn();
        const logger = fakeLogger();
        const shutdown = registerShutdown({
            server: { close: (cb) => cb() },
            pool: { end: async () => Promise.reject(new Error('boom')) },
            logger,
            exit,
        });

        shutdown('SIGTERM');
        await new Promise(setImmediate);

        expect(exit).toHaveBeenCalledWith(1);
        expect(logger.error).toHaveBeenCalled();
    });

    it('exits with 1 when connections do not drain in time', () => {
        jest.useFakeTimers();
        const exit = jest.fn();
        const shutdown = registerShutdown({
            server: { close: () => {} },
            pool: { end: async () => {} },
            logger: fakeLogger(),
            exit,
            timeoutMs: 50,
        });

        shutdown('SIGTERM');
        jest.advanceTimersByTime(60);

        expect(exit).toHaveBeenCalledWith(1);
        jest.useRealTimers();
    });
});
