# Projeto Mobile — Gerenciador de Atividades

Aplicativo mobile desenvolvido com **React Native, Expo e TypeScript**, voltado ao gerenciamento de atividades físicas e esportivas.

O sistema permite que usuários cadastrem e gerenciem atividades, visualizem atividades de outras pessoas e demonstrem interesse em participar.

O projeto integra consumo de APIs REST, autenticação JWT, persistência local de preferências, armazenamento SQLite para leitura offline e geolocalização.

## Repositórios

- **Frontend:** https://github.com/douchasdev/projeto-mobile
- **Backend:** https://github.com/douchasdev/projeto-mobile-api

## 1. Objetivo

Desenvolver uma aplicação mobile que permita organizar atividades físicas e esportivas, integrando recursos de comunicação em rede, armazenamento local e funcionalidades nativas do dispositivo.

O projeto foi desenvolvido em etapas.

Na primeira etapa, foram implementados a interface, a navegação, os componentes reutilizáveis e o gerenciamento de atividades.

Na segunda etapa, foram acrescentados os seguintes requisitos:

- **Consumo de APIs com Axios e JSON;**
- **Persistência local com AsyncStorage;**
- **Persistência local com SQLite;**
- **Geolocalização utilizando GPS.**

Também foram implementadas autenticação de usuários, identificação do criador das atividades e registro de interesse em participar.

## 2. Tecnologias utilizadas

| Tecnologia | Finalidade |
|---|---|
| React Native | Desenvolvimento da interface mobile |
| Expo SDK 57 | Ambiente de desenvolvimento e acesso a recursos nativos |
| TypeScript | Tipagem estática |
| Expo Router | Navegação entre telas |
| React Context API | Gerenciamento de estados compartilhados |
| Axios | Comunicação HTTP com a API |
| JSON | Formato de troca de dados |
| AsyncStorage | Persistência de preferências locais |
| Expo SQLite | Cache local de atividades |
| Expo Location | Geolocalização e conversão de coordenadas |
| Expo SecureStore | Armazenamento do token de autenticação |
| React Native DateTimePicker | Seleção de data e horário |
| React Native Safe Area Context | Ajuste da interface às áreas seguras do dispositivo |

O backend utiliza NestJS, Prisma e MySQL, em repositório separado.

## 3. Funcionalidades

### 3.1. Autenticação

- Cadastro de novos usuários;
- Login com e-mail e senha;
- Autenticação baseada em JWT;
- Armazenamento do token utilizando Expo SecureStore;
- Recuperação e validação da sessão;
- Proteção das telas que exigem autenticação;
- Encerramento da sessão por logout.

O `AuthContext` centraliza o estado de autenticação e disponibiliza informações do usuário autenticado.

### 3.2. Home

A Home apresenta as atividades cadastradas por todos os usuários.

Cada atividade exibe:

- Título e descrição;
- Data e horário;
- Local;
- Status de conclusão;
- Nome do usuário responsável pela criação;
- Quantidade de interessados;
- Nomes dos usuários interessados.

Usuários autenticados também podem demonstrar interesse em atividades criadas por outras pessoas.

Quando o usuário já demonstrou interesse, o aplicativo disponibiliza a opção **Retirar interesse**.

O criador não pode registrar interesse na própria atividade.

### 3.3. Criar atividade

A tela de criação permite informar:

- Nome da atividade;
- Descrição opcional;
- Data;
- Horário;
- Local da atividade.

O formulário possui validação de campos obrigatórios e limites de caracteres.

O local pode ser preenchido manualmente ou automaticamente utilizando a geolocalização do dispositivo.

A criação é enviada à API e somente é considerada concluída após a confirmação do servidor.

### 3.4. Minhas atividades

Apresenta apenas as atividades criadas pelo usuário autenticado.

Permite:

- Consultar atividades próprias;
- Editar informações;
- Marcar uma atividade como concluída;
- Retornar uma atividade ao estado pendente;
- Excluir atividades mediante confirmação.

