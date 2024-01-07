const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;
const tokenSign = async (datos) => {
  const sign = jwt.sign(
    {
      cliente: datos.cliente,
      compania: datos.compania,
    },
    JWT_SECRET,
    { expiresIn: "60d" }
  );
  return sign;
};

const verifyToken = async (tokenJwt) => {
  try {
    return jwt.verify(tokenJwt, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

const tokenSigEmail = async (datos) => {
  const sign = jwt.sign(
    {
      nit: datos.nit,
      correo: datos.email,
      cliente: datos.cliente,
    },
    JWT_SECRET,
    { expiresIn: "8d" }
  );
  return sign;
};
module.exports = { tokenSign, verifyToken, tokenSigEmail };
