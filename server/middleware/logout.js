
const logout = (req, res, next) => {
  delete req.header('x-auth');
  return next();
};

export default logout;
