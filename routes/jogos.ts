import { PrismaClient } from '@prisma/client';
import { Router } from "express";
import { verificaToken } from "../middlewares/verificaToken";

const prisma = new PrismaClient();

// * Middleware para soft delete que vai fazer com que os registros deletados não sejam removidos do banco de dados, mas sim marcados como deletados.
async function main() {
  /***********************************/
  /* SOFT DELETE MIDDLEWARE */
  /***********************************/
  prisma.$use(async (params, next) => {
    // Check incoming query type
    if (params.model == "Jogo") {
      if (params.action == "delete") {
        // Delete queries
        // Change action to an update
        params.action = "update";
        params.args["data"] = { deleted: true };
      }
    }
    return next(params);
  });
}
main();

const router = Router();

// * Rota de listagem de séries
router.get("/", async (req, res) => {
  try {
    const jogos = await prisma.jogo.findMany({
      where: { deleted: false },
    });
    res.status(200).json(jogos);
  } catch (error) {
    res.status(400).json(error);
  }
});

// * Rota de registro de séries
router.post("/", verificaToken, async (req: any, res) => {
  const { nome, plataforma, genero, trilogia  } = req.body;

  // * userLoggedId é o id do usuário logado que está sendo passado pelo middleware verifyToken que é chamado na rota
  const userLoggedId = req.userLoggedId;

  if (!nome || !plataforma || !genero || !trilogia) {
    res.status(400).json({ erro: "Informe nome, streaming, gênero e temporadas" });
    return;
  }

  try {
    const jogo = await prisma.jogo.create({
      data: { nome, plataforma,  genero, trilogia, userId: userLoggedId },
    });
    
    
    res.status(201).json(jogo);
  } catch (error) {
    res.status(400).json(error);
  }
});

// * Rota de exclusão de séries
router.delete("/:id", verificaToken, async (req, res) => {
  const { id } = req.params;

  try {
     await prisma.jogo.delete({
      where: { id: Number(id) },
    });
    res.status(200).json({ message: "Série deletada com sucesso" });
  } catch (error) {
    res.status(400).json(error);
  }
});

// * Rota de alteração de séries
router.put("/:id", verificaToken, async (req, res) => {
  const { id } = req.params;
  const { nome, plataforma, genero, trilogia } = req.body;

  if (!nome || !plataforma || !genero || !trilogia) {
    res.status(400).json({ erro: "Informe nome, streaming, gênero e temporadas" });
    return;
  }

  try {
    const jogo = await prisma.jogo.update({
      where: { id: Number(id) },
      data: {
        nome,
        plataforma,
        genero,
        trilogia
      },
    });
    res.status(200).json(jogo);
  } catch (error) {
    res.status(400).json(error);
  }
});

export default router;