
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  AppState,
} from 'react-native';
import { useAutocuidado } from './AutocuidadoContext';

type Exercicio = {
  id: string;
  nome: string;
  descricao: string;
  emoji: string;
  inspirar: number;
  segurar: number;
  expirar: number;
};

type Fase = 'inspirar' | 'segurar' | 'expirar';

const exercicios: Exercicio[] = [
  {
    id: 'calma',
    nome: 'Respiração tranquila',
    descricao: 'Um ritmo suave para desacelerar.',
    emoji: '🌷',
    inspirar: 4,
    segurar: 0,
    expirar: 4,
  },
  {
    id: 'equilibrio',
    nome: 'Encontre seu equilíbrio',
    descricao: 'Respire devagar e faça uma pequena pausa.',
    emoji: '🦋',
    inspirar: 4,
    segurar: 2,
    expirar: 6,
  },
  {
    id: 'descanso',
    nome: 'Pausa para descansar',
    descricao: 'Um momento tranquilo antes de dormir.',
    emoji: '🌙',
    inspirar: 4,
    segurar: 0,
    expirar: 6,
  },
];

const DURACOES = [60, 180, 300];

const orientacoes = [
  {
    emoji: '🪑',
    titulo: 'Encontre uma posição confortável',
    descricao:
      'Sente-se ou deite-se em uma posição em que consiga relaxar.',
  },
  {
    emoji: '🌿',
    titulo: 'Respeite seu próprio ritmo',
    descricao:
      'Não é necessário seguir os segundos exatamente. Respire naturalmente se preferir.',
  },
  {
    emoji: '💧',
    titulo: 'Pare se sentir desconforto',
    descricao:
      'Se sentir tontura, falta de ar ou desconforto, interrompa e volte a respirar normalmente.',
  },
];

const tecnicas = [
  {
    id: 'aterramento',
    emoji: '🌿',
    titulo: 'Técnica dos cinco sentidos',
    descricao: 'Uma pausa para prestar atenção ao presente.',
    passos: [
      'Observe cinco coisas que você consegue ver.',
      'Perceba quatro coisas que consegue sentir pelo toque.',
      'Identifique três sons ao seu redor.',
      'Note dois cheiros, se houver.',
      'Perceba um sabor ou uma sensação na boca.',
    ],
  },
  {
    id: 'sono',
    emoji: '🌙',
    titulo: 'Preparação para dormir',
    descricao: 'Crie um momento mais tranquilo antes do sono.',
    passos: [
      'Diminua a iluminação do ambiente.',
      'Afaste o celular por alguns minutos.',
      'Encontre uma posição confortável.',
      'Relaxe os ombros e a mandíbula.',
      'Respire naturalmente, sem tentar forçar o sono.',
    ],
  },
  {
    id: 'pausa',
    emoji: '🌷',
    titulo: 'Pausa para aliviar a tensão',
    descricao: 'Pequenos passos para desacelerar.',
    passos: [
      'Interrompa a atividade por um momento.',
      'Apoie os pés no chão, se estiver sentada(o).',
      'Solte os ombros suavemente.',
      'Observe o ambiente ao seu redor.',
      'Retome suas atividades quando se sentir confortável.',
    ],
  },
];

function formatarTempo(segundos: number) {
  const minutos = Math.floor(segundos / 60);
  const restante = segundos % 60;

  return (
    String(minutos).padStart(2, '0') +
    ':' +
    String(restante).padStart(2, '0')
  );
}

