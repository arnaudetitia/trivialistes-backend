import database = require("../database");

export class QuestionController {
  public async getQuestionsByIdCategories(idCategorie: number) {
    const pool = database.Database.getPool();
    const result = await pool.query({
      text: `SELECT q.id, q.question, q.reponses
                FROM trivialistes.questions q
                WHERE q.id_categorie = $1`,
      values: [idCategorie],
    });
    return result.rows;
  }

  public async getAllQuestions() {
    const pool = database.Database.getPool();
    const result = await pool.query({
      text: `SELECT q.id, q.id_categorie, c.libelle_categorie as categorie, q.question, q.reponses
             FROM trivialistes.questions q
             JOIN trivialistes.categories c ON q.id_categorie = c.id`,
    });
    return result.rows;
  }

  public async getAllMortSubites() {
    const pool = database.Database.getPool();
    const result = await pool.query({
      text: `SELECT ms.id, ms.question, ms.reponses
             FROM trivialistes.mort_subites ms`,
    });
    return result.rows;
  }

  public async createQuestion(
    idCategorie: number,
    question: string,
    reponses: string,
  ) {
    const pool = database.Database.getPool();
    await pool.query({
      text: `INSERT INTO trivialistes.questions (id_categorie,question, reponses) VALUES ($1, $2, $3)`,
      values: [idCategorie, question, reponses],
    });
  }
}
