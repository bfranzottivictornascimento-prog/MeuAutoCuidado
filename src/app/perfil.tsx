
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
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  router,
  useFocusEffect,
} from 'expo-router';

import {
  useAutocuidado,
  chaveFotoPerfil,
} from './AutocuidadoContext';

// Componentes visuais locais: sem importações adicionais, arquivos auxiliares ou pasta de imagens.
// ACABAMENTOS PREMIUM DAS MOLDURAS — mesmos IDs históricos em Perfil e Recompensas.
type Acabamento = {
  primaria: string; secundaria: string; fundo: string;
  pontos: number; espessura: number; refletores: string;
};
const ACABAMENTOS_MOLDURA: Record<string, Acabamento> = {
  nenhuma:{primaria:'#C9C2CE',secundaria:'#F7F4F7',fundo:'#F9F7FA',pontos:0,espessura:1,refletores:'#DEDBE2'},
  moldura:{primaria:'#B66D85',secundaria:'#FAE2D9',fundo:'#FEF1F3',pontos:6,espessura:3,refletores:'#E4A4B2'},
  moldura_borboletas:{primaria:'#8276B9',secundaria:'#CCD8FF',fundo:'#F2F0FE',pontos:6,espessura:3,refletores:'#BC9EE5'},
  moldura_cerejeira:{primaria:'#BD7099',secundaria:'#F6C9DB',fundo:'#FFF1F7',pontos:5,espessura:3,refletores:'#E9A3C1'},
  moldura_folhas:{primaria:'#4C806D',secundaria:'#CFEBCE',fundo:'#F3F9F2',pontos:5,espessura:3,refletores:'#9FBFA2'},
  moldura_lavanda:{primaria:'#8170B4',secundaria:'#D6BDF5',fundo:'#F7F2FF',pontos:6,espessura:3,refletores:'#A9A1D7'},
  moldura_estrelas:{primaria:'#A98141',secundaria:'#FAE6AF',fundo:'#FFFAEC',pontos:8,espessura:3,refletores:'#E6C378'},
  moldura_coracoes:{primaria:'#BD6B8B',secundaria:'#F5C1D6',fundo:'#FEF0F6',pontos:5,espessura:3,refletores:'#E5A0BF'},
  moldura_dourada:{primaria:'#986E2F',secundaria:'#F6DB98',fundo:'#FFFBED',pontos:8,espessura:5,refletores:'#DDAD54'},
  moldura_arcoiris:{primaria:'#9A86CA',secundaria:'#F9CEE1',fundo:'#FAF3FF',pontos:7,espessura:3,refletores:'#96D5DA'},
  moldura_oceano:{primaria:'#538DAB',secundaria:'#A8E2DE',fundo:'#F1FCFB',pontos:7,espessura:3,refletores:'#79BDD1'},
  moldura_cristal:{primaria:'#7988BF',secundaria:'#C5E8FA',fundo:'#F4F8FF',pontos:7,espessura:4,refletores:'#B6B4F4'},
  moldura_galaxia:{primaria:'#675394',secundaria:'#B3A1DF',fundo:'#EEEAFE',pontos:9,espessura:4,refletores:'#CFB9F1'},
};

// Ornamentos pequenos de joalheria: formatos próprios, sem adesivos grandes sobre o rosto.
function OrnamentoMoldura({id, cor, detalhe, tamanho=22}: {id:string; cor:string; detalhe:string; tamanho?:number}) {
  const s=tamanho;
  const central={position:'absolute' as const,left:s*.5-2,top:s*.5-2,width:4,height:4,borderRadius:2,backgroundColor:detalhe};
  const base={width:s,height:s,alignItems:'center' as const,justifyContent:'center' as const};
  if(id==='moldura' || id==='moldura_cerejeira') return <View style={base}>
    {Array.from({length:id==='moldura_cerejeira'?5:6},(_,i)=>{
      const a=i*Math.PI*2/(id==='moldura_cerejeira'?5:6);
      return <View key={i} style={{position:'absolute',left:s*.5+Math.cos(a)*s*.25-s*.12,top:s*.5+Math.sin(a)*s*.25-s*.16,width:s*.24,height:s*.32,borderTopLeftRadius:s*.16,borderTopRightRadius:s*.16,borderBottomRightRadius:s*.09,borderBottomLeftRadius:s*.09,backgroundColor:i%2?cor:detalhe,transform:[{rotate:`${a*180/Math.PI+90}deg`}]}}/>;
    })}<View style={{...central,width:s*.14,height:s*.14,borderRadius:s*.07,left:s*.43,top:s*.43,backgroundColor:id==='moldura'?'#E4B36D':'#F5E9C2'}}/>
  </View>;
  if(id==='moldura_borboletas') return <View style={base}>
    {[-1,1].map(x=><React.Fragment key={x}>
      <View style={{position:'absolute',left:s*.5+x*s*.14-(x>0?0:s*.26),top:s*.11,width:s*.26,height:s*.34,borderRadius:s*.24,transform:[{rotate:`${x*32}deg`}],backgroundColor:detalhe}}/>
      <View style={{position:'absolute',left:s*.5+x*s*.10-(x>0?0:s*.23),top:s*.43,width:s*.23,height:s*.28,borderRadius:s*.20,transform:[{rotate:`${x*18}deg`}],backgroundColor:cor}}/>
    </React.Fragment>)}<View style={{width:s*.075,height:s*.46,borderRadius:4,backgroundColor:'#8B7392',position:'absolute',top:s*.27}}/>
  </View>;
  if(id==='moldura_lavanda') return <View style={base}>
    <View style={{position:'absolute',height:s*.86,width:1.5,backgroundColor:'#618A6F',transform:[{rotate:'-12deg'}]}}/>
    {Array.from({length:7},(_,i)=><View key={i} style={{position:'absolute',top:s*.10+i*s*.085,left:s*.45+(i%2?s*.08:-s*.10),width:s*.18,height:s*.13,borderRadius:s*.09,backgroundColor:i%2?cor:detalhe,transform:[{rotate:`${i%2?25:-25}deg`}]}}/>)}
  </View>;
  if(id==='moldura_folhas') return <View style={base}>
    <View style={{height:s*.7,width:1.8,backgroundColor:cor,transform:[{rotate:'32deg'}]}}/>
    {[-1,0,1].map((i)=><View key={i} style={{position:'absolute',left:s*.34+i*2,top:s*.20+(i+1)*s*.18,width:s*.35,height:s*.19,borderTopLeftRadius:s*.25,borderBottomRightRadius:s*.25,backgroundColor:i===0?detalhe:cor,transform:[{rotate:`${i%2?-24:25}deg`}]}}/>)}
  </View>;
  if(id==='moldura_estrelas'||id==='moldura_galaxia') return <View style={base}>
    <View style={{width:s*.47,height:s*.47,backgroundColor:detalhe,transform:[{rotate:'45deg'}],borderRadius:s*.04}}/>
    <View style={{position:'absolute',width:s*.17,height:s*.80,backgroundColor:cor,borderRadius:s*.15}}/>
    <View style={{position:'absolute',width:s*.80,height:s*.17,backgroundColor:cor,borderRadius:s*.15}}/>
    <View style={{position:'absolute',width:s*.18,height:s*.18,borderRadius:s*.09,backgroundColor:'#FFFCF2'}}/>
  </View>;
  if(id==='moldura_dourada') return <View style={base}>
    <View style={{width:s*.77,height:s*.77,borderWidth:2.3,borderRadius:s*.40,borderColor:cor,backgroundColor:detalhe,alignItems:'center',justifyContent:'center'}}>
      <View style={{width:s*.46,height:s*.46,borderRadius:s*.23,borderWidth:1,borderColor:'#FFFFFF',backgroundColor:'#E6BD77'}}/>
    </View><View style={{position:'absolute',height:s*.64,width:s*.10,backgroundColor:cor,transform:[{rotate:'45deg'}]}}/>
  </View>;
  if(id==='moldura_coracoes') return <View style={base}>
    <View style={{width:s*.42,height:s*.42,backgroundColor:cor,transform:[{rotate:'45deg'}],marginTop:s*.18}}/>
    <View style={{position:'absolute',width:s*.42,height:s*.42,borderRadius:s*.21,backgroundColor:detalhe,top:s*.16,left:s*.16}}/>
    <View style={{position:'absolute',width:s*.42,height:s*.42,borderRadius:s*.21,backgroundColor:detalhe,top:s*.16,left:s*.43}}/>
  </View>;
  if(id==='moldura_cristal') return <View style={base}>
    <View style={{width:s*.51,height:s*.51,transform:[{rotate:'45deg'}],backgroundColor:detalhe,borderColor:cor,borderWidth:2}}/>
    <View style={{position:'absolute',width:s*.12,height:s*.12,transform:[{rotate:'45deg'}],backgroundColor:'#FFFFFF'}}/>
  </View>;
  if(id==='moldura_oceano') return <View style={base}>
    <View style={{width:s*.55,height:s*.55,borderRadius:s*.30,backgroundColor:'#E6F7F3',borderWidth:2,borderColor:cor}}/>
    {[-1,1].map((x,i)=><View key={i} style={{position:'absolute',left:s*.5+x*s*.2-s*.08,top:s*.57,width:s*.19,height:s*.12,borderTopWidth:2,borderColor:detalhe,borderRadius:s*.16,transform:[{rotate:`${x*25}deg`}]}}/>)}
    <View style={{position:'absolute',top:s*.34,width:s*.14,height:s*.14,borderRadius:s*.07,backgroundColor:'#FFFFFF'}}/>
  </View>;
  if(id==='moldura_arcoiris') return <View style={base}>
    {['#F3B0C6','#EACB83','#8DC4AC','#A2A0DB'].map((c,i)=><View key={i} style={{position:'absolute',top:s*.21+i*s*.11,width:s*.78-i*s*.14,height:s*.52-i*s*.13,borderTopWidth:Math.max(2,s*.075),borderLeftWidth:0,borderRightWidth:0,borderBottomWidth:0,borderColor:c,borderRadius:s*.45}}/>)}
  </View>;
  return <View style={base}><View style={{width:s*.24,height:s*.24,backgroundColor:cor,borderRadius:s*.12}}/></View>;
}

