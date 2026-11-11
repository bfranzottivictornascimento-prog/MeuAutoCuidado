
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================
// TIPOS
// ============================================

export type Usuario = {
  nome: string;
  email: string;
};

export type Questionario = {
  sono: string;
  agua: string;
  movimento: string;
  estresse: string;
  objetivo: string[];
  tempo: string;
};

export type Atividade = {
  id: number;
  nome: string;
  horario: string;
  icone: string;
  concluida: boolean;
  categoria?: string;
  duracao?: string;
  motivo?: string;
};

export type RegistroDiario = {
  data: string;
  total: number;
  concluidas: number;
  progresso: number;
};

export type Conquista = {
  id: string;
  titulo: string;
  descricao: string;
  emoji: string;
  desbloqueada: boolean;
};

export type Estatisticas = {
  diasAtivos: number;
  diasCompletos: number;
  atividadesRealizadas: number;
  atividadesSemana: number;
  atividadesMes: number;
  mediaProgresso: number;
  melhorSequencia: number;
};

export type DadosJogo = {
  compras: string[];
  ultimaRega: string | null;
  crescimento: number;
  pontosExtras: number;
  pontosGastos: number;
  atividadesPremiadas: string[];
};

export type ResultadoJogo = {
  ok: boolean;
  mensagem: string;
};

export const PREMIOS_LOJA = [
  { id: 'fadinha_lilas', custo: 350 },
  { id: 'gatinho_rosa', custo: 250 },
  { id: 'borboleta_magica', custo: 400 },
  { id: 'princesa_floral', custo: 500 },
  { id: 'ursinho_lavanda', custo: 300 },
  { id: 'unicorno_magico', custo: 650 },
];

const DADOS_JOGO_INICIAIS: DadosJogo = {
  compras: [],
  ultimaRega: null,
  crescimento: 0,
  pontosExtras: 0,
  pontosGastos: 0,
  atividadesPremiadas: [],
};

export type TemaId =
  | 'lavanda'
  | 'rosa'
  | 'azul'
  | 'verde'
  | 'bege'
  | 'noite';

export type EstiloCartao =
  | 'arredondado'
  | 'minimalista'
  | 'elegante';

export type TamanhoFonte =
  | 'normal'
  | 'grande'
  | 'extra';

export type PaletaTema = {
  fundo: string;
  card: string;
  texto: string;
  secundario: string;
  primario: string;
  suave: string;
  borda: string;
  textoBotao: string;
};

export type Preferencias = {
  modoNoturno: boolean;
  lembretesAtivos: boolean;
  horarioLembrete: string;
  tema: TemaId;
  estiloCartao: EstiloCartao;
  tamanhoFonte: TamanhoFonte;
};

// ============================================
// TEMAS DO APLICATIVO
// ============================================

export const TEMAS: Record<
  TemaId,
  {
    nome: string;
    claro: PaletaTema;
    escuro: PaletaTema;
  }
> = {
  lavanda: {
    nome: 'Lavanda',
    claro: {
      fundo: '#FAF7FF',
      card: '#FFFFFF',
      texto: '#382747',
      secundario: '#806F91',
      primario: '#7849A5',
      suave: '#F0E5FA',
      borda: '#EEE5F5',
      textoBotao: '#FFFFFF',
    },
    escuro: {
      fundo: '#171020',
      card: '#2B2037',
      texto: '#F5EAFF',
      secundario: '#D0BDD9',
      primario: '#B78DDB',
      suave: '#3D2C4E',
      borda: '#554063',
      textoBotao: '#171020',
    },
  },
  rosa: {
    nome: 'Rosa Delicado',
    claro: {
      fundo: '#FFF5F9',
      card: '#FFFFFF',
      texto: '#63344C',
      secundario: '#916F80',
      primario: '#C96B98',
      suave: '#FFE4F0',
      borda: '#F5D9E6',
      textoBotao: '#FFFFFF',
    },
    escuro: {
      fundo: '#24151E',
      card: '#38232E',
      texto: '#FFEAF3',
      secundario: '#E0B9CC',
      primario: '#E89BBC',
      suave: '#4C2C3C',
      borda: '#694658',
      textoBotao: '#24151E',
    },
  },
  azul: {
    nome: 'Azul Serenidade',
    claro: {
      fundo: '#F1F9FF',
      card: '#FFFFFF',
      texto: '#294A68',
      secundario: '#6E8AA1',
      primario: '#4C91C8',
      suave: '#E0F1FF',
      borda: '#D8EAF7',
      textoBotao: '#FFFFFF',
    },
    escuro: {
      fundo: '#111C2A',
      card: '#1E3042',
      texto: '#EAF6FF',
      secundario: '#B1CDDF',
      primario: '#88C5F0',
      suave: '#2A4259',
      borda: '#3C5A72',
      textoBotao: '#102131',
    },
  },
  verde: {
    nome: 'Verde Natureza',
    claro: {
      fundo: '#F1FAF5',
      card: '#FFFFFF',
      texto: '#2F5B48',
      secundario: '#708E7E',
      primario: '#539A7B',
      suave: '#E0F3E8',
      borda: '#D7EBDF',
      textoBotao: '#FFFFFF',
    },
    escuro: {
      fundo: '#12231B',
      card: '#20382B',
      texto: '#E8FFF1',
      secundario: '#B4D6C2',
      primario: '#91D7B1',
      suave: '#2E4A3A',
      borda: '#476453',
      textoBotao: '#12231B',
    },
  },
  bege: {
    nome: 'Bege Elegante',
    claro: {
      fundo: '#FBF6EE',
      card: '#FFFFFF',
      texto: '#57412F',
      secundario: '#947D68',
      primario: '#AC8260',
      suave: '#F3E8D8',
      borda: '#EDE1D2',
      textoBotao: '#FFFFFF',
    },
    escuro: {
      fundo: '#211A16',
      card: '#352A22',
      texto: '#FFF2E4',
      secundario: '#D7BEA6',
      primario: '#D9AF8A',
      suave: '#49382D',
      borda: '#624D3D',
      textoBotao: '#211A16',
    },
  },
  noite: {
    nome: 'Noite Premium',
    claro: {
      fundo: '#F4F1F8',
      card: '#FFFFFF',
      texto: '#30243C',
      secundario: '#786A87',
      primario: '#7050A4',
      suave: '#E8DFF3',
      borda: '#E1D9EB',
      textoBotao: '#FFFFFF',
    },
    escuro: {
      fundo: '#141118',
      card: '#28212F',
      texto: '#F6EEFF',
      secundario: '#C7B7D7',
      primario: '#A78BFA',
      suave: '#382C45',
      borda: '#4C3D59',
      textoBotao: '#18121E',
    },
  },
};

