
import React, {
  useCallback,
  useMemo,
  useState,
} from 'react';

import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import { useAutocuidado } from './AutocuidadoContext';

// ============================================
// TIPOS E DADOS
// ============================================

type TipoHumor =
  | 'muito_feliz'
  | 'bem'
  | 'tranquilo'
  | 'ansioso'
  | 'triste'
  | 'cansado';

type RegistroHumor = {
  id: string;
  data: string;
  humor: TipoHumor;
  observacao: string;
};

type DadosAgua = {
  meta?: number;
  registros?: {
    data: string;
    quantidade: number;
  }[];
};

const HUMORES: Record<
  TipoHumor,
  { emoji: string; nome: string }
> = {
  muito_feliz: {
    emoji: '😄',
    nome: 'Muito feliz',
  },
  bem: {
    emoji: '😊',
    nome: 'Bem',
  },
  tranquilo: {
    emoji: '😌',
    nome: 'Tranquilo',
  },
  ansioso: {
    emoji: '😟',
    nome: 'Ansioso',
  },
  triste: {
    emoji: '😢',
    nome: 'Triste',
  },
  cansado: {
    emoji: '😴',
    nome: 'Cansado',
  },
};

// ============================================
// ATALHOS SEM MEU ESPAÇO
// ============================================

const ATALHOS = [
  {
    id: 'diario',
    titulo: 'Meu Diário',
    descricao: 'Registre seu dia',
    emoji: '📖',
    rota: '/diario',
  },
  {
    id: 'relaxamento',
    titulo: 'Relaxamento',
    descricao: 'Respire e desacelere',
    emoji: '🦋',
    rota: '/relaxamento',
  },
  {
    id: 'evolucao',
    titulo: 'Evolução',
    descricao: 'Veja seu progresso',
    emoji: '📊',
    rota: '/evolucao',
  },
  {
    id: 'rotina',
    titulo: 'Minha Rotina',
    descricao: 'Todos os cuidados',
    emoji: '✅',
    rota: '/rotina',
  },
  {
    id: 'agua',
    titulo: 'Minha Água',
    descricao: 'Acompanhe sua hidratação',
    emoji: '💧',
    rota: '/agua',
  },
  {
    id: 'humor',
    titulo: 'Meu Humor',
    descricao: 'Como estou me sentindo',
    emoji: '💗',
    rota: '/humor',
  },
  {
    id: 'recompensas',
    titulo: 'Recompensas',
    descricao: 'Suas conquistas',
    emoji: '🏆',
    rota: '/recompensas',
  },
  {
    id: 'assistente',
    titulo: 'Assistente',
    descricao: 'Seu apoio no autocuidado',
    emoji: '🤖',
    rota: '/assistente',
  },
] as const;

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

function dataLocal() {
  const d = new Date();

  const ano = d.getFullYear();
  const mes = String(
    d.getMonth() + 1
  ).padStart(2, '0');

  const dia = String(
    d.getDate()
  ).padStart(2, '0');

  return `${ano}-${mes}-${dia}`;
}

function formatarAgua(ml: number) {
  if (ml >= 1000) {
    return `${(ml / 1000)
      .toFixed(2)
      .replace('.', ',')} L`;
  }

  return `${ml} ml`;
}

function mensagemProgresso(
  progresso: number,
  total: number
) {
  if (!total) {
    return 'Sua jornada começa com pequenos gestos de carinho com você.';
  }

  if (progresso >= 100) {
    return 'Você concluiu todos os seus cuidados de hoje. Celebre essa conquista!';
  }

  if (progresso >= 75) {
    return 'Você está quase lá! Continue respeitando seu próprio ritmo.';
  }

  if (progresso >= 50) {
    return 'Você já avançou bastante. Cada cuidado merece ser valorizado!';
  }

  if (progresso > 0) {
    return 'Você já deu o primeiro passo. Continue com carinho e sem pressa.';
  }

  return 'Que tal começar com uma pequena atitude de autocuidado hoje?';
}

// ============================================
// TELA INICIAL
// ============================================

