// Dados do baralho e das tiragens. Usado pelo navegador e pelo servidor.
const RED = '#B23A48', BLUE = '#3E5BA0', GRAY = '#9C9AB5', GREEN = '#4E7A45', GREEND = '#2F5132', LIGHT = '#ECEAF4';

/* ============ Dados do baralho ============ */
const MAJORS = [
  ['0', 'O Louco', 'Inocência', 'começos, salto de fé, espontaneidade', 'imprudência, hesitação, medo de começar'],
  ['I', 'O Mago', 'Vontade', 'vontade, habilidade, capacidade de realizar', 'manipulação, talento desperdiçado, falta de foco'],
  ['II', 'A Sacerdotisa', 'Intuição', 'intuição, silêncio, saber interior', 'segredos, desconexão da própria intuição'],
  ['III', 'A Imperatriz', 'A Mãe', 'fertilidade, cuidado, abundância', 'dependência, bloqueio criativo, descuido de si'],
  ['IV', 'O Imperador', 'O Pai', 'estrutura, autoridade, limites claros', 'rigidez, controle excessivo, falta de disciplina'],
  ['V', 'O Hierofante', 'Tradição', 'tradição, ensino, pertencimento', 'rebeldia, questionar regras, dogma'],
  ['VI', 'Os Enamorados', 'Escolha', 'escolha do coração, união, valores', 'desalinhamento, dúvida, escolha adiada'],
  ['VII', 'O Carro', 'O Ego', 'determinação, direção, conquista', 'dispersão, perda de rumo, agressividade'],
  ['VIII', 'A Força', 'Instinto', 'coragem serena, domínio do instinto, compaixão', 'insegurança, impulsos sem freio'],
  ['IX', 'O Eremita', 'O Velho Sábio', 'recolhimento, busca interior, sabedoria', 'isolamento, solidão, fuga'],
  ['X', 'A Roda da Fortuna', 'Destino', 'ciclos, mudança, sincronicidade', 'resistência à mudança, repetição de padrões'],
  ['XI', 'A Justiça', 'Equilíbrio', 'verdade, equilíbrio, consequência', 'autoengano, injustiça, desequilíbrio'],
  ['XII', 'O Enforcado', 'Entrega', 'entrega, pausa, novo ponto de vista', 'estagnação, sacrifício inútil, resistência'],
  ['XIII', 'A Morte', 'Transformação', 'fim de ciclo, transformação, renovação', 'apego, medo da mudança, transição travada'],
  ['XIV', 'A Temperança', 'Integração', 'integração, moderação, paciência', 'excesso, pressa, desequilíbrio'],
  ['XV', 'O Diabo', 'A Sombra', 'sombra, apego, desejo', 'libertação, consciência das amarras'],
  ['XVI', 'A Torre', 'Ruptura', 'ruptura, revelação súbita, queda de ilusões', 'crise adiada, medo de ruptura'],
  ['XVII', 'A Estrela', 'Esperança', 'esperança, cura, inspiração', 'desânimo, falta de fé, desconexão'],
  ['XVIII', 'A Lua', 'O Inconsciente', 'inconsciente, sonhos, ilusões', 'medos se dissolvendo, clareza emergindo'],
  ['XIX', 'O Sol', 'Consciência', 'vitalidade, clareza, alegria', 'otimismo nublado, ego inflado'],
  ['XX', 'O Julgamento', 'Renascimento', 'despertar, chamado interior, renascimento', 'autocrítica dura, ignorar o chamado'],
  ['XXI', 'O Mundo', 'O Self', 'completude, integração, realização', 'ciclo inacabado, falta de fechamento']
];
const SUITS = [
  { k: 'paus', name: 'Paus', el: 'Fogo', fn: 'intuição', dom: 'na ação e no desejo', robe: RED, hat: '#7E2433', horse: '#B5651D' },
  { k: 'copas', name: 'Copas', el: 'Água', fn: 'sentimento', dom: 'nos afetos e vínculos', robe: BLUE, hat: '#2B3A6E', horse: LIGHT },
  { k: 'espadas', name: 'Espadas', el: 'Ar', fn: 'pensamento', dom: 'no pensamento e nas decisões', robe: GRAY, hat: '#55507A', horse: '#C9CCE0' },
  { k: 'ouros', name: 'Ouros', el: 'Terra', fn: 'sensação', dom: 'no trabalho, no corpo e no dinheiro', robe: GREEN, hat: GREEND, horse: '#5A4232' }
];
const RANKS = [
  ['Ás', 'Ás', 'um começo, potencial puro', 'potencial bloqueado, atraso'],
  ['II', 'Dois', 'equilíbrio entre duas forças, parceria', 'desequilíbrio, indecisão'],
  ['III', 'Três', 'crescimento, colaboração', 'falta de cooperação, atraso'],
  ['IV', 'Quatro', 'estabilidade, pausa', 'estagnação, apego'],
  ['V', 'Cinco', 'conflito, perda, desafio', 'recuperação, fim do conflito'],
  ['VI', 'Seis', 'harmonia, troca, generosidade', 'desigualdade, nostalgia'],
  ['VII', 'Sete', 'avaliação, perseverança', 'dúvida, desistência'],
  ['VIII', 'Oito', 'movimento, dedicação', 'dispersão, bloqueio'],
  ['IX', 'Nove', 'quase lá, resiliência', 'esgotamento, ansiedade'],
  ['X', 'Dez', 'conclusão, o peso de um ciclo inteiro', 'excesso, encerramento difícil'],
  ['', 'Valete', 'curiosidade, mensagem, aprendizado', 'imaturidade, notícia adiada'],
  ['', 'Cavaleiro', 'ação, busca, impulso', 'pressa, impaciência'],
  ['', 'Rainha', 'maturidade interior, acolhimento', 'insegurança, excesso de controle'],
  ['', 'Rei', 'domínio, liderança', 'autoritarismo, rigidez']
];
const DECK = [];
MAJORS.forEach(([n, name, arch, up, rev], i) => DECK.push({ id: 'M' + i, kind: 'major', idx: i, n, name, arch, up, rev, group: 'maiores' }));
SUITS.forEach((s) => RANKS.forEach(([n, word, up, rev], r) => DECK.push({
  id: s.k + r, kind: 'minor', suit: s, rank: r, n, court: r >= 10, name: `${word} de ${s.name}`, arch: `${s.el}, ${s.fn}`,
  up: `${up}, ${s.dom}`, rev: `${rev}, ${s.dom}`, group: s.k
})));
const byId = Object.fromEntries(DECK.map((c) => [c.id, c]));

