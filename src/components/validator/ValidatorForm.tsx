'use client';

import React, { useRef } from 'react';
import { Niche, NicheConfig } from '@/domain/types';
import { NICHE_CONFIGS } from '@/domain/niche-configs';

interface ValidatorFormProps {
    selectedNiche: Niche;
    onNicheChange: (niche: Niche) => void;
    projectDescription: string;
    onDescriptionChange: (desc: string) => void;
    contextFields: Record<string, string>;
    onContextFieldChange: (key: string, value: string) => void;
    uploadedFileName: string | null;
    onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: () => void;
    isAnalyzing: boolean;
    hasContent: boolean;
}

export default function ValidatorForm({
    selectedNiche,
    onNicheChange,
    projectDescription,
    onDescriptionChange,
    contextFields,
    onContextFieldChange,
    uploadedFileName,
    onFileUpload,
    onSubmit,
    isAnalyzing,
    hasContent
}: ValidatorFormProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const currentNiche: NicheConfig = NICHE_CONFIGS.find(n => n.id === selectedNiche) || NICHE_CONFIGS[0];

    return (
        <div className="space-y-5">
            {/* Niche Selector */}
            <div>
                <label className="text-sm text-gray-400 mb-2 block">Industry/Niche:</label>
                <div className="flex flex-wrap gap-2">
                    {NICHE_CONFIGS.map((niche) => (
                        <button
                            key={niche.id}
                            type="button"
                            onClick={() => onNicheChange(niche.id)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                selectedNiche === niche.id
                                    ? 'bg-indigo-500/40 text-indigo-200 border border-indigo-400/50'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-transparent'
                            }`}
                        >
                            {niche.icon} {niche.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Project Description */}
            <div>
                <label className="text-sm text-gray-400 mb-2 block">
                    📝 Project Description <span className="text-purple-400">*</span>
                </label>
                <textarea
                    value={projectDescription}
                    onChange={(e) => onDescriptionChange(e.target.value)}
                    placeholder="Describe your project, product, or idea in detail. The more context, the better the analysis..."
                    className="w-full bg-black/30 border border-white/20 rounded-xl p-4 text-white placeholder:text-gray-500 resize-none h-28 focus:outline-none focus:border-purple-500/50"
                />
            </div>

            {/* Context Fields based on selected niche */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentNiche.fields.map((field) => (
                    <div key={field.key}>
                        <label className="text-sm text-gray-400 mb-2 block">
                            {field.icon} {field.label} <span className="text-gray-500">(optional)</span>
                        </label>
                        <input
                            type={field.type}
                            value={contextFields[field.key] || ''}
                            onChange={(e) => onContextFieldChange(field.key, e.target.value)}
                            placeholder={field.placeholder}
                            className="w-full bg-black/30 border border-white/20 rounded-xl p-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50"
                        />
                    </div>
                ))}
            </div>

            {/* File Upload */}
            <div>
                <label className="text-sm text-gray-400 mb-2 block">
                    📄 Documentation / Pitch Deck <span className="text-gray-500">(optional)</span>
                </label>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={onFileUpload}
                    accept=".md,.txt,.pdf,.doc,.docx"
                    className="hidden"
                />
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full bg-black/30 border border-dashed border-white/20 rounded-xl p-4 text-gray-400 hover:border-purple-500/50 hover:text-purple-300 transition-all text-sm"
                >
                    {uploadedFileName ? `📎 ${uploadedFileName}` : '📤 Click to upload README, pitch deck, or docs'}
                </button>
            </div>

            {/* Analyze Button */}
            <button
                type="button"
                onClick={onSubmit}
                disabled={isAnalyzing || !hasContent}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-all text-lg shadow-lg hover:shadow-purple-500/20"
            >
                {isAnalyzing ? '⚡ Running Institutional Diligence Protocol...' : '🛡️ Run Due Diligence Gate'}
            </button>
        </div>
    );
}
