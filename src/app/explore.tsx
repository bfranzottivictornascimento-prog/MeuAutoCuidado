
import React, { useState } from 'react';
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
import { useAutocuidado } from './AutocuidadoContext';

type Conteudo = {
  id: string;
  titulo: string;
  descricao: string;
  emoji: string;
  categoria: string;
  dicas: string[];
};

const CONTEUDOS: Conteudo[] = [
  {
    id: 'sono',
    titulo: 'Uma noite mais tranquila',
    descricao:
      'Pequenos hábitos podem ajudar você a descansar melhor.',
    emoji: '🌙',
    categoria: 'Descanso',
    dicas: [
      'Procure manter horários parecidos para dormir e acordar.',
      'Diminua o uso de telas antes de dormir.',
      'Crie um ambiente confortável e tranquilo.',
      'Reserve alguns minutos para desacelerar.',
    ],
  },
  {
    id: 'hidratacao',
    titulo: 'Hidratação no dia a dia',
    descricao:
      'Cuidar da hidratação também faz parte do autocuidado.',
    emoji: '💧',
    categoria: 'Bem-estar',
    dicas: [
      'Mantenha uma garrafinha de água por perto.',
      'Beba água ao longo do dia.',
      'Associe o hábito a momentos da sua rotina.',
      'Observe os sinais de sede do seu corpo.',
    ],
  },
  {
    id: 'autoestima',
    titulo: 'Carinho com você mesma',
    descricao:
      'Sua autoestima merece atenção e respeito.',
    emoji: '💗',
    categoria: 'Emocional',
    dicas: [
      'Reconheça uma qualidade sua todos os dias.',
      'Evite se comparar constantemente com outras pessoas.',
      'Reserve tempo para atividades de que você gosta.',
      'Valorize suas conquistas, mesmo as pequenas.',
    ],
  },
  {
    id: 'movimento',
    titulo: 'Movimente-se no seu ritmo',
    descricao:
      'Movimento não precisa ser complicado para fazer parte do seu dia.',
    emoji: '🧘',
    categoria: 'Bem-estar',
    dicas: [
      'Faça uma caminhada leve quando possível.',
      'Alongue-se durante pequenas pausas.',
      'Escolha atividades de que você realmente goste.',
      'Respeite seus limites e sua disposição.',
    ],
  },
  {
    id: 'organizacao',
    titulo: 'Uma rotina mais leve',
    descricao:
      'Organizar o dia pode ajudar a reduzir a sensação de correria.',
    emoji: '📝',
    categoria: 'Rotina',
    dicas: [
      'Escolha até três prioridades para o dia.',
      'Divida tarefas grandes em passos menores.',
      'Inclua momentos de descanso no planejamento.',
      'Evite cobrar perfeição de si mesma.',
    ],
  },
  {
    id: 'relaxamento',
    titulo: 'Um momento de tranquilidade',
    descricao:
      'Pausas conscientes podem ajudar você a desacelerar.',
    emoji: '🦋',
    categoria: 'Emocional',
    dicas: [
      'Faça uma pausa em um lugar confortável.',
      'Respire de forma lenta e natural.',
      'Observe o ambiente ao seu redor.',
      'Volte às atividades quando se sentir pronta.',
    ],
  },
  {
    id: 'pele',
    titulo: 'Cuidados simples com a pele',
    descricao:
      'Uma rotina básica e consistente pode ser suficiente.',
    emoji: '🧴',
    categoria: 'Beleza',
    dicas: [
      'Limpe a pele de maneira suave.',
      'Escolha produtos adequados ao seu tipo de pele.',
      'Use proteção solar conforme a orientação do produto.',
      'Evite testar muitos produtos novos ao mesmo tempo.',
    ],
  },
  {
    id: 'lazer',
    titulo: 'Tempo para fazer o que gosta',
    descricao:
      'Momentos de lazer também são importantes.',
    emoji: '🎨',
    categoria: 'Rotina',
    dicas: [
      'Ouça uma música de que você gosta.',
      'Leia algumas páginas de um livro.',
      'Explore uma atividade criativa.',
      'Permita-se descansar sem sentir culpa.',
    ],
  },
];