As permissões de alteração também são verificadas pelo backend.

### 3.5. Perfil

A tela de Perfil permite:

- Visualizar informações do usuário;
- Consultar indicadores de atividades;
- Mostrar ou ocultar atividades concluídas;
- Selecionar o tema Claro, Escuro ou Automático;
- Encerrar a sessão.

As preferências são armazenadas localmente utilizando AsyncStorage.

## 4. Consumo de APIs com Axios e JSON

A comunicação entre o aplicativo e o backend é realizada utilizando **Axios**.

As operações HTTP estão organizadas em arquivos de serviço, evitando que as telas executem diretamente as requisições.

### 4.1. Organização da comunicação

O arquivo `src/services/api.ts` centraliza a configuração do cliente HTTP.

O arquivo `src/services/activities.service.ts` concentra as operações relacionadas às atividades.

O `ActivitiesContext` utiliza essas operações e disponibiliza os resultados para as telas.

Fluxo simplificado:

```text
Tela React Native
       |
       v
ActivitiesContext
       |
       v
activities.service.ts
       |
       v
Axios + JSON
       |
       v
API NestJS
       |
       v
MySQL
```

### 4.2. Consulta de atividades

Exemplo de função utilizada para consultar todas as atividades:

```typescript
export async function getAllActivities():
  Promise<ApiActivity[]> {

  const response = await api.get<ApiActivity[]>(
    "/activities"
  );

  return response.data;
}
```

A resposta é recebida em JSON e convertida para o formato utilizado nos componentes React Native.

Essa conversão ocorre em `activity.mapper.ts`, que transforma, por exemplo, valores de data e horário recebidos em formato ISO em objetos `Date`.

### 4.3. Operações CRUD

| Operação | Método HTTP | Endpoint |
|---|---|---|
| Listar atividades | GET | `/activities` |
| Listar minhas atividades | GET | `/activities/my` |
| Criar atividade | POST | `/activities` |
| Editar atividade | PATCH | `/activities/:id` |
| Alterar status | PATCH | `/activities/:id/status` |
| Excluir atividade | DELETE | `/activities/:id` |

Após uma operação bem-sucedida, o `ActivitiesContext` atualiza o estado da aplicação.

### 4.4. Registro de interessados

A Home também utiliza a API para permitir a interação entre usuários.

Endpoints utilizados:

```http
POST /activities/:id/interests
DELETE /activities/:id/interests/me
```

O primeiro registra interesse, enquanto o segundo remove o interesse do usuário autenticado.

O servidor utiliza o JWT para identificar quem realizou a operação.

O aplicativo atualiza a quantidade e os nomes dos interessados após a confirmação da API.

### 4.5. Tratamento de erros

As requisições são realizadas de maneira assíncrona, utilizando `async/await` e tratamento de exceções.

Em caso de falha, o aplicativo apresenta mensagens apropriadas ao usuário.

As operações também possuem mecanismos para impedir requisições duplicadas durante o processamento.

## 5. Persistência local com AsyncStorage

O AsyncStorage é utilizado para armazenar preferências simples no dispositivo.

O armazenamento funciona com pares de chave e valor.

No aplicativo, utilizamos AsyncStorage principalmente para o **Dark Mode** e para a preferência de exibição das atividades concluídas.

### 5.1. Dark Mode

O aplicativo oferece três opções:

| Modo | Comportamento |
|---|---|
| Claro | Utiliza a paleta clara |
| Escuro | Utiliza a paleta escura |
| Automático | Acompanha a preferência do sistema operacional |

O gerenciamento ocorre em `src/contexts/ThemeContext.tsx`.

Quando o usuário escolhe um tema, o contexto atualiza imediatamente a interface e salva a preferência.

Exemplo:

```typescript
await AsyncStorage.setItem(
  "@projeto-mobile:theme",
  "dark"
);
```

