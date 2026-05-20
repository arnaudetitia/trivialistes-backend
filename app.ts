import express, { Application } from "express";
import cors from "cors";
import { PartieController } from "./controllers/partie.controller";
import { CategorieController } from "./controllers/categories.controller";
import { QuestionController } from "./controllers/question.controller";

export class App {
  app: Application;
  categorieController: CategorieController;
  partieController: PartieController;
  questionController: QuestionController;

  constructor() {
    this.app = express();
    this.partieController = new PartieController();
    this.categorieController = new CategorieController();
    this.questionController = new QuestionController();
    this.config();
    this.setRoutes();
  }

  private config() {
    this.app.use(cors({}));
    this.app.use(express.json());
  }

  private setRoutes() {
    this.app.get("/parties", async (req, res) => {
      try {
        const parties = await this.partieController.getAllParties();
        res.json(parties);
      } catch (error) {
        console.error("Erreur lors de la récupération des parties", error);
        res.status(500).json({ error: "Erreur serveur" });
      }
    });

    this.app.get("/parties/:idPartie", async (req, res) => {
      const idPartie = parseInt(req.params.idPartie);
      try {
        const partie = await this.partieController.getPartieById(idPartie);
        res.json(partie);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération de la partie " + idPartie,
          error,
        );
        res.status(500).json({ error: "Erreur serveur" });
      }
    });

    this.app.post("/parties", async (req, res) => {
      const { nomPartie, idQuestions, idMortSubite } = req.body.partie;
      try {
        await this.partieController.postNewPartie(
          nomPartie,
          idQuestions,
          idMortSubite,
        );
        const allParties = await this.partieController.getAllParties();
        res.json(allParties);
      } catch (error) {
        console.error("Erreur lors de l'insertion d'une partie ", error);
        res.status(500).json({ error: "Erreur serveur" });
      }
    });

    this.app.get("/categories", async (req, res) => {
      try {
        const listeCategorie =
          await this.categorieController.getAllCategories();
        res.json(listeCategorie);
      } catch (error) {
        console.error("Erreur lors de la récupération des catégories ", error);
        res.status(500).json({ error: "Erreur serveur" });
      }
    });

    this.app.get("/questions", async (req, res) => {
      try {
        const listeQuestions = await this.questionController.getAllQuestions();
        res.json(listeQuestions);
      } catch (error) {
        console.error("Erreur lors de la récupération des questions ", error);
        res.status(500).json({ error: "Erreur serveur" });
      }
    });

    this.app.get("/questions/:idCategorie", async (req, res) => {
      const idCategorie = parseInt(req.params.idCategorie);
      try {
        const listeQuestions =
          await this.questionController.getQuestionsByIdCategories(idCategorie);
        res.json(listeQuestions);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des questions de la catégorie " +
            idCategorie,
          error,
        );
        res.status(500).json({ error: "Erreur serveur" });
      }
    });

    this.app.get("/mort-subites", async (req, res) => {
      try {
        const listeMortSubites =
          await this.questionController.getAllMortSubites();
        res.json(listeMortSubites);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des questions de mort subites :",
          error,
        );
        res.status(500).json({ error: "Erreur serveur" });
      }
    });
  }

  public listen(port: number): void {
    this.app.listen(port, () => {
      console.log(`🚀 Serveur en classe tournant sur http://localhost:${port}`);
    });
  }
}