function MolduraElegante({id='nenhuma',tamanho=104,foto=null,iniciais='',ocupado=false}:{id?:string;tamanho?:number;foto?:any;iniciais?:string;ocupado?:boolean}) {
  const t=ACABAMENTOS_MOLDURA[id]||ACABAMENTOS_MOLDURA.nenhuma;
  const decorada=id!=='nenhuma';
  const radius=tamanho/2;
  const b=Math.max(8,tamanho*.105);
  const diametro=tamanho-2*b;
  const orn=Math.max(19,Math.round(tamanho*.235));
  const pontos=t.pontos;
  // Quatro pontos principais + dois motivos laterais; pedras ficam fora da foto.
  const posicoes=[[-orn*.26,tamanho*.5-orn*.5],[tamanho*.5-orn*.5,-orn*.36],[tamanho-orn*.72,tamanho*.5-orn*.5],[tamanho*.5-orn*.5,tamanho-orn*.70],
    [tamanho*.14-orn*.5,tamanho*.17-orn*.5],[tamanho*.86-orn*.5,tamanho*.82-orn*.5]];
  return <View style={{width:tamanho,height:tamanho,alignItems:'center',justifyContent:'center',overflow:'visible'}}>
    <View style={{position:'absolute',width:tamanho-3,height:tamanho-3,borderRadius:radius,borderWidth:decorada?4:2,
      borderColor:t.primaria,backgroundColor:t.fundo,shadowColor:t.primaria,shadowOffset:{width:0,height:3},shadowOpacity:decorada?.26:.04,shadowRadius:9,elevation:decorada?4:0}}/>
    <View style={{position:'absolute',width:tamanho-12,height:tamanho-12,borderRadius:radius,borderWidth:2,borderColor:t.secundaria}}/>
    <View style={{position:'absolute',width:tamanho-19,height:tamanho-19,borderRadius:radius,borderWidth:1,borderColor:t.refletores}}/>
    {decorada && <View pointerEvents="none" style={{position:'absolute',width:tamanho-7,height:tamanho-7,borderRadius:radius,borderWidth:1.3,
      borderColor:id==='moldura_dourada'?'#FFF1BE':id==='moldura_oceano'?'#BAFFFB':t.secundaria,opacity:.88}}/>}
    {decorada && (id==='moldura_galaxia'||id==='moldura_estrelas'||id==='moldura_cristal') && <View pointerEvents="none" style={{position:'absolute',width:tamanho-27,height:tamanho-27,borderRadius:radius,borderWidth:1,
      borderStyle:'dashed',borderColor:t.secundaria,opacity:.78}}/>}
    <View style={{width:diametro,height:diametro,borderRadius:diametro/2,overflow:'hidden',borderWidth:1,borderColor:t.primaria,backgroundColor:'#E4DFE6',alignItems:'center',justifyContent:'center'}}>
      {ocupado ? <ActivityIndicator color={t.primaria} size="small"/> : foto ? <Image source={foto} resizeMode="cover" style={{width:'100%',height:'100%'}}/> : iniciais ? <Text style={{fontSize:Math.max(13,tamanho*.26),fontWeight:'700',color:'#6D536D'}}>{iniciais}</Text> : <>
        <View style={{position:'absolute',top:diametro*.21,width:diametro*.28,height:diametro*.28,borderRadius:diametro*.14,backgroundColor:'#BEB2C0'}}/>
        <View style={{position:'absolute',bottom:-diametro*.16,width:diametro*.72,height:diametro*.52,borderRadius:diametro*.36,backgroundColor:'#BEB2C0'}}/>
      </>}
    </View>
    {decorada && posicoes.map(([left,top],i)=><View key={i} pointerEvents="none" style={{position:'absolute',left,top,transform:[{rotate:`${[0,0,90,180,-33,145][i]}deg`}],opacity:i>=4?.88:1}}>
      <OrnamentoMoldura id={id} cor={t.primaria} detalhe={t.secundaria} tamanho={i>=4?orn*.66:orn}/>
    </View>)}
    {/* Aplique de joalheria integrado à moldura — arabescos, cristais e brilho específicos. */}
    {decorada && Array.from({length:id==='moldura_dourada'||id==='moldura_galaxia'?12:8},(_,i)=>{
      const a=i*Math.PI*2/(id==='moldura_dourada'||id==='moldura_galaxia'?12:8)+.20;
      const r=radius-(tamanho*.028);
      const comp=(i%2===0?tamanho*.072:tamanho*.042);
      const pedrinha=id==='moldura_cristal'||id==='moldura_galaxia'||id==='moldura_estrelas';
      return <View key={'gema-'+i} pointerEvents="none" style={{position:'absolute',left:radius+Math.cos(a)*r-comp/2,
        top:radius+Math.sin(a)*r-comp/2,width:comp,height:comp,
        transform:[{rotate:pedrinha?'45deg':`${a*180/Math.PI}deg`}],
        borderTopLeftRadius:pedrinha?2:comp*.5,borderBottomRightRadius:pedrinha?2:comp*.5,
        borderRadius:pedrinha?1:comp*.5,backgroundColor:i%2?t.secundaria:t.refletores,
        borderColor:t.primaria,borderWidth:i%2?.6:1}}/>;
    })}

    {decorada && Array.from({length:pontos},(_,i)=>{const a=(2*Math.PI*i/pontos)-Math.PI/2+Math.PI/pontos;const r=radius-3.5;const d=tamanho*.022;
      return <View key={`pedra${i}`} pointerEvents="none" style={{position:'absolute',left:radius+r*Math.cos(a)-d/2,top:radius+r*Math.sin(a)-d/2,width:d,height:d,borderRadius:d/2,backgroundColor:i%2?t.refletores:'#FFFEF5',borderWidth:.4,borderColor:t.primaria}}/>;
    })}
  </View>;
}

