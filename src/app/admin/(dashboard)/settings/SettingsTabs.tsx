"use client";

import { useState } from "react";
import MediaGallery from "./MediaGallery";
import GeneralSettings from "./GeneralSettings";
import StripeSettings from "./StripeSettings";
import CollaboratorsSettings from "./CollaboratorsSettings";

interface SettingsTabsProps {
  initialFiles: any[];
  publicUrlPrefix: string;
  initialSettings: Record<string, string>;
  collaborators: any[];
}

export default function SettingsTabs({ initialFiles, publicUrlPrefix, initialSettings, collaborators }: SettingsTabsProps) {
  const [activeTab, setActiveTab] = useState<"general" | "stripe" | "media" | "collaborators">("general");

  return (
    <div className="space-y-6">
      {/* Tabs Navigation */}
      <div className="flex space-x-1 border-b border-gray-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab("general")}
          className={`whitespace-nowrap px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === "general"
              ? "border-[#0F4C81] text-[#0F4C81]"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          Paramètres Généraux
        </button>
        <button
          onClick={() => setActiveTab("stripe")}
          className={`whitespace-nowrap px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === "stripe"
              ? "border-[#0F4C81] text-[#0F4C81]"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          Configuration Stripe
        </button>
        <button
          onClick={() => setActiveTab("media")}
          className={`whitespace-nowrap px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === "media"
              ? "border-[#0F4C81] text-[#0F4C81]"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          Galerie de Médias
        </button>
        <button
          onClick={() => setActiveTab("collaborators")}
          className={`whitespace-nowrap px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === "collaborators"
              ? "border-[#0F4C81] text-[#0F4C81]"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          Collaborateurs & Droits
        </button>
      </div>

      {/* Tabs Content */}
      <div className="pt-4">
        {activeTab === "general" && <GeneralSettings initialSettings={initialSettings} />}
        {activeTab === "stripe" && <StripeSettings initialSettings={initialSettings} />}
        {activeTab === "media" && <MediaGallery initialFiles={initialFiles} publicUrlPrefix={publicUrlPrefix} />}
        {activeTab === "collaborators" && <CollaboratorsSettings collaborators={collaborators} />}
      </div>
    </div>
  );
}