Na inicialização, a preferência é recuperada:

```typescript
const storedMode = await AsyncStorage.getItem(
  "@projeto-mobile:theme"
);
```

O `ThemeContext` fornece as cores apropriadas para os componentes, permitindo alternar entre os temas.

### 5.2. Preferência de atividades concluídas

A opção de mostrar ou ocultar atividades concluídas também é persistida.

Para separar as preferências de diferentes usuários, a chave inclui o ID da conta:

```typescript
const key =
  `@projeto-mobile:showCompleted:${currentUserId}`;
```

Dessa forma, cada usuário mantém suas próprias configurações de exibição.

### 5.3. Benefícios

- Preferências preservadas após reiniciar o aplicativo;
- Atualização imediata da interface;
- Funcionamento independente da API;
- Armazenamento simples, adequado a configurações individuais.

## 6. Persistência local com SQLite

O SQLite foi implementado como **cache local de atividades para leitura offline**.

O MySQL continua sendo o banco oficial do sistema.

O SQLite mantém uma cópia das informações previamente recebidas da API, permitindo que o usuário consulte atividades quando houver uma falha de conexão com o servidor.

A implementação está concentrada em:

```text
src/database/activities.cache.ts
```

### 6.1. Funcionamento do cache

Quando o aplicativo consegue consultar a API:

1. O `ActivitiesContext` solicita as atividades ao servidor.
2. A resposta JSON é convertida em objetos utilizados pelo aplicativo.
3. Os dados são apresentados na interface.
4. Uma cópia das atividades é salva no SQLite.

Quando a API fica indisponível:

1. O aplicativo identifica a falha de comunicação.
2. Consulta o cache SQLite da conta autenticada.
3. Recupera as atividades previamente armazenadas.
4. Exibe os registros na Home ou em Minhas atividades.
5. Informa que os dados são locais e podem estar desatualizados.

### 6.2. Estrutura do banco local

O cache possui duas tabelas principais.

| Tabela | Finalidade |
|---|---|
| `cached_activities` | Armazena cópias das atividades |
| `cache_metadata` | Armazena a data da última sincronização |

Entre as informações armazenadas estão:

- ID da atividade;
- ID e nome do criador;
- Título e descrição;
- Data e horário;
- Local;
- Status;
- Nomes e quantidade de interessados;
- Informação de interesse do usuário autenticado.

As informações são separadas pelo ID da conta e pelo escopo da consulta.

São utilizados os escopos `all`, para a Home, e `mine`, para Minhas atividades.

### 6.3. Gravação e consultas

O banco é aberto utilizando `openDatabaseAsync`, da biblioteca `expo-sqlite`.

As operações utilizam consultas SQL parametrizadas.

Na substituição de uma lista completa, são utilizadas transações para evitar gravações parcialmente concluídas.

As informações dos interessados são armazenadas em formato JSON no cache e reconstruídas quando os registros são recuperados.

### 6.4. Atualização do cache após alterações

Quando uma operação online é confirmada pela API, a cópia local também é atualizada.

Exemplos:

- Criar uma atividade: adiciona o registro ao cache;
- Editar uma atividade: atualiza o registro local;
- Alterar status: atualiza o estado armazenado;
- Excluir uma atividade: remove o registro;
- Demonstrar ou retirar interesse: atualiza os interessados.

O SQLite não é utilizado como fonte de escrita quando o servidor está indisponível.

### 6.5. Limitações do modo offline

O modo offline é **somente leitura**.

Enquanto o aplicativo utiliza dados do SQLite, ficam indisponíveis:

- Criação de atividades;
- Edição;
- Exclusão;
- Alteração de status;
- Registro e remoção de interesses.

O acesso ao cache não substitui a autenticação.

Respostas HTTP explícitas de acesso negado, como `401` e `403`, não são utilizadas para liberar a leitura offline.

