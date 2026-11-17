
import AsyncStorage from '@react-native-async-storage/async-storage';
import { buscarProgressoPorEmail } from './supabaseRest';

export async function restaurarProgressoDoSupabase(
  email: string
): Promise<number> {
  const emailNormalizado = email.trim().toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNormalizado)) {
    throw new Error('Digite um e-mail válido.');
  }

  const dadosNuvem = await buscarProgressoPorEmail(
    emailNormalizado
  );

  const dadosDaConta = dadosNuvem.filter(
    (item): item is { chave: string; valor: string } =>
      !!item &&
      typeof item.chave === 'string' &&
      typeof item.valor === 'string' &&
      item.chave.startsWith('@MeuAutoCuidado:') &&
      item.chave.endsWith(`:${emailNormalizado}`)
  );

  if (dadosDaConta.length === 0) return 0;

  const chaves = dadosDaConta.map(item => item.chave);
  const existentes = await AsyncStorage.multiGet(chaves);

  const faltantes = dadosDaConta
    .filter((_item, indice) => existentes[indice]?.[1] === null)
    .map(item => [item.chave, item.valor] as [string, string]);

  // Preserva tudo o que já existe no computador.
  if (faltantes.length > 0) {
    await AsyncStorage.multiSet(faltantes);

    const verificacao = await AsyncStorage.multiGet(
      faltantes.map(([chave]) => chave)
    );

    if (
      verificacao.some(
        ([, valor], indice) => valor !== faltantes[indice][1]
      )
    ) {
      throw new Error(
        'Não foi possível confirmar a recuperação.'
      );
    }
  }

  return faltantes.length;
}
