import type { BooleanChallenge } from '../types/game';

export const LOGIC_QUESTIONS: BooleanChallenge[] = [
  // NÍVEL 1 (1–10): Variáveis, Tipos e Atribuição
  {
    id: 1,
    level: 1,
    topic: 'Variáveis',
    statement: 'Uma variável serve para armazenar um valor na memória que pode mudar durante a execução do programa.',
    answer: true,
    explanation: 'Por isso se chama "variável": seu conteúdo pode ser lido e atualizado ao longo do código.',
  },
  {
    id: 2,
    level: 1,
    topic: 'Variáveis',
    statement: 'Uma variável do tipo booleano (boolean) só pode assumir dois valores: verdadeiro (true) ou falso (false).',
    answer: true,
    explanation: 'O tipo boolean representa exatamente dois estados lógicos possíveis: true ou false.',
  },
  {
    id: 3,
    level: 1,
    topic: 'Variáveis',
    statement: 'Se x = 10 e depois executamos x = x + 5, o novo valor de x passa a ser 10.',
    answer: false,
    explanation: 'x recebe 10 + 5, portanto o novo valor armazenado em x passa a ser 15.',
  },
  {
    id: 4,
    level: 1,
    topic: 'Variáveis',
    statement: 'O valor "42" entre aspas é tratado como texto (string), e não como número inteiro.',
    answer: true,
    explanation: 'Qualquer sequência cercada por aspas ("42") é interpretada como string.',
  },
  {
    id: 5,
    level: 1,
    topic: 'Variáveis',
    statement: 'Na programação, o operador = simples sempre compara se dois valores são iguais.',
    answer: false,
    explanation: 'Um único = faz atribuição (guarda um valor); comparações usam == ou ===.',
  },
  {
    id: 6,
    level: 1,
    topic: 'Variáveis',
    statement: 'Uma constante (const) permite reatribuir um novo valor a qualquer momento após ser criada.',
    answer: false,
    explanation: 'Constantes mantêm a mesma referência/valor inicial e não aceitam nova atribuição.',
  },
  {
    id: 7,
    level: 1,
    topic: 'Variáveis',
    statement: 'O operador % (módulo) devolve o resto da divisão inteira entre dois números.',
    answer: true,
    explanation: 'Ex: 7 % 2 retorna 1, pois 7 dividido por 2 dá 3 com resto 1.',
  },
  {
    id: 8,
    level: 1,
    topic: 'Variáveis',
    statement: 'Se a = 4 e b = 2, então a expressão (a + b) * 2 resulta em 8.',
    answer: false,
    explanation: 'Os parênteses somam primeiro: (4 + 2) = 6, e 6 * 2 resulta em 12.',
  },
  {
    id: 9,
    level: 1,
    topic: 'Variáveis',
    statement: 'Em nomes de variáveis, "pontos" e "Pontos" são sempre considerados idênticos em linguagens como JavaScript.',
    answer: false,
    explanation: 'Linguagens como JS, Python e C diferenciam maiúsculas de minúsculas (case-sensitive).',
  },
  {
    id: 10,
    level: 1,
    topic: 'Variáveis',
    statement: 'Para verificar se um número inteiro n é par, podemos testar se n % 2 == 0.',
    answer: true,
    explanation: 'Todo número par dividido por 2 deixa resto igual a 0.',
  },

  // NÍVEL 2 (11–20): Condicionais e Operadores Lógicos (&&, ||, !)
  {
    id: 11,
    level: 2,
    topic: 'Condicionais',
    statement: 'O bloco if só é executado quando a condição entre parênteses é avaliada como verdadeira (true).',
    answer: true,
    explanation: 'Se a condição for false, o programa pula o if e segue para o else (se existir).',
  },
  {
    id: 12,
    level: 2,
    topic: 'Condicionais',
    statement: 'Com o operador && (E), basta apenas uma das condições ser verdadeira para o resultado final ser TRUE.',
    answer: false,
    explanation: 'No operador && (AND), TODAS as condições precisam ser verdadeiras.',
  },
  {
    id: 13,
    level: 2,
    topic: 'Condicionais',
    statement: 'Com o operador || (OU), se pelo menos uma condição for verdadeira, o resultado inteiro será TRUE.',
    answer: true,
    explanation: 'O operador || (OR) só retorna FALSE quando todas as partes são falsas.',
  },
  {
    id: 14,
    level: 2,
    topic: 'Condicionais',
    statement: 'O operador ! (NÃO) inverte o valor lógico: !true vira false e !false vira true.',
    answer: true,
    explanation: 'O operador de negação (!) sempre troca verdadeiro por falso e vice-versa.',
  },
  {
    id: 15,
    level: 2,
    topic: 'Condicionais',
    statement: 'Se vida = 0, a condição (vida > 0) && (mana >= 10) resulta em TRUE.',
    answer: false,
    explanation: 'Como vida > 0 é FALSE, o operador && torna toda a expressão FALSE.',
  },
  {
    id: 16,
    level: 2,
    topic: 'Condicionais',
    statement: 'Em uma estrutura if / else if / else, todos os blocos podem ser executados ao mesmo tempo.',
    answer: false,
    explanation: 'Apenas o primeiro bloco cuja condição for verdadeira é executado.',
  },
  {
    id: 17,
    level: 2,
    topic: 'Condicionais',
    statement: 'Se temChave = false e portaAberta = true, a expressão temChave || portaAberta é TRUE.',
    answer: true,
    explanation: 'Como portaAberta é true, o operador || garante resultado TRUE.',
  },
  {
    id: 18,
    level: 2,
    topic: 'Condicionais',
    statement: 'A expressão !(5 > 3) é avaliada como TRUE.',
    answer: false,
    explanation: '5 > 3 é true, e a negação !(true) transforma o resultado em FALSE.',
  },
  {
    id: 19,
    level: 2,
    topic: 'Condicionais',
    statement: 'O bloco else é opcional e só roda quando a condição do if anterior for falsa.',
    answer: true,
    explanation: 'O else funciona como caminho alternativo caso o if não seja atendido.',
  },
  {
    id: 20,
    level: 2,
    topic: 'Condicionais',
    statement: 'Se x = 10, o teste (x >= 10) && (x != 10) retorna TRUE.',
    answer: false,
    explanation: 'x >= 10 é true, mas x != 10 é false; logo, com && o resultado é FALSE.',
  },

  // NÍVEL 3 (21–30): Laços de Repetição (for / while)
  {
    id: 21,
    level: 3,
    topic: 'Laços for/while',
    statement: 'Um laço while continua repetindo seu bloco de código enquanto a condição permanecer verdadeira.',
    answer: true,
    explanation: 'A cada volta o while testa a condição novamente e só para quando ela fica false.',
  },
  {
    id: 22,
    level: 3,
    topic: 'Laços for/while',
    statement: 'Se a condição de um while nunca se tornar falsa, ocorre um loop infinito.',
    answer: true,
    explanation: 'Sem atualização da variável de controle ou break, o laço roda sem parar.',
  },
  {
    id: 23,
    level: 3,
    topic: 'Laços for/while',
    statement: 'Um laço for (i = 0; i < 5; i++) executa o bloco exatamente 6 vezes.',
    answer: false,
    explanation: 'Ele roda para i = 0, 1, 2, 3 e 4 — ou seja, exatamente 5 vezes.',
  },
  {
    id: 24,
    level: 3,
    topic: 'Laços for/while',
    statement: 'O comando break interrompe imediatamente o laço de repetição atual antes da próxima volta.',
    answer: true,
    explanation: 'O break encerra o for ou while na hora e continua após o laço.',
  },
  {
    id: 25,
    level: 3,
    topic: 'Laços for/while',
    statement: 'O comando continue encerra o laço inteiro de forma definitiva, igual ao break.',
    answer: false,
    explanation: 'O continue apenas pula o restante da iteração atual e vai para a próxima volta.',
  },
  {
    id: 26,
    level: 3,
    topic: 'Laços for/while',
    statement: 'No laço while, se a condição inicial já começar como false, o bloco interno não roda nenhuma vez.',
    answer: true,
    explanation: 'O while verifica a condição antes de entrar no bloco pela primeira vez.',
  },
  {
    id: 27,
    level: 3,
    topic: 'Laços for/while',
    statement: 'No laço for (i = 1; i <= 3; i++), o último valor de i impresso dentro do laço será 2.',
    answer: false,
    explanation: 'Como a condição usa <= 3, o laço também executa quando i vale 3.',
  },
  {
    id: 28,
    level: 3,
    topic: 'Laços for/while',
    statement: 'Laços for são ideais quando já sabemos quantas repetições ou itens queremos percorrer.',
    answer: true,
    explanation: 'O for reúne inicialização, condição e passo em uma única linha prática.',
  },
  {
    id: 29,
    level: 3,
    topic: 'Laços for/while',
    statement: 'É impossível colocar um laço for dentro de outro laço for.',
    answer: false,
    explanation: 'Laços aninhados são muito comuns, por exemplo para percorrer linhas e colunas.',
  },
  {
    id: 30,
    level: 3,
    topic: 'Laços for/while',
    statement: 'Um contador dentro de um laço precisa ser atualizado (ex: i++) para garantir que o loop avance.',
    answer: true,
    explanation: 'Sem incrementar ou alterar a condição, o laço fica preso no mesmo estado.',
  },

  // NÍVEL 4 (31–40): Arrays e Funções
  {
    id: 31,
    level: 4,
    topic: 'Arrays e Funções',
    statement: 'Na maioria das linguagens, o primeiro elemento de um Array fica no índice 1.',
    answer: false,
    explanation: 'A indexação começa no índice 0.',
  },
  {
    id: 32,
    level: 4,
    topic: 'Arrays e Funções',
    statement: 'Se um vetor tem 4 itens, o índice do último elemento é 3.',
    answer: true,
    explanation: 'Os índices são 0, 1, 2, 3.',
  },
  {
    id: 33,
    level: 4,
    topic: 'Arrays e Funções',
    statement: 'A propriedade .length de um vetor retorna a quantidade total de elementos dentro dele.',
    answer: true,
    explanation: 'Ex: ["A", "B", "C"].length retorna 3.',
  },
  {
    id: 34,
    level: 4,
    topic: 'Arrays e Funções',
    statement: 'Uma função com return devolve um resultado para quem a chamou e encerra sua execução.',
    answer: true,
    explanation: 'Qualquer código abaixo do return na função é ignorado.',
  },
  {
    id: 35,
    level: 4,
    topic: 'Arrays e Funções',
    statement: 'Parâmetros são os valores de entrada que enviamos para dentro de uma função.',
    answer: true,
    explanation: 'Ex: calcularDano(ataque, defesa).',
  },
  {
    id: 36,
    level: 4,
    topic: 'Arrays e Funções',
    statement: 'Uma matriz bidimensional funciona como uma tabela organizada em linhas e colunas.',
    answer: true,
    explanation: 'É basicamente um vetor de vetores.',
  },
  {
    id: 37,
    level: 4,
    topic: 'Arrays e Funções',
    statement: 'Variáveis declaradas dentro de uma função (escopo local) podem ser acessadas livremente fora dela.',
    answer: false,
    explanation: 'Variáveis locais só existem dentro da função onde nasceram.',
  },
  {
    id: 38,
    level: 4,
    topic: 'Arrays e Funções',
    statement: 'Uma função recursiva é aquela que chama a si mesma até atingir uma condição de parada.',
    answer: true,
    explanation: 'Clássico para calcular fatorial ou sequência de Fibonacci.',
  },
  {
    id: 39,
    level: 4,
    topic: 'Arrays e Funções',
    statement: 'Um vetor (Array) só pode armazenar números inteiros e nunca textos.',
    answer: false,
    explanation: 'Arrays podem guardar textos, booleanos, objetos e números.',
  },
  {
    id: 40,
    level: 4,
    topic: 'Arrays e Funções',
    statement: 'Dividir um programa grande em funções menores facilita a manutenção e evita repetição de código.',
    answer: true,
    explanation: 'Esse pilar é conhecido como modularização / decomposição.',
  },
];

