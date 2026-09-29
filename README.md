# Projeto Mobile - Gerenciador de Atividades

Aplicativo mobile desenvolvido com **React Native**, **Expo** e **TypeScript** para gerenciamento de atividades.

A aplicação permite cadastrar atividades, visualizar tarefas pendentes e concluídas, alterar o status de uma atividade e configurar a exibição das atividades concluídas.

O projeto foi desenvolvido com o objetivo de aplicar os principais conceitos de desenvolvimento mobile trabalhados em aula, como componentes funcionais, Props, State, componentes básicos do React Native, StyleSheet, Flexbox, listas e navegação entre telas.

---

## Funcionalidades

A aplicação possui três telas principais: **Home**, **Criar** e **Perfil**.

### Home

A tela inicial apresenta as atividades cadastradas utilizando uma `FlatList`.

Cada atividade apresenta:

- Nome da atividade;
- Data;
- Horário;
- Local;
- Estado de conclusão.

O usuário pode marcar ou desmarcar uma atividade como concluída através do próprio card.

A tela também respeita a preferência definida no perfil para mostrar ou ocultar atividades concluídas.

Quando não existem atividades cadastradas, uma mensagem é apresentada ao usuário.

### Criar atividade

A tela de criação permite cadastrar uma nova atividade informando:

- Nome da atividade;
- Data;
- Horário;
- Local.

Todos os campos são obrigatórios.

A seleção de data e horário é realizada utilizando o `DateTimePicker`.

Antes da criação, os campos são validados. Caso algum campo obrigatório não tenha sido preenchido, a aplicação apresenta uma mensagem ao usuário.

Após a validação, a nova atividade é adicionada ao estado compartilhado da aplicação e passa a ser disponibilizada para as demais telas.

### Perfil

A tela de perfil apresenta:

- Avatar do usuário;
- Nome editável;
- Quantidade de atividades pendentes;
- Quantidade de atividades concluídas;
- Configuração para mostrar ou ocultar atividades concluídas na Home.

As estatísticas são calculadas a partir da lista compartilhada de atividades e são atualizadas conforme o estado das atividades é alterado.

---

## Tecnologias utilizadas

- React Native;
- Expo;
- TypeScript;
- Expo Router;
- React Native Safe Area Context;
- React Native Community DateTimePicker.

---

## Estrutura do projeto

O código-fonte está organizado dentro da pasta `src`, separando telas, componentes reutilizáveis, contexto, estilos e tipos.

```text
src/
├── app/
│   ├── _layout.tsx
│   ├── create.tsx
│   ├── index.tsx
│   └── profile.tsx
│
├── components/
│   ├── ActivityCard/
│   │   ├── ActivityCard.tsx
│   │   └── ActivityCard.styles.ts
│   │
│   ├── ActivityForm/
│   │   ├── ActivityForm.tsx
│   │   └── ActivityForm.styles.ts
│   │
│   └── ProfileStatCard/
│       ├── ProfileStatCard.tsx
│       └── ProfileStatCard.styles.ts
│
├── contexts/
│   └── ActivitiesContext.tsx
│
├── styles/
│   ├── create.styles.ts
│   ├── index.styles.ts
│   └── profile.styles.ts
│
└── types/
    └── Activity.ts
```

---

## Organização das pastas

### `src/app`

Contém as telas da aplicação e a configuração principal da navegação.

```text
app/
├── _layout.tsx
├── create.tsx
├── index.tsx
└── profile.tsx
```

Os arquivos possuem as seguintes responsabilidades:

- `_layout.tsx` — configura a navegação principal da aplicação;
- `index.tsx` — implementa a tela Home;
- `create.tsx` — implementa a tela de criação de atividades;
- `profile.tsx` — implementa a tela de perfil.

Como a pasta `app` é utilizada pelo Expo Router para representar as rotas da aplicação, os estilos específicos dessas telas foram mantidos separadamente em `src/styles`.

---

### `src/components`

Contém os componentes reutilizáveis da aplicação.

Cada componente possui sua própria pasta contendo o arquivo `.tsx` e seu respectivo arquivo `.styles.ts`.

```text
components/
├── ActivityCard/
│   ├── ActivityCard.tsx
│   └── ActivityCard.styles.ts
│
├── ActivityForm/
│   ├── ActivityForm.tsx
│   └── ActivityForm.styles.ts
│
└── ProfileStatCard/
    ├── ProfileStatCard.tsx
    └── ProfileStatCard.styles.ts
```

Os componentes possuem as seguintes responsabilidades:

- `ActivityCard` — representa visualmente uma atividade;
- `ActivityForm` — contém o formulário utilizado para criar atividades;
- `ProfileStatCard` — apresenta as estatísticas da tela de perfil.