// ============================================
// TIPOS DAS MOLDURAS
// ============================================

type MolduraId =
  | 'nenhuma'
  | 'floral'
  | 'borboletas'
  | 'lavanda'
  | 'dourada'
  | 'cerejeira'
  | 'estrelas'
  | 'coracoes'
  | 'arcoiris'
  | 'folhas'
  | 'cristal'
  | 'oceano'
  | 'galaxia';

type MolduraInfo = {
  id: MolduraId;
  nome: string;
  emoji: string;
  premio: string;
  cor: string;
};

// ============================================
// CATÁLOGO DE MOLDURAS
// ============================================

const MOLDURAS: MolduraInfo[] = [
  {
    id: 'nenhuma',
    nome: 'Sem moldura',
    emoji: '◯',
    premio: '',
    cor: '#D4C6DC',
  },
  {
    id: 'floral',
    nome: 'Florescendo',
    emoji: '🌸',
    premio: 'moldura',
    cor: '#ECA2C7',
  },
  {
    id: 'borboletas',
    nome: 'Borboletas',
    emoji: '🦋',
    premio: 'moldura_borboletas',
    cor: '#A58FE2',
  },
  {
    id: 'lavanda',
    nome: 'Lavanda',
    emoji: '🪻',
    premio: 'moldura_lavanda',
    cor: '#9878BC',
  },
  {
    id: 'dourada',
    nome: 'Dourada',
    emoji: '✨',
    premio: 'moldura_dourada',
    cor: '#D6AB52',
  },
  {
    id: 'cerejeira',
    nome: 'Cerejeiras',
    emoji: '🌸',
    premio: 'moldura_cerejeira',
    cor: '#F1ABBC',
  },
  {
    id: 'estrelas',
    nome: 'Estrelada',
    emoji: '⭐',
    premio: 'moldura_estrelas',
    cor: '#E5C575',
  },
  {
    id: 'coracoes',
    nome: 'Corações',
    emoji: '💖',
    premio: 'moldura_coracoes',
    cor: '#F18DAF',
  },
  {
    id: 'arcoiris',
    nome: 'Arco-Íris',
    emoji: '🌈',
    premio: 'moldura_arcoiris',
    cor: '#8ABBEF',
  },
  {
    id: 'folhas',
    nome: 'Natureza',
    emoji: '🍀',
    premio: 'moldura_folhas',
    cor: '#7FBF83',
  },
  {
    id: 'cristal',
    nome: 'Cristal',
    emoji: '💎',
    premio: 'moldura_cristal',
    cor: '#9A8BD8',
  },
  {
    id: 'oceano',
    nome: 'Oceano',
    emoji: '🐚',
    premio: 'moldura_oceano',
    cor: '#76BDCA',
  },
  {
    id: 'galaxia',
    nome: 'Galáxia',
    emoji: '🌌',
    premio: 'moldura_galaxia',
    cor: '#6C5AAB',
  },
];

// ============================================
// DECORAÇÕES DAS MOLDURAS
// ============================================

// ============================================
// OBJETIVOS DO QUESTIONÁRIO
// ============================================

const OBJETIVOS: Record<
  string,
  {
    emoji: string;
    nome: string;
  }
> = {
  sono: {
    emoji: '🌙',
    nome: 'Dormir melhor',
  },

  autoestima: {
    emoji: '💗',
    nome: 'Cuidar da autoestima',
  },

  organização: {
    emoji: '📝',
    nome: 'Ser mais organizada(o)',
  },

  relaxar: {
    emoji: '🦋',
    nome: 'Relaxar mais',
  },

  disposição: {
    emoji: '☀️',
    nome: 'Ter mais disposição',
  },

  pele: {
    emoji: '🧴',
    nome: 'Cuidar da pele',
  },
};

// ============================================
// CHAVE DAS RECOMPENSAS
// ============================================

function chaveClube(email: string) {
  return `@MeuAutoCuidado:clube_v2:${email}`;
}

// ============================================
// SISTEMA DE AVISOS
// ============================================

