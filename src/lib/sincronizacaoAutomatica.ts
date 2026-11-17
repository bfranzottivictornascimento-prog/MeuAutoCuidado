import AsyncStorage from '@react-native-async-storage/async-storage';
import { salvarProgressoPorEmail } from './supabaseRest';

/**
 * Envia para o Supabase somente os registros que mudarem DEPOIS da entrada.
 * Isso evita substituir o backup da nuvem por dados antigos do aparelho.
 *
 * Nota: o acesso apenas por e-mail não verifica a identidade de quem entra.
 */
let emailAtivo: string | null = null;
let intervalo: ReturnType<typeof setInterval> | null = null;
let geracao = 0;
let enviando = false;
let ultimoEstado = new Map<string, string>();

function pertenceAoEmail(chave: string, email: string): boolean {
  return (
    chave.startsWith('@MeuAutoCuidado:') &&
    chave.endsWith(`:${email}`)
  );
}

async function lerDadosLocais(email: string): Promise<Map<string, string>> {
  const chaves = (await AsyncStorage.getAllKeys()).filter(chave =>
    pertenceAoEmail(chave, email)
  );
  const pares = await AsyncStorage.multiGet(chaves);
  const resultado = new Map<string, string>();
  for (const [chave, valor] of pares) {
    if (valor !== null) resultado.set(chave, valor);
  }
  return resultado;
}

export function pararSincronizacaoAutomatica(): void {
  geracao += 1;
  if (intervalo !== null) clearInterval(intervalo);
  intervalo = null;
  emailAtivo = null;
  ultimoEstado = new Map();
}

export async function sincronizarProgressoAgora(): Promise<void> {
  if (enviando || !emailAtivo) return;
  const email = emailAtivo;
  const versao = geracao;
  enviando = true;

  try {
    const atuais = await lerDadosLocais(email);
    for (const [chave, valor] of atuais) {
      if (versao !== geracao || emailAtivo !== email) return;
      if (ultimoEstado.get(chave) === valor) continue;
      // Uma falha de rede não altera o estado confirmado:
      // o próximo ciclo tentará enviar novamente.
      await salvarProgressoPorEmail(email, chave, valor);
      if (versao !== geracao || emailAtivo !== email) return;
      ultimoEstado.set(chave, valor);
    }
  } catch (erro) {
    console.warn('Sincronização com Supabase pendente:', erro);
  } finally {
    enviando = false;
  }
}

export async function iniciarSincronizacaoAutomatica(
  email: string
): Promise<void> {
  const normalizado = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizado)) {
    throw new Error('E-mail inválido para sincronização.');
  }
  if (emailAtivo === normalizado && intervalo !== null) return;

  pararSincronizacaoAutomatica();
  emailAtivo = normalizado;
  const versao = geracao;

  try {
    // Os dados antigos já foram restaurados e copiados no login.
    // Capturar a situação atual impede que ela sobrescreva a nuvem.
    const base = await lerDadosLocais(normalizado);
    if (versao !== geracao || emailAtivo !== normalizado) return;
    ultimoEstado = base;
    intervalo = setInterval(() => {
      void sincronizarProgressoAgora();
    }, 2500);
  } catch (erro) {
    if (versao === geracao) pararSincronizacaoAutomatica();
    throw erro;
  }
}
