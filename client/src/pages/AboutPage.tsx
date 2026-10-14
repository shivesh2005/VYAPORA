import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Shield, Cpu, Database, ArrowRight, Layers, Users } from 'lucide-react';
import { BRAND } from '../config/brand';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-violet-600 bg-violet-50 px-3.5 py-1 rounded-full border border-violet-200">
          प्लेटफॉर्म का विज़न | The Platform Vision
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          {BRAND.name} — बुद्धिमान ई-कॉमर्स का नया युग
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
          {BRAND.englishName} was engineered as a full-stack proof that modern e-commerce must evolve beyond static database clones into catalog-grounded AI intelligence coupled with merchant operating software.
        </p>
      </div>

      {/* 3 Core Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-8 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">1. Catalog Grounded AI</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Eliminates hallucinated prices and fake models. The {BRAND.aiAssistantName} companion is strictly grounded in real-time MongoDB catalog data, ensuring accurate specs and live stock answers.
          </p>
        </div>

        <div className="p-8 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">2. Multi-Vendor Marketplace</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Individual vendors maintain private storefronts, customized color themes, and dedicated order desks, governed by configurable {BRAND.plansTitleHindi} product quotas and feature entitlements.
          </p>
        </div>

        <div className="p-8 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Database className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">3. Zero-Friction Reliability</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Engineered with fallback in-memory MongoDB support. Evaluators, students, and examiners can run the entire system out of the box with zero complex external database configurations.
          </p>
        </div>
      </div>

      {/* Tech Architecture Snapshot */}
      <div className="p-8 sm:p-12 bg-slate-900 text-white rounded-3xl border border-slate-800 space-y-8">
        <div className="max-w-2xl space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
            System Architecture
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Built with Clean Full-Stack TypeScript
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            The platform adheres strictly to modern web standards: Vite React frontend with Tailwind CSS and TanStack Query, backed by an Express REST API with Mongoose ODM, Zod request schemas, and HTTP-only cookie authentication.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700">
            <span className="text-slate-400 block mb-1">Frontend</span>
            <span className="font-bold text-cyan-300">React + Vite + TS</span>
          </div>
          <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700">
            <span className="text-slate-400 block mb-1">Backend</span>
            <span className="font-bold text-violet-300">Node + Express + TS</span>
          </div>
          <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700">
            <span className="text-slate-400 block mb-1">Database</span>
            <span className="font-bold text-emerald-300">MongoDB + Mongoose</span>
          </div>
          <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700">
            <span className="text-slate-400 block mb-1">Security</span>
            <span className="font-bold text-rose-300">JWT + BCrypt + Helmet</span>
          </div>
        </div>
      </div>
    </div>
  );
};
