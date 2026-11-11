
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

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
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { useAutocuidado } from './AutocuidadoContext';

// ============================================
// TIPOS
// ============================================

type Registro = {
  id: string;
  data: string;
  humor: string;
  emoji?: string;
  anotacao?: string;
  sentimento?: string;
  gratidao?: string;
  reflexao?: string;
};

type CampoProps = {
  titulo: string;
  placeholder: string;
  valor: string;
  alterar: (texto: string) => void;
  limite: number;
  altura?: number;
  cores: any;
  raioCartao: number;
  escalaFonte: number;
};

// ============================================
// HUMORES
// ============================================

const humores = [
  { nome: 'Muito bem', emoji: '🥰' },
  { nome: 'Bem', emoji: '😊' },
  { nome: 'Normal', emoji: '😐' },
  { nome: 'Triste', emoji: '😔' },
  { nome: 'Ansiosa(o)', emoji: '😟' },
  { nome: 'Estressada', emoji: '😣' },
];

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

function chaveDiario(email: string) {
  return `@MeuAutoCuidado:diario:${email.trim().toLowerCase()}`;
}

function emojiDoHumor(nome: string) {
  return (
    humores.find(item => item.nome === nome)?.emoji ||
    '💜'
  );
}

function obterDia(registro: Registro) {
  const data = registro.data;

  if (/^\d{2}\/\d{2}\/\d{4}/.test(data)) {
    return data.slice(0, 10);
  }

  const valor = new Date(data);

  if (!Number.isNaN(valor.getTime())) {
    return valor.toLocaleDateString('pt-BR');
  }

  return 'Data não identificada';
}

function mostrarAviso(titulo: string, mensagem: string) {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      window.alert(`${titulo}\n\n${mensagem}`);
    }
    return;
  }

  Alert.alert(titulo, mensagem);
}

function confirmarExclusao(
  aoConfirmar: () => void
) {
  if (Platform.OS === 'web') {
    if (
      typeof window !== 'undefined' &&
      window.confirm(
        'Excluir anotação?\n\nEssa ação não poderá ser desfeita.'
      )
    ) {
      aoConfirmar();
    }
    return;
  }

  Alert.alert(
    'Excluir anotação?',
    'Essa ação não poderá ser desfeita.',
    [
      {
        text: 'Cancelar',
        style: 'cancel',
      },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: aoConfirmar,
      },
    ]
  );
}

// ============================================
// CAMPO DE TEXTO CORRIGIDO
// FORA DO COMPONENTE DIÁRIO
// ============================================

const Campo = React.memo(function Campo({
  titulo,
  placeholder,
  valor,
  alterar,
  limite,
  altura = 120,
  cores,
  raioCartao,
  escalaFonte,
}: CampoProps) {
  const fonte = (numero: number) =>
    Math.round(numero * escalaFonte);

  return (
    <View
      style={[
        styles.campoCard,
        {
          backgroundColor: cores.card,
          borderColor: cores.borda,
          borderRadius: raioCartao,
        },
      ]}
    >
      <Text
        style={[
          styles.campoEtiqueta,
          {
            color: cores.primario,
            fontSize: fonte(12),
          },
        ]}
      >
        {titulo}
      </Text>

      <TextInput
        style={[
          styles.campoTexto,
          {
            color: cores.texto,
            fontSize: fonte(15),
            lineHeight: fonte(24),
            minHeight: altura,
            backgroundColor: cores.card,
            borderColor: cores.borda,
            borderRadius: Math.max(10, raioCartao - 7),
          },
        ]}
        multiline
        textAlignVertical="top"
        placeholder={placeholder}
        placeholderTextColor={cores.secundario}
        value={valor}
        onChangeText={alterar}
        maxLength={limite}
        autoCorrect
        autoCapitalize="sentences"
        underlineColorAndroid="transparent"
      />

      <Text
        style={[
          styles.contador,
          {
            color: cores.secundario,
            fontSize: fonte(11),
          },
        ]}
      >
        {valor.length}/{limite}
      </Text>
    </View>
  );
});

// ============================================
// TELA PRINCIPAL DO DIÁRIO
// ============================================