const PREFERENCIAS_INICIAIS: Preferencias = {
  modoNoturno: false,
  lembretesAtivos: false,
  horarioLembrete: '08:00',
  tema: 'lavanda',
  estiloCartao: 'arredondado',
  tamanhoFonte: 'grande',
};

// ============================================
// CONTEXTO
// ============================================

type Contexto = {
  usuario: Usuario | null;
  salvarUsuario: (dados: Usuario) => Promise<void>;
  respostas: Questionario | null;
  salvarRespostas: (dados: Questionario) => Promise<void>;
  atividades: Atividade[];
  alternarAtividade: (id: number) => void;
  concluidas: number;
  progresso: number;
  dicasPersonalizadas: string[];
  historicoProgresso: RegistroDiario[];
  sequenciaDias: number;
  carregando: boolean;
  conquistas: Conquista[];
  estatisticas: Estatisticas;
  preferencias: Preferencias;
  atualizarPreferencias: (
    dados: Partial<Preferencias>
  ) => Promise<void>;
  cores: PaletaTema;
  raioCartao: number;
  escalaFonte: number;
  saldoPontos: number;
  dadosJogo: DadosJogo;
  comprarPremio: (id: string) => Promise<ResultadoJogo>;
  regarJardim: () => Promise<ResultadoJogo>;
};

const Context = createContext<Contexto | undefined>(
  undefined
);

// ============================================
// CHAVES DO ARMAZENAMENTO
// ============================================

const CHAVE_ANTIGA = '@MeuAutoCuidado:dados_v1';
const FOTO_ANTIGA = '@MeuAutoCuidado:fotoPerfil_v1';

// NOVO: sessão do usuário atual
const CHAVE_SESSAO = '@MeuAutoCuidado:sessao_v1';

function normalizarEmail(email: string) {
  return email.trim().toLowerCase();
}

export function chaveHistorico(email: string) {
  return `@MeuAutoCuidado:historico:${normalizarEmail(email)}`;
}

export function chaveFotoPerfil(email: string) {
  return `@MeuAutoCuidado:fotoPerfil:${normalizarEmail(email)}`;
}

export function chavePreferencias(email: string) {
  return `@MeuAutoCuidado:preferencias:${normalizarEmail(email)}`;
}

export function chaveJogo(email: string) {
  return `@MeuAutoCuidado:jogo:${normalizarEmail(email)}`;
}

// NOVO: respostas separadas por e-mail
export function chaveRespostas(email: string) {
  return `@MeuAutoCuidado:respostas:${normalizarEmail(email)}`;
}

// ============================================
// FUNÇÕES DE DATA
// ============================================

function dataLocal(data: Date) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');

  return `${ano}-${mes}-${dia}`;
}

function dataHoje() {
  return dataLocal(new Date());
}

function diaAnterior(data: string) {
  const [ano, mes, dia] = data.split('-').map(Number);
  return dataLocal(new Date(ano, mes - 1, dia - 1));
}

function inicioSemana() {
  const hoje = new Date();
  const diferenca = (hoje.getDay() + 6) % 7;
  hoje.setDate(hoje.getDate() - diferenca);
  return dataLocal(hoje);
}

function inicioMes() {
  const hoje = new Date();
  return dataLocal(
    new Date(hoje.getFullYear(), hoje.getMonth(), 1)
  );
}

// ============================================
// TEMPO DISPONÍVEL
// ============================================

function minutosDisponiveis(tempo: string) {
  if (tempo === 'pouco') return 15;
  if (tempo === 'medio') return 30;
  if (tempo === 'bastante') return 60;

  const partes = /^(\d{1,2}):(\d{2})$/.exec(tempo);
  if (!partes) return 0;

  const horas = Number(partes[1]);
  const minutos = Number(partes[2]);

  if (
    horas > 24 ||
    minutos > 59 ||
    (horas === 24 && minutos !== 0)
  ) {
    return 0;
  }

  return horas * 60 + minutos;
}

function duracaoEmMinutos(duracao?: string) {
  const numero = Number(
    duracao?.match(/\d+/)?.[0] || '5'
  );
  return numero > 0 ? numero : 5;
}

// ============================================
// HISTÓRICO E ESTATÍSTICAS
// ============================================

function registroDoDia(
  atividades: Atividade[],
  data: string
): RegistroDiario {
  const total = atividades.length;
  const concluidas = atividades.filter(
    a => a.concluida
  ).length;

  return {
    data,
    total,
    concluidas,
    progresso: total
      ? Math.round((concluidas / total) * 100)
      : 0,
  };
}

function atualizarHistorico(
  anterior: RegistroDiario[],
  registro: RegistroDiario
) {
  return [
    ...anterior.filter(
      item => item.data !== registro.data
    ),
    registro,
  ].sort((a, b) => a.data.localeCompare(b.data));
}

function calcularSequencia(
  historico: RegistroDiario[]
) {
  const dias = new Set(
    historico
      .filter(item => item.concluidas > 0)
      .map(item => item.data)
  );

  let data = dataHoje();

  if (!dias.has(data)) {
    data = diaAnterior(data);
  }

  let sequencia = 0;

  while (dias.has(data)) {
    sequencia++;
    data = diaAnterior(data);
  }

  return sequencia;
}

function calcularMelhorSequencia(
  historico: RegistroDiario[]
) {
  const dias = [
    ...new Set(
      historico
        .filter(item => item.concluidas > 0)
        .map(item => item.data)
    ),
  ].sort();

  let atual = 0;
  let melhor = 0;
  let anterior = '';

  for (const dia of dias) {
    if (
      anterior &&
      diaAnterior(dia) === anterior
    ) {
      atual++;
    } else {
      atual = 1;
    }

    melhor = Math.max(melhor, atual);
    anterior = dia;
  }

  return melhor;
}

