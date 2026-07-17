"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

type ConfirmOptions = {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info" | "success";
  hideCancel?: boolean;
};

type ConfirmContextType = {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
};

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmProvider");
  }
  return context;
};

export const ConfirmProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [resolver, setResolver] = useState<((value: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions) => {
    setOptions(opts);
    setIsOpen(true);
    return new Promise<boolean>((resolve) => {
      setResolver(() => resolve);
    });
  }, []);

  const handleConfirm = useCallback(() => {
    setIsOpen(false);
    if (resolver) resolver(true);
  }, [resolver]);

  const handleCancel = useCallback(() => {
    setIsOpen(false);
    if (resolver) resolver(false);
  }, [resolver]);

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {isOpen && options && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity duration-300"
            onClick={handleCancel}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {options.title}
            </h3>
            <p className="text-gray-600 mb-6">
              {options.description}
            </p>
            
            <div className="flex justify-end gap-3">
              {!options.hideCancel && (
                <button
                  onClick={handleCancel}
                  className="px-5 py-2.5 rounded-xl font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  {options.cancelText || "Annuler"}
                </button>
              )}
              
              <button
                onClick={handleConfirm}
                className={`px-5 py-2.5 rounded-xl font-medium text-white transition-colors shadow-sm ${
                  options.type === "danger"
                    ? "bg-red-600 hover:bg-red-700"
                    : options.type === "warning"
                    ? "bg-[#F59E0B] hover:bg-[#D97706]"
                    : options.type === "success"
                    ? "bg-[#10B981] hover:bg-[#059669]"
                    : "bg-[#0F4C81] hover:bg-[#1E3A8A]"
                }`}
              >
                {options.confirmText || "Confirmer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};
