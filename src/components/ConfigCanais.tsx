import { useState } from "react";
import { GroupChannel, GroupType } from "../types";
import { Settings, Plus, Trash2, CheckCircle2, XCircle, Play, Info } from "lucide-react";

interface ConfigCanaisProps {
  channels: GroupChannel[];
  onUpdateChannel: (channel: GroupChannel) => void;
  onAddChannel: (channel: GroupChannel) => void;
  onDeleteChannel: (id: string) => void;
}

export default function ConfigCanais({
  channels,
  onUpdateChannel,
  onAddChannel,
  onDeleteChannel,
}: ConfigCanaisProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [testStatus, setTestStatus] = useState<Record<string, { status: "success" | "error" | "loading"; message?: string }>>({});

  // Form State for creating a new channel
  const [showAddForm, setShowAddForm] = useState(false);
  const [newChanName, setNewChanName] = useState("");
  const [newChanType, setNewChanType] = useState<GroupType>("telegram");

  // Local Form state for editing dynamic credentials
  const [editFields, setEditFields] = useState<Record<string, any>>({});

  const startEdit = (chan: GroupChannel) => {
    setEditingId(chan.id);
    setEditFields({ ...chan.config });
  };

  const handleSaveEdit = (chan: GroupChannel) => {
    onUpdateChannel({
      ...chan,
      config: { ...chan.config, ...editFields }
    });
    setEditingId(null);
  };

  const handleToggleActive = (chan: GroupChannel) => {
    onUpdateChannel({
      ...chan,
      isActive: !chan.isActive
    });
  };

  const handleCreateChannel = () => {
    if (!newChanName.trim()) return;

    const newId = `chan-custom-${Date.now()}`;
    const defaultConfig: Record<GroupType, any> = {
      telegram: { botToken: "", chatId: "" },
      discord: { webhookUrl: "" },
      slack: { webhookUrl: "" },
      whatsapp: { phoneNumber: "", autoOpen: true },
      webhook: { url: "", method: "POST", headers: '{\n  "Content-Type": "application/json"\n}', payloadTemplate: '{\n  "message": "{message}"\n}' }
    };

    const newChannel: GroupChannel = {
      id: newId,
      name: newChanName,
      type: newChanType,
      isActive: true,
      config: defaultConfig[newChanType]
    };

    onAddChannel(newChannel);
    setNewChanName("");
    setShowAddForm(false);
    startEdit(newChannel);
  };

  const testChannelDiagnostic = async (chan: GroupChannel) => {
    const configToTest = editingId === chan.id ? { ...chan.config, ...editFields } : chan.config;
    const testChannel: GroupChannel = {
      ...chan,
      config: configToTest
    };

    setTestStatus((prev) => ({
      ...prev,
      [chan.id]: { status: "loading" }
    }));

    try {
      if (chan.type === "whatsapp") {
        // WhatsApp doesn't have a secure backend webhook dispatch, so we prompt a mock/direct success
        setTestStatus((prev) => ({
          ...prev,
          [chan.id]: { 
            status: "success", 
            message: "Disparo WhatsApp gera o link de compartilhamento para você enviar nos seus grupos manualmente!" 
          }
        }));
        return;
      }

      const response = await fetch("/api/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          group: testChannel,
          message: "⚠️ <b>MENSAGEM DE TESTE</b>\n\nIsso confirma que o seu canal de disparo está devidamente conectado e pronto para anunciar corridas!"
        })
      });

      const resData = await response.json();
      if (response.ok && resData.success) {
        setTestStatus((prev) => ({
          ...prev,
          [chan.id]: { status: "success", message: "Conectado com sucesso!" }
        }));
      } else {
        setTestStatus((prev) => ({
          ...prev,
          [chan.id]: { status: "error", message: resData.error || "Falha ao enviar." }
        }));
      }
    } catch (err: any) {
      setTestStatus((prev) => ({
        ...prev,
        [chan.id]: { status: "error", message: err.message || "Erro de rede ou permissão." }
      }));
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col gap-5">
      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
        <h3 className="font-semibold text-slate-800 text-lg flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#2563EB]" />
          Grupos e Canais de Disparo
        </h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="text-xs bg-[#2563EB] text-white hover:bg-blue-700 font-semibold px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          Adicionar Grupo
        </button>
      </div>

      {/* Add New Channel form */}
      {showAddForm && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-3">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Configurar Novo Grupo / Canal
          </h4>
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-2xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">
                Nome do Grupo / Cidade
              </label>
              <input
                type="text"
                value={newChanName}
                onChange={(e) => setNewChanName(e.target.value)}
                placeholder="Ex: Grupo Motoboy Centro Campinas"
                className="w-full bg-white border border-slate-200 rounded-lg text-xs px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
              />
            </div>
            <div>
              <label className="text-2xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">
                Serviço de Comunicação
              </label>
              <select
                value={newChanType}
                onChange={(e) => setNewChanType(e.target.value as GroupType)}
                className="w-full bg-white border border-slate-200 rounded-lg text-xs px-2.5 py-2 outline-none focus:ring-1 focus:ring-[#2563EB]"
              >
                <option value="telegram">Telegram (Bot / Grupo / Canal)</option>
                <option value="discord">Discord (Canal de Webhook)</option>
                <option value="slack">Slack (Inbound Webhook)</option>
                <option value="whatsapp">WhatsApp (Gerador de Link e Link Direto)</option>
                <option value="webhook">Webhook Especializado (Customizado)</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={() => setShowAddForm(false)}
              className="text-2xs text-slate-500 hover:text-slate-700 font-semibold px-2.5 py-1 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleCreateChannel}
              className="text-2xs bg-[#2563EB] text-white hover:bg-blue-700 font-semibold px-3 py-1 rounded-md transition-colors"
            >
              Confirmar
            </button>
          </div>
        </div>
      )}

      {/* List of configured channels */}
      <div className="flex flex-col gap-3">
        {channels.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">
            Nenhum grupo configurado. Adicione um canal para enviar as mensagens!
          </p>
        ) : (
          channels.map((chan) => {
            const isEditing = editingId === chan.id;
            const statusInfo = testStatus[chan.id];

            return (
              <div
                key={chan.id}
                className={`border rounded-xl transition-all p-4 ${
                  chan.isActive 
                    ? "bg-white border-slate-200" 
                    : "bg-slate-50 border-slate-100 opacity-70"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Status toggle & names */}
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={chan.isActive}
                      onChange={() => handleToggleActive(chan)}
                      className="w-4 h-4 text-[#2563EB] bg-slate-100 border-slate-200 rounded focus:ring-[#2563EB]/20 cursor-pointer"
                    />
                    <div>
                      <h4 className="text-sm font-semibold text-slate-850 flex items-center gap-1.5">
                        {chan.name}
                        <span className="text-3xs font-extrabold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 scale-90">
                          {chan.type}
                        </span>
                      </h4>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => testChannelDiagnostic(chan)}
                      className="text-3xs bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-2 py-1 rounded flex items-center gap-1 cursor-pointer"
                      title="Testar Conexão / Enviar teste"
                    >
                      <Play className="w-2.5 h-2.5 text-slate-500 fill-slate-500" />
                      Testar
                    </button>
                    {!isEditing ? (
                      <button
                        onClick={() => startEdit(chan)}
                        className="text-3xs text-[#2563EB] hover:underline font-bold px-1.5 py-1"
                      >
                        Configurar
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSaveEdit(chan)}
                        className="text-3xs text-emerald-600 hover:underline font-bold px-1.5 py-1"
                      >
                        Salvar
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (confirm(`Deseja excluir o grupo "${chan.name}"?`)) {
                          onDeleteChannel(chan.id);
                        }
                      }}
                      className="text-slate-400 hover:text-red-500 p-1"
                      title="Excluir grupo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Sub-form fields based on service type when open */}
                {isEditing && (
                  <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-col gap-3">
                    {/* For Telegram */}
                    {chan.type === "telegram" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="text-3xs font-semibold text-slate-400 uppercase tracking-wide block mb-0.5">
                            Bot API Token
                          </label>
                          <input
                            type="password"
                            value={editFields.botToken || ""}
                            onChange={(e) => setEditFields({ ...editFields, botToken: e.target.value })}
                            placeholder="Ex: 58284728:AAHxy..."
                            className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs outline-none focus:border-[#2563EB]"
                          />
                        </div>
                        <div>
                          <label className="text-3xs font-semibold text-slate-400 uppercase tracking-wide block mb-0.5">
                            Chat ID do Grupo / Canal de Destino
                          </label>
                          <input
                            type="text"
                            value={editFields.chatId || ""}
                            onChange={(e) => setEditFields({ ...editFields, chatId: e.target.value })}
                            placeholder="Ex: -1001859341203"
                            className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs outline-none focus:border-[#2563EB]"
                          />
                        </div>
                      </div>
                    )}

                    {/* For Discord */}
                    {chan.type === "discord" && (
                      <div>
                        <label className="text-3xs font-semibold text-slate-400 uppercase tracking-wide block mb-0.5">
                          URL do Webhook do Discord
                        </label>
                        <input
                          type="text"
                          value={editFields.webhookUrl || ""}
                          onChange={(e) => setEditFields({ ...editFields, webhookUrl: e.target.value })}
                          placeholder="Ex: https://discord.com/api/webhooks/..."
                          className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs outline-none focus:border-[#2563EB]"
                        />
                      </div>
                    )}

                    {/* For Slack */}
                    {chan.type === "slack" && (
                      <div>
                        <label className="text-3xs font-semibold text-slate-400 uppercase tracking-wide block mb-0.5">
                          URL de Webhook do Slack
                        </label>
                        <input
                          type="text"
                          value={editFields.webhookUrl || ""}
                          onChange={(e) => setEditFields({ ...editFields, webhookUrl: e.target.value })}
                          placeholder="Ex: https://hooks.slack.com/services/..."
                          className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs outline-none focus:border-[#2563EB]"
                        />
                      </div>
                    )}

                    {/* For WhatsApp */}
                    {chan.type === "whatsapp" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="text-3xs font-semibold text-slate-400 uppercase tracking-wide block mb-0.5">
                            Número de Telefone Opcional (com DDD)
                          </label>
                          <input
                            type="text"
                            value={editFields.phoneNumber || ""}
                            onChange={(e) => setEditFields({ ...editFields, phoneNumber: e.target.value })}
                            placeholder="Ex: 5511999999999"
                            className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs outline-none focus:border-[#2563EB]"
                          />
                        </div>
                        <div className="flex items-center pt-4">
                          <input
                            type="checkbox"
                            id={`aut-open-${chan.id}`}
                            checked={editFields.autoOpen !== false}
                            onChange={(e) => setEditFields({ ...editFields, autoOpen: e.target.checked })}
                            className="w-4 h-4 text-[#2563EB] border-slate-200 rounded"
                          />
                          <label htmlFor={`aut-open-${chan.id}`} className="ml-2 text-3xs font-bold text-slate-500 uppercase tracking-wider">
                            Abrir nova guia automaticamente
                          </label>
                        </div>
                      </div>
                    )}

                    {/* For Webhook */}
                    {chan.type === "webhook" && (
                      <div className="flex flex-col gap-2.5">
                        <div className="grid grid-cols-3 gap-2">
                          <div className="col-span-2">
                            <label className="text-3xs font-semibold text-slate-400 uppercase tracking-wide block mb-0.5">
                              Endpoint URL
                            </label>
                            <input
                              type="text"
                              value={editFields.url || ""}
                              onChange={(e) => setEditFields({ ...editFields, url: e.target.value })}
                              placeholder="https://api.empresa.com/v1/deliveries"
                              className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-3xs font-semibold text-slate-400 uppercase tracking-wide block mb-0.5">
                              Método HTTP
                            </label>
                            <select
                              value={editFields.method || "POST"}
                              onChange={(e) => setEditFields({ ...editFields, method: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs outline-none"
                            >
                              <option value="POST">POST</option>
                              <option value="PUT">PUT</option>
                              <option value="GET">GET</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="text-3xs font-semibold text-slate-400 uppercase tracking-wide block mb-0.5">
                            Headers Extras (JSON)
                          </label>
                          <textarea
                            value={editFields.headers || ""}
                            onChange={(e) => setEditFields({ ...editFields, headers: e.target.value })}
                            rows={2}
                            placeholder='{ "Authorization": "Bearer TOKEN" }'
                            className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs outline-none font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-3xs font-semibold text-slate-400 uppercase tracking-wide block mb-0.5">
                            Template de Payload (Contém tag `{`{message}`}`)
                          </label>
                          <textarea
                            value={editFields.payloadTemplate || ""}
                            onChange={(e) => setEditFields({ ...editFields, payloadTemplate: e.target.value })}
                            rows={2}
                            placeholder='{ "text": "{message}" }'
                            className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs outline-none font-mono"
                          />
                        </div>
                      </div>
                    )}

                    {/* Quick guides / instructions inside config box */}
                    <div className="bg-[#2563EB]/5 text-[#2563EB] text-[10px] p-2.5 rounded-lg flex gap-1.5 items-start mt-1">
                      <Info className="w-3.5 h-3.5 shrink-0" />
                      <div>
                        {chan.type === "telegram" && (
                          <p>
                            Dica: Crie um bot no <b>@BotFather</b> para obter o <b>Token</b>. Adicione o seu bot ao grupo e envie qualquer mensagem. Obtenha o <b>Chat ID</b> encaminhando uma mensagem do grupo para o bot <b>@username_to_id_bot</b> ou inspecionando atualizações.
                          </p>
                        )}
                        {chan.type === "discord" && (
                          <p>
                            No Discord, vá em Configurações do seu Canal {">"} Integrações {">"} Webhooks e clique em <b>Criar Webhook</b>. Copie e cole a URL acima.
                          </p>
                        )}
                        {chan.type === "slack" && (
                          <p>
                            Visite api.slack.com, crie um aplicativo e habilite "Incoming Webhooks". Copie a URL do webhook correspondente e cole no campo acima.
                          </p>
                        )}
                        {chan.type === "whatsapp" && (
                          <p>
                            Gera um link do tipo clique-para-conversar. Se preferir não preencher um número fixo, o link gerado abrirá o próprio WhatsApp permitindo que você selecione manualmente qualquer grupo ou contato na tela para liberar a mensagem!
                          </p>
                        )}
                        {chan.type === "webhook" && (
                          <p>
                            Permite enviar requisições livres do backend para sua API de logística, integrador ou SaaS especializado. A tag <code>{`{message}`}</code> será substituída pela mensagem já formatada da entrega.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Diagnostic feedback result badge */}
                {statusInfo && (
                  <div className={`mt-3 p-2.5 rounded-lg border text-xs flex gap-2 items-center leading-relaxed ${
                    statusInfo.status === "loading"
                      ? "bg-slate-50 border-slate-200 text-slate-500 animate-pulse"
                      : statusInfo.status === "success"
                      ? "bg-emerald-50 border-emerald-100 text-emerald-800"
                      : "bg-rose-50 border-rose-100 text-rose-800"
                  }`}>
                    {statusInfo.status === "loading" && (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-ping"></span>
                        Disparando mensagem de teste...
                      </>
                    )}
                    {statusInfo.status === "success" && (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>{statusInfo.message}</span>
                      </>
                    )}
                    {statusInfo.status === "error" && (
                      <>
                        <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                        <span className="break-words font-medium">Erro: {statusInfo.message}</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
