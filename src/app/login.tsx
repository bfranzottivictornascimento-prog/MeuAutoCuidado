
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

import {
  useAutocuidado,
  chaveRespostas,
} from './AutocuidadoContext';

// ============================================
// TEMA FIXO DA TELA DE CADASTRO
// ============================================

// Estas cores não dependem das configurações
// de tema do usuário.
//
// A pessoa pode escolher outro tema dentro
// do aplicativo, mas o cadastro continuará
// sempre roxo e lilás.

const cores = {
  fundo: '#FAF7FF',
  card: '#FFFFFF',
  texto: '#382747',
  secundario: '#806F91',
  primario: '#7849A5',
  suave: '#F0E5FA',
  borda: '#EEE5F5',
  textoBotao: '#FFFFFF',
};

const raioCartao = 22;
const escalaFonte = 1.1;

// O cadastro sempre usa o tema claro.
const escuro = false;

// ============================================
// BENEFÍCIOS DO APLICATIVO
// ============================================

const BENEFICIOS = [
  {
    id: 'rotina',
    emoji: '✨',
    titulo: 'Rotina personalizada',
    descricao:
      'Atividades e dicas de acordo com seus hábitos e objetivos.',
  },
  {
    id: 'evolucao',
    emoji: '📊',
    titulo: 'Acompanhe sua evolução',
    descricao:
      'Visualize seu progresso e suas conquistas ao longo dos dias.',
  },
  {
    id: 'diario',
    emoji: '📖',
    titulo: 'Um espaço para se expressar',
    descricao:
      'Registre sentimentos, reflexões e momentos importantes.',
  },
  {
    id: 'relaxamento',
    emoji: '🦋',
    titulo: 'Momentos de tranquilidade',
    descricao:
      'Explore exercícios de respiração e técnicas de relaxamento.',
  },
];

// ============================================
// AVISOS
// ============================================

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

// ============================================
// VALIDAR QUESTIONÁRIO SALVO
// ============================================

function questionarioJaRespondido(
  texto: string | null
): boolean {
  if (!texto) return false;

  try {
    const dados = JSON.parse(texto);

    if (
      !dados ||
      typeof dados !== 'object' ||
      Array.isArray(dados)
    ) {
      return false;
    }

    return (
      typeof dados.sono === 'string' &&
      typeof dados.agua === 'string' &&
      typeof dados.movimento === 'string' &&
      typeof dados.estresse === 'string' &&
      Array.isArray(dados.objetivo) &&
      typeof dados.tempo === 'string' &&
      dados.tempo.trim().length > 0
    );
  } catch {
    return false;
  }
}

// ============================================
// TELA DE CADASTRO
// ============================================