const CATEGORIAS = [
  'Todos',
  'Bem-estar',
  'Emocional',
  'Descanso',
  'Rotina',
  'Beleza',
];

const ACESSOS = [
  {
    id: 'espaco',
    titulo: 'Meu Espaço',
    emoji: '🌷',
    descricao: 'Mais dicas de autocuidado',
    rota: '/meu-espaco',
  },
  {
    id: 'diario',
    titulo: 'Meu Diário',
    emoji: '📖',
    descricao: 'Registre seus sentimentos',
    rota: '/diario',
  },
  {
    id: 'relaxamento',
    titulo: 'Relaxamento',
    emoji: '🦋',
    descricao: 'Exercícios de respiração',
    rota: '/relaxamento',
  },
  {
    id: 'rotina',
    titulo: 'Minha Rotina',
    emoji: '✅',
    descricao: 'Seus cuidados diários',
    rota: '/rotina',
  },
];

export default function Explorar() {
  const {
    usuario,
    respostas,
    dicasPersonalizadas,
    progresso,
    concluidas,
    atividades,
    cores,
    preferencias,
    raioCartao,
    escalaFonte,
  } = useAutocuidado();

  const [categoria, setCategoria] = useState('Todos');
  const [abertos, setAbertos] = useState<string[]>([]);

  const escuro =
    preferencias.modoNoturno ||
    preferencias.tema === 'noite';

  const fonte = (tamanho: number) =>
    Math.round(tamanho * escalaFonte);

  const raioMenor = Math.max(6, raioCartao - 8);

  const nome =
    usuario?.nome?.trim().split(' ')[0] || '';

  const conteudosFiltrados =
    categoria === 'Todos'
      ? CONTEUDOS
      : CONTEUDOS.filter(
          item => item.categoria === categoria
        );

  const card = {
    backgroundColor: cores.card,
    borderColor: cores.borda,
    borderRadius: raioCartao,
  };

  const cardSuave = {
    backgroundColor: cores.suave,
    borderRadius: raioMenor,
  };

  const progressoSeguro = Math.min(
    100,
    Math.max(0, Number(progresso) || 0)
  );

  function alternarConteudo(id: string) {
    setAbertos(anterior =>
      anterior.includes(id)
        ? anterior.filter(item => item !== id)
        : [...anterior, id]
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
            <View style={styles.cabecalhoTexto}>
              <Text
                style={[
                  styles.etiqueta,
                  {
                    color: cores.primario,
                    fontSize: fonte(11),
                  },
                ]}
              >
                DESCUBRA NOVOS CUIDADOS
              </Text>

              <Text
                style={[
                  styles.titulo,
                  {
                    color: cores.texto,
                    fontSize: fonte(30),
                  },
                ]}
              >
                Descobrir ✨
              </Text>

              <Text
                style={[
                  styles.subtitulo,
                  {
                    color: cores.secundario,
                    fontSize: fonte(14),
                    lineHeight: fonte(14) + 8,
                  },
                ]}
              >
                {nome
                  ? `${nome}, explore novas formas de cuidar de você.`
                  : 'Explore novas formas de cuidar de você.'}
              </Text>
            </View>

            <View
              style={[
                styles.cabecalhoIcone,
                cardSuave,
              ]}
            >
              <Text style={styles.cabecalhoEmoji}>
                🌷
              </Text>
            </View>
          </View>

          {/* DESTAQUE */}
          <View
            style={[
              styles.cardPrincipal,
              {
                backgroundColor: cores.primario,
                borderRadius: raioCartao,
              },
            ]}
          >
            <View
              style={[
                styles.selo,
                {
                  backgroundColor: cores.card,
                  borderRadius: raioMenor,
                },
              ]}
            >
              <Text
                style={[
                  styles.seloTexto,
                  {
                    color: cores.primario,
                    fontSize: fonte(11),
                  },
                ]}
              >
                💜 UM MOMENTO PARA VOCÊ
              </Text>
            </View>

            <Text
              style={[
                styles.cardPrincipalTitulo,
                {
                  color: cores.textoBotao,
                  fontSize: fonte(27),
                  lineHeight: fonte(27) + 9,
                },
              ]}
            >
              Descubra o que faz bem a você.
            </Text>

            <Text
              style={[
                styles.cardPrincipalDescricao,
                {
                  color: cores.textoBotao,
                  fontSize: fonte(14),
                  lineHeight: fonte(14) + 9,
                },
              ]}
            >
              O autocuidado pode estar nos pequenos
              momentos do dia. Encontre ideias,
              hábitos e atividades para incluir
              na sua rotina.
            </Text>

            <TouchableOpacity
              style={[
                styles.botaoPrincipal,
                {
                  backgroundColor: cores.card,
                  borderRadius: raioMenor,
                },
              ]}
              onPress={() =>
                router.push('/meu-espaco')
              }
              activeOpacity={0.85}
              accessibilityRole="button"
            >
              <Text
                style={[
                  styles.botaoPrincipalTexto,
                  {
                    color: cores.primario,
                    fontSize: fonte(14),
                  },
                ]}
              >
                Explorar meu espaço →
              </Text>
            </TouchableOpacity>
          </View>

          {/* PROGRESSO */}
          <TouchableOpacity
            style={[
              styles.progressoCard,
              card,
            ]}
            onPress={() =>
              router.push('/evolucao')
            }
            activeOpacity={0.85}
            accessibilityRole="button"
          >
            <View style={styles.progressoTopo}>
              <View
                style={[
                  styles.progressoIcone,
                  cardSuave,
                ]}
              >
                <Text style={styles.progressoEmoji}>
                  📊
                </Text>
              </View>

              <View style={styles.progressoInfo}>
                <Text
                  style={[
                    styles.progressoTitulo,
                    {
                      color: cores.texto,
                      fontSize: fonte(15),
                    },
                  ]}
                >
                  Seu cuidado de hoje
                </Text>

                <Text
                  style={[
                    styles.progressoDescricao,
                    {
                      color: cores.secundario,
                      fontSize: fonte(13),
                      lineHeight: fonte(13) + 7,
                    },
                  ]}
                >
                  {concluidas} de {atividades.length}{' '}
                  atividades concluídas
                </Text>
              </View>

              <Text
                style={[
                  styles.progressoNumero,
                  {
                    color: cores.primario,
                    fontSize: fonte(17),
                  },
                ]}
              >
                {progressoSeguro}%
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
                    width: `${progressoSeguro}%`,
                  },
                ]}
              />
            </View>

            <Text
              style={[
                styles.verEvolucao,
                {
                  color: cores.primario,
                  fontSize: fonte(12),
                },
              ]}
            >
              Ver minha evolução →
            </Text>
          </TouchableOpacity>

          {/* DICAS PERSONALIZADAS */}
          <View style={styles.secao}>
            <Text
              style={[
                styles.etiquetaSecao,
                {
                  color: cores.primario,
                  fontSize: fonte(11),
                },
              ]}
            >
              FEITO PARA VOCÊ
            </Text>

            <Text
              style={[
                styles.secaoTitulo,
                {
                  color: cores.texto,
                  fontSize: fonte(22),
                },
              ]}
            >
              Recomendações especiais 💗
            </Text>

            <Text
              style={[
                styles.secaoDescricao,
                {
                  color: cores.secundario,
                  fontSize: fonte(14),
                  lineHeight: fonte(14) + 9,
                },
              ]}
            >
              Sugestões relacionadas aos seus hábitos
              e objetivos.
            </Text>

            {!respostas ? (
              <View
                style={[
                  styles.conviteCard,
                  card,
                ]}
              >
                <Text style={styles.conviteEmoji}>
                  💜
                </Text>

                <View style={styles.conviteConteudo}>
                  <Text
                    style={[
                      styles.conviteTitulo,
                      {
                        color: cores.texto,
                        fontSize: fonte(16),
                      },
                    ]}
                  >
                    Vamos personalizar suas dicas?
                  </Text>

                  <Text
                    style={[
                      styles.conviteDescricao,
                      {
                        color: cores.secundario,
                        fontSize: fonte(13),
                        lineHeight: fonte(13) + 8,
                      },
                    ]}
                  >
                    Responda ao questionário para
                    receber sugestões pensadas para você.
                  </Text>

                  <TouchableOpacity
                    style={[
                      styles.conviteBotao,
                      {
                        backgroundColor: cores.primario,
                        borderRadius: raioMenor,
                      },
                    ]}
                    onPress={() =>
                      router.push('/questionario')
                    }
                    activeOpacity={0.85}
                  >
                    <Text
                      style={[
                        styles.conviteBotaoTexto,
                        {
                          color: cores.textoBotao,
                          fontSize: fonte(13),
                        },
                      ]}
                    >
                      Responder questionário →
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : dicasPersonalizadas.length > 0 ? (
              dicasPersonalizadas
                .slice(0, 3)
                .map((dica, indice) => (
                  <View
                    key={`${indice}-${dica}`}
                    style={[
                      styles.dicaCard,
                      card,
                    ]}
                  >
                    <View
                      style={[
                        styles.dicaIcone,
                        cardSuave,
                      ]}
                    >
                      <Text style={styles.dicaEmoji}>
                        {
                          ['🌸', '💧', '🌙'][
                            indice % 3
                          ]
                        }
                      </Text>
                    </View>

                    <View style={styles.dicaInfo}>
                      <Text
                        style={[
                          styles.dicaEtiqueta,
                          {
                            color: cores.primario,
                            fontSize: fonte(11),
                          },
                        ]}
                      >
                        SUGESTÃO {indice + 1}
                      </Text>

                      <Text
                        style={[
                          styles.dicaTexto,
                          {
                            color: cores.texto,
                            fontSize: fonte(14),
                            lineHeight: fonte(14) + 9,
                          },
                        ]}
                      >
                        {dica}
                      </Text>
                    </View>
                  </View>
                ))
            ) : (
              <View
                style={[
                  styles.dicaCard,
                  card,
                ]}
              >
                <Text
                  style={[
                    styles.dicaTexto,
                    {
                      color: cores.texto,
                      fontSize: fonte(14),
                    },
                  ]}
                >
                  🌷 Descubra novos hábitos de
                  autocuidado no seu ritmo.
                </Text>
              </View>
            )}
          </View>

          {/* BIBLIOTECA DE CONTEÚDOS */}
          <View style={styles.secao}>
            <Text
              style={[
                styles.etiquetaSecao,
                {
                  color: cores.primario,
                  fontSize: fonte(11),
                },
              ]}
            >
              BIBLIOTECA DE BEM-ESTAR
            </Text>

            <Text
              style={[
                styles.secaoTitulo,
                {
                  color: cores.texto,
                  fontSize: fonte(22),
                },
              ]}
            >
              Aprenda a cuidar de você
            </Text>

            <Text
              style={[
                styles.secaoDescricao,
                {
                  color: cores.secundario,
                  fontSize: fonte(14),
                  lineHeight: fonte(14) + 9,
                },
              ]}
            >
              Escolha um tema e veja sugestões
              simples para o seu dia a dia.
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={
                styles.categoriasContainer
              }
            >
              {CATEGORIAS.map(item => {
                const selecionada =
                  categoria === item;

                return (
                  <TouchableOpacity
                    key={item}
                    style={[
                      styles.categoriaBotao,
                      {
                        backgroundColor: selecionada
                          ? cores.primario
                          : cores.card,
                        borderColor: selecionada
                          ? cores.primario
                          : cores.borda,
                        borderRadius: raioMenor,
                      },
                    ]}
                    onPress={() =>
                      setCategoria(item)
                    }
                    activeOpacity={0.85}
                    accessibilityRole="button"
                    accessibilityState={{
                      selected: selecionada,
                    }}
                  >
                    <Text
                      style={[
                        styles.categoriaTexto,
                        {
                          color: selecionada
                            ? cores.textoBotao
                            : cores.texto,
                          fontSize: fonte(13),
                        },
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {conteudosFiltrados.map(conteudo => {
              const aberto = abertos.includes(
                conteudo.id
              );

              return (
                <View
                  key={conteudo.id}
                  style={[
                    styles.conteudoCard,
                    card,
                  ]}
                >
                  <TouchableOpacity
                    style={styles.conteudoCabecalho}
                    onPress={() =>
                      alternarConteudo(conteudo.id)
                    }
                    activeOpacity={0.85}
                    accessibilityRole="button"
                    accessibilityState={{
                      expanded: aberto,
                    }}
                  >
                    <View
                      style={[
                        styles.conteudoIcone,
                        cardSuave,
                      ]}
                    >
                      <Text
                        style={styles.conteudoEmoji}
                      >
                        {conteudo.emoji}
                      </Text>
                    </View>

                    <View style={styles.conteudoInfo}>
                      <Text
                        style={[
                          styles.conteudoCategoria,
                          {
                            color: cores.primario,
                            fontSize: fonte(11),
                          },
                        ]}
                      >
                        {conteudo.categoria.toUpperCase()}
                      </Text>

                      <Text
                        style={[
                          styles.conteudoTitulo,
                          {
                            color: cores.texto,
                            fontSize: fonte(16),
                          },
                        ]}
                      >
                        {conteudo.titulo}
                      </Text>

                      <Text
                        style={[
                          styles.conteudoDescricao,
                          {
                            color: cores.secundario,
                            fontSize: fonte(13),
                            lineHeight: fonte(13) + 8,
                          },
                        ]}
                      >
                        {conteudo.descricao}
                      </Text>
                    </View>

                    <Text
                      style={[
                        styles.conteudoSeta,
                        {
                          color: cores.primario,
                          fontSize: fonte(25),
                        },
                      ]}
                    >
                      {aberto ? '⌃' : '⌄'}
                    </Text>
                  </TouchableOpacity>

                  {aberto && (
                    <View
                      style={[
                        styles.dicasContainer,
                        {
                          borderTopColor: cores.borda,
                          backgroundColor: cores.fundo,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.dicasTitulo,
                          {
                            color: cores.texto,
                            fontSize: fonte(15),
                          },
                        ]}
                      >
                        Dicas para experimentar:
                      </Text>

                      {conteudo.dicas.map(
                        (dica, indice) => (
                          <View
                            key={`${conteudo.id}-${indice}`}
                            style={styles.dicaLinha}
                          >
                            <View
                              style={[
                                styles.dicaPonto,
                                cardSuave,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.dicaPontoTexto,
                                  {
                                    color: cores.primario,
                                    fontSize: fonte(13),
                                  },
                                ]}
                              >
                                ✓
                              </Text>
                            </View>

                            <Text
                              style={[
                                styles.dicaLinhaTexto,
                                {
                                  color: cores.texto,
                                  fontSize: fonte(13),
                                  lineHeight:
                                    fonte(13) + 9,
                                },
                              ]}
                            >
                              {dica}
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

          {/* ACESSOS RÁPIDOS */}
          <View style={styles.secao}>
            <Text
              style={[
                styles.etiquetaSecao,
                {
                  color: cores.primario,
                  fontSize: fonte(11),
                },
              ]}
            >
              CONTINUE SUA JORNADA
            </Text>

            <Text
              style={[
                styles.secaoTitulo,
                {
                  color: cores.texto,
                  fontSize: fonte(22),
                },
              ]}
            >
              Explore mais recursos
            </Text>

            <Text
              style={[
                styles.secaoDescricao,
                {
                  color: cores.secundario,
                  fontSize: fonte(14),
                  lineHeight: fonte(14) + 9,
                },
              ]}
            >
              Seu bem-estar merece atenção
              em diferentes momentos.
            </Text>

            <View style={styles.atalhosGrade}>
              {ACESSOS.map(acesso => (
                <TouchableOpacity
                  key={acesso.id}
                  style={[
                    styles.atalhoCard,
                    card,
                  ]}
                  onPress={() =>
                    router.push(acesso.rota as any)
                  }
                  activeOpacity={0.85}
                  accessibilityRole="button"
                >
                  <View
                    style={[
                      styles.atalhoIcone,
                      cardSuave,
                    ]}
                  >
                    <Text
                      style={styles.atalhoEmoji}
                    >
                      {acesso.emoji}
                    </Text>
                  </View>

                  <Text
                    style={[
                      styles.atalhoTitulo,
                      {
                        color: cores.texto,
                        fontSize: fonte(16),
                      },
                    ]}
                  >
                    {acesso.titulo}
                  </Text>

                  <Text
                    style={[
                      styles.atalhoDescricao,
                      {
                        color: cores.secundario,
                        fontSize: fonte(13),
                        lineHeight: fonte(13) + 8,
                      },
                    ]}
                  >
                    {acesso.descricao}
                  </Text>

                  <Text
                    style={[
                      styles.atalhoLink,
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

          {/* MENSAGEM FINAL */}
          <View
            style={[
              styles.mensagemFinal,
              {
                backgroundColor: cores.suave,
                borderRadius: raioCartao,
              },
            ]}
          >
            <Text style={styles.mensagemEmoji}>
              🌷
            </Text>

            <View style={styles.mensagemConteudo}>
              <Text
                style={[
                  styles.mensagemTitulo,
                  {
                    color: cores.texto,
                    fontSize: fonte(16),
                  },
                ]}
              >
                Seu tempo importa
              </Text>

              <Text
                style={[
                  styles.mensagemTexto,
                  {
                    color: cores.secundario,
                    fontSize: fonte(13),
                    lineHeight: fonte(13) + 9,
                  },
                ]}
              >
                Você não precisa mudar tudo de uma
                vez. Experimente novos hábitos
                com calma e respeite seu ritmo.
              </Text>
            </View>
          </View>

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  container: {
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingTop: 24,
    paddingBottom: 45,
    alignItems: 'center',
  },

  conteudoCentral: {
    width: '100%',
    maxWidth: 850,
  },

  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 25,
  },

  cabecalhoTexto: {
    flex: 1,
    paddingRight: 12,
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

  cabecalhoIcone: {
    width: 57,
    height: 57,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cabecalhoEmoji: {
    fontSize: 29,
  },

  cardPrincipal: {
    padding: 23,
    marginBottom: 24,
    overflow: 'hidden',
    elevation: 3,
  },

  selo: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 18,
  },

  seloTexto: {
    fontWeight: '800',
  },

  cardPrincipalTitulo: {
    fontWeight: '800',
    maxWidth: 540,
  },

  cardPrincipalDescricao: {
    marginTop: 13,
    maxWidth: 570,
  },

  botaoPrincipal: {
    alignSelf: 'flex-start',
    paddingHorizontal: 17,
    paddingVertical: 14,
    marginTop: 22,
  },

  botaoPrincipalTexto: {
    fontWeight: '800',
  },

  progressoCard: {
    borderWidth: 1,
    padding: 18,
    marginBottom: 30,
  },

  progressoTopo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  progressoIcone: {
    width: 47,
    height: 47,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  progressoEmoji: {
    fontSize: 23,
  },

  progressoInfo: {
    flex: 1,
  },

  progressoTitulo: {
    fontWeight: '800',
  },

  progressoDescricao: {
    marginTop: 6,
  },

  progressoNumero: {
    fontWeight: '800',
    marginLeft: 8,
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

  verEvolucao: {
    fontWeight: '800',
    textAlign: 'right',
    marginTop: 13,
  },

  secao: {
    marginBottom: 32,
  },

  etiquetaSecao: {
    fontWeight: '800',
    letterSpacing: 0.9,
    marginBottom: 9,
  },

  secaoTitulo: {
    fontWeight: '800',
  },

  secaoDescricao: {
    marginTop: 9,
    marginBottom: 18,
  },

  conviteCard: {
    flexDirection: 'row',
    borderWidth: 1,
    padding: 18,
  },

  conviteEmoji: {
    fontSize: 27,
    marginRight: 12,
  },

  conviteConteudo: {
    flex: 1,
  },

  conviteTitulo: {
    fontWeight: '800',
  },

  conviteDescricao: {
    marginTop: 9,
  },

  conviteBotao: {
    alignSelf: 'flex-start',
    paddingHorizontal: 13,
    paddingVertical: 12,
    marginTop: 16,
  },

  conviteBotaoTexto: {
    fontWeight: '800',
  },

  dicaCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    padding: 17,
    marginBottom: 12,
  },

  dicaIcone: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  dicaEmoji: {
    fontSize: 24,
  },

  dicaInfo: {
    flex: 1,
  },

  dicaEtiqueta: {
    fontWeight: '800',
    marginBottom: 8,
  },

  dicaTexto: {},

  categoriasContainer: {
    paddingBottom: 17,
    paddingRight: 15,
    gap: 9,
  },

  categoriaBotao: {
    borderWidth: 1,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },

  categoriaTexto: {
    fontWeight: '800',
  },

  conteudoCard: {
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },

  conteudoCabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 17,
  },

  conteudoIcone: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  conteudoEmoji: {
    fontSize: 26,
  },

  conteudoInfo: {
    flex: 1,
  },

  conteudoCategoria: {
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 6,
  },

  conteudoTitulo: {
    fontWeight: '800',
  },

  conteudoDescricao: {
    marginTop: 7,
  },

  conteudoSeta: {
    marginLeft: 8,
    fontWeight: '700',
  },

  dicasContainer: {
    borderTopWidth: 1,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 18,
  },

  dicasTitulo: {
    fontWeight: '800',
    marginBottom: 15,
  },

  dicaLinha: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 13,
  },

  dicaPonto: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  dicaPontoTexto: {
    fontWeight: '800',
  },

  dicaLinhaTexto: {
    flex: 1,
  },

  atalhosGrade: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 4,
  },

  atalhoCard: {
    width: '48%',
    borderWidth: 1,
    padding: 16,
    marginBottom: 13,
    minHeight: 185,
  },

  atalhoIcone: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 13,
  },

  atalhoEmoji: {
    fontSize: 25,
  },

  atalhoTitulo: {
    fontWeight: '800',
  },

  atalhoDescricao: {
    marginTop: 8,
    flexGrow: 1,
  },

  atalhoLink: {
    fontWeight: '800',
    marginTop: 15,
  },

  mensagemFinal: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 19,
  },

  mensagemEmoji: {
    fontSize: 29,
    marginRight: 13,
  },

  mensagemConteudo: {
    flex: 1,
  },

  mensagemTitulo: {
    fontWeight: '800',
    marginBottom: 8,
  },

  mensagemTexto: {},

  rodape: {
    fontWeight: '800',
    letterSpacing: 0.7,
    textAlign: 'center',
    marginTop: 28,
  },
});
