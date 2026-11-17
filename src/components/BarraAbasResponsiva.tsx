import React from 'react';
import {
  View,
  Text,
  Pressable,
  useWindowDimensions,
  ScrollView,
} from 'react-native';
import { useAutocuidado } from '../app/AutocuidadoContext';

// No celular, as 12 abas aparecem em 3 fileiras de 4.
// No computador, a barra de abas original continua igual.
const ABAS = [
  { nome: 'index', rotulo: 'Início', emoji: '🏠' },
  { nome: 'rotina', rotulo: 'Rotina', emoji: '🌷' },
  { nome: 'relaxamento', rotulo: 'Relaxar', emoji: '🧘' },
  { nome: 'humor', rotulo: 'Humor', emoji: '💗' },
  { nome: 'agua', rotulo: 'Água', emoji: '💧' },
  { nome: 'diario', rotulo: 'Diário', emoji: '📖' },
  { nome: 'evolucao', rotulo: 'Evolução', emoji: '📊' },
  { nome: 'perfil', rotulo: 'Perfil', emoji: '👤' },
  { nome: 'configuracoes', rotulo: 'Config.', emoji: '⚙️' },
  { nome: 'recompensas', rotulo: 'Prêmios', emoji: '🏆' },
  { nome: 'jardim', rotulo: 'Jardim Rush', emoji: '🎮' },
  { nome: 'assistente', rotulo: 'Assistente', emoji: '🤖' },
] as const;

const PAGINAS_SEM_ABAS = new Set([
  'login',
  'cadastro',
  'recuperar-senha',
  'questionario',
]);

export default function BarraAbasResponsiva(props: any) {
  const { width } = useWindowDimensions();
  const { cores } = useAutocuidado();
  const { state, navigation } = props;

  const atual = state.routes[state.index];
  if (atual && PAGINAS_SEM_ABAS.has(atual.name)) {
    return null;
  }

  const celular = width < 720;

  const abasVisiveis = ABAS.flatMap((aba) => {
    const rota = state.routes.find((item) => item.name === aba.nome);
    return rota ? [{ ...aba, rota }] : [];
  });

  const barra = (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: celular ? 'wrap' : 'nowrap',
        width: celular ? '100%' : undefined,
        backgroundColor: cores.card,
        borderTopWidth: 1,
        borderTopColor: cores.borda,
        paddingTop: 4,
        paddingBottom: 7,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 5,
      }}
    >
      {abasVisiveis.map(({ nome, rotulo, emoji, rota }) => {
        const selecionada = atual?.key === rota.key;
        return (
          <Pressable
            key={nome}
            accessibilityRole="tab"
            accessibilityLabel={rotulo}
            accessibilityState={{ selected: selecionada }}
            onPress={() => {
              const evento = navigation.emit({
                type: 'tabPress',
                target: rota.key,
                canPreventDefault: true,
              });
              if (!evento.defaultPrevented && !selecionada) {
                navigation.navigate(rota.name, rota.params);
              }
            }}
            style={{
              width: celular ? '25%' : Math.max(79, Math.floor(width / 12)),
              height: celular ? 51 : 68,
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: 2,
              backgroundColor: selecionada ? cores.suave : 'transparent',
              borderRadius: 8,
            }}
          >
            <Text style={{ fontSize: celular ? 19 : 22, lineHeight: 26 }}>
              {emoji}
            </Text>
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              style={{
                color: selecionada ? cores.primario : cores.secundario,
                fontSize: celular ? 10 : 11,
                lineHeight: 13,
                fontWeight: selecionada ? '800' : '600',
                textAlign: 'center',
                width: '100%',
              }}
            >
              {rotulo}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );

  if (celular) return barra;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ backgroundColor: cores.card, flexGrow: 0 }}
    >
      {barra}
    </ScrollView>
  );
}