export default function Login() {
  const { salvarUsuario } = useAutocuidado();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');

  const [aceitouTermos, setAceitouTermos] =
    useState(false);

  const [salvando, setSalvando] =
    useState(false);

  const [campoAtivo, setCampoAtivo] = useState<
    'nome' | 'email' | null
  >(null);

  const fonte = (tamanho: number) =>
    Math.round(tamanho * escalaFonte);

  const raioMenor = Math.max(
    6,
    raioCartao - 8
  );

  // ==========================================
  // CONTINUAR COM O E-MAIL INFORMADO
  // ==========================================

  async function continuar() {
    if (salvando) return;

    const nomeLimpo = nome
      .trim()
      .replace(/\s+/g, ' ');

    const emailLimpo = email
      .trim()
      .toLowerCase();

    if (nomeLimpo.length < 2) {
      mostrarAviso(
        'Nome inválido',
        'Digite seu nome para continuar.'
      );
      return;
    }

    const emailValido =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        emailLimpo
      );

    if (!emailValido) {
      mostrarAviso(
        'E-mail inválido',
        'Digite um endereço de e-mail válido.'
      );
      return;
    }

    if (!aceitouTermos) {
      mostrarAviso(
        'Confirmação necessária',
        'Marque a opção de consentimento para continuar.'
      );
      return;
    }

    setSalvando(true);

    try {
      // Verifica se o e-mail informado
      // já possui um questionário salvo.

      const respostasSalvas =
        await AsyncStorage.getItem(
          chaveRespostas(emailLimpo)
        );

      const jaRespondeu =
        questionarioJaRespondido(
          respostasSalvas
        );

      // Recupera os dados correspondentes
      // ao e-mail informado.
      //
      // O contexto é responsável por
      // carregar as informações do usuário.

      await salvarUsuario({
        nome: nomeLimpo,
        email: emailLimpo,
      });

      // Limpa os campos do cadastro.

      setNome('');
      setEmail('');
      setAceitouTermos(false);
      setCampoAtivo(null);

      // E-mail com questionário:
      // entra diretamente no aplicativo.
      //
      // E-mail sem questionário:
      // abre o questionário.

      if (jaRespondeu) {
        router.replace('/');
      } else {
        router.replace('/questionario');
      }
    } catch (erro) {
      console.error(
        'Erro ao entrar no aplicativo:',
        erro
      );

      mostrarAviso(
        'Não foi possível continuar',
        'Não conseguimos carregar seus dados. Tente novamente.'
      );
    } finally {
      setSalvando(false);
    }
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
        style={styles.teclado}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
      >
        <ScrollView
          contentContainerStyle={
            styles.container
          }
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.conteudoCentral}>

            {/* LOGO */}

            <View style={styles.topo}>
              <View
                style={[
                  styles.logoExterior,
                  {
                    backgroundColor:
                      cores.suave,
                    borderRadius:
                      raioCartao,
                  },
                ]}
              >
                <View
                  style={[
                    styles.logoContainer,
                    {
                      backgroundColor:
                        cores.card,
                      borderRadius:
                        raioMenor,
                    },
                  ]}
                >
                  <Text style={styles.logoEmoji}>
                    🌷
                  </Text>
                </View>
              </View>

              <Text
                style={[
                  styles.nomeAplicativo,
                  {
                    color:
                      cores.primario,
                    fontSize:
                      fonte(32),
                  },
                ]}
              >
                MeuAutoCuidado
              </Text>

              <Text
                style={[
                  styles.fraseAplicativo,
                  {
                    color:
                      cores.secundario,
                    fontSize:
                      fonte(16),
                    lineHeight:
                      fonte(16) + 9,
                  },
                ]}
              >
                Seu bem-estar começa com pequenos cuidados.
              </Text>

              <View
                style={[
                  styles.seloTopo,
                  {
                    backgroundColor:
                      cores.suave,
                    borderRadius:
                      raioMenor,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.seloTopoTexto,
                    {
                      color:
                        cores.primario,
                      fontSize:
                        fonte(12),
                    },
                  ]}
                >
                  💜 SEU ESPAÇO DE BEM-ESTAR
                </Text>
              </View>
            </View>

            {/* BOAS-VINDAS */}

            <View style={styles.boasVindas}>
              <Text
                style={[
                  styles.etiqueta,
                  {
                    color:
                      cores.primario,
                    fontSize:
                      fonte(12),
                  },
                ]}
              >
                SUA JORNADA COMEÇA AQUI
              </Text>

              <Text
                style={[
                  styles.titulo,
                  {
                    color:
                      cores.texto,
                    fontSize:
                      fonte(32),
                    lineHeight:
                      fonte(32) + 9,
                  },
                ]}
              >
                Boas-vindas! 💜
              </Text>

              <Text
                style={[
                  styles.subtitulo,
                  {
                    color:
                      cores.secundario,
                    fontSize:
                      fonte(15),
                    lineHeight:
                      fonte(15) + 9,
                  },
                ]}
              >
                Informe seu nome e e-mail para
                acessar seu espaço de autocuidado.
                Se você já respondeu ao questionário,
                suas informações serão recuperadas.
              </Text>
            </View>

            {/* FORMULÁRIO */}

            <View
              style={[
                styles.formulario,
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
                style={
                  styles.formularioCabecalho
                }
              >
                <View
                  style={[
                    styles.formularioIcone,
                    {
                      backgroundColor:
                        cores.suave,
                      borderRadius:
                        raioMenor,
                    },
                  ]}
                >
                  <Text
                    style={
                      styles.formularioEmoji
                    }
                  >
                    👤
                  </Text>
                </View>

                <View
                  style={
                    styles.formularioInfo
                  }
                >
                  <Text
                    style={[
                      styles.formularioTitulo,
                      {
                        color:
                          cores.texto,
                        fontSize:
                          fonte(22),
                      },
                    ]}
                  >
                    Seus dados
                  </Text>

                  <Text
                    style={[
                      styles.formularioDescricao,
                      {
                        color:
                          cores.secundario,
                        fontSize:
                          fonte(14),
                        lineHeight:
                          fonte(14) + 8,
                      },
                    ]}
                  >
                    Entre com seu nome e e-mail.
                  </Text>
                </View>
              </View>

              {/* CAMPO NOME */}

              <Text
                style={[
                  styles.campoLabel,
                  {
                    color:
                      cores.texto,
                    fontSize:
                      fonte(15),
                  },
                ]}
              >
                Nome completo
              </Text>

              <View
                style={[
                  styles.campoContainer,
                  {
                    backgroundColor:
                      cores.fundo,
                    borderColor:
                      campoAtivo === 'nome'
                        ? cores.primario
                        : cores.borda,
                    borderRadius:
                      raioMenor,
                  },
                ]}
              >
                <Text
                  style={
                    styles.campoIcone
                  }
                >
                  👤
                </Text>

                <TextInput
                  style={[
                    styles.campoInput,
                    {
                      color:
                        cores.texto,
                      fontSize:
                        fonte(16),
                    },
                  ]}
                  placeholder="Digite seu nome completo"
                  placeholderTextColor={
                    cores.secundario
                  }
                  value={nome}
                  onChangeText={setNome}
                  onFocus={() =>
                    setCampoAtivo('nome')
                  }
                  onBlur={() =>
                    setCampoAtivo(null)
                  }
                  autoCapitalize="words"
                  autoCorrect={false}
                  maxLength={100}
                  editable={!salvando}
                  returnKeyType="next"
                />
              </View>

              {/* CAMPO E-MAIL */}

              <Text
                style={[
                  styles.campoLabel,
                  {
                    color:
                      cores.texto,
                    fontSize:
                      fonte(15),
                  },
                ]}
              >
                E-mail
              </Text>

              <View
                style={[
                  styles.campoContainer,
                  {
                    backgroundColor:
                      cores.fundo,
                    borderColor:
                      campoAtivo === 'email'
                        ? cores.primario
                        : cores.borda,
                    borderRadius:
                      raioMenor,
                  },
                ]}
              >
                <Text
                  style={
                    styles.campoIcone
                  }
                >
                  ✉️
                </Text>

                <TextInput
                  style={[
                    styles.campoInput,
                    {
                      color:
                        cores.texto,
                      fontSize:
                        fonte(16),
                    },
                  ]}
                  placeholder="seuemail@exemplo.com"
                  placeholderTextColor={
                    cores.secundario
                  }
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() =>
                    setCampoAtivo('email')
                  }
                  onBlur={() =>
                    setCampoAtivo(null)
                  }
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  maxLength={150}
                  editable={!salvando}
                />
              </View>

              {/* INFORMAÇÃO DO CADASTRO */}

              <View
                style={[
                  styles.informacaoCard,
                  {
                    backgroundColor:
                      cores.suave,
                    borderRadius:
                      raioMenor,
                  },
                ]}
              >
                <Text
                  style={
                    styles.informacaoEmoji
                  }
                >
                  🔐
                </Text>

                <View
                  style={
                    styles.informacaoConteudo
                  }
                >
                  <Text
                    style={[
                      styles.informacaoTitulo,
                      {
                        color:
                          cores.texto,
                        fontSize:
                          fonte(15),
                      },
                    ]}
                  >
                    Acesso pelo e-mail
                  </Text>

                  <Text
                    style={[
                      styles.informacaoTexto,
                      {
                        color:
                          cores.secundario,
                        fontSize:
                          fonte(13),
                        lineHeight:
                          fonte(13) + 8,
                      },
                    ]}
                  >
                    Se este e-mail já tiver um
                    questionário salvo, você
                    entrará diretamente no
                    aplicativo. Caso contrário,
                    responderá ao questionário
                    para personalizar sua rotina.
                  </Text>
                </View>
              </View>

              {/* CONSENTIMENTO */}

              <TouchableOpacity
                style={
                  styles.termosContainer
                }
                onPress={() =>
                  setAceitouTermos(
                    anterior => !anterior
                  )
                }
                disabled={salvando}
                activeOpacity={0.8}
                accessibilityRole="checkbox"
                accessibilityState={{
                  checked: aceitouTermos,
                }}
              >
                <View
                  style={[
                    styles.checkbox,
                    {
                      borderColor:
                        aceitouTermos
                          ? cores.primario
                          : cores.borda,
                      backgroundColor:
                        aceitouTermos
                          ? cores.primario
                          : cores.card,
                      borderRadius: 7,
                    },
                  ]}
                >
                  {aceitouTermos && (
                    <Text
                      style={[
                        styles.checkboxTexto,
                        {
                          color:
                            cores.textoBotao,
                          fontSize:
                            fonte(16),
                        },
                      ]}
                    >
                      ✓
                    </Text>
                  )}
                </View>

                <Text
                  style={[
                    styles.termosTexto,
                    {
                      color:
                        cores.secundario,
                      fontSize:
                        fonte(13),
                      lineHeight:
                        fonte(13) + 9,
                    },
                  ]}
                >
                  Entendo que meu nome, e-mail e
                  respostas ao questionário
                  serão usados para personalizar
                  minha experiência de autocuidado
                  neste aplicativo.
                </Text>
              </TouchableOpacity>

              {/* BOTÃO CONTINUAR */}

              <TouchableOpacity
                style={[
                  styles.botaoContinuar,
                  {
                    backgroundColor:
                      cores.primario,
                    borderRadius:
                      raioMenor,
                  },
                  salvando &&
                    styles.botaoDesabilitado,
                ]}
                onPress={continuar}
                disabled={salvando}
                activeOpacity={0.85}
                accessibilityRole="button"
              >
                {salvando ? (
                  <ActivityIndicator
                    color={
                      cores.textoBotao
                    }
                  />
                ) : (
                  <Text
                    style={[
                      styles.botaoContinuarTexto,
                      {
                        color:
                          cores.textoBotao,
                        fontSize:
                          fonte(16),
                      },
                    ]}
                  >
                    Entrar no MeuAutoCuidado →
                  </Text>
                )}
              </TouchableOpacity>

              <Text
                style={[
                  styles.aviso,
                  {
                    color:
                      cores.secundario,
                    fontSize:
                      fonte(12),
                    lineHeight:
                      fonte(12) + 8,
                  },
                ]}
              >
                🌷 Seus dados, histórico e
                questionário são organizados
                pelo e-mail informado e salvos
                neste dispositivo.
              </Text>
            </View>

            {/* BENEFÍCIOS */}

            <View
              style={
                styles.beneficiosSecao
              }
            >
              <Text
                style={[
                  styles.beneficiosEtiqueta,
                  {
                    color:
                      cores.primario,
                    fontSize:
                      fonte(12),
                  },
                ]}
              >
                TUDO PENSADO PARA VOCÊ
              </Text>

              <Text
                style={[
                  styles.beneficiosTitulo,
                  {
                    color:
                      cores.texto,
                    fontSize:
                      fonte(23),
                  },
                ]}
              >
                Seu autocuidado em um só lugar
              </Text>

              <Text
                style={[
                  styles.beneficiosDescricao,
                  {
                    color:
                      cores.secundario,
                    fontSize:
                      fonte(14),
                    lineHeight:
                      fonte(14) + 9,
                  },
                ]}
              >
                Descubra recursos que ajudam você
                a construir hábitos mais saudáveis.
              </Text>

              {BENEFICIOS.map(
                beneficio => (
                  <View
                    key={
                      beneficio.id
                    }
                    style={[
                      styles.beneficioCard,
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
                      style={[
                        styles.beneficioIcone,
                        {
                          backgroundColor:
                            cores.suave,
                          borderRadius:
                            raioMenor,
                        },
                      ]}
                    >
                      <Text
                        style={
                          styles.beneficioEmoji
                        }
                      >
                        {beneficio.emoji}
                      </Text>
                    </View>

                    <View
                      style={
                        styles.beneficioInfo
                      }
                    >
                      <Text
                        style={[
                          styles.beneficioTitulo,
                          {
                            color:
                              cores.texto,
                            fontSize:
                              fonte(16),
                          },
                        ]}
                      >
                        {beneficio.titulo}
                      </Text>

                      <Text
                        style={[
                          styles.beneficioDescricao,
                          {
                            color:
                              cores.secundario,
                            fontSize:
                              fonte(13),
                            lineHeight:
                              fonte(13) + 8,
                          },
                        ]}
                      >
                        {beneficio.descricao}
                      </Text>
                    </View>
                  </View>
                )
              )}
            </View>

            {/* MENSAGEM FINAL */}

            <View
              style={[
                styles.mensagemFinal,
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
                style={
                  styles.mensagemEmoji
                }
              >
                💗
              </Text>

              <Text
                style={[
                  styles.mensagemTexto,
                  {
                    color:
                      cores.texto,
                    fontSize:
                      fonte(14),
                    lineHeight:
                      fonte(14) + 9,
                  },
                ]}
              >
                Cuidar de si não é uma obrigação.
                É um gesto de carinho com você.
                Respeite seu tempo e celebre cada
                pequena conquista.
              </Text>
            </View>

            <Text
              style={[
                styles.rodape,
                {
                  color:
                    cores.secundario,
                  fontSize:
                    fonte(11),
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

  teclado: {
    flex: 1,
  },

  container: {
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingTop: 30,
    paddingBottom: 50,
    alignItems: 'center',
  },

  conteudoCentral: {
    width: '100%',
    maxWidth: 760,
  },

  topo: {
    alignItems: 'center',
    marginBottom: 35,
  },

  logoExterior: {
    width: 105,
    height: 105,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 17,
  },

  logoContainer: {
    width: 84,
    height: 84,
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoEmoji: {
    fontSize: 43,
  },

  nomeAplicativo: {
    fontWeight: '800',
    textAlign: 'center',
  },

  fraseAplicativo: {
    textAlign: 'center',
    marginTop: 10,
  },

  seloTopo: {
    paddingHorizontal: 16,
    paddingVertical: 11,
    marginTop: 19,
  },

  seloTopoTexto: {
    fontWeight: '800',
    textAlign: 'center',
  },

  boasVindas: {
    marginBottom: 25,
  },

  etiqueta: {
    fontWeight: '800',
    letterSpacing: 0.9,
    marginBottom: 9,
  },

  titulo: {
    fontWeight: '800',
  },

  subtitulo: {
    marginTop: 11,
  },

  formulario: {
    padding: 21,
    borderWidth: 1,
    marginBottom: 34,
  },

  formularioCabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
  },

  formularioIcone: {
    width: 55,
    height: 55,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  formularioEmoji: {
    fontSize: 27,
  },

  formularioInfo: {
    flex: 1,
  },

  formularioTitulo: {
    fontWeight: '800',
  },

  formularioDescricao: {
    marginTop: 6,
  },

  campoLabel: {
    fontWeight: '800',
    marginBottom: 11,
  },

  campoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    paddingHorizontal: 13,
    minHeight: 65,
    marginBottom: 24,
  },

  campoIcone: {
    fontSize: 20,
    marginRight: 9,
  },

  campoInput: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 13,
    paddingHorizontal: 5,
  },

  informacaoCard: {
    flexDirection: 'row',
    padding: 17,
    marginBottom: 25,
  },

  informacaoEmoji: {
    fontSize: 25,
    marginRight: 12,
  },

  informacaoConteudo: {
    flex: 1,
  },

  informacaoTitulo: {
    fontWeight: '800',
  },

  informacaoTexto: {
    marginTop: 7,
  },

  termosContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 26,
    paddingVertical: 5,
  },

  checkbox: {
    width: 27,
    height: 27,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },

  checkboxTexto: {
    fontWeight: '800',
  },

  termosTexto: {
    flex: 1,
  },

  botaoContinuar: {
    paddingVertical: 19,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
  },

  botaoDesabilitado: {
    opacity: 0.6,
  },

  botaoContinuarTexto: {
    fontWeight: '800',
    textAlign: 'center',
  },

  aviso: {
    textAlign: 'center',
    marginTop: 19,
  },

  beneficiosSecao: {
    marginBottom: 30,
  },

  beneficiosEtiqueta: {
    fontWeight: '800',
    marginBottom: 10,
    letterSpacing: 0.7,
  },

  beneficiosTitulo: {
    fontWeight: '800',
  },

  beneficiosDescricao: {
    marginTop: 9,
    marginBottom: 20,
  },

  beneficioCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },

  beneficioIcone: {
    width: 54,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  beneficioEmoji: {
    fontSize: 26,
  },

  beneficioInfo: {
    flex: 1,
  },

  beneficioTitulo: {
    fontWeight: '800',
  },

  beneficioDescricao: {
    marginTop: 7,
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
    letterSpacing: 0.7,
    textAlign: 'center',
    marginTop: 30,
  },
});