function calcularEstatisticas(
  historico: RegistroDiario[]
): Estatisticas {
  const registros = historico.filter(
    item => item.total > 0
  );

  const diasAtivos = registros.filter(
    item => item.concluidas > 0
  ).length;

  const diasCompletos = registros.filter(
    item =>
      item.total > 0 &&
      item.concluidas === item.total
  ).length;

  const atividadesRealizadas = registros.reduce(
    (soma, item) => soma + item.concluidas,
    0
  );

  const semana = inicioSemana();
  const mes = inicioMes();
  const hoje = dataHoje();

  const atividadesSemana = registros
    .filter(
      item =>
        item.data >= semana &&
        item.data <= hoje
    )
    .reduce(
      (soma, item) => soma + item.concluidas,
      0
    );

  const atividadesMes = registros
    .filter(
      item =>
        item.data >= mes &&
        item.data <= hoje
    )
    .reduce(
      (soma, item) => soma + item.concluidas,
      0
    );

  const mediaProgresso = registros.length
    ? Math.round(
        registros.reduce(
          (soma, item) => soma + item.progresso,
          0
        ) / registros.length
      )
    : 0;

  return {
    diasAtivos,
    diasCompletos,
    atividadesRealizadas,
    atividadesSemana,
    atividadesMes,
    mediaProgresso,
    melhorSequencia:
      calcularMelhorSequencia(registros),
  };
}

// ============================================
// CONQUISTAS
// ============================================

function criarConquistas(
  estatisticas: Estatisticas
): Conquista[] {
  const {
    diasAtivos,
    diasCompletos,
    atividadesRealizadas,
    melhorSequencia,
  } = estatisticas;

  return [
    {
      id: 'primeiro_passo',
      titulo: 'Primeiro passo',
      descricao: 'Conclua sua primeira atividade.',
      emoji: '🌱',
      desbloqueada: atividadesRealizadas >= 1,
    },
    {
      id: 'tres_dias',
      titulo: 'Três dias de carinho',
      descricao:
        'Cuide de você por 3 dias seguidos.',
      emoji: '🌷',
      desbloqueada: melhorSequencia >= 3,
    },
    {
      id: 'sete_dias',
      titulo: 'Uma semana especial',
      descricao:
        'Complete 7 dias consecutivos.',
      emoji: '🥉',
      desbloqueada: melhorSequencia >= 7,
    },
    {
      id: 'quinze_dias',
      titulo: 'Dedicação',
      descricao:
        'Complete 15 dias consecutivos.',
      emoji: '🥈',
      desbloqueada: melhorSequencia >= 15,
    },
    {
      id: 'trinta_dias',
      titulo: 'Um mês de autocuidado',
      descricao:
        'Complete 30 dias consecutivos.',
      emoji: '🥇',
      desbloqueada: melhorSequencia >= 30,
    },
    {
      id: 'dez_atividades',
      titulo: 'Cuidando de mim',
      descricao: 'Conclua 10 atividades.',
      emoji: '💜',
      desbloqueada:
        atividadesRealizadas >= 10,
    },
    {
      id: 'cinquenta_atividades',
      titulo: 'Coração dedicado',
      descricao: 'Conclua 50 atividades.',
      emoji: '🏆',
      desbloqueada:
        atividadesRealizadas >= 50,
    },
    {
      id: 'cinco_dias_completos',
      titulo: 'Rotina completa',
      descricao:
        'Finalize toda a rotina em 5 dias.',
      emoji: '✨',
      desbloqueada: diasCompletos >= 5,
    },
    {
      id: 'dez_dias_ativos',
      titulo: 'Minha jornada',
      descricao:
        'Realize atividades em 10 dias.',
      emoji: '🦋',
      desbloqueada: diasAtivos >= 10,
    },
  ];
}

// ============================================
// ROTINA PERSONALIZADA
// ============================================

