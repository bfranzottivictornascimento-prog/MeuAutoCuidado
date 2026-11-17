
const SUPABASE_URL =
process.env.EXPO_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');

const SUPABASE_KEY =
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

async function requisicao(
caminho: string,
opcoes: RequestInit = {},
token?: string
) {
if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error('Configure o Supabase no arquivo .env');
}

const resposta = await fetch(`${SUPABASE_URL}${caminho}`, {
  ...opcoes,
  headers: {
    apikey: SUPABASE_KEY,
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...opcoes.headers,
  },
});

const texto = await resposta.text();
const dados = texto ? JSON.parse(texto) : null;

if (!resposta.ok) {
  throw new Error(
    dados?.msg ||
    dados?.error_description ||
    dados?.message ||
    'Erro ao conectar ao Supabase'
  );
}

return dados;
}

// Enviar código de confirmação para o e-mail
export async function enviarCodigo(email: string) {
return requisicao('/auth/v1/otp', {
  method: 'POST',
  body: JSON.stringify({
    email: email.trim().toLowerCase(),
    create_user: true,
  }),
});
}

// Confirmar o código recebido por e-mail
export async function confirmarCodigo(
email: string,
codigo: string
) {
return requisicao('/auth/v1/verify', {
  method: 'POST',
  body: JSON.stringify({
    email: email.trim().toLowerCase(),
    token: codigo.trim(),
    type: 'email',
  }),
});
}

// Recuperar dados da conta autenticada
export async function buscarDados(
usuarioId: string,
chave: string,
token: string
) {
const filtro =
  `?usuario_id=eq.${encodeURIComponent(usuarioId)}` +
  `&chave=eq.${encodeURIComponent(chave)}` +
  '&select=valor';

return requisicao(
  `/rest/v1/meuautocuidado_dados${filtro}`,
  { method: 'GET' },
  token
);
}

// Salvar dados na conta autenticada
export async function salvarDados(
usuarioId: string,
chave: string,
valor: string,
token: string
) {
return requisicao(
  '/rest/v1/meuautocuidado_dados?on_conflict=usuario_id,chave',
  {
    method: 'POST',
    headers: {
      Prefer: 'resolution=merge-duplicates',
    },
    body: JSON.stringify({
      usuario_id: usuarioId,
      chave,
      valor,
    }),
  },
  token
);
}

 // Criar uma conta com e-mail e senha
 export async function cadastrarComSenha(
    email: string,
    senha: string
  ) {
    return requisicao('/auth/v1/signup', {
      method: 'POST',
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        password: senha,
      }),
    });
  }
  
  // Entrar em uma conta existente
  export async function entrarComSenha(
    email: string,
    senha: string
  ) {
    return requisicao('/auth/v1/token?grant_type=password', {
      method: 'POST',
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        password: senha,
      }),
    });
  }

  export async function buscarProgressoPorEmail(
    email: string
  ): Promise<Array<{ chave: string; valor: string | null }>> {
    const dados = await requisicao(
      '/rest/v1/rpc/mau_dados_ler',
      {
        method: 'POST',
        body: JSON.stringify({
          p_email: email.trim().toLowerCase(),
        }),
      }
    );
  
    return Array.isArray(dados) ? dados : [];
  }
  
  export async function salvarProgressoPorEmail(
    email: string,
    chave: string,
    valor: string
  ): Promise<void> {
    await requisicao(
      '/rest/v1/rpc/mau_dados_salvar',
      {
        method: 'POST',
        body: JSON.stringify({
          p_email: email.trim().toLowerCase(),
          p_chave: chave,
          p_valor: valor,
        }),
      }
    );
  }
    