export default function Diario() {
  const {
    usuario,
    cores,
    raioCartao,
    escalaFonte,
    preferencias,
  } = useAutocuidado();

  const emailAtual =
    usuario?.email?.trim().toLowerCase() || '';

  const CHAVE = emailAtual
    ? chaveDiario(emailAtual)
    : '';

  // ESTADOS

  const [humor, setHumor] = useState('');
  const [sentimento, setSentimento] = useState('');
  const [gratidao, setGratidao] = useState('');
  const [reflexao, setReflexao] = useState('');

  const [registros, setRegistros] =
    useState<Registro[]>([]);

  const [carregando, setCarregando] =
    useState(true);

  const [salvando, setSalvando] =
    useState(false);

  const [editandoId, setEditandoId] =
    useState<string | null>(null);

  const [aba, setAba] =
    useState<'escrever' | 'historico'>('escrever');

  const [diaSelecionado, setDiaSelecionado] =
    useState('todos');

  // TEMA

  const escuro =
    preferencias.modoNoturno ||
    preferencias.tema === 'noite';

  const fonte = (valor: number) =>
    Math.round(valor * escalaFonte);

  const nome =
    usuario?.nome?.trim().split(' ')[0] ||
    'você';

  const dataAtual =
    new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

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

  // ==========================================
  // LIMPAR FORMULÁRIO
  // ==========================================

  const limparFormulario = useCallback(() => {
    setHumor('');
    setSentimento('');
    setGratidao('');
    setReflexao('');
    setEditandoId(null);
  }, []);

  // ==========================================
  // CARREGAR REGISTROS
  // ==========================================

  useFocusEffect(
    useCallback(() => {
      let ativo = true;

      async function carregar() {
        setCarregando(true);

        if (!CHAVE) {
          if (ativo) {
            setRegistros([]);
            setCarregando(false);
          }
          return;
        }

        try {
          const dados =
            await AsyncStorage.getItem(CHAVE);

          const lista = dados
            ? JSON.parse(dados)
            : [];

          if (ativo) {
            setRegistros(
              Array.isArray(lista) ? lista : []
            );
          }
        } catch {
          if (ativo) {
            mostrarAviso(
              'Erro',
              'Não foi possível carregar suas anotações.'
            );
          }
        } finally {
          if (ativo) {
            setCarregando(false);
          }
        }
      }

      void carregar();

      return () => {
        ativo = false;
      };
    }, [CHAVE])
  );

  // ==========================================
  // TROCA DE USUÁRIO
  // ==========================================

  useEffect(() => {
    limparFormulario();
    setRegistros([]);
    setAba('escrever');
    setDiaSelecionado('todos');
  }, [emailAtual, limparFormulario]);

  // ==========================================
  // DIAS COM REGISTROS
  // ==========================================

  const diasComRegistros = useMemo(() => {
    return Array.from(
      new Set(registros.map(obterDia))
    );
  }, [registros]);

  // ==========================================
  // REGISTROS ORDENADOS
  // ==========================================

  const registrosOrdenados = useMemo(() => {
    return [...registros]
      .filter(registro =>
        diaSelecionado === 'todos'
          ? true
          : obterDia(registro) === diaSelecionado
      )
      .sort((a, b) => {
        const extrairTempo = (
          registro: Registro
        ) => {
          const numeroId = Number(
            String(registro.id).split('-')[0]
          );

          return Number.isFinite(numeroId)
            ? numeroId
            : 0;
        };

        return extrairTempo(b) - extrairTempo(a);
      });
  }, [registros, diaSelecionado]);

  // ==========================================
  // SALVAR REGISTRO
  // ==========================================

  async function salvarRegistro() {
    if (salvando || carregando) {
      return;
    }

    if (!CHAVE) {
      mostrarAviso(
        'Cadastro necessário',
        'Entre com seu e-mail para salvar no diário.'
      );
      return;
    }

    if (
      !sentimento.trim() &&
      !gratidao.trim() &&
      !reflexao.trim()
    ) {
      mostrarAviso(
        'Escreva um pouquinho',
        'Preencha pelo menos um dos campos do diário.'
      );
      return;
    }

    const agora = new Date();

    const novo: Registro = {
      id:
        editandoId ||
        `${agora.getTime()}-${Math.random()
          .toString(36)
          .slice(2, 8)}`,

      data: editandoId
        ? registros.find(
            item => item.id === editandoId
          )?.data || agora.toLocaleString('pt-BR')
        : agora.toLocaleString('pt-BR'),

      humor: humor || 'Não informado',
      emoji: emojiDoHumor(humor),
      sentimento: sentimento.trim(),
      gratidao: gratidao.trim(),
      reflexao: reflexao.trim(),
    };

    setSalvando(true);

    try {
      const dados =
        await AsyncStorage.getItem(CHAVE);

      const atuais: Registro[] = dados
        ? JSON.parse(dados)
        : [];

      const listaAnterior =
        Array.isArray(atuais) ? atuais : [];

      const lista = editandoId
        ? listaAnterior.map(item =>
            String(item.id) === String(editandoId)
              ? novo
              : item
          )
        : [novo, ...listaAnterior];

      await AsyncStorage.setItem(
        CHAVE,
        JSON.stringify(lista)
      );

      setRegistros(lista);

      limparFormulario();
      setDiaSelecionado('todos');
      setAba('historico');

      mostrarAviso(
        'Anotação salva! 💜',
        'Seu registro está guardado no histórico do diário.'
      );
    } catch {
      mostrarAviso(
        'Erro',
        'Não foi possível salvar sua anotação.'
      );
    } finally {
      setSalvando(false);
    }
  }

  // ==========================================
  // EDITAR REGISTRO
  // ==========================================

  function editarRegistro(registro: Registro) {
    setEditandoId(String(registro.id));

    setHumor(
      registro.humor === 'Não informado'
        ? ''
        : registro.humor
    );

    setSentimento(
      registro.sentimento ||
      registro.anotacao ||
      ''
    );

    setGratidao(registro.gratidao || '');
    setReflexao(registro.reflexao || '');

    setAba('escrever');
  }

  // ==========================================
  // EXCLUIR REGISTRO
  // ==========================================

  function excluirRegistro(id: string) {
    if (!CHAVE) {
      return;
    }

    confirmarExclusao(async () => {
      try {
        const dados =
          await AsyncStorage.getItem(CHAVE);

        const atuais: Registro[] = dados
          ? JSON.parse(dados)
          : [];

        const lista = (
          Array.isArray(atuais) ? atuais : []
        ).filter(
          item => String(item.id) !== String(id)
        );

        await AsyncStorage.setItem(
          CHAVE,
          JSON.stringify(lista)
        );

        setRegistros(lista);
      } catch {
        mostrarAviso(
          'Erro',
          'Não foi possível excluir a anotação.'
        );
      }
    });
  }

  // ==========================================
  // INTERFACE
  // ==========================================

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

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
      >
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.conteudoCentral}>

            {/* CABEÇALHO */}

            <View style={styles.cabecalho}>
              <Text style={styles.emojiPrincipal}>
                📖
              </Text>

              <Text
                style={[
                  styles.etiqueta,
                  {
                    color: cores.primario,
                    fontSize: fonte(11),
                  },
                ]}
              >
                SEU CANTINHO DE REFLEXÃO
              </Text>

              <Text
                style={[
                  styles.titulo,
                  {
                    color: cores.texto,
                    fontSize: fonte(29),
                  },
                ]}
              >
                Meu Diário
              </Text>

              <Text
                style={[
                  styles.subtitulo,
                  {
                    color: cores.secundario,
                    fontSize: fonte(14),
                  },
                ]}
              >
                Guarde suas lembranças, pensamentos e sentimentos.
                Escreva sempre que quiser.
              </Text>
            </View>

            {/* RESUMO */}

            <View
              style={[
                styles.resumoCard,
                cardSuave,
              ]}
            >
              <View style={styles.resumoItem}>
                <Text
                  style={[
                    styles.resumoNumero,
                    {
                      color: cores.primario,
                    },
                  ]}
                >
                  {registros.length}
                </Text>

                <Text
                  style={[
                    styles.resumoLegenda,
                    {
                      color: cores.secundario,
                    },
                  ]}
                >
                  Anotações
                </Text>
              </View>

              <View
                style={[
                  styles.divisoria,
                  {
                    backgroundColor: cores.borda,
                  },
                ]}
              />

              <View style={styles.resumoItem}>
                <Text
                  style={[
                    styles.resumoNumero,
                    {
                      color: cores.primario,
                    },
                  ]}
                >
                  {diasComRegistros.length}
                </Text>

                <Text
                  style={[
                    styles.resumoLegenda,
                    {
                      color: cores.secundario,
                    },
                  ]}
                >
                  Dias registrados
                </Text>
              </View>
            </View>

            {/* ABAS */}

            <View
              style={[
                styles.abas,
                card,
              ]}
            >
              <TouchableOpacity
                onPress={() =>
                  setAba('escrever')
                }
                style={[
                  styles.abaBotao,
                  aba === 'escrever' && {
                    backgroundColor: cores.primario,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.abaTexto,
                    {
                      color:
                        aba === 'escrever'
                          ? cores.textoBotao
                          : cores.texto,
                    },
                  ]}
                >
                  ✍️ Escrever
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  setAba('historico')
                }
                style={[
                  styles.abaBotao,
                  aba === 'historico' && {
                    backgroundColor: cores.primario,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.abaTexto,
                    {
                      color:
                        aba === 'historico'
                          ? cores.textoBotao
                          : cores.texto,
                    },
                  ]}
                >
                  🗓️ Histórico
                </Text>
              </TouchableOpacity>
            </View>

            {/* ESCREVER */}

            {aba === 'escrever' ? (
              <>
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
                    style={[
                      styles.destaqueEtiqueta,
                      {
                        color: cores.textoBotao,
                      },
                    ]}
                  >
                    ✨ UM MOMENTO PARA VOCÊ
                  </Text>

                  <Text
                    style={[
                      styles.destaqueTitulo,
                      {
                        color: cores.textoBotao,
                        fontSize: fonte(22),
                      },
                    ]}
                  >
                    {editandoId
                      ? 'Editando sua lembrança'
                      : `Como foi seu dia, ${nome}?`}
                  </Text>

                  <Text
                    style={[
                      styles.destaqueDescricao,
                      {
                        color: cores.textoBotao,
                      },
                    ]}
                  >
                    Escreva com liberdade. Seu diário é um espaço
                    pessoal, sem cobranças.
                  </Text>

                  <Text
                    style={[
                      styles.destaqueData,
                      {
                        color: cores.textoBotao,
                      },
                    ]}
                  >
                    📅 {dataAtual}
                  </Text>
                </View>

                {/* HUMOR */}

                <Text
                  style={[
                    styles.secaoTitulo,
                    {
                      color: cores.texto,
                      fontSize: fonte(20),
                    },
                  ]}
                >
                  💗 Como você está se sentindo?
                </Text>

                <Text
                  style={[
                    styles.secaoDescricao,
                    {
                      color: cores.secundario,
                    },
                  ]}
                >
                  Escolha seu humor, se quiser.
                </Text>

                <View style={styles.humoresContainer}>
                  {humores.map(item => {
                    const selecionado =
                      humor === item.nome;

                    return (
                      <TouchableOpacity
                        key={item.nome}
                        onPress={() =>
                          setHumor(item.nome)
                        }
                        style={[
                          styles.humorCard,
                          {
                            backgroundColor:
                              selecionado
                                ? cores.suave
                                : cores.card,

                            borderColor:
                              selecionado
                                ? cores.primario
                                : cores.borda,

                            borderRadius: raioCartao,

                            borderWidth:
                              selecionado ? 2 : 1,
                          },
                        ]}
                      >
                        <Text
                          style={styles.humorEmoji}
                        >
                          {item.emoji}
                        </Text>

                        <Text
                          style={[
                            styles.humorNome,
                            {
                              color: selecionado
                                ? cores.primario
                                : cores.texto,
                              fontSize: fonte(12),
                            },
                          ]}
                        >
                          {item.nome}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* CAMPOS DE ESCRITA */}

                <View style={styles.campos}>
                  <Campo
                    titulo="💭 MEU DIA E MEUS PENSAMENTOS"
                    placeholder="Hoje aconteceu... Quero guardar esta lembrança porque..."
                    valor={sentimento}
                    alterar={setSentimento}
                    limite={5000}
                    altura={170}
                    cores={cores}
                    raioCartao={raioCartao}
                    escalaFonte={escalaFonte}
                  />

                  <Campo
                    titulo="💗 SOU GRATA(O) POR..."
                    placeholder="Uma coisa boa que aconteceu..."
                    valor={gratidao}
                    alterar={setGratidao}
                    limite={1500}
                    cores={cores}
                    raioCartao={raioCartao}
                    escalaFonte={escalaFonte}
                  />

                  <Campo
                    titulo="🦋 MEU PRÓXIMO PASSO"
                    placeholder="Amanhã quero tentar..."
                    valor={reflexao}
                    alterar={setReflexao}
                    limite={1500}
                    cores={cores}
                    raioCartao={raioCartao}
                    escalaFonte={escalaFonte}
                  />
                </View>

                {/* SALVAR */}

                <TouchableOpacity
                  onPress={salvarRegistro}
                  disabled={
                    salvando || carregando
                  }
                  style={[
                    styles.botaoSalvar,
                    {
                      backgroundColor:
                        cores.primario,
                      borderRadius:
                        raioCartao,
                      opacity:
                        salvando || carregando
                          ? 0.6
                          : 1,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.botaoSalvarTexto,
                      {
                        color: cores.textoBotao,
                        fontSize: fonte(15),
                      },
                    ]}
                  >
                    {salvando
                      ? 'Salvando...'
                      : editandoId
                      ? '💜 Salvar alterações'
                      : '💜 Guardar minha anotação'}
                  </Text>
                </TouchableOpacity>

                {editandoId && (
                  <TouchableOpacity
                    onPress={limparFormulario}
                    style={styles.cancelar}
                  >
                    <Text
                      style={{
                        color: cores.primario,
                        fontWeight: '800',
                      }}
                    >
                      Cancelar edição
                    </Text>
                  </TouchableOpacity>
                )}

                <Text
                  style={[
                    styles.aviso,
                    {
                      color: cores.secundario,
                    },
                  ]}
                >
                  Você pode criar várias anotações por dia.
                  Todas ficam guardadas com suas datas.
                </Text>
              </>
            ) : (
              <>
                {/* HISTÓRICO INTERNO DO DIÁRIO */}

                <Text
                  style={[
                    styles.secaoTitulo,
                    {
                      color: cores.texto,
                      fontSize: fonte(21),
                    },
                  ]}
                >
                  🗓️ Minhas lembranças
                </Text>

                <Text
                  style={[
                    styles.secaoDescricao,
                    {
                      color: cores.secundario,
                    },
                  ]}
                >
                  Escolha uma data para encontrar suas anotações.
                </Text>

                {/* FILTROS */}

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={
                    styles.filtros
                  }
                >
                  {[
                    'todos',
                    ...diasComRegistros,
                  ].map(dia => (
                    <TouchableOpacity
                      key={dia}
                      onPress={() =>
                        setDiaSelecionado(dia)
                      }
                      style={[
                        styles.filtro,
                        {
                          backgroundColor:
                            diaSelecionado === dia
                              ? cores.primario
                              : cores.card,
                          borderColor: cores.borda,
                        },
                      ]}
                    >
                      <Text
                        style={{
                          color:
                            diaSelecionado === dia
                              ? cores.textoBotao
                              : cores.texto,
                          fontWeight: '800',
                          fontSize: fonte(12),
                        }}
                      >
                        {dia === 'todos'
                          ? 'Todas as datas'
                          : dia}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* LISTA DE REGISTROS */}

                {carregando ? (
                  <ActivityIndicator
                    size="large"
                    color={cores.primario}
                    style={{
                      marginTop: 35,
                    }}
                  />
                ) : registrosOrdenados.length === 0 ? (
                  <View
                    style={[
                      styles.vazioCard,
                      card,
                    ]}
                  >
                    <Text
                      style={styles.vazioEmoji}
                    >
                      📖
                    </Text>

                    <Text
                      style={[
                        styles.vazioTitulo,
                        {
                          color: cores.texto,
                        },
                      ]}
                    >
                      Nenhuma anotação encontrada
                    </Text>

                    <Text
                      style={[
                        styles.vazioDescricao,
                        {
                          color: cores.secundario,
                        },
                      ]}
                    >
                      Seus registros aparecerão aqui assim que
                      você começar a escrever.
                    </Text>

                    <TouchableOpacity
                      onPress={() =>
                        setAba('escrever')
                      }
                      style={[
                        styles.botaoNova,
                        {
                          backgroundColor:
                            cores.primario,
                        },
                      ]}
                    >
                      <Text
                        style={{
                          color: cores.textoBotao,
                          fontWeight: '800',
                        }}
                      >
                        ✍️ Escrever agora
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  registrosOrdenados.map(
                    registro => (
                      <View
                        key={String(registro.id)}
                        style={[
                          styles.registroCard,
                          card,
                        ]}
                      >
                        <View
                          style={
                            styles.registroCabecalho
                          }
                        >
                          <Text
                            style={
                              styles.registroEmoji
                            }
                          >
                            {registro.emoji ||
                              emojiDoHumor(
                                registro.humor
                              )}
                          </Text>

                          <View style={{ flex: 1 }}>
                            <Text
                              style={[
                                styles.registroHumor,
                                {
                                  color: cores.texto,
                                },
                              ]}
                            >
                              {registro.humor ||
                                'Minha anotação'}
                            </Text>

                            <Text
                              style={[
                                styles.registroData,
                                {
                                  color:
                                    cores.secundario,
                                },
                              ]}
                            >
                              📅 {registro.data}
                            </Text>
                          </View>
                        </View>

                        {/* MEU DIA */}

                        {!!(
                          registro.sentimento ||
                          registro.anotacao
                        ) && (
                          <View
                            style={[
                              styles.registroBloco,
                              {
                                backgroundColor:
                                  cores.suave,
                                borderRadius:
                                  raioCartao,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.registroRotulo,
                                {
                                  color:
                                    cores.primario,
                                },
                              ]}
                            >
                              💭 MEU DIA
                            </Text>

                            <Text
                              style={[
                                styles.registroTexto,
                                {
                                  color: cores.texto,
                                },
                              ]}
                            >
                              {registro.sentimento ||
                                registro.anotacao}
                            </Text>
                          </View>
                        )}

                        {/* GRATIDÃO */}

                        {!!registro.gratidao && (
                          <View
                            style={[
                              styles.registroBloco,
                              {
                                backgroundColor:
                                  cores.suave,
                                borderRadius:
                                  raioCartao,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.registroRotulo,
                                {
                                  color:
                                    cores.primario,
                                },
                              ]}
                            >
                              💗 GRATIDÃO
                            </Text>

                            <Text
                              style={[
                                styles.registroTexto,
                                {
                                  color: cores.texto,
                                },
                              ]}
                            >
                              {registro.gratidao}
                            </Text>
                          </View>
                        )}

                        {/* PRÓXIMO PASSO */}

                        {!!registro.reflexao && (
                          <View
                            style={[
                              styles.registroBloco,
                              {
                                backgroundColor:
                                  cores.suave,
                                borderRadius:
                                  raioCartao,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.registroRotulo,
                                {
                                  color:
                                    cores.primario,
                                },
                              ]}
                            >
                              🦋 PRÓXIMO PASSO
                            </Text>

                            <Text
                              style={[
                                styles.registroTexto,
                                {
                                  color: cores.texto,
                                },
                              ]}
                            >
                              {registro.reflexao}
                            </Text>
                          </View>
                        )}

                        {/* EDITAR E EXCLUIR */}

                        <View
                          style={
                            styles.acoesRegistro
                          }
                        >
                          <TouchableOpacity
                            onPress={() =>
                              editarRegistro(
                                registro
                              )
                            }
                            style={[
                              styles.acaoBotao,
                              {
                                backgroundColor:
                                  cores.suave,
                              },
                            ]}
                          >
                            <Text
                              style={{
                                color:
                                  cores.primario,
                                fontWeight: '800',
                              }}
                            >
                              ✏️ Editar
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            onPress={() =>
                              excluirRegistro(
                                String(
                                  registro.id
                                )
                              )
                            }
                            style={[
                              styles.acaoBotao,
                              {
                                backgroundColor:
                                  cores.suave,
                              },
                            ]}
                          >
                            <Text
                              style={{
                                color: '#C16A83',
                                fontWeight: '800',
                              }}
                            >
                              🗑️ Excluir
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )
                  )
                )}
              </>
            )}

            {/* MENSAGEM FINAL */}

            <View
              style={[
                styles.mensagemFinal,
                cardSuave,
              ]}
            >
              <Text
                style={
                  styles.mensagemEmoji
                }
              >
                🌷
              </Text>

              <Text
                style={[
                  styles.mensagemTexto,
                  {
                    color: cores.texto,
                  },
                ]}
              >
                Nem todos os dias serão fáceis, e tudo bem.
                Seu diário é um espaço de acolhimento,
                não de cobrança.
              </Text>
            </View>

            {/* RODAPÉ */}

            <Text
              style={[
                styles.rodape,
                {
                  color: cores.secundario,
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

// ============================================
// ESTILOS
// ============================================

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
    maxWidth: 850,
  },

  cabecalho: {
    alignItems: 'center',
    marginBottom: 22,
  },

  emojiPrincipal: {
    fontSize: 48,
    marginBottom: 10,
  },

  etiqueta: {
    fontWeight: '800',
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 9,
  },

  titulo: {
    fontWeight: '900',
    textAlign: 'center',
  },

  subtitulo: {
    textAlign: 'center',
    marginTop: 9,
    lineHeight: 22,
    maxWidth: 480,
  },

  resumoCard: {
    borderWidth: 1,
    padding: 17,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  resumoItem: {
    flex: 1,
    alignItems: 'center',
  },

  resumoNumero: {
    fontSize: 25,
    fontWeight: '900',
  },

  resumoLegenda: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },

  divisoria: {
    height: 38,
    width: 1,
  },

  abas: {
    flexDirection: 'row',
    padding: 5,
    borderWidth: 1,
    borderRadius: 17,
    marginBottom: 24,
    gap: 6,
  },

  abaBotao: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 13,
    borderRadius: 13,
  },

  abaTexto: {
    fontSize: 13,
    fontWeight: '800',
  },

  destaque: {
    padding: 22,
    marginBottom: 25,
  },

  destaqueEtiqueta: {
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 13,
  },

  destaqueTitulo: {
    fontWeight: '900',
  },

  destaqueDescricao: {
    fontSize: 14,
    lineHeight: 22,
    marginTop: 12,
  },

  destaqueData: {
    fontSize: 12,
    fontWeight: '800',
    marginTop: 18,
  },

  secaoTitulo: {
    fontWeight: '900',
    marginBottom: 8,
  },

  secaoDescricao: {
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 16,
  },

  humoresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
    marginBottom: 26,
  },

  humorCard: {
    width: '31%',
    minHeight: 96,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },

  humorEmoji: {
    fontSize: 29,
    marginBottom: 8,
  },

  humorNome: {
    fontWeight: '800',
    textAlign: 'center',
  },

  campos: {
    gap: 16,
    marginBottom: 22,
  },

  campoCard: {
    borderWidth: 1,
    padding: 18,
  },

  campoEtiqueta: {
    fontWeight: '800',
    marginBottom: 13,
  },

  // CORREÇÃO DO ESPAÇAMENTO

  campoTexto: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    textAlignVertical: 'top',
    width: '100%',
  },

  contador: {
    textAlign: 'right',
    marginTop: 11,
  },

  botaoSalvar: {
    paddingVertical: 18,
    alignItems: 'center',
  },

  botaoSalvarTexto: {
    fontWeight: '900',
  },

  cancelar: {
    alignItems: 'center',
    paddingVertical: 15,
  },

  aviso: {
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 19,
    marginTop: 13,
    marginBottom: 28,
  },

  filtros: {
    gap: 9,
    paddingBottom: 18,
  },

  filtro: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 12,
  },

  vazioCard: {
    borderWidth: 1,
    padding: 27,
    alignItems: 'center',
    marginBottom: 20,
  },

  vazioEmoji: {
    fontSize: 42,
    marginBottom: 13,
  },

  vazioTitulo: {
    fontSize: 17,
    fontWeight: '900',
    textAlign: 'center',
  },

  vazioDescricao: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 10,
  },

  botaoNova: {
    marginTop: 19,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },

  registroCard: {
    padding: 18,
    borderWidth: 1,
    marginBottom: 15,
  },

  registroCabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  registroEmoji: {
    fontSize: 31,
    marginRight: 12,
  },

  registroHumor: {
    fontSize: 15,
    fontWeight: '900',
  },

  registroData: {
    fontSize: 12,
    marginTop: 6,
  },

  registroBloco: {
    padding: 14,
    marginTop: 9,
  },

  registroRotulo: {
    fontSize: 11,
    fontWeight: '900',
    marginBottom: 9,
  },

  registroTexto: {
    fontSize: 14,
    lineHeight: 22,
  },

  acoesRegistro: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 15,
  },

  acaoBotao: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 11,
  },

  mensagemFinal: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderWidth: 1,
    marginTop: 20,
  },

  mensagemEmoji: {
    fontSize: 29,
    marginRight: 14,
  },

  mensagemTexto: {
    flex: 1,
    fontSize: 13,
    lineHeight: 21,
  },

  rodape: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.7,
    textAlign: 'center',
    marginTop: 28,
  },
});