function criarAtividades(
  respostas: Questionario
): Atividade[] {
  const lista: Atividade[] = [];

  const objetivos = Array.isArray(
    respostas.objetivo
  )
    ? respostas.objetivo
    : [];

  function adicionar(
    nome: string,
    horario: string,
    icone: string,
    categoria: string,
    duracao: string,
    motivo: string
  ) {
    if (
      lista.some(
        atividade => atividade.nome === nome
      )
    ) {
      return;
    }

    lista.push({
      id: lista.length + 1,
      nome,
      horario,
      icone,
      categoria,
      duracao,
      motivo,
      concluida: false,
    });
  }

  adicionar(
    'Beber um copo de água ao acordar',
    '08:00',
    '💧',
    'Hidratação',
    '2 min',
    'Um lembrete para começar o dia se hidratando.'
  );

  adicionar(
    'Fazer uma pausa para cuidar de você',
    '12:30',
    '🌷',
    'Bem-estar',
    '5 min',
    'Uma pausa pode ajudar a equilibrar a rotina.'
  );

  if (
    respostas.sono === 'ruim' ||
    respostas.sono === 'regular' ||
    objetivos.includes('sono')
  ) {
    adicionar(
      'Criar um momento tranquilo antes de dormir',
      '21:00',
      '🌙',
      'Sono',
      '10 min',
      'Você demonstrou interesse em melhorar seu descanso.'
    );

    adicionar(
      'Diminuir o uso de telas à noite',
      '21:30',
      '📵',
      'Sono',
      '10 min',
      'Reduzir estímulos pode ajudar na rotina de descanso.'
    );
  }

  if (
    respostas.agua === 'esqueço' ||
    respostas.agua === 'as_vezes'
  ) {
    adicionar(
      'Fazer uma pausa para beber água',
      '10:00',
      '🫗',
      'Hidratação',
      '2 min',
      'Você contou que às vezes esquece de se hidratar.'
    );

    adicionar(
      'Lembrar de beber água à tarde',
      '15:00',
      '💦',
      'Hidratação',
      '2 min',
      'Pequenos lembretes ajudam a criar hábitos.'
    );
  }

  if (
    respostas.movimento === 'começar' ||
    respostas.movimento === 'as_vezes'
  ) {
    adicionar(
      'Fazer alongamentos leves',
      '09:00',
      '🧘',
      'Movimento',
      '5 min',
      'Você quer incluir mais movimento na rotina.'
    );

    adicionar(
      'Fazer uma caminhada leve',
      '17:00',
      '🚶',
      'Movimento',
      '10 min',
      'Uma caminhada pode ser um começo confortável.'
    );
  }

  if (
    respostas.estresse === 'alto' ||
    respostas.estresse === 'moderado' ||
    objetivos.includes('relaxar')
  ) {
    adicionar(
      'Fazer uma pausa de respiração tranquila',
      '14:00',
      '🦋',
      'Relaxamento',
      '3 min',
      'Você indicou que gostaria de relaxar mais.'
    );

    adicionar(
      'Escutar uma música relaxante',
      '19:00',
      '🎵',
      'Relaxamento',
      '5 min',
      'Uma pausa agradável pode ajudar a desacelerar.'
    );
  }

  if (objetivos.includes('autoestima')) {
    adicionar(
      'Escrever algo positivo sobre você',
      '08:30',
      '💗',
      'Autoestima',
      '5 min',
      'Você escolheu cuidar mais da autoestima.'
    );

    adicionar(
      'Reservar um momento de carinho consigo',
      '20:00',
      '🌸',
      'Autoestima',
      '5 min',
      'Pequenos gestos de carinho podem fazer parte do dia.'
    );
  }

  if (objetivos.includes('organização')) {
    adicionar(
      'Organizar as prioridades do dia',
      '08:15',
      '📝',
      'Organização',
      '5 min',
      'Você deseja construir uma rotina mais organizada.'
    );

    adicionar(
      'Preparar as tarefas de amanhã',
      '20:30',
      '📋',
      'Organização',
      '5 min',
      'Planejar pode facilitar o próximo dia.'
    );
  }

  if (objetivos.includes('disposição')) {
    adicionar(
      'Alongar o corpo ao acordar',
      '07:30',
      '☀️',
      'Disposição',
      '5 min',
      'Você escolheu incluir hábitos de disposição.'
    );

    adicionar(
      'Fazer uma pausa longe das telas',
      '16:00',
      '🌿',
      'Bem-estar',
      '5 min',
      'Pequenas pausas podem tornar o dia mais equilibrado.'
    );
  }

  if (objetivos.includes('pele')) {
    adicionar(
      'Fazer os cuidados da manhã com a pele',
      '09:00',
      '🧴',
      'Cuidados pessoais',
      '5 min',
      'Você escolheu cuidar mais da pele.'
    );

    adicionar(
      'Fazer os cuidados noturnos com a pele',
      '20:45',
      '🫧',
      'Cuidados pessoais',
      '5 min',
      'Criar uma rotina simples ajuda na regularidade.'
    );
  }

  if (lista.length < 5) {
    adicionar(
      'Ler algumas páginas de um livro',
      '19:30',
      '📚',
      'Lazer',
      '5 min',
      'Uma atividade tranquila pode fazer parte do dia.'
    );

    adicionar(
      'Fazer uma pausa sem distrações',
      '16:30',
      '🍃',
      'Bem-estar',
      '5 min',
      'Uma pausa simples também é autocuidado.'
    );
  }

  const limite = minutosDisponiveis(
    respostas.tempo
  );

  if (limite <= 0) return [];

  const categoriasPrioritarias: string[] = [];

  if (objetivos.includes('sono')) {
    categoriasPrioritarias.push('Sono');
  }

  if (objetivos.includes('autoestima')) {
    categoriasPrioritarias.push('Autoestima');
  }

  if (objetivos.includes('organização')) {
    categoriasPrioritarias.push('Organização');
  }

  if (objetivos.includes('relaxar')) {
    categoriasPrioritarias.push('Relaxamento');
  }

  if (objetivos.includes('disposição')) {
    categoriasPrioritarias.push('Disposição');
  }

  if (objetivos.includes('pele')) {
    categoriasPrioritarias.push(
      'Cuidados pessoais'
    );
  }

  const ordenadas = [...lista].sort((a, b) => {
    const aPrioridade =
      categoriasPrioritarias.includes(
        a.categoria || ''
      );

    const bPrioridade =
      categoriasPrioritarias.includes(
        b.categoria || ''
      );

    if (aPrioridade !== bPrioridade) {
      return aPrioridade ? -1 : 1;
    }

    return a.horario.localeCompare(b.horario);
  });

  const escolhidas: Atividade[] = [];
  let usado = 0;

  for (const atividade of ordenadas) {
    const duracao = duracaoEmMinutos(
      atividade.duracao
    );

    if (usado + duracao <= limite) {
      escolhidas.push(atividade);
      usado += duracao;
    }
  }

  return escolhidas
    .sort((a, b) =>
      a.horario.localeCompare(b.horario)
    )
    .map((atividade, indice) => ({
      ...atividade,
      id: indice + 1,
    }));
}

// ============================================
// DICAS PERSONALIZADAS
// ============================================

function criarDicas(
  respostas: Questionario | null
): string[] {
  if (!respostas) {
    return [
      'Comece com pequenos hábitos de autocuidado.',
      'Reserve alguns minutos para descansar.',
      'Lembre-se de beber água durante o dia.',
      'Respeite seu ritmo e suas necessidades.',
    ];
  }

  const dicas: string[] = [];
  const objetivos = respostas.objetivo || [];

  if (
    ['ruim', 'regular'].includes(
      respostas.sono
    )
  ) {
    dicas.push(
      'Experimente manter horários regulares para dormir.'
    );
  }

  if (
    ['esqueço', 'as_vezes'].includes(
      respostas.agua
    )
  ) {
    dicas.push(
      'Deixe uma garrafa de água por perto como lembrete.'
    );
  }

  if (
    ['começar', 'as_vezes'].includes(
      respostas.movimento
    )
  ) {
    dicas.push(
      'Inclua movimentos leves e respeite seus limites.'
    );
  }

  if (
    ['alto', 'moderado'].includes(
      respostas.estresse
    )
  ) {
    dicas.push(
      'Reserve momentos para pausas e relaxamento.'
    );
  }

  if (objetivos.includes('sono')) {
    dicas.push(
      'Crie um ambiente tranquilo antes de dormir.'
    );
  }

  if (objetivos.includes('autoestima')) {
    dicas.push(
      'Valorize suas pequenas conquistas e qualidades.'
    );
  }

  if (objetivos.includes('organização')) {
    dicas.push(
      'Escolha algumas prioridades para cada dia.'
    );
  }

  if (objetivos.includes('relaxar')) {
    dicas.push(
      'Experimente reservar um momento para desacelerar.'
    );
  }

  if (objetivos.includes('disposição')) {
    dicas.push(
      'Alterne atividades com pausas de descanso.'
    );
  }

  if (objetivos.includes('pele')) {
    dicas.push(
      'Mantenha cuidados simples com a pele adequados às suas necessidades.'
    );
  }

  const minutos = minutosDisponiveis(
    respostas.tempo
  );

  if (minutos > 0 && minutos <= 15) {
    dicas.push(
      'Seu tempo é precioso. Priorize cuidados curtos que caibam no seu dia.'
    );
  } else if (
    minutos > 15 &&
    minutos <= 60
  ) {
    dicas.push(
      'Distribua seus momentos de autocuidado ao longo do dia.'
    );
  } else if (minutos > 60) {
    dicas.push(
      'Você pode alternar diferentes cuidados, respeitando seu ritmo.'
    );
  }

  dicas.push(
    'O autocuidado não precisa ser perfeito. Faça o que for possível hoje.'
  );

  return [...new Set(dicas)];
}

