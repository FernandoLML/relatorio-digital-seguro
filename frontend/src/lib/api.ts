// frontend/src/lib/api.ts
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

export const fetcher = async <T>(url: string): Promise<T> => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BACKEND_URL}${url}`, { headers });
  if (!response.ok) {
    const errorData: { message?: string } = await response.json();
    throw new Error(errorData.message || 'Ocorreu um erro no pedido da API.');
  }
  return response.json() as Promise<T>;
};

export const postData = async <ResponseData, RequestData>(url: string, data: RequestData, method: 'POST' | 'PUT' = 'POST'): Promise<ResponseData> => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BACKEND_URL}${url}`, {
    method,
    headers,
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData: { message?: string } = await response.json();
    throw new Error(errorData.message || 'Ocorreu um erro no pedido da API.');
  }
  return response.json() as Promise<ResponseData>;
};

export const uploadFile = async <ResponseData>(url: string, formData: FormData): Promise<ResponseData> => {
  const token = getAuthToken();
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BACKEND_URL}${url}`, {
    method: 'POST',
    headers,
    body: formData,
  });
  if (!response.ok) {
    const errorData: { message?: string } = await response.json();
    throw new Error(errorData.message || 'Ocorreu um erro no upload do ficheiro.');
  }
  return response.json() as Promise<ResponseData>;
};

// Interfaces de resposta e pedido para Login/Registro
interface LoginRequest {
  email: string;
  password: string;
}
interface LoginResponse {
  token: string;
  name: string;
  role: string;
  email: string;
  _id: string;
}

export const login = async (credentials: { email: string; password: string }): Promise<any> => {
  const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    // Envia o objeto de credenciais diretamente
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Falha na autenticação');
  }

  return response.json();
};

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: string;
}
interface RegisterResponse {
  _id: string;
  name: string;
  email: string;
  role: string;
  token: string;
}
export const register = (name: string, email: string, password: string, role: string): Promise<RegisterResponse> => postData<RegisterResponse, RegisterRequest>('/api/auth/register', { name, email, password, role });

// Adicione a interface para ExpenseReport (conforme seu modelo no backend)
interface ExpenseReport {
  _id: string;
  description: string;
  amount: number;
  submittedBy: string; // Isso deve ser o ID do User
  receiptUrl?: string; // Opcional
  status: 'pendente' | 'aprovado' | 'rejeitado' | 'assinado';
  // Adicione outros campos conforme seu modelo ExpenseReport.js
}

interface SubmitExpenseResponse {
  message: string;
  report: ExpenseReport; // ALTERADO: Tipagem de 'report' para a interface ExpenseReport
}

// ALTERADO: A tipagem da função submitExpense
//export const submitExpense = (formData: FormData): Promise<SubmitExpenseResponse> => uploadFile<SubmitExpenseResponse>('/api/expenses/submit', formData);


export const submitExpense = async (formData: FormData): Promise<any> => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Nenhum token de autenticação encontrado.');
  }

  const response = await fetch(`${BACKEND_URL}/api/expenses/submit`, {
    method: 'POST',
    headers: {
      // Para FormData, não definimos 'Content-Type'. O navegador faz isso automaticamente
      // com o 'boundary' correto, o que é crucial para o upload de ficheiros.
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Falha ao submeter o relatório.');
  }

  return response.json();
};

export const getPendingExpenses = async (): Promise<any[]> => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Nenhum token de autenticação encontrado.');
  }

  const response = await fetch(`${BACKEND_URL}/api/expenses/pending`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Falha ao buscar relatórios pendentes.');
  }

  return response.json();
};

// Função para buscar um relatório de despesa específico pelo seu ID
export const getExpenseById = async (id: string): Promise<any> => {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('Nenhum token de autenticação encontrado.');
    }

    const response = await fetch(`${BACKEND_URL}/api/expenses/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao buscar o relatório.');
    }

    return response.json();
};

// Função para validar (aprovar/rejeitar) um relatório
export const validateExpense = async (id: string, status: 'aprovado' | 'rejeitado', managerComment: string): Promise<any> => {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('Nenhum token de autenticação encontrado.');
    }

    const response = await fetch(`${BACKEND_URL}/api/expenses/${id}/validate`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status, managerComment }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao validar o relatório.');
    }

    return response.json();
};

// Função para buscar relatórios aprovados e pendentes de assinatura
export const getApprovedExpenses = async (): Promise<any[]> => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Nenhum token de autenticação encontrado.');
  }

  const response = await fetch(`${BACKEND_URL}/api/expenses/approved`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Falha ao buscar relatórios aprovados.');
  }

  return response.json();
};

// Função para enviar a assinatura e a chave pública para o backend
export const signExpense = async (id: string, signature: string, publicKey: string): Promise<any> => {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('Nenhum token de autenticação encontrado.');
    }

    const response = await fetch(`${BACKEND_URL}/api/signatures/${id}/sign`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ signature, publicKey }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao salvar a assinatura.');
    }

    return response.json();
};

export const getSignedExpenses = async (): Promise<any[]> => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Nenhum token de autenticação encontrado.');

  const response = await fetch(`${BACKEND_URL}/api/expenses/signed`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Falha ao buscar relatórios assinados.');
  }
  return response.json();
};


// Função para buscar os dados necessários para verificação da assinatura
export const getSignatureForVerification = async (id: string): Promise<any> => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Nenhum token de autenticação encontrado.');

  const response = await fetch(`${BACKEND_URL}/api/signatures/${id}/verify`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Falha ao buscar dados da assinatura.');
  }
  return response.json();
};