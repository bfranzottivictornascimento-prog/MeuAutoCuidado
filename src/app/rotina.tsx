
import React, { useMemo, useState } from 'react';

import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import { router } from 'expo-router';

import {
  useAutocuidado,
  type Atividade,
} from './AutocuidadoContext';

type Filtro = 'Todas' | 'Pendentes' | 'Concluídas';
type Periodo = 'Manhã' | 'Tarde' | 'Noite';

const FILTROS: Filtro[] = [
  'Todas',
  'Pendentes',
  'Concluídas',
];

const PERIODOS: {
  nome: Periodo;
  emoji: string;
  descricao: string;
}[] = [
  {
    nome: 'Manhã',
    emoji: '☀️',
    descricao: 'Comece o dia cuidando de você',
  },
  {
    nome: 'Tarde',
    emoji: '🌤️',
    descricao: 'Uma pausa para renovar as energias',
  },
  {
    nome: 'Noite',
    emoji: '🌙',
    descricao: 'Desacelere e prepare seu descanso',
  },
];

function obterPeriodo(horario: string): Periodo {
  const hora = Number(horario.slice(0, 2));

  if (hora < 12) return 'Manhã';
  if (hora < 18) return 'Tarde';
  return 'Noite';
}

function obterMensagem(
  progresso: number,
  concluidas: number,
  total: number
) {
  if (total === 0) {
    return 'Sua jornada de autocuidado começa com pequenos passos.';
  }

  if (progresso >= 100) {
    return 'Você concluiu sua rotina de hoje. Parabéns por dedicar esse tempo a si!';
  }

  if (concluidas === 0) {
    return 'Seu primeiro cuidado do dia está esperando por você. Comece no seu ritmo!';
  }

  if (progresso >= 75) {
    return 'Falta pouquinho! Você já dedicou bastante atenção ao seu bem-estar.';
  }

  if (progresso >= 50) {
    return 'Você já avançou bastante. Continue respeitando seu próprio ritmo!';
  }

  return 'Cada atividade concluída é um pequeno gesto de carinho com você.';
}