// ============================================
// VALIDAÇÃO DAS PREFERÊNCIAS
// ============================================

function validarPreferencias(
  dados: unknown
): Preferencias {
  const valores =
    dados &&
    typeof dados === 'object' &&
    !Array.isArray(dados)
      ? (dados as Partial<Preferencias>)
      : {};

  const temas: TemaId[] = [
    'lavanda',
    'rosa',
    'azul',
    'verde',
    'bege',
    'noite',
  ];

  const estilos: EstiloCartao[] = [
    'arredondado',
    'minimalista',
    'elegante',
  ];

  const tamanhos: TamanhoFonte[] = [
    'normal',
    'grande',
    'extra',
  ];

  return {
    modoNoturno:
      typeof valores.modoNoturno === 'boolean'
        ? valores.modoNoturno
        : false,

    lembretesAtivos:
      typeof valores.lembretesAtivos === 'boolean'
        ? valores.lembretesAtivos
        : false,

    horarioLembrete:
      typeof valores.horarioLembrete === 'string'
        ? valores.horarioLembrete
        : '08:00',

    tema:
      valores.tema &&
      temas.includes(valores.tema)
        ? valores.tema
        : 'lavanda',

    estiloCartao:
      valores.estiloCartao &&
      estilos.includes(valores.estiloCartao)
        ? valores.estiloCartao
        : 'arredondado',

    tamanhoFonte:
      valores.tamanhoFonte &&
      tamanhos.includes(valores.tamanhoFonte)
        ? valores.tamanhoFonte
        : 'grande',
  };
}

// ============================================
// VALIDAÇÃO DO JOGO
// ============================================

function validarDadosJogo(
  dados: unknown
): DadosJogo {
  const valores =
    dados &&
    typeof dados === 'object' &&
    !Array.isArray(dados)
      ? (dados as Partial<DadosJogo>)
      : {};

  const numeroSeguro = (valor: unknown) =>
    typeof valor === 'number' &&
    Number.isFinite(valor) &&
    valor >= 0
      ? Math.floor(valor)
      : 0;

  return {
    compras: Array.isArray(valores.compras)
      ? valores.compras.filter(
          (item): item is string =>
            typeof item === 'string'
        )
      : [],

    ultimaRega:
      typeof valores.ultimaRega === 'string'
        ? valores.ultimaRega
        : null,

    crescimento: numeroSeguro(
      valores.crescimento
    ),

    pontosExtras: numeroSeguro(
      valores.pontosExtras
    ),

    pontosGastos: numeroSeguro(
      valores.pontosGastos
    ),

    atividadesPremiadas: Array.isArray(
      valores.atividadesPremiadas
    )
      ? valores.atividadesPremiadas.filter(
          (item): item is string =>
            typeof item === 'string'
        )
      : [],
  };
}

// ============================================
// VALIDAR QUESTIONÁRIO SALVO
// ============================================

function validarQuestionario(
  dados: unknown
): Questionario | null {
  if (
    !dados ||
    typeof dados !== 'object' ||
    Array.isArray(dados)
  ) {
    return null;
  }

  const valor = dados as Partial<Questionario>;

  if (
    typeof valor.sono !== 'string' ||
    typeof valor.agua !== 'string' ||
    typeof valor.movimento !== 'string' ||
    typeof valor.estresse !== 'string' ||
    !Array.isArray(valor.objetivo) ||
    typeof valor.tempo !== 'string' ||
    minutosDisponiveis(valor.tempo) <= 0
  ) {
    return null;
  }

  return {
    sono: valor.sono,
    agua: valor.agua,
    movimento: valor.movimento,
    estresse: valor.estresse,
    objetivo: valor.objetivo.filter(
      (item): item is string =>
        typeof item === 'string'
    ),
    tempo: valor.tempo,
  };
}

// ============================================
// PROVIDER PRINCIPAL
// ============================================

