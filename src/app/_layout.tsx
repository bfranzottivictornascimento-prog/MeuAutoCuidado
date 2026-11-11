
import React, { useEffect, useRef, useState } from 'react';

import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Platform,
  StatusBar,
} from 'react-native';

import {
  Tabs,
  useRootNavigationState,
  usePathname,
  router,
} from 'expo-router';

import {
  AutocuidadoProvider,
  useAutocuidado,
} from './AutocuidadoContext';

// ============================================
// ÍCONES DAS ABAS
// ============================================

function IconeAba({
  emoji,
  focused,
}: {
  emoji: string;
  focused: boolean;
}) {
  const { cores, raioCartao, escalaFonte } =
    useAutocuidado();

  return (
    <View
      style={[
        styles.iconeAbaContainer,
        {
          borderRadius: Math.max(8, raioCartao - 8),
          backgroundColor: focused
            ? cores.suave
            : 'transparent',
        },
      ]}
    >
      <Text
        style={{
          fontSize: Math.round(21 * escalaFonte),
          opacity: focused ? 1 : 0.7,
        }}
      >
        {emoji}
      </Text>
    </View>
  );
}

// ============================================
// TELA DE CARREGAMENTO
// ============================================

function TelaCarregamento() {
  const {
    cores,
    raioCartao,
    escalaFonte,
    preferencias,
  } = useAutocuidado();

  const escuro =
    preferencias.modoNoturno ||
    preferencias.tema === 'noite';

  const fonte = (tamanho: number) =>
    Math.round(tamanho * escalaFonte);

  return (
    <View
      style={[
        styles.carregamentoContainer,
        { backgroundColor: cores.fundo },
      ]}
    >
      <StatusBar
        barStyle={
          escuro ? 'light-content' : 'dark-content'
        }
        backgroundColor={cores.fundo}
      />

      <View
        style={[
          styles.logoExterior,
          {
            backgroundColor: cores.suave,
            borderRadius: raioCartao + 10,
          },
        ]}
      >
        <View
          style={[
            styles.logoContainer,
            {
              backgroundColor: cores.card,
              borderColor: cores.borda,
              borderRadius: raioCartao + 3,
            },
          ]}
        >
          <Text style={styles.logoEmoji}>🌷</Text>
        </View>
      </View>

      <Text
        style={[
          styles.logoTitulo,
          {
            color: cores.texto,
            fontSize: fonte(28),
          },
        ]}
      >
        MeuAutoCuidado
      </Text>

      <Text
        style={[
          styles.logoSubtitulo,
          {
            color: cores.secundario,
            fontSize: fonte(14),
          },
        ]}
      >
        Preparando seu espaço de bem-estar...
      </Text>

      <ActivityIndicator
        size="large"
        color={cores.primario}
        style={styles.indicador}
      />

      <Text
        style={[
          styles.carregamentoTexto,
          {
            color: cores.secundario,
            fontSize: fonte(13),
          },
        ]}
      >
        Um momento de carinho com você 💜
      </Text>
    </View>
  );
}

// ============================================
// NAVEGAÇÃO PRINCIPAL
// ============================================

