
import React, { useState } from 'react';

import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Alert,
  Platform,
  useWindowDimensions,
} from 'react-native';

import { router } from 'expo-router';

import {
  useAutocuidado,
  TEMAS,
  type TemaId,
  type EstiloCartao,
  type TamanhoFonte,
  type Preferencias,
  type PaletaTema,
} from './AutocuidadoContext';

// ==========================================
// OPÇÕES DE PERSONALIZAÇÃO
// ==========================================

const OPCOES_TEMA: {
  id: TemaId;
  nome: string;
  emoji: string;
  descricao: string;
}[] = [
  {
    id: 'lavanda',
    nome: 'Lavanda',
    emoji: '💜',
    descricao: 'Roxo e lilás',
  },
  {
    id: 'rosa',
    nome: 'Rosa Delicado',
    emoji: '🌸',
    descricao: 'Rosa suave',
  },
  {
    id: 'azul',
    nome: 'Azul Serenidade',
    emoji: '🩵',
    descricao: 'Azul bebê',
  },
  {
    id: 'verde',
    nome: 'Verde Natureza',
    emoji: '🌿',
    descricao: 'Verde menta',
  },
  {
    id: 'bege',
    nome: 'Bege Elegante',
    emoji: '🤎',
    descricao: 'Creme e caramelo',
  },
  {
    id: 'noite',
    nome: 'Noite Premium',
    emoji: '🌙',
    descricao: 'Preto e roxo',
  },
];

const ESTILOS: {
  id: EstiloCartao;
  nome: string;
  descricao: string;
  emoji: string;
}[] = [
  {
    id: 'arredondado',
    nome: 'Arredondado',
    descricao: 'Suave e moderno',
    emoji: '🌷',
  },
  {
    id: 'minimalista',
    nome: 'Minimalista',
    descricao: 'Simples e organizado',
    emoji: '✨',
  },
  {
    id: 'elegante',
    nome: 'Elegante',
    descricao: 'Discreto e sofisticado',
    emoji: '💎',
  },
];

const TAMANHOS: {
  id: TamanhoFonte;
  nome: string;
  descricao: string;
}[] = [
  {
    id: 'normal',
    nome: 'Normal',
    descricao: 'Tamanho padrão',
  },
  {
    id: 'grande',
    nome: 'Grande',
    descricao: 'Leitura confortável',
  },
  {
    id: 'extra',
    nome: 'Extra grande',
    descricao: 'Maior facilidade de leitura',
  },
];

const HORARIOS = [
  '07:00',
  '08:00',
  '09:00',
  '10:00',
  '12:00',
  '14:00',
  '16:00',
  '18:00',
  '20:00',
  '21:00',
];

// ==========================================
// AVISOS
// ==========================================

function mostrarAviso(
  titulo: string,
  mensagem: string
) {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      window.alert(
        `${titulo}\n\n${mensagem}`
      );
    }
  } else {
    Alert.alert(titulo, mensagem);
  }
}

// ==========================================
// COMPONENTE DE PRÉVIA
// ==========================================

type PreviaProps = {
  cores: PaletaTema;
  raio: number;
  escala: number;
};

function PreviaTema({
  cores,
  raio,
  escala,
}: PreviaProps) {
  return (
    <View
      style={[
        styles.previaArea,
        {
          backgroundColor: cores.fundo,
          borderColor: cores.borda,
        },
      ]}
    >
      <Text
        style={[
          styles.previaCabecalho,
          {
            color: cores.texto,
            fontSize: 20 * escala,
          },
        ]}
      >
        MeuAutoCuidado 🌷
      </Text>

      <View
        style={[
          styles.previaCard,
          {
            backgroundColor: cores.card,
            borderColor: cores.borda,
            borderRadius: raio,
          },
        ]}
      >
        <Text
          style={[
            styles.previaSaudacao,
            {
              color: cores.texto,
              fontSize: 17 * escala,
            },
          ]}
        >
          Olá! Que bom ter você aqui 💗
        </Text>

        <Text
          style={[
            styles.previaDescricao,
            {
              color: cores.secundario,
              fontSize: 15 * escala,
            },
          ]}
        >
          Seu progresso de hoje
        </Text>

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
                backgroundColor: cores.primario,
                width: '65%',
              },
            ]}
          />
        </View>

        <Text
          style={[
            styles.previaPorcentagem,
            {
              color: cores.primario,
            },
          ]}
        >
          65% concluído
        </Text>
      </View>

      <View
        style={[
          styles.previaBotao,
          {
            backgroundColor: cores.primario,
            borderRadius: Math.max(
              8,
              raio - 7
            ),
          },
        ]}
      >
        <Text
          style={[
            styles.previaBotaoTexto,
            {
              color: cores.textoBotao,
              fontSize: 16 * escala,
            },
          ]}
        >
          Minha rotina →
        </Text>
      </View>
    </View>
  );
}

