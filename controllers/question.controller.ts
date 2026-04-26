import database = require("../database");

export class QuestionController {
  public async getQuestionsByIdCategories(idCategorie: number) {
    const pool = database.Database.getPool();
    const result = await pool.query({
      text: `SELECT q.id, q.question
                FROM trivialistes.questions q
                WHERE q.id_categorie = $1`,
      values: [idCategorie],
    });
    return result.rows;
  }

  public async getAllMortSubites() {
    const pool = database.Database.getPool();
    const result = await pool.query({
      text: `SELECT ms.id, ms.question
             FROM trivialistes.mort_subites ms`,
    });
    return result.rows;
  }
}
