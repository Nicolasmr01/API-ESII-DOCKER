import matplotlib.pyplot as plt
import numpy as np
import requests

base_url = "http://localhost:3306/jogos"
token = None

def titulo(texto, sublinhado="-"):
  print()
  print(texto)
  print(sublinhado*40)

def cadastrar():
    titulo("Cadastro de Usuário", "-")
    user = {}
    user["name"] = input("Nome: ")
    user["email"] = input("Email: ")
    user["senha"] = input("Senha: ")
    url = "http://localhost:3000/cadastrar"
    response = requests.post(url, json=user)
    if response.status_code == 201:
        print("Usuário cadastrado com sucesso!")
    else:
        print("Erro ao cadastrar usuário!")
  

def login():
    titulo("Login de Usuário", "-")
    email = input("Email: ")
    senha = input("Senha: ")
    url = "http://localhost:3000/login"
    response = requests.post(url, json={"email": email, "senha": senha})
    if response.status_code == 200:
        print()
        token = response.json()["token"]
        return token
    else:
        print("Erro ao logar usuário!")  

def listar_jogos():
    url = "http://localhost:3000/jogos"
    response = requests.get(url)
    jogos = response.json()
    if response.status_code == 200:
        print("=" * 40)
        for jogo in jogos:
           print(f"{jogo['id']} - {jogo['nome']} ({jogo['plataforma']} {jogo['genero']} - {jogo['trilogia']}")
        print("=" * 40)
        
    elif response.status_code == 404:
        print("Nenhuma jogo encontrada!")
    elif len(jogos) == 0:
        print("Nenhuma jogo cadastrada!")
    else:
        print("Erro ao buscar jogos!")
        erro = response.json()
        print("=" * 40)
        print(erro)
        print("=" * 40)

def inclusao(token):
    titulo("Inclusão de Jogo", "-")
    jogo = {}
    jogo["nome"] = input("Nome do Jogo: ")
    jogo["plataforma"] = int(input("Plataforma: "))
    jogo["genero"] = input("Gênero: ")
    jogo["trilogia"] = input("Trilogia: ")

    url = "http://localhost:3000/jogos"
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.post(url, json=jogo, headers=headers)
    
    if response.status_code == 201:
        print("Jogo incluída com sucesso!")
    else:
        print("Erro ao incluir jogo!")
        erro = response.json()
        print("=" * 40)
        print(erro)
        print("=" * 40)

def atualizar_jogos(token):
    titulo("Atualização de Jogo", "-")
    listar_jogos()
    id = input("Codigo da Jogo: ")
    jogo = {}
    jogo["nome"] = input("Nome do Jogo: ")
    jogo["plataforma"] = int(input("Plataforma: "))
    jogo["genero"] = input("Gênero: ")
    jogo["trilogia"] = input("Trilogia: ")
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.put(f"http://localhost:3000/jogos/{id}", json=jogo, headers=headers)
    
    if response.status_code == 200:
        print("Jogo atualizado com sucesso!")
    else:
        print("Erro ao atualizar jogo!")
        erro = response.json()
        print("=" * 40)
        print(erro)
        print("=" * 40)

    

def deletar_jogo(token):
    titulo("Exclusão dp Jogo", "-")
    listar_jogos()
    id = int(input("Codigo dp Jogo: "))

    response = requests.delete(f"http://localhost:3000/jogos/{id}", headers = {"Authorization": f"Bearer {token}"})
    if response.status_code == 200:
        print("Jogo excluído com sucesso!")
    else:
        print("Erro ao excluir Jogo!")
        erro = response.json()
        print("=" * 40)
        print(erro)
        print("=" * 40)

def jogos_por_genero():
    titulo("Jogos por Plataforma", "-")
    url = "http://localhost:3000/jogos"
    response = requests.get(url)
    jogos = response.json()

    if response.status_code == 200 and len(jogos) > 0:
        genero_dict = {}
        for jogo in jogos:
            genero = jogo["Genero"]
            if genero not in genero_dict:
                genero_dict[genero] = []
            genero_dict[genero].append(jogo)

        sorted_genero = sorted(genero_dict.items(), key=lambda x: len(x[1]), reverse=True)

        for genero, jogos_listar in sorted_genero:
            print(f"{genero}: Quantidade de jogos {len(jogos_listar)}")
            for jogo in jogos_listar:
                print(f"  - {jogo['nome']} ({jogo['trilogia']} {jogo['genero']}")
            print("=" * 40)
    else:
        print("Erro ao buscar jogos ou nenhum jogo encontrad!")
        erro = response.json()
        print("=" * 40)
        print(erro)
        print("=" * 40)


#--------------------------- Main ---------------------------


while True:
    if token is None:
        print("1 - Registrar")
        print("2 - Login")
        option = input("Opção: ")
        
        if option == "1":
            cadastrar()
        elif option == "2":
            token = login()
        else:
            print("Opção inválida!")
    else:
        print("1 - Listar jogo")
        print("2 - Incluir jogo")
        print("3 - Atualizar jogo")
        print("4 - Excluir Jogo")
        print("5 - Jogos por genero")
        print("0 - Sair")
        option = input("Opção: ")
        
        if option == "1":
            listar_jogos()
        elif option == "2":
            inclusao(token)
        elif option == "3":
            atualizar_jogos(token)
        elif option == "4":
            deletar_jogo(token)
        elif option == "5":
            jogos_por_genero()
        elif option == "0":
            break
        else:
            print("Opção inválida!")