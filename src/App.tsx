import React, { useState, useEffect } from "react";
import {
  DeliveryRun,
  GroupChannel,
  MessageTemplate,
  DispatchLog,
  GroupType,
  PricingRules,
} from "./types";
import { DEFAULT_CHANNELS, DEFAULT_TEMPLATES } from "./data";
import FormCorrida from "./components/FormCorrida";
import TemplateManager from "./components/TemplateManager";
import ConfigCanais from "./components/ConfigCanais";
import ConfigTarifas from "./components/ConfigTarifas";
import {
  Send,
  History,
  CheckCircle,
  XCircle,
  Clock,
  Settings,
  HelpCircle,
  Copy,
  Check,
  Smartphone,
  ExternalLink,
  MessageSquare,
  Truck,
  PlusCircle,
  Sparkles,
} from "lucide-react";

export default function App() {
  // Load initial states from localStorage if available
  const [run, setRun] = useState<DeliveryRun>(() => {
    const saved = localStorage.getItem("logi_current_run");
    return saved
      ? JSON.parse(saved)
      : { retirada: "", entrega: "", valor: "", km: "", veiculo: "Moto", observacao: "" };
  });

  const [channels, setChannels] = useState<GroupChannel[]>(() => {
    const saved = localStorage.getItem("logi_channels");
    return saved ? JSON.parse(saved) : DEFAULT_CHANNELS;
  });

  const [templates, setTemplates] = useState<MessageTemplate[]>(() => {
    const saved = localStorage.getItem("logi_templates");
    return saved ? JSON.parse(saved) : DEFAULT_TEMPLATES;
  });

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(() => {
    const saved = localStorage.getItem("logi_selected_template_id");
    return saved || DEFAULT_TEMPLATES[0].id;
  });

  const [logs, setLogs] = useState<DispatchLog[]>(() => {
    const saved = localStorage.getItem("logi_dispatch_logs");
    return saved ? JSON.parse(saved) : [];
  });

  const [pricingRules, setPricingRules] = useState<PricingRules>(() => {
    const saved = localStorage.getItem("logi_pricing_rules");
    return saved
      ? JSON.parse(saved)
      : { baseFee: 8.00, ratePerKm: 2.50, minFee: 12.00, enabled: true };
  });

  // UI state
  const [activeTab, setActiveTab] = useState<"disparo" | "configuracao">("disparo");
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchStatusList, setDispatchStatusList] = useState<{
    channelName: string;
    channelType: GroupType;
    status: "idle" | "sending" | "success" | "error";
    errorDetails?: string;
  }[]>([]);
  
  const [toast, setToast] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Sync state with local storage
  useEffect(() => {
    localStorage.setItem("logi_current_run", JSON.stringify(run));
  }, [run]);

  useEffect(() => {
    localStorage.setItem("logi_channels", JSON.stringify(channels));
  }, [channels]);

  useEffect(() => {
    localStorage.setItem("logi_templates", JSON.stringify(templates));
  }, [templates]);

  useEffect(() => {
    localStorage.setItem("logi_selected_template_id", selectedTemplateId);
  }, [selectedTemplateId]);

  useEffect(() => {
    localStorage.setItem("logi_dispatch_logs", JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem("logi_pricing_rules", JSON.stringify(pricingRules));
  }, [pricingRules]);

  // Toast auto-clear
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Format active message preview text
  const currentTemplate =
    templates.find((t) => t.id === selectedTemplateId) || templates[0] || DEFAULT_TEMPLATES[0];

  const formattedMessage = React.useMemo(() => {
    if (!currentTemplate) return "";
    let txt = currentTemplate.content;
    
    // Safety substitution regexes
    txt = txt.replace(/{retirada}/g, run.retirada || "");
    txt = txt.replace(/{entrega}/g, run.entrega || "");
    txt = txt.replace(/{valor}/g, run.valor || "");
    txt = txt.replace(/{km}/g, run.km || "");
    txt = txt.replace(/{veiculo}/g, run.veiculo || "Moto");
    txt = txt.replace(/{observacao}/g, run.observacao || "Não informado");
    
    return txt;
  }, [currentTemplate, run]);

  // Copy standard formatted message to clipboard
  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(formattedMessage);
      setIsCopied(true);
      setToast({ type: "success", message: "Mensagem copiada para a área de transferência!" });
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      setToast({ type: "error", message: "Erro ao copiar mensagem." });
    }
  };

  // Channel update handlers
  const handleUpdateChannel = (updated: GroupChannel) => {
    setChannels((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    setToast({ type: "success", message: `Canal "${updated.name}" atualizado!` });
  };

  const handleAddChannel = (newChan: GroupChannel) => {
    setChannels((prev) => [...prev, newChan]);
    setToast({ type: "success", message: `Canal "${newChan.name}" adicionado com sucesso!` });
  };

  const handleDeleteChannel = (id: string) => {
    setChannels((prev) => prev.filter((c) => c.id !== id));
    setToast({ type: "info", message: "Canal removido." });
  };

  // Template update handlers
  const handleSaveTemplate = (updated: MessageTemplate) => {
    setTemplates((prev) => {
      const exists = prev.some((t) => t.id === updated.id);
      if (exists) {
        return prev.map((t) => (t.id === updated.id ? updated : t));
      }
      return [...prev, updated];
    });
    setToast({ type: "success", message: `Modelo "${updated.name}" gravado com sucesso!` });
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    setToast({ type: "info", message: "Modelo excluído." });
  };

  // Trigger form clear
  const handleClearForm = () => {
    setRun({ retirada: "", entrega: "", valor: "", km: "", veiculo: "Moto", observacao: "" });
    setToast({ type: "info", message: "Campos limpos!" });
  };

  // Reload previous run coordinates back into form
  const handleReloadRun = (historicRun: DeliveryRun) => {
    setRun(historicRun);
    setToast({
      type: "info",
      message: `Dados carregados: ${historicRun.retirada} para ${historicRun.entrega}`,
    });
    setActiveTab("disparo");
  };

  // Bulk action: DISPATCH to all selected active group channels
  const handleGlobalDispatch = async () => {
    // Client-side validations
    if (!run.retirada.trim() || !run.entrega.trim() || !run.valor.trim()) {
      setToast({
        type: "error",
        message: "Favor preencher pelo menos Retirada, Entrega e Valor da corrida!",
      });
      return;
    }

    const activeSelectedChannels = channels.filter((c) => c.isActive);

    if (activeSelectedChannels.length === 0) {
      setToast({
        type: "error",
        message: "Nenhum grupo de disparo está ativo! Ative pelo menos um canal antes de disparar.",
      });
      return;
    }

    setIsDispatching(true);
    
    // Initialize temporary reporting item
    const initialStatus = activeSelectedChannels.map((c) => ({
      channelName: c.name,
      channelType: c.type,
      status: "sending" as const,
    }));
    setDispatchStatusList(initialStatus);

    const resultsLog: DispatchLog["results"] = [];

    // Trigger dispatches concurrently or sequentially depending on configuration
    const dispatchPromises = activeSelectedChannels.map(async (chan) => {
      try {
        if (chan.type === "whatsapp") {
          // Resolve custom WhatsApp sharing text
          const textEncoded = encodeURIComponent(formattedMessage);
          const sanitizedPhone = chan.config.phoneNumber?.replace(/\D/g, "") || "";
          
          let whatsappUrl = `https://api.whatsapp.com/send?text=${textEncoded}`;
          if (sanitizedPhone) {
            whatsappUrl = `https://api.whatsapp.com/send?phone=${sanitizedPhone}&text=${textEncoded}`;
          }

          // Automatically open in another tab if feature toggled in config
          if (chan.config.autoOpen !== false) {
            window.open(whatsappUrl, "_blank");
          }

          resultsLog.push({
            channelName: chan.name,
            channelType: "whatsapp",
            success: true,
            whatsappLink: whatsappUrl,
          });

          setDispatchStatusList((prev) =>
            prev.map((item) =>
              item.channelName === chan.name ? { ...item, status: "success" } : item
            )
          );
        } else {
          // Send to server-side secure proxies (Telegram, Discord, Slack, custom webhook)
          const response = await fetch("/api/dispatch", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              group: chan,
              message: formattedMessage,
            }),
          });

          const data = await response.json();

          if (response.ok && data.success) {
            resultsLog.push({
              channelName: chan.name,
              channelType: chan.type,
              success: true,
            });

            setDispatchStatusList((prev) =>
              prev.map((item) =>
                item.channelName === chan.name ? { ...item, status: "success" } : item
              )
            );
          } else {
            resultsLog.push({
              channelName: chan.name,
              channelType: chan.type,
              success: false,
              errorDetails: data.error || `Erro de resposta: Código ${response.status}`,
            });

            setDispatchStatusList((prev) =>
              prev.map((item) =>
                item.channelName === chan.name
                  ? { ...item, status: "error", errorDetails: data.error }
                  : item
              )
            );
          }
        }
      } catch (err: any) {
        resultsLog.push({
          channelName: chan.name,
          channelType: chan.type,
          success: false,
          errorDetails: err.message || "Erro desconhecido de conexão com a API local.",
        });

        setDispatchStatusList((prev) =>
          prev.map((item) =>
            item.channelName === chan.name
              ? { ...item, status: "error", errorDetails: err.message }
              : item
          )
        );
      }
    });

    await Promise.all(dispatchPromises);

    // Save logs dynamically to history
    const dateFormatted = new Date().toISOString();
    const newLog: DispatchLog = {
      id: `log-${Date.now()}`,
      timestamp: dateFormatted,
      run: { ...run },
      messageSent: formattedMessage,
      results: resultsLog,
    };

    setLogs((prev) => [newLog, ...prev].slice(0, 50)); // Limit of last 50 dispatches in store
    setIsDispatching(false);

    // Determine absolute success code
    const failuresCount = resultsLog.filter((r) => !r.success).length;
    if (failuresCount === 0) {
      setToast({
        type: "success",
        message: `Sucesso! Mensagem enviada para todos os ${activeSelectedChannels.length} grupos selecionados!`,
      });
    } else if (failuresCount < activeSelectedChannels.length) {
      setToast({
        type: "info",
        message: "Disparo concluído com alertas de falhas em alguns canais.",
      });
    } else {
      setToast({
        type: "error",
        message: "Houve erros em todos os disparos de mensagens nos canais. Verifique os segredos/tokens.",
      });
    }
  };

  // Quick channel checkbox toggle for active listing
  const toggleChannelSelection = (id: string) => {
    setChannels((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c))
    );
  };

  return (
    <div id="app-root-container" className="w-full min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      
      {/* Toast Notification Layer */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 transform translate-y-0 transition-transform duration-300 max-w-sm px-4 py-3 rounded-xl shadow-lg border flex gap-3 items-center ${
            toast.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : toast.type === "error"
              ? "bg-rose-50 border-rose-200 text-rose-800"
              : "bg-blue-50 border-blue-200 text-blue-800"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : toast.type === "error" ? (
            <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
          ) : (
            <Sparkles className="w-5 h-5 text-blue-600 shrink-0" />
          )}
          <span className="text-xs font-semibold leading-relaxed">{toast.message}</span>
        </div>
      )}

      {/* Primary Professional Polish Header Navigation */}
      <header className="h-16 bg-slate-900 text-white flex items-center justify-between px-6 md:px-8 shrink-0 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Truck className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-base md:text-lg font-bold tracking-tight uppercase flex items-center gap-1.5 leading-none">
              LogiDispatch <span className="text-blue-400 font-bold text-xs bg-blue-950/50 px-2 py-0.5 rounded border border-blue-900/60 font-sans">v2.5</span>
            </h1>
            <span className="text-3xs text-slate-400 tracking-wider uppercase font-medium mt-0.5">Central de Disparos Rápidos de Corrida</span>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab("disparo")}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${
              activeTab === "disparo"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-slate-700/50"
            }`}
          >
            ⚡ Painel de Disparo
          </button>
          <button
            onClick={() => setActiveTab("configuracao")}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${
              activeTab === "configuracao"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-slate-700/50"
            }`}
          >
            ⚙️ Canais & Modelos
          </button>
        </div>

        {/* User Badge Info */}
        <div className="hidden md:flex items-center gap-3 border-l border-slate-700 pl-4">
          <div className="text-right">
            <p className="text-3xs text-slate-400 uppercase tracking-wider font-bold">Operador Ativo</p>
            <p className="text-xs font-medium text-slate-200">damiaodoces01@gmail.com</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-800 text-xs">
            OP
          </div>
        </div>
      </header>

      {/* Main Content Space */}
      <div className="flex-1 max-w-[1400px] w-full mx-auto flex flex-col lg:flex-row overflow-hidden">
        
        {/* Left Side Menu: Groups Selection & Immediate History Logs */}
        <aside className="w-full lg:w-80 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 shrink-0 flex flex-col p-5 md:p-6 gap-6 max-h-full overflow-y-auto">
          
          {/* Quick active selectors */}
          <div>
            <h2 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-3 flex items-center justify-between">
              <span>Disparar para:</span>
              <span className="text-3xs text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded">
                {channels.filter((c) => c.isActive).length} Grupo(s)
              </span>
            </h2>
            <div className="flex flex-col gap-2">
              {channels.map((chan) => (
                <label
                  key={chan.id}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border cursor-pointer transition-all ${
                    chan.isActive
                      ? "bg-blue-50/50 border-blue-200 text-blue-900 shadow-sm"
                      : "bg-slate-50/50 border-slate-200 text-slate-650 hover:bg-slate-100/50"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <input
                      type="checkbox"
                      checked={chan.isActive}
                      onChange={() => toggleChannelSelection(chan.id)}
                      className="w-4.5 h-4.5 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500/20 cursor-pointer"
                    />
                    <div className="truncate">
                      <p className="text-xs font-bold truncate leading-tight">{chan.name}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-medium mt-0.5 tracking-wider font-mono">
                        {chan.type}
                      </p>
                    </div>
                  </div>
                  {/* Active Indicator status light */}
                  <span className={`w-2 h-2 rounded-full ${chan.isActive ? "bg-emerald-500 shadow-sm shadow-emerald-400" : "bg-slate-300"}`}></span>
                </label>
              ))}
            </div>
            
            <div className="mt-3">
              <button
                onClick={() => setActiveTab("configuracao")}
                className="text-3xs font-extrabold text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-wider flex items-center gap-1"
              >
                + Gerenciar Credenciais ou Adicionar Canais
              </button>
            </div>
          </div>

          <div className="border-t border-slate-150 my-1"></div>

          {/* Historic logs of previous runs inside the layout */}
          <div className="flex-1 flex flex-col min-h-[250px]">
            <h2 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <History className="w-4 h-4 text-slate-400" />
              Últimos Disparos
            </h2>
            
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[350px] lg:max-h-[500px]">
              {logs.length === 0 ? (
                <div className="h-28 rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center p-4 text-center">
                  <Clock className="w-5 h-5 text-slate-300 mb-1" />
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Nenhum disparo registrado ainda. Suas corridas enviadas aparecerão aqui.
                  </p>
                </div>
              ) : (
                logs.map((log) => {
                  const successSum = log.results.filter((res) => res.success).length;
                  const totalSum = log.results.length;

                  return (
                    <div
                      key={log.id}
                      onClick={() => handleReloadRun(log.run)}
                      className="group p-3 bg-slate-50 hover:bg-slate-100/75 border border-slate-200 rounded-xl cursor-pointer transition-all hover:border-slate-300 active:scale-[0.99] relative"
                      title="Clique para carregar dados de volta no formulário"
                    >
                      {/* Top Header Row of Item */}
                      <div className="flex justify-between items-start gap-2 mb-1.5">
                        <span className="text-xs font-extrabold text-blue-600 bg-white border border-slate-200 group-hover:bg-blue-50/20 rounded px-2 py-0.5 font-mono">
                          R$ {log.run.valor}
                        </span>
                        
                        {/* Summary status tag */}
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          successSum === totalSum
                            ? "bg-emerald-50 text-emerald-700"
                            : successSum > 0
                            ? "bg-amber-50 text-amber-700"
                            : "bg-rose-50 text-rose-700"
                        }`}>
                          {successSum}/{totalSum} OK
                        </span>
                      </div>

                      {/* Route specs */}
                      <div className="space-y-0.5">
                        <p className="text-[11px] text-slate-600 font-bold truncate flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                          {log.run.retirada}
                        </p>
                        <p className="text-[11px] text-slate-600 font-bold truncate flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
                          {log.run.entrega}
                        </p>
                      </div>

                      <div className="mt-2 pt-2 border-t border-slate-200/55 flex justify-between items-center text-[10px] text-slate-400 font-medium tracking-tight">
                        <span className="capitalize">{log.run.veiculo || "Moto"}{log.run.km ? ` • ${log.run.km} km` : ""}</span>
                        <span>{new Date(log.timestamp).toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </aside>

        {/* Main Worksite area */}
        <main className="flex-1 p-5 md:p-8 overflow-y-auto">
          
          {activeTab === "disparo" ? (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
              
              {/* Form Col */}
              <div className="xl:col-span-7 flex flex-col gap-6">
                
                {/* Information Header card */}
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
                  <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-10">
                    <Truck className="w-48 h-48" />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-blue-300 uppercase bg-blue-900/40 px-2 py-0.5 rounded border border-blue-900">
                        Painel Prontidão
                      </span>
                    </div>
                    <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">Disparar Nova Corrida</h2>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      Preencha o local de coleta, endereço de destino e os custos para notificar toda a sua rede de motoboys e caminhoneiros instantaneamente de forma segura.
                    </p>
                  </div>
                </div>

                {/* The Input fields component */}
                <FormCorrida
                  run={run}
                  pricingRules={pricingRules}
                  onChange={(updated) => setRun(updated)}
                  onClear={handleClearForm}
                />
              </div>

              {/* Message Template selection & Live Formatting Previews for the user */}
              <div className="xl:col-span-5 flex flex-col gap-6">
                
                {/* Active Message template dropdown / direct text modifier */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col gap-4">
                  <h3 className="font-semibold text-slate-800 text-sm uppercase tracking-wider flex items-center justify-between">
                    <span>Modelo de Texto Ativo</span>
                    <span className="text-3xs text-[#2563EB] font-bold px-2 py-0.5 rounded bg-[#2563EB]/10">
                      Formatação Automática
                    </span>
                  </h3>
                  
                  <div className="flex flex-col gap-2.5">
                    <select
                      value={selectedTemplateId}
                      onChange={(e) => setSelectedTemplateId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/10"
                    >
                      {templates.map((tpl) => (
                        <option key={tpl.id} value={tpl.id}>
                          {tpl.name}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => setActiveTab("configuracao")}
                      className="text-3xs text-[#2563EB] hover:underline font-bold text-right"
                    >
                      Configurar ou cadastrar novos modelos →
                    </button>
                  </div>
                </div>

                {/* Formatted Text Preview Block */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col gap-4">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                    <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">
                      Preview do Envio Real
                    </h3>
                    <button
                      type="button"
                      onClick={handleCopyMessage}
                      className="text-3xs text-slate-500 hover:text-[#2563EB] font-bold flex items-center gap-1 bg-slate-50 px-2 py-1 rounded border border-slate-200 transition-colors"
                      title="Copiar texto para colar em canais externos"
                    >
                      {isCopied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      {isCopied ? "Copiado!" : "Copiar"}
                    </button>
                  </div>

                  <div className="p-4 bg-slate-900 text-slate-100 rounded-xl relative overflow-hidden font-mono min-h-[140px] max-h-[300px] overflow-y-auto">
                    {formattedMessage.trim() ? (
                      <pre className="text-xs text-emerald-400 whitespace-pre-wrap font-sans break-words selection:bg-blue-600 leading-relaxed">
                        {formattedMessage}
                      </pre>
                    ) : (
                      <p className="text-xs text-slate-500 italic font-sans py-4">
                        Favor digitar os dados de Retirada, Entrega e Valor no formulário ao lado para gerar a prévia correspondente...
                      </p>
                    )}
                  </div>

                  {/* Immediate visual dispatch list feedback while sending or after */}
                  {dispatchStatusList.length > 0 && (
                    <div className="border border-slate-100 rounded-xl p-3 bg-slate-50 flex flex-col gap-2">
                      <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                        Relatório sobre o último disparo:
                      </h4>
                      <div className="divide-y divide-slate-100">
                        {dispatchStatusList.map((st, idx) => (
                          <div key={idx} className="flex justify-between items-center py-1.5 text-xs">
                            <span className="font-bold text-slate-700 truncate mr-3">{st.channelName}</span>
                            <div className="flex items-center gap-2">
                              {st.status === "sending" && (
                                <span className="text-[10px] text-blue-600 bg-blue-50 border border-blue-100 font-bold px-2 py-0.5 rounded animate-pulse">
                                  Enviando...
                                </span>
                              )}
                              {st.status === "success" && (
                                <span className="text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-100 font-bold px-2 py-0.5 rounded flex items-center gap-1">
                                  <Check className="w-2.5 h-2.5" /> OK
                                </span>
                              )}
                              {st.status === "error" && (
                                <span
                                  className="text-[10px] text-rose-600 bg-rose-50 border border-rose-100 font-bold px-2 py-0.5 rounded cursor-help"
                                  title={st.errorDetails}
                                >
                                  Falhou ⚠️
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Large execution dispatch CTA button */}
                  <div className="mt-4">
                    <button
                      type="button"
                      disabled={isDispatching}
                      onClick={handleGlobalDispatch}
                      className={`w-full py-4 text-white rounded-xl text-base font-bold shadow-xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all cursor-pointer ${
                        isDispatching
                          ? "bg-slate-400 shadow-none cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/20 shadow-blue-600/30"
                      }`}
                    >
                      {isDispatching ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Enviando Mensagem para Grupos...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          <span>Disparar Mensagem nos Grupos</span>
                        </>
                      )}
                    </button>
                    
                    {/* Tiny tip */}
                    <p className="text-[10px] text-slate-400 text-center mt-2.5 leading-normal">
                      Isso enviará em tempo real para os {channels.filter((c) => c.isActive).length} canais ativos marcados no menu lateral esquerdo.
                    </p>
                  </div>

                </div>

              </div>
              
            </div>
          ) : (
            
            // Configuration & Editing Section Dashboard Tab
            <div className="flex flex-col gap-6">
              
              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-800">Definições de Canais e Modelos de Mensagens</h2>
                <p className="text-slate-500 text-sm mt-1">
                  Configure suas chaves, tokens de chatbots ou webhooks para garantir que LogiDispatch consiga transacionar mensagens em seu lugar perfeitamente.
                </p>
              </div>

              {/* Grid of config tables */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
                
                {/* Config Canais Panel */}
                <ConfigCanais
                  channels={channels}
                  onUpdateChannel={handleUpdateChannel}
                  onAddChannel={handleAddChannel}
                  onDeleteChannel={handleDeleteChannel}
                />

                {/* Templates Manager Panel */}
                <TemplateManager
                  templates={templates}
                  selectedTemplateId={selectedTemplateId}
                  onSelectTemplate={setSelectedTemplateId}
                  onSaveTemplate={handleSaveTemplate}
                  onDeleteTemplate={handleDeleteTemplate}
                />

                {/* Config Tarifas Panel */}
                <ConfigTarifas
                  rules={pricingRules}
                  onUpdateRules={(newRules) => setPricingRules(newRules)}
                />

              </div>

            </div>
          )}

        </main>
        
      </div>

      {/* Footer Status Panel */}
      <footer className="h-12 bg-white border-t border-slate-200 px-6 flex flex-col md:flex-row items-center justify-between shrink-0 text-[11px] text-slate-500 py-2 gap-2 md:gap-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-sm shadow-emerald-400"></span>
            <span className="font-semibold text-slate-700">Comunicação Pronta (Proxy On)</span>
          </div>
          <div className="hidden sm:block w-[1px] h-3 bg-slate-300"></div>
          <span className="hidden sm:inline">Total de Grupos Cadastrados: {channels.length}</span>
        </div>
        <div className="flex items-center gap-2 font-mono text-slate-400">
          <span>Terminal ID: 882-TRK-09</span>
          <span>|</span>
          <span>Sincronizado via LocalStorage</span>
        </div>
      </footer>

    </div>
  );
}