export default function Inicio() {
  const {
    atividades,
    concluidas,
    progresso,
    usuario,
    respostas,
    dicasPersonalizadas,
    alternarAtividade,
    sequenciaDias,
    preferencias,
    cores,
    raioCartao,
    escalaFonte,
  } = useAutocuidado();

  const { width } = useWindowDimensions();
  const pequena = width < 390;

  const escuro =
    preferencias.modoNoturno ||
    preferencias.tema === 'noite';

  const nome =
    usuario?.nome?.trim().split(' ')[0] || '';

  const email =
    usuario?.email?.trim().toLowerCase() || '';

  const [aguaHoje, setAguaHoje] = useState(0);
  const [metaAgua, setMetaAgua] = useState(2000);

  const [humorHoje, setHumorHoje] =
    useState<RegistroHumor | null>(null);

  const [carregandoResumo, setCarregandoResumo] =
    useState(true);

  const fonte = (n: number) =>
    Math.round(n * escalaFonte);

  const raioMenor = Math.max(
    9,
    raioCartao - 7
  );

  const total = atividades.length;

  const porcentagem = Math.min(
    100,
    Math.max(0, progresso)
  );

  const porcentagemAgua =
    metaAgua > 0
      ? Math.min(
          100,
          Math.round(
            (aguaHoje / metaAgua) * 100
          )
        )
      : 0;

  const pendentes = useMemo(
    () =>
      [...atividades]
        .filter(a => !a.concluida)
        .sort((a, b) =>
          a.horario.localeCompare(b.horario)
        ),
    [atividades]
  );

  const mensagem = mensagemProgresso(
    porcentagem,
    total
  );

  const humor = humorHoje
    ? HUMORES[humorHoje.humor]
    : null;

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

  const titulo = {
    color: cores.texto,
    fontSize: fonte(22),
    fontWeight: '800' as const,
  };

  const descricao = {
    color: cores.secundario,
    fontSize: fonte(14),
    lineHeight: fonte(21),
  };

  // ==========================================
  // CARREGAR ÁGUA E HUMOR
  // ==========================================

  const carregarResumo = useCallback(
    async () => {
      setCarregandoResumo(true);

      setAguaHoje(0);
      setMetaAgua(2000);
      setHumorHoje(null);

      if (!email) {
        setCarregandoResumo(false);
        return;
      }

      try {
        const [aguaTexto, humorTexto] =
          await Promise.all([
            AsyncStorage.getItem(
              `@MeuAutoCuidado:agua:${email}`
            ),
            AsyncStorage.getItem(
              `@MeuAutoCuidado:humor:${email}`
            ),
          ]);

        const hoje = dataLocal();

        // Carregar hidratação

        if (aguaTexto) {
          const dados: DadosAgua =
            JSON.parse(aguaTexto);

          if (
            typeof dados.meta === 'number' &&
            Number.isFinite(dados.meta) &&
            dados.meta > 0
          ) {
            setMetaAgua(dados.meta);
          }

          const registro = Array.isArray(
            dados.registros
          )
            ? dados.registros.find(
                item => item?.data === hoje
              )
            : undefined;

          if (
            registro &&
            typeof registro.quantidade ===
              'number' &&
            Number.isFinite(
              registro.quantidade
            )
          ) {
            setAguaHoje(
              Math.max(
                0,
                registro.quantidade
              )
            );
          }
        }

        // Carregar humor do dia

        if (humorTexto) {
          const dados: unknown =
            JSON.parse(humorTexto);

          if (Array.isArray(dados)) {
            const registro = dados.find(
              (item: any) =>
                item?.data === hoje &&
                typeof item?.humor === 'string' &&
                Object.prototype.hasOwnProperty.call(
                  HUMORES,
                  item.humor
                )
            );

            if (registro) {
              setHumorHoje(
                registro as RegistroHumor
              );
            }
          }
        }
      } catch (erro) {
        console.log(
          'Erro ao carregar resumo da tela inicial:',
          erro
        );
      } finally {
        setCarregandoResumo(false);
      }
    },
    [email]
  );

  useFocusEffect(
    useCallback(() => {
      void carregarResumo();
    }, [carregarResumo])
  );

  // ==========================================
  // INTERFACE
  // ==========================================

  return (
    <SafeAreaView
      style={[
        styles.tela,
        { backgroundColor: cores.fundo },
      ]}
    >
      <StatusBar
        barStyle={
          escuro
            ? 'light-content'
            : 'dark-content'
        }
        backgroundColor={cores.fundo}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.conteudo}>

          {/* CABEÇALHO */}

          <View style={styles.cabecalho}>
            <View
              style={{
                flex: 1,
                paddingRight: 12,
              }}
            >
              <Text
                style={[
                  styles.etiqueta,
                  {
                    color: cores.primario,
                    fontSize: fonte(11),
                  },
                ]}
              >
                SEU ESPAÇO DE BEM-ESTAR
              </Text>

              <Text
                style={{
                  color: cores.texto,
                  fontSize: fonte(29),
                  fontWeight: '900',
                }}
              >
                Olá{nome ? `, ${nome}` : ''}! 🌷
              </Text>

              <Text
                style={[
                  descricao,
                  { marginTop: 9 },
                ]}
              >
                Que bom ter você aqui.
                Como vamos cuidar de você hoje?
              </Text>
            </View>

            <TouchableOpacity
              accessibilityLabel="Abrir perfil"
              onPress={() =>
                router.push('/perfil')
              }
              style={[
                styles.avatar,
                {
                  backgroundColor: cores.suave,
                  borderColor: cores.borda,
                  borderRadius: raioMenor,
                },
              ]}
            >
              <Text
                style={{
                  color: cores.primario,
                  fontSize: fonte(25),
                  fontWeight: '900',
                }}
              >
                {nome
                  ? nome.charAt(0).toUpperCase()
                  : '🌷'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* DESTAQUE PRINCIPAL */}

          <View
            style={[
              styles.destaque,
              {
                backgroundColor: cores.primario,
                borderRadius: raioCartao,
              },
            ]}
          >
            <Text
              style={{
                color: cores.textoBotao,
                fontSize: fonte(11),
                fontWeight: '800',
                letterSpacing: 0.5,
              }}
            >
              ✨ SUA JORNADA DE AUTOCUIDADO
            </Text>

            <Text
              style={{
                color: cores.textoBotao,
                fontSize: fonte(28),
                lineHeight: fonte(37),
                fontWeight: '900',
                marginTop: 16,
              }}
            >
              Cuide de você,{'\n'}
              um dia de cada vez.
            </Text>

            <Text
              style={{
                color: cores.textoBotao,
                fontSize: fonte(15),
                lineHeight: fonte(24),
                marginTop: 12,
              }}
            >
              Pequenas atitudes fazem diferença.
              Reserve alguns minutos do seu dia
              para o que faz bem a você.
            </Text>

            <TouchableOpacity
              onPress={() =>
                router.push('/rotina')
              }
              style={[
                styles.botaoClaro,
                {
                  backgroundColor: cores.card,
                  borderRadius: raioMenor,
                },
              ]}
            >
              <Text
                style={{
                  color: cores.primario,
                  fontSize: fonte(15),
                  fontWeight: '800',
                }}
              >
                Ver minha rotina →
              </Text>
            </TouchableOpacity>
          </View>

          {/* PAINEL PESSOAL */}

          <View style={styles.secao}>
            <Text
              style={[
                styles.etiqueta,
                { color: cores.primario },
              ]}
            >
              SEU PAINEL PESSOAL
            </Text>

            <Text style={titulo}>
              Meu dia em resumo
            </Text>

            <Text
              style={[
                descricao,
                styles.subsecao,
              ]}
            >
              Acompanhe seus cuidados em um só lugar.
            </Text>

            <View style={styles.resumoLinha}>
              {[
                {
                  emoji: '✅',
                  numero: concluidas,
                  label: 'Concluídas',
                },
                {
                  emoji: '🌸',
                  numero: pendentes.length,
                  label: 'Pendentes',
                },
                {
                  emoji: '📊',
                  numero: `${porcentagem}%`,
                  label: 'Progresso',
                },
              ].map(item => (
                <View
                  key={item.label}
                  style={[
                    styles.resumoCard,
                    cardSuave,
                    {
                      padding: pequena ? 8 : 13,
                    },
                  ]}
                >
                  <Text
                    style={{
                      fontSize: fonte(24),
                    }}
                  >
                    {item.emoji}
                  </Text>

                  <Text
                    style={{
                      color: cores.texto,
                      fontSize: fonte(
                        pequena ? 22 : 27
                      ),
                      fontWeight: '900',
                      marginTop: 9,
                    }}
                  >
                    {item.numero}
                  </Text>

                  <Text
                    style={{
                      color: cores.secundario,
                      fontSize: fonte(
                        pequena ? 10 : 12
                      ),
                      fontWeight: '700',
                      marginTop: 5,
                      textAlign: 'center',
                    }}
                  >
                    {item.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* BEM-ESTAR DIÁRIO */}

          <View style={styles.secao}>
            <Text
              style={[
                styles.etiqueta,
                { color: cores.primario },
              ]}
            >
              BEM-ESTAR DIÁRIO
            </Text>

            <Text style={titulo}>
              Como está seu dia?
            </Text>

            <Text
              style={[
                descricao,
                styles.subsecao,
              ]}
            >
              Seu bem-estar merece atenção.
            </Text>

            {/* CARTÃO DE ÁGUA */}

            <TouchableOpacity
              onPress={() =>
                router.push('/agua')
              }
              activeOpacity={0.85}
              style={[
                styles.bemEstar,
                card,
              ]}
            >
              <View
                style={[
                  styles.icone,
                  {
                    backgroundColor: cores.suave,
                    borderRadius: raioMenor,
                  },
                ]}
              >
                <Text style={styles.emoji}>
                  💧
                </Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: cores.texto,
                    fontSize: fonte(18),
                    fontWeight: '800',
                  }}
                >
                  Minha hidratação
                </Text>

                {carregandoResumo ? (
                  <ActivityIndicator
                    color={cores.primario}
                    style={{
                      alignSelf: 'flex-start',
                      marginTop: 12,
                    }}
                  />
                ) : (
                  <>
                    <Text
                      style={{
                        color: cores.primario,
                        fontSize: fonte(17),
                        fontWeight: '900',
                        marginTop: 9,
                      }}
                    >
                      {formatarAgua(aguaHoje)}
                      {' / '}
                      {formatarAgua(metaAgua)}
                    </Text>

                    <View
                      style={[
                        styles.barra,
                        {
                          backgroundColor:
                            cores.suave,
                        },
                      ]}
                    >
                      <View
                        style={{
                          width:
                            `${porcentagemAgua}%` as `${number}%`,
                          height: '100%',
                          borderRadius: 20,
                          backgroundColor:
                            cores.primario,
                        }}
                      />
                    </View>

                    <Text
                      style={{
                        color: cores.secundario,
                        fontSize: fonte(12),
                        marginTop: 9,
                      }}
                    >
                      {aguaHoje >= metaAgua
                        ? '🎉 Meta de hoje atingida!'
                        : `Faltam ${formatarAgua(
                            Math.max(
                              0,
                              metaAgua - aguaHoje
                            )
                          )} para sua meta.`}
                    </Text>
                  </>
                )}

                <Text
                  style={[
                    styles.link,
                    {
                      color: cores.primario,
                      fontSize: fonte(13),
                    },
                  ]}
                >
                  Registrar água →
                </Text>
              </View>
            </TouchableOpacity>

            {/* CARTÃO DE HUMOR */}

            <TouchableOpacity
              onPress={() =>
                router.push('/humor')
              }
              activeOpacity={0.85}
              style={[
                styles.bemEstar,
                card,
              ]}
            >
              <View
                style={[
                  styles.icone,
                  {
                    backgroundColor: cores.suave,
                    borderRadius: raioMenor,
                  },
                ]}
              >
                <Text style={styles.emoji}>
                  {humor?.emoji || '💗'}
                </Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: cores.texto,
                    fontSize: fonte(18),
                    fontWeight: '800',
                  }}
                >
                  Meu humor
                </Text>

                {carregandoResumo ? (
                  <ActivityIndicator
                    color={cores.primario}
                    style={{
                      alignSelf: 'flex-start',
                      marginTop: 12,
                    }}
                  />
                ) : humor ? (
                  <>
                    <Text
                      style={{
                        color: cores.primario,
                        fontSize: fonte(17),
                        fontWeight: '900',
                        marginTop: 9,
                      }}
                    >
                      Hoje você está:{' '}
                      {humor.nome.toLowerCase()}
                    </Text>

                    {humorHoje?.observacao ? (
                      <Text
                        numberOfLines={2}
                        style={[
                          descricao,
                          { marginTop: 7 },
                        ]}
                      >
                        {humorHoje.observacao}
                      </Text>
                    ) : null}

                    <Text
                      style={[
                        descricao,
                        { marginTop: 6 },
                      ]}
                    >
                      Seu sentimento de hoje já foi registrado. 💜
                    </Text>
                  </>
                ) : (
                  <Text
                    style={[
                      descricao,
                      { marginTop: 9 },
                    ]}
                  >
                    Você ainda não registrou como está se sentindo hoje.
                  </Text>
                )}

                <Text
                  style={[
                    styles.link,
                    {
                      color: cores.primario,
                      fontSize: fonte(13),
                    },
                  ]}
                >
                  {humor
                    ? 'Ver ou atualizar meu humor →'
                    : 'Registrar meu humor →'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* PROGRESSO DA ROTINA */}

          <View
            style={[
              styles.card,
              card,
            ]}
          >
            <Text
              style={{
                color: cores.texto,
                fontSize: fonte(19),
                fontWeight: '800',
              }}
            >
              🌷 Seu progresso diário
            </Text>

            <Text
              style={[
                descricao,
                { marginTop: 9 },
              ]}
            >
              {mensagem}
            </Text>

            <View
              style={[
                styles.barra,
                {
                  backgroundColor: cores.suave,
                  marginTop: 20,
                  height: 13,
                },
              ]}
            >
              <View
                style={{
                  width:
                    `${porcentagem}%` as `${number}%`,
                  height: '100%',
                  borderRadius: 20,
                  backgroundColor: cores.primario,
                }}
              />
            </View>

            <View style={styles.progressoRodape}>
              <Text
                style={{
                  color: cores.secundario,
                  fontSize: fonte(13),
                }}
              >
                {concluidas} de {total} atividades
              </Text>

              <Text
                style={{
                  color: cores.primario,
                  fontSize: fonte(15),
                  fontWeight: '900',
                }}
              >
                {porcentagem}%
              </Text>
            </View>
          </View>

          {/* SEQUÊNCIA DE DIAS */}

          <TouchableOpacity
            onPress={() =>
              router.push('/evolucao')
            }
            style={[
              styles.sequencia,
              cardSuave,
            ]}
          >
            <Text style={{ fontSize: 32 }}>
              🔥
            </Text>

            <View
              style={{
                flex: 1,
                marginLeft: 14,
              }}
            >
              <Text
                style={[
                  styles.etiqueta,
                  { color: cores.primario },
                ]}
              >
                SUA CONSTÂNCIA
              </Text>

              <Text
                style={{
                  color: cores.texto,
                  fontSize: fonte(18),
                  fontWeight: '800',
                }}
              >
                {sequenciaDias}{' '}
                {sequenciaDias === 1
                  ? 'dia de autocuidado'
                  : 'dias de autocuidado'}
              </Text>

              <Text
                style={[
                  descricao,
                  { marginTop: 6 },
                ]}
              >
                {sequenciaDias > 0
                  ? 'Sua sequência de dias com atividades concluídas.'
                  : 'Conclua uma atividade para começar sua sequência.'}
              </Text>
            </View>

            <Text
              style={{
                color: cores.primario,
                fontSize: 27,
              }}
            >
              ›
            </Text>
          </TouchableOpacity>

          {/* CHECKLIST RÁPIDO */}

          <View style={styles.secao}>
            <Text
              style={[
                styles.etiqueta,
                { color: cores.primario },
              ]}
            >
              PEQUENOS PASSOS
            </Text>

            <View style={styles.tituloLinha}>
              <Text
                style={[
                  titulo,
                  { flex: 1 },
                ]}
              >
                Próximos cuidados
              </Text>

              <TouchableOpacity
                onPress={() =>
                  router.push('/rotina')
                }
              >
                <Text
                  style={{
                    color: cores.primario,
                    fontSize: fonte(13),
                    fontWeight: '800',
                  }}
                >
                  Ver tudo →
                </Text>
              </TouchableOpacity>
            </View>

            <Text
              style={[
                descricao,
                styles.subsecao,
              ]}
            >
              Marque suas atividades sem sair da tela inicial.
            </Text>

            {pendentes.length ? (
              pendentes
                .slice(0, 3)
                .map(atividade => (
                  <TouchableOpacity
                    key={atividade.id}
                    onPress={() =>
                      alternarAtividade(
                        atividade.id
                      )
                    }
                    accessibilityRole="checkbox"
                    accessibilityState={{
                      checked:
                        atividade.concluida,
                    }}
                    accessibilityLabel={
                      `Concluir ${atividade.nome}`
                    }
                    style={[
                      styles.atividade,
                      card,
                    ]}
                  >
                    <View
                      style={[
                        styles.icone,
                        {
                          backgroundColor:
                            cores.suave,
                          borderRadius:
                            raioMenor,
                        },
                      ]}
                    >
                      <Text
                        style={{
                          fontSize: 25,
                        }}
                      >
                        {atividade.icone}
                      </Text>
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          color: cores.texto,
                          fontSize: fonte(16),
                          fontWeight: '800',
                        }}
                      >
                        {atividade.nome}
                      </Text>

                      <Text
                        style={{
                          color: cores.secundario,
                          fontSize: fonte(13),
                          marginTop: 5,
                        }}
                      >
                        🕒 {atividade.horario}
                      </Text>

                      {!!atividade.categoria && (
                        <Text
                          style={{
                            color: cores.primario,
                            fontSize: fonte(12),
                            marginTop: 5,
                          }}
                        >
                          {atividade.categoria}
                        </Text>
                      )}
                    </View>

                    <View
                      style={[
                        styles.checkbox,
                        {
                          borderColor:
                            cores.primario,
                          borderRadius:
                            raioMenor,
                        },
                      ]}
                    >
                      <Text
                        style={{
                          color: cores.primario,
                          fontSize: 18,
                          fontWeight: '900',
                        }}
                      >
                        ✓
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))
            ) : (
              <View
                style={[
                  styles.vazio,
                  cardSuave,
                ]}
              >
                <Text style={{ fontSize: 35 }}>
                  {total ? '🎉' : '🌷'}
                </Text>

                <Text
                  style={{
                    color: cores.texto,
                    fontSize: fonte(19),
                    fontWeight: '800',
                    textAlign: 'center',
                    marginTop: 10,
                  }}
                >
                  {total
                    ? 'Tudo concluído!'
                    : 'Sua rotina está esperando'}
                </Text>

                <Text
                  style={[
                    descricao,
                    {
                      textAlign: 'center',
                      marginTop: 9,
                    },
                  ]}
                >
                  {total
                    ? 'Você concluiu todos os cuidados de hoje. Aproveite essa conquista!'
                    : 'Personalize suas atividades para começar sua jornada.'}
                </Text>

                {!total && (
                  <TouchableOpacity
                    onPress={() =>
                      router.push(
                        '/questionario'
                      )
                    }
                    style={[
                      styles.botaoAcao,
                      {
                        backgroundColor:
                          cores.primario,
                        borderRadius:
                          raioMenor,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color:
                          cores.textoBotao,
                        fontWeight: '800',
                      }}
                    >
                      Personalizar rotina →
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {pendentes.length > 3 && (
              <Text
                style={[
                  descricao,
                  {
                    textAlign: 'center',
                    marginTop: 12,
                  },
                ]}
              >
                + {pendentes.length - 3} atividades
                pendentes na sua rotina
              </Text>
            )}
          </View>

          {/* ATALHOS */}

          <View style={styles.secao}>
            <Text
              style={[
                styles.etiqueta,
                { color: cores.primario },
              ]}
            >
              EXPLORE SEU APLICATIVO
            </Text>

            <Text style={titulo}>
              Seu espaço de autocuidado
            </Text>

            <Text
              style={[
                descricao,
                styles.subsecao,
              ]}
            >
              Tudo o que você precisa em um só lugar.
            </Text>

            <View style={styles.atalhos}>
              {ATALHOS.map(atalho => (
                <TouchableOpacity
                  key={atalho.id}
                  onPress={() =>
                    router.push(
                      atalho.rota as any
                    )
                  }
                  style={[
                    styles.atalho,
                    card,
                    {
                      width: pequena
                        ? '100%'
                        : '48%',
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.icone,
                      {
                        backgroundColor:
                          cores.suave,
                        borderRadius:
                          raioMenor,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        fontSize: 27,
                      }}
                    >
                      {atalho.emoji}
                    </Text>
                  </View>

                  <Text
                    style={{
                      color: cores.texto,
                      fontSize: fonte(16),
                      fontWeight: '800',
                      marginTop: 12,
                    }}
                  >
                    {atalho.titulo}
                  </Text>

                  <Text
                    style={[
                      descricao,
                      { marginTop: 6 },
                    ]}
                  >
                    {atalho.descricao}
                  </Text>

                  <Text
                    style={[
                      styles.link,
                      {
                        color: cores.primario,
                        fontSize: fonte(13),
                      },
                    ]}
                  >
                    Acessar →
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* DICAS PERSONALIZADAS */}

          <View style={styles.secao}>
            <Text
              style={[
                styles.etiqueta,
                { color: cores.primario },
              ]}
            >
              FEITO PARA VOCÊ
            </Text>

            <Text style={titulo}>
              Suas dicas de autocuidado
            </Text>

            <Text
              style={[
                descricao,
                styles.subsecao,
              ]}
            >
              Sugestões alinhadas às suas respostas.
            </Text>

            {!respostas ? (
              <View
                style={[
                  styles.card,
                  card,
                ]}
              >
                <Text style={{ fontSize: 28 }}>
                  💜
                </Text>

                <Text
                  style={{
                    color: cores.texto,
                    fontSize: fonte(17),
                    fontWeight: '800',
                    marginTop: 10,
                  }}
                >
                  Vamos personalizar seu cuidado?
                </Text>

                <Text
                  style={[
                    descricao,
                    { marginTop: 8 },
                  ]}
                >
                  Responda ao questionário sobre seus hábitos para receber dicas mais adequadas ao seu dia a dia.
                </Text>

                <TouchableOpacity
                  onPress={() =>
                    router.push(
                      '/questionario'
                    )
                  }
                  style={[
                    styles.botaoAcao,
                    {
                      backgroundColor:
                        cores.primario,
                      borderRadius:
                        raioMenor,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: cores.textoBotao,
                      fontWeight: '800',
                    }}
                  >
                    Responder questionário →
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {dicasPersonalizadas.length ? (
                  dicasPersonalizadas
                    .slice(0, 3)
                    .map((dica, indice) => (
                      <View
                        key={`${indice}-${dica}`}
                        style={[
                          styles.dica,
                          card,
                        ]}
                      >
                        <Text
                          style={{
                            fontSize: 25,
                            marginRight: 13,
                          }}
                        >
                          {
                            ['💧', '🌙', '🧘'][
                              indice % 3
                            ]
                          }
                        </Text>

                        <View style={{ flex: 1 }}>
                          <Text
                            style={{
                              color: cores.primario,
                              fontSize: fonte(12),
                              fontWeight: '800',
                            }}
                          >
                            SUGESTÃO {indice + 1}
                          </Text>

                          <Text
                            style={{
                              color: cores.texto,
                              fontSize: fonte(15),
                              lineHeight: fonte(23),
                              marginTop: 7,
                            }}
                          >
                            {dica}
                          </Text>
                        </View>
                      </View>
                    ))
                ) : (
                  <View
                    style={[
                      styles.card,
                      card,
                    ]}
                  >
                    <Text style={descricao}>
                      Continue descobrindo os hábitos que fazem bem a você. 🌷
                    </Text>
                  </View>
                )}

                {/* SEM LINK PARA MEU ESPAÇO */}

                <View style={styles.linksDicas}>
                  <TouchableOpacity
                    onPress={() =>
                      router.push(
                        '/questionario'
                      )
                    }
                  >
                    <Text
                      style={{
                        color: cores.primario,
                        fontWeight: '800',
                      }}
                    >
                      Atualizar respostas →
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>

          {/* MENSAGEM FINAL */}

          <View
            style={[
              styles.mensagemFinal,
              cardSuave,
            ]}
          >
            <Text style={{ fontSize: 29 }}>
              💗
            </Text>

            <View
              style={{
                flex: 1,
                marginLeft: 12,
              }}
            >
              <Text
                style={{
                  color: cores.texto,
                  fontSize: fonte(18),
                  fontWeight: '800',
                }}
              >
                Um lembrete para {nome || 'você'}
              </Text>

              <Text
                style={[
                  descricao,
                  { marginTop: 8 },
                ]}
              >
                {mensagem} Você não precisa fazer tudo perfeitamente. O importante é cuidar de si com carinho.
              </Text>
            </View>
          </View>

          {/* CONFIGURAÇÕES */}

          <TouchableOpacity
            onPress={() =>
              router.push(
                '/configuracoes'
              )
            }
            style={[
              styles.configuracoes,
              {
                backgroundColor:
                  cores.primario,
                borderRadius:
                  raioCartao,
              },
            ]}
          >
            <Text
              style={{
                color: cores.textoBotao,
                fontSize: fonte(15),
                fontWeight: '800',
                textAlign: 'center',
              }}
            >
              🎨 Personalizar meu aplicativo →
            </Text>
          </TouchableOpacity>

          {/* RODAPÉ */}

          <Text
            style={{
              color: cores.secundario,
              fontSize: fonte(11),
              textAlign: 'center',
              marginTop: 25,
            }}
          >
            MEUAUTOCUIDADO • SEU BEM-ESTAR IMPORTA
          </Text>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ============================================
// ESTILOS
// ============================================

const styles = StyleSheet.create({
  tela: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 18,
    paddingTop: 24,
    paddingBottom: 50,
    alignItems: 'center',
  },
  conteudo: {
    width: '100%',
    maxWidth: 850,
  },
  cabecalho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  etiqueta: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.6,
    marginBottom: 9,
  },
  avatar: {
    width: 60,
    height: 60,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  destaque: {
    padding: 25,
    marginBottom: 30,
    elevation: 3,
  },
  botaoClaro: {
    alignSelf: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginTop: 23,
  },
  secao: {
    marginBottom: 30,
  },
  subsecao: {
    marginTop: 8,
    marginBottom: 18,
  },
  resumoLinha: {
    flexDirection: 'row',
    gap: 9,
  },
  resumoCard: {
    flex: 1,
    minWidth: 0,
    borderWidth: 1,
    alignItems: 'center',
    paddingVertical: 15,
  },
  bemEstar: {
    borderWidth: 1,
    padding: 17,
    marginBottom: 13,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  icone: {
    width: 54,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  emoji: {
    fontSize: 28,
  },
  barra: {
    height: 10,
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: 12,
  },
  link: {
    fontWeight: '800',
    marginTop: 13,
  },
  card: {
    borderWidth: 1,
    padding: 20,
    marginBottom: 17,
  },
  progressoRodape: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 13,
  },
  sequencia: {
    borderWidth: 1,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  tituloLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  atividade: {
    borderWidth: 1,
    padding: 15,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 28,
    height: 28,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  vazio: {
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
  },
  botaoAcao: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    marginTop: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  atalhos: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 14,
    marginTop: 8,
  },
  atalho: {
    borderWidth: 1,
    padding: 17,
  },
  dica: {
    borderWidth: 1,
    padding: 18,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  linksDicas: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    marginTop: 12,
  },
  mensagemFinal: {
    borderWidth: 1,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  configuracoes: {
    padding: 19,
  },
});
