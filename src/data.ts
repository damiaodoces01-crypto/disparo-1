import { GroupChannel, MessageTemplate } from "./types";

export const DEFAULT_TEMPLATES: MessageTemplate[] = [
  {
    id: "tpl-1",
    name: "⚡ Motoboy Padrão (Sem Formatação)",
    content: "🚚 NOVA ENTREGA DISPONÍVEL!\n\n📍 Retirada: {retirada}\n🏁 Entrega: {entrega}\n📏 Distância: {km} km\n💵 Valor/Taxa: R$ {valor}\n\nQuem puder assumir, chama no privado para liberar!"
  },
  {
    id: "tpl-2",
    name: "💬 Telegram Estilizado (HTML)",
    content: "🚀 <b>NOVA CORRIDA ENCONTRADA!</b> 🚀\n\n📍 Retirada: <i>{retirada}</i>\n🏁 Entrega: <i>{entrega}</i>\n📏 Distância: <b>{km} km</b>\n💵 Taxa: <b>R$ {valor}</b>\n\n⚠️ <i>Favor chamar no WhatsApp para confirmar aceitação!</i>"
  },
  {
    id: "tpl-3",
    name: "📦 Frete Direto Curto",
    content: "📦 PEDIDO: Retirada {retirada} -> Entrega {entrega} ({km} km) | Valor do serviço: R$ {valor}."
  }
];

export const DEFAULT_CHANNELS: GroupChannel[] = [
  {
    id: "chan-telegram-sample",
    name: "Grupo de Motoboys SP (Telegram)",
    type: "telegram",
    isActive: false,
    config: {
      botToken: "", // To be filled by user
      chatId: "" // To be filled by user
    }
  },
  {
    id: "chan-discord-sample",
    name: "Canal Entregas Sul (Discord)",
    type: "discord",
    isActive: false,
    config: {
      webhookUrl: "" // To be filled by user
    }
  },
  {
    id: "chan-whatsapp-generic",
    name: "Disparo via Link Direto (WhatsApp)",
    type: "whatsapp",
    isActive: true, // Enabled by default as it requires no system token API keys!
    config: {
      phoneNumber: "",
      autoOpen: true
    }
  }
];