const SPREADS = [
  ['escolha', 'Escolha', ['Opção A', 'Opção B', 'Conselho'], 'Para quando há dois caminhos na mesa. Uma carta para cada opção e uma para o que fazer com elas.'],
  ['tempo', 'Passado, presente e futuro', ['Passado', 'Presente', 'Futuro'], 'Para entender como a situação chegou até aqui e para onde tende a ir.'],
  ['problema', 'Situação e conselho', ['Situação', 'Desafio', 'Conselho'], 'Para quando você precisa de uma orientação prática.'],
  ['psique', 'Consciente e inconsciente', ['Consciente', 'Inconsciente', 'Orientação'], 'Para perguntas sobre você mesmo e o que está por baixo da superfície.'],
  ['relacao', 'Relação', ['Você', 'A outra pessoa', 'A relação'], 'Para vínculos de amor, amizade, família ou trabalho.'],
  ['crescimento', 'Crescimento', ['Manter', 'Soltar', 'Aprender'], 'Para fases de mudança e virada.'],
  ['holistica', 'Corpo, mente e espírito', ['Corpo', 'Mente', 'Espírito'], 'Para olhar o seu equilíbrio como um todo.'],
  ['dia', 'Carta do dia', ['Orientação de hoje'], 'Uma carta só, para começar o dia com uma imagem.'],
  ['simnao', 'Sim ou não', ['Resposta'], 'Para perguntas fechadas. A carta mostra a tendência e o porquê.'],
  ['cruz', 'Cruz', ['Tema', 'Obstáculo', 'Influência passada', 'Tendência', 'Conselho'], 'Para questões complexas, com várias forças em jogo.'],
  ['linha', 'Linha do tempo', ['Passado distante', 'Passado recente', 'Presente', 'Futuro próximo', 'Futuro distante'], 'Para planos de longo prazo.'],
  ['elementos', 'Elementos', ['Fogo', 'Água', 'Ar', 'Terra', 'Espírito'], 'Uma revisão da vida, elemento por elemento.']
].map(([id, name, pos, about]) => ({ id, name, pos, about }));
const spreadById = Object.fromEntries(SPREADS.map((s) => [s.id, s]));
const AREAS = ['Amor e relações', 'Trabalho e dinheiro', 'Autoconhecimento', 'Uma decisão', 'Outro assunto'];
const MOODS = ['Calma', 'Ansiedade', 'Dúvida', 'Esperança', 'Cansaço'];

export { MAJORS, SUITS, RANKS, DECK, byId, SPREADS, spreadById, AREAS, MOODS };
