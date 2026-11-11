
import React, { useState } from 'react';

import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';

import { router } from 'expo-router';
import { useAutocuidado } from './AutocuidadoContext';

type Respostas = {
  sono: string;
  agua: string;
  movimento: string;
  estresse: string;
  objetivo: string[];
  tempo: string;
};

type CampoSimples =
  | 'sono'
  | 'agua'
  | 'movimento'
  | 'estresse';

type Opcao = {
  valor: string;
  titulo: string;
  descricao: string;
  emoji: string;
};

type Pergunta = {
  campo: keyof Respostas;
  titulo: string;
  descricao: string;
  emoji: string;
  opcoes: Opcao[];
};

const PERGUNTAS: Pergunta[] = [
  {
    campo: 'sono',
    titulo: 'Como está seu sono?',
    descricao:
      'Conte como você costuma dormir e descansar.',
    emoji: '🌙',
    opcoes: [
      {
        valor: 'bom',
        titulo: 'Durmo bem',
        descricao: 'Costumo descansar o suficiente.',
        emoji: '😴',
      },
      {
        valor: 'regular',
        titulo: 'Poderia melhorar',
        descricao: 'Nem sempre acordo descansada(o).',
        emoji: '🌙',
      },
      {
        valor: 'ruim',
        titulo: 'Tenho dificuldade para dormir',
        descricao: 'Meu sono costuma ser insuficiente.',
        emoji: '🥱',
      },
    ],
  },
  {
    campo: 'agua',
    titulo: 'Como está sua hidratação?',
    descricao:
      'Pense na frequência com que você bebe água.',
    emoji: '💧',
    opcoes: [
      {
        valor: 'boa',
        titulo: 'Bebo água regularmente',
        descricao:
          'Lembro de me hidratar durante o dia.',
        emoji: '💧',
      },
      {
        valor: 'as_vezes',
        titulo: 'Às vezes esqueço',
        descricao:
          'Poderia beber água com mais frequência.',
        emoji: '🫗',
      },
      {
        valor: 'esqueço',
        titulo: 'Esqueço com frequência',
        descricao: 'Preciso criar esse hábito.',
        emoji: '🌊',
      },
    ],
  },
  {
    campo: 'movimento',
    titulo: 'Você pratica atividades físicas?',
    descricao:
      'Vale qualquer movimento que faça bem a você.',
    emoji: '🧘',
    opcoes: [
      {
        valor: 'frequente',
        titulo: 'Sim, com frequência',
        descricao:
          'Já tenho o hábito de me movimentar.',
        emoji: '🏃',
      },
      {
        valor: 'as_vezes',
        titulo: 'De vez em quando',
        descricao:
          'Gostaria de ter mais regularidade.',
        emoji: '🚶',
      },
      {
        valor: 'começar',
        titulo: 'Quero começar',
        descricao:
          'Ainda não tenho uma rotina de movimento.',
        emoji: '🧘',
      },
    ],
  },
  {
    campo: 'estresse',
    titulo: 'Como está seu nível de estresse?',
    descricao:
      'Considere como você se sente na maior parte dos dias.',
    emoji: '🌿',
    opcoes: [
      {
        valor: 'baixo',
        titulo: 'Baixo',
        descricao:
          'Geralmente me sinto tranquila(o).',
        emoji: '🌷',
      },
      {
        valor: 'moderado',
        titulo: 'Moderado',
        descricao:
          'Tenho alguns momentos de tensão.',
        emoji: '🌿',
      },
      {
        valor: 'alto',
        titulo: 'Alto',
        descricao:
          'Tenho sentido bastante tensão.',
        emoji: '🦋',
      },
    ],
  },
  {
    campo: 'objetivo',
    titulo: 'Quais são seus objetivos?',
    descricao:
      'Escolha os cuidados que deseja priorizar.',
    emoji: '💗',
    opcoes: [
      {
        valor: 'sono',
        titulo: 'Dormir melhor',
        descricao:
          'Melhorar meus hábitos de descanso.',
        emoji: '🌙',
      },
      {
        valor: 'autoestima',
        titulo: 'Cuidar da autoestima',
        descricao:
          'Ter momentos de carinho comigo.',
        emoji: '💗',
      },
      {
        valor: 'organização',
        titulo: 'Ser mais organizada(o)',
        descricao:
          'Construir uma rotina mais equilibrada.',
        emoji: '📝',
      },
      {
        valor: 'relaxar',
        titulo: 'Relaxar mais',
        descricao:
          'Diminuir a correria do dia a dia.',
        emoji: '🦋',
      },
      {
        valor: 'disposição',
        titulo: 'Ter mais disposição',
        descricao:
          'Cuidar da energia e do bem-estar.',
        emoji: '☀️',
      },
      {
        valor: 'pele',
        titulo: 'Cuidar da pele',
        descricao:
          'Criar hábitos de cuidados pessoais.',
        emoji: '🧴',
      },
    ],
  },
  {
    campo: 'tempo',
    titulo:
      'Quanto tempo você tem disponível no seu dia?',
    descricao:
      'Informe as horas e os minutos que consegue reservar diariamente para seu autocuidado.',
    emoji: '⏱️',
    opcoes: [],
  },
];

