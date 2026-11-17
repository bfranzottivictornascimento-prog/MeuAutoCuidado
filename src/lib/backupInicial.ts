
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  buscarProgressoPorEmail,
  salvarProgressoPorEmail,
} from './supabaseRest';

export async function copiarProgressoAntigo(email: string) {
  const emailNormalizado = email.trim().toLowerCase();

  // Verifica o que já existe na nuvem.
  const dadosNuvem = await buscarProgressoPorEmail(emailNormalizado);
  const existentes = new Set(dadosNuvem.map(item => item.chave));

  // Encontra apenas os dados locais deste e-mail.
  const todasAsChaves = await AsyncStorage.getAllKeys();
  const minhasChaves = todasAsChaves.filter(
    chave =>
      chave.startsWith('@MeuAutoCuidado:') &&
      chave.endsWith(`:${emailNormalizado}`)
  );

  const dadosLocais = await AsyncStorage.multiGet(minhasChaves);
  const paraEnviar: Array<[string, string]> = [];

  for (const [chave, valor] of dadosLocais) {
    if (valor !== null && !existentes.has(chave)) {
      paraEnviar.push([chave, valor]);
    }
  }

  // Guarda também o nome do perfil antigo.
  const perfisTexto = await AsyncStorage.getItem(
    '@MeuAutoCuidado:perfis_v2'
  );

  if (perfisTexto) {
    const perfis = JSON.parse(perfisTexto);

    if (Array.isArray(perfis)) {
      const perfil = perfis.find(
        item =>
          typeof item?.email === 'string' &&
          item.email.toLowerCase() === emailNormalizado
      );

      const chavePerfil =
        `@MeuAutoCuidado:perfil:${emailNormalizado}`;

      if (perfil && !existentes.has(chavePerfil)) {
        paraEnviar.push([chavePerfil, JSON.stringify(perfil)]);
      }
    }
  }

  // Copia os registros, sem apagar os originais.
  for (const [chave, valor] of paraEnviar) {
    await salvarProgressoPorEmail(
      emailNormalizado,
      chave,
      valor
    );
  }

  // Confirma se a cópia chegou à nuvem.
  const confirmacao = await buscarProgressoPorEmail(
    emailNormalizado
  );

  const salvos = new Map(
    confirmacao.map(item => [item.chave, item.valor])
  );

  const tudoConferido = paraEnviar.every(
    ([chave, valor]) => salvos.get(chave) === valor
  );

  if (!tudoConferido) {
    throw new Error(
      'Não foi possível confirmar todo o backup.'
    );
  }

  return paraEnviar.length;
}
