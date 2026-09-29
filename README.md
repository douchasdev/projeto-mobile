# Projeto Mobile - Gerenciador de Atividades

Aplicativo mobile desenvolvido com **React Native**, **Expo** e **TypeScript** para gerenciamento de atividades.

O sistema permite cadastrar atividades, visualizar tarefas pendentes e concluídas, alterar o status de uma atividade e configurar a exibição das atividades concluídas. O projeto foi desenvolvido com foco na aplicação dos principais conceitos de desenvolvimento mobile trabalhados em aula.

## Funcionalidades

O aplicativo possui três telas principais:

### Home

A tela inicial apresenta as atividades cadastradas utilizando uma `FlatList`.

Cada atividade apresenta:

- Nome da atividade;
- Data;
- Horário;
- Local;
- Status de conclusão.

O usuário pode marcar ou desmarcar uma atividade como concluída através de um botão no próprio card.

A tela também respeita a preferência definida no perfil para mostrar ou ocultar atividades concluídas.

### Criar atividade

A tela de criação permite cadastrar uma nova atividade informando:

- Nome da atividade;
- Data;
- Horário;
- Local.

Todos os campos são obrigatórios.

Para seleção de data e horário é utilizado o `DateTimePicker`.

Após a validação dos campos, a atividade é adicionada ao estado compartilhado da aplicação e passa a ser exibida na tela inicial.

### Perfil

A tela de perfil apresenta:

- Avatar do usuário;
- Nome editável;
- Quantidade de atividades pendentes;
- Quantidade de atividades concluídas;
- Configuração para mostrar ou ocultar atividades concluídas na Home.

As estatísticas são atualizadas automaticamente de acordo com o estado das atividades.

## Tecnologias utilizadas

- React Native
- Expo
- TypeScript
- Expo Router
- React Native Safe Area Context
- React Native Community DateTimePicker

## Conceitos utilizados

O projeto aplica diferentes conceitos de React Native trabalhados durante o desenvolvimento mobile.

### Componentes funcionais

As telas e componentes da aplicação foram implementados utilizando componentes funcionais.

Exemplos:

- `ActivityCard`
- `ActivityForm`
- `ProfileStatCard`
- `HomeScreen`
- `ProfileScreen`

### Props

Props são utilizadas para transmitir informações entre componentes.

O componente `ProfileStatCard`, por exemplo, recebe:

```tsx
type ProfileStatCardProps = {
  value: number;
  label: string;
};
```

Dessa forma, o mesmo componente pode ser reutilizado para apresentar atividades pendentes e concluídas.

O `ActivityCard` também recebe a atividade que deverá ser apresentada e uma função para alterar seu estado de conclusão.

### State

O hook `useState` é utilizado para controlar informações que podem mudar durante a execução da aplicação.

No formulário de criação, por exemplo, são armazenados:

```tsx
const [activity, setActivity] = useState('');
const [location, setLocation] = useState('');
const [date, setDate] = useState<Date | null>(null);
const [time, setTime] = useState<Date | null>(null);
```

Na tela de perfil, State também é utilizado para controlar o nome do usuário e o modo de edição.

### Context API

O projeto utiliza a Context API para compartilhar as atividades entre diferentes telas.

O `ActivitiesContext` mantém:

- Lista de atividades;
- Criação de atividades;
- Alteração do status de conclusão;
- Preferência de exibição das atividades concluídas.

Isso permite que uma atividade criada na tela **Criar** seja automaticamente disponibilizada para a **Home** e para as estatísticas do **Perfil**.

### Componentes básicos do React Native

Foram utilizados componentes básicos do React Native, incluindo:

- `View`
- `Text`
- `Image`
- `TextInput`
- `Pressable`
- `ScrollView`
- `Switch`
- `FlatList`

### StyleSheet e Flexbox

A estilização das interfaces é realizada através de `StyleSheet.create()`.

Flexbox é utilizado para organização e alinhamento dos componentes, por exemplo:

```tsx
flexDirection: 'row',
alignItems: 'center',
justifyContent: 'space-between',
```

Isso permite construir interfaces adaptadas para dispositivos móveis.

### FlatList

A tela Home utiliza `FlatList` para renderizar a lista de atividades:

```tsx
<FlatList
  data={visibleActivities}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => (
    <ActivityCard
      activity={item}
      onToggleCompleted={() =>
        toggleActivityCompleted(item.id)
      }
    />
  )}
/>
```

A lista também pode ser filtrada de acordo com a preferência de exibição das atividades concluídas.

### Navegação

A navegação da aplicação é organizada utilizando **Expo Router**, com navegação por abas nativas.

As três rotas principais são:

- `index` - Home;
- `create` - Criar atividade;
- `profile` - Perfil.

A configuração principal está localizada em:

```text
src/app/_layout.tsx
```

## Estrutura do projeto

```text
projeto-mobile/
├── assets/
│   └── images/
│       └── avatar.png
│
├── src/
│   ├── app/
│   │   ├── _layout.tsx
│   │   ├── index.tsx
│   │   ├── create.tsx
│   │   └── profile.tsx
│   │
│   ├── components/
│   │   ├── ActivityCard.tsx
│   │   ├── ActivityForm.tsx
│   │   └── ProfileStatCard.tsx
│   │
│   ├── contexts/
│   │   └── ActivitiesContext.tsx
│   │
│   └── types/
│       └── Activity.ts
│
├── app.json
├── package.json
├── tsconfig.json
└── README.md
```

### `src/app`

Contém as telas e a configuração de navegação da aplicação.

### `src/components`

Contém componentes reutilizáveis utilizados pelas telas.

### `src/contexts`

Contém o contexto responsável pelo gerenciamento e compartilhamento das atividades.

### `src/types`

Contém os tipos TypeScript utilizados para representar os dados da aplicação.

## Modelo de atividade

Uma atividade é representada pela seguinte estrutura:

```tsx
export type Activity = {
  id: string;
  title: string;
  date: Date;
  time: Date;
  location: string;
  completed: boolean;
};
```

Cada atividade possui um identificador único, título, data, horário, local e estado de conclusão.

## Como executar o projeto

### Pré-requisitos

É necessário possuir:

- Node.js;
- npm;
- Expo Go instalado no dispositivo móvel.

### 1. Clonar o repositório

```bash
git clone <URL-DO-REPOSITORIO>
```

Acesse a pasta do projeto:

```bash
cd projeto-mobile
```

### 2. Instalar as dependências

```bash
npm install
```

### 3. Iniciar o Expo

```bash
npx expo start
```

ou:

```bash
npm start
```

### 4. Executar no dispositivo

Com o **Expo Go** instalado no celular, escaneie o QR Code apresentado pelo Expo.

O computador e o dispositivo móvel devem estar em condições de rede compatíveis para que a conexão com o servidor de desenvolvimento seja realizada.

## Fluxo principal da aplicação

```text
Criar atividade
      |
      v
ActivitiesContext
      |
      +--------------------+
      |                    |
      v                    v
     Home                Perfil
      |                    |
      v                    v
   FlatList           Estatísticas
      |
      v
Marcar atividade
como concluída
```

O `ActivitiesContext` funciona como ponto central para compartilhamento das informações entre as telas.

## Requisitos contemplados

| Requisito | Implementação |
|---|---|
| React Native com Expo | Base tecnológica do projeto |
| Execução no Expo Go | Aplicação desenvolvida para execução através do ambiente Expo |
| Estrutura organizada | Separação em `app`, `components`, `contexts` e `types` |
| Componentes funcionais | Utilizados em todas as telas e componentes |
| Props | `ActivityCard` e `ProfileStatCard` |
| State | Formulário, perfil e contexto |
| `View` | Organização das interfaces |
| `Text` | Exibição das informações |
| `Image` | Avatar da tela Perfil |
| `Pressable` | Botões e alteração do status das atividades |
| `ScrollView` | Tela Perfil |
| StyleSheet | Estilização dos componentes |
| Flexbox | Organização e alinhamento das interfaces |
| FlatList | Listagem das atividades na Home |
| Navegação | Expo Router com navegação por abas |
| Interface mobile | Layout desenvolvido para dispositivos móveis |


## Possíveis melhorias futuras

- Persistência das atividades com AsyncStorage;
- Compartilhamento da atividade com outros usuários.

## Autor

**Douglas Rezende Chagas**

Projeto desenvolvido como atividade acadêmica utilizando React Native e Expo.