function Navegacao() {
  const {
    carregando,
    usuario,
    respostas,
    cores,
    preferencias,
    escalaFonte,
  } = useAutocuidado();

  const rootNavigationState =
    useRootNavigationState();

  const pathname = usePathname();

  const escuro =
    preferencias.modoNoturno ||
    preferencias.tema === 'noite';

  const fonte = (tamanho: number) =>
    Math.round(tamanho * escalaFonte);

  const pronta =
    !carregando && !!rootNavigationState?.key;

  // Controla se o cadastro já foi apresentado
  // nesta abertura do aplicativo.

  const [entradaLiberada, setEntradaLiberada] =
    useState(false);

  const redirecionamentoInicial = useRef(false);

  // ==========================================
  // SEMPRE MOSTRAR O CADASTRO AO ABRIR
  // ==========================================

  useEffect(() => {
    if (!pronta) return;

    if (!redirecionamentoInicial.current) {
      redirecionamentoInicial.current = true;

      // Mesmo que o contexto tenha recuperado
      // um usuário antigo, o cadastro aparece.

      router.replace('/login');
    }
  }, [pronta]);

  // ==========================================
  // CONTROLAR O ACESSO ÀS PÁGINAS
  // ==========================================

  useEffect(() => {
    if (!pronta) return;

    // Aguarda a primeira navegação para login.

    if (!redirecionamentoInicial.current) {
      return;
    }

    const paginasPublicas = [
      '/login',
      '/cadastro',
      '/recuperar-senha',
    ];

    const estaEmPaginaPublica =
      paginasPublicas.includes(pathname);

    // Enquanto a pessoa está no cadastro,
    // não a redireciona automaticamente.

    if (estaEmPaginaPublica) {
      return;
    }

    // Sem usuário informado, volta ao cadastro.

    if (!usuario?.email) {
      if (pathname !== '/login') {
        router.replace('/login');
      }
      return;
    }

    // Se o e-mail não tiver questionário,
    // direciona para responder.

    if (!respostas) {
      if (pathname !== '/questionario') {
        router.replace('/questionario');
      }
      return;
    }

    // Usuário com questionário pode
    // acessar as páginas normalmente.

    if (!entradaLiberada) {
      setEntradaLiberada(true);
    }
  }, [
    pronta,
    pathname,
    usuario?.email,
    respostas,
    entradaLiberada,
  ]);

  return (
    <>
      <StatusBar
        barStyle={
          escuro ? 'light-content' : 'dark-content'
        }
        backgroundColor={cores.fundo}
      />

      <Tabs
        initialRouteName="login"
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: cores.primario,
          tabBarInactiveTintColor: cores.secundario,
          tabBarHideOnKeyboard: true,

          tabBarItemStyle: {
            minWidth: 72,
          },

          tabBarStyle: {
            backgroundColor: cores.card,
            height: Platform.OS === 'ios' ? 85 : 75,
            paddingTop: 7,
            paddingBottom:
              Platform.OS === 'ios' ? 22 : 8,
            borderTopWidth: 1,
            borderTopColor: cores.borda,
            elevation: 8,
            shadowColor: escuro
              ? '#000000'
              : cores.primario,
            shadowOffset: {
              width: 0,
              height: -3,
            },
            shadowOpacity: escuro ? 0.25 : 0.08,
            shadowRadius: 10,
          },

          tabBarLabelStyle: {
            fontSize: fonte(10),
            fontWeight: '700',
            marginTop: 2,
          },

          headerStyle: {
            backgroundColor: cores.card,
          },

          headerTintColor: cores.texto,

          headerTitleStyle: {
            fontSize: fonte(18),
            fontWeight: '800',
          },

          sceneStyle: {
            backgroundColor: cores.fundo,
          },
        }}
      >
        {/* INÍCIO */}

        <Tabs.Screen
          name="index"
          options={{
            title: 'Início',
            tabBarIcon: ({ focused }) => (
              <IconeAba
                emoji="🏠"
                focused={focused}
              />
            ),
          }}
        />

        {/* ROTINA */}

        <Tabs.Screen
          name="rotina"
          options={{
            title: 'Rotina',
            tabBarIcon: ({ focused }) => (
              <IconeAba
                emoji="🌷"
                focused={focused}
              />
            ),
          }}
        />

        {/* RELAXAMENTO */}

        <Tabs.Screen
          name="relaxamento"
          options={{
            title: 'Relaxamento',
            tabBarLabel: 'Relaxar',
            tabBarIcon: ({ focused }) => (
              <IconeAba
                emoji="🧘"
                focused={focused}
              />
            ),
          }}
        />

        {/* HUMOR */}

        <Tabs.Screen
          name="humor"
          options={{
            title: 'Humor',
            tabBarIcon: ({ focused }) => (
              <IconeAba
                emoji="💗"
                focused={focused}
              />
            ),
          }}
        />

        {/* ÁGUA */}

        <Tabs.Screen
          name="agua"
          options={{
            title: 'Água',
            tabBarIcon: ({ focused }) => (
              <IconeAba
                emoji="💧"
                focused={focused}
              />
            ),
          }}
        />

        {/* MEU DIÁRIO */}

        <Tabs.Screen
          name="diario"
          options={{
            title: 'Meu Diário',
            tabBarLabel: 'Diário',
            tabBarIcon: ({ focused }) => (
              <IconeAba
                emoji="📖"
                focused={focused}
              />
            ),
          }}
        />

        {/* EVOLUÇÃO */}

        <Tabs.Screen
          name="evolucao"
          options={{
            title: 'Evolução',
            tabBarIcon: ({ focused }) => (
              <IconeAba
                emoji="📊"
                focused={focused}
              />
            ),
          }}
        />

        {/* PERFIL */}

        <Tabs.Screen
          name="perfil"
          options={{
            title: 'Perfil',
            tabBarIcon: ({ focused }) => (
              <IconeAba
                emoji="👤"
                focused={focused}
              />
            ),
          }}
        />

        {/* CONFIGURAÇÕES */}

        <Tabs.Screen
          name="configuracoes"
          options={{
            title: 'Config.',
            tabBarIcon: ({ focused }) => (
              <IconeAba
                emoji="⚙️"
                focused={focused}
              />
            ),
          }}
        />

        {/* RECOMPENSAS */}

        <Tabs.Screen
          name="recompensas"
          options={{
            title: 'Recompensas',
            tabBarIcon: ({ focused }) => (
              <IconeAba
                emoji="🏆"
                focused={focused}
              />
            ),
          }}
        />

        {/* JARDIM RUSH */}

        <Tabs.Screen
          name="jardim"
          options={{
            title: 'Jardim Rush',
            tabBarLabel: 'Jardim Rush',
            tabBarIcon: ({ focused }) => (
              <IconeAba
                emoji="🎮"
                focused={focused}
              />
            ),
          }}
        />

        {/* ASSISTENTE */}

        <Tabs.Screen
          name="assistente"
          options={{
            title: 'Assistente',
            tabBarIcon: ({ focused }) => (
              <IconeAba
                emoji="🤖"
                focused={focused}
              />
            ),
          }}
        />

        {/* PÁGINAS OCULTAS */}

        <Tabs.Screen
          name="explore"
          options={{ href: null }}
        />

        <Tabs.Screen
          name="login"
          options={{
            href: null,
            tabBarStyle: { display: 'none' },
          }}
        />

        <Tabs.Screen
          name="cadastro"
          options={{
            href: null,
            tabBarStyle: { display: 'none' },
          }}
        />

        <Tabs.Screen
          name="recuperar-senha"
          options={{
            href: null,
            tabBarStyle: { display: 'none' },
          }}
        />

        <Tabs.Screen
          name="questionario"
          options={{
            href: null,
            tabBarStyle: { display: 'none' },
          }}
        />
      </Tabs>

      {!pronta && (
        <View style={styles.carregamentoSobreposto}>
          <TelaCarregamento />
        </View>
      )}
    </>
  );
}

// ============================================
// PROVIDER
// ============================================

export default function Layout() {
  return (
    <AutocuidadoProvider>
      <Navegacao />
    </AutocuidadoProvider>
  );
}

// ============================================
// ESTILOS
// ============================================

const styles = StyleSheet.create({
  carregamentoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 25,
  },

  carregamentoSobreposto: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },

  logoExterior: {
    width: 112,
    height: 112,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },

  logoContainer: {
    width: 94,
    height: 94,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  logoEmoji: {
    fontSize: 47,
  },

  logoTitulo: {
    fontWeight: '800',
    textAlign: 'center',
  },

  logoSubtitulo: {
    textAlign: 'center',
    lineHeight: 23,
    marginTop: 10,
  },

  indicador: {
    marginTop: 30,
  },

  carregamentoTexto: {
    textAlign: 'center',
    marginTop: 18,
  },

  iconeAbaContainer: {
    width: 45,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
