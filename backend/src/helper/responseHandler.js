const successResponse = (
  res,
  {
    statusCode = 200, // HTTP status code (defaults to 200)
    successMessage = "Successful", // Message for successful operation
    payload = {}, // Data to send back
    nextURl = {} // Next URL (optional)
  }
) => {
  return res.status(statusCode).json({
    success: true,
    successMessage,
    payload,
    nextURl
  });
};

const errorResponse = (
  res,
  {
    statusCode = 400, // HTTP status code (defaults to 400)
    errorMessage = "Operation Failed", // Message for failed operation
    nextURl = {} // Next URL (optional)
  }
) => {
  res.status(statusCode).json({
    error: true,
    errorMessage,
    nextURl
  });
};

export { successResponse, errorResponse };
