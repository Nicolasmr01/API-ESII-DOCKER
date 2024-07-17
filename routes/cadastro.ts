import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from "@prisma/client"
import { Router } from "express"
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()
const router = Router()

router.get("/", async (req, res) => {
  try {
    const users = await prisma.user.findMany()
    res.status(200).json(users)
  } catch (error) {
    res.status(400).json(error)
  }
})

function validarSenha(senha: string) {

  const mensagem: string[] = []

  if (senha.length < 8) {
    mensagem.push("Erro... senha deve possuir, no mínimo, 8 caracteres")
  }

  let lowercase = 0
  let uppercase = 0
  let numbers = 0
  let simbols = 0


  for (const letter of senha) {
    if ((/[a-z]/).test(letter)) {
      lowercase++
    }
    else if ((/[A-Z]/).test(letter)) {
      uppercase++
    }
    else if ((/[0-9]/).test(letter)) {
      numbers++
    } else {
      simbols++
    }
  }

  if (lowercase == 0 || uppercase == 0 || numbers == 0 || simbols == 0) {
    mensagem.push("Erro... senha deve possuir letters minúsculas, maiúsculas, números e símbolos")
  }

  return mensagem
}

// * Rota de cadastro de usuário, validando a senha e impedindo o cadastro de 2 usuários com o mesmo e-mail.
router.post("/", async (req, res) => {
  const { nome, email, senha } = req.body

  if (!nome || !email || !senha) {
    res.status(400).json({ erro: "Informe nome, email e senha" })
    return
  }

  const user = await prisma.user.findFirst({
    where: { email: email }
  })

  if (user != null) {
    res.status(400).json({ erro: "Email já cadastrado" })
    return
  }

  const errors = validarSenha(senha)
  if (errors.length > 0) {
    res.status(400).json({ erro: errors.join("; ") })
    return
  }

  const salt = bcrypt.genSaltSync(12)
  const hash = bcrypt.hashSync(senha, salt)

  try {
    const user = await prisma.user.create({
      data: { nome, email, senha: hash }
    })
    res.status(201).json(user)
  } catch (error) {
    res.status(400).json(error)
  }
})




router.put("/changeSenha", async (req, res) => {
  const { email, senha, newSenha } = req.body

  if (!email || !senha) {
    res.status(400).json({ erro: "Informe email e senha" })
    return
  }

  const existingUser = await prisma.user.findFirst({
    where: { email: email }
  })

  if (existingUser == null) {
    res.status(400).json({ erro: "Usurário inexistente" })
    return
  }

  const errors = validarSenha(senha)
  if (errors.length > 0) {
    res.status(400).json({ erro: errors.join("; ") })
    return
  }

  if(!bcrypt.compareSync(senha, existingUser.senha)) {
    res.status(400).json({ erro: "Senha atual incorreta" })
    return
  }

  let errorsNewSenha = validarSenha(newSenha)
  if (errorsNewSenha.length > 0) {
    res.status(400).json({ erro: errorsNewSenha.join("; ") })
    errorsNewSenha = []
    return
  }

  const salt = bcrypt.genSaltSync(12)
  const hash = bcrypt.hashSync(newSenha, salt)

  try {
    const user = await prisma.user.update({
      where: { id: existingUser.id }, 
      data: { email, senha: hash }
    })
    res.status(200).json(user)
  } catch (error) {
    res.status(400).json(error)
  }

})


export default router