const RESPOSTAS_INICIAIS: Respostas = {
  sono: '',
  agua: '',
  movimento: '',
  estresse: '',
  objetivo: [],
  tempo: '',
};

function mostrarAviso(
  titulo: string,
  mensagem: string
) {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      window.alert(`${titulo}\n\n${mensagem}`);
    }
    return;
  }

  Alert.alert(titulo, mensagem);
}

function formatarTempo(tempo: string) {
  if (!tempo) return 'Não informado';

  const [h, m] = tempo.split(':');
  const horas = Number(h);
  const minutos = Number(m);

  if (
    !Number.isFinite(horas) ||
    !Number.isFinite(minutos)
  ) {
    return tempo;
  }

  const partes: string[] = [];

  if (horas > 0) {
    partes.push(
      `${horas} ${horas === 1 ? 'hora' : 'horas'}`
    );
  }

  if (minutos > 0) {
    partes.push(
      `${minutos} ${
        minutos === 1 ? 'minuto' : 'minutos'
      }`
    );
  }

  return partes.join(' e ') || '0 minutos';
}

function tituloDaResposta(
  pergunta: Pergunta,
  valor: string
) {
  if (pergunta.campo === 'tempo') {
    return formatarTempo(valor);
  }

  return (
    pergunta.opcoes.find(
      opcao => opcao.valor === valor
    )?.titulo || valor
  );
}

