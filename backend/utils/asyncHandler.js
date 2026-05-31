function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      if (typeof next === "function") {
        return next(error);
      }

      throw error;
    });
  };
}

module.exports = asyncHandler;
