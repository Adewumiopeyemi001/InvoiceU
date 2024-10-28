import rateLimit from'express-rate-limit';

// Define a rate limiter for login and reset-password
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: "Too many attempts from this IP, please try again after 15 minutes."
  },
  headers: true, // Include rate limit info in response headers
});

export const registerRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, 
    message: "Too many registrations from this IP, please try again after an hour.",
  });