export function pickNextLogicQuestion(
  solvedCount: number,
  seenIds: Set<number>,
  currentId?: number
): BooleanChallenge {
  // Progressive difficulty across the 4 levels:
  // 0-2 solved -> Level 1
  // 3-5 solved -> Level 1-2 (favoring Level 2)
  // 6-8 solved -> Level 1-3 (favoring Level 3)
  // 9+ solved  -> All 4 levels (favoring Level 4)
  let preferredLevel: 1 | 2 | 3 | 4 = 1;
  if (solvedCount >= 9) preferredLevel = 4;
  else if (solvedCount >= 6) preferredLevel = 3;
  else if (solvedCount >= 3) preferredLevel = 2;

  const unseenAtLevel = LOGIC_QUESTIONS.filter(
    (q) => q.level === preferredLevel && !seenIds.has(q.id) && q.id !== currentId
  );
  if (unseenAtLevel.length > 0) {
    return unseenAtLevel[Math.floor(Math.random() * unseenAtLevel.length)];
  }

  const unseenUpToLevel = LOGIC_QUESTIONS.filter(
    (q) => q.level <= preferredLevel && !seenIds.has(q.id) && q.id !== currentId
  );
  if (unseenUpToLevel.length > 0) {
    return unseenUpToLevel[Math.floor(Math.random() * unseenUpToLevel.length)];
  }

  const anyUnseen = LOGIC_QUESTIONS.filter(
    (q) => !seenIds.has(q.id) && q.id !== currentId
  );
  if (anyUnseen.length > 0) {
    return anyUnseen[Math.floor(Math.random() * anyUnseen.length)];
  }

  // If all 40 questions were seen in one match, reset cycle excluding immediate currentId
  seenIds.clear();
  const fallbackPool = LOGIC_QUESTIONS.filter((q) => q.id !== currentId);
  return fallbackPool[Math.floor(Math.random() * fallbackPool.length)];
}
