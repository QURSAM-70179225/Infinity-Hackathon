// Small helper: an Error that carries an HTTP status and optional extra JSON.
function httpError(status, message, details) {
  const err = new Error(message);
  err.status = status;
  if (details) err.details = details;
  return err;
}

module.exports = { httpError };
