const { QueryTypes } = require("sequelize");
const { sequelize } = require("../config/mssql");
const {
  clienteModel,
  conjuntoModel,
  actividadEconomicaModel,
} = require("../models");
const { tokenSign, verifyToken, tokenSigEmail } = require("../utils/handleJwt");
const { transporter } = require("../config/mailer");
const host = process.env.HOST;
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
      "select Cliente_id,Cliente,Nombre,Alias, Direccion,Correo,CorreoDte,Telefono,pais,Nit,Nrc,Giro,NombreCodGiro, CodGiro,Zona,Token, actualizado,Vendedor,compania, Subcribe from dbo.Clientes where replace(Nit,'-','')=replace((:nit),'-','') and compania=(:Compania)",
      {
        replacements: { nit: nit, Compania: conjunto },
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
  const idCompania = req.body.compania;

  const message = "Se genero Token sin problema";
  try {
    const cliente = await clienteModel.findAll({
      attributes: ["Cliente", "compania"],
      where: { compania: idCompania },
    });
    let token = "";
    for (let a = 0; a < cliente.length; a++) {
      const element = cliente[a];
      const datos = {
        cliente: element.Cliente,
        compania: element.compania,
      };
      token = await tokenSign(datos);
      //console.log(token);

      //Fenerar token por cliente
      /*
      const updateToken = await clienteModel.update(
        {
          Token: token,
        },
        { where: { Cliente: element.Cliente } }
      );
      */
    }
    //generar token por compañia
    const updateToken = await clienteModel.update(
      {
        Token: token,
      },
      { where: { compania: req.body.compania } }
    );
    res.send({ message, tokend: token });
  } catch (error) {}
};
const getConsultaCliente = async (req, res) => {
  const resetToken = req.params.id;

  let jwtPayload;
  try {
    jwtPayload = await verifyToken(resetToken);
    if (!jwtPayload) {
      return res.send({
        results: "El tiempo para realizar cambio  expirado",
        succes: false,
        errors:
          "El tiempo para realizar cambio ha expirado notifique al Administrador",
      });
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
    "update dbo.Clientes set  Subcribe=(:_Subcribe), Nrc=(:_Nrc),Alias=(:_Alias),Nombre=(:_Nombre),Correo=(:_Correo),CorreoDte=(:_CorreoDte),Telefono=(:_Telefono),Giro=(:_Giro),Zona=(:_Zona),actualizado=(:_actualizado),CodGiro=(:_CodGiro),NombreCodGiro=(:_NombreCodGiro), sincronizado_el=getDate() where replace(nit,'-','')=replace((:_nit),'-','')",
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
        _Subcribe: req.body.Subcribe,
      },
    }
  );
  const cliente = {
    nit: req.body.Nit,
    correo: req.body._Correo,
    cliente: req.body.Nombre,
  };
  //enviarmos correo de valdiaciones
  const token = await tokenSigEmail(cliente);
  url = `https://${host}/email-confirm/${token}`;
  verificactionLink = url;
  await sequelize.query(
    "update dbo.Clientes set  confirm_token=(:_token) where replace(nit,'-','')=replace((:_nit),'-','')",
    {
      replacements: {
        _token: token,
        _nit: req.body.Nit,
      },
    }
  );
  // enviamos el correo

  await transporter.sendMail({
    form: '"Soporte H2C " <carlosrobertovelasquez@gmail.com> ',
    to: req.body.CorreoDte,
    subject: "Activa tu Cuenta para tus DTE",
    html: ` Hola,
    <br>
    <br>
    Gracias por Actualizar Sus Datos en Nuestro Portal .Haga clic en el siguiente boton para verificar su correo electrónico: 
    <br>
    <br>
   <a href="${verificactionLink}"><button style:"padding: 10px 20px;
   background-color: #ff0000;
   color: white;
   border: none;
   border-radius: 5px;
   cursor: pointer;"> Click Activar Correo</button></a>
   <br>
   <br>
   Este enlace caducará en 24 horas.
   <br>
   <br>
   Que estes bien.
   <br>
   <br>
   <span>H2C</span> Soporte`,
  });
  return res.send({
    results: "Actulizado con Existo",
    succes: true,
    error: "",
  });
};

const activarCliente = async (req, res) => {
  const token = req.params.token;
  let jwtPayload;
  try {
    jwtPayload = await verifyToken(token);
    if (!jwtPayload) {
      return res.send({
        results: {},
        succes: false,
        errors: [
          "El tiempo para realizar el cambio a expirado o no existe el Token",
        ],
      });
    }
    await sequelize.query(
      "update dbo.Clientes set  confirmado=(:_valor) where confirm_token=(:_token)",
      {
        replacements: {
          _token: token,
          _valor: true,
        },
      }
    );
    res.send({
      results: "Se activo con exito tu Correo",
      succes: true,
      errors: "",
    });
  } catch (error) {
    res.send({
      result: "",
      succes: false,
      errors: error,
    });
  }
};
module.exports = {
  getCliente,
  GeneraToken,
  getConsultaCliente,
  getNit,
  putCliente,
  activarCliente,
};