---

### `src/contexts`

Contém os contextos utilizados para compartilhar informações entre diferentes partes da aplicação.

```text
contexts/
└── ActivitiesContext.tsx
```

O `ActivitiesContext` é responsável pelo gerenciamento da lista de atividades e pela preferência de exibição das atividades concluídas.

---

### `src/styles`

Contém os arquivos responsáveis pela estilização das telas principais.

```text
styles/
├── create.styles.ts
├── index.styles.ts
└── profile.styles.ts
```

Cada arquivo corresponde a uma tela:

```text
app/index.tsx
    ↓
styles/index.styles.ts

app/create.tsx
    ↓
styles/create.styles.ts

app/profile.tsx
    ↓
styles/profile.styles.ts
```

---

### `src/types`

Contém as definições de tipos TypeScript utilizadas pela aplicação.

```text
types/
└── Activity.ts
```

O arquivo `Activity.ts` define a estrutura utilizada para representar uma atividade.

---

## Separação entre lógica, interface e estilização

A organização do projeto busca separar a estilização dos arquivos responsáveis pela lógica e pela construção das interfaces.

Nas telas, a estrutura segue o seguinte padrão:

```text
src/app/index.tsx
src/styles/index.styles.ts
```

O arquivo `.tsx` contém a implementação da tela, enquanto o arquivo `.styles.ts` contém sua estilização.

Nos componentes reutilizáveis, o componente e sua estilização permanecem agrupados na mesma pasta:

```text
src/components/ActivityCard/
├── ActivityCard.tsx
└── ActivityCard.styles.ts
```

Dessa forma, os arquivos `.tsx` concentram principalmente:

- Estrutura JSX;
- Props;
- Estados;
- Funções;
- Eventos;
- Comportamento dos componentes.

Enquanto os arquivos `.styles.ts` concentram:

- Cores;
- Espaçamentos;
- Bordas;
- Dimensões;
- Tipografia;
- Alinhamento;
- Propriedades de Flexbox.

Essa separação melhora a legibilidade e facilita a manutenção dos arquivos.

---

## Componentes funcionais

Todas as telas e componentes da aplicação foram desenvolvidos utilizando componentes funcionais.

Entre os principais componentes estão:

```text
HomeScreen
CreateScreen
ProfileScreen
ActivityCard
ActivityForm
ProfileStatCard
```

Um exemplo é o `ProfileStatCard`:

```tsx
export default function ProfileStatCard({
  value,
  label,
}: ProfileStatCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.value}>
        {value}
      </Text>

      <Text style={styles.label}>
        {label}
      </Text>
    </View>
  );
}
```

---

## Props

Props são utilizadas para transmitir informações de um componente pai para um componente filho.

O componente `ProfileStatCard`, por exemplo, recebe:

```tsx
type ProfileStatCardProps = {
  value: number;
  label: string;
};
```

Na tela de perfil, o mesmo componente pode ser reutilizado para apresentar informações diferentes:

```tsx
<ProfileStatCard
  value={pendingCount}
  label="Pendentes"
/>

<ProfileStatCard
  value={completedCount}
  label="Concluídas"
/>
```

O `ActivityCard` também utiliza Props:

```tsx
type ActivityCardProps = {
  activity: Activity;
  onToggleCompleted: () => void;
};
```

Nesse caso, o componente recebe a atividade que deverá ser apresentada e uma função utilizada para alterar seu estado de conclusão.

---

## State

O hook `useState` é utilizado para armazenar informações que podem mudar durante a execução da aplicação.

No formulário de criação são utilizados estados para armazenar os dados informados pelo usuário:

```tsx
const [activity, setActivity] = useState('');
const [location, setLocation] = useState('');
const [date, setDate] = useState<Date | null>(null);
const [time, setTime] = useState<Date | null>(null);
```

Também são utilizados estados para controlar a exibição dos seletores de data e horário.

Na tela de perfil, State é utilizado para controlar o nome do usuário e determinar se o campo de edição está sendo exibido.

---

## Context API

Além dos estados locais, a aplicação utiliza a Context API para compartilhar informações entre diferentes telas.

O `ActivitiesContext` mantém:

- Lista de atividades;
- Criação de novas atividades;
- Alteração do estado de conclusão;
- Preferência de exibição das atividades concluídas.

O provider é aplicado sobre a navegação da aplicação:

```tsx
<ActivitiesProvider>
  <NativeTabs>
    ...
  </NativeTabs>
</ActivitiesProvider>
```

Dessa forma, as diferentes telas possuem acesso ao mesmo conjunto de dados.

Uma atividade criada na tela **Criar**, por exemplo, pode ser apresentada na **Home** e contabilizada nas estatísticas do **Perfil**.

