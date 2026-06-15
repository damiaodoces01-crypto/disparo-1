import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse JSON body payloads
  app.use(express.json());

  // API endpoint to dispatch a single message to a configured group proxy
  app.post("/api/dispatch", async (req, res) => {
    try {
      const { group, message } = req.body;
      
      if (!group || !message) {
        return res.status(400).json({ success: false, error: "Dados incompletos para disparo." });
      }

      const { type, config } = group;

      if (type === "telegram") {
        const { botToken, chatId } = config;
        if (!botToken || !chatId) {
          return res.status(400).json({ success: false, error: "Token do Bot ou Chat ID incorreto para o Telegram." });
        }

        // We make the server-side API call securely to standard Telegram Bot API
        const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: message,
            parse_mode: "HTML"
          }),
        });

        const data = await telegramResponse.json() as any;
        if (!telegramResponse.ok || !data.ok) {
          return res.status(500).json({
            success: false,
            error: data.description || `Erro HTTP Telegram: ${telegramResponse.status}`,
          });
        }

        return res.json({ success: true });
      } 
      
      if (type === "discord") {
        const { webhookUrl } = config;
        if (!webhookUrl) {
          return res.status(400).json({ success: false, error: "URL do Webhook do Discord não configurada." });
        }

        const discordResponse = await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: message }),
        });

        if (!discordResponse.ok) {
          let textErr = "";
          try {
            textErr = await discordResponse.text();
          } catch (_) {}
          return res.status(500).json({
            success: false,
            error: textErr || `Erro HTTP Discord: ${discordResponse.status}`,
          });
        }

        return res.json({ success: true });
      }

      if (type === "slack") {
        const { webhookUrl } = config;
        if (!webhookUrl) {
          return res.status(400).json({ success: false, error: "URL de Webhook do Slack não configurada." });
        }

        const slackResponse = await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: message }),
        });

        if (!slackResponse.ok) {
          let textErr = "";
          try {
            textErr = await slackResponse.text();
          } catch (_) {}
          return res.status(500).json({ 
            success: false, 
            error: textErr || `Erro HTTP Slack: ${slackResponse.status}` 
          });
        }

        return res.json({ success: true });
      }

      if (type === "webhook") {
        const { url, method = "POST", headers = "", payloadTemplate = "" } = config;
        if (!url) {
          return res.status(400).json({ success: false, error: "URL do Webhook customizado não configurada." });
        }

        let parsedHeaders: Record<string, string> = { "Content-Type": "application/json" };
        if (headers) {
          try {
            const extra = typeof headers === "string" ? JSON.parse(headers) : headers;
            parsedHeaders = { ...parsedHeaders, ...extra };
          } catch (e) {
            // fallback
          }
        }

        let body: string | undefined;
        if (method !== "GET") {
          if (payloadTemplate) {
            try {
              // Replace {message} safely inside target template string
              const escapedMessage = JSON.stringify(message).slice(1, -1);
              body = payloadTemplate.replace(/{message}/g, escapedMessage);
            } catch (e) {
              body = JSON.stringify({ message });
            }
          } else {
            body = JSON.stringify({ message });
          }
        }

        const webhookResponse = await fetch(url, {
          method,
          headers: parsedHeaders,
          body,
        });

        if (!webhookResponse.ok) {
          let textErr = "";
          try {
            textErr = await webhookResponse.text();
          } catch (_) {}
          return res.status(500).json({
            success: false,
            error: textErr || `Erro HTTP Webhook: ${webhookResponse.status}`,
          });
        }

        return res.json({ success: true });
      }

      return res.status(400).json({ success: false, error: `Tipo de canal não suportado para disparo: ${type}` });
    } catch (error: any) {
      console.error("Erro no proxy de disparo de corrida:", error);
      return res.status(500).json({ success: false, error: error.message || "Erro interno no servidor." });
    }
  });

  // Setup Vite middleware in Development mode, otherwise serve bundle statically
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express dev/prod server running on port ${PORT}`);
  });
}

startServer();