**Observação:** a leitura offline foi implementada para uma sessão já autenticada e aberta. A inicialização do aplicativo completamente offline após encerrá-lo não é garantida, pois a validação inicial da sessão depende do backend.

Não existe fila de operações pendentes para sincronização posterior.

## 7. Diferenças entre AsyncStorage e SQLite

| Característica | AsyncStorage | SQLite |
|---|---|---|
| Modelo de armazenamento | Chave e valor | Tabelas e registros |
| Principal utilização | Preferências | Cache de atividades |
| Consultas SQL | Não | Sim |
| Dark Mode | Sim | Não |
| Filtro de concluídas | Sim | Não |
| Leitura offline de atividades | Não | Sim |
| Dependência do servidor | Não | Cache criado a partir da API |

A utilização das duas tecnologias permite armazenar cada tipo de informação de maneira adequada.

## 8. Geolocalização com Expo Location

A geolocalização foi implementada para facilitar o preenchimento do local de uma atividade.

O recurso está disponível nos formulários de criação e edição.

A biblioteca utilizada é `expo-location`.

### 8.1. Verificação dos serviços

Antes de solicitar a posição, o aplicativo verifica se os serviços de localização estão ativados:

```typescript
const enabled =
  await Location.hasServicesEnabledAsync();
```

Caso estejam desativados, o usuário recebe uma mensagem orientando a ativá-los.

### 8.2. Solicitação de permissão

O aplicativo solicita acesso à localização em primeiro plano:

```typescript
const permission =
  await Location.requestForegroundPermissionsAsync();
```

Se a permissão não for concedida, o preenchimento automático não é realizado.

O usuário continua podendo digitar o local manualmente.

### 8.3. Obtenção das coordenadas

Após a autorização, o aplicativo tenta obter a localização atual:

```typescript
const position =
  await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });
```

O retorno contém informações como latitude e longitude.

### 8.4. Geocodificação reversa

Para transformar coordenadas em um endereço legível, utilizamos:

```typescript
const addresses =
  await Location.reverseGeocodeAsync({
    latitude,
    longitude,
  });
```

As informações retornadas são organizadas para preencher o campo Local, utilizando rua, número, bairro, cidade e região quando disponíveis.

### 8.5. Tratamento de falhas

Foram implementados mecanismos para lidar com problemas de localização:

- Verificação de GPS desativado;
- Tratamento de permissão negada;
- Tempo limite de dez segundos para obter a posição atual;
- Tentativa de recuperar a última localização conhecida;
- Aceitação de posição anterior com até sessenta segundos;
- Tempo limite de cinco segundos para conversão em endereço;
- Utilização das coordenadas quando o endereço não é identificado;
- Possibilidade de informar o local manualmente.

Também utilizamos um identificador de solicitação para impedir que uma resposta atrasada do GPS sobrescreva um endereço digitado pelo usuário.

## 9. Arquitetura do aplicativo

```text
React Native + Expo
        |
        +-- Expo Router
        |      |
        |      +-- Home
        |      +-- Criar
        |      +-- Minhas Atividades
        |      +-- Perfil
        |
        +-- Context API
        |      |
        |      +-- AuthContext
        |      +-- ActivitiesContext
        |      +-- ThemeContext
        |
        +-- Services
        |      |
        |      +-- Axios + JSON
        |      +-- API NestJS
        |
        +-- Persistência local
        |      |
        |      +-- AsyncStorage
        |      +-- SQLite
        |      +-- SecureStore
        |
        +-- Recursos nativos
               |
               +-- Expo Location
               +-- DateTimePicker
```

## 10. Estrutura de pastas