export default function Questionario() {
  const {
    salvarRespostas,
    cores,
    preferencias,
    raioCartao,
    escalaFonte,
  } = useAutocuidado();

  const [etapa, setEtapa] = useState(0);
  const [mostrarResumo, setMostrarResumo] =
    useState(false);
  const [salvando, setSalvando] = useState(false);

  const [horas, setHoras] = useState('');
  const [minutos, setMinutos] = useState('');

  const [formulario, setFormulario] =
    useState<Respostas>({
      ...RESPOSTAS_INICIAIS,
      objetivo: [],
    });

  const escuro =
    preferencias.modoNoturno ||
    preferencias.tema === 'noite';

  const fonte = (n: number) =>
    Math.round(n * escalaFonte);

  const raioMenor = Math.max(6, raioCartao - 8);

  const perguntaAtual = PERGUNTAS[etapa];

  const multiplaEscolha =
    perguntaAtual.campo === 'objetivo';

  const perguntaTempo =
    perguntaAtual.campo === 'tempo';

  const totalPerguntas = PERGUNTAS.length;

  const progresso = mostrarResumo
    ? 100
    : ((etapa + 1) / totalPerguntas) * 100;

  const respostasPreenchidas = [
    formulario.sono,
    formulario.agua,
    formulario.movimento,
    formulario.estresse,
    formulario.objetivo,
    formulario.tempo,
  ].filter(resposta =>
    Array.isArray(resposta)
      ? resposta.length > 0
      : resposta.trim().length > 0
  ).length;

  const card = {
    backgroundColor: cores.card,
    borderColor: cores.borda,
    borderRadius: raioCartao,
  };

  const cardSuave = {
    backgroundColor: cores.suave,
    borderRadius: raioMenor,
  };

  function obterRespostaAtual(): string | string[] {
    return formulario[perguntaAtual.campo];
  }

  function selecionarOpcao(valor: string) {
    if (multiplaEscolha) {
      setFormulario(anterior => {
        const selecionado =
          anterior.objetivo.includes(valor);

        return {
          ...anterior,
          objetivo: selecionado
            ? anterior.objetivo.filter(
                item => item !== valor
              )
            : [...anterior.objetivo, valor],
        };
      });

      return;
    }

    if (perguntaTempo) return;

    const campo =
      perguntaAtual.campo as CampoSimples;

    setFormulario(anterior => ({
      ...anterior,
      [campo]: valor,
    }));
  }

  function estaSelecionado(valor: string) {
    const resposta = obterRespostaAtual();

    return Array.isArray(resposta)
      ? resposta.includes(valor)
      : resposta === valor;
  }

  function atualizarTempo(
    novasHoras: string,
    novosMinutos: string
  ) {
    const h = novasHoras
      .replace(/\D/g, '')
      .slice(0, 2);

    const m = novosMinutos
      .replace(/\D/g, '')
      .slice(0, 2);

    setHoras(h);
    setMinutos(m);

    if (!h && !m) {
      setFormulario(anterior => ({
        ...anterior,
        tempo: '',
      }));
      return;
    }

    const tempoFormatado =
      `${String(Number(h || '0')).padStart(2, '0')}:` +
      `${String(Number(m || '0')).padStart(2, '0')}`;

    setFormulario(anterior => ({
      ...anterior,
      tempo: tempoFormatado,
    }));
  }

  function validarTempo() {
    if (!horas.trim() && !minutos.trim()) {
      mostrarAviso(
        'Informe seu tempo',
        'Digite quantas horas ou minutos você tem disponíveis por dia.'
      );
      return false;
    }

    const h = Number(horas || '0');
    const m = Number(minutos || '0');

    if (
      !Number.isInteger(h) ||
      !Number.isInteger(m) ||
      h < 0 ||
      h > 24 ||
      m < 0 ||
      m > 59 ||
      (h === 24 && m > 0)
    ) {
      mostrarAviso(
        'Tempo inválido',
        'Informe de 0 a 24 horas e de 0 a 59 minutos. O limite é de 24 horas por dia.'
      );
      return false;
    }

    if (h === 0 && m === 0) {
      mostrarAviso(
        'Tempo inválido',
        'Informe um tempo maior que zero.'
      );
      return false;
    }

    return true;
  }

  function respostaValida() {
    if (perguntaTempo) {
      return validarTempo();
    }

    const resposta = obterRespostaAtual();

    const valida = Array.isArray(resposta)
      ? resposta.length > 0
      : resposta.trim().length > 0;

    if (!valida) {
      mostrarAviso(
        'Escolha uma opção',
        multiplaEscolha
          ? 'Selecione pelo menos um objetivo.'
          : 'Selecione uma resposta para continuar.'
      );
    }

    return valida;
  }

  function avancar() {
    if (!respostaValida()) return;

    if (etapa < totalPerguntas - 1) {
      setEtapa(anterior => anterior + 1);
      return;
    }

    setMostrarResumo(true);
  }

  function voltar() {
    if (mostrarResumo) {
      setMostrarResumo(false);
      return;
    }

    if (etapa > 0) {
      setEtapa(anterior => anterior - 1);
      return;
    }

    router.replace('/login');
  }

  function editarPergunta(indice: number) {
    setEtapa(indice);
    setMostrarResumo(false);
  }

  async function finalizar() {
    if (salvando) return;

    if (respostasPreenchidas !== totalPerguntas) {
      mostrarAviso(
        'Questionário incompleto',
        'Responda a todas as perguntas antes de finalizar.'
      );
      return;
    }

    if (!validarTempo()) return;

    setSalvando(true);

    try {
      await Promise.resolve(
        salvarRespostas({
          ...formulario,
          objetivo: [...formulario.objetivo],
        })
      );

      router.replace('/rotina');
    } catch (erro) {
      console.error(
        'Erro ao finalizar questionário:',
        erro
      );

      mostrarAviso(
        'Não foi possível salvar',
        'Ocorreu um problema ao salvar suas respostas. Tente novamente.'
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: cores.fundo },
      ]}
    >
      <StatusBar
        barStyle={
          escuro ? 'light-content' : 'dark-content'
        }
        backgroundColor={cores.fundo}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={
          Platform.OS === 'ios' ? 'padding' : undefined
        }
      >
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.conteudo}>
            {/* VOLTAR */}
            <TouchableOpacity
              style={styles.voltar}
              onPress={voltar}
              disabled={salvando}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.voltarTexto,
                  {
                    color: cores.primario,
                    fontSize: fonte(14),
                  },
                ]}
              >
                ←{' '}
                {mostrarResumo
                  ? 'Voltar às perguntas'
                  : etapa === 0
                  ? 'Voltar'
                  : 'Pergunta anterior'}
              </Text>
            </TouchableOpacity>

            {/* CABEÇALHO */}
            <Text
              style={[
                styles.etiqueta,
                {
                  color: cores.primario,
                  fontSize: fonte(12),
                },
              ]}
            >
              SUA JORNADA COMEÇA AQUI
            </Text>

            <Text
              style={[
                styles.titulo,
                {
                  color: cores.texto,
                  fontSize: fonte(30),
                  lineHeight: fonte(30) + 9,
                },
              ]}
            >
              Vamos conhecer você 💜
            </Text>

            <Text
              style={[
                styles.subtitulo,
                {
                  color: cores.secundario,
                  fontSize: fonte(14),
                  lineHeight: fonte(14) + 9,
                },
              ]}
            >
              Suas respostas ajudam a criar uma rotina
              de autocuidado mais adequada aos seus
              hábitos e objetivos.
            </Text>

            {/* PROGRESSO */}
            <View
              style={[
                styles.progressoCard,
                card,
              ]}
            >
              <View style={styles.progressoCabecalho}>
                <Text
                  style={[
                    styles.progressoTexto,
                    {
                      color: cores.secundario,
                      fontSize: fonte(11),
                    },
                  ]}
                >
                  {mostrarResumo
                    ? 'QUESTIONÁRIO COMPLETO'
                    : 'SEU QUESTIONÁRIO'}
                </Text>

                <Text
                  style={[
                    styles.progressoEtapa,
                    {
                      color: cores.primario,
                      fontSize: fonte(13),
                    },
                  ]}
                >
                  {mostrarResumo
                    ? '100%'
                    : `${etapa + 1} de ${totalPerguntas}`}
                </Text>
              </View>

              <View
                style={[
                  styles.barraFundo,
                  { backgroundColor: cores.suave },
                ]}
              >
                <View
                  style={[
                    styles.barraPreenchida,
                    {
                      backgroundColor: cores.primario,
                      width: `${progresso}%`,
                    },
                  ]}
                />
              </View>

              <Text
                style={[
                  styles.progressoLegenda,
                  {
                    color: cores.secundario,
                    fontSize: fonte(12),
                  },
                ]}
              >
                {respostasPreenchidas} de {totalPerguntas}{' '}
                respostas preenchidas
              </Text>
            </View>

            {mostrarResumo ? (
              <>
                {/* RESUMO */}
                <View
                  style={[
                    styles.resumoPrincipal,
                    {
                      backgroundColor: cores.suave,
                      borderRadius: raioCartao,
                    },
                  ]}
                >
                  <Text style={styles.resumoEmoji}>
                    🌷
                  </Text>

                  <Text
                    style={[
                      styles.resumoTitulo,
                      {
                        color: cores.texto,
                        fontSize: fonte(22),
                      },
                    ]}
                  >
                    Sua jornada está pronta!
                  </Text>

                  <Text
                    style={[
                      styles.resumoDescricao,
                      {
                        color: cores.secundario,
                        fontSize: fonte(14),
                        lineHeight: fonte(14) + 9,
                      },
                    ]}
                  >
                    Confira suas respostas antes de
                    salvar. Você pode tocar em qualquer
                    resposta para alterá-la.
                  </Text>
                </View>

                {PERGUNTAS.map((pergunta, indice) => {
                  const resposta =
                    formulario[pergunta.campo];

                  const valores = Array.isArray(resposta)
                    ? resposta
                    : resposta
                    ? [resposta]
                    : [];

                  const textoResposta =
                    valores
                      .map(valor =>
                        tituloDaResposta(
                          pergunta,
                          valor
                        )
                      )
                      .join(', ') || 'Não respondida';

                  return (
                    <TouchableOpacity
                      key={pergunta.campo}
                      style={[
                        styles.respostaCard,
                        card,
                      ]}
                      onPress={() =>
                        editarPergunta(indice)
                      }
                      disabled={salvando}
                      activeOpacity={0.85}
                    >
                      <View
                        style={[
                          styles.respostaIcone,
                          cardSuave,
                        ]}
                      >
                        <Text
                          style={styles.respostaEmoji}
                        >
                          {pergunta.emoji}
                        </Text>
                      </View>

                      <View style={styles.respostaInfo}>
                        <Text
                          style={[
                            styles.respostaPergunta,
                            {
                              color: cores.texto,
                              fontSize: fonte(13),
                              lineHeight: fonte(13) + 7,
                            },
                          ]}
                        >
                          {pergunta.titulo}
                        </Text>

                        <Text
                          style={[
                            styles.respostaTexto,
                            {
                              color: cores.secundario,
                              fontSize: fonte(12),
                              lineHeight: fonte(12) + 8,
                            },
                          ]}
                        >
                          {textoResposta}
                        </Text>
                      </View>

                      <Text
                        style={[
                          styles.editarTexto,
                          {
                            color: cores.primario,
                            fontSize: fonte(12),
                          },
                        ]}
                      >
                        Editar
                      </Text>
                    </TouchableOpacity>
                  );
                })}

                <View
                  style={[
                    styles.avisoResumo,
                    cardSuave,
                  ]}
                >
                  <Text
                    style={[
                      styles.avisoResumoTexto,
                      {
                        color: cores.texto,
                        fontSize: fonte(13),
                        lineHeight: fonte(13) + 9,
                      },
                    ]}
                  >
                    ✨ Ao salvar, suas respostas serão
                    utilizadas para personalizar as
                    sugestões de autocuidado.
                  </Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.botaoContinuar,
                    {
                      backgroundColor: cores.primario,
                      borderRadius: raioMenor,
                    },
                    salvando &&
                      styles.botaoDesabilitado,
                  ]}
                  onPress={finalizar}
                  disabled={salvando}
                  activeOpacity={0.85}
                >
                  {salvando ? (
                    <ActivityIndicator
                      color={cores.textoBotao}
                    />
                  ) : (
                    <Text
                      style={[
                        styles.botaoContinuarTexto,
                        {
                          color: cores.textoBotao,
                          fontSize: fonte(16),
                        },
                      ]}
                    >
                      ✨ Salvar e criar minha rotina
                    </Text>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <>
                {/* PERGUNTA ATUAL */}
                <View
                  style={[
                    styles.perguntaCard,
                    card,
                  ]}
                >
                  <View
                    style={[
                      styles.perguntaIcone,
                      cardSuave,
                    ]}
                  >
                    <Text
                      style={styles.perguntaEmoji}
                    >
                      {perguntaAtual.emoji}
                    </Text>
                  </View>

                  <Text
                    style={[
                      styles.perguntaNumero,
                      {
                        color: cores.primario,
                        fontSize: fonte(11),
                      },
                    ]}
                  >
                    PERGUNTA {etapa + 1}
                  </Text>

                  <Text
                    style={[
                      styles.perguntaTitulo,
                      {
                        color: cores.texto,
                        fontSize: fonte(22),
                        lineHeight: fonte(22) + 10,
                      },
                    ]}
                  >
                    {perguntaAtual.titulo}
                  </Text>

                  <Text
                    style={[
                      styles.perguntaDescricao,
                      {
                        color: cores.secundario,
                        fontSize: fonte(14),
                        lineHeight: fonte(14) + 9,
                      },
                    ]}
                  >
                    {perguntaAtual.descricao}
                  </Text>

                  {/* PERGUNTA 5 */}
                  {multiplaEscolha && (
                    <View
                      style={[
                        styles.avisoMultipla,
                        cardSuave,
                      ]}
                    >
                      <Text
                        style={[
                          styles.avisoMultiplaTexto,
                          {
                            color: cores.texto,
                            fontSize: fonte(14),
                          },
                        ]}
                      >
                        ☑ Você pode escolher várias opções
                      </Text>

                      <Text
                        style={[
                          styles.avisoMultiplaDescricao,
                          {
                            color: cores.secundario,
                            fontSize: fonte(12),
                            lineHeight: fonte(12) + 8,
                          },
                        ]}
                      >
                        Selecione todos os objetivos que
                        fazem sentido para você.
                      </Text>
                    </View>
                  )}

                  {perguntaTempo ? (
                    <>
                      {/* PERGUNTA 6 */}
                      <View
                        style={[
                          styles.tempoDestaque,
                          cardSuave,
                        ]}
                      >
                        <Text
                          style={[
                            styles.tempoDestaqueTitulo,
                            {
                              color: cores.texto,
                              fontSize: fonte(15),
                            },
                          ]}
                        >
                          ⏰ Sua disponibilidade diária
                        </Text>

                        <Text
                          style={[
                            styles.tempoDestaqueTexto,
                            {
                              color: cores.secundario,
                              fontSize: fonte(13),
                              lineHeight: fonte(13) + 9,
                            },
                          ]}
                        >
                          Digite as horas e os minutos
                          que você realmente tem livres
                          para se cuidar.
                        </Text>
                      </View>

                      <View style={styles.tempoLinha}>
                        <View style={styles.tempoCampo}>
                          <Text
                            style={[
                              styles.tempoLabel,
                              {
                                color: cores.texto,
                                fontSize: fonte(14),
                              },
                            ]}
                          >
                            Horas
                          </Text>

                          <TextInput
                            style={[
                              styles.tempoInput,
                              {
                                backgroundColor:
                                  cores.fundo,
                                borderColor: cores.borda,
                                borderRadius: raioMenor,
                                color: cores.texto,
                                fontSize: fonte(27),
                              },
                            ]}
                            value={horas}
                            onChangeText={texto =>
                              atualizarTempo(
                                texto,
                                minutos
                              )
                            }
                            keyboardType="number-pad"
                            placeholder="0"
                            placeholderTextColor={
                              cores.secundario
                            }
                            maxLength={2}
                            selectTextOnFocus
                            editable={!salvando}
                            accessibilityLabel="Horas disponíveis"
                          />
                        </View>

                        <Text
                          style={[
                            styles.tempoSeparador,
                            {
                              color: cores.primario,
                              fontSize: fonte(28),
                            },
                          ]}
                        >
                          :
                        </Text>

                        <View style={styles.tempoCampo}>
                          <Text
                            style={[
                              styles.tempoLabel,
                              {
                                color: cores.texto,
                                fontSize: fonte(14),
                              },
                            ]}
                          >
                            Minutos
                          </Text>

                          <TextInput
                            style={[
                              styles.tempoInput,
                              {
                                backgroundColor:
                                  cores.fundo,
                                borderColor: cores.borda,
                                borderRadius: raioMenor,
                                color: cores.texto,
                                fontSize: fonte(27),
                              },
                            ]}
                            value={minutos}
                            onChangeText={texto =>
                              atualizarTempo(
                                horas,
                                texto
                              )
                            }
                            keyboardType="number-pad"
                            placeholder="00"
                            placeholderTextColor={
                              cores.secundario
                            }
                            maxLength={2}
                            selectTextOnFocus
                            editable={!salvando}
                            accessibilityLabel="Minutos disponíveis"
                          />
                        </View>
                      </View>

                      <View
                        style={[
                          styles.tempoExemplo,
                          cardSuave,
                        ]}
                      >
                        <Text
                          style={[
                            styles.tempoExemploTexto,
                            {
                              color: cores.secundario,
                              fontSize: fonte(13),
                              lineHeight: fonte(13) + 9,
                            },
                          ]}
                        >
                          💡 Exemplo: para 2 horas e 30
                          minutos, digite 2 em Horas e
                          30 em Minutos.
                        </Text>
                      </View>

                      {!!formulario.tempo &&
                        !!(horas || minutos) && (
                          <View
                            style={[
                              styles.tempoResultado,
                              cardSuave,
                            ]}
                          >
                            <Text
                              style={[
                                styles.tempoResultadoTexto,
                                {
                                  color: cores.texto,
                                  fontSize: fonte(14),
                                },
                              ]}
                            >
                              💜 Tempo informado:{' '}
                              {formatarTempo(
                                formulario.tempo
                              )}
                            </Text>
                          </View>
                        )}
                    </>
                  ) : (
                    <>
                      {/* OPÇÕES */}
                      {perguntaAtual.opcoes.map(opcao => {
                        const selecionada =
                          estaSelecionado(opcao.valor);

                        return (
                          <TouchableOpacity
                            key={opcao.valor}
                            style={[
                              styles.opcaoCard,
                              {
                                backgroundColor:
                                  selecionada
                                    ? cores.suave
                                    : cores.card,
                                borderColor: selecionada
                                  ? cores.primario
                                  : cores.borda,
                                borderWidth: selecionada
                                  ? 2
                                  : 1,
                                borderRadius: raioMenor,
                              },
                            ]}
                            onPress={() =>
                              selecionarOpcao(
                                opcao.valor
                              )
                            }
                            activeOpacity={0.85}
                            accessibilityRole={
                              multiplaEscolha
                                ? 'checkbox'
                                : 'radio'
                            }
                            accessibilityState={{
                              checked: selecionada,
                            }}
                          >
                            <View
                              style={[
                                styles.opcaoIcone,
                                cardSuave,
                              ]}
                            >
                              <Text
                                style={styles.opcaoEmoji}
                              >
                                {opcao.emoji}
                              </Text>
                            </View>

                            <View
                              style={styles.opcaoInfo}
                            >
                              <Text
                                style={[
                                  styles.opcaoTitulo,
                                  {
                                    color: cores.texto,
                                    fontSize: fonte(15),
                                    lineHeight:
                                      fonte(15) + 7,
                                  },
                                ]}
                              >
                                {opcao.titulo}
                              </Text>

                              <Text
                                style={[
                                  styles.opcaoDescricao,
                                  {
                                    color:
                                      cores.secundario,
                                    fontSize: fonte(12),
                                    lineHeight:
                                      fonte(12) + 8,
                                  },
                                ]}
                              >
                                {opcao.descricao}
                              </Text>
                            </View>

                            <View
                              style={[
                                styles.seletor,
                                multiplaEscolha &&
                                  styles.seletorQuadrado,
                                {
                                  borderColor: selecionada
                                    ? cores.primario
                                    : cores.borda,
                                  backgroundColor:
                                    selecionada
                                      ? cores.primario
                                      : 'transparent',
                                },
                              ]}
                            >
                              {selecionada && (
                                <Text
                                  style={[
                                    styles.seletorCheck,
                                    {
                                      color:
                                        cores.textoBotao,
                                    },
                                  ]}
                                >
                                  ✓
                                </Text>
                              )}
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </>
                  )}
                </View>

                {/* AVANÇAR */}
                <TouchableOpacity
                  style={[
                    styles.botaoContinuar,
                    {
                      backgroundColor: cores.primario,
                      borderRadius: raioMenor,
                    },
                  ]}
                  onPress={avancar}
                  activeOpacity={0.85}
                >
                  <Text
                    style={[
                      styles.botaoContinuarTexto,
                      {
                        color: cores.textoBotao,
                        fontSize: fonte(16),
                      },
                    ]}
                  >
                    {etapa === totalPerguntas - 1
                      ? '✨ Revisar minhas respostas'
                      : 'Continuar →'}
                  </Text>
                </TouchableOpacity>

                <View style={styles.navegacaoInferior}>
                  <TouchableOpacity onPress={voltar}>
                    <Text
                      style={[
                        styles.navegacaoTexto,
                        {
                          color: cores.primario,
                          fontSize: fonte(14),
                        },
                      ]}
                    >
                      ← Anterior
                    </Text>
                  </TouchableOpacity>

                  <Text
                    style={[
                      styles.navegacaoIndicador,
                      {
                        color: cores.secundario,
                        fontSize: fonte(13),
                      },
                    ]}
                  >
                    {etapa + 1} / {totalPerguntas}
                  </Text>
                </View>
              </>
            )}

            <Text
              style={[
                styles.mensagem,
                {
                  color: cores.secundario,
                  fontSize: fonte(12),
                  lineHeight: fonte(12) + 8,
                },
              ]}
            >
              🌷 Responda com tranquilidade.
              Suas escolhas ajudam a personalizar
              sua experiência.
            </Text>

            <Text
              style={[
                styles.rodape,
                {
                  color: cores.secundario,
                  fontSize: fonte(11),
                },
              ]}
            >
              MEUAUTOCUIDADO • SEU BEM-ESTAR IMPORTA
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },

  safeArea: {
    flex: 1,
  },

  container: {
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingTop: 28,
    paddingBottom: 50,
    alignItems: 'center',
  },

  conteudo: {
    width: '100%',
    maxWidth: 820,
  },

  voltar: {
    alignSelf: 'flex-start',
    paddingVertical: 10,
    marginBottom: 22,
  },

  voltarTexto: {
    fontWeight: '800',
  },

  etiqueta: {
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 10,
  },

  titulo: {
    fontWeight: '800',
  },

  subtitulo: {
    marginTop: 11,
    marginBottom: 25,
  },

  progressoCard: {
    padding: 20,
    borderWidth: 1,
    marginBottom: 22,
  },

  progressoCabecalho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    gap: 12,
  },

  progressoTexto: {
    fontWeight: '800',
    letterSpacing: 0.5,
    flexShrink: 1,
  },

  progressoEtapa: {
    fontWeight: '800',
  },

  barraFundo: {
    height: 11,
    borderRadius: 10,
    overflow: 'hidden',
  },

  barraPreenchida: {
    height: '100%',
    borderRadius: 10,
  },

  progressoLegenda: {
    marginTop: 13,
  },

  perguntaCard: {
    padding: 21,
    borderWidth: 1,
    marginBottom: 21,
  },

  perguntaIcone: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 19,
  },

  perguntaEmoji: {
    fontSize: 32,
  },

  perguntaNumero: {
    fontWeight: '800',
    letterSpacing: 0.7,
    marginBottom: 10,
  },

  perguntaTitulo: {
    fontWeight: '800',
  },

  perguntaDescricao: {
    marginTop: 12,
    marginBottom: 22,
  },

  avisoMultipla: {
    padding: 16,
    marginBottom: 18,
  },

  avisoMultiplaTexto: {
    fontWeight: '800',
  },

  avisoMultiplaDescricao: {
    marginTop: 7,
  },

  opcaoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginBottom: 12,
  },

  opcaoIcone: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  opcaoEmoji: {
    fontSize: 25,
  },

  opcaoInfo: {
    flex: 1,
  },

  opcaoTitulo: {
    fontWeight: '800',
  },

  opcaoDescricao: {
    marginTop: 6,
  },

  seletor: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 9,
  },

  seletorQuadrado: {
    borderRadius: 7,
  },

  seletorCheck: {
    fontSize: 15,
    fontWeight: '800',
  },

  tempoDestaque: {
    padding: 18,
    marginBottom: 24,
  },

  tempoDestaqueTitulo: {
    fontWeight: '800',
  },

  tempoDestaqueTexto: {
    marginTop: 9,
  },

  tempoLinha: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 23,
  },

  tempoCampo: {
    flex: 1,
    maxWidth: 180,
  },

  tempoLabel: {
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 11,
  },

  tempoInput: {
    borderWidth: 2,
    minHeight: 73,
    paddingHorizontal: 8,
    paddingVertical: 13,
    fontWeight: '800',
    textAlign: 'center',
  },

  tempoSeparador: {
    fontWeight: '800',
    paddingBottom: 20,
  },

  tempoExemplo: {
    padding: 15,
    marginBottom: 14,
  },

  tempoExemploTexto: {},

  tempoResultado: {
    padding: 16,
  },

  tempoResultadoTexto: {
    fontWeight: '800',
  },

  botaoContinuar: {
    paddingVertical: 19,
    paddingHorizontal: 15,
    minHeight: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },

  botaoDesabilitado: {
    opacity: 0.6,
  },

  botaoContinuarTexto: {
    fontWeight: '800',
    textAlign: 'center',
  },

  navegacaoInferior: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 21,
  },

  navegacaoTexto: {
    fontWeight: '800',
  },

  navegacaoIndicador: {
    fontWeight: '700',
  },

  resumoPrincipal: {
    padding: 24,
    alignItems: 'center',
    marginBottom: 21,
  },

  resumoEmoji: {
    fontSize: 42,
    marginBottom: 14,
  },

  resumoTitulo: {
    fontWeight: '800',
    textAlign: 'center',
  },

  resumoDescricao: {
    textAlign: 'center',
    marginTop: 12,
  },

  respostaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 17,
    borderWidth: 1,
    marginBottom: 12,
  },

  respostaIcone: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  respostaEmoji: {
    fontSize: 24,
  },

  respostaInfo: {
    flex: 1,
  },

  respostaPergunta: {
    fontWeight: '800',
  },

  respostaTexto: {
    marginTop: 7,
  },

  editarTexto: {
    fontWeight: '800',
    marginLeft: 9,
  },

  avisoResumo: {
    padding: 18,
    marginTop: 12,
    marginBottom: 22,
  },

  avisoResumoTexto: {},

  mensagem: {
    textAlign: 'center',
    marginTop: 25,
  },

  rodape: {
    fontWeight: '800',
    letterSpacing: 0.7,
    textAlign: 'center',
    marginTop: 30,
  },
});