---

## Modelo de atividade

As atividades são representadas através do tipo `Activity`:

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

Cada atividade possui:

- `id` — identificador único;
- `title` — nome da atividade;
- `date` — data;
- `time` — horário;
- `location` — local;
- `completed` — indica se a atividade foi concluída.

Para criação de uma atividade também é utilizado o tipo:

```tsx
export type NewActivity = Omit<
  Activity,
  'id' | 'completed'
>;
```

O `id` e o estado `completed` não precisam ser informados pelo formulário, pois são definidos pela própria aplicação durante a criação da atividade.

---

## Componentes do React Native

A aplicação utiliza diferentes componentes fornecidos pelo React Native.

### View

Utilizado como contêiner para organizar os elementos da interface.

### Text

Utilizado para apresentar informações textuais.

### Image

Utilizado para apresentar o avatar na tela de perfil.

### Pressable

Utilizado para elementos interativos, como:

- Botão Criar;
- Botão Cancelar;
- Botão Editar nome;
- Botão Salvar;
- Seleção de data;
- Seleção de horário;
- Alteração do estado de conclusão de uma atividade.

### TextInput

Utilizado nos campos do formulário e na edição do nome do usuário.

### ScrollView

Utilizado na tela de perfil para permitir a rolagem vertical do conteúdo.

### Switch

Utilizado para controlar a preferência de exibição das atividades concluídas.

### FlatList

Utilizado na Home para apresentar a lista de atividades.

---

## StyleSheet

A estilização da aplicação é realizada utilizando `StyleSheet`, recurso fornecido pelo React Native.

Os estilos são definidos em arquivos específicos utilizando:

```tsx
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
```

As telas importam seus estilos a partir da pasta `styles`.

Exemplo:

```tsx
import { styles } from '../styles/index.styles';
```

Os componentes reutilizáveis importam o arquivo de estilo presente na própria pasta.

Exemplo:

```tsx
import { styles } from './ActivityCard.styles';
```

---

## Flexbox

Flexbox é utilizado para organizar e alinhar os elementos da interface.

Um exemplo pode ser encontrado nos botões do formulário:

```tsx
actions: {
  flexDirection: 'row',
  justifyContent: 'flex-end',
  gap: 12,
},
```

Nesse caso, os botões são posicionados horizontalmente.

Outro exemplo está na tela de perfil:

```tsx
stats: {
  flexDirection: 'row',
  gap: 12,
},
```

Isso permite apresentar os cards de atividades pendentes e concluídas lado a lado.

O projeto também utiliza propriedades como:

```text
flex
flexDirection
alignItems
justifyContent
gap
```

para organizar a interface.

---

## FlatList

A tela Home utiliza `FlatList` para renderizar as atividades cadastradas.

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

A propriedade `data` recebe as atividades que devem ser apresentadas.

O `keyExtractor` utiliza o identificador único de cada atividade.

O `renderItem` determina como cada atividade será renderizada, utilizando o componente `ActivityCard`.

---

## Filtro de atividades concluídas

A Home considera a preferência definida pelo usuário no Perfil.

As atividades que serão apresentadas são determinadas por:

```tsx
const visibleActivities = showCompleted
  ? activities
  : activities.filter(
      (activity) => !activity.completed
    );
```

Quando `showCompleted` é verdadeiro, todas as atividades são apresentadas.

Quando é falso, somente atividades que ainda não foram concluídas são enviadas para a `FlatList`.

---

## Navegação

A aplicação utiliza **Expo Router** para organizar a navegação entre as telas.

A configuração principal está localizada em:

```text
src/app/_layout.tsx
```

A aplicação possui três rotas principais:

```text
index    → Home
create   → Criar
profile  → Perfil
```

A navegação principal utiliza abas através de `NativeTabs`.

Exemplo:

```tsx
<NativeTabs.Trigger name="index">
  <NativeTabs.Trigger.Label>
    Home
  </NativeTabs.Trigger.Label>

  <NativeTabs.Trigger.Icon
    sf="house.fill"
    md="home"
  />
</NativeTabs.Trigger>
```

Dessa forma, o usuário pode alternar entre **Home**, **Criar** e **Perfil** através da barra de navegação.

---

## Safe Area

As telas utilizam `SafeAreaView` através do pacote:

```text
react-native-safe-area-context
```

Esse recurso ajuda a evitar que elementos da interface sejam apresentados em regiões reservadas pelo sistema operacional do dispositivo.

Exemplo:

```tsx
<SafeAreaView style={styles.container}>
  ...
</SafeAreaView>
```

---

## Seleção de data e horário

O formulário utiliza o componente `DateTimePicker` para permitir a seleção de data e horário.

Para data:

