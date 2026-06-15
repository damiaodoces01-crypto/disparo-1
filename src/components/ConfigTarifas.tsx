import React from "react";
import { PricingRules } from "../types";
import { DollarSign, Sliders, ToggleLeft, ToggleRight, Info } from "lucide-react";

interface ConfigTarifasProps {
  rules: PricingRules;
  onUpdateRules: (newRules: PricingRules) => void;
}

export default function ConfigTarifas({ rules, onUpdateRules }: ConfigTarifasProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    onUpdateRules({
      ...rules,
      [name]: type === "checkbox" ? checked : parseFloat(value) || 0,
    });
  };

  const handleToggle = () => {
    onUpdateRules({
      ...rules,
      enabled: !rules.enabled,
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col gap-5">
      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
        <h3 className="font-semibold text-slate-800 text-lg flex items-center gap-2">
          <Sliders className="w-5 h-5 text-[#2563EB]" />
          Preço Automático por KM
        </h3>
        <button
          type="button"
          onClick={handleToggle}
          className="flex items-center gap-1.5 focus:outline-none transition-all"
        >
          {rules.enabled ? (
            <div className="flex items-center gap-1 text-emerald-600">
              <span className="text-2xs font-bold uppercase tracking-wider">Ativado</span>
              <ToggleRight className="w-8 h-8 text-emerald-600 cursor-pointer" />
            </div>
          ) : (
            <div className="flex items-center gap-1 text-slate-400">
              <span className="text-2xs font-bold uppercase tracking-wider">Desativado</span>
              <ToggleLeft className="w-8 h-8 text-slate-350 cursor-pointer" />
            </div>
          )}
        </button>
      </div>

      <p className="text-xs text-slate-500 leading-relaxed -mt-2">
        Ajuste as taxas para que o valor da corrida seja calculado instantaneamente assim que a rota e a quilometragem forem descobertas.
      </p>

      <div className={`flex flex-col gap-4 transition-all duration-300 ${rules.enabled ? "opacity-100 pointer-events-auto" : "opacity-50 pointer-events-none"}`}>
        {/* Taxa de Partida / Base */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
            Taxa Inicial / Partida (Base)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-xs font-semibold text-slate-400">R$</span>
            </div>
            <input
              type="number"
              step="0.1"
              name="baseFee"
              value={rules.baseFee}
              onChange={handleChange}
              disabled={!rules.enabled}
              className="block w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
            />
          </div>
          <span className="text-4xs text-slate-400">Custo inicial adicionado a qualquer corrida.</span>
        </div>

        {/* Valor adicional por KM */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
            Adicional por KM rodado
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-xs font-semibold text-slate-400">R$</span>
            </div>
            <input
              type="number"
              step="0.05"
              name="ratePerKm"
              value={rules.ratePerKm}
              onChange={handleChange}
              disabled={!rules.enabled}
              className="block w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
            />
          </div>
          <span className="text-4xs text-slate-400">R$ cobrados por cada 1 km de percurso rodado.</span>
        </div>

        {/* Taxa de Valor Mínimo */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
            Taxa Mínima de Serviço
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-xs font-semibold text-slate-400">R$</span>
            </div>
            <input
              type="number"
              step="0.5"
              name="minFee"
              value={rules.minFee}
              onChange={handleChange}
              disabled={!rules.enabled}
              className="block w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
            />
          </div>
          <span className="text-4xs text-slate-400">Menor valor aceitável para qualquer corrida (Garante o piso).</span>
        </div>
      </div>

      <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3 flex gap-2.5 items-start mt-1">
        <Info className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
        <div className="text-2xs text-slate-650 leading-normal">
          <strong className="text-[#2563EB]">Fórmula aplicada:</strong>
          <div className="font-mono bg-white inline-block px-1.5 py-0.5 border border-slate-100 rounded text-amber-600 my-1 font-bold">
            Preço = Máximo(Taxa Mínima, Taxa Base + (Taxa por KM * KM))
          </div>
          <p className="mt-0.5">Exemplo: Com 10 km rodados e as taxas padrão, o preço calculado será R$ 33,00 (8 + 2.5 × 10).</p>
        </div>
      </div>
    </div>
  );
}
