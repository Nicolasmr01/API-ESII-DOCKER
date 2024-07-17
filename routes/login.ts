import dotenv from 'dotenv';
dotenv.config(); 

import jwt from "jsonwebtoken"; 
import { PrismaClient } from "@prisma/client"; 
import { Router } from "express"; 
import bcrypt from 'bcrypt'; 

const prisma = new PrismaClient();
const router = Router(); 


const MAX_LOGIN_ATTEMPTS = 3; 
const LOCK_TIME = 1 * 60 * 60 * 10; 

router.post("/", async (req, res) => {
  const { email, senha } = req.body; 

  const mensagemPadrao = "Login ou senha incorretos"; 

  if (!email || !senha) { 
    res.status(400).json({ erro: mensagemPadrao });
    return;
  }

  try {
    const user = await prisma.user.findFirst({
      where: { email }
    }); 

    if (user == null) { 
      res.status(400).json({ erro: mensagemPadrao });
      return;
    }

    if (user.lockUntil && user.lockUntil > new Date()) {
      res.status(403).json({ erro: "Conta bloqueada. Tente novamente mais tarde." });
      return;
    }

  
    if (bcrypt.compareSync(senha, user.senha)) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          loginAttempts: 0,
          lockUntil: null
        }
      });

      const tokenPayload = {
        userLoggedId: user.id,
        userLoggedName: user.nome
      }; 

      
      const token = jwt.sign(
        tokenPayload,
        process.env.JWT_KEY as string,
        { expiresIn: "1h" }
      ); 


      res.status(200).json({
        id: user.id,
        nome: user.nome,
        email: user.email,
        token: token
      }); 
    } else {
      let loginAttempts = user.loginAttempts + 1;
      let lockUntil = user.lockUntil;

      if (loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        lockUntil = new Date(Date.now() + LOCK_TIME);
        loginAttempts = 0;
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          loginAttempts: loginAttempts,
          lockUntil: lockUntil
        }
      });

      await prisma.log.create({
        data: { 
          desc: "Tentativa de Acesso Inválida", 
          complement: `Funcionário: ${user.email}`,
          userId: user.id
        }
      }); 

      res.status(400).json({ erro: mensagemPadrao });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ erro: 'Internal server error' }); 
  }
});

export default router; 