export function AutocuidadoProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [usuario, setUsuario] =
    useState<Usuario | null>(null);

  const [respostas, setRespostas] =
    useState<Questionario | null>(null);

  const [atividades, setAtividades] =
    useState<Atividade[]>([]);

  const [
    historicoProgresso,
    setHistoricoProgresso,
  ] = useState<RegistroDiario[]>([]);

  const [dataAtividades, setDataAtividades] =
    useState(dataHoje());

  const [carregando, setCarregando] =
    useState(true);

  const [preferencias, setPreferencias] =
    useState<Preferencias>({
      ...PREFERENCIAS_INICIAIS,
    });

  const [dadosJogo, setDadosJogo] =
    useState<DadosJogo>({
      ...DADOS_JOGO_INICIAIS,
    });

  const dadosJogoRef = useRef<DadosJogo>({
    ...DADOS_JOGO_INICIAIS,
  });

  const operacaoJogoRef = useRef(false);

  const emailAtualRef =
    useRef<string | null>(null);

  const trocaRef = useRef(0);

  const estadoRef = useRef({
    atividades: [] as Atividade[],
    dataAtividades: dataHoje(),
  });

  const historicoRef =
    useRef<RegistroDiario[]>([]);

  const preferenciasRef =
    useRef<Preferencias>({
      ...PREFERENCIAS_INICIAIS,
    });

  const filaJogoRef = useRef<Promise<void>>(
    Promise.resolve()
  );

  function gravarJogo(
    email: string,
    dados: DadosJogo
  ): Promise<void> {
    const tarefa = filaJogoRef.current
      .catch(() => {})
      .then(() =>
        AsyncStorage.setItem(
          chaveJogo(email),
          JSON.stringify(dados)
        )
      );

    filaJogoRef.current = tarefa.catch(
      () => {}
    );

    return tarefa;
  }

  // ==========================================
  // CARREGAR PERFIL E RESPOSTAS
  // ==========================================

  async function carregarPerfil(
    novoUsuario: Usuario,
    numeroTroca: number
  ) {
    const [
      textoHistorico,
      textoPreferencias,
      textoJogo,
      textoRespostas,
    ] = await Promise.all([
      AsyncStorage.getItem(
        chaveHistorico(novoUsuario.email)
      ),
      AsyncStorage.getItem(
        chavePreferencias(novoUsuario.email)
      ),
      AsyncStorage.getItem(
        chaveJogo(novoUsuario.email)
      ),
      AsyncStorage.getItem(
        chaveRespostas(novoUsuario.email)
      ),
    ]);

    if (numeroTroca !== trocaRef.current) {
      return;
    }

    function lerJSON(
      texto: string | null,
      padrao: unknown
    ) {
      if (!texto) return padrao;

      try {
        return JSON.parse(texto);
      } catch {
        return padrao;
      }
    }

    const historicoSalvo = lerJSON(
      textoHistorico,
      []
    );

    const preferenciasSalvas = lerJSON(
      textoPreferencias,
      {}
    );

    const jogoSalvo = lerJSON(
      textoJogo,
      {}
    );

    const questionarioSalvo = lerJSON(
      textoRespostas,
      null
    );

    const historicoValido: RegistroDiario[] =
      Array.isArray(historicoSalvo)
        ? historicoSalvo
        : [];

    const preferenciasValidas =
      validarPreferencias(
        preferenciasSalvas
      );

    const jogoValido =
      validarDadosJogo(jogoSalvo);

    const questionarioValido =
      validarQuestionario(
        questionarioSalvo
      );

    historicoRef.current = historicoValido;
    preferenciasRef.current =
      preferenciasValidas;
    dadosJogoRef.current = jogoValido;

    setHistoricoProgresso(
      historicoValido
    );
    setPreferencias(
      preferenciasValidas
    );
    setDadosJogo(jogoValido);

    setRespostas(questionarioValido);

    const hoje = dataHoje();

    const rotina = questionarioValido
      ? criarAtividades(questionarioValido)
      : [];

    // Recupera o que já foi marcado hoje.
    const registroHoje =
      historicoValido.find(
        item => item.data === hoje
      );

    // O histórico preserva os totais, mas não
    // identifica individualmente cada atividade.
    // Por isso, a rotina começa desmarcada
    // caso não exista um registro específico.
    const textoRotina =
      await AsyncStorage.getItem(
        `@MeuAutoCuidado:rotina:${novoUsuario.email}:${hoje}`
      );

    let rotinaFinal = rotina;

    if (textoRotina) {
      try {
        const nomesConcluidos = JSON.parse(
          textoRotina
        );

        if (Array.isArray(nomesConcluidos)) {
          rotinaFinal = rotina.map(
            atividade => ({
              ...atividade,
              concluida:
                nomesConcluidos.includes(
                  atividade.nome
                ),
            })
          );
        }
      } catch {
        // Mantém a rotina desmarcada.
      }
    } else if (registroHoje) {
      // O histórico antigo continua preservado.
    }

    if (numeroTroca !== trocaRef.current) {
      return;
    }

    estadoRef.current = {
      atividades: rotinaFinal,
      dataAtividades: hoje,
    };

    setAtividades(rotinaFinal);
    setDataAtividades(hoje);
  }

  // ==========================================
  // CADASTRO E TROCA DE PERFIL
  // ==========================================

  async function salvarUsuario(
    dados: Usuario
  ): Promise<void> {
    const novoUsuario: Usuario = {
      nome: dados.nome
        .trim()
        .replace(/\s+/g, ' '),
      email: normalizarEmail(
        dados.email
      ),
    };

    if (
      !novoUsuario.nome ||
      !novoUsuario.email
    ) {
      throw new Error(
        'Nome e e-mail são obrigatórios.'
      );
    }

    const mudouEmail =
      emailAtualRef.current !==
      novoUsuario.email;

    if (!mudouEmail) {
      await AsyncStorage.setItem(
        CHAVE_SESSAO,
        JSON.stringify(novoUsuario)
      );

      setUsuario(novoUsuario);
      return;
    }

    const numeroTroca =
      ++trocaRef.current;

    await filaJogoRef.current.catch(
      () => {}
    );

    if (
      numeroTroca !== trocaRef.current
    ) {
      return;
    }

    emailAtualRef.current =
      novoUsuario.email;

    setUsuario(novoUsuario);
    setRespostas(null);
    setAtividades([]);
    setDataAtividades(dataHoje());
    setHistoricoProgresso([]);

    setPreferencias({
      ...PREFERENCIAS_INICIAIS,
    });

    setDadosJogo({
      ...DADOS_JOGO_INICIAIS,
    });

    dadosJogoRef.current = {
      ...DADOS_JOGO_INICIAIS,
    };

    historicoRef.current = [];

    preferenciasRef.current = {
      ...PREFERENCIAS_INICIAIS,
    };

    estadoRef.current = {
      atividades: [],
      dataAtividades: dataHoje(),
    };

    try {
      await carregarPerfil(
        novoUsuario,
        numeroTroca
      );
    } catch (erro) {
      console.log(
        'Erro ao carregar perfil:',
        erro
      );

      if (
        numeroTroca === trocaRef.current
      ) {
        throw erro;
      }

      return;
    }

    if (
      numeroTroca !== trocaRef.current
    ) {
      return;
    }

    // Salva a sessão somente depois de
    // recuperar os dados do perfil.
    await AsyncStorage.setItem(
      CHAVE_SESSAO,
      JSON.stringify(novoUsuario)
    );
  }

  // ==========================================
  // INICIALIZAÇÃO AUTOMÁTICA
  // ==========================================

  useEffect(() => {
    let ativo = true;

    async function iniciar() {
      try {
        await AsyncStorage.multiRemove([
          CHAVE_ANTIGA,
          FOTO_ANTIGA,
        ]);

        const sessaoSalva =
          await AsyncStorage.getItem(
            CHAVE_SESSAO
          );

        if (!ativo || !sessaoSalva) {
          return;
        }

        let dadosSalvos: unknown;

        try {
          dadosSalvos = JSON.parse(
            sessaoSalva
          );
        } catch {
          await AsyncStorage.removeItem(
            CHAVE_SESSAO
          );
          return;
        }

        if (
          !dadosSalvos ||
          typeof dadosSalvos !== 'object'
        ) {
          return;
        }

        const dados = dadosSalvos as
          Partial<Usuario>;

        if (
          typeof dados.nome === 'string' &&
          typeof dados.email === 'string' &&
          dados.nome.trim() &&
          dados.email.trim()
        ) {
          await salvarUsuario({
            nome: dados.nome,
            email: dados.email,
          });
        }
      } catch (erro) {
        console.log(
          'Erro ao recuperar sessão:',
          erro
        );
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    iniciar();

    return () => {
      ativo = false;
    };
  }, []);

  // ==========================================
  // QUESTIONÁRIO
  // ==========================================

  async function salvarRespostas(
    dados: Questionario
  ): Promise<void> {
    const email =
      emailAtualRef.current;

    if (!email) {
      throw new Error(
        'Faça o cadastro primeiro.'
      );
    }

    if (
      minutosDisponiveis(
        dados.tempo
      ) <= 0
    ) {
      throw new Error(
        'Tempo disponível inválido.'
      );
    }

    const novasRespostas: Questionario = {
      ...dados,
      objetivo: Array.isArray(
        dados.objetivo
      )
        ? [...dados.objetivo]
        : [],
    };

    const novasAtividades =
      criarAtividades(
        novasRespostas
      );

    const hoje = dataHoje();

    // Salva antes de atualizar a tela.
    // Assim, ao fechar o aplicativo,
    // o questionário não será perdido.
    await AsyncStorage.setItem(
      chaveRespostas(email),
      JSON.stringify(
        novasRespostas
      )
    );

    if (
      emailAtualRef.current !== email
    ) {
      return;
    }

    estadoRef.current = {
      atividades: novasAtividades,
      dataAtividades: hoje,
    };

    setRespostas(
      novasRespostas
    );

    setAtividades(
      novasAtividades
    );

    setDataAtividades(hoje);

    // Ao refazer o questionário, a nova
    // rotina começa desmarcada.
    await AsyncStorage.setItem(
      `@MeuAutoCuidado:rotina:${email}:${hoje}`,
      JSON.stringify([])
    );
  }

  // ==========================================
  // MARCAR ATIVIDADES E GANHAR PONTOS
  // ==========================================

  function alternarAtividade(
    id: number
  ) {
    const email =
      emailAtualRef.current;

    if (!email || !respostas) {
      return;
    }

    const hoje = dataHoje();
    const estado = estadoRef.current;

    const lista =
      estado.dataAtividades === hoje
        ? estado.atividades
        : estado.atividades.map(
            atividade => ({
              ...atividade,
              concluida: false,
            })
          );

    const atividadeAnterior =
      lista.find(
        atividade =>
          atividade.id === id
      );

    if (!atividadeAnterior) {
      return;
    }

    const atualizadas = lista.map(
      atividade =>
        atividade.id === id
          ? {
              ...atividade,
              concluida:
                !atividade.concluida,
            }
          : atividade
    );

    estadoRef.current = {
      atividades: atualizadas,
      dataAtividades: hoje,
    };

    setAtividades(
      atualizadas
    );

    setDataAtividades(hoje);

    // Salva as atividades concluídas hoje.
    const nomesConcluidos =
      atualizadas
        .filter(
          atividade =>
            atividade.concluida
        )
        .map(
          atividade =>
            atividade.nome
        );

    AsyncStorage.setItem(
      `@MeuAutoCuidado:rotina:${email}:${hoje}`,
      JSON.stringify(
        nomesConcluidos
      )
    ).catch(erro => {
      console.log(
        'Erro ao salvar rotina:',
        erro
      );
    });

    // 10 pontos por primeira conclusão.
    if (
      !atividadeAnterior.concluida
    ) {
      const identificador =
        `${hoje}:${atividadeAnterior.nome}`;

      const atual =
        dadosJogoRef.current;

      if (
        !atual.atividadesPremiadas.includes(
          identificador
        )
      ) {
        const novosDados: DadosJogo = {
          ...atual,
          atividadesPremiadas: [
            ...atual.atividadesPremiadas,
            identificador,
          ],
        };

        dadosJogoRef.current =
          novosDados;

        setDadosJogo(
          novosDados
        );

        gravarJogo(
          email,
          novosDados
        ).catch(erro => {
          console.log(
            'Erro ao salvar pontos:',
            erro
          );
        });
      }
    }

    const registro = registroDoDia(
      atualizadas,
      hoje
    );

    const atualizado =
      atualizarHistorico(
        historicoRef.current,
        registro
      );

    historicoRef.current =
      atualizado;

    setHistoricoProgresso(
      atualizado
    );

    AsyncStorage.setItem(
      chaveHistorico(email),
      JSON.stringify(
        atualizado
      )
    ).catch(erro => {
      console.log(
        'Erro ao salvar histórico:',
        erro
      );
    });
  }

  // ==========================================
  // SISTEMA DE PONTOS
  // ==========================================

  const pontosAtividades =
    dadosJogo.atividadesPremiadas.length *
    10;

  const saldoPontos = Math.max(
    0,
    pontosAtividades +
      dadosJogo.pontosExtras -
      dadosJogo.pontosGastos
  );

  // ==========================================
  // COMPRAR RECOMPENSAS
  // ==========================================

  async function comprarPremio(
    id: string
  ): Promise<ResultadoJogo> {
    const email =
      emailAtualRef.current;

    if (!email) {
      return {
        ok: false,
        mensagem:
          'Entre na sua conta primeiro.',
      };
    }

    const premio = PREMIOS_LOJA.find(
      item => item.id === id
    );

    if (!premio) {
      return {
        ok: false,
        mensagem:
          'Recompensa não encontrada.',
      };
    }

    if (
      operacaoJogoRef.current
    ) {
      return {
        ok: false,
        mensagem:
          'Aguarde um instante.',
      };
    }

    operacaoJogoRef.current =
      true;

    try {
      const atual =
        dadosJogoRef.current;

      if (
        atual.compras.includes(id)
      ) {
        return {
          ok: false,
          mensagem:
            'Você já comprou esse personagem.',
        };
      }

      const disponiveis =
        atual.atividadesPremiadas.length *
          10 +
        atual.pontosExtras -
        atual.pontosGastos;

      if (
        disponiveis < premio.custo
      ) {
        return {
          ok: false,
          mensagem:
            'Você ainda não tem pontos suficientes.',
        };
      }

      const novosDados: DadosJogo = {
        ...atual,
        compras: [
          ...atual.compras,
          id,
        ],
        pontosGastos:
          atual.pontosGastos +
          premio.custo,
      };

      await gravarJogo(
        email,
        novosDados
      );

      if (
        emailAtualRef.current ===
        email
      ) {
        dadosJogoRef.current =
          novosDados;

        setDadosJogo(
          novosDados
        );
      }

      return {
        ok: true,
        mensagem:
          'Personagem desbloqueado com sucesso! 💜',
      };
    } catch {
      return {
        ok: false,
        mensagem:
          'Não foi possível finalizar a compra.',
      };
    } finally {
      operacaoJogoRef.current =
        false;
    }
  }

  // ==========================================
  // REGAR O JARDIM
  // ==========================================

  async function regarJardim():
    Promise<ResultadoJogo> {
    const email =
      emailAtualRef.current;

    if (!email) {
      return {
        ok: false,
        mensagem:
          'Entre na sua conta primeiro.',
      };
    }

    if (
      operacaoJogoRef.current
    ) {
      return {
        ok: false,
        mensagem:
          'Aguarde um instante.',
      };
    }

    operacaoJogoRef.current =
      true;

    try {
      const atual =
        dadosJogoRef.current;

      const hoje = dataHoje();

      if (
        atual.ultimaRega === hoje
      ) {
        return {
          ok: false,
          mensagem:
            'Você já regou seu jardim hoje. Volte amanhã! 🌷',
        };
      }

      const novosDados: DadosJogo = {
        ...atual,
        ultimaRega: hoje,
        crescimento:
          atual.crescimento + 1,
        pontosExtras:
          atual.pontosExtras + 25,
      };

      await gravarJogo(
        email,
        novosDados
      );

      if (
        emailAtualRef.current ===
        email
      ) {
        dadosJogoRef.current =
          novosDados;

        setDadosJogo(
          novosDados
        );
      }

      return {
        ok: true,
        mensagem:
          'Sua plantinha cresceu! Você ganhou 25 pontos. 🌸',
      };
    } catch {
      return {
        ok: false,
        mensagem:
          'Não foi possível salvar seu jardim.',
      };
    } finally {
      operacaoJogoRef.current =
        false;
    }
  }

  // ==========================================
  // SALVAR TEMA E PREFERÊNCIAS
  // ==========================================

  async function atualizarPreferencias(
    dados: Partial<Preferencias>
  ): Promise<void> {
    const email =
      emailAtualRef.current;

    if (!email) {
      throw new Error(
        'Faça o cadastro primeiro.'
      );
    }

    const anteriores =
      preferenciasRef.current;

    const novasPreferencias =
      validarPreferencias({
        ...anteriores,
        ...dados,
      });

    preferenciasRef.current =
      novasPreferencias;

    setPreferencias(
      novasPreferencias
    );

    try {
      await AsyncStorage.setItem(
        chavePreferencias(email),
        JSON.stringify(
          novasPreferencias
        )
      );
    } catch (erro) {
      if (
        emailAtualRef.current === email &&
        preferenciasRef.current ===
          novasPreferencias
      ) {
        preferenciasRef.current =
          anteriores;

        setPreferencias(
          anteriores
        );
      }

      throw erro;
    }
  }

  // ==========================================
  // REINICIAR ATIVIDADES A CADA DIA
  // ==========================================

  useEffect(() => {
    if (carregando) return;

    function verificarNovoDia() {
      const hoje = dataHoje();
      const estado =
        estadoRef.current;

      if (
        estado.dataAtividades === hoje
      ) {
        return;
      }

      const reiniciadas =
        estado.atividades.map(
          atividade => ({
            ...atividade,
            concluida: false,
          })
        );

      estadoRef.current = {
        atividades: reiniciadas,
        dataAtividades: hoje,
      };

      setAtividades(
        reiniciadas
      );

      setDataAtividades(
        hoje
      );
    }

    verificarNovoDia();

    const intervalo = setInterval(
      verificarNovoDia,
      60000
    );

    const assinatura =
      AppState.addEventListener(
        'change',
        estado => {
          if (
            estado === 'active'
          ) {
            verificarNovoDia();
          }
        }
      );

    return () => {
      clearInterval(
        intervalo
      );

      assinatura.remove();
    };
  }, [carregando]);

  // ==========================================
  // PROGRESSO DO DIA
  // ==========================================

  const atividadesDeHoje =
    useMemo(() => {
      if (
        dataAtividades === dataHoje()
      ) {
        return atividades;
      }

      return atividades.map(
        atividade => ({
          ...atividade,
          concluida: false,
        })
      );
    }, [
      atividades,
      dataAtividades,
    ]);

  const concluidas =
    atividadesDeHoje.filter(
      atividade =>
        atividade.concluida
    ).length;

  const progresso =
    atividadesDeHoje.length > 0
      ? Math.round(
          (concluidas /
            atividadesDeHoje.length) *
            100
        )
      : 0;

  // ==========================================
  // DICAS E CONQUISTAS
  // ==========================================

  const dicasPersonalizadas =
    useMemo(
      () => criarDicas(respostas),
      [respostas]
    );

  const sequenciaDias =
    useMemo(
      () =>
        calcularSequencia(
          historicoProgresso
        ),
      [historicoProgresso]
    );

  const estatisticas =
    useMemo(
      () =>
        calcularEstatisticas(
          historicoProgresso
        ),
      [historicoProgresso]
    );

  const conquistas =
    useMemo(
      () =>
        criarConquistas(
          estatisticas
        ),
      [estatisticas]
    );

  // ==========================================
  // TEMA ATUAL
  // ==========================================

  const cores = useMemo(() => {
    const temaSelecionado =
      TEMAS[preferencias.tema] ||
      TEMAS.lavanda;

    const usarEscuro =
      preferencias.modoNoturno ||
      preferencias.tema === 'noite';

    return usarEscuro
      ? temaSelecionado.escuro
      : temaSelecionado.claro;
  }, [
    preferencias.tema,
    preferencias.modoNoturno,
  ]);

  // ==========================================
  // ESTILO DOS CARTÕES
  // ==========================================

  const raioCartao =
    preferencias.estiloCartao ===
    'minimalista'
      ? 8
      : preferencias.estiloCartao ===
          'elegante'
        ? 16
        : 24;

  // ==========================================
  // TAMANHO DAS LETRAS
  // ==========================================

  const escalaFonte =
    preferencias.tamanhoFonte ===
    'extra'
      ? 1.22
      : preferencias.tamanhoFonte ===
          'grande'
        ? 1.1
        : 1;

  // ==========================================
  // DADOS DISPONÍVEIS PARA AS PÁGINAS
  // ==========================================

  const valor: Contexto = {
    usuario,
    salvarUsuario,

    respostas,
    salvarRespostas,

    atividades: atividadesDeHoje,
    alternarAtividade,

    concluidas,
    progresso,
    dicasPersonalizadas,

    historicoProgresso,
    sequenciaDias,
    carregando,

    conquistas,
    estatisticas,

    preferencias,
    atualizarPreferencias,

    cores,
    raioCartao,
    escalaFonte,

    saldoPontos,
    dadosJogo,
    comprarPremio,
    regarJardim,
  };

  return (
    <Context.Provider value={valor}>
      {children}
    </Context.Provider>
  );
}

// ============================================
// HOOK DO CONTEXTO
// ============================================

export function useAutocuidado() {
  const contexto = useContext(Context);

  if (!contexto) {
    throw new Error(
      'useAutocuidado deve ser usado dentro de AutocuidadoProvider.'
    );
  }

  return contexto;
}
