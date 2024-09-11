const errorResMsg = (res, code, message) => {
  if (!res) {
    console.error('Response object is undefined');
    return;
  }
  res.status(code).json({
    status: 'error',
    message: message,
  });
};

const successResMsg = (res, code, responseData) => {
  const { message, ...data } = responseData;
  return res.status(code).json({
    status: 'success',
    message,
    data,
  });
};

const redirect = (res, url) => res.status(302).redirect(url);

export { errorResMsg, successResMsg, redirect };
