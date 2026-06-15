import React from "react";
import { DeliveryRun } from "../types";
import { MapPin, DollarSign, Bike, Car, RefreshCw, Clipboard, AlignLeft, Route } from "lucide-react";

interface FormCorridaProps {
  run: DeliveryRun;
  onChange: (updatedRun: DeliveryRun) => void;
  onClear: () => void;
}

export default function FormCorrida({ run, onChange, onClear }: FormCorridaProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onChange({
      ...run,
      [name]: value,
    });
  };

  const swapLocations = () => {
    onChange({
      ...run,
      retirada: run.entrega,
      entrega: run.retirada,
    });
  };

  const handleApplyPresetType = (veiculo: string) => {
    onChange({
      ...run,
      veiculo,
    });
  };

  // Quick preset values for deliveries in Brazil (R$)
  const valuePresets = ["15", "25", "40", "60", "100"];
  // Quick preset values for kilometers
  const kmPresets = ["3", "5", "10", "15", "25"];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col gap-5">
      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
        <h3 className="font-semibold text-slate-800 text-lg flex items-center gap-2">
          <Clipboard className="w-5 h-5 text-[#2563EB]" />
          Preencher Dados da Corrida
        </h3>
        <button
          onClick={onClear}
          type="button"
          className="text-xs text-slate-400 hover:text-red-500 font-medium transition-colors"
        >
          Limpar Tudo
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {/* Local de Retirada */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Local da Retirada (A)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="h-4 w-4 text-emerald-500" />
            </div>
            <input
              type="text"
              name="retirada"
              value={run.retirada}
              onChange={handleInputChange}
              placeholder="Ex: Av. Paulista, 1000 - Bela Vista"
              className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-sans"
            />
          </div>
        </div>

        {/* Swap button row */}
        <div className="h-1 flex justify-center items-center relative my-1">
          <div className="absolute w-full border-t border-dashed border-slate-200"></div>
          <button
            type="button"
            onClick={swapLocations}
            title="Inverter locais"
            className="relative z-10 p-1.5 bg-white border border-slate-200 rounded-full text-slate-500 hover:text-slate-800 hover:border-slate-300 shadow-sm transition-all focus:outline-none hover:scale-105"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Local de Entrega */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            Local da Entrega (B)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="h-4 w-4 text-rose-500" />
            </div>
            <input
              type="text"
              name="entrega"
              value={run.entrega}
              onChange={handleInputChange}
              placeholder="Ex: Rua Augusta, 500 - Consolação"
              className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all font-sans"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Valor */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Valor do Serviço
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-sm font-semibold text-slate-400">R$</span>
              </div>
              <input
                type="text"
                name="valor"
                value={run.valor}
                onChange={handleInputChange}
                placeholder="Ex: 35,00"
                className="block w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all font-sans"
              />
            </div>
            {/* Quick Valor Presets */}
            <div className="flex flex-wrap gap-1 mt-1">
              {valuePresets.map((pr) => (
                <button
                  key={pr}
                  type="button"
                  onClick={() => onChange({ ...run, valor: pr })}
                  className={`text-2xs px-2 py-1 rounded border transition-all font-medium ${
                    run.valor === pr
                      ? "bg-[#2563EB]/10 text-[#2563EB] border-[#2563EB]/30 shadow-none"
                      : "bg-white text-slate-500 border-slate-100 hover:border-slate-200 hover:text-slate-800"
                  }`}
                >
                  R$ {pr}
                </button>
              ))}
            </div>
          </div>

          {/* Distância (KM) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Distância (KM)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Route className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                name="km"
                value={run.km || ""}
                onChange={handleInputChange}
                placeholder="Ex: 8 ou 12.5"
                className="block w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all font-sans"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-xs font-semibold text-slate-450">km</span>
              </div>
            </div>
            {/* Quick KM Presets */}
            <div className="flex flex-wrap gap-1 mt-1">
              {kmPresets.map((pr) => (
                <button
                  key={pr}
                  type="button"
                  onClick={() => onChange({ ...run, km: pr })}
                  className={`text-2xs px-2 py-1 rounded border transition-all font-medium ${
                    run.km === pr
                      ? "bg-[#2563EB]/10 text-[#2563EB] border-[#2563EB]/30 shadow-none"
                      : "bg-white text-slate-500 border-slate-100 hover:border-slate-200 hover:text-slate-800"
                  }`}
                >
                  {pr} km
                </button>
              ))}
            </div>
          </div>

          {/* Tipo de Transporte */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Meio de Transporte
            </label>
            <div className="grid grid-cols-2 gap-2 h-[41px]">
              <button
                type="button"
                onClick={() => handleApplyPresetType("Moto")}
                className={`flex gap-2 items-center justify-center rounded-lg border text-xs font-semibold transition-all focus:outline-none ${
                    run.veiculo === "Moto"
                      ? "bg-slate-900 border-slate-900 text-white"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-150"
                  }`}
              >
                <Bike className="w-4 h-4" />
                Moto
              </button>
              <button
                type="button"
                onClick={() => handleApplyPresetType("Carro")}
                className={`flex gap-2 items-center justify-center rounded-lg border text-xs font-semibold transition-all focus:outline-none ${
                    run.veiculo === "Carro"
                      ? "bg-slate-900 border-slate-900 text-white"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-150"
                  }`}
              >
                <Car className="w-4 h-4" />
                Carro
              </button>
            </div>
          </div>
        </div>

        {/* Observações */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
            Observações / Detalhes (Opcional)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 pt-2.5 pointer-events-none">
              <AlignLeft className="h-4 w-4 text-slate-400" />
            </div>
            <textarea
              name="observacao"
              value={run.observacao || ""}
              onChange={handleInputChange}
              rows={2}
              placeholder="Ex: Levar maquininha de cartão / urgência / falar com porteiro"
              className="block w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all font-sans resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
