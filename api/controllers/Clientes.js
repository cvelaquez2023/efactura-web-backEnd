const { QueryTypes } = require("sequelize");
const { sequelize } = require("../config/mssql");
const {
  clienteModel,
  conjuntoModel,
  actividadEconomicaModel,
} = require("../models");
const { tokenSign, verifyToken } = require("../utils/handleJwt");

const getCliente = async (req, res) => {
  //Obtener lista de la base de datos
  try {
    const errores = [];
    const data = await clienteModel.findAll();

    res.send({ results: data, result: "true", error: errores });
  } catch (error) {
    console.log(error);
  }
};

const getNit = async (req, res) => {
  try {
    const errores = [];
    const nit = req.query.nit;
    const conjunto = req.query.conjunto;

    //const data = await clienteModel.findOne({ where: { Nit: nit } });
    const data = await sequelize.query(
      "select Cliente_id,Cliente,Nombre,Alias, Direccion,Correo,CorreoDte,Telefono,pais,Nit,Nrc,Giro,NombreCodGiro, CodGiro,Zona,Token, actualizado,Vendedor,compania from dbo.Clientes where replace(Nit,'-','')=(:nit) and compania=(:Compania)",
      {
        replacements: { nit: nit.replaceAll("-", ""), Compania: conjunto },
      },
      { type: QueryTypes.SELECT }
    );

    if (data[0].length == 0) {
      return res.send({
        results: "",
        succes: false,
        error: "No Existe el Nit",
      });
    }
    res.send({ results: data[0], succes: true, error: errores });
  } catch (error) {
    console.log(error);
  }
};
const GeneraToken = async (req, res) => {
  //let verificactionLink;
  const message = "Se genero Token sin problema";
  try {
    const cliente = await clienteModel.findAll({
      attributes: ["Cliente", "compania"],
    });
    for (let a = 0; a < cliente.length; a++) {
      const element = cliente[a];
      const datos = {
        cliente: element.Cliente,
        compania: element.compania,
      };
      const token = await tokenSign(datos);

      const updateToken = await clienteModel.update(
        {
          Token: token,
        },
        { where: { Cliente: element.Cliente } }
      );
    }
    res.send({ message });
  } catch (error) {}
};
const getConsultaCliente = async (req, res) => {
  const resetToken = req.params.id;
  let jwtPayload;
  try {
    jwtPayload = await verifyToken(resetToken);
    if (!jwtPayload) {
      return res
        .status(401)
        .send({ message: "El tiempo para realizar cambio  expirado" });
    }
    const cliente = await clienteModel.findOne({
      where: { Token: resetToken },
    });

    const conjunto = await conjuntoModel.findOne({
      where: { Conjunto_Id: cliente.compania, Activo: true },
    });

    if (!conjunto) {
      res.send({
        results: conjunto,
        succes: false,
        error: "El Sitio esta Inactivo",
      });
    } else {
      res.send({
        results: conjunto,
        succes: true,
        error: "",
      });
    }
  } catch (error) {
    console.log(error);
  }
};

const putCliente = async (req, res) => {
  console.log(req.params);
  console.log(req.body);
  //consultamos el codgo del giro por medio del nombre
  const _codGiro = await sequelize.query(
    "select Codigo from dbo.DteCat019 where Upper(Valores)=Upper((:dato))",
    {
      replacements: { dato: req.body.CodGiro },
    },
    {
      type: QueryTypes.SELECT,
    }
  );

  //Actualizamos  el cliente por medio de registro y tipoGiro

  const _Actulizar = await sequelize.query(
    "update dbo.Clientes set Nrc=(:_Nrc),Alias=(:_Alias),Nombre=(:_Nombre),Correo=(:_Correo),CorreoDte=(:_CorreoDte),Telefono=(:_Telefono),Giro=(:_Giro),Zona=(:_Zona),actualizado=(:_actualizado),CodGiro=(:_CodGiro),NombreCodGiro=(:_NombreCodGiro), sincronizado_el=getDate() where replace(nit,'-','')=replace((:_nit),'-','')",
    {
      replacements: {
        _Nrc: req.body.Nrc,
        _Alias: req.body.Alias,
        _Nombre: req.body.Nombre,
        _Correo: req.body.Correo,
        _CorreoDte: req.body.CorreoDte,
        _Telefono: req.body.Telefono,
        _Giro: req.body.Giro,
        _Zona: req.body.zona,
        _actualizado: req.body.actualizado,
        _CodGiro: _codGiro[0][0].Codigo,
        _nit: req.body.Nit,
        _NombreCodGiro: req.body.CodGiro,
      },
    }
  );

  return res.send({
    results: "Actulizado con Existo",
    succes: true,
    error: "",
  });
};

module.exports = {
  getCliente,
  GeneraToken,
  getConsultaCliente,
  getNit,
  putCliente,
};
