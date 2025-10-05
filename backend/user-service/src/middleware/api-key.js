/**
 * Middleware to check for valid API key in query parameters
 * Specifically for analytics endpoints requiring additional security
 */
const checkApiKey = (req, res, next) => {
    const apiKey = req.query.apiKey;
    const validApiKey = process.env.ANALYTICS_API_KEY;

    // Check if API key is provided
    if (!apiKey) {
        return res.status(401).json({
            error: 'API key required',
            message: 'Please provide an API key as a query parameter: ?apiKey=your-key'
        });
    }

    // Check if API key is valid
    if (apiKey !== validApiKey) {
        return res.status(403).json({
            error: 'Invalid API key',
            message: 'The provided API key is not valid'
        });
    }

    // API key is valid, proceed
    next();
};

module.exports = checkApiKey;