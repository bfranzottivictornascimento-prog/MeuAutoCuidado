
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
    TouchableOpacity,
    TextInput,
    StyleSheet,
    StatusBar,
    ActivityIndicator,
    Alert,
    Platform,
  } from 'react-native';
  
  import AsyncStorage from '@react-native-async-storage/async-storage';
  
  import { useFocusEffect } from 'expo-router';
  
  import { useAutocuidado } from './AutocuidadoContext';
  
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
  
  const OPCOES: {
    id: TipoHumor;
    nome: string;
    emoji: string;
    valor: number;
    dica: string;
  }[] = [
    {
      id: 'muito_feliz',
      nome: 'Muito feliz',
      emoji: '😄',
      valor: 5,
      dica: 'Aproveite esse momento e registre o que fez seu dia especial.',
    },
    {
      id: 'bem',
      nome: 'Bem',
      emoji: '😊',
      valor: 4,
      dica: 'Que bom! Continue reservando momentos para cuidar de você.',
    },
    {
      id: 'tranquilo',
      nome: 'Tranquilo',
      emoji: '😌',
      valor: 4,
      dica: 'Valorize essa tranquilidade e mantenha os hábitos que fazem bem.',
    },
    {
      id: 'ansioso',
      nome: 'Ansioso',
      emoji: '😟',
      valor: 2,
      dica: 'Experimente respirar devagar e fazer uma pequena pausa.',
    },
    {
      id: 'triste',
      nome: 'Triste',
      emoji: '😢',
      valor: 1,
      dica: 'Respeite seus sentimentos. Conversar com alguém de confiança pode ajudar.',
    },
    {
      id: 'cansado',
      nome: 'Cansado',
      emoji: '😴',
      valor: 2,
      dica: 'Talvez seja um bom momento para descansar e diminuir as cobranças.',
    },
  ];
  
  function obterDataLocal(data = new Date()) {
    const ano = data.getFullYear();
  
    const mes = String(
      data.getMonth() + 1
    ).padStart(2, '0');
  
    const dia = String(
      data.getDate()
    ).padStart(2, '0');
  
    return `${ano}-${mes}-${dia}`;
  }
  
  function formatarData(data: string) {
    const partes = data.split('-');
  
    if (partes.length !== 3) {
      return data;
    }
  
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }
  
  function chaveHumor(email: string) {
    return `@MeuAutoCuidado:humor:${email
      .trim()
      .toLowerCase()}`;
  }
  
  export default function Humor() {
    const {
      usuario,
      cores,
      preferencias,
      raioCartao,
      escalaFonte,
    } = useAutocuidado();
  
    const [registros, setRegistros] =
      useState<RegistroHumor[]>([]);
  
    const [humorSelecionado, setHumorSelecionado] =
      useState<TipoHumor | null>(null);
  
    const [observacao, setObservacao] =
      useState('');
  
    const [carregando, setCarregando] =
      useState(true);
  
    const [salvando, setSalvando] =
      useState(false);
  
    const email = usuario?.email
      ?.trim()
      .toLowerCase() || '';
  
    const escuro =
      preferencias.modoNoturno ||
      preferencias.tema === 'noite';
  
    const fonte = (tamanho: number) =>
      Math.round(tamanho * escalaFonte);
  
    const hoje = obterDataLocal();
  
    const carregarRegistros = useCallback(
      async () => {
        setCarregando(true);
        setRegistros([]);
        setHumorSelecionado(null);
        setObservacao('');
  
        if (!email) {
          setCarregando(false);
          return;
        }
  
        try {
          const texto = await AsyncStorage.getItem(
            chaveHumor(email)
          );
  
          const dados = texto
            ? JSON.parse(texto)
            : [];
  
          const lista: RegistroHumor[] =
            Array.isArray(dados)
              ? dados.filter(
                  (item): item is RegistroHumor =>
                    !!item &&
                    typeof item.id === 'string' &&
                    typeof item.data === 'string' &&
                    typeof item.humor === 'string' &&
                    typeof item.observacao === 'string' &&
                    OPCOES.some(
                      opcao =>
                        opcao.id === item.humor
                    )
                )
              : [];
  
          lista.sort((a, b) =>
            b.data.localeCompare(a.data)
          );
  
          setRegistros(lista);
  
          const registroHoje = lista.find(
            item => item.data === obterDataLocal()
          );
  
          if (registroHoje) {
            setHumorSelecionado(
              registroHoje.humor
            );
  
            setObservacao(
              registroHoje.observacao
            );
          }
        } catch (erro) {
          console.log(
            'Erro ao carregar humor:',
            erro
          );
        } finally {
          setCarregando(false);
        }
      },
      [email]
    );
  
    useFocusEffect(
      useCallback(() => {
        carregarRegistros();
      }, [carregarRegistros])
    );
  
    const opcaoAtual = OPCOES.find(
      opcao =>
        opcao.id === humorSelecionado
    );
  
    const ultimosSeteDias = useMemo(() => {
      const datas: string[] = [];
  
      for (let i = 6; i >= 0; i--) {
        const data = new Date();
        data.setHours(12, 0, 0, 0);
        data.setDate(data.getDate() - i);
  
        datas.push(obterDataLocal(data));
      }
  
      return datas.map(data => ({
        data,
        registro: registros.find(
          item => item.data === data
        ),
      }));
    }, [registros]);
  
    const totalRegistros = registros.length;
  
    const diasRegistradosSemana =
      ultimosSeteDias.filter(
        item => !!item.registro
      ).length;
  
    const humorMaisFrequente = useMemo(() => {
      if (!registros.length) {
        return null;
      }
  
      const contagens = OPCOES.map(opcao => ({
        ...opcao,
        total: registros.filter(
          item => item.humor === opcao.id
        ).length,
      }));
  
      contagens.sort(
        (a, b) => b.total - a.total
      );
  
      return contagens[0];
    }, [registros]);
  
    async function salvarHumor() {
      if (!email) {
        Alert.alert(
          'Cadastro necessário',
          'Entre na sua conta antes de registrar seu humor.'
        );
        return;
      }
  
      if (!humorSelecionado) {
        Alert.alert(
          'Escolha seu humor',
          'Selecione como você está se sentindo hoje.'
        );
        return;
      }
  
      if (salvando) {
        return;
      }
  
      setSalvando(true);
  
      try {
        const registro: RegistroHumor = {
          id: hoje,
          data: hoje,
          humor: humorSelecionado,
          observacao: observacao.trim(),
        };
  
        const textoAnterior =
          await AsyncStorage.getItem(
            chaveHumor(email)
          );
  
        const dadosAnteriores =
          textoAnterior
            ? JSON.parse(textoAnterior)
            : [];
  
        const anteriores: RegistroHumor[] =
          Array.isArray(dadosAnteriores)
            ? dadosAnteriores
            : [];
  
        const atualizados = [
          registro,
          ...anteriores.filter(
            item => item.data !== hoje
          ),
        ].sort((a, b) =>
          b.data.localeCompare(a.data)
        );
  
        await AsyncStorage.setItem(
          chaveHumor(email),
          JSON.stringify(atualizados)
        );
  
        setRegistros(atualizados);
  
        Alert.alert(
          'Humor registrado! 💜',
          'Seu registro de hoje foi salvo com sucesso.'
        );
      } catch (erro) {
        console.log(
          'Erro ao salvar humor:',
          erro
        );
  
        Alert.alert(
          'Erro ao salvar',
          'Não foi possível salvar seu registro. Tente novamente.'
        );
      } finally {
        setSalvando(false);
      }
    }
  
    const cartao = {
      backgroundColor: cores.card,
      borderColor: cores.borda,
      borderRadius: raioCartao,
    };
  
    if (!email) {
      return (
        <View
          style={[
            styles.centralizado,
            {
              backgroundColor: cores.fundo,
            },
          ]}
        >
          <Text
            style={{
              fontSize: fonte(38),
            }}
          >
            🌷
          </Text>
  
          <Text
            style={{
              color: cores.texto,
              fontSize: fonte(19),
              fontWeight: '800',
              textAlign: 'center',
              marginTop: 12,
            }}
          >
            Faça seu cadastro primeiro
          </Text>
  
          <Text
            style={{
              color: cores.secundario,
              fontSize: fonte(14),
              textAlign: 'center',
              marginTop: 8,
            }}
          >
            Seus registros de humor ficam associados à sua conta.
          </Text>
        </View>
      );
    }
  
    return (
      <View
        style={[
          styles.tela,
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
          contentContainerStyle={
            styles.conteudo
          }
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.largura}>
            <View
              style={[
                styles.cabecalho,
                {
                  backgroundColor: cores.suave,
                  borderRadius: raioCartao,
                },
              ]}
            >
              <Text
                style={{
                  fontSize: fonte(35),
                }}
              >
                💜
              </Text>
  
              <Text
                style={[
                  styles.titulo,
                  {
                    color: cores.texto,
                    fontSize: fonte(26),
                  },
                ]}
              >
                Meu Humor
              </Text>
  
              <Text
                style={{
                  color: cores.secundario,
                  fontSize: fonte(14),
                  textAlign: 'center',
                  lineHeight: fonte(21),
                  marginTop: 8,
                }}
              >
                Um espaço para reconhecer seus sentimentos e acompanhar seu bem-estar.
              </Text>
            </View>
  
            {carregando ? (
              <ActivityIndicator
                size="large"
                color={cores.primario}
                style={{
                  marginTop: 35,
                }}
              />
            ) : (
              <>
                <View
                  style={[
                    styles.card,
                    cartao,
                  ]}
                >
                  <Text
                    style={[
                      styles.tituloSecao,
                      {
                        color: cores.texto,
                        fontSize: fonte(19),
                      },
                    ]}
                  >
                    Como você está hoje?
                  </Text>
  
                  <Text
                    style={{
                      color: cores.secundario,
                      fontSize: fonte(13),
                      textAlign: 'center',
                      marginBottom: 18,
                    }}
                  >
                    {formatarData(hoje)}
                  </Text>
  
                  <View
                    style={
                      styles.gradeHumores
                    }
                  >
                    {OPCOES.map(opcao => {
                      const selecionado =
                        humorSelecionado ===
                        opcao.id;
  
                      return (
                        <TouchableOpacity
                          key={opcao.id}
                          activeOpacity={0.8}
                          onPress={() =>
                            setHumorSelecionado(
                              opcao.id
                            )
                          }
                          style={[
                            styles.botaoHumor,
                            {
                              backgroundColor:
                                selecionado
                                  ? cores.suave
                                  : cores.fundo,
  
                              borderColor:
                                selecionado
                                  ? cores.primario
                                  : cores.borda,
  
                              borderRadius:
                                Math.max(
                                  10,
                                  raioCartao - 7
                                ),
  
                              borderWidth:
                                selecionado
                                  ? 2
                                  : 1,
                            },
                          ]}
                        >
                          <Text
                            style={{
                              fontSize: fonte(30),
                            }}
                          >
                            {opcao.emoji}
                          </Text>
  
                          <Text
                            style={{
                              color: selecionado
                                ? cores.primario
                                : cores.texto,
  
                              fontSize: fonte(12),
                              fontWeight: '700',
                              textAlign: 'center',
                              marginTop: 8,
                            }}
                          >
                            {opcao.nome}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
  
                  {opcaoAtual && (
                    <View
                      style={[
                        styles.dica,
                        {
                          backgroundColor:
                            cores.suave,
                          borderRadius:
                            Math.max(
                              10,
                              raioCartao - 8
                            ),
                        },
                      ]}
                    >
                      <Text
                        style={{
                          color: cores.texto,
                          fontSize: fonte(13),
                          lineHeight: fonte(20),
                          textAlign: 'center',
                        }}
                      >
                        {opcaoAtual.dica}
                      </Text>
                    </View>
                  )}
                </View>
  
                <View
                  style={[
                    styles.card,
                    cartao,
                  ]}
                >
                  <Text
                    style={{
                      color: cores.texto,
                      fontSize: fonte(18),
                      fontWeight: '800',
                      marginBottom: 8,
                    }}
                  >
                    📝 Diário emocional
                  </Text>
  
                  <Text
                    style={{
                      color: cores.secundario,
                      fontSize: fonte(13),
                      marginBottom: 15,
                      lineHeight: fonte(20),
                    }}
                  >
                    Quer contar o que aconteceu hoje? Esse espaço é seu.
                  </Text>
  
                  <TextInput
                    value={observacao}
                    onChangeText={setObservacao}
                    multiline
                    maxLength={1000}
                    textAlignVertical="top"
                    placeholder="Escreva sobre seu dia, sentimentos ou pensamentos..."
                    placeholderTextColor={
                      cores.secundario
                    }
                    style={[
                      styles.campo,
                      {
                        backgroundColor:
                          cores.fundo,
  
                        color: cores.texto,
                        borderColor:
                          cores.borda,
  
                        borderRadius:
                          Math.max(
                            10,
                            raioCartao - 8
                          ),
  
                        fontSize: fonte(14),
                      },
                    ]}
                  />
  
                  <Text
                    style={{
                      color: cores.secundario,
                      fontSize: fonte(11),
                      textAlign: 'right',
                      marginTop: 6,
                    }}
                  >
                    {observacao.length}/1000
                  </Text>
  
                  <TouchableOpacity
                    activeOpacity={0.85}
                    disabled={salvando}
                    onPress={salvarHumor}
                    style={[
                      styles.botaoSalvar,
                      {
                        backgroundColor:
                          cores.primario,
  
                        borderRadius:
                          Math.max(
                            10,
                            raioCartao - 8
                          ),
  
                        opacity:
                          salvando ? 0.65 : 1,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color:
                          cores.textoBotao,
  
                        fontSize: fonte(15),
                        fontWeight: '800',
                      }}
                    >
                      {salvando
                        ? 'Salvando...'
                        : 'Salvar meu humor 💜'}
                    </Text>
                  </TouchableOpacity>
                </View>
  
                <View
                  style={
                    styles.gradeEstatisticas
                  }
                >
                  <View
                    style={[
                      styles.cardEstatistica,
                      cartao,
                    ]}
                  >
                    <Text
                      style={{
                        fontSize: fonte(25),
                      }}
                    >
                      📅
                    </Text>
  
                    <Text
                      style={{
                        color: cores.primario,
                        fontSize: fonte(25),
                        fontWeight: '900',
                        marginTop: 7,
                      }}
                    >
                      {totalRegistros}
                    </Text>
  
                    <Text
                      style={{
                        color: cores.secundario,
                        fontSize: fonte(12),
                        textAlign: 'center',
                      }}
                    >
                      Dias registrados
                    </Text>
                  </View>
  
                  <View
                    style={[
                      styles.cardEstatistica,
                      cartao,
                    ]}
                  >
                    <Text
                      style={{
                        fontSize: fonte(25),
                      }}
                    >
                      🌷
                    </Text>
  
                    <Text
                      style={{
                        color: cores.primario,
                        fontSize: fonte(25),
                        fontWeight: '900',
                        marginTop: 7,
                      }}
                    >
                      {diasRegistradosSemana}/7
                    </Text>
  
                    <Text
                      style={{
                        color: cores.secundario,
                        fontSize: fonte(12),
                        textAlign: 'center',
                      }}
                    >
                      Últimos 7 dias
                    </Text>
                  </View>
                </View>
  
                <View
                  style={[
                    styles.card,
                    cartao,
                  ]}
                >
                  <Text
                    style={{
                      color: cores.texto,
                      fontSize: fonte(18),
                      fontWeight: '800',
                      marginBottom: 15,
                    }}
                  >
                    📊 Minha semana emocional
                  </Text>
  
                  <View
                    style={
                      styles.gradeSemana
                    }
                  >
                    {ultimosSeteDias.map(
                      item => {
                        const opcao =
                          OPCOES.find(
                            o =>
                              o.id ===
                              item.registro?.humor
                          );
  
                        return (
                          <View
                            key={item.data}
                            style={
                              styles.diaSemana
                            }
                          >
                            <Text
                              style={{
                                color:
                                  cores.secundario,
  
                                fontSize:
                                  fonte(10),
                              }}
                            >
                              {
                                item.data.split(
                                  '-'
                                )[2]
                              }
                            </Text>
  
                            <View
                              style={[
                                styles.circuloSemana,
                                {
                                  backgroundColor:
                                    cores.suave,
  
                                  borderRadius: 50,
                                },
                              ]}
                            >
                              <Text
                                style={{
                                  fontSize:
                                    fonte(19),
                                }}
                              >
                                {opcao?.emoji ||
                                  '—'}
                              </Text>
                            </View>
                          </View>
                        );
                      }
                    )}
                  </View>
  
                  <Text
                    style={{
                      color: cores.secundario,
                      fontSize: fonte(12),
                      textAlign: 'center',
                      marginTop: 15,
                    }}
                  >
                    Cada registro representa um momento de atenção com você.
                  </Text>
                </View>
  
                <View
                  style={[
                    styles.card,
                    cartao,
                  ]}
                >
                  <Text
                    style={{
                      color: cores.texto,
                      fontSize: fonte(18),
                      fontWeight: '800',
                      marginBottom: 14,
                    }}
                  >
                    💗 Humor mais frequente
                  </Text>
  
                  {humorMaisFrequente ? (
                    <View
                      style={
                        styles.humorFrequente
                      }
                    >
                      <Text
                        style={{
                          fontSize: fonte(34),
                        }}
                      >
                        {
                          humorMaisFrequente.emoji
                        }
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
                            fontSize: fonte(15),
                            fontWeight: '800',
                          }}
                        >
                          {
                            humorMaisFrequente.nome
                          }
                        </Text>
  
                        <Text
                          style={{
                            color:
                              cores.secundario,
  
                            fontSize: fonte(12),
                            marginTop: 3,
                          }}
                        >
                          Registrado em{' '}
                          {
                            humorMaisFrequente.total
                          }{' '}
                          dia(s).
                        </Text>
                      </View>
                    </View>
                  ) : (
                    <Text
                      style={{
                        color: cores.secundario,
                        fontSize: fonte(13),
                      }}
                    >
                      Registre seu humor para visualizar suas estatísticas.
                    </Text>
                  )}
                </View>
  
                <View
                  style={[
                    styles.card,
                    cartao,
                  ]}
                >
                  <Text
                    style={{
                      color: cores.texto,
                      fontSize: fonte(18),
                      fontWeight: '800',
                      marginBottom: 15,
                    }}
                  >
                    📖 Histórico de emoções
                  </Text>
  
                  {registros.length === 0 ? (
                    <Text
                      style={{
                        color: cores.secundario,
                        fontSize: fonte(13),
                        textAlign: 'center',
                        paddingVertical: 12,
                      }}
                    >
                      Você ainda não possui registros de humor.
                    </Text>
                  ) : (
                    registros
                      .slice(0, 20)
                      .map(registro => {
                        const opcao =
                          OPCOES.find(
                            item =>
                              item.id ===
                              registro.humor
                          );
  
                        return (
                          <View
                            key={registro.id}
                            style={[
                              styles.itemHistorico,
                              {
                                borderBottomColor:
                                  cores.borda,
                              },
                            ]}
                          >
                            <Text
                              style={{
                                fontSize:
                                  fonte(27),
                              }}
                            >
                              {opcao?.emoji ||
                                '💜'}
                            </Text>
  
                            <View
                              style={{
                                flex: 1,
                                marginLeft: 12,
                              }}
                            >
                              <Text
                                style={{
                                  color:
                                    cores.texto,
  
                                  fontSize:
                                    fonte(14),
  
                                  fontWeight:
                                    '800',
                                }}
                              >
                                {opcao?.nome ||
                                  'Humor'}
                              </Text>
  
                              <Text
                                style={{
                                  color:
                                    cores.secundario,
  
                                  fontSize:
                                    fonte(12),
  
                                  marginTop: 3,
                                }}
                              >
                                {formatarData(
                                  registro.data
                                )}
                              </Text>
  
                              {!!registro.observacao && (
                                <Text
                                  style={{
                                    color:
                                      cores.texto,
  
                                    fontSize:
                                      fonte(12),
  
                                    marginTop: 8,
                                    lineHeight:
                                      fonte(18),
                                  }}
                                >
                                  {
                                    registro.observacao
                                  }
                                </Text>
                              )}
                            </View>
                          </View>
                        );
                      })
                  )}
                </View>
              </>
            )}
          </View>
        </ScrollView>
      </View>
    );
  }
  
  const styles = StyleSheet.create({
    tela: {
      flex: 1,
    },
  
    conteudo: {
      paddingHorizontal: 16,
      paddingTop: 20,
      paddingBottom: 40,
      alignItems: 'center',
    },
  
    largura: {
      width: '100%',
      maxWidth: 850,
    },
  
    centralizado: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 25,
    },
  
    cabecalho: {
      padding: 25,
      alignItems: 'center',
      marginBottom: 18,
    },
  
    titulo: {
      fontWeight: '900',
      textAlign: 'center',
      marginTop: 8,
    },
  
    card: {
      borderWidth: 1,
      padding: 20,
      marginBottom: 16,
    },
  
    tituloSecao: {
      fontWeight: '800',
      textAlign: 'center',
      marginBottom: 7,
    },
  
    gradeHumores: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: 10,
    },
  
    botaoHumor: {
      width: '31%',
      minHeight: 105,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 8,
    },
  
    dica: {
      padding: 15,
      marginTop: 18,
    },
  
    campo: {
      minHeight: 120,
      borderWidth: 1,
      padding: 14,
    },
  
    botaoSalvar: {
      minHeight: 52,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 17,
      paddingHorizontal: 15,
    },
  
    gradeEstatisticas: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 16,
    },
  
    cardEstatistica: {
      flex: 1,
      borderWidth: 1,
      padding: 18,
      alignItems: 'center',
    },
  
    gradeSemana: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 3,
    },
  
    diaSemana: {
      flex: 1,
      alignItems: 'center',
      gap: 8,
    },
  
    circuloSemana: {
      width: 35,
      height: 35,
      alignItems: 'center',
      justifyContent: 'center',
    },
  
    humorFrequente: {
      flexDirection: 'row',
      alignItems: 'center',
    },
  
    itemHistorico: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingVertical: 15,
      borderBottomWidth: 1,
    },
  });
  