export default function Relaxamento() {
  const {
    usuario,
    respostas,
    preferencias,
    cores,
    raioCartao,
    escalaFonte,
  } = useAutocuidado();

  const escuro =
    preferencias.modoNoturno ||
    preferencias.tema === 'noite';

  const fonte = (tamanho: number) =>
    Math.round(tamanho * escalaFonte);

  const raioMenor = Math.max(6, raioCartao - 8);

  const estiloCard = {
    backgroundColor: cores.card,
    borderColor: cores.borda,
    borderRadius: raioCartao,
  };

  const estiloSuave = {
    backgroundColor: cores.suave,
    borderColor: cores.borda,
    borderRadius: raioCartao,
  };

  const estiloTexto = { color: cores.texto };
  const estiloSecundario = { color: cores.secundario };
  const estiloPrimario = { color: cores.primario };
  const estiloTextoBotao = { color: cores.textoBotao };

  const [exercicioSelecionado, setExercicioSelecionado] =
    useState<Exercicio>(exercicios[0]);

  const [duracao, setDuracao] = useState(60);
  const [ativo, setAtivo] = useState(false);
  const [tempoRestante, setTempoRestante] = useState(60);
  const [tempoDecorrido, setTempoDecorrido] = useState(0);
  const [ciclos, setCiclos] = useState(0);
  const [concluido, setConcluido] = useState(false);
  const [tecnicaAberta, setTecnicaAberta] =
    useState<string | null>(null);

  const escala = useRef(new Animated.Value(1)).current;
  const tempoDecorridoRef = useRef(0);
  const tempoRestanteRef = useRef(60);
  const duracaoRef = useRef(60);
  const inicioRef = useRef<number | null>(null);
  const animacaoRef =
    useRef<Animated.CompositeAnimation | null>(null);

  const nome =
    usuario?.nome?.trim().split(' ')[0] || 'você';

  const recomendado =
    respostas?.estresse === 'alto'
      ? 'calma'
      : respostas?.objetivo?.includes('sono')
      ? 'descanso'
      : 'equilibrio';

  const cicloTotal =
    exercicioSelecionado.inspirar +
    exercicioSelecionado.segurar +
    exercicioSelecionado.expirar;

  const posicaoCiclo = tempoDecorrido % cicloTotal;

  let faseAtual: Fase = 'inspirar';
  let segundosFase = 0;

  if (posicaoCiclo < exercicioSelecionado.inspirar) {
    faseAtual = 'inspirar';
    segundosFase =
      exercicioSelecionado.inspirar - posicaoCiclo;
  } else if (
    posicaoCiclo <
    exercicioSelecionado.inspirar +
      exercicioSelecionado.segurar
  ) {
    faseAtual = 'segurar';
    segundosFase =
      exercicioSelecionado.inspirar +
      exercicioSelecionado.segurar -
      posicaoCiclo;
  } else {
    faseAtual = 'expirar';
    segundosFase = cicloTotal - posicaoCiclo;
  }

  const textoFase =
    faseAtual === 'inspirar'
      ? 'Inspire suavemente'
      : faseAtual === 'segurar'
      ? 'Faça uma pequena pausa'
      : 'Expire devagar';

  const faseExibida = concluido
    ? 'Exercício concluído! ✨'
    : ativo
    ? textoFase
    : tempoDecorrido > 0
    ? 'Exercício pausado'
    : 'Pronta(o) para começar';

  const progresso =
    ((duracao - tempoRestante) / duracao) * 100;

  function pararAnimacao() {
    animacaoRef.current?.stop();
    animacaoRef.current = null;
    escala.stopAnimation();
  }

  function atualizarTempo(decorrido: number) {
    const novoDecorrido = Math.min(
      duracaoRef.current,
      Math.max(0, decorrido)
    );

    const restante = Math.max(
      0,
      duracaoRef.current - novoDecorrido
    );

    tempoDecorridoRef.current = novoDecorrido;
    tempoRestanteRef.current = restante;

    setTempoDecorrido(novoDecorrido);
    setTempoRestante(restante);

    const totalCiclo =
      exercicioSelecionado.inspirar +
      exercicioSelecionado.segurar +
      exercicioSelecionado.expirar;

    setCiclos(Math.floor(novoDecorrido / totalCiclo));

    if (restante === 0) {
      inicioRef.current = null;
      setAtivo(false);
      setConcluido(true);
      pararAnimacao();
    }
  }

  useEffect(() => {
    if (!ativo) return;

    inicioRef.current =
      Date.now() - tempoDecorridoRef.current * 1000;

    const intervalo = setInterval(() => {
      if (inicioRef.current === null) return;

      const decorrido = Math.floor(
        (Date.now() - inicioRef.current) / 1000
      );

      atualizarTempo(decorrido);
    }, 200);

    return () => clearInterval(intervalo);
  }, [ativo, exercicioSelecionado]);

  useEffect(() => {
    if (!ativo) {
      pararAnimacao();
      return;
    }

    const { inspirar, segurar, expirar } =
      exercicioSelecionado;

    const ciclo = inspirar + segurar + expirar;
    const posicao = tempoDecorridoRef.current % ciclo;

    let escalaInicial = 1;

    if (posicao < inspirar) {
      escalaInicial = 1 + (0.2 * posicao) / inspirar;
    } else if (posicao < inspirar + segurar) {
      escalaInicial = 1.2;
    } else {
      const tempoExpiracao =
        posicao - inspirar - segurar;

      escalaInicial =
        1.2 - (0.2 * tempoExpiracao) / expirar;
    }

    escala.setValue(escalaInicial);

    const animacoes: Animated.CompositeAnimation[] = [];

    if (posicao < inspirar) {
      animacoes.push(
        Animated.timing(escala, {
          toValue: 1.2,
          duration: (inspirar - posicao) * 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );

      if (segurar > 0) {
        animacoes.push(
          Animated.delay(segurar * 1000)
        );
      }

      animacoes.push(
        Animated.timing(escala, {
          toValue: 1,
          duration: expirar * 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
    } else if (posicao < inspirar + segurar) {
      animacoes.push(
        Animated.delay(
          (inspirar + segurar - posicao) * 1000
        ),
        Animated.timing(escala, {
          toValue: 1,
          duration: expirar * 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
    } else {
      animacoes.push(
        Animated.timing(escala, {
          toValue: 1,
          duration: (ciclo - posicao) * 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
    }

    const animacao = Animated.sequence([
      ...animacoes,
      Animated.loop(
        Animated.sequence([
          Animated.timing(escala, {
            toValue: 1.2,
            duration: inspirar * 1000,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          ...(segurar > 0
            ? [Animated.delay(segurar * 1000)]
            : []),
          Animated.timing(escala, {
            toValue: 1,
            duration: expirar * 1000,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ])
      ),
    ]);

    animacaoRef.current = animacao;
    animacao.start();

    return () => {
      animacao.stop();
      animacaoRef.current = null;
    };
  }, [ativo, exercicioSelecionado, escala]);

  useEffect(() => {
    const assinatura = AppState.addEventListener(
      'change',
      estado => {
        if (estado !== 'active') {
          setAtivo(false);
        }
      }
    );

    return () => assinatura.remove();
  }, []);

  function iniciar() {
    if (
      concluido ||
      tempoRestanteRef.current === 0
    ) {
      tempoDecorridoRef.current = 0;
      tempoRestanteRef.current = duracaoRef.current;

      setTempoDecorrido(0);
      setTempoRestante(duracaoRef.current);
      setCiclos(0);
    }

    setConcluido(false);
    setAtivo(true);
  }

  function pausar() {
    if (inicioRef.current !== null) {
      const decorrido = Math.min(
        duracaoRef.current,
        Math.floor(
          (Date.now() - inicioRef.current) / 1000
        )
      );

      atualizarTempo(decorrido);
    }

    inicioRef.current = null;
    setAtivo(false);
  }

  function reiniciar() {
    setAtivo(false);
    inicioRef.current = null;
    pararAnimacao();

    tempoDecorridoRef.current = 0;
    tempoRestanteRef.current = duracaoRef.current;

    setTempoDecorrido(0);
    setTempoRestante(duracaoRef.current);
    setCiclos(0);
    setConcluido(false);
    escala.setValue(1);
  }

  function selecionarExercicio(exercicio: Exercicio) {
    setAtivo(false);
    inicioRef.current = null;
    pararAnimacao();

    setExercicioSelecionado(exercicio);

    tempoDecorridoRef.current = 0;
    tempoRestanteRef.current = duracaoRef.current;

    setTempoDecorrido(0);
    setTempoRestante(duracaoRef.current);
    setCiclos(0);
    setConcluido(false);
    escala.setValue(1);
  }

  function selecionarDuracao(segundos: number) {
    setAtivo(false);
    inicioRef.current = null;
    pararAnimacao();

    duracaoRef.current = segundos;
    tempoDecorridoRef.current = 0;
    tempoRestanteRef.current = segundos;

    setDuracao(segundos);
    setTempoDecorrido(0);
    setTempoRestante(segundos);
    setCiclos(0);
    setConcluido(false);
    escala.setValue(1);
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

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.conteudoCentral}>
          {/* CABEÇALHO SEM VOLTAR AO MEU ESPAÇO */}

          <Text
            style={[
              styles.etiqueta,
              estiloPrimario,
              { fontSize: fonte(11) },
            ]}
          >
            UM MOMENTO DE TRANQUILIDADE
          </Text>

          <Text
            style={[
              styles.titulo,
              estiloTexto,
              { fontSize: fonte(30) },
            ]}
          >
            Relaxamento 🦋
          </Text>

          <Text
            style={[
              styles.subtitulo,
              estiloSecundario,
              {
                fontSize: fonte(14),
                lineHeight: fonte(22),
              },
            ]}
          >
            Reserve alguns minutos para respirar,
            descansar e cuidar do seu bem-estar.
          </Text>

          {/* CARD PRINCIPAL */}

          <View
            style={[
              styles.cardPrincipal,
              {
                backgroundColor: cores.primario,
                borderRadius: raioCartao,
              },
            ]}
          >
            <Text
              style={[
                styles.cardPrincipalEtiqueta,
                estiloTextoBotao,
                { fontSize: fonte(11) },
              ]}
            >
              ✨ SEU MOMENTO DE PAUSA
            </Text>

            <Text
              style={[
                styles.cardPrincipalTitulo,
                estiloTextoBotao,
                {
                  fontSize: fonte(24),
                  lineHeight: fonte(31),
                },
              ]}
            >
              Desacelere um pouquinho, {nome}.
            </Text>

            <Text
              style={[
                styles.cardPrincipalDescricao,
                estiloTextoBotao,
                {
                  fontSize: fonte(14),
                  lineHeight: fonte(22),
                },
              ]}
            >
              Escolha um exercício confortável e
              acompanhe o ritmo da respiração. Você
              pode parar a qualquer momento.
            </Text>

            <Text
              style={[
                styles.florDecorativa,
                {
                  color: cores.textoBotao,
                  opacity: 0.1,
                },
              ]}
            >
              ✿
            </Text>
          </View>

          {/* EXERCÍCIOS */}

          <View style={styles.secao}>
            <Text
              style={[
                styles.secaoEtiqueta,
                estiloPrimario,
                { fontSize: fonte(11) },
              ]}
            >
              ESCOLHA SEU MOMENTO
            </Text>

            <Text
              style={[
                styles.secaoTitulo,
                estiloTexto,
                { fontSize: fonte(21) },
              ]}
            >
              Exercícios de respiração
            </Text>

            <Text
              style={[
                styles.secaoDescricao,
                estiloSecundario,
                {
                  fontSize: fonte(14),
                  lineHeight: fonte(21),
                },
              ]}
            >
              Selecione o exercício que combina
              com o que você precisa agora.
            </Text>

            {exercicios.map(exercicio => {
              const selecionado =
                exercicioSelecionado.id === exercicio.id;

              return (
                <TouchableOpacity
                  key={exercicio.id}
                  style={[
                    styles.exercicioCard,
                    estiloCard,
                    selecionado && {
                      backgroundColor: cores.suave,
                      borderColor: cores.primario,
                      borderWidth: 2,
                    },
                  ]}
                  onPress={() =>
                    selecionarExercicio(exercicio)
                  }
                  activeOpacity={0.85}
                >
                  <View
                    style={[
                      styles.exercicioIcone,
                      {
                        backgroundColor: cores.suave,
                        borderRadius: raioMenor,
                      },
                    ]}
                  >
                    <Text style={styles.exercicioEmoji}>
                      {exercicio.emoji}
                    </Text>
                  </View>

                  <View style={styles.exercicioInfo}>
                    {exercicio.id === recomendado && (
                      <Text
                        style={[
                          styles.recomendado,
                          estiloPrimario,
                          { fontSize: fonte(10) },
                        ]}
                      >
                        ✨ SUGESTÃO PARA VOCÊ
                      </Text>
                    )}

                    <Text
                      style={[
                        styles.exercicioNome,
                        estiloTexto,
                        { fontSize: fonte(15) },
                      ]}
                    >
                      {exercicio.nome}
                    </Text>

                    <Text
                      style={[
                        styles.exercicioDescricao,
                        estiloSecundario,
                        {
                          fontSize: fonte(12),
                          lineHeight: fonte(19),
                        },
                      ]}
                    >
                      {exercicio.descricao}
                    </Text>

                    <Text
                      style={[
                        styles.exercicioRitmo,
                        estiloPrimario,
                        { fontSize: fonte(11) },
                      ]}
                    >
                      {exercicio.inspirar}s inspirar
                      {exercicio.segurar > 0
                        ? ` • ${exercicio.segurar}s pausa`
                        : ''}
                      {` • ${exercicio.expirar}s expirar`}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.seletor,
                      {
                        borderColor: cores.primario,
                      },
                      selecionado && {
                        backgroundColor: cores.primario,
                      },
                    ]}
                  >
                    {selecionado && (
                      <Text
                        style={[
                          styles.seletorTexto,
                          estiloTextoBotao,
                        ]}
                      >
                        ✓
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* DURAÇÕES */}

          <View style={styles.secao}>
            <Text
              style={[
                styles.secaoEtiqueta,
                estiloPrimario,
                { fontSize: fonte(11) },
              ]}
            >
              TEMPO PARA VOCÊ
            </Text>

            <Text
              style={[
                styles.secaoTitulo,
                estiloTexto,
                { fontSize: fonte(21) },
              ]}
            >
              Quanto tempo deseja relaxar?
            </Text>

            <View style={styles.duracoesLinha}>
              {DURACOES.map(segundos => {
                const selecionado = duracao === segundos;

                return (
                  <TouchableOpacity
                    key={segundos}
                    style={[
                      styles.duracaoBotao,
                      {
                        backgroundColor: selecionado
                          ? cores.primario
                          : cores.suave,
                        borderColor: selecionado
                          ? cores.primario
                          : cores.borda,
                        borderRadius: raioMenor,
                      },
                    ]}
                    onPress={() =>
                      selecionarDuracao(segundos)
                    }
                  >
                    <Text
                      style={[
                        styles.duracaoTexto,
                        {
                          color: selecionado
                            ? cores.textoBotao
                            : cores.primario,
                          fontSize: fonte(14),
                        },
                      ]}
                    >
                      {segundos / 60} min
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* RESPIRAÇÃO GUIADA */}

          <View
            style={[
              styles.respiracaoCard,
              estiloCard,
            ]}
          >
            <Text
              style={[
                styles.respiracaoEtiqueta,
                estiloPrimario,
                { fontSize: fonte(11) },
              ]}
            >
              SUA PAUSA GUIADA
            </Text>

            <Text
              style={[
                styles.respiracaoTitulo,
                estiloTexto,
                { fontSize: fonte(20) },
              ]}
            >
              {exercicioSelecionado.nome}
            </Text>

            <Text
              style={[
                styles.respiracaoDescricao,
                estiloSecundario,
                {
                  fontSize: fonte(14),
                  lineHeight: fonte(21),
                },
              ]}
            >
              Acompanhe o círculo e respire
              de forma confortável.
            </Text>

            <View style={styles.areaCirculo}>
              <Animated.View
                style={[
                  styles.circuloAnimado,
                  {
                    backgroundColor: cores.suave,
                    borderColor: cores.borda,
                    transform: [{ scale: escala }],
                  },
                ]}
              >
                <View style={styles.circuloInterno}>
                  <Text style={styles.circuloEmoji}>
                    {exercicioSelecionado.emoji}
                  </Text>

                  <Text
                    style={[
                      styles.circuloTexto,
                      estiloPrimario,
                      { fontSize: fonte(17) },
                    ]}
                  >
                    {ativo
                      ? faseAtual === 'inspirar'
                        ? 'Inspire'
                        : faseAtual === 'segurar'
                        ? 'Pausa'
                        : 'Expire'
                      : 'Sua pausa'}
                  </Text>
                </View>
              </Animated.View>
            </View>

            <Text
              style={[
                styles.faseTexto,
                estiloPrimario,
                { fontSize: fonte(21) },
              ]}
            >
              {faseExibida}
            </Text>

            <Text
              style={[
                styles.instrucaoTexto,
                estiloSecundario,
                {
                  fontSize: fonte(13),
                  lineHeight: fonte(20),
                },
              ]}
            >
              {ativo
                ? `Próxima fase em ${segundosFase} segundo(s). Respire sem forçar.`
                : 'Toque em iniciar quando estiver pronta(o).'}
            </Text>

            {/* CRONÔMETRO */}

            <View
              style={[
                styles.tempoCard,
                estiloSuave,
              ]}
            >
              <Text
                style={[
                  styles.tempoEtiqueta,
                  estiloPrimario,
                  { fontSize: fonte(11) },
                ]}
              >
                TEMPO RESTANTE
              </Text>

              <Text
                style={[
                  styles.tempoNumero,
                  estiloTexto,
                  { fontSize: fonte(40) },
                ]}
              >
                {formatarTempo(tempoRestante)}
              </Text>

              <Text
                style={[
                  styles.ciclosTexto,
                  estiloSecundario,
                  { fontSize: fonte(13) },
                ]}
              >
                {ciclos} ciclos completos
              </Text>
            </View>

            {/* PROGRESSO */}

            <View
              style={[
                styles.barraFundo,
                {
                  backgroundColor: cores.suave,
                },
              ]}
            >
              <View
                style={[
                  styles.barraPreenchida,
                  {
                    width: `${Math.min(
                      100,
                      Math.max(0, progresso)
                    )}%` as `${number}%`,
                    backgroundColor: cores.primario,
                  },
                ]}
              />
            </View>

            {/* BOTÕES */}

            <View style={styles.botoesLinha}>
              <TouchableOpacity
                style={[
                  styles.botaoPrincipal,
                  {
                    backgroundColor: cores.primario,
                    borderRadius: raioMenor,
                  },
                ]}
                onPress={ativo ? pausar : iniciar}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.botaoPrincipalTexto,
                    estiloTextoBotao,
                    { fontSize: fonte(13) },
                  ]}
                >
                  {ativo
                    ? '⏸ Pausar'
                    : concluido
                    ? '↻ Recomeçar'
                    : tempoRestante < duracao
                    ? '▶ Continuar'
                    : '▶ Iniciar'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.botaoSecundario,
                  {
                    backgroundColor: cores.suave,
                    borderRadius: raioMenor,
                  },
                ]}
                onPress={reiniciar}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.botaoSecundarioTexto,
                    estiloPrimario,
                    { fontSize: fonte(13) },
                  ]}
                >
                  ↻ Reiniciar
                </Text>
              </TouchableOpacity>
            </View>

            {/* CONCLUSÃO */}

            {concluido && (
              <View
                style={[
                  styles.concluidoCard,
                  estiloSuave,
                ]}
              >
                <Text style={styles.concluidoEmoji}>
                  ✨
                </Text>

                <Text
                  style={[
                    styles.concluidoTitulo,
                    estiloTexto,
                    { fontSize: fonte(17) },
                  ]}
                >
                  Momento concluído!
                </Text>

                <Text
                  style={[
                    styles.concluidoDescricao,
                    estiloSecundario,
                    {
                      fontSize: fonte(14),
                      lineHeight: fonte(21),
                    },
                  ]}
                >
                  Você reservou um tempinho para
                  cuidar de si. Valorize essa pausa!
                </Text>
              </View>
            )}
          </View>

          {/* OUTRAS TÉCNICAS */}

          <View style={styles.secao}>
            <Text
              style={[
                styles.secaoEtiqueta,
                estiloPrimario,
                { fontSize: fonte(11) },
              ]}
            >
              OUTRAS FORMAS DE RELAXAR
            </Text>

            <Text
              style={[
                styles.secaoTitulo,
                estiloTexto,
                { fontSize: fonte(21) },
              ]}
            >
              Técnicas para diferentes momentos
            </Text>

            <Text
              style={[
                styles.secaoDescricao,
                estiloSecundario,
                {
                  fontSize: fonte(14),
                  lineHeight: fonte(21),
                },
              ]}
            >
              Toque em uma técnica para descobrir
              como praticá-la.
            </Text>

            {tecnicas.map(tecnica => {
              const aberta =
                tecnicaAberta === tecnica.id;

              return (
                <View
                  key={tecnica.id}
                  style={[
                    styles.tecnicaCard,
                    estiloCard,
                  ]}
                >
                  <TouchableOpacity
                    style={styles.tecnicaCabecalho}
                    onPress={() =>
                      setTecnicaAberta(
                        aberta ? null : tecnica.id
                      )
                    }
                  >
                    <View
                      style={[
                        styles.tecnicaIcone,
                        {
                          backgroundColor: cores.suave,
                          borderRadius: raioMenor,
                        },
                      ]}
                    >
                      <Text style={styles.tecnicaEmoji}>
                        {tecnica.emoji}
                      </Text>
                    </View>

                    <View style={styles.tecnicaInfo}>
                      <Text
                        style={[
                          styles.tecnicaTitulo,
                          estiloTexto,
                          { fontSize: fonte(15) },
                        ]}
                      >
                        {tecnica.titulo}
                      </Text>

                      <Text
                        style={[
                          styles.tecnicaDescricao,
                          estiloSecundario,
                          {
                            fontSize: fonte(13),
                            lineHeight: fonte(20),
                          },
                        ]}
                      >
                        {tecnica.descricao}
                      </Text>
                    </View>

                    <Text
                      style={[
                        styles.tecnicaSeta,
                        estiloPrimario,
                      ]}
                    >
                      {aberta ? '⌃' : '⌄'}
                    </Text>
                  </TouchableOpacity>

                  {aberta && (
                    <View
                      style={[
                        styles.tecnicaPassos,
                        {
                          backgroundColor: cores.suave,
                          borderTopColor: cores.borda,
                        },
                      ]}
                    >
                      {tecnica.passos.map(
                        (passo, indice) => (
                          <View
                            key={indice}
                            style={styles.passoLinha}
                          >
                            <View
                              style={[
                                styles.passoNumero,
                                {
                                  backgroundColor:
                                    cores.primario,
                                },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.passoNumeroTexto,
                                  estiloTextoBotao,
                                  { fontSize: fonte(12) },
                                ]}
                              >
                                {indice + 1}
                              </Text>
                            </View>

                            <Text
                              style={[
                                styles.passoTexto,
                                estiloTexto,
                                {
                                  fontSize: fonte(13),
                                  lineHeight: fonte(21),
                                },
                              ]}
                            >
                              {passo}
                            </Text>
                          </View>
                        )
                      )}
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          {/* ORIENTAÇÕES */}

          <View style={styles.secao}>
            <Text
              style={[
                styles.secaoEtiqueta,
                estiloPrimario,
                { fontSize: fonte(11) },
              ]}
            >
              RESPIRE COM CONFORTO
            </Text>

            <Text
              style={[
                styles.secaoTitulo,
                estiloTexto,
                { fontSize: fonte(21) },
              ]}
            >
              Como aproveitar sua pausa
            </Text>

            {orientacoes.map(orientacao => (
              <View
                key={orientacao.titulo}
                style={[
                  styles.orientacaoCard,
                  estiloCard,
                ]}
              >
                <Text style={styles.orientacaoEmoji}>
                  {orientacao.emoji}
                </Text>

                <View style={styles.orientacaoInfo}>
                  <Text
                    style={[
                      styles.orientacaoTitulo,
                      estiloTexto,
                      { fontSize: fonte(15) },
                    ]}
                  >
                    {orientacao.titulo}
                  </Text>

                  <Text
                    style={[
                      styles.orientacaoDescricao,
                      estiloSecundario,
                      {
                        fontSize: fonte(13),
                        lineHeight: fonte(20),
                      },
                    ]}
                  >
                    {orientacao.descricao}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* MENSAGEM FINAL */}

          <View
            style={[
              styles.mensagemFinal,
              estiloSuave,
            ]}
          >
            <Text style={styles.mensagemEmoji}>
              💗
            </Text>

            <Text
              style={[
                styles.mensagemTexto,
                estiloTexto,
                {
                  fontSize: fonte(14),
                  lineHeight: fonte(22),
                },
              ]}
            >
              Descansar também é uma forma de cuidar
              de você. Não é necessário fazer tudo
              de uma vez.
            </Text>
          </View>

          <Text
            style={[
              styles.rodape,
              estiloSecundario,
              { fontSize: fonte(11) },
            ]}
          >
            MEUAUTOCUIDADO • SEU BEM-ESTAR IMPORTA
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 50,
    alignItems: 'center',
  },
  conteudoCentral: {
    width: '100%',
    maxWidth: 900,
  },
  etiqueta: {
    fontWeight: '800',
    letterSpacing: 1.1,
    marginBottom: 8,
  },
  titulo: {
    fontWeight: '800',
  },
  subtitulo: {
    marginTop: 9,
    marginBottom: 23,
  },
  cardPrincipal: {
    padding: 23,
    marginBottom: 30,
    overflow: 'hidden',
  },
  cardPrincipalEtiqueta: {
    fontWeight: '800',
    marginBottom: 13,
  },
  cardPrincipalTitulo: {
    fontWeight: '800',
    maxWidth: '90%',
  },
  cardPrincipalDescricao: {
    marginTop: 11,
    maxWidth: '94%',
  },
  florDecorativa: {
    position: 'absolute',
    right: -5,
    bottom: -35,
    fontSize: 115,
  },
  secao: {
    marginBottom: 30,
  },
  secaoEtiqueta: {
    fontWeight: '800',
    letterSpacing: 0.9,
    marginBottom: 8,
  },
  secaoTitulo: {
    fontWeight: '800',
  },
  secaoDescricao: {
    marginTop: 9,
    marginBottom: 17,
  },
  exercicioCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    marginBottom: 12,
  },
  exercicioIcone: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  exercicioEmoji: {
    fontSize: 25,
  },
  exercicioInfo: {
    flex: 1,
  },
  recomendado: {
    fontWeight: '800',
    marginBottom: 5,
  },
  exercicioNome: {
    fontWeight: '800',
  },
  exercicioDescricao: {
    marginTop: 5,
  },
  exercicioRitmo: {
    fontWeight: '700',
    marginTop: 8,
  },
  seletor: {
    width: 23,
    height: 23,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 9,
  },
  seletorTexto: {
    fontSize: 12,
    fontWeight: '800',
  },
  duracoesLinha: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  duracaoBotao: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 2,
  },
  duracaoTexto: {
    fontWeight: '800',
  },
  respiracaoCard: {
    padding: 20,
    borderWidth: 1,
    marginBottom: 30,
    alignItems: 'center',
  },
  respiracaoEtiqueta: {
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 9,
  },
  respiracaoTitulo: {
    fontWeight: '800',
    textAlign: 'center',
  },
  respiracaoDescricao: {
    textAlign: 'center',
    marginTop: 8,
  },
  areaCirculo: {
    height: 245,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  circuloAnimado: {
    width: 165,
    height: 165,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 10,
  },
  circuloInterno: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circuloEmoji: {
    fontSize: 39,
    marginBottom: 8,
  },
  circuloTexto: {
    fontWeight: '800',
  },
  faseTexto: {
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 5,
  },
  instrucaoTexto: {
    textAlign: 'center',
    marginTop: 9,
  },
  tempoCard: {
    width: '100%',
    padding: 19,
    alignItems: 'center',
    marginTop: 24,
    borderWidth: 1,
  },
  tempoEtiqueta: {
    fontWeight: '800',
    letterSpacing: 0.7,
  },
  tempoNumero: {
    fontWeight: '800',
    marginTop: 8,
  },
  ciclosTexto: {
    marginTop: 6,
  },
  barraFundo: {
    width: '100%',
    height: 10,
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 21,
  },
  barraPreenchida: {
    height: '100%',
    borderRadius: 10,
  },
  botoesLinha: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 21,
    width: '100%',
  },
  botaoPrincipal: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoPrincipalTexto: {
    fontWeight: '800',
    textAlign: 'center',
  },
  botaoSecundario: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoSecundarioTexto: {
    fontWeight: '800',
    textAlign: 'center',
  },
  concluidoCard: {
    padding: 18,
    alignItems: 'center',
    width: '100%',
    marginTop: 21,
    borderWidth: 1,
  },
  concluidoEmoji: {
    fontSize: 30,
    marginBottom: 8,
  },
  concluidoTitulo: {
    fontWeight: '800',
  },
  concluidoDescricao: {
    textAlign: 'center',
    marginTop: 8,
  },
  tecnicaCard: {
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  tecnicaCabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  tecnicaIcone: {
    width: 49,
    height: 49,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  tecnicaEmoji: {
    fontSize: 25,
  },
  tecnicaInfo: {
    flex: 1,
  },
  tecnicaTitulo: {
    fontWeight: '800',
  },
  tecnicaDescricao: {
    marginTop: 6,
  },
  tecnicaSeta: {
    fontSize: 24,
    marginLeft: 8,
  },
  tecnicaPassos: {
    borderTopWidth: 1,
    padding: 16,
  },
  passoLinha: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  passoNumero: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },
  passoNumeroTexto: {
    fontWeight: '800',
  },
  passoTexto: {
    flex: 1,
  },
  orientacaoCard: {
    flexDirection: 'row',
    padding: 16,
    borderWidth: 1,
    marginTop: 11,
  },
  orientacaoEmoji: {
    fontSize: 26,
    marginRight: 13,
  },
  orientacaoInfo: {
    flex: 1,
  },
  orientacaoTitulo: {
    fontWeight: '800',
  },
  orientacaoDescricao: {
    marginTop: 7,
  },
  mensagemFinal: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderWidth: 1,
  },
  mensagemEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  mensagemTexto: {
    flex: 1,
  },
  rodape: {
    fontWeight: '800',
    letterSpacing: 0.8,
    textAlign: 'center',
    marginTop: 27,
  },
});
