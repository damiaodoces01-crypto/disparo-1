export type GroupType = "telegram" | "discord" | "whatsapp" | "slack" | "webhook";

export interface TelegramConfig {
  botToken: string;
  chatId: string;
}

export interface DiscordConfig {
  webhookUrl: string;
}

export interface SlackConfig {
  webhookUrl: string;
}

export interface WhatsAppConfig {
  phoneNumber?: string; // Optional: send to specific driver or generate generic open text link
  autoOpen: boolean; // Whether to automatically open the browser window with the custom link
}

export interface WebhookConfig {
  url: string;
  method: "POST" | "GET" | "PUT";
  headers: string; // JSON string
  payloadTemplate: string; // Custom payload template with {message} placeholder
}

export interface GroupChannel {
  id: string;
  name: string;
  type: GroupType;
  isActive: boolean;
  config: {
    botToken?: string;
    chatId?: string;
    webhookUrl?: string;
    phoneNumber?: string;
    autoOpen?: boolean;
    url?: string;
    method?: "POST" | "GET" | "PUT";
    headers?: string;
    payloadTemplate?: string;
  };
}

export interface MessageTemplate {
  id: string;
  name: string;
  content: string; // Raw template text with {retirada}, {entrega}, {valor} placeholders
}

export interface DeliveryRun {
  retirada: string;
  entrega: string;
  valor: string; // text or formatted number
  veiculo: string; // 'moto', 'carro', etc.
  km?: string; // Distance in kilometers
  observacao?: string;
}

export interface DispatchLog {
  id: string;
  timestamp: string;
  run: DeliveryRun;
  messageSent: string;
  results: {
    channelName: string;
    channelType: GroupType;
    success: boolean;
    errorDetails?: string;
    whatsappLink?: string; // If WhatsApp click to share was generated
  }[];
}

export interface PricingRules {
  baseFee: number;
  ratePerKm: number;
  minFee: number;
  enabled: boolean;
}

