
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { router } from 'expo-router';
import { useAutocuidado } from './AutocuidadoContext';

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril',
  'Maio', 'Junho', 'Julho', 'Agosto',
  'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const DIAS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

const ICONES: Record<string, string> = {
  Sono: '🌙',
  Hidratação: '💧',
  Movimento: '🧘',
  Relaxamento: '🦋',
  Autoestima: '💗',
  Organização: '📝',
  Alimentação: '🍓',
  'Cuidados pessoais': '🧴',
  'Bem-estar': '🌷',
  Descanso: '🌿',
  Lazer: '📚',
  Disposição: '☀️',
};

function dataLocal(data: Date) {
  return [
    data.getFullYear(),
    String(data.getMonth() + 1).padStart(2, '0'),
    String(data.getDate()).padStart(2, '0'),
  ].join('-');
}

function formatarData(data: string) {
  const [ano, mes, dia] = data.split('-');
  return `${dia}/${mes}/${ano}`;
}

export default function Evolucao() {
  const {
    usuario,
    atividades,
    concluidas,
    progresso,
    respostas,
    historicoProgresso,
    sequenciaDias,
    conquistas,
    estatisticas,
    preferencias,
    cores,
    raioCartao,
    escalaFonte,
  } = useAutocuidado();

  const { width } = useWindowDimensions();
  const compacto = width < 390;

  const escuro =
    preferencias.modoNoturno ||
    preferencias.tema === 'noite';

  const fonte = (n: number) =>
    Math.round(n * escalaFonte);

  const raioMenor = Math.max(6, raioCartao - 8);

  const card = {
    backgroundColor: cores.card,
    borderColor: cores.borda,
    borderRadius: raioCartao,
  };

  const cardSuave = {
    backgroundColor: cores.suave,
    borderColor: cores.borda,
    borderRadius: raioCartao,
  };

  const texto = { color: cores.texto };
  const secundario = { color: cores.secundario };
  const primario = { color: cores.primario };

  const [mesVisivel, setMesVisivel] = useState(() => {
    const hoje = new Date();
    return new Date(
      hoje.getFullYear(),
      hoje.getMonth(),
      1
    );
  });

  const [diaSelecionado, setDiaSelecionado] = useState(
    dataLocal(new Date())
  );

  const hojeChave = dataLocal(new Date());
  const total = atividades.length;
  const pendentes = Math.max(0, total - concluidas);

  const porcentagem = Math.max(
    0,
    Math.min(100, progresso)
  );

  const nome =
    usuario?.nome?.trim().split(' ')[0] || 'você';

  const registrosPorData = useMemo(() => {
    return new Map(
      historicoProgresso.map(item => [
        item.data,
        item,
      ])
    );
  }, [historicoProgresso]);

  const calendario = useMemo(() => {
    const ano = mesVisivel.getFullYear();
    const mes = mesVisivel.getMonth();
    const primeiroDia = new Date(ano, mes, 1).getDay();
    const quantidade = new Date(
      ano,
      mes + 1,
      0
    ).getDate();

    const celulas: Array<{
      numero: number;
      chave: string;
    } | null> = [];

    for (let i = 0; i < primeiroDia; i++) {
      celulas.push(null);
    }

    for (let dia = 1; dia <= quantidade; dia++) {
      celulas.push({
        numero: dia,
        chave: dataLocal(new Date(ano, mes, dia)),
      });
    }

    while (celulas.length % 7 !== 0) {
      celulas.push(null);
    }

    return celulas;
  }, [mesVisivel]);

  const registroSelecionado =
    registrosPorData.get(diaSelecionado);

  const diasSemana = useMemo(() => {
    const hoje = new Date();

    return Array.from({ length: 7 }, (_, indice) => {
      const data = new Date(
        hoje.getFullYear(),
        hoje.getMonth(),
        hoje.getDate() - (6 - indice)
      );

      const chave = dataLocal(data);
      const registro = registrosPorData.get(chave);

      return {
        chave,
        nome: [
          'Dom', 'Seg', 'Ter', 'Qua',
          'Qui', 'Sex', 'Sáb',
        ][data.getDay()],
        numero: data.getDate(),
        porcentagem: registro?.progresso ?? 0,
        registrado: !!registro,
      };
    });
  }, [registrosPorData]);

  const dadosCategorias = useMemo(() => {
    const categorias = Array.from(
      new Set(
        atividades.map(
          atividade =>
            atividade.categoria || 'Bem-estar'
        )
      )
    );

    return categorias.map(categoria => {
      const lista = atividades.filter(
        atividade =>
          (atividade.categoria || 'Bem-estar') ===
          categoria
      );

      const feitas = lista.filter(
        atividade => atividade.concluida
      ).length;

      return {
        nome: categoria,
        total: lista.length,
        feitas,
        porcentagem: lista.length
          ? Math.round((feitas / lista.length) * 100)
          : 0,
      };
    });
  }, [atividades]);

  const conquistasDesbloqueadas =
    conquistas.filter(
      conquista => conquista.desbloqueada
    ).length;

  function mudarMes(diferenca: number) {
    setMesVisivel(anterior =>
      new Date(
        anterior.getFullYear(),
        anterior.getMonth() + diferenca,
        1
      )
    );
  }

  const tituloMes = `${
    MESES[mesVisivel.getMonth()]
  } ${mesVisivel.getFullYear()}`;

  const mensagem =
    total === 0
      ? 'Sua jornada começa com pequenos cuidados.'
      : porcentagem === 100
      ? 'Você concluiu todos os cuidados de hoje!'
      : porcentagem >= 70
      ? 'Você já realizou boa parte dos seus cuidados.'
      : porcentagem >= 30
      ? 'Cada atividade concluída representa um avanço.'
      : 'Comece com uma atividade simples, no seu ritmo.';

  const tituloSecao = {
    color: cores.texto,
    fontSize: fonte(23),
    lineHeight: fonte(23) + 8,
  };

  const descricaoSecao = {
    color: cores.secundario,
    fontSize: fonte(15),
    lineHeight: fonte(15) + 8,
  };

  const etiqueta = {
    color: cores.primario,
    fontSize: fonte(11),
  };

  const textoBotao = {
    color: cores.textoBotao,
  };

  const fundoDestaque = {
    backgroundColor: cores.primario,
    borderRadius: raioCartao,
  };

  const botaoPrincipal = {
    backgroundColor: cores.primario,
    borderRadius: raioMenor,
  };

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

          {/* CABEÇALHO */}

          <View style={styles.cabecalho}>
            <Text style={[styles.etiqueta, etiqueta]}>
              SUA JORNADA DE AUTOCUIDADO
            </Text>

            <Text
              style={[
                styles.titulo,
                texto,
                {
                  fontSize: fonte(30),
                  lineHeight: fonte(30) + 9,
                },
              ]}
            >
              Minha Evolução 📊
            </Text>

            <Text
              style={[
                styles.subtitulo,
                descricaoSecao,
              ]}
            >
              Acompanhe seus cuidados, veja seus
              resultados e celebre cada conquista.
            </Text>
          </View>

          {/* PROGRESSO DO DIA */}

          <View
            style={[
              styles.cardPrincipal,
              fundoDestaque,
            ]}
          >
            <Text
              style={[
                styles.principalEtiqueta,
                textoBotao,
                { fontSize: fonte(12) },
              ]}
            >
              ✨ SEU PROGRESSO DE HOJE
            </Text>

            <Text
              style={[
                styles.principalTitulo,
                textoBotao,
                {
                  fontSize: fonte(23),
                  lineHeight: fonte(23) + 9,
                },
              ]}
            >
              Cada pequeno passo importa, {nome}.
            </Text>

            <Text
              style={[
                styles.principalDescricao,
                textoBotao,
                {
                  fontSize: fonte(15),
                  lineHeight: fonte(15) + 8,
                },
              ]}
            >
              Seu progresso acompanha as atividades
              da sua rotina personalizada.
            </Text>

            <View style={styles.circuloContainer}>
              <View
                style={[
                  styles.circulo,
                  {
                    borderColor: cores.textoBotao,
                    backgroundColor: cores.primario,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.numeroProgresso,
                    textoBotao,
                    { fontSize: fonte(39) },
                  ]}
                >
                  {porcentagem}%
                </Text>

                <Text
                  style={[
                    styles.legendaProgresso,
                    textoBotao,
                    { fontSize: fonte(14) },
                  ]}
                >
                  concluído
                </Text>
              </View>
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
                    width: `${porcentagem}%`,
                    backgroundColor: cores.textoBotao,
                  },
                ]}
              />
            </View>

            <Text
              style={[
                styles.progressoDetalhe,
                textoBotao,
                { fontSize: fonte(14) },
              ]}
            >
              {concluidas} de {total} atividades concluídas
            </Text>
          </View>

          {/* RESUMO */}

          <Text
            style={[
              styles.secaoTitulo,
              tituloSecao,
            ]}
          >
            Sua rotina em números
          </Text>

          <Text
            style={[
              styles.secaoDescricao,
              descricaoSecao,
            ]}
          >
            Um resumo dos cuidados de hoje.
          </Text>

          <View style={styles.gradeEstatisticas}>
            {[
              {
                emoji: '✓',
                valor: concluidas,
                legenda: 'Concluídas',
              },
              {
                emoji: '♡',
                valor: pendentes,
                legenda: 'Pendentes',
              },
              {
                emoji: '✦',
                valor: total,
                legenda: 'Cuidados',
              },
            ].map(item => (
              <View
                key={item.legenda}
                style={[
                  styles.estatisticaCard,
                  cardSuave,
                ]}
              >
                <Text
                  style={[
                    styles.estatisticaEmoji,
                    primario,
                  ]}
                >
                  {item.emoji}
                </Text>

                <Text
                  style={[
                    styles.estatisticaNumero,
                    texto,
                    { fontSize: fonte(25) },
                  ]}
                >
                  {item.valor}
                </Text>

                <Text
                  style={[
                    styles.estatisticaLegenda,
                    secundario,
                    { fontSize: fonte(11) },
                  ]}
                >
                  {item.legenda}
                </Text>
              </View>
            ))}
          </View>

          <View
            style={[
              styles.mensagemCard,
              cardSuave,
            ]}
          >
            <Text style={styles.mensagemEmoji}>
              {porcentagem === 100 && total > 0
                ? '🏆'
                : '🌷'}
            </Text>

            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.mensagemTitulo,
                  texto,
                  { fontSize: fonte(17) },
                ]}
              >
                {porcentagem === 100 && total > 0
                  ? 'Parabéns pela conquista!'
                  : 'Continue no seu ritmo'}
              </Text>

              <Text
                style={[
                  styles.mensagemDescricao,
                  secundario,
                  {
                    fontSize: fonte(14),
                    lineHeight: fonte(14) + 7,
                  },
                ]}
              >
                {mensagem}
              </Text>
            </View>
          </View>

          {/* CALENDÁRIO */}

          <View style={styles.secao}>
            <Text
              style={[
                styles.etiqueta,
                etiqueta,
              ]}
            >
              ACOMPANHAMENTO MENSAL
            </Text>

            <Text
              style={[
                styles.secaoTitulo,
                tituloSecao,
              ]}
            >
              Meu calendário 🗓️
            </Text>

            <Text
              style={[
                styles.secaoDescricao,
                descricaoSecao,
              ]}
            >
              Veja os dias em que você praticou
              autocuidado. Toque em uma data para
              consultar o resultado.
            </Text>

            <View style={[styles.card, card]}>
              <View style={styles.calendarioCabecalho}>
                <TouchableOpacity
                  style={[
                    styles.mesBotao,
                    {
                      backgroundColor: cores.suave,
                      borderRadius: raioMenor,
                    },
                  ]}
                  onPress={() => mudarMes(-1)}
                  accessibilityLabel="Mês anterior"
                >
                  <Text
                    style={[
                      styles.mesSeta,
                      primario,
                    ]}
                  >
                    ‹
                  </Text>
                </TouchableOpacity>

                <Text
                  style={[
                    styles.mesTitulo,
                    texto,
                    { fontSize: fonte(17) },
                  ]}
                >
                  {tituloMes}
                </Text>

                <TouchableOpacity
                  style={[
                    styles.mesBotao,
                    {
                      backgroundColor: cores.suave,
                      borderRadius: raioMenor,
                    },
                  ]}
                  onPress={() => mudarMes(1)}
                  accessibilityLabel="Próximo mês"
                >
                  <Text
                    style={[
                      styles.mesSeta,
                      primario,
                    ]}
                  >
                    ›
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.calendarioGrade}>
                {DIAS.map((dia, indice) => (
                  <View
                    key={`semana-${indice}`}
                    style={styles.calendarioCelula}
                  >
                    <Text
                      style={[
                        styles.calendarioDiaNome,
                        secundario,
                        { fontSize: fonte(12) },
                      ]}
                    >
                      {dia}
                    </Text>
                  </View>
                ))}

                {calendario.map((item, indice) => {
                  if (!item) {
                    return (
                      <View
                        key={`vazio-${indice}`}
                        style={styles.calendarioCelula}
                      />
                    );
                  }

                  const registro =
                    registrosPorData.get(item.chave);

                  const ativo =
                    !!registro &&
                    registro.concluidas > 0;

                  const completo =
                    !!registro &&
                    registro.total > 0 &&
                    registro.concluidas === registro.total;

                  const selecionado =
                    diaSelecionado === item.chave;

                  const futuro =
                    item.chave > hojeChave;

                  return (
                    <View
                      key={item.chave}
                      style={styles.calendarioCelula}
                    >
                      <TouchableOpacity
                        onPress={() =>
                          setDiaSelecionado(item.chave)
                        }
                        style={[
                          styles.calendarioDiaBotao,
                          {
                            borderRadius: raioMenor,
                            backgroundColor: selecionado
                              ? cores.primario
                              : completo
                              ? cores.primario
                              : ativo
                              ? cores.suave
                              : cores.card,
                            borderWidth:
                              item.chave === hojeChave
                                ? 2
                                : 1,
                            borderColor:
                              item.chave === hojeChave
                                ? cores.primario
                                : cores.borda,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.calendarioDiaNumero,
                            {
                              color:
                                selecionado || completo
                                  ? cores.textoBotao
                                  : futuro
                                  ? cores.secundario
                                  : cores.texto,
                              fontSize: fonte(
                                compacto ? 12 : 14
                              ),
                            },
                          ]}
                        >
                          {item.numero}
                        </Text>

                        {ativo && (
                          <View
                            style={[
                              styles.calendarioPonto,
                              {
                                backgroundColor:
                                  selecionado || completo
                                    ? cores.textoBotao
                                    : cores.primario,
                              },
                            ]}
                          />
                        )}
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>

              <View style={styles.legendaCalendario}>
                <Text
                  style={[
                    styles.legendaTexto,
                    secundario,
                    { fontSize: fonte(12) },
                  ]}
                >
                  ● Dia completo
                </Text>

                <Text
                  style={[
                    styles.legendaTexto,
                    secundario,
                    { fontSize: fonte(12) },
                  ]}
                >
                  ◦ Com atividade
                </Text>
              </View>

              <View
                style={[
                  styles.detalheDia,
                  {
                    backgroundColor: cores.suave,
                    borderRadius: raioMenor,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.detalheTitulo,
                    texto,
                    { fontSize: fonte(16) },
                  ]}
                >
                  📅 {formatarData(diaSelecionado)}
                </Text>

                <Text
                  style={[
                    styles.detalheDescricao,
                    secundario,
                    {
                      fontSize: fonte(13),
                      lineHeight: fonte(13) + 7,
                    },
                  ]}
                >
                  {registroSelecionado
                    ? `${registroSelecionado.concluidas} de ${registroSelecionado.total} atividades realizadas (${registroSelecionado.progresso}%).`
                    : 'Nenhuma atividade registrada nessa data.'}
                </Text>
              </View>
            </View>
          </View>

          {/* GRÁFICO SEMANAL */}

          <View style={styles.secao}>
            <Text
              style={[
                styles.etiqueta,
                etiqueta,
              ]}
            >
              ACOMPANHAMENTO SEMANAL
            </Text>

            <Text
              style={[
                styles.secaoTitulo,
                tituloSecao,
              ]}
            >
              Últimos 7 dias 📈
            </Text>

            <Text
              style={[
                styles.secaoDescricao,
                descricaoSecao,
              ]}
            >
              Compare o progresso diário da última
              semana.
            </Text>

            <View style={[styles.card, card]}>
              <Text
                style={[
                  styles.cardTitulo,
                  texto,
                  { fontSize: fonte(18) },
                ]}
              >
                Sua evolução diária
              </Text>

              <Text
                style={[
                  styles.cardDescricao,
                  secundario,
                  { fontSize: fonte(13) },
                ]}
              >
                Porcentagem de cuidados realizados
              </Text>

              <View style={styles.graficoSemanal}>
                {diasSemana.map(dia => (
                  <View
                    key={dia.chave}
                    style={styles.diaColuna}
                  >
                    <Text
                      style={[
                        styles.diaPorcentagem,
                        texto,
                        {
                          fontSize: fonte(
                            compacto ? 9 : 11
                          ),
                        },
                      ]}
                    >
                      {dia.registrado
                        ? `${dia.porcentagem}%`
                        : '—'}
                    </Text>

                    <View
                      style={[
                        styles.diaTrilho,
                        {
                          backgroundColor: cores.suave,
                          borderRadius: raioMenor,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.diaBarra,
                          {
                            height: `${Math.max(
                              0,
                              Math.min(
                                100,
                                dia.porcentagem
                              )
                            )}%`,
                            backgroundColor:
                              cores.primario,
                            borderRadius: raioMenor,
                          },
                        ]}
                      />
                    </View>

                    <Text
                      style={[
                        styles.diaNome,
                        texto,
                        { fontSize: fonte(11) },
                      ]}
                    >
                      {dia.nome}
                    </Text>

                    <Text
                      style={[
                        styles.diaNumero,
                        secundario,
                        { fontSize: fonte(10) },
                      ]}
                    >
                      {dia.numero}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* ESTATÍSTICAS GERAIS */}

          <View style={styles.secao}>
            <Text
              style={[
                styles.etiqueta,
                etiqueta,
              ]}
            >
              SEUS RESULTADOS
            </Text>

            <Text
              style={[
                styles.secaoTitulo,
                tituloSecao,
              ]}
            >
              Minhas estatísticas ✨
            </Text>

            <Text
              style={[
                styles.secaoDescricao,
                descricaoSecao,
              ]}
            >
              Acompanhe seus resultados ao longo
              do tempo.
            </Text>

            <View style={styles.gradeResultados}>
              {[
                {
                  emoji: '🌷',
                  valor: estatisticas.diasAtivos,
                  nome: 'Dias ativos',
                },
                {
                  emoji: '🏆',
                  valor: estatisticas.diasCompletos,
                  nome: 'Dias completos',
                },
                {
                  emoji: '💜',
                  valor: estatisticas.atividadesRealizadas,
                  nome: 'Atividades realizadas',
                },
                {
                  emoji: '📅',
                  valor: estatisticas.atividadesSemana,
                  nome: 'Nesta semana',
                },
                {
                  emoji: '🌙',
                  valor: estatisticas.atividadesMes,
                  nome: 'Neste mês',
                },
                {
                  emoji: '📊',
                  valor: `${estatisticas.mediaProgresso}%`,
                  nome: 'Média registrada',
                },
              ].map(item => (
                <View
                  key={item.nome}
                  style={[
                    styles.resultadoCard,
                    card,
                  ]}
                >
                  <Text style={styles.resultadoEmoji}>
                    {item.emoji}
                  </Text>

                  <Text
                    style={[
                      styles.resultadoNumero,
                      texto,
                      { fontSize: fonte(27) },
                    ]}
                  >
                    {item.valor}
                  </Text>

                  <Text
                    style={[
                      styles.resultadoLegenda,
                      secundario,
                      { fontSize: fonte(13) },
                    ]}
                  >
                    {item.nome}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* SEQUÊNCIA */}

          <View style={styles.secao}>
            <Text
              style={[
                styles.etiqueta,
                etiqueta,
              ]}
            >
              CONSTÂNCIA E MOTIVAÇÃO
            </Text>

            <Text
              style={[
                styles.secaoTitulo,
                tituloSecao,
              ]}
            >
              Sua sequência 🔥
            </Text>

            <View
              style={[
                styles.sequenciaCard,
                fundoDestaque,
              ]}
            >
              <Text style={styles.sequenciaEmoji}>
                🔥
              </Text>

              <Text
                style={[
                  styles.sequenciaNumero,
                  textoBotao,
                  { fontSize: fonte(49) },
                ]}
              >
                {sequenciaDias}
              </Text>

              <Text
                style={[
                  styles.sequenciaLegenda,
                  textoBotao,
                  { fontSize: fonte(18) },
                ]}
              >
                {sequenciaDias === 1
                  ? 'dia na sequência atual'
                  : 'dias na sequência atual'}
              </Text>

              <Text
                style={[
                  styles.sequenciaDescricao,
                  textoBotao,
                  {
                    fontSize: fonte(14),
                    lineHeight: fonte(14) + 8,
                  },
                ]}
              >
                Sua maior sequência foi de{' '}
                {estatisticas.melhorSequencia}{' '}
                {estatisticas.melhorSequencia === 1
                  ? 'dia'
                  : 'dias'}.
                {'\n'}
                Um dia conta quando você conclui
                pelo menos uma atividade.
              </Text>
            </View>
          </View>

          {/* CONQUISTAS */}

          <View style={styles.secao}>
            <Text
              style={[
                styles.etiqueta,
                etiqueta,
              ]}
            >
              SUAS MEDALHAS
            </Text>

            <Text
              style={[
                styles.secaoTitulo,
                tituloSecao,
              ]}
            >
              Minhas conquistas 🏅
            </Text>

            <Text
              style={[
                styles.secaoDescricao,
                descricaoSecao,
              ]}
            >
              {conquistasDesbloqueadas} de{' '}
              {conquistas.length} conquistas
              desbloqueadas.
            </Text>

            {conquistas.map(conquista => (
              <View
                key={conquista.id}
                style={[
                  styles.conquistaCard,
                  {
                    backgroundColor:
                      conquista.desbloqueada
                        ? cores.suave
                        : cores.card,
                    borderColor: cores.borda,
                    borderRadius: raioCartao,
                  },
                ]}
              >
                <View
                  style={[
                    styles.conquistaIcone,
                    {
                      backgroundColor: cores.suave,
                      borderRadius: raioMenor,
                    },
                  ]}
                >
                  <Text style={styles.conquistaEmoji}>
                    {conquista.desbloqueada
                      ? conquista.emoji
                      : '🔒'}
                  </Text>
                </View>

                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.conquistaTitulo,
                      texto,
                      { fontSize: fonte(17) },
                    ]}
                  >
                    {conquista.titulo}
                  </Text>

                  <Text
                    style={[
                      styles.conquistaDescricao,
                      secundario,
                      {
                        fontSize: fonte(13),
                        lineHeight: fonte(13) + 7,
                      },
                    ]}
                  >
                    {conquista.descricao}
                  </Text>

                  <Text
                    style={[
                      styles.conquistaStatus,
                      conquista.desbloqueada
                        ? primario
                        : secundario,
                      { fontSize: fonte(12) },
                    ]}
                  >
                    {conquista.desbloqueada
                      ? '✓ Desbloqueada'
                      : 'Ainda não desbloqueada'}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* CATEGORIAS */}

          <View style={styles.secao}>
            <Text
              style={[
                styles.etiqueta,
                etiqueta,
              ]}
            >
              ACOMPANHAMENTO PERSONALIZADO
            </Text>

            <Text
              style={[
                styles.secaoTitulo,
                tituloSecao,
              ]}
            >
              Progresso por categoria
            </Text>

            <Text
              style={[
                styles.secaoDescricao,
                descricaoSecao,
              ]}
            >
              Veja os cuidados concluídos em cada
              categoria da sua rotina de hoje.
            </Text>

            {dadosCategorias.length === 0 ? (
              <View style={[styles.card, card]}>
                <Text
                  style={[
                    styles.vazioTexto,
                    secundario,
                    { fontSize: fonte(14) },
                  ]}
                >
                  🌷 Suas categorias aparecerão quando
                  sua rotina estiver disponível.
                </Text>
              </View>
            ) : (
              dadosCategorias.map(categoria => (
                <View
                  key={categoria.nome}
                  style={[
                    styles.categoriaCard,
                    card,
                  ]}
                >
                  <View style={styles.categoriaCabecalho}>
                    <View
                      style={[
                        styles.categoriaIcone,
                        {
                          backgroundColor: cores.suave,
                          borderRadius: raioMenor,
                        },
                      ]}
                    >
                      <Text
                        style={styles.categoriaEmoji}
                      >
                        {ICONES[categoria.nome] || '✨'}
                      </Text>
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.categoriaNome,
                          texto,
                          { fontSize: fonte(16) },
                        ]}
                      >
                        {categoria.nome}
                      </Text>

                      <Text
                        style={[
                          styles.categoriaQuantidade,
                          secundario,
                          { fontSize: fonte(12) },
                        ]}
                      >
                        {categoria.feitas} de{' '}
                        {categoria.total} atividades
                      </Text>
                    </View>

                    <Text
                      style={[
                        styles.categoriaPorcentagem,
                        primario,
                        { fontSize: fonte(16) },
                      ]}
                    >
                      {categoria.porcentagem}%
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.categoriaBarra,
                      {
                        backgroundColor: cores.suave,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.categoriaBarraPreenchida,
                        {
                          width:
                            `${categoria.porcentagem}%`,
                          backgroundColor:
                            cores.primario,
                        },
                      ]}
                    />
                  </View>
                </View>
              ))
            )}
          </View>

          {/* DISTRIBUIÇÃO */}

          <View style={styles.secao}>
            <Text
              style={[
                styles.etiqueta,
                etiqueta,
              ]}
            >
              VISUALIZE SUA ROTINA
            </Text>

            <Text
              style={[
                styles.secaoTitulo,
                tituloSecao,
              ]}
            >
              Distribuição das atividades
            </Text>

            <Text
              style={[
                styles.secaoDescricao,
                descricaoSecao,
              ]}
            >
              Compare os cuidados concluídos e
              pendentes.
            </Text>

            <View style={[styles.card, card]}>
              <View style={styles.distribuicaoArea}>
                {[
                  {
                    titulo: 'Concluídas',
                    valor: concluidas,
                    cor: cores.primario,
                  },
                  {
                    titulo: 'Pendentes',
                    valor: pendentes,
                    cor: cores.secundario,
                  },
                ].map(item => (
                  <View
                    key={item.titulo}
                    style={styles.distribuicaoColuna}
                  >
                    <Text
                      style={[
                        styles.distribuicaoValor,
                        texto,
                        { fontSize: fonte(21) },
                      ]}
                    >
                      {item.valor}
                    </Text>

                    <View
                      style={[
                        styles.distribuicaoTrilho,
                        {
                          backgroundColor: cores.suave,
                          borderRadius: raioMenor,
                        },
                      ]}
                    >
                      <View
                        style={{
                          height:
                            total > 0
                              ? `${(item.valor / total) * 100}%`
                              : '0%',
                          width: '100%',
                          backgroundColor: item.cor,
                          borderRadius: raioMenor,
                        }}
                      />
                    </View>

                    <Text
                      style={[
                        styles.distribuicaoRotulo,
                        secundario,
                        { fontSize: fonte(13) },
                      ]}
                    >
                      {item.titulo}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* ROTINA */}

          <View style={styles.secao}>
            <Text
              style={[
                styles.etiqueta,
                etiqueta,
              ]}
            >
              FEITO PARA VOCÊ
            </Text>

            <Text
              style={[
                styles.secaoTitulo,
                tituloSecao,
              ]}
            >
              Sua rotina, seus objetivos
            </Text>

            <View style={[styles.card, card]}>
              <Text style={styles.iconeCard}>
                💜
              </Text>

              <Text
                style={[
                  styles.objetivoTitulo,
                  texto,
                  { fontSize: fonte(18) },
                ]}
              >
                {respostas
                  ? 'Sua rotina foi criada com base no questionário.'
                  : 'Personalize sua jornada de autocuidado.'}
              </Text>

              <Text
                style={[
                  styles.objetivoDescricao,
                  secundario,
                  {
                    fontSize: fonte(14),
                    lineHeight: fonte(14) + 7,
                  },
                ]}
              >
                {respostas
                  ? 'As atividades consideram suas respostas sobre sono, hidratação, movimento, estresse, objetivos e tempo disponível.'
                  : 'Responda ao questionário para receber atividades personalizadas.'}
              </Text>

              <TouchableOpacity
                style={[
                  styles.botaoPrincipal,
                  botaoPrincipal,
                ]}
                onPress={() =>
                  router.push(
                    respostas
                      ? '/rotina'
                      : '/questionario'
                  )
                }
              >
                <Text
                  style={[
                    styles.botaoTexto,
                    textoBotao,
                    { fontSize: fonte(14) },
                  ]}
                >
                  {respostas
                    ? 'Ver minha rotina →'
                    : 'Responder questionário →'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* RODAPÉ */}

          <View
            style={[
              styles.rodapeCard,
              cardSuave,
            ]}
          >
            <Text style={styles.rodapeEmoji}>
              🦋
            </Text>

            <Text
              style={[
                styles.rodapeMensagem,
                texto,
                {
                  fontSize: fonte(14),
                  lineHeight: fonte(14) + 8,
                },
              ]}
            >
              Evoluir não é fazer tudo perfeitamente.
              É reconhecer o valor dos pequenos cuidados.
            </Text>
          </View>

          <Text
            style={[
              styles.rodape,
              secundario,
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
    paddingTop: 28,
    paddingBottom: 60,
    alignItems: 'center',
  },

  conteudoCentral: {
    width: '100%',
    maxWidth: 1000,
  },

  cabecalho: {
    marginBottom: 26,
  },

  etiqueta: {
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 10,
  },

  titulo: {
    fontWeight: '800',
  },

  subtitulo: {
    marginTop: 10,
  },

  cardPrincipal: {
    padding: 24,
    marginBottom: 32,
  },

  principalEtiqueta: {
    fontWeight: '800',
    marginBottom: 14,
  },

  principalTitulo: {
    fontWeight: '800',
  },

  principalDescricao: {
    marginTop: 12,
  },

  circuloContainer: {
    alignItems: 'center',
    marginVertical: 26,
  },

  circulo: {
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  numeroProgresso: {
    fontWeight: '800',
  },

  legendaProgresso: {
    marginTop: 3,
  },

  barraFundo: {
    height: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },

  barraPreenchida: {
    height: '100%',
    borderRadius: 12,
  },

  progressoDetalhe: {
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 16,
  },

  secao: {
    marginBottom: 32,
  },

  secaoTitulo: {
    fontWeight: '800',
  },

  secaoDescricao: {
    marginTop: 9,
    marginBottom: 18,
  },

  card: {
    padding: 20,
    borderWidth: 1,
  },

  gradeEstatisticas: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },

  estatisticaCard: {
    flex: 1,
    borderWidth: 1,
    padding: 13,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 115,
  },

  estatisticaEmoji: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
  },

  estatisticaNumero: {
    fontWeight: '800',
  },

  estatisticaLegenda: {
    textAlign: 'center',
    fontWeight: '700',
    marginTop: 5,
  },

  mensagemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 17,
    borderWidth: 1,
    marginBottom: 32,
  },

  mensagemEmoji: {
    fontSize: 30,
    marginRight: 13,
  },

  mensagemTitulo: {
    fontWeight: '800',
  },

  mensagemDescricao: {
    marginTop: 6,
  },

  calendarioCabecalho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 22,
  },

  mesBotao: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  mesSeta: {
    fontSize: 30,
    fontWeight: '700',
  },

  mesTitulo: {
    fontWeight: '800',
    textAlign: 'center',
  },

  calendarioGrade: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  calendarioCelula: {
    width: '14.285714%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },

  calendarioDiaNome: {
    fontWeight: '800',
    textAlign: 'center',
    paddingVertical: 9,
  },

  calendarioDiaBotao: {
    width: '90%',
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },

  calendarioDiaNumero: {
    fontWeight: '800',
  },

  calendarioPonto: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginTop: 4,
  },

  legendaCalendario: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 20,
    marginTop: 12,
    marginBottom: 20,
  },

  legendaTexto: {
    fontWeight: '700',
  },

  detalheDia: {
    padding: 16,
  },

  detalheTitulo: {
    fontWeight: '800',
  },

  detalheDescricao: {
    marginTop: 8,
  },

  cardTitulo: {
    fontWeight: '800',
  },

  cardDescricao: {
    marginTop: 7,
    marginBottom: 20,
  },

  graficoSemanal: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 7,
    minHeight: 225,
  },

  diaColuna: {
    flex: 1,
    alignItems: 'center',
  },

  diaPorcentagem: {
    fontWeight: '800',
    marginBottom: 8,
  },

  diaTrilho: {
    width: '75%',
    height: 150,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },

  diaBarra: {
    width: '100%',
  },

  diaNome: {
    fontWeight: '800',
    marginTop: 9,
  },

  diaNumero: {
    marginTop: 3,
  },

  gradeResultados: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },

  resultadoCard: {
    width: '48%',
    padding: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 140,
  },

  resultadoEmoji: {
    fontSize: 27,
    marginBottom: 10,
  },

  resultadoNumero: {
    fontWeight: '800',
  },

  resultadoLegenda: {
    textAlign: 'center',
    marginTop: 7,
    fontWeight: '700',
  },

  sequenciaCard: {
    padding: 28,
    alignItems: 'center',
  },

  sequenciaEmoji: {
    fontSize: 43,
    marginBottom: 9,
  },

  sequenciaNumero: {
    fontWeight: '900',
  },

  sequenciaLegenda: {
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 5,
  },

  sequenciaDescricao: {
    textAlign: 'center',
    marginTop: 16,
  },

  conquistaCard: {
    borderWidth: 1,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 13,
  },

  conquistaIcone: {
    width: 55,
    height: 55,
    alignItems: 'center',
    justifyContent: 'center',
  },

  conquistaEmoji: {
    fontSize: 26,
  },

  conquistaTitulo: {
    fontWeight: '800',
  },

  conquistaDescricao: {
    marginTop: 6,
  },

  conquistaStatus: {
    fontWeight: '800',
    marginTop: 8,
  },

  vazioTexto: {
    textAlign: 'center',
    lineHeight: 22,
  },

  categoriaCard: {
    borderWidth: 1,
    padding: 18,
    marginBottom: 12,
  },

  categoriaCabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  categoriaIcone: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },

  categoriaEmoji: {
    fontSize: 24,
  },

  categoriaNome: {
    fontWeight: '800',
  },

  categoriaQuantidade: {
    marginTop: 5,
  },

  categoriaPorcentagem: {
    fontWeight: '800',
  },

  categoriaBarra: {
    height: 10,
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 17,
  },

  categoriaBarraPreenchida: {
    height: '100%',
    borderRadius: 10,
  },

  distribuicaoArea: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    minHeight: 230,
  },

  distribuicaoColuna: {
    flex: 1,
    alignItems: 'center',
  },

  distribuicaoValor: {
    fontWeight: '800',
    marginBottom: 10,
  },

  distribuicaoTrilho: {
    height: 150,
    width: 90,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },

  distribuicaoRotulo: {
    marginTop: 12,
    fontWeight: '800',
    textAlign: 'center',
  },

  iconeCard: {
    fontSize: 31,
    marginBottom: 14,
  },

  objetivoTitulo: {
    fontWeight: '800',
  },

  objetivoDescricao: {
    marginTop: 10,
    marginBottom: 18,
  },

  botaoPrincipal: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  botaoTexto: {
    fontWeight: '800',
    textAlign: 'center',
  },

  rodapeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    padding: 20,
  },

  rodapeEmoji: {
    fontSize: 29,
    marginRight: 13,
  },

  rodapeMensagem: {
    flex: 1,
  },

  rodape: {
    fontWeight: '800',
    letterSpacing: 0.6,
    textAlign: 'center',
    marginTop: 28,
  },
});