function aviso(
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

// ============================================
// FORMATAR TEMPO
// ============================================

function formatarTempo(tempo?: string) {
  if (!tempo) {
    return 'Não informado';
  }

  if (tempo === 'pouco') {
    return 'Até 15 minutos';
  }

  if (tempo === 'medio') {
    return 'De 15 a 30 minutos';
  }

  if (tempo === 'bastante') {
    return 'Mais de 30 minutos';
  }

  const partes =
    /^(\d{1,2}):(\d{2})$/.exec(tempo);

  if (!partes) {
    return tempo;
  }

  const horas = Number(partes[1]);
  const minutos = Number(partes[2]);

  const texto: string[] = [];

  if (horas) {
    texto.push(
      `${horas} ${horas === 1 ? 'hora' : 'horas'}`
    );
  }

  if (minutos) {
    texto.push(
      `${minutos} ${minutos === 1 ? 'minuto' : 'minutos'}`
    );
  }

  return texto.join(' e ') || 'Não informado';
}

// ============================================
// TELA PRINCIPAL
// ============================================

export default function Perfil() {
  const {
    usuario,
    salvarUsuario,
    respostas,
    atividades,
    concluidas,
    progresso,
    historicoProgresso,
    sequenciaDias,
    preferencias,
    cores,
    raioCartao,
    escalaFonte,
  } = useAutocuidado();

  const { width } = useWindowDimensions();

  const telaPequena = width < 390;

  // ==========================================
  // ESTADOS DO PERFIL
  // ==========================================

  const [
    modalVisivel,
    setModalVisivel,
  ] = useState(false);

  const [
    nomeEditado,
    setNomeEditado,
  ] = useState('');

  const [
    emailEditado,
    setEmailEditado,
  ] = useState('');

  const [
    fotoPerfil,
    setFotoPerfil,
  ] = useState<string | null>(null);

  const [
    carregandoFoto,
    setCarregandoFoto,
  ] = useState(true);

  const [
    selecionandoFoto,
    setSelecionandoFoto,
  ] = useState(false);

  const [
    salvandoDados,
    setSalvandoDados,
  ] = useState(false);

  // ==========================================
  // ESTADOS DAS MOLDURAS
  // ==========================================

  const [
    premiosResgatados,
    setPremiosResgatados,
  ] = useState<string[]>([]);

  const [
    molduraAtiva,
    setMolduraAtiva,
  ] = useState<MolduraId>('nenhuma');

  const [
    emailPremios,
    setEmailPremios,
  ] = useState('');

  const [
    salvandoMoldura,
    setSalvandoMoldura,
  ] = useState(false);

  const inputFotoRef = useRef<any>(null);

  // ==========================================
  // IDENTIFICAÇÃO DO USUÁRIO
  // ==========================================

  const emailAtual =
    usuario?.email?.trim().toLowerCase() || '';

  const chaveFoto = emailAtual
    ? chaveFotoPerfil(emailAtual)
    : null;

  const nomeCompleto =
    usuario?.nome?.trim() || 'Meu perfil';

  const primeiroNome =
    nomeCompleto.split(' ')[0];

  const iniciais = nomeCompleto
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(parte =>
      parte.charAt(0).toUpperCase()
    )
    .join('');

  const objetivos =
    respostas?.objetivo || [];

  // ==========================================
  // CORES E PREFERÊNCIAS
  // ==========================================

  const escuro =
    preferencias.modoNoturno ||
    preferencias.tema === 'noite';

  const fonte = (valor: number) =>
    Math.round(valor * escalaFonte);

  const raioMenor = Math.max(
    8,
    raioCartao - 7
  );

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

  const tituloSecao = {
    color: cores.texto,
    fontSize: fonte(25),
    lineHeight: fonte(25) + 10,
  };

  const descricaoSecao = {
    color: cores.secundario,
    fontSize: fonte(16),
    lineHeight: fonte(16) + 10,
  };

  // ==========================================
  // VERIFICAR MOLDURAS LIBERADAS
  // ==========================================

  const molduraLiberada = useCallback(
    (id: MolduraId) => {
      if (id === 'nenhuma') {
        return true;
      }

      const item = MOLDURAS.find(
        m => m.id === id
      );

      return (
        !!item &&
        premiosResgatados.includes(
          item.premio
        )
      );
    },
    [premiosResgatados]
  );

  // ==========================================
  // CARREGAR MOLDURAS DAS RECOMPENSAS
  // ==========================================

  useFocusEffect(
    useCallback(() => {
      let ativo = true;

      setEmailPremios('');
      setPremiosResgatados([]);
      setMolduraAtiva('nenhuma');

      if (!emailAtual) {
        return () => {
          ativo = false;
        };
      }

      (async () => {
        try {
          const valor =
            await AsyncStorage.getItem(
              chaveClube(emailAtual)
            );

          if (!ativo) {
            return;
          }

          const dados = valor
            ? JSON.parse(valor)
            : {};

          const lista: string[] =
            Array.isArray(dados.resgatados)
              ? dados.resgatados.filter(
                  (
                    item: unknown
                  ): item is string =>
                    typeof item === 'string'
                )
              : [];

          const escolha =
            MOLDURAS.find(
              m =>
                m.id ===
                dados.molduraAtiva
            );

          const ativa: MolduraId =
            escolha &&
            (
              escolha.id === 'nenhuma' ||
              lista.includes(
                escolha.premio
              )
            )
              ? escolha.id
              : 'nenhuma';

          setPremiosResgatados(lista);
          setMolduraAtiva(ativa);
        } catch (erro) {
          console.error(
            'Erro ao carregar molduras:',
            erro
          );
        } finally {
          if (ativo) {
            setEmailPremios(emailAtual);
          }
        }
      })();

      return () => {
        ativo = false;
      };
    }, [emailAtual])
  );

  // ==========================================
  // EQUIPAR OU RETIRAR MOLDURA
  // ==========================================

  async function equiparMoldura(
    id: MolduraId
  ) {
    if (
      !emailAtual ||
      emailPremios !== emailAtual ||
      salvandoMoldura
    ) {
      return;
    }

    if (!molduraLiberada(id)) {
      aviso(
        'Moldura bloqueada',
        'Desbloqueie essa moldura em Recompensas.'
      );

      return;
    }

    setSalvandoMoldura(true);

    try {
      const chave = chaveClube(emailAtual);

      const anterior =
        await AsyncStorage.getItem(chave);

      const dados = anterior
        ? JSON.parse(anterior)
        : {};

      const lista: string[] =
        Array.isArray(dados.resgatados)
          ? dados.resgatados
          : [];

      const item = MOLDURAS.find(
        m => m.id === id
      );

      if (
        id !== 'nenhuma' &&
        !lista.includes(
          item?.premio || ''
        )
      ) {
        aviso(
          'Moldura bloqueada',
          'Resgate essa moldura antes de equipá-la.'
        );

        return;
      }

      await AsyncStorage.setItem(
        chave,
        JSON.stringify({
          ...dados,
          molduraAtiva: id,
        })
      );

      setMolduraAtiva(id);
    } catch (erro) {
      console.error(
        'Erro ao salvar moldura:',
        erro
      );

      aviso(
        'Não foi possível salvar',
        'Tente equipar novamente.'
      );
    } finally {
      setSalvandoMoldura(false);
    }
  }

  // ==========================================
  // MOLDURA QUE APARECE NA FOTO
  // ==========================================

  const molduraVisual =
    MOLDURAS.find(
      m => m.id === molduraAtiva
    ) || MOLDURAS[0];

  const molduraExibida: MolduraId =
    emailPremios === emailAtual &&
    molduraLiberada(molduraAtiva)
      ? molduraAtiva
      : 'nenhuma';

  // ==========================================
  // CARREGAR FOTO DO PERFIL
  // ==========================================

  useEffect(() => {
    let ativo = true;

    async function carregarFoto() {
      setFotoPerfil(null);
      setCarregandoFoto(true);

      try {
        if (!chaveFoto) {
          return;
        }

        const foto =
          await AsyncStorage.getItem(
            chaveFoto
          );

        if (ativo) {
          setFotoPerfil(foto);
        }
      } catch (erro) {
        console.error(
          'Erro ao carregar foto:',
          erro
        );
      } finally {
        if (ativo) {
          setCarregandoFoto(false);
        }
      }
    }

    carregarFoto();

    return () => {
      ativo = false;
    };
  }, [chaveFoto]);

  // ==========================================
  // ESCOLHER FOTO
  // ==========================================

  function escolherFoto() {
    if (!emailAtual) {
      aviso(
        'Cadastro necessário',
        'Cadastre seu e-mail antes de escolher uma foto.'
      );

      return;
    }

    if (Platform.OS !== 'web') {
      aviso(
        'Seleção de foto',
        'Nesta versão, a seleção de foto está disponível pelo navegador.'
      );

      return;
    }

    if (
      !selecionandoFoto &&
      !carregandoFoto
    ) {
      inputFotoRef.current?.click();
    }
  }

  // ==========================================
  // RECEBER E SALVAR FOTO
  // ==========================================

  async function receberFoto(
    evento: any
  ) {
    const arquivo =
      evento?.target?.files?.[0];

    if (!arquivo || !chaveFoto) {
      return;
    }

    if (
      !arquivo.type?.startsWith('image/')
    ) {
      aviso(
        'Arquivo inválido',
        'Selecione uma imagem.'
      );

      return;
    }

    const chaveSelecionada = chaveFoto;

    setSelecionandoFoto(true);

    try {
      const imagemSalva =
        await new Promise<string>(
          (resolve, reject) => {
            const leitor =
              new FileReader();

            leitor.onerror = () =>
              reject(
                new Error(
                  'Não foi possível ler a imagem.'
                )
              );

            leitor.onload = () => {
              const imagem =
                new window.Image();

              imagem.onerror = () =>
                reject(
                  new Error(
                    'Imagem inválida.'
                  )
                );

              imagem.onload = () => {
                const canvas =
                  document.createElement(
                    'canvas'
                  );

                const tamanho = 360;

                canvas.width = tamanho;
                canvas.height = tamanho;

                const contexto =
                  canvas.getContext('2d');

                if (!contexto) {
                  reject(
                    new Error(
                      'Canvas indisponível.'
                    )
                  );

                  return;
                }

                const lado = Math.min(
                  imagem.width,
                  imagem.height
                );

                const origemX =
                  (imagem.width - lado) / 2;

                const origemY =
                  (imagem.height - lado) / 2;

                contexto.drawImage(
                  imagem,
                  origemX,
                  origemY,
                  lado,
                  lado,
                  0,
                  0,
                  tamanho,
                  tamanho
                );

                resolve(
                  canvas.toDataURL(
                    'image/jpeg',
                    0.72
                  )
                );
              };

              imagem.src = String(
                leitor.result
              );
            };

            leitor.readAsDataURL(
              arquivo
            );
          }
        );

      await AsyncStorage.setItem(
        chaveSelecionada,
        imagemSalva
      );

      if (
        chaveFoto === chaveSelecionada
      ) {
        setFotoPerfil(imagemSalva);
      }

      aviso(
        'Foto atualizada! 💜',
        'Sua foto foi salva neste perfil.'
      );
    } catch (erro) {
      console.error(
        'Erro ao selecionar foto:',
        erro
      );

      aviso(
        'Erro',
        'Não foi possível salvar a imagem.'
      );
    } finally {
      setSelecionandoFoto(false);

      if (evento?.target) {
        evento.target.value = '';
      }
    }
  }

  // ==========================================
  // REMOVER FOTO
  // ==========================================

  function removerFoto() {
    if (!chaveFoto) {
      return;
    }

    const chaveSelecionada =
      chaveFoto;

    async function executar() {
      try {
        await AsyncStorage.removeItem(
          chaveSelecionada
        );

        if (
          chaveFoto === chaveSelecionada
        ) {
          setFotoPerfil(null);
        }
      } catch (erro) {
        console.error(
          'Erro ao remover foto:',
          erro
        );

        aviso(
          'Erro',
          'Não foi possível remover a foto.'
        );
      }
    }

    if (Platform.OS === 'web') {
      if (
        typeof window !== 'undefined' &&
        window.confirm(
          'Deseja remover sua foto de perfil?'
        )
      ) {
        executar();
      }
    } else {
      Alert.alert(
        'Remover foto',
        'Deseja remover sua foto de perfil?',
        [
          {
            text: 'Cancelar',
            style: 'cancel',
          },
          {
            text: 'Remover',
            style: 'destructive',
            onPress: executar,
          },
        ]
      );
    }
  }

  // ==========================================
  // EDITAR INFORMAÇÕES
  // ==========================================

  function abrirEdicao() {
    setNomeEditado(
      usuario?.nome || ''
    );

    setEmailEditado(
      usuario?.email || ''
    );

    setModalVisivel(true);
  }

  // ==========================================
  // SALVAR INFORMAÇÕES
  // ==========================================

  async function salvarAlteracoes() {
    if (salvandoDados) {
      return;
    }

    const nome = nomeEditado
      .trim()
      .replace(/\s+/g, ' ');

    const email = emailEditado
      .trim()
      .toLowerCase();

    if (nome.length < 2) {
      aviso(
        'Nome inválido',
        'Digite pelo menos 2 caracteres.'
      );

      return;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email
      )
    ) {
      aviso(
        'E-mail inválido',
        'Digite um e-mail válido.'
      );

      return;
    }

    const mudouEmail =
      email !== emailAtual;

    setSalvandoDados(true);

    try {
      await salvarUsuario({
        nome,
        email,
      });

      setModalVisivel(false);

      if (mudouEmail) {
        setFotoPerfil(null);

        router.replace(
          '/questionario'
        );
      } else {
        aviso(
          'Perfil atualizado! 💜',
          'Suas informações foram salvas.'
        );
      }
    } catch (erro) {
      console.error(
        'Erro ao salvar perfil:',
        erro
      );

      aviso(
        'Erro',
        'Não foi possível atualizar as informações.'
      );
    } finally {
      setSalvandoDados(false);
    }
  }

  // ==========================================
  // ESTATÍSTICAS DO AUTOCUIDADO
  // ==========================================

  const estatisticas = [
    {
      emoji: '🌷',
      numero: atividades.length,
      texto: 'Atividades',
    },
    {
      emoji: '💜',
      numero: concluidas,
      texto: 'Concluídas',
    },
    {
      emoji: '✨',
      numero: `${progresso}%`,
      texto: 'Progresso',
    },
    {
      emoji: '🗓️',
      numero: historicoProgresso.length,
      texto: 'Dias registrados',
    },
    {
      emoji: '🔥',
      numero: sequenciaDias,
      texto: 'Dias em sequência',
    },
  ];

  // ==========================================
  // PREFERÊNCIAS DO QUESTIONÁRIO
  // ==========================================

  const preferenciasQuestionario = [
    {
      emoji: '⏱️',
      titulo: 'Tempo disponível',
      valor: formatarTempo(
        respostas?.tempo
      ),
    },
    {
      emoji: '🌙',
      titulo: 'Qualidade do sono',
      valor:
        respostas?.sono === 'bom'
          ? 'Boa'
          : respostas?.sono === 'regular'
          ? 'Pode melhorar'
          : respostas?.sono === 'ruim'
          ? 'Dificuldade para dormir'
          : 'Não informado',
    },
    {
      emoji: '🌿',
      titulo: 'Nível de estresse',
      valor:
        respostas?.estresse === 'baixo'
          ? 'Baixo'
          : respostas?.estresse === 'moderado'
          ? 'Moderado'
          : respostas?.estresse === 'alto'
          ? 'Alto'
          : 'Não informado',
    },
  ];

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

      {/* SELEÇÃO DE FOTO NO NAVEGADOR */}

      {Platform.OS === 'web' &&
        React.createElement('input', {
          ref: inputFotoRef,
          type: 'file',
          accept: 'image/*',
          onChange: receberFoto,
          style: {
            display: 'none',
          },
          'aria-label':
            'Escolher foto de perfil',
        })}

      <ScrollView
        contentContainerStyle={
          styles.container
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        <View
          style={
            styles.conteudoCentral
          }
        >
          {/* ==================================
              CABEÇALHO
          ================================== */}

          <Text
            style={[
              styles.etiqueta,
              destaque,
              {
                fontSize: fonte(13),
              },
            ]}
          >
            SUAS INFORMAÇÕES
          </Text>

          <Text
            style={[
              styles.titulo,
              texto,
              {
                fontSize: fonte(34),
                lineHeight: fonte(45),
              },
            ]}
          >
            Meu Perfil 👤
          </Text>

          <Text
            style={[
              styles.subtitulo,
              descricaoSecao,
            ]}
          >
            Seu espaço para acompanhar sua jornada
            e personalizar sua experiência.
          </Text>

          {/* ==================================
              FOTO E DADOS PESSOAIS
          ================================== */}

          <View
            style={[
              styles.perfilCard,
              card,
            ]}
          >
            {/* FOTO COM MOLDURA: EXATAMENTE O MESMO ACABAMENTO DE RECOMPENSAS */}
            <TouchableOpacity
              onPress={escolherFoto}
              disabled={selecionandoFoto || carregandoFoto}
              activeOpacity={0.89}
              accessibilityRole="button"
              accessibilityLabel="Alterar foto de perfil"
              style={{width:172,height:172,marginBottom:19,alignItems:'center',justifyContent:'center'}}
            >
              <MolduraElegante
                id={molduraExibida === 'nenhuma' ? 'nenhuma' : molduraVisual.premio}
                tamanho={160}
                foto={fotoPerfil ? {uri:fotoPerfil} : null}
                iniciais={iniciais || '✦'}
                ocupado={carregandoFoto || selecionandoFoto}
              />
              <View style={[styles.iconeCamera,{
                backgroundColor:cores.card,borderColor:cores.borda,
                right:5,bottom:5,shadowColor:'#3B293B',shadowOpacity:.12,
                shadowRadius:6,elevation:3,
              }]}>
                <Text style={styles.cameraTexto}>📷</Text>
              </View>
            </TouchableOpacity>

            {/* NOME COMPLETO */}

            <Text
              style={[
                styles.nome,
                texto,
                {
                  fontSize: fonte(
                    telaPequena ? 23 : 27
                  ),
                },
              ]}
            >
              {nomeCompleto}
            </Text>

            {/* E-MAIL */}

            <Text
              style={[
                styles.email,
                secundario,
                {
                  fontSize: fonte(14),
                },
              ]}
            >
              {usuario?.email ||
                'E-mail não informado'}
            </Text>

            {/* BOAS-VINDAS */}

            <Text
              style={[
                styles.boasVindas,
                secundario,
                {
                  fontSize: fonte(14),
                },
              ]}
            >
              Que bom ter você aqui, {primeiroNome}! 💜
            </Text>

            {/* BOTÕES DA FOTO */}

            <View
              style={
                styles.botoesFoto
              }
            >
              <TouchableOpacity
                onPress={escolherFoto}
                disabled={
                  carregandoFoto ||
                  selecionandoFoto
                }
                style={[
                  styles.botaoFoto,
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
                    styles.botaoFotoTexto,
                    destaque,
                  ]}
                >
                  📷 Alterar foto
                </Text>
              </TouchableOpacity>

              {fotoPerfil && (
                <TouchableOpacity
                  onPress={
                    removerFoto
                  }
                  style={[
                    styles.botaoFoto,
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
                      styles.removerTexto
                    }
                  >
                    Remover foto
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* EDITAR PERFIL */}

            <TouchableOpacity
              onPress={abrirEdicao}
              style={[
                styles.botaoPrincipal,
                {
                  backgroundColor:
                    cores.primario,

                  borderRadius:
                    raioMenor,
                },
              ]}
            >
              <Text
                style={[
                  styles.botaoPrincipalTexto,
                  {
                    color:
                      cores.textoBotao,

                    fontSize:
                      fonte(15),
                  },
                ]}
              >
                ✏️ Editar minhas informações
              </Text>
            </TouchableOpacity>
          </View>

          {/* ==================================
              NOVA COLEÇÃO DE MOLDURAS
          ================================== */}

          <View
            style={styles.secao}
          >
            <Text
              style={[
                styles.etiqueta,
                destaque,
              ]}
            >
              PERSONALIZAÇÃO DO PERFIL
            </Text>

            <Text
              style={[
                styles.secaoTitulo,
                tituloSecao,
              ]}
            >
              🌸 Minhas molduras
            </Text>

            <Text
              style={[
                styles.secaoDescricao,
                descricaoSecao,
              ]}
            >
              Escolha uma moldura para enfeitar
              sua foto. As opções bloqueadas
              podem ser resgatadas na página
              de Recompensas.
            </Text>

            <View
              style={[
                styles.card,
                card,
              ]}
            >
              <View
                style={
                  styles.gradeMolduras
                }
              >
                {MOLDURAS.map(
                  item => {
                    const liberada =
                      emailPremios ===
                        emailAtual &&
                      molduraLiberada(
                        item.id
                      );

                    const equipada =
                      liberada &&
                      molduraExibida ===
                        item.id;

                    return (
                      <TouchableOpacity
                        key={item.id}
                        activeOpacity={0.83}
                        disabled={
                          salvandoMoldura
                        }
                        onPress={() => {
                          if (liberada) {
                            equiparMoldura(
                              item.id
                            );
                          } else {
                            router.push(
                              '/recompensas'
                            );
                          }
                        }}
                        style={[
                          styles.molduraOpcao,
                          {
                            borderColor:
                              equipada
                                ? cores.primario
                                : cores.borda,

                            backgroundColor:
                              equipada
                                ? cores.suave
                                : cores.card,

                            opacity:
                              liberada
                                ? 1
                                : 0.65,
                          },
                        ]}
                      >
                        <View style={{height:92,alignItems:'center',justifyContent:'center'}}>
                          <MolduraElegante id={item.premio || 'nenhuma'} tamanho={88} />
                          {!liberada && <View pointerEvents="none" style={{position:'absolute',bottom:0,right:0,
                            backgroundColor:cores.card,borderColor:cores.borda,borderWidth:1,
                            borderRadius:12,width:25,height:25,alignItems:'center',justifyContent:'center'}}>
                            <Text style={{fontSize:12}}>🔒</Text>
                          </View>}
                        </View>

                        <Text
                          style={[
                            styles.molduraNome,
                            {
                              color:
                                cores.texto,

                              fontSize:
                                fonte(12),
                            },
                          ]}
                        >
                          {item.nome}
                        </Text>

                        <Text
                          style={[
                            styles.molduraStatus,
                            {
                              color:
                                equipada
                                  ? cores.primario
                                  : cores.secundario,
                            },
                          ]}
                        >
                          {equipada
                            ? '✓ Equipada'
                            : liberada
                            ? 'Equipar'
                            : 'Bloqueada'}
                        </Text>
                      </TouchableOpacity>
                    );
                  }
                )}
              </View>

              <TouchableOpacity
                onPress={() =>
                  router.push(
                    '/recompensas'
                  )
                }
                style={[
                  styles.botaoPrincipal,
                  {
                    backgroundColor:
                      cores.primario,

                    borderRadius:
                      raioMenor,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.botaoPrincipalTexto,
                    {
                      color:
                        cores.textoBotao,

                      fontSize:
                        fonte(14),
                    },
                  ]}
                >
                  🎁 Ver molduras em Recompensas
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ==================================
              ESTATÍSTICAS
          ================================== */}

          <View
            style={styles.secao}
          >
            <Text
              style={[
                styles.etiqueta,
                destaque,
              ]}
            >
              SUA JORNADA
            </Text>

            <Text
              style={[
                styles.secaoTitulo,
                tituloSecao,
              ]}
            >
              Meu autocuidado em números
            </Text>

            <Text
              style={[
                styles.secaoDescricao,
                descricaoSecao,
              ]}
            >
              Acompanhe seus resultados
              e valorize cada pequena conquista.
            </Text>

            <View
              style={
                styles.gradeEstatisticas
              }
            >
              {estatisticas.map(
                item => (
                  <View
                    key={item.texto}
                    style={[
                      styles.estatisticaCard,
                      cardSuave,
                    ]}
                  >
                    <Text
                      style={
                        styles.estatisticaEmoji
                      }
                    >
                      {item.emoji}
                    </Text>

                    <Text
                      style={[
                        styles.estatisticaNumero,
                        texto,
                        {
                          fontSize:
                            fonte(24),
                        },
                      ]}
                    >
                      {item.numero}
                    </Text>

                    <Text
                      style={[
                        styles.estatisticaTexto,
                        secundario,
                        {
                          fontSize:
                            fonte(12),
                        },
                      ]}
                    >
                      {item.texto}
                    </Text>
                  </View>
                )
              )}
            </View>
          </View>

          {/* ==================================
              OBJETIVOS
          ================================== */}

          <View
            style={styles.secao}
          >
            <Text
              style={[
                styles.etiqueta,
                destaque,
              ]}
            >
              SEUS OBJETIVOS
            </Text>

            <Text
              style={[
                styles.secaoTitulo,
                tituloSecao,
              ]}
            >
              O que quero melhorar 🌷
            </Text>

            <Text
              style={[
                styles.secaoDescricao,
                descricaoSecao,
              ]}
            >
              Seus objetivos escolhidos
              no questionário.
            </Text>

            <View
              style={[
                styles.card,
                card,
              ]}
            >
              {objetivos.length > 0 ? (
                objetivos.map(
                  (
                    objetivo: string,
                    indice: number
                  ) => {
                    const item =
                      OBJETIVOS[objetivo];

                    return (
                      <View
                        key={`${objetivo}-${indice}`}
                        style={[
                          styles.objetivoItem,
                          {
                            borderBottomColor:
                              cores.borda,

                            borderBottomWidth:
                              indice ===
                              objetivos.length - 1
                                ? 0
                                : 1,
                          },
                        ]}
                      >
                        <Text
                          style={
                            styles.objetivoEmoji
                          }
                        >
                          {item?.emoji ||
                            '💜'}
                        </Text>

                        <Text
                          style={[
                            styles.objetivoTexto,
                            texto,
                            {
                              fontSize:
                                fonte(15),
                            },
                          ]}
                        >
                          {item?.nome ||
                            objetivo}
                        </Text>
                      </View>
                    );
                  }
                )
              ) : (
                <Text
                  style={[
                    styles.textoInformativo,
                    secundario,
                  ]}
                >
                  Você ainda não escolheu
                  seus objetivos.
                </Text>
              )}

              <TouchableOpacity
                onPress={() =>
                  router.push(
                    '/questionario'
                  )
                }
                style={[
                  styles.botaoSecundario,
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
                    styles.botaoSecundarioTexto,
                    destaque,
                  ]}
                >
                  Atualizar meus objetivos →
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ==================================
              PREFERÊNCIAS DO QUESTIONÁRIO
          ================================== */}

          <View
            style={styles.secao}
          >
            <Text
              style={[
                styles.etiqueta,
                destaque,
              ]}
            >
              PERSONALIZAÇÃO
            </Text>

            <Text
              style={[
                styles.secaoTitulo,
                tituloSecao,
              ]}
            >
              Minhas preferências
            </Text>

            <Text
              style={[
                styles.secaoDescricao,
                descricaoSecao,
              ]}
            >
              Informações utilizadas para
              adaptar suas atividades
              de autocuidado.
            </Text>

            <View
              style={[
                styles.card,
                card,
              ]}
            >
              {preferenciasQuestionario.map(
                (
                  item,
                  indice
                ) => (
                  <View
                    key={
                      item.titulo
                    }
                    style={[
                      styles.preferenciaItem,
                      {
                        borderBottomColor:
                          cores.borda,

                        borderBottomWidth:
                          indice ===
                          preferenciasQuestionario.length - 1
                            ? 0
                            : 1,
                      },
                    ]}
                  >
                    <Text
                      style={
                        styles.preferenciaEmoji
                      }
                    >
                      {item.emoji}
                    </Text>

                    <View
                      style={{
                        flex: 1,
                      }}
                    >
                      <Text
                        style={[
                          styles.preferenciaTitulo,
                          texto,
                          {
                            fontSize:
                              fonte(15),
                          },
                        ]}
                      >
                        {item.titulo}
                      </Text>

                      <Text
                        style={[
                          styles.preferenciaValor,
                          secundario,
                          {
                            fontSize:
                              fonte(14),
                          },
                        ]}
                      >
                        {item.valor}
                      </Text>
                    </View>
                  </View>
                )
              )}
            </View>
          </View>

          {/* ==================================
              CONFIGURAÇÕES
          ================================== */}

          <View
            style={
              styles.secao
            }
          >
            <Text
              style={[
                styles.etiqueta,
                destaque,
              ]}
            >
              PERSONALIZE SUA EXPERIÊNCIA
            </Text>

            <Text
              style={[
                styles.secaoTitulo,
                tituloSecao,
              ]}
            >
              Configurações ⚙️
            </Text>

            <Text
              style={[
                styles.secaoDescricao,
                descricaoSecao,
              ]}
            >
              Ajuste a aparência e as
              preferências do aplicativo.
            </Text>

            <TouchableOpacity
              onPress={() =>
                router.push(
                  '/configuracoes'
                )
              }
              style={[
                styles.configuracoesCard,
                card,
              ]}
            >
              <View
                style={[
                  styles.configuracoesIcone,
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
                  🎨
                </Text>
              </View>

              <View
                style={{
                  flex: 1,
                }}
              >
                <Text
                  style={[
                    styles.configuracoesTitulo,
                    texto,
                    {
                      fontSize:
                        fonte(17),
                    },
                  ]}
                >
                  Personalizar aplicativo
                </Text>

                <Text
                  style={[
                    styles.configuracoesDescricao,
                    secundario,
                    {
                      fontSize:
                        fonte(13),
                    },
                  ]}
                >
                  Tema, cores, tamanho das
                  letras e outras preferências.
                </Text>
              </View>

              <Text
                style={[
                  styles.seta,
                  destaque,
                ]}
              >
                ›
              </Text>
            </TouchableOpacity>
          </View>

          {/* ==================================
              PRIVACIDADE
          ================================== */}

          <View
            style={[
              styles.avisoCard,
              cardSuave,
            ]}
          >
            <Text
              style={
                styles.avisoEmoji
              }
            >
              🔒
            </Text>

            <View
              style={{
                flex: 1,
              }}
            >
              <Text
                style={[
                  styles.avisoTitulo,
                  texto,
                  {
                    fontSize: fonte(17),
                  },
                ]}
              >
                Seu espaço pessoal
              </Text>

              <Text
                style={[
                  styles.avisoDescricao,
                  secundario,
                  {
                    fontSize: fonte(13),
                  },
                ]}
              >
                Suas informações ajudam a
                personalizar sua experiência
                de autocuidado. Cuide também
                da sua privacidade.
              </Text>
            </View>
          </View>

          {/* ==================================
              RODAPÉ
          ================================== */}

          <Text
            style={[
              styles.rodape,
              secundario,
              {
                fontSize: fonte(11),
              },
            ]}
          >
            MEUAUTOCUIDADO • SEU BEM-ESTAR IMPORTA
          </Text>
        </View>
      </ScrollView>

      {/* =====================================
          MODAL PARA EDITAR NOME E E-MAIL
      ===================================== */}

      <Modal
        visible={
          modalVisivel
        }
        transparent
        animationType="fade"
        onRequestClose={() =>
          setModalVisivel(false)
        }
      >
        <KeyboardAvoidingView
          style={
            styles.modalFundo
          }
          behavior={
            Platform.OS === 'ios'
              ? 'padding'
              : undefined
          }
        >
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor:
                  cores.card,

                borderRadius:
                  raioCartao,
              },
            ]}
          >
            <Text
              style={[
                styles.modalTitulo,
                texto,
                {
                  fontSize:
                    fonte(23),
                },
              ]}
            >
              ✏️ Editar perfil
            </Text>

            <Text
              style={[
                styles.modalDescricao,
                secundario,
              ]}
            >
              Atualize seu nome e e-mail.
            </Text>

            <Text
              style={[
                styles.inputEtiqueta,
                texto,
              ]}
            >
              Nome completo
            </Text>

            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor:
                    cores.fundo,

                  borderColor:
                    cores.borda,

                  borderRadius:
                    raioMenor,

                  color:
                    cores.texto,
                },
              ]}
              value={nomeEditado}
              onChangeText={
                setNomeEditado
              }
              placeholder="Digite seu nome"
              placeholderTextColor={
                cores.secundario
              }
              autoCapitalize="words"
            />

            <Text
              style={[
                styles.inputEtiqueta,
                texto,
              ]}
            >
              E-mail
            </Text>

            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor:
                    cores.fundo,

                  borderColor:
                    cores.borda,

                  borderRadius:
                    raioMenor,

                  color:
                    cores.texto,
                },
              ]}
              value={emailEditado}
              onChangeText={
                setEmailEditado
              }
              placeholder="Digite seu e-mail"
              placeholderTextColor={
                cores.secundario
              }
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TouchableOpacity
              onPress={
                salvarAlteracoes
              }
              disabled={
                salvandoDados
              }
              style={[
                styles.modalSalvar,
                {
                  backgroundColor:
                    cores.primario,

                  borderRadius:
                    raioMenor,

                  opacity:
                    salvandoDados
                      ? 0.6
                      : 1,
                },
              ]}
            >
              <Text
                style={[
                  styles.modalSalvarTexto,
                  {
                    color:
                      cores.textoBotao,
                  },
                ]}
              >
                {salvandoDados
                  ? 'Salvando...'
                  : 'Salvar alterações'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                setModalVisivel(false)
              }
              disabled={
                salvandoDados
              }
              style={
                styles.modalCancelar
              }
            >
              <Text
                style={[
                  styles.modalCancelarTexto,
                  destaque,
                ]}
              >
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