// ==========================================
// TELA PRINCIPAL
// ==========================================

export default function Configuracoes() {
  const {
    usuario,
    preferencias,
    atualizarPreferencias,
    cores,
    raioCartao,
    escalaFonte,
  } = useAutocuidado();

  const { width } = useWindowDimensions();

  const telaPequena = width < 390;

  const [salvando, setSalvando] =
    useState(false);

  const escuro =
    preferencias.modoNoturno ||
    preferencias.tema === 'noite';

  // ========================================
  // SALVAR PREFERÊNCIAS
  // ========================================

  async function alterarPreferencia(
    dados: Partial<Preferencias>
  ) {
    if (salvando) return;

    if (!usuario?.email) {
      mostrarAviso(
        'Cadastro necessário',
        'Faça seu cadastro antes de personalizar o aplicativo.'
      );
      return;
    }

    setSalvando(true);

    try {
      await atualizarPreferencias(dados);
    } catch (erro) {
      mostrarAviso(
        'Erro ao salvar',
        'Não foi possível salvar sua preferência. Tente novamente.'
      );
    } finally {
      setSalvando(false);
    }
  }

  async function alterarLembretes(
    ativar: boolean
  ) {
    if (salvando) return;

    if (!usuario?.email) {
      mostrarAviso(
        'Cadastro necessário',
        'Faça seu cadastro primeiro.'
      );
      return;
    }

    setSalvando(true);

    try {
      await atualizarPreferencias({
        lembretesAtivos: ativar,
      });

      if (ativar) {
        mostrarAviso(
          'Preferência salva 💜',
          'Seu horário foi salvo. As notificações automáticas ainda serão implementadas.'
        );
      }
    } catch (erro) {
      mostrarAviso(
        'Erro',
        'Não foi possível salvar a preferência.'
      );
    } finally {
      setSalvando(false);
    }
  }

  // ========================================
  // TAMANHOS DE TEXTO
  // ========================================

  const fonteTitulo = Math.round(
    32 * escalaFonte
  );

  const fonteSecao = Math.round(
    23 * escalaFonte
  );

  const fonteTexto = Math.round(
    17 * escalaFonte
  );

  // ========================================
  // RENDERIZAÇÃO
  // ========================================

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {
          backgroundColor: cores.fundo,
        },
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
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.container
        }
      >
        <View style={styles.conteudo}>

          {/* VOLTAR */}

          <TouchableOpacity
            style={styles.voltar}
            onPress={() => router.back()}
          >
            <Text
              style={[
                styles.voltarTexto,
                {
                  color: cores.primario,
                },
              ]}
            >
              ← Voltar
            </Text>
          </TouchableOpacity>

          {/* CABEÇALHO */}

          <View style={styles.cabecalho}>
            <Text
              style={[
                styles.etiqueta,
                {
                  color: cores.primario,
                },
              ]}
            >
              SEU APLICATIVO, DO SEU JEITO
            </Text>

            <Text
              style={[
                styles.titulo,
                {
                  color: cores.texto,
                  fontSize: fonteTitulo,
                  lineHeight:
                    fonteTitulo + 12,
                },
              ]}
            >
              Personalização 🎨
            </Text>

            <Text
              style={[
                styles.subtitulo,
                {
                  color: cores.secundario,
                  fontSize: fonteTexto,
                  lineHeight:
                    fonteTexto + 10,
                },
              ]}
            >
              Escolha suas cores favoritas,
              personalize os cartões e deixe
              o MeuAutoCuidado com a sua cara.
            </Text>
          </View>

          {/* ========================== */}
          {/* ESCOLHER TEMA */}
          {/* ========================== */}

          <Text
            style={[
              styles.secaoTitulo,
              {
                color: cores.texto,
                fontSize: fonteSecao,
              },
            ]}
          >
            🌈 Escolha seu tema
          </Text>

          <Text
            style={[
              styles.secaoDescricao,
              {
                color: cores.secundario,
              },
            ]}
          >
            Toque em uma das opções para
            mudar as cores do aplicativo.
          </Text>

          <View style={styles.gradeTemas}>
            {OPCOES_TEMA.map(item => {
              const selecionado =
                preferencias.tema ===
                item.id;

              const paleta =
                TEMAS[item.id];

              const paletaPrevia =
                item.id === 'noite'
                  ? paleta.escuro
                  : preferencias.modoNoturno
                  ? paleta.escuro
                  : paleta.claro;

              return (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.8}
                  disabled={salvando}
                  onPress={() =>
                    alterarPreferencia({
                      tema: item.id,
                    })
                  }
                  style={[
                    styles.temaCard,
                    {
                      width: telaPequena
                        ? '100%'
                        : '48.5%',

                      backgroundColor:
                        cores.card,

                      borderColor:
                        selecionado
                          ? cores.primario
                          : cores.borda,

                      borderWidth:
                        selecionado
                          ? 2
                          : 1,

                      borderRadius:
                        raioCartao,
                    },
                  ]}
                >
                  {/* AMOSTRA DE CORES */}

                  <View
                    style={[
                      styles.temaAmostra,
                      {
                        backgroundColor:
                          paletaPrevia.fundo,
                        borderRadius:
                          Math.max(
                            8,
                            raioCartao - 7
                          ),
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.temaAmostraCard,
                        {
                          backgroundColor:
                            paletaPrevia.card,
                          borderRadius:
                            Math.max(
                              6,
                              raioCartao - 12
                            ),
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.temaAmostraLinha,
                          {
                            backgroundColor:
                              paletaPrevia.primario,
                          },
                        ]}
                      />

                      <View
                        style={[
                          styles.temaAmostraLinhaCurta,
                          {
                            backgroundColor:
                              paletaPrevia.suave,
                          },
                        ]}
                      />

                      <View
                        style={[
                          styles.temaAmostraBotao,
                          {
                            backgroundColor:
                              paletaPrevia.primario,
                          },
                        ]}
                      />
                    </View>
                  </View>

                  {/* NOME DO TEMA */}

                  <View
                    style={styles.temaRodape}
                  >
                    <View
                      style={{
                        flex: 1,
                      }}
                    >
                      <Text
                        style={[
                          styles.temaNome,
                          {
                            color:
                              cores.texto,
                          },
                        ]}
                      >
                        {item.emoji}{' '}
                        {item.nome}
                      </Text>

                      <Text
                        style={[
                          styles.temaDescricao,
                          {
                            color:
                              cores.secundario,
                          },
                        ]}
                      >
                        {item.descricao}
                      </Text>
                    </View>

                    <Text
                      style={[
                        styles.selecao,
                        {
                          color:
                            cores.primario,
                        },
                      ]}
                    >
                      {selecionado
                        ? '◉'
                        : '○'}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ========================== */}
          {/* PRÉVIA DO TEMA */}
          {/* ========================== */}

          <Text
            style={[
              styles.secaoTitulo,
              {
                color: cores.texto,
                fontSize: fonteSecao,
              },
            ]}
          >
            👀 Prévia do aplicativo
          </Text>

          <Text
            style={[
              styles.secaoDescricao,
              {
                color: cores.secundario,
              },
            ]}
          >
            Veja como ficam os cartões,
            textos e botões com suas escolhas.
          </Text>

          <PreviaTema
            cores={cores}
            raio={raioCartao}
            escala={escalaFonte}
          />

          {/* ========================== */}
          {/* MODO NOTURNO */}
          {/* ========================== */}

          <Text
            style={[
              styles.secaoTitulo,
              {
                color: cores.texto,
                fontSize: fonteSecao,
              },
            ]}
          >
            🌙 Modo de aparência
          </Text>

          <View
            style={[
              styles.card,
              {
                backgroundColor:
                  cores.card,
                borderColor:
                  cores.borda,
                borderRadius:
                  raioCartao,
              },
            ]}
          >
            <View
              style={styles.linha}
            >
              <View
                style={[
                  styles.iconeArea,
                  {
                    backgroundColor:
                      cores.suave,
                  },
                ]}
              >
                <Text
                  style={styles.icone}
                >
                  🌙
                </Text>
              </View>

              <View
                style={styles.linhaConteudo}
              >
                <Text
                  style={[
                    styles.itemTitulo,
                    {
                      color:
                        cores.texto,
                      fontSize:
                        fonteTexto,
                    },
                  ]}
                >
                  Modo noturno
                </Text>

                <Text
                  style={[
                    styles.itemDescricao,
                    {
                      color:
                        cores.secundario,
                    },
                  ]}
                >
                  Ative tons escuros para
                  uma aparência mais
                  confortável à noite.
                </Text>
              </View>

              <Switch
                value={
                  preferencias.modoNoturno
                }
                disabled={salvando}
                onValueChange={valor =>
                  alterarPreferencia({
                    modoNoturno: valor,
                  })
                }
                trackColor={{
                  false: '#CFC5D7',
                  true: cores.primario,
                }}
                thumbColor="#FFFFFF"
              />
            </View>

            {preferencias.tema ===
              'noite' && (
              <View
                style={[
                  styles.observacao,
                  {
                    backgroundColor:
                      cores.suave,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.observacaoTexto,
                    {
                      color:
                        cores.secundario,
                    },
                  ]}
                >
                  O tema Noite Premium
                  permanece escuro mesmo
                  com o botão desativado.
                </Text>
              </View>
            )}
          </View>

          {/* ========================== */}
          {/* ESTILOS DOS CARTÕES */}
          {/* ========================== */}

          <Text
            style={[
              styles.secaoTitulo,
              {
                color: cores.texto,
                fontSize: fonteSecao,
              },
            ]}
          >
            🪄 Estilo dos cartões
          </Text>

          <Text
            style={[
              styles.secaoDescricao,
              {
                color: cores.secundario,
              },
            ]}
          >
            Escolha o formato dos cartões
            e das áreas de conteúdo.
          </Text>

          <View
            style={styles.gradeEstilos}
          >
            {ESTILOS.map(item => {
              const selecionado =
                preferencias.estiloCartao ===
                item.id;

              const raio =
                item.id ===
                'minimalista'
                  ? 8
                  : item.id ===
                    'elegante'
                  ? 16
                  : 24;

              return (
                <TouchableOpacity
                  key={item.id}
                  disabled={salvando}
                  activeOpacity={0.8}
                  onPress={() =>
                    alterarPreferencia({
                      estiloCartao:
                        item.id,
                    })
                  }
                  style={[
                    styles.estiloOpcao,
                    {
                      backgroundColor:
                        cores.card,
                      borderColor:
                        selecionado
                          ? cores.primario
                          : cores.borda,
                      borderWidth:
                        selecionado
                          ? 2
                          : 1,
                      borderRadius:
                        raioCartao,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.estiloIlustracao,
                      {
                        backgroundColor:
                          cores.suave,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.estiloDesenho,
                        {
                          backgroundColor:
                            cores.primario,
                          borderRadius:
                            raio,
                        },
                      ]}
                    />
                  </View>

                  <View
                    style={{
                      flex: 1,
                    }}
                  >
                    <Text
                      style={[
                        styles.opcaoTitulo,
                        {
                          color:
                            cores.texto,
                        },
                      ]}
                    >
                      {item.emoji}{' '}
                      {item.nome}
                    </Text>

                    <Text
                      style={[
                        styles.opcaoDescricao,
                        {
                          color:
                            cores.secundario,
                        },
                      ]}
                    >
                      {item.descricao}
                    </Text>
                  </View>

                  <Text
                    style={[
                      styles.selecao,
                      {
                        color:
                          cores.primario,
                      },
                    ]}
                  >
                    {selecionado
                      ? '◉'
                      : '○'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ========================== */}
          {/* TAMANHO DAS LETRAS */}
          {/* ========================== */}

          <Text
            style={[
              styles.secaoTitulo,
              {
                color: cores.texto,
                fontSize: fonteSecao,
              },
            ]}
          >
            🔠 Tamanho das letras
          </Text>

          <Text
            style={[
              styles.secaoDescricao,
              {
                color: cores.secundario,
              },
            ]}
          >
            Escolha o tamanho de texto
            mais confortável para você.
          </Text>

          <View
            style={[
              styles.card,
              {
                backgroundColor:
                  cores.card,
                borderColor:
                  cores.borda,
                borderRadius:
                  raioCartao,
              },
            ]}
          >
            {TAMANHOS.map(item => {
              const selecionado =
                preferencias.tamanhoFonte ===
                item.id;

              return (
                <TouchableOpacity
                  key={item.id}
                  disabled={salvando}
                  activeOpacity={0.8}
                  onPress={() =>
                    alterarPreferencia({
                      tamanhoFonte:
                        item.id,
                    })
                  }
                  style={[
                    styles.fonteOpcao,
                    {
                      backgroundColor:
                        selecionado
                          ? cores.suave
                          : cores.card,

                      borderColor:
                        selecionado
                          ? cores.primario
                          : cores.borda,

                      borderRadius:
                        Math.max(
                          8,
                          raioCartao - 7
                        ),
                    },
                  ]}
                >
                  <View
                    style={{
                      flex: 1,
                    }}
                  >
                    <Text
                      style={[
                        styles.fonteNome,
                        {
                          color:
                            cores.texto,

                          fontSize:
                            item.id ===
                            'extra'
                              ? 22
                              : item.id ===
                                'grande'
                              ? 19
                              : 17,
                        },
                      ]}
                    >
                      {item.nome}
                    </Text>

                    <Text
                      style={[
                        styles.fonteDescricao,
                        {
                          color:
                            cores.secundario,
                        },
                      ]}
                    >
                      {item.descricao}
                    </Text>
                  </View>

                  <Text
                    style={[
                      styles.selecao,
                      {
                        color:
                          cores.primario,
                      },
                    ]}
                  >
                    {selecionado
                      ? '◉'
                      : '○'}
                  </Text>
                </TouchableOpacity>
              );
            })}

            <View
              style={[
                styles.exemploFonte,
                {
                  backgroundColor:
                    cores.suave,
                  borderRadius:
                    Math.max(
                      8,
                      raioCartao - 7
                    ),
                },
              ]}
            >
              <Text
                style={[
                  styles.exemploTitulo,
                  {
                    color:
                      cores.texto,
                  },
                ]}
              >
                Prévia do texto
              </Text>

              <Text
                style={{
                  color:
                    cores.texto,
                  fontSize:
                    fonteTexto,
                  lineHeight:
                    fonteTexto + 11,
                }}
              >
                Cuidar de você é um
                gesto de carinho.
                Cada pequeno passo
                importa! 💜
              </Text>
            </View>
          </View>

          {/* ========================== */}
          {/* LEMBRETES */}
          {/* ========================== */}

          <Text
            style={[
              styles.secaoTitulo,
              {
                color: cores.texto,
                fontSize: fonteSecao,
              },
            ]}
          >
            🔔 Lembretes
          </Text>

          <View
            style={[
              styles.card,
              {
                backgroundColor:
                  cores.card,
                borderColor:
                  cores.borda,
                borderRadius:
                  raioCartao,
              },
            ]}
          >
            <View
              style={styles.linha}
            >
              <View
                style={[
                  styles.iconeArea,
                  {
                    backgroundColor:
                      cores.suave,
                  },
                ]}
              >
                <Text
                  style={styles.icone}
                >
                  ⏰
                </Text>
              </View>

              <View
                style={styles.linhaConteudo}
              >
                <Text
                  style={[
                    styles.itemTitulo,
                    {
                      color:
                        cores.texto,
                      fontSize:
                        fonteTexto,
                    },
                  ]}
                >
                  Ativar lembretes
                </Text>

                <Text
                  style={[
                    styles.itemDescricao,
                    {
                      color:
                        cores.secundario,
                    },
                  ]}
                >
                  Salve sua preferência
                  para futuros avisos de
                  autocuidado.
                </Text>
              </View>

              <Switch
                value={
                  preferencias.lembretesAtivos
                }
                disabled={salvando}
                onValueChange={
                  alterarLembretes
                }
                trackColor={{
                  false: '#CFC5D7',
                  true: cores.primario,
                }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View
              style={[
                styles.divisor,
                {
                  backgroundColor:
                    cores.borda,
                },
              ]}
            />

            <Text
              style={[
                styles.itemTitulo,
                {
                  color:
                    cores.texto,
                  fontSize:
                    fonteTexto,
                },
              ]}
            >
              Horário preferido
            </Text>

            <Text
              style={[
                styles.itemDescricao,
                {
                  color:
                    cores.secundario,
                },
              ]}
            >
              Escolha um horário para
              os lembretes.
            </Text>

            <View
              style={styles.gradeHorarios}
            >
              {HORARIOS.map(horario => {
                const selecionado =
                  preferencias.horarioLembrete ===
                  horario;

                return (
                  <TouchableOpacity
                    key={horario}
                    disabled={salvando}
                    onPress={() =>
                      alterarPreferencia({
                        horarioLembrete:
                          horario,
                      })
                    }
                    style={[
                      styles.horarioBotao,
                      {
                        backgroundColor:
                          selecionado
                            ? cores.primario
                            : cores.suave,

                        borderRadius:
                          Math.max(
                            8,
                            raioCartao - 10
                          ),
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.horarioTexto,
                        {
                          color:
                            selecionado
                              ? cores.textoBotao
                              : cores.texto,
                        },
                      ]}
                    >
                      {horario}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View
              style={[
                styles.observacao,
                {
                  backgroundColor:
                    cores.suave,
                },
              ]}
            >
              <Text
                style={[
                  styles.observacaoTexto,
                  {
                    color:
                      cores.secundario,
                  },
                ]}
              >
                ℹ️ O horário e a
                preferência ficam salvos.
                As notificações
                automáticas ainda não
                estão disponíveis nesta
                versão.
              </Text>
            </View>
          </View>

          {/* ========================== */}
          {/* RESTAURAR TEMA PADRÃO */}
          {/* ========================== */}

          <TouchableOpacity
            activeOpacity={0.8}
            disabled={salvando}
            onPress={() =>
              alterarPreferencia({
                tema: 'lavanda',
                modoNoturno: false,
                estiloCartao:
                  'arredondado',
                tamanhoFonte: 'grande',
              })
            }
            style={[
              styles.botaoRestaurar,
              {
                backgroundColor:
                  cores.suave,
                borderColor:
                  cores.borda,
                borderRadius:
                  raioCartao,
              },
            ]}
          >
            <Text
              style={[
                styles.botaoRestaurarTexto,
                {
                  color:
                    cores.primario,
                },
              ]}
            >
              ↺ Restaurar aparência padrão
            </Text>
          </TouchableOpacity>

          {/* ========================== */}
          {/* RESUMO */}
          {/* ========================== */}

          <View
            style={[
              styles.resumo,
              {
                backgroundColor:
                  cores.primario,
                borderRadius:
                  raioCartao,
              },
            ]}
          >
            <Text
              style={styles.resumoEmoji}
            >
              💖
            </Text>

            <Text
              style={[
                styles.resumoTitulo,
                {
                  color:
                    cores.textoBotao,
                },
              ]}
            >
              Seu aplicativo,
              do seu jeito!
            </Text>

            <Text
              style={[
                styles.resumoDescricao,
                {
                  color:
                    cores.textoBotao,
                },
              ]}
            >
              Suas escolhas ficam
              associadas ao e-mail
              cadastrado neste dispositivo.
            </Text>
          </View>

          {/* VOLTAR AO PERFIL */}

          <TouchableOpacity
            style={[
              styles.botaoPerfil,
              {
                backgroundColor:
                  cores.primario,
                borderRadius:
                  Math.max(
                    8,
                    raioCartao - 6
                  ),
              },
            ]}
            onPress={() =>
              router.push('/perfil')
            }
          >
            <Text
              style={[
                styles.botaoPerfilTexto,
                {
                  color:
                    cores.textoBotao,
                },
              ]}
            >
              Voltar para meu perfil →
            </Text>
          </TouchableOpacity>

          <Text
            style={[
              styles.rodape,
              {
                color:
                  cores.secundario,
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

// ==========================================
// ESTILOS
// ==========================================

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  container: {
    paddingHorizontal: 18,
    paddingTop: 24,
    paddingBottom: 60,
    alignItems: 'center',
  },

  conteudo: {
    width: '100%',
    maxWidth: 850,
  },

  voltar: {
    paddingVertical: 10,
    marginBottom: 22,
    alignSelf: 'flex-start',
  },

  voltarTexto: {
    fontSize: 18,
    fontWeight: '800',
  },

  cabecalho: {
    marginBottom: 28,
  },

  etiqueta: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 12,
  },

  titulo: {
    fontWeight: '800',
  },

  subtitulo: {
    marginTop: 12,
  },

  secaoTitulo: {
    fontWeight: '800',
    marginTop: 18,
    marginBottom: 10,
  },

  secaoDescricao: {
    fontSize: 17,
    lineHeight: 26,
    marginBottom: 17,
  },

  // TEMAS

  gradeTemas: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 25,
  },

  temaCard: {
    padding: 12,
    marginBottom: 13,
  },

  temaAmostra: {
    height: 125,
    padding: 13,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 13,
  },

  temaAmostraCard: {
    width: '88%',
    padding: 13,
    minHeight: 92,
    justifyContent: 'center',
  },

  temaAmostraLinha: {
    height: 10,
    width: '75%',
    borderRadius: 6,
    marginBottom: 9,
  },

  temaAmostraLinhaCurta: {
    height: 8,
    width: '55%',
    borderRadius: 6,
    marginBottom: 11,
  },

  temaAmostraBotao: {
    height: 13,
    width: '68%',
    borderRadius: 7,
  },

  temaRodape: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  temaNome: {
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 23,
  },

  temaDescricao: {
    fontSize: 14,
    marginTop: 4,
  },

  selecao: {
    fontSize: 26,
    marginLeft: 10,
  },

  // PRÉVIA

  previaArea: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 20,
    marginBottom: 30,
  },

  previaCabecalho: {
    fontWeight: '800',
    marginBottom: 15,
  },

  previaCard: {
    padding: 20,
    borderWidth: 1,
  },

  previaSaudacao: {
    fontWeight: '800',
    marginBottom: 13,
  },

  previaDescricao: {
    marginBottom: 12,
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

  previaPorcentagem: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 10,
  },

  previaBotao: {
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 14,
  },

  previaBotaoTexto: {
    fontWeight: '800',
  },

  // CARTÕES

  card: {
    borderWidth: 1,
    padding: 20,
    marginBottom: 27,
  },

  linha: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconeArea: {
    width: 49,
    height: 49,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  icone: {
    fontSize: 25,
  },

  linhaConteudo: {
    flex: 1,
    marginRight: 8,
  },

  itemTitulo: {
    fontWeight: '800',
    lineHeight: 27,
  },

  itemDescricao: {
    fontSize: 15,
    lineHeight: 24,
    marginTop: 6,
  },

  observacao: {
    borderRadius: 14,
    padding: 16,
    marginTop: 19,
  },

  observacaoTexto: {
    fontSize: 15,
    lineHeight: 24,
  },

  // ESTILOS DE CARTÃO

  gradeEstilos: {
    marginBottom: 23,
  },

  estiloOpcao: {
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 11,
  },

  estiloIlustracao: {
    width: 65,
    height: 58,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  estiloDesenho: {
    width: 43,
    height: 33,
  },

  opcaoTitulo: {
    fontSize: 18,
    fontWeight: '800',
  },

  opcaoDescricao: {
    fontSize: 15,
    marginTop: 5,
  },

  // TAMANHO DAS LETRAS

  fonteOpcao: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    padding: 16,
    marginBottom: 11,
  },

  fonteNome: {
    fontWeight: '800',
  },

  fonteDescricao: {
    fontSize: 15,
    marginTop: 5,
  },

  exemploFonte: {
    padding: 18,
    marginTop: 9,
  },

  exemploTitulo: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 10,
  },

  // LEMBRETES

  divisor: {
    height: 1,
    marginVertical: 23,
  },

  gradeHorarios: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 18,
  },

  horarioBotao: {
    paddingVertical: 13,
    paddingHorizontal: 15,
    marginRight: 9,
    marginBottom: 10,
    minWidth: 75,
    alignItems: 'center',
  },

  horarioTexto: {
    fontSize: 16,
    fontWeight: '800',
  },

  // RODAPÉ

  botaoRestaurar: {
    borderWidth: 1,
    paddingVertical: 18,
    paddingHorizontal: 15,
    alignItems: 'center',
    marginBottom: 24,
  },

  botaoRestaurarTexto: {
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
  },

  resumo: {
    padding: 27,
    alignItems: 'center',
    marginTop: 5,
  },

  resumoEmoji: {
    fontSize: 41,
    marginBottom: 12,
  },

  resumoTitulo: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
  },

  resumoDescricao: {
    fontSize: 17,
    lineHeight: 27,
    textAlign: 'center',
    marginTop: 12,
  },

  botaoPerfil: {
    paddingVertical: 19,
    paddingHorizontal: 15,
    alignItems: 'center',
    marginTop: 20,
  },

  botaoPerfilTexto: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },

  rodape: {
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.6,
    marginTop: 30,
  },
});
