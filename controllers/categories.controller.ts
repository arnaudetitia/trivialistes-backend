import database = require("../database");

export class CategorieController {
  public async getAllCategories() {
    const pool = database.Database.getPool();
    const result = await pool.query({
      text: `SELECT cat.id, cat.libelle_categorie
            FROM trivialistes.categories cat
            ORDER BY cat.libelle_categorie`,
    });
    return result.rows;
  }
}
