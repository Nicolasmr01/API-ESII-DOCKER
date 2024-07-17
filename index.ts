import express from 'express'
import dotenv from "dotenv";

const app = express()
const port = 3000
import cors from "cors";

dotenv.config();

import jogosRoutes from './routes/jogos'
import loginRoutes from './routes/login'
import cadastroRoutes from './routes/cadastro'
import usuarioRoutes from './routes/usuario'
import logRoutes from './routes/log'


app.use(express.json())
app.use(cors());
app.use('/jogos', jogosRoutes);
app.use('/login', loginRoutes);
app.use('/cadastro', cadastroRoutes);
app.use("/usuario", usuarioRoutes);
app.use('/log', logRoutes);

app.get("/", (req, res) => {
  res.send("API DE JOGOS E USUARIOS");
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta: ${port}`);
});