```text
projeto-mobile/
├── assets/
├── src/
│   ├── app/
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── (tabs)/
│   │       ├── _layout.tsx
│   │       ├── index.tsx
│   │       ├── create.tsx
│   │       ├── my-activities.tsx
│   │       └── profile.tsx
│   ├── components/
│   │   ├── ActivityCard/
│   │   ├── ActivityForm/
│   │   ├── EditActivityModal/
│   │   └── ProfileStatCard/
│   ├── contexts/
│   │   ├── AuthContext.tsx
│   │   ├── ActivitiesContext.tsx
│   │   └── ThemeContext.tsx
│   ├── database/
│   │   └── activities.cache.ts
│   ├── services/
│   │   ├── api.ts
│   │   ├── activities.service.ts
│   │   ├── activity.mapper.ts
│   │   └── auth.service.ts
│   ├── styles/
│   ├── theme/
│   └── types/
├── app.json
├── package.json
└── README.md
```

## 11. Instalação e execução

### Pré-requisitos

- Node.js e npm;
- Expo Go compatível com o Expo SDK 57;
- Dispositivo Android/iOS ou emulador compatível;
- API NestJS configurada e em execução;
- MySQL disponível para o backend.

### 11.1. Clonar o repositório

```bash
git clone https://github.com/douchasdev/projeto-mobile.git
cd projeto-mobile
```

### 11.2. Instalar dependências

```bash
npm install
```

### 11.3. Configurar a API

Verifique a configuração da URL da API em:

```text
src/services/api.ts
```

Para utilizar um celular físico, informe o endereço IP local do computador que executa o backend.

Exemplo:

```text
http://192.168.1.100:3000
```

Substitua pelo IP real da máquina.

Em um celular, `localhost` representa o próprio aparelho, não o computador.

O celular e o computador devem ter conectividade de rede, e a porta do servidor deve estar acessível.

### 11.4. Iniciar o backend

No repositório da API:

```bash
npm run start:dev
```

### 11.5. Iniciar o aplicativo

No repositório do frontend:

```bash
npx expo start --clear
```

Abra o projeto utilizando o Expo Go ou um emulador compatível.

## 12. Verificação e testes

Para verificar os tipos TypeScript:

```bash
npx tsc --noEmit
```

### Roteiro de testes

1. Cadastrar dois usuários e realizar login;
2. Criar uma atividade com o primeiro usuário;
3. Consultar a atividade na Home com a segunda conta;
4. Verificar o nome do criador;
5. Demonstrar interesse e verificar a lista de interessados;
6. Retirar o interesse;
7. Editar, concluir e excluir atividades próprias;
8. Alternar entre temas Claro, Escuro e Automático;
9. Reiniciar o aplicativo e verificar a persistência do tema;
10. Alterar e recuperar o filtro de atividades concluídas;
11. Utilizar o GPS para preencher a localização;
12. Sincronizar as atividades com o servidor disponível;
13. Desligar o backend sem encerrar a sessão do aplicativo;
14. Atualizar a Home e verificar a leitura pelo SQLite;
15. Religar o backend e atualizar as atividades novamente.

## 13. Limitações conhecidas

- A criação e a alteração de atividades dependem de conexão com a API.
- O cache SQLite funciona somente para leitura offline.
- A inicialização completamente offline após fechar o aplicativo não foi implementada.
- Dados armazenados no SQLite podem estar desatualizados.
- O SQLite não oferece criptografia automática dos registros nesta implementação.
- Os seletores nativos de data e horário podem seguir o tema do sistema ou do Expo Go.
- Não existe confirmação de presença ou limite de vagas para interessados.
- Captura de fotos e geração de imagens de treino não fazem parte da versão atual.

## 14. Considerações finais

O projeto demonstra a integração de diferentes recursos utilizados no desenvolvimento mobile.

O **Axios** permite a comunicação com a API, o **AsyncStorage** mantém preferências locais, o **SQLite** fornece leitura de dados previamente sincronizados e o **Expo Location** permite utilizar a geolocalização do dispositivo.

Essas tecnologias foram integradas a uma aplicação com autenticação, CRUD de atividades, gerenciamento de estado, Dark Mode e interação entre usuários.

## Backend

O backend está disponível em:

https://github.com/douchasdev/projeto-mobile-api