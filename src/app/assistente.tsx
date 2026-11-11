
import React, {
    useCallback,
    useEffect,
    useRef,
    useState,
  } from 'react';
  
  import {
    View,
    Text,
    ScrollView,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert,
    Keyboard,
  } from 'react-native';
  
  import AsyncStorage from '@react-native-async-storage/async-storage';
  
  import { router } from 'expo-router';
  
  import { useAutocuidado } from './AutocuidadoContext';
  
  // ============================================
  // TIPOS
  // ============================================
  
  type Mensagem = {
    id: string;
    texto: string;
    autor: 'usuario' | 'assistente';
    horario: string;
  };
  
  type Sugestao = {
    emoji: string;
    titulo: string;
    pergunta: string;
  };
  
  type RespostaAssistente = {
    texto: string;
    rota?: string;
    tituloRota?: string;
  };
  
  // ============================================
  // SUGESTÕES RÁPIDAS
  // ============================================
  
  const SUGESTOES: Sugestao[] = [
    {
      emoji: '💜',
      titulo: 'Estou ansiosa',
      pergunta: 'Estou me sentindo ansiosa',
    },
    {
      emoji: '🌙',
      titulo: 'Quero dormir melhor',
      pergunta: 'Como posso dormir melhor?',
    },
    {
      emoji: '🌷',
      titulo: 'Preciso de motivação',
      pergunta: 'Preciso de motivação',
    },
    {
      emoji: '🧘',
      titulo: 'Quero relaxar',
      pergunta: 'Me ajude a relaxar',
    },
    {
      emoji: '💧',
      titulo: 'Beber mais água',
      pergunta: 'Como posso beber mais água?',
    },
    {
      emoji: '📚',
      titulo: 'Quero estudar',
      pergunta: 'Como posso melhorar meus estudos?',
    },
    {
      emoji: '😢',
      titulo: 'Estou triste',
      pergunta: 'Estou me sentindo triste',
    },
    {
      emoji: '✨',
      titulo: 'Minha rotina',
      pergunta: 'Como está minha rotina?',
    },
  ];
  
  // ============================================
  // FUNÇÕES AUXILIARES
  // ============================================
  
  function horarioAtual() {
    const agora = new Date();
  
    const horas = String(
      agora.getHours()
    ).padStart(2, '0');
  
    const minutos = String(
      agora.getMinutes()
    ).padStart(2, '0');
  
    return `${horas}:${minutos}`;
  }
  
  function criarId() {
    return (
      Date.now().toString() +
      '-' +
      Math.random().toString(36).slice(2, 9)
    );
  }
  
  function normalizarTexto(texto: string) {
    return texto
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }
  
  function contem(
    texto: string,
    palavras: string[]
  ) {
    return palavras.some(palavra =>
      texto.includes(palavra)
    );
  }
  
  function mensagemBoasVindas(nome: string): Mensagem {
    return {
      id: 'boas-vindas',
      autor: 'assistente',
      horario: horarioAtual(),
      texto:
        `Olá${nome ? `, ${nome}` : ''}! 💜\n\n` +
        'Eu sou seu Assistente de Autocuidado.\n\n' +
        'Estou aqui para ajudar você a organizar sua rotina, encontrar momentos de tranquilidade e descobrir pequenos hábitos para cuidar melhor de si.\n\n' +
        'Como você está se sentindo hoje?',
    };
  }
  
  // ============================================
  // RESPOSTAS DO ASSISTENTE
  // ============================================
  
  function gerarResposta(
    perguntaOriginal: string,
    nome: string,
    concluidas: number,
    total: number,
    progresso: number,
    dicasPersonalizadas: string[]
  ): RespostaAssistente {
    const pergunta = normalizarTexto(
      perguntaOriginal
    );
  
    const primeiroNome = nome || 'você';
  
    // Situações de emergência emocional
  
    if (
      contem(pergunta, [
        'suicidio',
        'me matar',
        'tirar minha vida',
        'nao quero viver',
        'me machucar',
        'automutilacao',
        'acabar com tudo',
      ])
    ) {
      return {
        texto:
          'Sinto muito que você esteja passando por um momento tão difícil. 💜\n\n' +
          'Sua segurança é importante. Se houver risco imediato de você se machucar, procure alguém de confiança para ficar com você e ligue para o SAMU (192) ou para a emergência local.\n\n' +
          'No Brasil, você também pode conversar gratuitamente com o CVV pelo número 188, disponível 24 horas.\n\n' +
          'Você não precisa enfrentar esse momento sozinha.',
      };
    }
  
    // Ansiedade
  
    if (
      contem(pergunta, [
        'ansiosa',
        'ansioso',
        'ansiedade',
        'nervosa',
        'nervoso',
        'preocupada',
        'preocupado',
        'panico',
      ])
    ) {
      return {
        texto:
          `${primeiroNome}, quando a ansiedade aparece, uma pausa pode ajudar. 💜\n\n` +
          'Experimente este exercício:\n\n' +
          '🌷 1. Sente-se em um lugar confortável.\n' +
          '🌷 2. Inspire suavemente por 4 segundos.\n' +
          '🌷 3. Solte o ar devagar por 6 segundos.\n' +
          '🌷 4. Repita algumas vezes, sem forçar a respiração.\n\n' +
          'Depois, tente identificar uma coisa que você consegue fazer agora, sem precisar resolver tudo de uma vez.\n\n' +
          'Se a ansiedade estiver intensa ou frequente, conversar com um profissional de saúde mental pode ajudar.',
        rota: '/relaxamento',
        tituloRota: 'Abrir relaxamento 🧘',
      };
    }
  
    // Tristeza
  
    if (
      contem(pergunta, [
        'triste',
        'tristeza',
        'chorando',
        'chorar',
        'desanimada',
        'desanimado',
        'sozinha',
        'sozinho',
      ])
    ) {
      return {
        texto:
          'Sinto muito que seu dia esteja difícil. 💗\n\n' +
          'Você não precisa estar feliz o tempo todo. Seus sentimentos merecem atenção e respeito.\n\n' +
          'Algumas coisas que podem ajudar:\n\n' +
          '🌷 Conversar com alguém em quem você confia.\n' +
          '🌷 Fazer uma pausa para descansar.\n' +
          '🌷 Escrever o que está sentindo.\n' +
          '🌷 Fazer algo simples que normalmente lhe traz conforto.\n\n' +
          'Que tal registrar seu sentimento no diário emocional?\n\n' +
          'Se essa tristeza persistir ou prejudicar seu dia a dia, considere procurar apoio profissional.',
        rota: '/humor',
        tituloRota: 'Registrar meu humor 💗',
      };
    }
  
    // Sono
  
    if (
      contem(pergunta, [
        'dormir',
        'sono',
        'insonia',
        'acordando',
        'descansar melhor',
      ])
    ) {
      return {
        texto:
          'Uma boa noite de sono começa com pequenos hábitos. 🌙\n\n' +
          'Aqui estão algumas sugestões:\n\n' +
          '✨ Tente dormir e acordar em horários parecidos.\n' +
          '✨ Diminua o uso de telas perto da hora de dormir.\n' +
          '✨ Deixe o ambiente confortável e tranquilo.\n' +
          '✨ Evite bebidas com cafeína no fim do dia.\n' +
          '✨ Crie um pequeno ritual de relaxamento.\n\n' +
          'Você pode começar hoje com alguns minutos de respiração tranquila.',
        rota: '/relaxamento',
        tituloRota: 'Fazer relaxamento 🌙',
      };
    }
  
    // Água
  
    if (
      contem(pergunta, [
        'agua',
        'hidratacao',
        'hidratada',
        'hidratado',
        'beber mais',
      ])
    ) {
      return {
        texto:
          'Manter uma boa hidratação é um cuidado importante. 💧\n\n' +
          'Algumas ideias para lembrar de beber água:\n\n' +
          '💧 Tenha uma garrafinha por perto.\n' +
          '💧 Beba um pouco de água ao acordar.\n' +
          '💧 Associe o hábito a momentos da rotina.\n' +
          '💧 Registre o consumo no aplicativo.\n\n' +
          'A quantidade ideal varia conforme a pessoa, o clima e a atividade física. Respeite suas necessidades e eventuais orientações médicas.\n\n' +
          'Você pode acompanhar tudo na página Minha Água!',
        rota: '/agua',
        tituloRota: 'Abrir Minha Água 💧',
      };
    }
  
    // Estudos
  
    if (
      contem(pergunta, [
        'estudar',
        'estudo',
        'estudos',
        'escola',
        'prova',
        'concentracao',
        'foco',
        'aprender',
      ])
    ) {
      return {
        texto:
          'Organizar os estudos também é uma forma de autocuidado. 📚\n\n' +
          'Experimente estas estratégias:\n\n' +
          '📖 Defina uma meta pequena para cada sessão.\n' +
          '⏰ Estude por 25 minutos e faça uma pausa curta.\n' +
          '📝 Faça resumos com suas próprias palavras.\n' +
          '📵 Afaste distrações durante o estudo.\n' +
          '🌷 Reserve tempo para descansar.\n\n' +
          'Lembre-se: estudar com constância costuma ser mais produtivo do que tentar aprender tudo de uma vez.',
      };
    }
  
    // Motivação
  
    if (
      contem(pergunta, [
        'motivacao',
        'motivada',
        'motivado',
        'preguica',
        'desistir',
        'sem vontade',
        'incentivo',
      ])
    ) {
      return {
        texto:
          `${primeiroNome}, você não precisa fazer tudo de uma vez. 🌷\n\n` +
          'Que tal escolher apenas uma pequena atividade para começar?\n\n' +
          '✨ Arrumar sua cama.\n' +
          '✨ Beber um copo de água.\n' +
          '✨ Fazer uma pausa para respirar.\n' +
          '✨ Caminhar por alguns minutos.\n' +
          '✨ Organizar uma pequena parte do seu espaço.\n\n' +
          'O importante não é ter um dia perfeito, mas encontrar um ritmo que funcione para você.\n\n' +
          'Cada pequeno passo conta! 💜',
        rota: '/rotina',
        tituloRota: 'Ver minha rotina 🌷',
      };
    }
  
    // Relaxamento
  
    if (
      contem(pergunta, [
        'relaxar',
        'relaxamento',
        'estresse',
        'estressada',
        'estressado',
        'calma',
        'acalmar',
        'respirar',
      ])
    ) {
      return {
        texto:
          'Vamos reservar um momento para desacelerar? 🧘\n\n' +
          'Experimente este exercício rápido:\n\n' +
          '🌿 Relaxe os ombros.\n' +
          '🌿 Apoie os pés no chão.\n' +
          '🌿 Observe sua respiração por alguns instantes.\n' +
          '🌿 Solte o ar lentamente.\n' +
          '🌿 Perceba os sons e as sensações ao seu redor.\n\n' +
          'Você também pode utilizar os exercícios disponíveis na página Relaxamento.',
        rota: '/relaxamento',
        tituloRota: 'Abrir relaxamento 🦋',
      };
    }
  
    // Rotina
  
    if (
      contem(pergunta, [
        'rotina',
        'atividades',
        'progresso',
        'tarefas',
        'checklist',
        'organizar meu dia',
      ])
    ) {
      if (total === 0) {
        return {
          texto:
            'Sua rotina ainda não possui atividades cadastradas. 🌷\n\n' +
            'Você pode começar escolhendo alguns cuidados simples, como beber água, descansar, ler ou fazer exercícios leves.\n\n' +
            'Vamos organizar seu dia?',
          rota: '/rotina',
          tituloRota: 'Abrir minha rotina ✅',
        };
      }
  
      return {
        texto:
          `Aqui está um resumo da sua rotina, ${primeiroNome}! 💜\n\n` +
          `✅ Atividades concluídas: ${concluidas}\n` +
          `🌸 Atividades pendentes: ${Math.max(
            0,
            total - concluidas
          )}\n` +
          `📊 Progresso atual: ${progresso}%\n\n` +
          (progresso >= 100
            ? 'Parabéns! Você concluiu todas as suas atividades de hoje. 🎉'
            : 'Continue no seu ritmo. Cada atividade concluída representa um cuidado com você.') +
          '\n\nVocê pode acompanhar e marcar suas atividades na página Minha Rotina.',
        rota: '/rotina',
        tituloRota: 'Abrir minha rotina ✅',
      };
    }
  
    // Dicas personalizadas
  
    if (
      contem(pergunta, [
        'dica',
        'dicas',
        'sugestao',
        'sugestoes',
        'autocuidado',
        'cuidar de mim',
      ])
    ) {
      if (dicasPersonalizadas.length > 0) {
        return {
          texto:
            'Preparei algumas sugestões com base nas suas respostas ao questionário. 💜\n\n' +
            dicasPersonalizadas
              .slice(0, 3)
              .map(
                (dica, indice) =>
                  `${indice + 1}. ${dica}`
              )
              .join('\n\n') +
            '\n\nVocê encontra mais dicas na página Meu Espaço.',
          rota: '/meu-espaco',
          tituloRota: 'Ver mais dicas 🌷',
        };
      }
  
      return {
        texto:
          'Alguns cuidados simples podem fazer parte da sua rotina. 🌷\n\n' +
          '💧 Beba água ao longo do dia.\n' +
          '🌙 Priorize seu descanso.\n' +
          '🧘 Faça pequenas pausas.\n' +
          '📖 Reserve um tempo para algo que você gosta.\n\n' +
          'Responda ao questionário do aplicativo para receber sugestões mais personalizadas.',
        rota: '/questionario',
        tituloRota: 'Responder questionário 💜',
      };
    }
  
    // Cumprimentos
  
    if (
      contem(pergunta, [
        'oi',
        'ola',
        'bom dia',
        'boa tarde',
        'boa noite',
        'tudo bem',
      ])
    ) {
      return {
        texto:
          `Olá, ${primeiroNome}! 💜\n\n` +
          'Que bom conversar com você!\n\n' +
          'Posso ajudar com sua rotina, ansiedade, sono, hidratação, estudos, motivação e momentos de relaxamento.\n\n' +
          'Sobre o que você gostaria de conversar?',
      };
    }
  
    // Resposta padrão
  
    return {
      texto:
        'Estou aqui para ajudar você a cuidar melhor de si. 💜\n\n' +
        'Ainda não tenho uma resposta específica para essa mensagem, mas posso conversar sobre:\n\n' +
        '🌷 Autocuidado e rotina\n' +
        '💧 Hidratação\n' +
        '🌙 Sono e descanso\n' +
        '🧘 Ansiedade e relaxamento\n' +
        '📚 Estudos e concentração\n' +
        '💗 Sentimentos e motivação\n\n' +
        'Você pode escolher uma sugestão rápida ou me fazer outra pergunta.',
    };
  }
  
  // ============================================
  // COMPONENTE PRINCIPAL
  // ============================================
  
  export default function Assistente() {
    const {
      usuario,
      concluidas,
      atividades,
      progresso,
      dicasPersonalizadas,
      cores,
      preferencias,
      raioCartao,
      escalaFonte,
    } = useAutocuidado();
  
    const nome =
      usuario?.nome?.trim().split(' ')[0] || '';
  
    const email =
      usuario?.email?.trim().toLowerCase() || '';
  
    const escuro =
      preferencias.modoNoturno ||
      preferencias.tema === 'noite';
  
    const fonte = (tamanho: number) =>
      Math.round(tamanho * escalaFonte);
  
    const raioPequeno = Math.max(
      10,
      raioCartao - 8
    );
  
    const scrollRef =
      useRef<ScrollView>(null);
  
    const [mensagens, setMensagens] =
      useState<Mensagem[]>([]);
  
    const [texto, setTexto] = useState('');
  
    const [carregando, setCarregando] =
      useState(true);
  
    const [respondendo, setRespondendo] =
      useState(false);
  
    const [rotaSugerida, setRotaSugerida] =
      useState<string | null>(null);
  
    const [
      tituloRotaSugerida,
      setTituloRotaSugerida,
    ] = useState<string | null>(null);
  
    const chave =
      `@MeuAutoCuidado:assistente:${email}`;
  
    // ==========================================
    // CARREGAR CONVERSA
    // ==========================================
  
    const carregarConversa = useCallback(
      async () => {
        setCarregando(true);
        setMensagens([]);
        setRotaSugerida(null);
        setTituloRotaSugerida(null);
  
        try {
          if (!email) {
            setMensagens([
              mensagemBoasVindas(nome),
            ]);
            return;
          }
  
          const armazenado =
            await AsyncStorage.getItem(chave);
  
          if (armazenado) {
            const dados =
              JSON.parse(armazenado);
  
            if (
              Array.isArray(dados) &&
              dados.length > 0
            ) {
              const validos = dados.filter(
                (item: any) =>
                  item &&
                  typeof item.id === 'string' &&
                  typeof item.texto === 'string' &&
                  typeof item.horario === 'string' &&
                  (item.autor === 'usuario' ||
                    item.autor === 'assistente')
              );
  
              if (validos.length > 0) {
                setMensagens(validos);
                return;
              }
            }
          }
  
          setMensagens([
            mensagemBoasVindas(nome),
          ]);
        } catch (erro) {
          console.log(
            'Erro ao carregar conversa:',
            erro
          );
  
          setMensagens([
            mensagemBoasVindas(nome),
          ]);
        } finally {
          setCarregando(false);
        }
      },
      [email, chave, nome]
    );
  
    useEffect(() => {
      void carregarConversa();
    }, [carregarConversa]);
  
    // ==========================================
    // SALVAR CONVERSA
    // ==========================================
  
    async function salvarConversa(
      novasMensagens: Mensagem[]
    ) {
      if (!email) return;
  
      try {
        await AsyncStorage.setItem(
          chave,
          JSON.stringify(novasMensagens)
        );
      } catch (erro) {
        console.log(
          'Erro ao salvar conversa:',
          erro
        );
      }
    }
  
    // ==========================================
    // ENVIAR MENSAGEM
    // ==========================================
  
    async function enviarMensagem(
      perguntaRecebida?: string
    ) {
      const pergunta = (
        perguntaRecebida ?? texto
      ).trim();
  
      if (
        !pergunta ||
        carregando ||
        respondendo
      ) {
        return;
      }
  
      Keyboard.dismiss();
  
      setTexto('');
      setRespondendo(true);
  
      setRotaSugerida(null);
      setTituloRotaSugerida(null);
  
      const mensagemUsuario: Mensagem = {
        id: criarId(),
        autor: 'usuario',
        texto: pergunta,
        horario: horarioAtual(),
      };
  
      const resposta = gerarResposta(
        pergunta,
        nome,
        concluidas,
        atividades.length,
        progresso,
        dicasPersonalizadas
      );
  
      const mensagemAssistente: Mensagem = {
        id: criarId(),
        autor: 'assistente',
        texto: resposta.texto,
        horario: horarioAtual(),
      };
  
      const atualizadas = [
        ...mensagens,
        mensagemUsuario,
        mensagemAssistente,
      ];
  
      setMensagens(atualizadas);
  
      setRotaSugerida(
        resposta.rota || null
      );
  
      setTituloRotaSugerida(
        resposta.tituloRota || null
      );
  
      await salvarConversa(atualizadas);
  
      setRespondendo(false);
  
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({
          animated: true,
        });
      }, 100);
    }
  
    // ==========================================
    // LIMPAR CONVERSA
    // ==========================================
  
    function confirmarLimpeza() {
      Alert.alert(
        'Limpar conversa',
        'Deseja apagar o histórico de mensagens com o assistente?',
        [
          {
            text: 'Cancelar',
            style: 'cancel',
          },
          {
            text: 'Limpar',
            style: 'destructive',
            onPress: async () => {
              const inicial = [
                mensagemBoasVindas(nome),
              ];
  
              setMensagens(inicial);
              setTexto('');
              setRotaSugerida(null);
              setTituloRotaSugerida(null);
  
              if (email) {
                try {
                  await AsyncStorage.setItem(
                    chave,
                    JSON.stringify(inicial)
                  );
                } catch (erro) {
                  console.log(
                    'Erro ao limpar conversa:',
                    erro
                  );
                }
              }
            },
          },
        ]
      );
    }
  
    // ==========================================
    // ESTILOS DINÂMICOS
    // ==========================================
  
    const card = {
      backgroundColor: cores.card,
      borderColor: cores.borda,
      borderRadius: raioCartao,
    };
  
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
  
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={
            Platform.OS === 'ios'
              ? 'padding'
              : undefined
          }
        >
          {/* CABEÇALHO */}
  
          <View
            style={[
              styles.cabecalho,
              {
                backgroundColor: cores.card,
                borderBottomColor: cores.borda,
              },
            ]}
          >
            <View
              style={[
                styles.avatar,
                {
                  backgroundColor: cores.suave,
                  borderRadius: raioPequeno,
                },
              ]}
            >
              <Text
                style={{
                  fontSize: 28,
                }}
              >
                🤖
              </Text>
            </View>
  
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
                  fontWeight: '900',
                }}
              >
                Meu Assistente
              </Text>
  
              <Text
                style={{
                  color: cores.secundario,
                  fontSize: fonte(12),
                  marginTop: 3,
                }}
              >
                💜 Seu espaço de apoio
              </Text>
            </View>
  
            <TouchableOpacity
              onPress={confirmarLimpeza}
              style={[
                styles.botaoLimpar,
                {
                  backgroundColor: cores.suave,
                  borderRadius: raioPequeno,
                },
              ]}
            >
              <Text
                style={{
                  color: cores.primario,
                  fontSize: fonte(12),
                  fontWeight: '800',
                }}
              >
                Limpar
              </Text>
            </TouchableOpacity>
          </View>
  
          {/* ÁREA DE CONVERSA */}
  
          {carregando ? (
            <View style={styles.carregamento}>
              <ActivityIndicator
                size="large"
                color={cores.primario}
              />
  
              <Text
                style={{
                  color: cores.secundario,
                  marginTop: 15,
                  fontSize: fonte(14),
                }}
              >
                Preparando sua conversa...
              </Text>
            </View>
          ) : (
            <ScrollView
              ref={scrollRef}
              style={{ flex: 1 }}
              contentContainerStyle={
                styles.conversa
              }
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              onContentSizeChange={() =>
                scrollRef.current?.scrollToEnd({
                  animated: false,
                })
              }
            >
              <View style={styles.largura}>
                {/* APRESENTAÇÃO */}
  
                <View
                  style={[
                    styles.cartaoIntroducao,
                    {
                      backgroundColor: cores.suave,
                      borderRadius: raioCartao,
                    },
                  ]}
                >
                  <Text
                    style={{
                      fontSize: 31,
                    }}
                  >
                    🌷
                  </Text>
  
                  <Text
                    style={{
                      color: cores.texto,
                      fontSize: fonte(17),
                      fontWeight: '800',
                      textAlign: 'center',
                      marginTop: 9,
                    }}
                  >
                    Um espaço para cuidar de você
                  </Text>
  
                  <Text
                    style={{
                      color: cores.secundario,
                      fontSize: fonte(13),
                      lineHeight: fonte(20),
                      textAlign: 'center',
                      marginTop: 8,
                    }}
                  >
                    Converse sobre seus sentimentos,
                    hábitos, rotina e bem-estar.
                  </Text>
                </View>
  
                {/* MENSAGENS */}
  
                {mensagens.map(mensagem => {
                  const minha =
                    mensagem.autor === 'usuario';
  
                  return (
                    <View
                      key={mensagem.id}
                      style={[
                        styles.linhaMensagem,
                        {
                          justifyContent: minha
                            ? 'flex-end'
                            : 'flex-start',
                        },
                      ]}
                    >
                      {!minha && (
                        <View
                          style={[
                            styles.iconeMensagem,
                            {
                              backgroundColor:
                                cores.suave,
                            },
                          ]}
                        >
                          <Text
                            style={{
                              fontSize: 18,
                            }}
                          >
                            🤖
                          </Text>
                        </View>
                      )}
  
                      <View
                        style={[
                          styles.balao,
                          {
                            backgroundColor: minha
                              ? cores.primario
                              : cores.card,
  
                            borderColor: minha
                              ? cores.primario
                              : cores.borda,
  
                            borderRadius:
                              raioCartao,
  
                            borderBottomRightRadius:
                              minha ? 5 : raioCartao,
  
                            borderBottomLeftRadius:
                              minha ? raioCartao : 5,
                          },
                        ]}
                      >
                        <Text
                          style={{
                            color: minha
                              ? cores.textoBotao
                              : cores.texto,
  
                            fontSize: fonte(14),
                            lineHeight: fonte(22),
                          }}
                        >
                          {mensagem.texto}
                        </Text>
  
                        <Text
                          style={{
                            color: minha
                              ? cores.textoBotao
                              : cores.secundario,
  
                            opacity: minha
                              ? 0.8
                              : 1,
  
                            fontSize: fonte(10),
                            textAlign: 'right',
                            marginTop: 9,
                          }}
                        >
                          {mensagem.horario}
                        </Text>
                      </View>
                    </View>
                  );
                })}
  
                {/* BOTÃO SUGERIDO */}
  
                {rotaSugerida &&
                  tituloRotaSugerida && (
                    <TouchableOpacity
                      onPress={() =>
                        router.push(
                          rotaSugerida as any
                        )
                      }
                      style={[
                        styles.botaoSugestao,
                        {
                          backgroundColor:
                            cores.suave,
                          borderColor:
                            cores.borda,
                          borderRadius:
                            raioPequeno,
                        },
                      ]}
                    >
                      <Text
                        style={{
                          color: cores.primario,
                          fontSize: fonte(13),
                          fontWeight: '800',
                          textAlign: 'center',
                        }}
                      >
                        {tituloRotaSugerida} →
                      </Text>
                    </TouchableOpacity>
                  )}
              </View>
            </ScrollView>
          )}
  
          {/* PERGUNTAS RÁPIDAS */}
  
          {!carregando && (
            <View
              style={[
                styles.areaSugestoes,
                {
                  backgroundColor: cores.fundo,
                  borderTopColor: cores.borda,
                },
              ]}
            >
              <Text
                style={{
                  color: cores.secundario,
                  fontSize: fonte(12),
                  fontWeight: '800',
                  marginBottom: 10,
                  paddingHorizontal: 16,
                }}
              >
                ✨ SUGESTÕES PARA CONVERSAR
              </Text>
  
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={
                  styles.sugestoesLista
                }
              >
                {SUGESTOES.map(sugestao => (
                  <TouchableOpacity
                    key={sugestao.titulo}
                    disabled={respondendo}
                    onPress={() =>
                      enviarMensagem(
                        sugestao.pergunta
                      )
                    }
                    style={[
                      styles.sugestaoChip,
                      {
                        backgroundColor:
                          cores.card,
                        borderColor:
                          cores.borda,
                        borderRadius: 30,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: cores.texto,
                        fontSize: fonte(12),
                        fontWeight: '700',
                      }}
                    >
                      {sugestao.emoji}{' '}
                      {sugestao.titulo}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
  
          {/* CAMPO DE MENSAGEM */}
  
          <View
            style={[
              styles.areaEnvio,
              {
                backgroundColor: cores.card,
                borderTopColor: cores.borda,
              },
            ]}
          >
            <TextInput
              value={texto}
              onChangeText={setTexto}
              placeholder="Escreva sua mensagem..."
              placeholderTextColor={
                cores.secundario
              }
              multiline
              maxLength={1000}
              editable={
                !carregando &&
                !respondendo
              }
              style={[
                styles.input,
                {
                  backgroundColor:
                    cores.fundo,
                  borderColor:
                    cores.borda,
                  borderRadius:
                    raioPequeno,
                  color: cores.texto,
                  fontSize: fonte(14),
                },
              ]}
            />
  
            <TouchableOpacity
              onPress={() =>
                enviarMensagem()
              }
              disabled={
                !texto.trim() ||
                carregando ||
                respondendo
              }
              style={[
                styles.botaoEnviar,
                {
                  backgroundColor:
                    cores.primario,
                  borderRadius:
                    raioPequeno,
                  opacity:
                    !texto.trim() ||
                    carregando ||
                    respondendo
                      ? 0.5
                      : 1,
                },
              ]}
            >
              <Text
                style={{
                  color: cores.textoBotao,
                  fontSize: 23,
                  fontWeight: '900',
                }}
              >
                ➤
              </Text>
            </TouchableOpacity>
          </View>
  
          <Text
            style={{
              color: cores.secundario,
              backgroundColor: cores.card,
              fontSize: fonte(10),
              textAlign: 'center',
              paddingBottom: 9,
              paddingHorizontal: 15,
            }}
          >
            Orientações gerais de bem-estar.
            Não substitui ajuda profissional.
          </Text>
        </KeyboardAvoidingView>
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
  
    cabecalho: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: 1,
    },
  
    avatar: {
      width: 52,
      height: 52,
      alignItems: 'center',
      justifyContent: 'center',
    },
  
    botaoLimpar: {
      paddingHorizontal: 13,
      paddingVertical: 10,
    },
  
    carregamento: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
  
    conversa: {
      paddingHorizontal: 15,
      paddingTop: 18,
      paddingBottom: 25,
      alignItems: 'center',
    },
  
    largura: {
      width: '100%',
      maxWidth: 850,
    },
  
    cartaoIntroducao: {
      padding: 20,
      alignItems: 'center',
      marginBottom: 24,
    },
  
    linhaMensagem: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      marginBottom: 15,
      width: '100%',
    },
  
    iconeMensagem: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 9,
    },
  
    balao: {
      maxWidth: '83%',
      borderWidth: 1,
      paddingHorizontal: 15,
      paddingVertical: 13,
    },
  
    botaoSugestao: {
      borderWidth: 1,
      paddingHorizontal: 17,
      paddingVertical: 13,
      alignSelf: 'flex-start',
      marginLeft: 42,
      marginBottom: 18,
    },
  
    areaSugestoes: {
      borderTopWidth: 1,
      paddingTop: 13,
      paddingBottom: 12,
    },
  
    sugestoesLista: {
      paddingHorizontal: 15,
      gap: 9,
    },
  
    sugestaoChip: {
      borderWidth: 1,
      paddingHorizontal: 14,
      paddingVertical: 11,
    },
  
    areaEnvio: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      paddingHorizontal: 12,
      paddingTop: 12,
      paddingBottom: 10,
      borderTopWidth: 1,
      gap: 9,
    },
  
    input: {
      flex: 1,
      minHeight: 48,
      maxHeight: 115,
      borderWidth: 1,
      paddingHorizontal: 14,
      paddingVertical: 11,
    },
  
    botaoEnviar: {
      width: 48,
      height: 48,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
  