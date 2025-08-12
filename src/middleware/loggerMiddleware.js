// loggerMiddleware.js
const loggerMiddleware = (req, res, next) => {
  const start = Date.now();
  
  // Registrar la solicitud
  console.log(`Solicitud: ${req.method} ${req.originalUrl}`);
  
  // Capturar la respuesta
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`Respuesta: ${res.statusCode} en ${duration}ms`);
  });

  next();
};

export default loggerMiddleware;
