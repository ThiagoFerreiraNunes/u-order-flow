# DOCUMENTAÇÃO

GITHUB: [GitHub \- ThiagoFerreiraNunes/u-order-flow · GitHub](https://github.com/ThiagoFerreiraNunes/u-order-flow)

FIGMA: [https://www.figma.com/board/FKyy4iKc6ebnzAZ2dj3bU6/Sem-t%C3%ADtulo?node-id=0-1\&t=p4ul7f0wdnbUTjZG-1](https://www.figma.com/board/FKyy4iKc6ebnzAZ2dj3bU6/Sem-t%C3%ADtulo?node-id=0-1&t=p4ul7f0wdnbUTjZG-1)

TRELLO:  
[https://trello.com/invite/b/69cafe11ce82314ad8da6eb7/ATTI903d1d85985f1554a958909863d44fb19EA29AEF/meu-quadro-do-trello](https://trello.com/invite/b/69cafe11ce82314ad8da6eb7/ATTI903d1d85985f1554a958909863d44fb19EA29AEF/meu-quadro-do-trello)

# REGRAS DE NEGÓCIO

#### **RF \-\> Requisito Funcional**

RN \-\> Regra de negócios  
RNF \-\> Requisito Não Funcional

1. #### **RF01** \- Cadastro de funcionário (Realizado pelo admin)

   O objetivo aqui é garantir que administrador consiga cadastrar o funcionário na plataforma.  
* **RN01** (Informações do cadastro): O administrador irá digitar o nome completo, função no restaurante (garçom, cozinheiro, caixa), número de telefone (XX) XXXXX-XXXX, data de nascimento (dd/mm/yyyy) e senha (mínimo de 8 caracteres, contendo pelo menos 1 caractere minúsculo, 1 caractere minúsculo e 1 caractere especial), além de outro campo para confirmação de senha.  
* **RN02** (Termos): Na tela de cadastro, o funcionário será apresentado aos termos de uso do aplicativo.  
* **RN04** (Validação de conta): caso não exista esse usuário na base de dados, o funcionário será cadastrado.  
* **RN04** (Segurança): As informações deverão seguir o tipo dos dados já predefinidos, os campos deverão ter validações básicas (validação de senha forte, número mínimo de caracteres e formatação de acordo com as especificadas em RN01)  
* **RN05** (Unicidade): Administrador não pode realizar cadastro de funcionário utilizando usuário que já está salvo no banco (mesmo estando inativo).

2. #### **RF02** \- Login

   O objetivo é garantir que o funcionário (garçom/cozinha/caixa) consiga realizar o seu login na plataforma, inserindo suas informações e permitindo o acesso para visualizar os pedidos e/ou gerenciar as comandas digitais.  
* **RN01 (Informações do login)**: O funcionário irá digitar o usuário e a senha para realizar login.  
* **RN02 (Validação Senha):** Caso o usuário exista, a senha deverá ser validada com o banco de dados.  
* **RN04 (Verificar atividade):** Caso o usuário esteja inativo, o login não será realizado e será exibida uma mensagem ao usuário.  
* **RN05 (Login concluído):** Após concluir o login, usuário poderá continuar na tela em que estava anteriormente.

3. #### **RF03** \- **Menu** (cliente)

   O objetivo é disponibilizar os itens do menu para que o cliente possa avaliar o catálogo.  
* **RN01** (Itens): Será disponibilizado um catálogo dos itens disponíveis no estabelecimento.  
* **RN02** (Informações): Cada item será acompanhado do nome, preço normal, preço com desconto, lista de ingredientes principais, imagem.  
* **RN03** (Detalhamento dos itens): Ao clicar em um item, será exibido sua imagem em um formato maior, um campo para observações (ex: retirar cebola), e opções para adicionais (ex: se for pizza definir a borda, se for hambúrguer escolher molho de acompanhamento).  
* **RN04** (Adicionar item): Ao selecionar as opções disponíveis do produto, o cliente irá clicar no botão para adicionar item no carrinho.  
* **RN05** (Carrinho): O carrinho guarda uma lista dinâmica dos itens e características selecionadas pelo cliente.  
* **RN06** (Adicionar/remover item): Cada item no carrinho terá a opção para adicionar ou remover uma unidade de cada item disponível, sendo botões disponibilizados ao lado do item.  
* **RN07** (Informações do Carrinho): Serão exibidas as informações dos itens: nome, adições e especificações do item, preço total.  
* **RN08** (Iniciar Compra): O carrinho deverá ter um botão para levar até a tela de compra

4. #### **RF04** \- Pedido (cliente)

   O objetivo é tornar possível com que o cliente possa realizar um pedido para o estabelecimento  
* **RN01** (disponibilidade): O cliente só poderá realizar o pedido se estiver no local  
* **RN02 (Comanda)**: O cliente poderá escanear um código no estabelecimento, tendo acesso a sua própria comanda  
* **RN03 (menu)**: O cliente ao ter sua comanda “criada”, poderá visualizar o menu virtual.  
* **RN04 (pedido)**: Ao realizar um pedido, será realizado um disparo para o sistema do garçom.  
* **RN05 (alterar pedido)**: O cliente terá a possibilidade de, na mesma comanda, pedir diferentes itens.  
* **RN06 (pagamento)**: O cliente poderá visualizar todos os pedidos feitos pela sua comanda, podendo acompanhar o valor total.

5. #### **RF05** \- Comanda (cliente)

   O objetivo é criar uma comanda que possa ter diferentes pedidos para o mesmo cliente, podendo ser reutilizada.  
* **RN01 (criação)**: Ao digitar o código (escanear QrCode, digitar TAG etc.) a comanda será criada.  
* **RN02 (finalização)**: Ao pagamento ser efetuado, a comanda digital será finalizada, não aceitando mais pedidos nem alteração de status.  
* **RN03 (acesso)**: O cliente deverá ter acesso apenas à sua comanda   
* **RN04 (unicidade)**: A comanda deverá ser única no sistema

6. #### **RF06** \- Pedido (garçom)

   O objetivo é tornar possível com que o garçom tenha acesso aos pedidos realizados  
* **RN01 (menu)**: O garçom terá acesso ao menu de pedidos, para realizar suas ordens de entrega  
* **RN02 (Comanda)**: O garçom terá acesso às comandas dos clientes, podendo visualizar os pedidos das diferentes comandas,  
* **RN03 (gestão de comanda)**: O garçom poderá gerenciar as comandas dos clientes, podendo editar os pedidos (cancelar, alterar pedido).  
* **RN04 (pagamento)**: Caso o garçom tenha realizado os pedidos para o cliente, ele poderá disponibilizar uma comanda “separada” para que o cliente possa realizar o pagamento

7. #### **RF07** \- Comanda (garçom)

   O objetivo é tornar possível com que o garçom tenha acesso às comandas da casa  
* **RN01 (disponibilidade)**: Haverá um número limitado de comandas pré-registradas no sistema  
* **RN02 (acesso)**: O garçom poderá “ativar” uma comanda física, permitindo com que ela seja utilizada nos pedidos em que os clientes não criaram comandas.  
* **RN03 (desativação)**: Após a comanda ser paga, ela será desativada. 

8. #### **RF08** \- Cozinha 

   A equipe da cozinha terá acesso aos pedidos em tempo real, podendo visualizar os pedidos, mudar o status para “Em preparo” e “Finalizado”.  
* **RN01 (acesso)**: Haverá uma lista com os pedidos realizados  
* **RN02 (visualização)**: os pedidos deverão estar agrupados por categoria, ordem de pedido  
* **RN03 (tempo)**: O sistema da cozinha terá acesso em tempo real aos pedidos

9. #### **RF09** \- Pagamento

   O objetivo é tornar possível com que o atendente possa fechar comandas.  
* **RN01 (visualização)**: A pessoa do balcão terá acesso a um menu (apenas de visualização)  
* **RN02 (pagamento)**: o sistema poderá calcular e cobrar o valor da comanda.  
* **RN03 (desativação)**: Após o pagamento ser efetuado, a comanda será “desativada”  
* **RN04 (gerenciamento)**: O sistema permitirá que o atendente realize alterações na comanda, antes de finalizar o pagamento.





10. #### **RF12** \- Administrador

    O administrador do estabelecimento terá acesso total à plataforma, podendo gerenciar contas e pedidos.  
* **RN01 (criar conta)**: O administrador terá acesso para criar conta de qualquer natureza (garçom, cliente, administrador)  
* **RN02 (alterar conta)**: O administrador poderá alterar informações das contas, tipo de conta, reset de senha, alterar usuário  
* **RN03 (criar itens menu)**: Acesso para adicionar pedidos no menu, podendo adicionar descrição e detalhes do item.  
* **RN04 (alterar itens do menu):** Alterar informações dos itens.  
* **RN05 (criar comandas):** Criação de comandas que serão utilizadas especialmente pelos clientes ou pelos garçons para realizar os atendimentos.  
* **RN06 (desativar contas)**: Desativar contas de usuário  
* **RN07 (desativar itens):** Desativar itens do pedido  
* **RN08 (criar combos):** Possibilidade de criar combos a partir de itens existentes  
* **RN09 (gerenciamento de combos):** Edição de combos dos pedidos  
* **RN10 (deletar combos)**: Deletar combos  
* **RN11 (visualização de comandas):** Visualização das comandas ativas e seus respectivos pedidos.  
* **RN12 (gerenciamento de comandas)**: Alterar pedidos e itens das comandas.

11. #### **RF13** \- Chatbot

    Chatbot de atendimento  
* **RN01** 

12. #### **RF12** \- Dashboard administrador

    O administrador do estabelecimento terá acesso a métricas disponibilizadas por um dashboard  
* **RN01 (criar conta)**: O administrador terá acesso para criar conta de qualquer natureza (garçom, cliente, administrador)

RNF:

# GitFlow

Termos: sempre em português

Variáveis: camelCase  
Constantes: SCREAMING\_SNAKE\_CASE

Tabelas do banco: snake\_case  
Colunas do banco: snake\_case

Endpoints: kebab-case, minúsculo, singular  
Ex: /api/v1/user  
Ex: /api/v1/pedido-usuario

Controllers: PascalCase  
Ex: UserController

Domínios/módulos: minúsculo, sem espaços  
Ex: usuario, pedido, autenticação

Entidades: PascalCase, Singular   
Ex: Usuario, Pedido

DTOs: \[UseCase\]EntityNameDTO  
Ex: UsuarioCreaterDTO, UsuarioUpdateDTO

Services: EntityNameService  
Ex: UsuarioService, PedidoService  
Lista de prefixos de commit/branch (baseado no repositório iuricode/padroes-de-commits):  
feat — nova funcionalidade

fix — correção de bug

docs — alterações na documentação

style — formatação/estilo (sem alterar lógica)

refactor — refatoração de código

perf — melhoria de performance

test — adição ou alteração de testes

build — mudanças de build/dependências

ci — alterações em integração contínua

chore — tarefas de manutenção/configuração

remove — remoção de código/arquivos

cleanup — limpeza de código

raw — alterações em dados/configurações brutas

Regras de negócio:  
Se houver apenas um adim, ele não pode se remover como admin

Main \-\> deploy

HML \-\> testes

Develop \-\> código

# REQUISITOS

Requisitos funcionais

| Requisitos Funcionais | Descrição | Classificação | Prioridade |
| :---- | :---- | :---- | :---- |
| RF01 | O sistema deve permitir o cadastro de usuários   baseados nos cargos | Gestão usuários | Alta |
| RF02 | O sistema deve   apresentar termos de uso da plataforma | Orientações | Baixa |
| RF03 | O sistema deve possuir acesso de serviços baseado nos níveis de permissão | Gestão usuários | Alta |
| RF04 | O sistema deve permitir o login de usuários | Gestão usuários | Alta |
| RF05 | Deve existir Landing Page para acessar o sistema | Orientações | Média |
| RF06 | Sistema deve possuir catálogo com itens do estabelecimento | Core | Alta |
| RF07 | Sistema deve possuir carrinho para armazenar em fila itens selecionados | Core | Alta |
| RF08 | Sistema deve possuir tela de compra para finalizar pedido | Core | Alta |
| RF09 | Sistema deve gerenciar comandas dos consumidores | Core | Alta |
| RF10 | Consumidor pode visualizar informações da comanda | Core | Alta |
| RF11 | Sistema permitirá visualizar fila de pedidos | Core | Alta |
| RF12 | Sistema deve permitir gerenciar informações dos usuários | Gestão usuários | Alta |
| RF13 |  |  |  |

