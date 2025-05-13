const pool = require('../BBDD/db');

async function registrarUsuario({ nombre, apellidos, telefono, ciudad }) {
  const query = `
    INSERT INTO usuario (nombre, apellidos, telefono, ciudad)
    VALUES (?, ?, ?, ?)
  `;
  const [resultado] = await pool.execute(query, [nombre, apellidos, telefono, ciudad]);

  return {
    id: resultado.insertId,
    nombre,
    apellidos,
    telefono,
    ciudad
  };
}

async function obtenerUsuarios() {
  const [rows] = await pool.query('SELECT * FROM usuario');
  return rows;
}

module.exports = {
  registrarUsuario,
  obtenerUsuarios,
};
