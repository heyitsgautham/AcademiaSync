/**
 * Stops accepting connections, lets in-flight requests finish, then closes the database pool.
 * Docker and ECS send SIGTERM before killing a container, so this keeps deploys from cutting requests off.
 * @returns {Function} the handler, exposed so tests can call it directly
 */
const registerShutdown = ({ server, pool, logger, exit = process.exit, timeoutMs = 10000 }) => {
    let stopping = false;

    const shutdown = (signal) => {
        if (stopping) return;
        stopping = true;
        logger.info({ signal }, 'Shutting down');

        const timer = setTimeout(() => {
            logger.error('Shutdown timed out, exiting');
            exit(1);
        }, timeoutMs);
        timer.unref();

        server.close(async () => {
            try {
                await pool.end();
                exit(0);
            } catch (err) {
                logger.error({ err }, 'Failed to close the database pool');
                exit(1);
            }
        });
    };

    process.once('SIGTERM', () => shutdown('SIGTERM'));
    process.once('SIGINT', () => shutdown('SIGINT'));
    return shutdown;
};

module.exports = { registerShutdown };
