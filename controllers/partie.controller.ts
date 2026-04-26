import database = require("../database");

export class PartieController {
  public async getAllParties() {
    const pool = database.Database.getPool();
    const result = await pool.query({
      text: `SELECT 
                part.id,
                part.nom_partie,
                JSON_AGG(
                    JSON_BUILD_OBJECT(
                        'categorie', cat.libelle_categorie,
                        'question', quest.question
                    )
                ) AS liste_questions,
                ms.question AS question_mort_subite
            FROM trivialistes.parties part
            JOIN trivialistes.questions quest ON quest.id = ANY(part.id_questions)
            JOIN trivialistes.mort_subites ms ON part.id_mort_subite = ms.id
            JOIN trivialistes.categories cat ON quest.id_categorie = cat.id
            GROUP BY part.id,part.nom_partie, ms.question
            `,
    });
    return result.rows;
  }

  public async getPartieById(idPartie: number) {
    const pool = database.Database.getPool();
    const result = await pool.query({
      text: `SELECT 
                JSON_AGG(
                    JSON_BUILD_OBJECT(
                        'categorie', cat.libelle_categorie,
                        'question', quest.question,
                        'reponses', quest.reponses
                    )
                ) AS liste_questions,
                JSON_BUILD_OBJECT(
                    'question', ms.question,
                    'reponses', ms.reponses
                ) AS question_mort_subite
            FROM trivialistes.parties part
            JOIN trivialistes.questions quest ON quest.id = ANY(part.id_questions)
            JOIN trivialistes.mort_subites ms ON part.id_mort_subite = ms.id
            JOIN trivialistes.categories cat ON quest.id_categorie = cat.id
            WHERE part.id = $1
            GROUP BY part.id, ms.question, ms.reponses
            `,
      values: [idPartie],
    });
    return result.rows[0];
  }

  public async postNewPartie(
    nomPartie: string,
    idQuestions: number[],
    idMortSubite: number,
  ) {
    const pool = database.Database.getPool();
    await pool.query({
      text: `INSERT INTO trivialistes.parties(nom_partie, id_questions, id_mort_subite)
      VALUES ($1,$2,$3)`,
      values: [nomPartie, idQuestions, idMortSubite],
    });
  }
}
