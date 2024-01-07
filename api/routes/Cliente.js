const expres = require("express");
const {
  getCliente,
  GeneraToken,
  getConsultaCliente,
  getNit,
  putCliente,
  activarCliente,
} = require("../controllers/Clientes");
const router = expres.Router();

//TODO http://localhost/DteMunicipios

router.put("/:nit", putCliente);

router.get("/", getCliente);
router.get("/GeneraToken", GeneraToken);
router.get("/nit", getNit);
router.get("/:id", getConsultaCliente);
router.post("/email-confirm/:token",activarCliente)
module.exports = router;