// ============================================
// ESTILOS DO PERFIL
// ============================================

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  container: {
    paddingHorizontal: 18,
    paddingTop: 28,
    paddingBottom: 55,
    alignItems: 'center',
  },

  conteudoCentral: {
    width: '100%',
    maxWidth: 950,
  },

  etiqueta: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginBottom: 10,
  },

  titulo: {
    fontWeight: '900',
  },

  subtitulo: {
    marginTop: 10,
    marginBottom: 25,
  },

  perfilCard: {
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    marginBottom: 30,
  },

  avatarBorda: {
    width: 142,
    height: 142,
    borderRadius: 71,
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },

  avatar: {
    width: 130,
    height: 130,
    borderRadius: 65,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  avatarImagem: {
    width: '100%',
    height: '100%',
  },

  avatarTexto: {
    fontSize: 42,
    fontWeight: '900',
  },

  iconeCamera: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 39,
    height: 39,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cameraTexto: {
    fontSize: 18,
  },

  nome: {
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 8,
  },

  email: {
    textAlign: 'center',
    marginBottom: 9,
  },

  boasVindas: {
    textAlign: 'center',
    marginBottom: 18,
  },

  botoesFoto: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 18,
  },

  botaoFoto: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  botaoFotoTexto: {
    fontSize: 13,
    fontWeight: '800',
  },

  removerTexto: {
    fontSize: 13,
    fontWeight: '800',
    color: '#C16A83',
  },

  botaoPrincipal: {
    paddingVertical:17,paddingHorizontal:20,alignItems:'center',justifyContent:'center',alignSelf:'stretch',
    borderWidth:1,borderColor:'rgba(255,255,255,.36)',shadowColor:'#5A2E6E',shadowOpacity:.19,
    shadowRadius:10,shadowOffset:{width:0,height:5},elevation:4,
  },

  botaoPrincipalTexto: {
    fontWeight: '900',
    textAlign: 'center',
  },

  // ==========================================
  // ESTILOS DAS MOLDURAS
  // ==========================================

  gradeMolduras: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    marginBottom: 10,
  },

  molduraOpcao: {
    flexGrow:1,flexBasis:'30%',minWidth:120,borderWidth:1.5,borderRadius:24,
    paddingVertical:19,paddingHorizontal:9,alignItems:'center',gap:9,
    shadowColor:'#6B4C80',shadowOpacity:.075,shadowRadius:9,shadowOffset:{width:0,height:3},elevation:2,
  },

  molduraIcone: {
    borderWidth: 2,
    width: 48,
    height: 48,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },

  molduraEmoji: {
    fontSize: 24,
  },

  molduraNome: {
    fontWeight: '900',
    textAlign: 'center',
  },

  molduraStatus: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },

  // ==========================================
  // ESTILOS DAS SEÇÕES ANTIGAS
  // ==========================================

  secao: {
    marginBottom: 30,
  },

  secaoTitulo: {
    fontWeight: '900',
  },

  secaoDescricao: {
    marginTop: 8,
    marginBottom: 18,
  },

  gradeEstatisticas: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },

  estatisticaCard: {
    flexGrow: 1,
    flexBasis: '29%',
    minWidth: 95,
    padding: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 130,
  },

  estatisticaEmoji: {
    fontSize: 27,
    marginBottom: 10,
  },

  estatisticaNumero: {
    fontWeight: '900',
  },

  estatisticaTexto: {
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 7,
  },

  card: {
    borderWidth: 1,
    padding: 19,
  },

  objetivoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },

  objetivoEmoji: {
    fontSize: 25,
    marginRight: 13,
  },

  objetivoTexto: {
    flex: 1,
    fontWeight: '700',
  },

  textoInformativo: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    paddingVertical: 15,
  },

  botaoSecundario: {
    paddingHorizontal: 16,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 16,
  },

  botaoSecundarioTexto: {
    fontSize: 14,
    fontWeight: '900',
  },

  preferenciaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },

  preferenciaEmoji: {
    fontSize: 26,
    marginRight: 13,
  },

  preferenciaTitulo: {
    fontWeight: '800',
  },

  preferenciaValor: {
    marginTop: 5,
  },

  configuracoesCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 17,
    borderWidth: 1,
  },

  configuracoesIcone: {
    width: 55,
    height: 55,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  configuracoesTitulo: {
    fontWeight: '800',
  },

  configuracoesDescricao: {
    marginTop: 6,
    lineHeight: 20,
  },

  seta: {
    fontSize: 29,
    marginLeft: 8,
  },

  avisoCard: {
    flexDirection: 'row',
    padding: 20,
    borderWidth: 1,
    alignItems: 'flex-start',
  },

  avisoEmoji: {
    fontSize: 27,
    marginRight: 13,
  },

  avisoTitulo: {
    fontWeight: '900',
  },

  avisoDescricao: {
    marginTop: 8,
    lineHeight: 21,
  },

  rodape: {
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.6,
    marginTop: 28,
  },

  // ==========================================
  // MODAL DE EDIÇÃO
  // ==========================================

  modalFundo: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    padding: 20,
  },

  modalCard: {
    padding: 24,
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
  },

  modalTitulo: {
    fontWeight: '900',
  },

  modalDescricao: {
    fontSize: 14,
    marginTop: 8,
    marginBottom: 20,
  },

  inputEtiqueta: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 8,
  },

  input: {
    borderWidth: 1,
    paddingHorizontal: 15,
    paddingVertical: 14,
    fontSize: 15,
    marginBottom: 17,
  },

  modalSalvar: {
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },

  modalSalvarTexto: {
    fontWeight: '900',
    fontSize: 15,
  },

  modalCancelar: {
    alignItems: 'center',
    paddingVertical: 15,
    marginTop: 5,
  },

  modalCancelarTexto: {
    fontWeight: '800',
    fontSize: 14,
  },
});
