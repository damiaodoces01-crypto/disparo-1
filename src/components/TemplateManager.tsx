import { useState, useRef } from "react";
import { MessageTemplate } from "../types";
import { Edit3, Plus, Trash2, Check, FileText } from "lucide-react";

interface TemplateManagerProps {
  templates: MessageTemplate[];
  selectedTemplateId: string;
  onSelectTemplate: (id: string) => void;
  onSaveTemplate: (template: MessageTemplate) => void;
  onDeleteTemplate: (id: string) => void;
}

export default function TemplateManager({
  templates,
  selectedTemplateId,
  onSelectTemplate,
  onSaveTemplate,
  onDeleteTemplate,
}: TemplateManagerProps) {
  const currentTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(currentTemplate?.name || "");
  const [editContent, setEditContent] = useState(currentTemplate?.content || "");
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSelect = (id: string) => {
    onSelectTemplate(id);
    const target = templates.find((t) => t.id === id);
    if (target) {
      setEditName(target.name);
      setEditContent(target.content);
    }
    setIsEditing(false);
  };

  const startEdit = () => {
    setEditName(currentTemplate.name);
    setEditContent(currentTemplate.content);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!editName.trim() || !editContent.trim()) return;
    onSaveTemplate({
      id: currentTemplate.id,
      name: editName,
      content: editContent,
    });
    setIsEditing(false);
  };

  const handleCreateNew = () => {
    const newId = `tpl-custom-${Date.now()}`;
    const newTemplate: MessageTemplate = {
      id: newId,
      name: `Modelo Customizado ${templates.length + 1}`,
      content: "🚚 NOVA CORRIDA\n\n📍 Retirada: {retirada}\n🏁 Entrega: {entrega}\n💵 Valor: R$ {valor}"
    };
    onSaveTemplate(newTemplate);
    handleSelect(newId);
    setIsEditing(true);
  };

  const insertTag = (tag: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setEditContent((prev) => prev + " " + tag);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = editContent;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);

    setEditContent(before + tag + after);
    setIsEditing(true);

    // Focus back and set selection position right after tag
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tag.length, start + tag.length);
    }, 10);
  };

  const placeholders = [
    { tag: "{retirada}", label: "📍 Retirada" },
    { tag: "{entrega}", label: "🏁 Entrega" },
    { tag: "{km}", label: "📏 Km" },
    { tag: "{valor}", label: "💵 Valor ($)" },
    { tag: "{veiculo}", label: "🛵 Veículo" },
    { tag: "{observacao}", label: "📝 Obs" },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col gap-4">
      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
        <h3 className="font-semibold text-slate-800 text-lg flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#2563EB]" />
          Modelo de Mensagem
        </h3>
        <button
          onClick={handleCreateNew}
          className="text-xs bg-[#2563EB]/10 text-[#2563EB] hover:bg-[#2563EB]/20 font-semibold px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          Novo Modelo
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {/* Template Select Dropdown */}
        <div className="flex gap-2">
          <select
            value={selectedTemplateId}
            onChange={(e) => handleSelect(e.target.value)}
            className="flex-1 bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#2563EB]/20 transition-all"
          >
            {templates.map((tpl) => (
              <option key={tpl.id} value={tpl.id}>
                {tpl.name}
              </option>
            ))}
          </select>

          {!isEditing ? (
            <button
              onClick={startEdit}
              className="p-2.5 border border-slate-200 text-slate-600 hover:text-[#2563EB] hover:border-slate-300 rounded-lg transition-colors"
              title="Editar modelo"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSave}
              className="p-2.5 bg-emerald-500 text-white hover:bg-emerald-600 border border-emerald-500 rounded-lg transition-colors"
              title="Salvar alterações"
            >
              <Check className="w-4 h-4" />
            </button>
          )}

          {templates.length > 1 && (
            <button
              onClick={() => {
                if (confirm("Deseja realmente excluir este modelo?")) {
                  onDeleteTemplate(selectedTemplateId);
                  handleSelect(templates[0].id);
                }
              }}
              className="p-2.5 border border-red-200 text-red-500 hover:bg-red-50 hover:text-red-650 rounded-lg transition-all"
              title="Excluir modelo"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Editing Screen or Static Display */}
        {isEditing ? (
          <div className="flex flex-col gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">
                Nome do Modelo
              </label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg text-sm px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                placeholder="Ex: Disparo Rápido Motos"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">
                Texto do Modelo (Suporta tags dinâmicas)
              </label>
              <textarea
                ref={textareaRef}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={4}
                className="w-full bg-white border border-slate-200 rounded-lg text-sm p-3 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 font-sans"
                placeholder="Digite a mensagem..."
              />
            </div>

            {/* Quick placeholder insertions */}
            <div className="flex flex-col gap-1.5 pt-1.5 border-t border-slate-200">
              <span className="text-2xs font-semibold text-slate-400 uppercase tracking-wider block">
                Clique para inserir tags na posição do cursor:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {placeholders.map((ph) => (
                  <button
                    key={ph.tag}
                    type="button"
                    onClick={() => insertTag(ph.tag)}
                    className="text-xs bg-[#2563EB]/5 hover:bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/10 hover:border-[#2563EB]/20 font-semibold px-2 py-1 rounded transition-all"
                  >
                    {ph.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Save Buttons panel */}
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsEditing(false)}
                className="text-xs text-slate-500 hover:text-slate-800 font-semibold px-3 py-1.5 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="text-xs bg-[#2563EB] text-white hover:bg-blue-700 font-semibold px-4 py-1.5 rounded-lg transition-all"
              >
                Salvar Modelo
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5 p-3.5 bg-slate-50 rounded-xl border border-slate-100 relative">
            <span className="text-2xs font-semibold text-slate-400 uppercase tracking-wide">
              Prévia do Modelo Bruto:
            </span>
            <pre className="text-xs text-slate-600 whitespace-pre-wrap font-sans break-words max-h-40 overflow-y-auto">
              {currentTemplate?.content}
            </pre>
            <div className="flex justify-end mt-1">
              <button
                onClick={startEdit}
                className="text-xs text-[#2563EB] hover:underline font-semibold flex items-center gap-1 transition-all"
              >
                <Edit3 className="w-3 h-3" />
                Editar Texto
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
