export const USER_ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrador',
  CASHIER: 'Caixa',
  COOK: 'Cozinheiro',
  WAITER: 'Garçom',
};

export function formatUserRole(role?: string | null): string {
  if (!role) return '';
  return USER_ROLE_LABELS[role.toUpperCase()] ?? role;
}

export const BILL_STATUS_LABELS: Record<string, string> = {
  OPEN: 'Aberta',
  CLOSED: 'Fechada',
  PAID: 'Paga',
  CANCELLED: 'Cancelada',
};

export function formatBillStatus(status?: string | null): string {
  if (!status) return '';
  return BILL_STATUS_LABELS[status] ?? status;
}

export const ORDER_STATUS_LABELS: Record<string, string> = {
  WAITING: 'Aguardando',
  'Awaiting preparation': 'Aguardando',
  PREPARING: 'Em Andamento',
  Preparing: 'Em Andamento',
  DELIVERED: 'Entregue',
  Delivered: 'Entregue',
  CANCELLED: 'Cancelado',
  Cancelled: 'Cancelado',
};

export function formatOrderStatus(status?: string | null): string {
  if (!status) return '';
  return ORDER_STATUS_LABELS[status] ?? status;
}

const ERROR_TRANSLATIONS: Array<[RegExp | string, string]> = [
  [/A bill can only be updated if its status is OPEN/i, 'Uma comanda só pode ser atualizada se o status for Aberta.'],
  [/A bill cannot be cancelled if its status is PAID/i, 'Uma comanda não pode ser cancelada se estiver Paga.'],
  [/Cannot cancel a bill with delivered orders/i, 'Não é possível cancelar uma comanda com pedidos entregues. Por favor, feche e pague a comanda.'],
  [/A bill cannot be closed if its status is CANCELLED/i, 'Uma comanda cancelada não pode ser fechada.'],
  [/A bill cannot be paid if its status is CANCELLED/i, 'Uma comanda cancelada não pode ser paga.'],
  [/New orders can only be added to a bill if its status is OPEN/i, 'Novos pedidos só podem ser adicionados se a comanda estiver Aberta.'],
  [/The number of chart days must be between 7 and 30/i, 'O número de dias do gráfico deve estar entre 7 e 30.'],
  [/is not available/i, 'O produto selecionado não está disponível.'],
  [/An order can only be edited if its status is WAITING/i, 'Um pedido só pode ser editado enquanto estiver Aguardando preparo.'],
  [/An order can only be prepared if its status is WAITING/i, 'Um pedido só pode ser preparado enquanto estiver Aguardando preparo.'],
  [/An order can only be delivered if its status is PREPARING/i, 'Um pedido só pode ser entregue se estiver Em Andamento.'],
  [/An order cannot be cancelled if its status is DELIVERED/i, 'Um pedido já entregue não pode ser cancelado.'],
  [/A Product with the name .* already exists/i, 'Já existe um produto cadastrado com este nome.'],
  [/A ProductCategory with the name .* already exists/i, 'Já existe uma categoria cadastrada com este nome.'],
  [/A RestaurantTable with the number .* already exists/i, 'Já existe uma mesa cadastrada com este número.'],
  [/A user with this email already exists/i, 'Já existe um usuário cadastrado com este e-mail.'],
  [/The current password provided is incorrect/i, 'A senha atual informada está incorreta.'],
  [/Data integrity violation/i, 'Violação de integridade nos dados. O registro pode estar vinculado a outros itens.'],
  [/Internal server error/i, 'Ocorreu um erro interno no servidor. Tente novamente mais tarde.'],
  [/Bad credentials/i, 'E-mail ou senha incorretos.'],
  [/User not found/i, 'Usuário não encontrado.'],
  [/Bill not found/i, 'Comanda não encontrada.'],
  [/Order not found/i, 'Pedido não encontrado.'],
  [/Product not found/i, 'Produto não encontrado.'],
  [/Category not found/i, 'Categoria não encontrada.'],
  [/must not be blank/i, 'Este campo é obrigatório.'],
  [/must not be null/i, 'Este campo é obrigatório.'],
  [/must be greater than 0/i, 'O valor deve ser maior que zero.'],
];

export function translateErrorMessage(message?: string | null, fallback = 'Ocorreu um erro. Tente novamente.'): string {
  if (!message || typeof message !== 'string') return fallback;
  const trimmed = message.trim();
  for (const [pattern, translation] of ERROR_TRANSLATIONS) {
    if (typeof pattern === 'string') {
      if (trimmed.toLowerCase().includes(pattern.toLowerCase())) return translation;
    } else if (pattern.test(trimmed)) {
      return translation;
    }
  }
  // If the message has no English patterns matched or is already Portuguese, return it
  return trimmed;
}

export function getErrorMessage(err: unknown, fallback = 'Erro na operação.'): string {
  if (err && typeof err === 'object') {
    if ('message' in err && typeof err.message === 'string') {
      return translateErrorMessage(err.message, fallback);
    }
  }
  return fallback;
}