export default function Rotina() {
  const {
    usuario,
    atividades,
    alternarAtividade,
    concluidas,
    progresso,
    respostas,
    cores,
    raioCartao,
    escalaFonte,
    preferencias,
  } = useAutocuidado();

  const [filtro, setFiltro] = useState<Filtro>('Todas');
  const [mostrarMotivos, setMostrarMotivos] = useState(true);

  const escuro =
    preferencias.modoNoturno ||
    preferencias.tema === 'noite';

  const fonte = (tamanho: number) =>
    Math.round(tamanho * escalaFonte);

  const raioPequeno = Math.max(6, raioCartao - 8);

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

  const texto = {
    color: cores.texto,
  };

  const secundario = {
    color: cores.secundario,
  };

  const destaque = {
    color: cores.primario,
  };

  const textoBotao = {
    color: cores.textoBotao,
  };

  const nome =
    usuario?.nome?.trim().split(' ')[0] || 'você';

  const total = atividades.length;
  const pendentes = Math.max(0, total - concluidas);

  const porcentagem = Math.min(
    100,
    Math.max(0, progresso)
  );

  const mensagem = obterMensagem(
    porcentagem,
    concluidas,
    total
  );

  const atividadesOrdenadas = useMemo(() => {
    return [...atividades].sort((a, b) =>
      a.horario.localeCompare(b.horario)
    );
  }, [atividades]);

  const atividadesFiltradas = useMemo(() => {
    return atividadesOrdenadas.filter(atividade => {
      if (filtro === 'Pendentes') {
        return !atividade.concluida;
      }

      if (filtro === 'Concluídas') {
        return atividade.concluida;
      }

      return true;
    });
  }, [atividadesOrdenadas, filtro]);

  const grupos = useMemo(() => {
    return PERIODOS.map(periodo => {
      const todas = atividadesOrdenadas.filter(
        atividade =>
          obterPeriodo(atividade.horario) === periodo.nome
      );

      const visiveis = atividadesFiltradas.filter(
        atividade =>
          obterPeriodo(atividade.horario) === periodo.nome
      );

      return {
        ...periodo,
        todas,
        visiveis,
        concluidas: todas.filter(
          atividade => atividade.concluida
        ).length,
      };
    });
  }, [atividadesOrdenadas, atividadesFiltradas]);

  const proximaAtividade = atividadesOrdenadas.find(
    atividade => !atividade.concluida
  );

  const categorias = useMemo(() => {
    const mapa: Record<
      string,
      { total: number; concluidas: number }
    > = {};

    atividades.forEach(atividade => {
      const categoria =
        atividade.categoria || 'Outros cuidados';

      if (!mapa[categoria]) {
        mapa[categoria] = {
          total: 0,
          concluidas: 0,
        };
      }

      mapa[categoria].total += 1;

      if (atividade.concluida) {
        mapa[categoria].concluidas += 1;
      }
    });

    return Object.entries(mapa).map(([nome, dados]) => ({
      nome,
      ...dados,
      porcentagem:
        dados.total > 0
          ? Math.round(
              (dados.concluidas / dados.total) * 100
            )
          : 0,
    }));
  }, [atividades]);

  function renderizarAtividade(atividade: Atividade) {
    const concluida = atividade.concluida;

    return (
      <TouchableOpacity
        key={atividade.id}
        style={[
          styles.atividadeCard,
          card,
          concluida && {
            backgroundColor: cores.suave,
          },
        ]}
        activeOpacity={0.85}
        onPress={() => alternarAtividade(atividade.id)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: concluida }}
        accessibilityLabel={atividade.nome}
      >
        <View style={styles.atividadeTopo}>
          <View
            style={[
              styles.iconeAtividade,
              {
                backgroundColor: concluida
                  ? cores.card
                  : cores.suave,
                borderRadius: raioPequeno,
              },
            ]}
          >
            <Text style={styles.atividadeEmoji}>
              {atividade.icone}
            </Text>
          </View>

          <View style={styles.atividadeInfo}>
            <Text
              style={[
                styles.atividadeNome,
                texto,
                {
                  fontSize: fonte(15),
                  lineHeight: fonte(15) + 7,
                },
                concluida && {
                  textDecorationLine: 'line-through',
                  color: cores.secundario,
                },
              ]}
            >
              {atividade.nome}
            </Text>

            <View style={styles.metadados}>
              <Text
                style={[
                  secundario,
                  { fontSize: fonte(12) },
                ]}
              >
                🕒 {atividade.horario}
              </Text>

              {!!atividade.duracao && (
                <Text
                  style={[
                    secundario,
                    { fontSize: fonte(12) },
                  ]}
                >
                  ⏱ {atividade.duracao}
                </Text>
              )}
            </View>
          </View>

          <View
            style={[
              styles.checkbox,
              {
                borderColor: concluida
                  ? cores.primario
                  : cores.borda,
                backgroundColor: concluida
                  ? cores.primario
                  : 'transparent',
                borderRadius: raioPequeno,
              },
            ]}
          >
            {concluida && (
              <Text
                style={[
                  styles.checkboxTexto,
                  textoBotao,
                ]}
              >
                ✓
              </Text>
            )}
          </View>
        </View>

        {!!atividade.categoria && (
          <View
            style={[
              styles.categoriaTag,
              {
                backgroundColor: concluida
                  ? cores.card
                  : cores.suave,
                borderRadius: raioPequeno,
              },
            ]}
          >
            <Text
              style={[
                styles.categoriaTexto,
                destaque,
                { fontSize: fonte(11) },
              ]}
            >
              {atividade.categoria}
            </Text>
          </View>
        )}

        {mostrarMotivos && !!atividade.motivo && (
          <View
            style={[
              styles.motivoContainer,
              {
                backgroundColor: concluida
                  ? cores.card
                  : cores.fundo,
                borderRadius: raioPequeno,
              },
            ]}
          >
            <Text
              style={[
                styles.motivoTitulo,
                destaque,
                { fontSize: fonte(12) },
              ]}
            >
              ✨ Por que essa atividade?
            </Text>

            <Text
              style={[
                styles.motivoTexto,
                secundario,
                {
                  fontSize: fonte(13),
                  lineHeight: fonte(13) + 7,
                },
              ]}
            >
              {atividade.motivo}
            </Text>
          </View>
        )}

        <View style={styles.statusLinha}>
          <Text
            style={[
              styles.atividadeStatus,
              concluida ? destaque : secundario,
              { fontSize: fonte(12) },
            ]}
          >
            {concluida
              ? '✓ Cuidado concluído'
              : 'Toque para concluir'}
          </Text>

          <Text
            style={[
              destaque,
              { fontSize: fonte(18) },
            ]}
          >
            {concluida ? '💜' : '○'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: cores.fundo },
      ]}
    >
      <StatusBar
        barStyle={escuro ? 'light-content' : 'dark-content'}
        backgroundColor={cores.fundo}
      />

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.conteudo}>
          {/* CABEÇALHO */}
          <View style={styles.cabecalho}>
            <Text
              style={[
                styles.etiqueta,
                destaque,
                { fontSize: fonte(12) },
              ]}
            >
              SEUS CUIDADOS DIÁRIOS
            </Text>

            <Text
              style={[
                styles.titulo,
                texto,
                {
                  fontSize: fonte(30),
                  lineHeight: fonte(30) + 10,
                },
              ]}
            >
              Minha Rotina 🌷
            </Text>

            <Text
              style={[
                styles.subtitulo,
                secundario,
                {
                  fontSize: fonte(15),
                  lineHeight: fonte(15) + 8,
                },
              ]}
            >
              Um planejamento de autocuidado pensado
              para o seu momento.
            </Text>
          </View>

          {/* PROGRESSO PRINCIPAL */}
          <View
            style={[
              styles.progressoCard,
              {
                backgroundColor: cores.primario,
                borderRadius: raioCartao,
              },
            ]}
          >
            <Text
              style={[
                styles.progressoEtiqueta,
                textoBotao,
                { fontSize: fonte(12) },
              ]}
            >
              ✨ SUA JORNADA DE HOJE
            </Text>

            <Text
              style={[
                styles.progressoTitulo,
                textoBotao,
                {
                  fontSize: fonte(23),
                  lineHeight: fonte(23) + 9,
                },
              ]}
            >
              Um cuidado de cada vez, {nome}.
            </Text>

            <Text
              style={[
                styles.progressoDescricao,
                textoBotao,
                {
                  fontSize: fonte(14),
                  lineHeight: fonte(14) + 8,
                },
              ]}
            >
              {mensagem}
            </Text>

            <View style={styles.progressoLinha}>
              <Text
                style={[
                  styles.progressoNumero,
                  textoBotao,
                  { fontSize: fonte(34) },
                ]}
              >
                {porcentagem}%
              </Text>

              <Text
                style={[
                  styles.progressoLegenda,
                  textoBotao,
                  { fontSize: fonte(12) },
                ]}
              >
                {concluidas} de {total} concluídas
              </Text>
            </View>

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
                    width: `${porcentagem}%`,
                    backgroundColor: cores.textoBotao,
                  },
                ]}
              />
            </View>

            <Text
              style={[
                styles.progressoRodapeTexto,
                textoBotao,
                { fontSize: fonte(13) },
              ]}
            >
              {porcentagem === 100 && total > 0
                ? '🎉 Rotina concluída!'
                : '🌿 Continue no seu ritmo'}
            </Text>
          </View>

          {/* RESUMO */}
          <View style={styles.resumoLinha}>
            {[
              { emoji: '🌷', numero: total, titulo: 'Atividades' },
              { emoji: '💜', numero: concluidas, titulo: 'Concluídas' },
              { emoji: '🦋', numero: pendentes, titulo: 'Pendentes' },
            ].map(item => (
              <View
                key={item.titulo}
                style={[
                  styles.resumoCard,
                  card,
                ]}
              >
                <Text style={styles.resumoEmoji}>
                  {item.emoji}
                </Text>

                <Text
                  style={[
                    styles.resumoNumero,
                    destaque,
                    { fontSize: fonte(25) },
                  ]}
                >
                  {item.numero}
                </Text>

                <Text
                  style={[
                    styles.resumoTexto,
                    secundario,
                    { fontSize: fonte(11) },
                  ]}
                >
                  {item.titulo}
                </Text>
              </View>
            ))}
          </View>

          {/* PRÓXIMO CUIDADO */}
          {total > 0 && (
            <View
              style={[
                styles.proximoCard,
                card,
              ]}
            >
              <View
                style={[
                  styles.proximoIcone,
                  {
                    backgroundColor: cores.suave,
                    borderRadius: raioPequeno,
                  },
                ]}
              >
                <Text style={styles.proximoEmoji}>
                  {proximaAtividade
                    ? proximaAtividade.icone
                    : '🎉'}
                </Text>
              </View>

              <View style={styles.proximoInfo}>
                <Text
                  style={[
                    styles.proximoEtiqueta,
                    destaque,
                    { fontSize: fonte(11) },
                  ]}
                >
                  {proximaAtividade
                    ? 'PRÓXIMO CUIDADO PENDENTE'
                    : 'TUDO CONCLUÍDO'}
                </Text>

                <Text
                  style={[
                    styles.proximoTitulo,
                    texto,
                    { fontSize: fonte(16) },
                  ]}
                >
                  {proximaAtividade
                    ? proximaAtividade.nome
                    : 'Você completou sua rotina!'}
                </Text>

                <Text
                  style={[
                    styles.proximoDescricao,
                    secundario,
                    { fontSize: fonte(13) },
                  ]}
                >
                  {proximaAtividade
                    ? `Horário planejado: ${proximaAtividade.horario}`
                    : 'Aproveite seu momento de descanso.'}
                </Text>
              </View>
            </View>
          )}

          {/* PERSONALIZAÇÃO */}
          <View
            style={[
              styles.personalizacaoCard,
              cardSuave,
            ]}
          >
            <View
              style={[
                styles.personalizacaoIcone,
                {
                  backgroundColor: cores.card,
                  borderRadius: raioPequeno,
                },
              ]}
            >
              <Text style={styles.personalizacaoEmoji}>
                ✨
              </Text>
            </View>

            <View style={styles.personalizacaoInfo}>
              <Text
                style={[
                  styles.personalizacaoTitulo,
                  texto,
                  { fontSize: fonte(16) },
                ]}
              >
                {respostas
                  ? 'Sua rotina personalizada'
                  : 'Personalize sua rotina'}
              </Text>

              <Text
                style={[
                  styles.personalizacaoDescricao,
                  secundario,
                  {
                    fontSize: fonte(13),
                    lineHeight: fonte(13) + 7,
                  },
                ]}
              >
                {respostas
                  ? 'Suas atividades consideram as respostas do seu questionário.'
                  : 'Responda ao questionário para receber atividades relacionadas aos seus objetivos.'}
              </Text>

              <TouchableOpacity
                onPress={() => router.push('/questionario')}
              >
                <Text
                  style={[
                    styles.personalizacaoLink,
                    destaque,
                    { fontSize: fonte(13) },
                  ]}
                >
                  {respostas
                    ? 'Atualizar minhas respostas →'
                    : 'Responder questionário →'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ATIVIDADES */}
          <View style={styles.secao}>
            <Text
              style={[
                styles.secaoEtiqueta,
                destaque,
                { fontSize: fonte(12) },
              ]}
            >
              SUA PROGRAMAÇÃO
            </Text>

            <Text
              style={[
                styles.secaoTitulo,
                texto,
                { fontSize: fonte(23) },
              ]}
            >
              Atividades do dia
            </Text>

            <Text
              style={[
                styles.secaoDescricao,
                secundario,
                {
                  fontSize: fonte(14),
                  lineHeight: fonte(14) + 8,
                },
              ]}
            >
              Organize seus cuidados por período
              e marque o que já realizou.
            </Text>

            {/* FILTROS */}
            <View style={styles.filtros}>
              {FILTROS.map(opcao => {
                const selecionado = filtro === opcao;

                return (
                  <TouchableOpacity
                    key={opcao}
                    style={[
                      styles.filtro,
                      {
                        backgroundColor: selecionado
                          ? cores.primario
                          : cores.suave,
                        borderRadius: raioPequeno,
                      },
                    ]}
                    onPress={() => setFiltro(opcao)}
                  >
                    <Text
                      style={[
                        styles.filtroTexto,
                        selecionado
                          ? textoBotao
                          : destaque,
                        { fontSize: fonte(12) },
                      ]}
                    >
                      {opcao}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* MOSTRAR MOTIVOS */}
            <TouchableOpacity
              style={styles.opcaoMotivos}
              onPress={() =>
                setMostrarMotivos(anterior => !anterior)
              }
              activeOpacity={0.85}
            >
              <View
                style={[
                  styles.opcaoCheckbox,
                  {
                    borderColor: cores.primario,
                    backgroundColor: mostrarMotivos
                      ? cores.primario
                      : 'transparent',
                    borderRadius: raioPequeno,
                  },
                ]}
              >
                {mostrarMotivos && (
                  <Text
                    style={[
                      styles.opcaoCheckboxTexto,
                      textoBotao,
                    ]}
                  >
                    ✓
                  </Text>
                )}
              </View>

              <Text
                style={[
                  styles.opcaoMotivosTexto,
                  texto,
                  { fontSize: fonte(13) },
                ]}
              >
                Mostrar explicações das atividades
              </Text>
            </TouchableOpacity>

            {/* LISTA OU ESTADO VAZIO */}
            {atividadesFiltradas.length === 0 ? (
              <View
                style={[
                  styles.vazioCard,
                  card,
                ]}
              >
                <Text style={styles.vazioEmoji}>
                  {filtro === 'Pendentes' ? '🎉' : '🌷'}
                </Text>

                <Text
                  style={[
                    styles.vazioTitulo,
                    texto,
                    { fontSize: fonte(18) },
                  ]}
                >
                  {filtro === 'Pendentes'
                    ? 'Nenhuma atividade pendente!'
                    : filtro === 'Concluídas'
                    ? 'Nenhuma atividade concluída ainda'
                    : 'Sua rotina está vazia'}
                </Text>

                <Text
                  style={[
                    styles.vazioDescricao,
                    secundario,
                    {
                      fontSize: fonte(14),
                      lineHeight: fonte(14) + 8,
                    },
                  ]}
                >
                  {filtro === 'Pendentes'
                    ? 'Você concluiu todos os cuidados disponíveis.'
                    : filtro === 'Concluídas'
                    ? 'Quando você concluir uma atividade, ela aparecerá aqui.'
                    : 'Responda ao questionário para montar sua rotina.'}
                </Text>

                {total === 0 && (
                  <TouchableOpacity
                    style={[
                      styles.vazioBotao,
                      {
                        backgroundColor: cores.primario,
                        borderRadius: raioPequeno,
                      },
                    ]}
                    onPress={() =>
                      router.push('/questionario')
                    }
                  >
                    <Text
                      style={[
                        styles.vazioBotaoTexto,
                        textoBotao,
                        { fontSize: fonte(13) },
                      ]}
                    >
                      Personalizar minha rotina →
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              grupos.map(grupo => {
                if (grupo.visiveis.length === 0) {
                  return null;
                }

                const porcentagemPeriodo =
                  grupo.todas.length > 0
                    ? Math.round(
                        (grupo.concluidas /
                          grupo.todas.length) * 100
                      )
                    : 0;

                return (
                  <View
                    key={grupo.nome}
                    style={styles.periodoSecao}
                  >
                    <View style={styles.periodoCabecalho}>
                      <View style={styles.periodoInfo}>
                        <Text
                          style={[
                            styles.periodoTitulo,
                            texto,
                            { fontSize: fonte(19) },
                          ]}
                        >
                          {grupo.emoji} {grupo.nome}
                        </Text>

                        <Text
                          style={[
                            styles.periodoDescricao,
                            secundario,
                            { fontSize: fonte(13) },
                          ]}
                        >
                          {grupo.descricao}
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.periodoContador,
                          {
                            backgroundColor: cores.suave,
                            borderRadius: raioPequeno,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.periodoContadorTexto,
                            destaque,
                            { fontSize: fonte(12) },
                          ]}
                        >
                          {grupo.concluidas}/{grupo.todas.length}
                        </Text>
                      </View>
                    </View>

                    <View
                      style={[
                        styles.periodoBarraFundo,
                        { backgroundColor: cores.suave },
                      ]}
                    >
                      <View
                        style={[
                          styles.periodoBarra,
                          {
                            width: `${porcentagemPeriodo}%`,
                            backgroundColor: cores.primario,
                          },
                        ]}
                      />
                    </View>

                    {grupo.visiveis.map(renderizarAtividade)}
                  </View>
                );
              })
            )}
          </View>

          {/* CATEGORIAS */}
          {categorias.length > 0 && (
            <View style={styles.secao}>
              <Text
                style={[
                  styles.secaoEtiqueta,
                  destaque,
                  { fontSize: fonte(12) },
                ]}
              >
                VISÃO GERAL
              </Text>

              <Text
                style={[
                  styles.secaoTitulo,
                  texto,
                  { fontSize: fonte(23) },
                ]}
              >
                Cuidados por categoria
              </Text>

              <Text
                style={[
                  styles.secaoDescricao,
                  secundario,
                  {
                    fontSize: fonte(14),
                    lineHeight: fonte(14) + 8,
                  },
                ]}
              >
                Veja como estão os diferentes
                tipos de cuidado da sua rotina.
              </Text>

              <View
                style={[
                  styles.categoriasCard,
                  card,
                ]}
              >
                {categorias.map((categoria, indice) => (
                  <View
                    key={categoria.nome}
                    style={[
                      styles.categoriaProgresso,
                      indice === categorias.length - 1 && {
                        marginBottom: 0,
                      },
                    ]}
                  >
                    <View style={styles.categoriaCabecalho}>
                      <Text
                        style={[
                          styles.categoriaProgressoNome,
                          texto,
                          { fontSize: fonte(14) },
                        ]}
                      >
                        {categoria.nome}
                      </Text>

                      <Text
                        style={[
                          styles.categoriaProgressoValor,
                          destaque,
                          { fontSize: fonte(13) },
                        ]}
                      >
                        {categoria.concluidas}/{categoria.total}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.categoriaBarraFundo,
                        { backgroundColor: cores.suave },
                      ]}
                    >
                      <View
                        style={[
                          styles.categoriaBarra,
                          {
                            width: `${categoria.porcentagem}%`,
                            backgroundColor: cores.primario,
                          },
                        ]}
                      />
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* EVOLUÇÃO */}
          <TouchableOpacity
            style={[
              styles.evolucaoBotao,
              card,
            ]}
            onPress={() => router.push('/evolucao')}
            activeOpacity={0.85}
          >
            <View
              style={[
                styles.evolucaoIcone,
                {
                  backgroundColor: cores.suave,
                  borderRadius: raioPequeno,
                },
              ]}
            >
              <Text style={styles.evolucaoEmoji}>
                📊
              </Text>
            </View>

            <View style={styles.evolucaoInfo}>
              <Text
                style={[
                  styles.evolucaoTitulo,
                  texto,
                  { fontSize: fonte(16) },
                ]}
              >
                Acompanhar minha evolução
              </Text>

              <Text
                style={[
                  styles.evolucaoDescricao,
                  secundario,
                  {
                    fontSize: fonte(13),
                    lineHeight: fonte(13) + 7,
                  },
                ]}
              >
                Veja seu progresso, histórico
                e conquistas.
              </Text>
            </View>

            <Text
              style={[
                styles.evolucaoSeta,
                destaque,
              ]}
            >
              ›
            </Text>
          </TouchableOpacity>

          {/* MENSAGEM FINAL */}
          <View
            style={[
              styles.mensagemFinal,
              cardSuave,
            ]}
          >
            <Text style={styles.mensagemEmoji}>
              💗
            </Text>

            <Text
              style={[
                styles.mensagemTexto,
                texto,
                {
                  fontSize: fonte(14),
                  lineHeight: fonte(14) + 8,
                },
              ]}
            >
              Não se cobre para concluir tudo.
              O autocuidado deve acompanhar
              seu ritmo e suas necessidades.
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
    paddingTop: 24,
    paddingBottom: 45,
    alignItems: 'center',
  },
  conteudo: {
    width: '100%',
    maxWidth: 850,
  },
  cabecalho: {
    marginBottom: 24,
  },
  etiqueta: {
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 9,
  },
  titulo: {
    fontWeight: '800',
  },
  subtitulo: {
    marginTop: 9,
  },
  progressoCard: {
    padding: 23,
    marginBottom: 16,
    elevation: 3,
  },
  progressoEtiqueta: {
    fontWeight: '800',
    letterSpacing: 0.7,
    marginBottom: 13,
  },
  progressoTitulo: {
    fontWeight: '800',
  },
  progressoDescricao: {
    marginTop: 11,
  },
  progressoLinha: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginTop: 23,
    marginBottom: 14,
    gap: 8,
  },
  progressoNumero: {
    fontWeight: '800',
  },
  progressoLegenda: {
    fontWeight: '600',
  },
  barraFundo: {
    height: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
  barraPreenchida: {
    height: '100%',
    borderRadius: 10,
  },
  progressoRodapeTexto: {
    fontWeight: '700',
    marginTop: 14,
  },
  resumoLinha: {
    flexDirection: 'row',
    gap: 9,
    marginBottom: 18,
  },
  resumoCard: {
    flex: 1,
    minWidth: 0,
    padding: 13,
    borderWidth: 1,
  },
  resumoEmoji: {
    fontSize: 24,
    marginBottom: 9,
  },
  resumoNumero: {
    fontWeight: '800',
  },
  resumoTexto: {
    marginTop: 7,
    fontWeight: '600',
  },
  proximoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    marginBottom: 18,
  },
  proximoIcone: {
    width: 53,
    height: 53,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },
  proximoEmoji: {
    fontSize: 26,
  },
  proximoInfo: {
    flex: 1,
  },
  proximoEtiqueta: {
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 7,
  },
  proximoTitulo: {
    fontWeight: '800',
  },
  proximoDescricao: {
    marginTop: 7,
  },
  personalizacaoCard: {
    flexDirection: 'row',
    padding: 18,
    marginBottom: 30,
    borderWidth: 1,
  },
  personalizacaoIcone: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },
  personalizacaoEmoji: {
    fontSize: 24,
  },
  personalizacaoInfo: {
    flex: 1,
  },
  personalizacaoTitulo: {
    fontWeight: '800',
  },
  personalizacaoDescricao: {
    marginTop: 8,
  },
  personalizacaoLink: {
    fontWeight: '800',
    marginTop: 14,
  },
  secao: {
    marginBottom: 29,
  },
  secaoEtiqueta: {
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 9,
  },
  secaoTitulo: {
    fontWeight: '800',
  },
  secaoDescricao: {
    marginTop: 9,
    marginBottom: 19,
  },
  filtros: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },
  filtro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
  },
  filtroTexto: {
    fontWeight: '800',
    textAlign: 'center',
  },
  opcaoMotivos: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 24,
    paddingVertical: 6,
  },
  opcaoCheckbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },
  opcaoCheckboxTexto: {
    fontSize: 13,
    fontWeight: '800',
  },
  opcaoMotivosTexto: {
    fontWeight: '700',
    flexShrink: 1,
  },
  periodoSecao: {
    marginBottom: 25,
  },
  periodoCabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 13,
  },
  periodoInfo: {
    flex: 1,
  },
  periodoTitulo: {
    fontWeight: '800',
  },
  periodoDescricao: {
    marginTop: 6,
  },
  periodoContador: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginLeft: 9,
  },
  periodoContadorTexto: {
    fontWeight: '800',
  },
  periodoBarraFundo: {
    height: 7,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
  },
  periodoBarra: {
    height: '100%',
    borderRadius: 8,
  },
  atividadeCard: {
    padding: 17,
    borderWidth: 1,
    marginBottom: 13,
  },
  atividadeTopo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconeAtividade: {
    width: 51,
    height: 51,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },
  atividadeEmoji: {
    fontSize: 26,
  },
  atividadeInfo: {
    flex: 1,
  },
  atividadeNome: {
    fontWeight: '800',
  },
  metadados: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
  },
  checkbox: {
    width: 27,
    height: 27,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 9,
  },
  checkboxTexto: {
    fontSize: 16,
    fontWeight: '800',
  },
  categoriaTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 11,
    paddingVertical: 8,
    marginTop: 14,
  },
  categoriaTexto: {
    fontWeight: '800',
  },
  motivoContainer: {
    padding: 14,
    marginTop: 13,
  },
  motivoTitulo: {
    fontWeight: '800',
    marginBottom: 8,
  },
  motivoTexto: {},
  statusLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  atividadeStatus: {
    fontWeight: '700',
  },
  vazioCard: {
    padding: 25,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
  },
  vazioEmoji: {
    fontSize: 37,
    marginBottom: 13,
  },
  vazioTitulo: {
    fontWeight: '800',
    textAlign: 'center',
  },
  vazioDescricao: {
    textAlign: 'center',
    marginTop: 11,
  },
  vazioBotao: {
    paddingHorizontal: 18,
    paddingVertical: 15,
    marginTop: 19,
    maxWidth: '100%',
  },
  vazioBotaoTexto: {
    fontWeight: '800',
    textAlign: 'center',
  },
  categoriasCard: {
    padding: 19,
    borderWidth: 1,
  },
  categoriaProgresso: {
    marginBottom: 21,
  },
  categoriaCabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 11,
  },
  categoriaProgressoNome: {
    fontWeight: '800',
    flex: 1,
    marginRight: 10,
  },
  categoriaProgressoValor: {
    fontWeight: '800',
  },
  categoriaBarraFundo: {
    height: 9,
    borderRadius: 8,
    overflow: 'hidden',
  },
  categoriaBarra: {
    height: '100%',
    borderRadius: 8,
  },
  evolucaoBotao: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 17,
    borderWidth: 1,
    marginBottom: 25,
  },
  evolucaoIcone: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },
  evolucaoEmoji: {
    fontSize: 25,
  },
  evolucaoInfo: {
    flex: 1,
  },
  evolucaoTitulo: {
    fontWeight: '800',
  },
  evolucaoDescricao: {
    marginTop: 7,
  },
  evolucaoSeta: {
    fontSize: 29,
    marginLeft: 8,
  },
  mensagemFinal: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 19,
    borderWidth: 1,
  },
  mensagemEmoji: {
    fontSize: 29,
    marginRight: 13,
  },
  mensagemTexto: {
    flex: 1,
  },
  rodape: {
    fontWeight: '800',
    letterSpacing: 0.6,
    textAlign: 'center',
    marginTop: 28,
  },
});
