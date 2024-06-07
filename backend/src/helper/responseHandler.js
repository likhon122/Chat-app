const successResponse = (
  res,
  {
    statusCode = 200,
    successMessage = "Successful",
    payload = {},
    nextURl = {}
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
  { statusCode = 400, errorMessage = "Operation Failed", nextURl = {} }
) => {
  res.status(statusCode).json({
    error: true,
    errorMessage,
    nextURl
  });
};

export { successResponse, errorResponse };
