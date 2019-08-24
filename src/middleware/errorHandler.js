module.exports = (err, req, res, next) => {
    if (err.name === 'ValidationError') {
        return res.status(400).json(err.message);
    }
    console.error(err.message);
    return res.status(501).json(err.message);
}