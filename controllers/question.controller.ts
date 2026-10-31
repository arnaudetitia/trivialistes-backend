import database = require("../database");
import {
  CsvColumnsReponsesManches,
  CsvColumnsReponsesMortSubite,
  CsvMancheColumns,
  CsvMortSubiteColumns,
} from "../models/csv-columns.enum";
import { ErreurImportFichier } from "../models/erreur-import-fichier.model";
import { CsvReaderUtil } from "../utils/csv-reader.util";

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
    reponses: string[],
  ) {
    const pool = database.Database.getPool();
    await pool.query({
      text: `INSERT INTO trivialistes.questions (id_categorie,question, reponses) VALUES ($1, $2, $3)`,
      values: [idCategorie, question, reponses],
    });
  }

  public async createMortSubite(question: string, reponses: string[]) {
    const pool = database.Database.getPool();
    await pool.query({
      text: `INSERT INTO trivialistes.mort_subites(question, reponses) VALUES ($1, $2)`,
      values: [question, reponses],
    });
  }

  public async importQuestionsManches(
    csvContent: any,
    categories: { id: number; libelle_categorie: string }[],
    doImport: any,
  ) {
    const records = await CsvReaderUtil.parseRecords(csvContent);
    const erreursImportFichier: ErreurImportFichier[] = [];
    records.forEach((record, index) => {
      const ligne = index + 2;
      if (!record[CsvMancheColumns.CATEGORIE]) {
        erreursImportFichier.push({
          ligne,
          type: "error",
          message: "La catégorie de la question est manquante",
        });
      }
      const categorie = categories.find(
        (cat) =>
          cat.libelle_categorie
            .toUpperCase()
            .localeCompare(record[CsvMancheColumns.CATEGORIE]) === 0,
      );
      if (record[CsvMancheColumns.CATEGORIE] && !categorie) {
        erreursImportFichier.push({
          ligne,
          type: "error",
          message: `La catégorie ${record[CsvMancheColumns.CATEGORIE]} n'existe pas`,
        });
      }
      if (!record[CsvMancheColumns.QUESTION]) {
        erreursImportFichier.push({
          ligne,
          type: "error",
          message: "L'intitulé de la question est manquante",
        });
      }
      const idReponsesManquantes = CsvColumnsReponsesManches.filter(
        (indexReponse) => !record[indexReponse],
      ).map((indexReponse) => indexReponse - 1);
      if (idReponsesManquantes.length > 0) {
        erreursImportFichier.push({
          ligne,
          type: "error",
          message: `Les réponses d'index ${idReponsesManquantes.join(", ")} sont manquantes`,
        });
      }
    });
    if (doImport && erreursImportFichier.length === 0) {
      records.forEach((record) => {
        const categorie = categories.find(
          (cat) =>
            cat.libelle_categorie
              .toUpperCase()
              .localeCompare(record[CsvMancheColumns.CATEGORIE]) === 0,
        );
        if (categorie && categorie.id) {
          this.createQuestion(
            categorie.id,
            record[CsvMancheColumns.QUESTION],
            CsvColumnsReponsesManches.map(
              (indexReponse) => record[indexReponse],
            ),
          );
        }
      });
    }
    return erreursImportFichier;
  }

  public async importQuestionsMortSubites(csvContent: any, doImport: any) {
    const records = await CsvReaderUtil.parseRecords(csvContent);
    const erreursImportFichier: ErreurImportFichier[] = [];
    records.forEach((record, index) => {
      const ligne = index + 2;
      if (!record[CsvMortSubiteColumns.QUESTION]) {
        erreursImportFichier.push({
          ligne,
          type: "error",
          message: "L'intitulé de la question est manquante",
        });
      }
      const idReponsesManquantes = CsvColumnsReponsesMortSubite.filter(
        (indexReponse) => !record[indexReponse],
      ).map((indexReponse) => indexReponse - 1);
      if (idReponsesManquantes.length > 0) {
        erreursImportFichier.push({
          ligne,
          type: "error",
          message: `Les réponses d'index ${idReponsesManquantes.join(", ")} sont manquantes`,
        });
      }
    });
    if (doImport && erreursImportFichier.length === 0) {
      records.forEach((record) => {
        this.createMortSubite(
          record[CsvMortSubiteColumns.QUESTION],
          CsvColumnsReponsesMortSubite.map(
            (indexReponse) => record[indexReponse],
          ),
        );
      });
    }
    return erreursImportFichier;
  }
}
