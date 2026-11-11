
import React, {
    useCallback,
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
    Keyboard,
  } from 'react-native';
  
  import AsyncStorage from '@react-native-async-storage/async-storage';
  
  import { useFocusEffect } from 'expo-router';
  
  import { useAutocuidado } from './AutocuidadoContext';
  
  // ============================================
  // TIPOS
  // ============================================
  
  type RegistroAgua = {
    data: string;
    quantidade: number;
  };
  
  type DadosAgua = {
    meta: number;
    registros: RegistroAgua[];
  };
  
  const META_INICIAL = 2000;
  
  const QUANTIDADES = [
    { quantidade: 150, emoji: '💧' },
    { quantidade: 200, emoji: '🥛' },
    { quantidade: 250, emoji: '💦' },
    { quantidade: 500, emoji: '🧴' },
  ];
  
  // ============================================
  // FUNÇÕES AUXILIARES
  // ============================================
  
  function dataLocal(data = new Date()) {
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
    const [ano, mes, dia] = data.split('-');
  
    return `${dia}/${mes}/${ano}`;
  }
  
  function chaveAgua(email: string) {
    return `@MeuAutoCuidado:agua:${email
      .trim()
      .toLowerCase()}`;
  }
  
  function formatarQuantidade(ml: number) {
    if (ml >= 1000) {
      return `${(ml / 1000)
        .toFixed(2)
        .replace('.', ',')} L`;
    }
  
    return `${ml} ml`;
  }
  
  function validarDados(valor: unknown): DadosAgua {
    if (
      !valor ||
      typeof valor !== 'object' ||
      Array.isArray(valor)
    ) {
      return {
        meta: META_INICIAL,
        registros: [],
      };
    }
  
    const dados = valor as Partial<DadosAgua>;
  
    const meta =
      typeof dados.meta === 'number' &&
      Number.isFinite(dados.meta) &&
      dados.meta >= 250 &&
      dados.meta <= 10000
        ? Math.round(dados.meta)
        : META_INICIAL;
  
    const registros = Array.isArray(dados.registros)
      ? dados.registros.filter(
          (item): item is RegistroAgua =>
            !!item &&
            typeof item.data === 'string' &&
            /^\d{4}-\d{2}-\d{2}$/.test(
              item.data
            ) &&
            typeof item.quantidade === 'number' &&
            Number.isFinite(item.quantidade) &&
            item.quantidade >= 0
        )
      : [];
  
    return {
      meta,
      registros,
    };
  }
  
  // ============================================
  // PÁGINA PRINCIPAL
  // ============================================
  
  export default function Agua() {
    const {
      usuario,
      cores,
      preferencias,
      raioCartao,
      escalaFonte,
    } = useAutocuidado();
  
    const email =
      usuario?.email?.trim().toLowerCase() || '';
  
    const escuro =
      preferencias.modoNoturno ||
      preferencias.tema === 'noite';
  
    const fonte = (valor: number) =>
      Math.round(valor * escalaFonte);
  
    const [dados, setDados] = useState<DadosAgua>({
      meta: META_INICIAL,
      registros: [],
    });
  
    const [carregando, setCarregando] =
      useState(true);
  
    const [salvando, setSalvando] =
      useState(false);
  
    const [editandoMeta, setEditandoMeta] =
      useState(false);
  
    const [textoMeta, setTextoMeta] =
      useState(String(META_INICIAL));
  
    const [ultimaAdicao, setUltimaAdicao] =
      useState<{
        data: string;
        quantidade: number;
      } | null>(null);
  
    const hoje = dataLocal();
  
    // ==========================================
    // CARREGAR DADOS
    // ==========================================
  
    const carregarDados = useCallback(
      async () => {
        setCarregando(true);
        setUltimaAdicao(null);
        setEditandoMeta(false);
  
        if (!email) {
          setDados({
            meta: META_INICIAL,
            registros: [],
          });
  
          setCarregando(false);
          return;
        }
  
        try {
          const texto = await AsyncStorage.getItem(
            chaveAgua(email)
          );
  
          const encontrados = texto
            ? validarDados(JSON.parse(texto))
            : {
                meta: META_INICIAL,
                registros: [],
              };
  
          setDados(encontrados);
          setTextoMeta(String(encontrados.meta));
        } catch (erro) {
          console.log(
            'Erro ao carregar controle de água:',
            erro
          );
  
          setDados({
            meta: META_INICIAL,
            registros: [],
          });
        } finally {
          setCarregando(false);
        }
      },
      [email]
    );
  
    useFocusEffect(
      useCallback(() => {
        carregarDados();
      }, [carregarDados])
    );
  
    // ==========================================
    // ESTATÍSTICAS DO DIA
    // ==========================================
  
    const quantidadeHoje =
      dados.registros.find(
        item => item.data === hoje
      )?.quantidade || 0;
  
    const porcentagem =
      dados.meta > 0
        ? Math.round(
            (quantidadeHoje / dados.meta) * 100
          )
        : 0;
  
    const progressoVisual = Math.min(
      100,
      porcentagem
    );
  
    const restante = Math.max(
      0,
      dados.meta - quantidadeHoje
    );
  
    const metaAtingida =
      quantidadeHoje >= dados.meta;
  
    // ==========================================
    // HISTÓRICO DOS ÚLTIMOS 7 DIAS
    // ==========================================
  
    const ultimosSeteDias = useMemo(() => {
      const lista = [];
  
      for (let i = 6; i >= 0; i--) {
        const data = new Date();
  
        data.setHours(12, 0, 0, 0);
        data.setDate(data.getDate() - i);
  
        const dataFormatada = dataLocal(data);
  
        const registro = dados.registros.find(
          item => item.data === dataFormatada
        );
  
        lista.push({
          data: dataFormatada,
          quantidade: registro?.quantidade || 0,
        });
      }
  
      return lista;
    }, [dados.registros]);
  
    const diasComMeta = dados.registros.filter(
      item => item.quantidade >= dados.meta
    ).length;
  
    const totalConsumido = dados.registros.reduce(
      (soma, item) => soma + item.quantidade,
      0
    );
  
    const mediaSemanal = Math.round(
      ultimosSeteDias.reduce(
        (soma, item) => soma + item.quantidade,
        0
      ) / 7
    );
  
    const diasRegistrados = dados.registros.filter(
      item => item.quantidade > 0
    ).length;
  
    // ==========================================
    // SALVAR DADOS
    // ==========================================
  
    async function persistirDados(
      novosDados: DadosAgua
    ) {
      if (!email) {
        Alert.alert(
          'Cadastro necessário',
          'Entre na sua conta para salvar seus registros.'
        );
        return false;
      }
  
      if (salvando) {
        return false;
      }
  
      setSalvando(true);
  
      try {
        await AsyncStorage.setItem(
          chaveAgua(email),
          JSON.stringify(novosDados)
        );
  
        setDados(novosDados);
  
        return true;
      } catch (erro) {
        console.log(
          'Erro ao salvar água:',
          erro
        );
  
        Alert.alert(
          'Erro ao salvar',
          'Não foi possível salvar seus dados. Tente novamente.'
        );
  
        return false;
      } finally {
        setSalvando(false);
      }
    }
  
    // ==========================================
    // ADICIONAR ÁGUA
    // ==========================================
  
    async function adicionarAgua(
      quantidade: number
    ) {
      if (salvando || carregando) {
        return;
      }
  
      const registroAnterior =
        dados.registros.find(
          item => item.data === hoje
        );
  
      const novaQuantidade =
        (registroAnterior?.quantidade || 0) +
        quantidade;
  
      const novosRegistros = [
        ...dados.registros.filter(
          item => item.data !== hoje
        ),
        {
          data: hoje,
          quantidade: novaQuantidade,
        },
      ].sort((a, b) =>
        b.data.localeCompare(a.data)
      );
  
      const sucesso = await persistirDados({
        ...dados,
        registros: novosRegistros,
      });
  
      if (sucesso) {
        setUltimaAdicao({
          data: hoje,
          quantidade,
        });
      }
    }
  
    // ==========================================
    // DESFAZER ÚLTIMA ADIÇÃO
    // ==========================================
  
    async function desfazerAdicao() {
      if (
        !ultimaAdicao ||
        ultimaAdicao.data !== hoje ||
        salvando
      ) {
        return;
      }
  
      const novaQuantidade = Math.max(
        0,
        quantidadeHoje - ultimaAdicao.quantidade
      );
  
      const novosRegistros =
        dados.registros
          .filter(item => item.data !== hoje);
  
      if (novaQuantidade > 0) {
        novosRegistros.push({
          data: hoje,
          quantidade: novaQuantidade,
        });
      }
  
      const sucesso = await persistirDados({
        ...dados,
        registros: novosRegistros,
      });
  
      if (sucesso) {
        setUltimaAdicao(null);
      }
    }
  
    // ==========================================
    // ALTERAR META
    // ==========================================
  
    async function salvarMeta() {
      const novaMeta = Number(
        textoMeta.replace(',', '.')
      );
  
      if (
        !Number.isInteger(novaMeta) ||
        novaMeta < 250 ||
        novaMeta > 10000
      ) {
        Alert.alert(
          'Meta inválida',
          'Digite uma quantidade entre 250 e 10.000 ml.'
        );
        return;
      }
  
      const sucesso = await persistirDados({
        ...dados,
        meta: novaMeta,
      });
  
      if (sucesso) {
        setEditandoMeta(false);
        Keyboard.dismiss();
      }
    }
  
    // ==========================================
    // ESTILOS DINÂMICOS
    // ==========================================
  
    const estiloCartao = {
      backgroundColor: cores.card,
      borderColor: cores.borda,
      borderRadius: raioCartao,
    };
  
    const raioInterno = Math.max(
      10,
      raioCartao - 8
    );
  
    // ==========================================
    // USUÁRIO NÃO IDENTIFICADO
    // ==========================================
  
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
          <Text style={{ fontSize: 45 }}>
            💧
          </Text>
  
          <Text
            style={{
              color: cores.texto,
              fontSize: fonte(20),
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
              marginTop: 10,
            }}
          >
            Seus registros de hidratação ficarão associados ao seu perfil.
          </Text>
        </View>
      );
    }
  
    // ==========================================
    // INTERFACE
    // ==========================================
  
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
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            styles.conteudo
          }
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.largura}>
            {/* CABEÇALHO */}
  
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
                  fontSize: fonte(40),
                }}
              >
                💧
              </Text>
  
              <Text
                style={{
                  color: cores.texto,
                  fontSize: fonte(26),
                  fontWeight: '900',
                  textAlign: 'center',
                  marginTop: 10,
                }}
              >
                Minha Hidratação
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
                Acompanhe seu consumo de água e cuide de você todos os dias.
              </Text>
            </View>
  
            {carregando ? (
              <ActivityIndicator
                size="large"
                color={cores.primario}
                style={{ marginTop: 35 }}
              />
            ) : (
              <>
                {/* PROGRESSO PRINCIPAL */}
  
                <View
                  style={[
                    styles.card,
                    estiloCartao,
                    styles.cardPrincipal,
                  ]}
                >
                  <Text
                    style={{
                      color: cores.secundario,
                      fontSize: fonte(13),
                      fontWeight: '700',
                      textAlign: 'center',
                    }}
                  >
                    CONSUMO DE HOJE
                  </Text>
  
                  <Text
                    style={{
                      color: cores.primario,
                      fontSize: fonte(37),
                      fontWeight: '900',
                      textAlign: 'center',
                      marginTop: 8,
                    }}
                  >
                    {formatarQuantidade(
                      quantidadeHoje
                    )}
                  </Text>
  
                  <Text
                    style={{
                      color: cores.secundario,
                      fontSize: fonte(14),
                      textAlign: 'center',
                      marginTop: 5,
                    }}
                  >
                    Meta: {formatarQuantidade(
                      dados.meta
                    )}
                  </Text>
  
                  <View
                    style={[
                      styles.barraFundo,
                      {
                        backgroundColor:
                          cores.suave,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.barraPreenchida,
                        {
                          backgroundColor:
                            cores.primario,
                          width:
                            `${progressoVisual}%` as `${number}%`,
                        },
                      ]}
                    />
                  </View>
  
                  <Text
                    style={{
                      color: cores.texto,
                      fontSize: fonte(17),
                      fontWeight: '800',
                      textAlign: 'center',
                      marginTop: 12,
                    }}
                  >
                    {porcentagem}% da meta
                  </Text>
  
                  <View
                    style={[
                      styles.mensagem,
                      {
                        backgroundColor:
                          cores.suave,
                        borderRadius: raioInterno,
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
                      {metaAtingida
                        ? '🎉 Você atingiu sua meta de hoje! Continue respeitando as necessidades do seu corpo.'
                        : quantidadeHoje === 0
                        ? '🌷 Comece registrando a água que você já bebeu hoje.'
                        : `💜 Faltam ${formatarQuantidade(
                            restante
                          )} para alcançar sua meta.`}
                    </Text>
                  </View>
                </View>
  
                {/* ADICIONAR ÁGUA */}
  
                <View
                  style={[
                    styles.card,
                    estiloCartao,
                  ]}
                >
                  <Text
                    style={{
                      color: cores.texto,
                      fontSize: fonte(19),
                      fontWeight: '800',
                      textAlign: 'center',
                    }}
                  >
                    🥛 Registrar água
                  </Text>
  
                  <Text
                    style={{
                      color: cores.secundario,
                      fontSize: fonte(13),
                      textAlign: 'center',
                      marginTop: 7,
                      marginBottom: 18,
                    }}
                  >
                    Escolha a quantidade que você bebeu.
                  </Text>
  
                  <View
                    style={styles.gradeBotoes}
                  >
                    {QUANTIDADES.map(item => (
                      <TouchableOpacity
                        key={item.quantidade}
                        disabled={salvando}
                        activeOpacity={0.8}
                        onPress={() =>
                          adicionarAgua(
                            item.quantidade
                          )
                        }
                        style={[
                          styles.botaoQuantidade,
                          {
                            backgroundColor:
                              cores.suave,
                            borderColor:
                              cores.borda,
                            borderRadius:
                              raioInterno,
                            opacity: salvando
                              ? 0.6
                              : 1,
                          },
                        ]}
                      >
                        <Text
                          style={{
                            fontSize: fonte(27),
                          }}
                        >
                          {item.emoji}
                        </Text>
  
                        <Text
                          style={{
                            color: cores.texto,
                            fontSize: fonte(15),
                            fontWeight: '800',
                            marginTop: 7,
                          }}
                        >
                          +{item.quantidade} ml
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
  
                  {ultimaAdicao &&
                    ultimaAdicao.data === hoje && (
                      <TouchableOpacity
                        disabled={salvando}
                        onPress={desfazerAdicao}
                        style={[
                          styles.botaoDesfazer,
                          {
                            borderColor:
                              cores.borda,
                            borderRadius:
                              raioInterno,
                          },
                        ]}
                      >
                        <Text
                          style={{
                            color: cores.primario,
                            fontSize: fonte(13),
                            fontWeight: '800',
                          }}
                        >
                          ↶ Desfazer última adição
                        </Text>
                      </TouchableOpacity>
                    )}
                </View>
  
                {/* META DIÁRIA */}
  
                <View
                  style={[
                    styles.card,
                    estiloCartao,
                  ]}
                >
                  <Text
                    style={{
                      color: cores.texto,
                      fontSize: fonte(19),
                      fontWeight: '800',
                      marginBottom: 8,
                    }}
                  >
                    🎯 Minha meta diária
                  </Text>
  
                  <Text
                    style={{
                      color: cores.secundario,
                      fontSize: fonte(13),
                      lineHeight: fonte(20),
                      marginBottom: 15,
                    }}
                  >
                    Personalize sua meta conforme suas necessidades e orientações de saúde.
                  </Text>
  
                  {editandoMeta ? (
                    <>
                      <TextInput
                        value={textoMeta}
                        onChangeText={setTextoMeta}
                        keyboardType="number-pad"
                        placeholder="Ex.: 2000"
                        placeholderTextColor={
                          cores.secundario
                        }
                        style={[
                          styles.campoMeta,
                          {
                            color: cores.texto,
                            backgroundColor:
                              cores.fundo,
                            borderColor:
                              cores.borda,
                            borderRadius:
                              raioInterno,
                            fontSize: fonte(17),
                          },
                        ]}
                      />
  
                      <Text
                        style={{
                          color: cores.secundario,
                          fontSize: fonte(12),
                          marginTop: 8,
                        }}
                      >
                        Informe a quantidade em mililitros (ml).
                      </Text>
  
                      <View
                        style={styles.acoesMeta}
                      >
                        <TouchableOpacity
                          onPress={() => {
                            setEditandoMeta(false);
                            setTextoMeta(
                              String(dados.meta)
                            );
                          }}
                          style={[
                            styles.botaoSecundario,
                            {
                              borderColor:
                                cores.borda,
                              borderRadius:
                                raioInterno,
                            },
                          ]}
                        >
                          <Text
                            style={{
                              color: cores.texto,
                              fontWeight: '800',
                            }}
                          >
                            Cancelar
                          </Text>
                        </TouchableOpacity>
  
                        <TouchableOpacity
                          disabled={salvando}
                          onPress={salvarMeta}
                          style={[
                            styles.botaoPrimario,
                            {
                              backgroundColor:
                                cores.primario,
                              borderRadius:
                                raioInterno,
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
                            Salvar meta
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  ) : (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() =>
                        setEditandoMeta(true)
                      }
                      style={[
                        styles.botaoMeta,
                        {
                          backgroundColor:
                            cores.suave,
                          borderRadius:
                            raioInterno,
                        },
                      ]}
                    >
                      <View>
                        <Text
                          style={{
                            color: cores.texto,
                            fontSize: fonte(19),
                            fontWeight: '900',
                          }}
                        >
                          {formatarQuantidade(
                            dados.meta
                          )}
                        </Text>
  
                        <Text
                          style={{
                            color:
                              cores.secundario,
                            fontSize: fonte(12),
                            marginTop: 4,
                          }}
                        >
                          Toque para alterar
                        </Text>
                      </View>
  
                      <Text
                        style={{
                          fontSize: fonte(23),
                          color: cores.primario,
                        }}
                      >
                        ✏️
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
  
                {/* ESTATÍSTICAS */}
  
                <View
                  style={styles.gradeEstatisticas}
                >
                  <View
                    style={[
                      styles.cardEstatistica,
                      estiloCartao,
                    ]}
                  >
                    <Text style={styles.emojiEstatistica}>
                      🏆
                    </Text>
  
                    <Text
                      style={{
                        color: cores.primario,
                        fontSize: fonte(25),
                        fontWeight: '900',
                        marginTop: 8,
                      }}
                    >
                      {diasComMeta}
                    </Text>
  
                    <Text
                      style={{
                        color: cores.secundario,
                        fontSize: fonte(12),
                        textAlign: 'center',
                      }}
                    >
                      Dias com meta atingida
                    </Text>
                  </View>
  
                  <View
                    style={[
                      styles.cardEstatistica,
                      estiloCartao,
                    ]}
                  >
                    <Text style={styles.emojiEstatistica}>
                      📅
                    </Text>
  
                    <Text
                      style={{
                        color: cores.primario,
                        fontSize: fonte(25),
                        fontWeight: '900',
                        marginTop: 8,
                      }}
                    >
                      {diasRegistrados}
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
                </View>
  
                {/* HISTÓRICO SEMANAL */}
  
                <View
                  style={[
                    styles.card,
                    estiloCartao,
                  ]}
                >
                  <Text
                    style={{
                      color: cores.texto,
                      fontSize: fonte(19),
                      fontWeight: '800',
                      marginBottom: 8,
                    }}
                  >
                    📊 Últimos 7 dias
                  </Text>
  
                  <Text
                    style={{
                      color: cores.secundario,
                      fontSize: fonte(13),
                      marginBottom: 18,
                    }}
                  >
                    Acompanhe seus registros de hidratação.
                  </Text>
  
                  {ultimosSeteDias.map(item => {
                    const percentual =
                      Math.min(
                        100,
                        (item.quantidade /
                          dados.meta) *
                          100
                      );
  
                    return (
                      <View
                        key={item.data}
                        style={styles.linhaHistorico}
                      >
                        <Text
                          style={{
                            color: cores.texto,
                            fontSize: fonte(12),
                            width: 47,
                          }}
                        >
                          {item.data.slice(8, 10)}/
                          {item.data.slice(5, 7)}
                        </Text>
  
                        <View
                          style={[
                            styles.barraHistorico,
                            {
                              backgroundColor:
                                cores.suave,
                            },
                          ]}
                        >
                          <View
                            style={{
                              width:
                                `${percentual}%` as `${number}%`,
                              height: '100%',
                              backgroundColor:
                                cores.primario,
                              borderRadius: 10,
                            }}
                          />
                        </View>
  
                        <Text
                          style={{
                            color: cores.secundario,
                            fontSize: fonte(11),
                            textAlign: 'right',
                            minWidth: 58,
                          }}
                        >
                          {item.quantidade} ml
                        </Text>
                      </View>
                    );
                  })}
  
                  <View
                    style={[
                      styles.resumoSemana,
                      {
                        backgroundColor:
                          cores.suave,
                        borderRadius:
                          raioInterno,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: cores.texto,
                        fontSize: fonte(13),
                        fontWeight: '700',
                        textAlign: 'center',
                      }}
                    >
                      Média dos últimos 7 dias:
                    </Text>
  
                    <Text
                      style={{
                        color: cores.primario,
                        fontSize: fonte(21),
                        fontWeight: '900',
                        textAlign: 'center',
                        marginTop: 5,
                      }}
                    >
                      {formatarQuantidade(
                        mediaSemanal
                      )}
                    </Text>
                  </View>
                </View>
  
                {/* HISTÓRICO GERAL */}
  
                <View
                  style={[
                    styles.card,
                    estiloCartao,
                  ]}
                >
                  <Text
                    style={{
                      color: cores.texto,
                      fontSize: fonte(19),
                      fontWeight: '800',
                      marginBottom: 15,
                    }}
                  >
                    📖 Meu histórico
                  </Text>
  
                  <View
                    style={[
                      styles.resumoTotal,
                      {
                        backgroundColor:
                          cores.suave,
                        borderRadius:
                          raioInterno,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: cores.secundario,
                        fontSize: fonte(13),
                        textAlign: 'center',
                      }}
                    >
                      Total de água registrada
                    </Text>
  
                    <Text
                      style={{
                        color: cores.primario,
                        fontSize: fonte(23),
                        fontWeight: '900',
                        marginTop: 5,
                      }}
                    >
                      {formatarQuantidade(
                        totalConsumido
                      )}
                    </Text>
                  </View>
  
                  {dados.registros.length === 0 ? (
                    <Text
                      style={{
                        color: cores.secundario,
                        fontSize: fonte(13),
                        textAlign: 'center',
                        marginTop: 18,
                      }}
                    >
                      Seus registros aparecerão aqui quando você começar.
                    </Text>
                  ) : (
                    [...dados.registros]
                      .sort((a, b) =>
                        b.data.localeCompare(a.data)
                      )
                      .slice(0, 15)
                      .map(item => (
                        <View
                          key={item.data}
                          style={[
                            styles.itemHistorico,
                            {
                              borderBottomColor:
                                cores.borda,
                            },
                          ]}
                        >
                          <View
                            style={{ flex: 1 }}
                          >
                            <Text
                              style={{
                                color: cores.texto,
                                fontSize: fonte(14),
                                fontWeight: '800',
                              }}
                            >
                              {formatarData(
                                item.data
                              )}
                            </Text>
  
                            <Text
                              style={{
                                color:
                                  cores.secundario,
                                fontSize: fonte(12),
                                marginTop: 4,
                              }}
                            >
                              {item.quantidade >=
                              dados.meta
                                ? '🏆 Meta atingida'
                                : '💧 Registro do dia'}
                            </Text>
                          </View>
  
                          <Text
                            style={{
                              color: cores.primario,
                              fontSize: fonte(14),
                              fontWeight: '800',
                            }}
                          >
                            {formatarQuantidade(
                              item.quantidade
                            )}
                          </Text>
                        </View>
                      ))
                  )}
                </View>
  
                {/* LEMBRETE */}
  
                <View
                  style={[
                    styles.lembrete,
                    {
                      backgroundColor:
                        cores.suave,
                      borderRadius:
                        raioCartao,
                    },
                  ]}
                >
                  <Text
                    style={{
                      fontSize: fonte(28),
                    }}
                  >
                    🌷
                  </Text>
  
                  <Text
                    style={{
                      color: cores.texto,
                      fontSize: fonte(14),
                      fontWeight: '800',
                      textAlign: 'center',
                      marginTop: 8,
                    }}
                  >
                    Um lembrete carinhoso
                  </Text>
  
                  <Text
                    style={{
                      color: cores.secundario,
                      fontSize: fonte(12),
                      textAlign: 'center',
                      lineHeight: fonte(19),
                      marginTop: 7,
                    }}
                  >
                    A quantidade de água necessária varia de pessoa para pessoa. Observe sua sede, sua rotina e suas necessidades de saúde. Não é preciso beber grandes quantidades de uma só vez.
                  </Text>
                </View>
              </>
            )}
          </View>
        </ScrollView>
      </View>
    );
  }
  
  // ============================================
  // ESTILOS
  // ============================================
  
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
  
    card: {
      borderWidth: 1,
      padding: 20,
      marginBottom: 16,
    },
  
    cardPrincipal: {
      paddingVertical: 28,
    },
  
    barraFundo: {
      width: '100%',
      height: 15,
      borderRadius: 20,
      overflow: 'hidden',
      marginTop: 22,
    },
  
    barraPreenchida: {
      height: '100%',
      borderRadius: 20,
    },
  
    mensagem: {
      padding: 15,
      marginTop: 20,
    },
  
    gradeBotoes: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: 12,
    },
  
    botaoQuantidade: {
      width: '47%',
      minHeight: 104,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 12,
    },
  
    botaoDesfazer: {
      borderWidth: 1,
      padding: 13,
      alignItems: 'center',
      marginTop: 15,
    },
  
    botaoMeta: {
      padding: 17,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
  
    campoMeta: {
      borderWidth: 1,
      padding: 14,
      minHeight: 52,
    },
  
    acoesMeta: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 15,
    },
  
    botaoSecundario: {
      flex: 1,
      minHeight: 48,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
  
    botaoPrimario: {
      flex: 1,
      minHeight: 48,
      alignItems: 'center',
      justifyContent: 'center',
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
  
    emojiEstatistica: {
      fontSize: 27,
    },
  
    linhaHistorico: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 9,
      marginBottom: 15,
    },
  
    barraHistorico: {
      flex: 1,
      height: 12,
      borderRadius: 10,
      overflow: 'hidden',
    },
  
    resumoSemana: {
      padding: 17,
      marginTop: 12,
    },
  
    resumoTotal: {
      alignItems: 'center',
      padding: 17,
      marginBottom: 10,
    },
  
    itemHistorico: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 15,
      borderBottomWidth: 1,
    },
  
    lembrete: {
      padding: 22,
      alignItems: 'center',
      marginBottom: 10,
    },
  });
  