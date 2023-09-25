const expres = require("express");
const {
  getCliente,
  GeneraToken,
  getConsultaCliente,
  getNit,
} = require("../controllers/Clientes");
const router = expres.Router();

//TODO http://localhost/DteMunicipios

router.get("/", getCliente);
router.get("/GeneraToken", GeneraToken);
router.get("/nit", getNit);
router.get("/:id", getConsultaCliente);

module.exports = router;