```tsx
<DateTimePicker
  value={date ?? new Date()}
  mode="date"
  display="default"
/>
```

Para horário:

```tsx
<DateTimePicker
  value={time ?? new Date()}
  mode="time"
  display="default"
  is24Hour={true}
/>
```

Os valores selecionados são armazenados no State do formulário.

---

## Validação do formulário

Antes de criar uma atividade, o formulário verifica se todos os campos obrigatórios foram preenchidos.

Exemplo:

```tsx
if (!activity.trim()) {
  Alert.alert(
    'Campo obrigatório',
    'Informe o nome da atividade.'
  );

  return;
}
```

Validações semelhantes são realizadas para:

- Data;
- Horário;
- Local.

Somente após todas as validações a atividade é adicionada ao contexto.

---

## Fluxo de dados

O `ActivitiesContext` funciona como ponto central para o compartilhamento das informações.

```text
                ┌─────────────────────┐
                │        Criar        │
                │    ActivityForm     │
                └──────────┬──────────┘
                           │
                           │ addActivity()
                           ▼
                ┌─────────────────────┐
                │  ActivitiesContext  │
                └──────────┬──────────┘
                           │
                ┌──────────┴──────────┐
                │                     │
                ▼                     ▼
        ┌───────────────┐     ┌───────────────┐
        │     Home      │     │    Perfil     │
        │   FlatList    │     │ Estatísticas  │
        └───────┬───────┘     └───────────────┘
                │
                ▼
        ┌───────────────┐
        │ ActivityCard  │
        └───────────────┘
```

O fluxo principal ocorre da seguinte maneira:

1. O usuário preenche o `ActivityForm`;
2. O formulário executa `addActivity()`;
3. A atividade é armazenada no `ActivitiesContext`;
4. A Home recebe a lista atualizada;
5. A `FlatList` renderiza um `ActivityCard` para cada atividade;
6. O Perfil utiliza a mesma lista para calcular as estatísticas.

---

## Como executar o projeto

### Pré-requisitos

Para executar o projeto é necessário possuir:

- Node.js;
- npm;
- Expo Go instalado no dispositivo móvel.

### 1. Clonar o repositório

```bash
git clone <URL-DO-REPOSITORIO>
```

### 2. Acessar a pasta do projeto

```bash
cd projeto-mobile
```

### 3. Instalar as dependências

```bash
npm install
```

### 4. Iniciar o projeto

Execute:

```bash
npx expo start
```

ou:

```bash
npm start
```

### 5. Executar no dispositivo

Com o **Expo Go** instalado no dispositivo móvel, utilize o QR Code apresentado pelo Expo para abrir a aplicação.

---

## Requisitos contemplados

| Requisito | Implementação no projeto |
|---|---|
| React Native com Expo | Base tecnológica da aplicação |
| Execução no Expo Go | Projeto desenvolvido utilizando o ambiente Expo |
| Estrutura organizada | Separação em `app`, `components`, `contexts`, `styles` e `types` |
| Componentes funcionais | Utilizados nas telas e componentes reutilizáveis |
| Props | Utilizadas em `ActivityCard` e `ProfileStatCard` |
| State | Utilizado no formulário, perfil e contexto |
| `View` | Organização dos elementos da interface |
| `Text` | Apresentação das informações |
| `Image` | Avatar do perfil |
| `Pressable` | Botões, seletores e conclusão de atividades |
| `ScrollView` | Utilizado na tela Perfil |
| `TextInput` | Formulário e edição do nome |
| `Switch` | Preferência de exibição das atividades concluídas |
| StyleSheet | Estilos separados em arquivos `.styles.ts` |
| Flexbox | Organização e alinhamento dos elementos |
| FlatList | Listagem das atividades na Home |
| Navegação | Expo Router com navegação por abas |
| Interface mobile | Safe Area, componentes interativos e organização responsiva |

---

## Persistência dos dados

Atualmente, as atividades e preferências são armazenadas no estado da aplicação através do `ActivitiesContext`.

Isso significa que os dados não possuem persistência permanente e podem ser perdidos quando a aplicação é encerrada ou recarregada.

O nome editado no Perfil também é mantido apenas no estado local da tela.

Uma possível evolução do projeto seria utilizar armazenamento local, como **AsyncStorage**, para manter essas informações entre diferentes execuções da aplicação.

---

## Possíveis melhorias futuras

Algumas funcionalidades que podem ser adicionadas futuramente são:

- Persistência local utilizando AsyncStorage;
- Compartilhamento de atividade com outros usuarios;
- Integração a API de geolocalização.

---

## Autor

**Douglas Rezende Chagas**

Projeto desenvolvido como atividade acadêmica utilizando **React Native**, **Expo** e **TypeScript**.