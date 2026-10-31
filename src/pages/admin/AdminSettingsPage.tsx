import React, { useState } from 'react';
import {
  Database,
  Key,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Copy,
  Check,
  Server,
  FileCode,
  UploadCloud,
  Sparkles,
} from 'lucide-react';
import {
  getSupabaseConfig,
  setSupabaseCustomConfig,
  testSupabaseConnection,
  supabaseApi,
} from '../../lib/supabase';
import { repository } from '../../lib/storage';

export const AdminSettingsPage: React.FC = () => {
  const currentConfig = getSupabaseConfig();
  const [supabaseUrl, setSupabaseUrl] = useState<string>(currentConfig.url);
  const [anonKey, setAnonKey] = useState<string>(currentConfig.anonKey);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; schemaPending?: boolean } | null>(null);
  const [testing, setTesting] = useState<boolean>(false);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Modal / Confirm States
  const [showSeedConfirm, setShowSeedConfirm] = useState<boolean>(false);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const [seeding, setSeeding] = useState<boolean>(false);
  const [seedProgress, setSeedProgress] = useState<string>('');

  const handleSaveConfig = () => {
    setSupabaseCustomConfig(supabaseUrl, anonKey);
    setTestResult(null);
    setFeedbackMessage({
      type: 'success',
      text: 'Configuration successfully saved to local environment overrides.',
    });
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    setSupabaseCustomConfig(supabaseUrl, anonKey);
    const result = await testSupabaseConnection();
    setTesting(false);
    setTestResult(result);
  };

  const handleSeedSupabase = async () => {
    setShowSeedConfirm(false);
    setSeeding(true);
    setSeedProgress('Loading properties from catalog...');
    const all = await repository.getProperties();

    setSeedProgress(`Uploading ${all.length} records in batches...`);
    const res = await supabaseApi.seedPropertiesBatch(all, (current, total) => {
      setSeedProgress(`Uploaded ${current} / ${total} records...`);
    });

    setSeeding(false);
    if (res.success) {
      setFeedbackMessage({
        type: 'success',
        text: `Successfully seeded ${res.inserted} properties into Supabase PostgreSQL!`,
      });
    } else {
      setFeedbackMessage({
        type: 'error',
        text: `Seeding error: ${res.error}. Ensure the 'properties' table exists in Supabase.`,
      });
    }
  };

  const handleResetDataset = async () => {
    setShowResetConfirm(false);
    setFeedbackMessage({
      type: 'info',
      text: 'Reloading dataset from CSV file...',
    });
    const restored = await repository.resetPropertiesToDataset();
    setFeedbackMessage({
      type: 'success',
      text: `Successfully restored ${restored.length} properties from pristine dataset!`,
    });
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const sqlSample = `-- Supabase PostgreSQL Schema Migration (ACRELYN)
-- Copy and execute in: Supabase Dashboard -> SQL Editor -> New query

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROPERTIES TABLE
CREATE TABLE IF NOT EXISTS public.properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id VARCHAR(50) UNIQUE NOT NULL,
    property_name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    plot_area_sqft NUMERIC(12, 2) NOT NULL CHECK (plot_area_sqft > 0),
    price_inr NUMERIC(15, 2) NOT NULL CHECK (price_inr > 0),
    price_per_sqft_inr NUMERIC(12, 2) GENERATED ALWAYS AS (ROUND(price_inr / plot_area_sqft, 2)) STORED,
    facing VARCHAR(50) DEFAULT 'Not specified',
    land_type VARCHAR(100) DEFAULT 'Residential plot',
    facilities TEXT DEFAULT 'Not specified',
    latitude NUMERIC(10, 7) NULL,
    longitude NUMERIC(10, 7) NULL,
    source_url TEXT NULL,
    availability_status VARCHAR(100) DEFAULT 'Available',
    verification_status VARCHAR(150) DEFAULT 'Advertised listing; not independently verified',
    data_type VARCHAR(50) NOT NULL CHECK (data_type IN ('REAL_ADVERTISED', 'DEMO_SYNTHETIC')),
    notes TEXT NULL,
    image_urls TEXT[] DEFAULT '{}',
    cover_image TEXT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ENQUIRIES TABLE
CREATE TABLE IF NOT EXISTS public.enquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id VARCHAR(50) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'New' CHECK (status IN ('New', 'Contacted', 'In Progress', 'Resolved', 'Closed')),
    admin_notes TEXT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read Properties" ON public.properties FOR SELECT USING (true);
CREATE POLICY "Public Insert Enquiries" ON public.enquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin Full Properties" ON public.properties FOR ALL USING (true);
CREATE POLICY "Admin Full Enquiries" ON public.enquiries FOR ALL USING (true);`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlSample);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-bold text-[#087F5B] mb-1">
          <Sparkles className="w-3.5 h-3.5 text-[#00E6A0]" />
          <span>Infrastructure & Persistence</span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#142B25]">
          Settings & Supabase Database
        </h1>
        <p className="text-xs text-[#71817A] mt-1">
          Manage PostgreSQL connection keys, check live schemas, or trigger dataset seeding.
        </p>
      </div>

      {feedbackMessage && (
        <div
          className={`p-4 rounded-xl border text-xs font-bold flex items-center gap-2 ${
            feedbackMessage.type === 'success'
              ? 'bg-[#B8FFE5]/40 border-[#00E6A0] text-[#087F5B]'
              : feedbackMessage.type === 'error'
              ? 'bg-red-50 border-red-300 text-red-800'
              : 'bg-blue-50 border-blue-300 text-blue-800'
          }`}
        >
          {feedbackMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-[#087F5B]" />
          ) : (
            <AlertTriangle className="w-4 h-4" />
          )}
          <span>{feedbackMessage.text}</span>
        </div>
      )}

      {/* Supabase Connection Configuration */}
      <div className="bg-white rounded-2xl border border-[#DCEBE4] p-6 shadow-2xs space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#087F5B] text-[#00E6A0] flex items-center justify-center font-bold shadow-2xs">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-[#142B25]">
                Supabase PostgreSQL Configuration
              </h3>
              <p className="text-xs text-[#71817A]">
                Connected to project <span className="font-mono font-bold text-[#087F5B]">rjinrzanrttyjbsrcroy</span>
              </p>
            </div>
          </div>

          <span
            className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
              currentConfig.isConfigured
                ? 'bg-[#B8FFE5] text-[#087F5B] border border-[#00E6A0]/40'
                : 'bg-amber-100 text-amber-900 border border-amber-200'
            }`}
          >
            {currentConfig.isConfigured ? 'Live Configured' : 'Missing Keys'}
          </span>
        </div>

        <div className="space-y-4 pt-1">
          <div>
            <label className="block text-xs font-bold text-[#142B25] mb-1">
              Project URL
            </label>
            <input
              type="text"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              placeholder="https://xyzcompany.supabase.co"
              className="w-full px-3 py-2 text-xs font-mono bg-[#F7FAF8] border border-[#DCEBE4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#087F5B] text-[#142B25]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#142B25] mb-1">
              Publishable Anon Key
            </label>
            <input
              type="password"
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              placeholder="sb_publishable_..."
              className="w-full px-3 py-2 text-xs font-mono bg-[#F7FAF8] border border-[#DCEBE4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#087F5B] text-[#142B25]"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={testing}
            onClick={handleTestConnection}
            className="px-4 py-2 bg-[#087F5B] hover:bg-[#066346] text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 hover:shadow-[0_0_12px_rgba(0,230,160,0.3)]"
          >
            <Server className="w-3.5 h-3.5 text-[#00E6A0]" />
            <span>{testing ? 'Verifying Connection...' : 'Test Connection'}</span>
          </button>

          <button
            type="button"
            onClick={handleSaveConfig}
            className="px-4 py-2 bg-white border border-[#DCEBE4] hover:border-[#087F5B] text-[#142B25] text-xs font-bold rounded-xl transition-all"
          >
            Save Overrides
          </button>

          <button
            type="button"
            disabled={seeding}
            onClick={() => setShowSeedConfirm(true)}
            className="px-4 py-2 bg-[#F7FAF8] border border-[#DCEBE4] hover:border-[#00E6A0] text-[#087F5B] text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>{seeding ? seedProgress : 'Seed 300 Plots to Supabase'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="px-4 py-2 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-all flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to CSV Dataset</span>
          </button>
        </div>

        {/* Live Test Results */}
        {testResult && (
          <div
            className={`p-4 rounded-xl border text-xs font-medium space-y-1 ${
              testResult.success
                ? 'bg-[#B8FFE5]/30 border-[#00E6A0] text-[#087F5B]'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            <div className="font-bold flex items-center gap-1.5">
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-[#087F5B]" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-600" />
              )}
              <span>{testResult.message}</span>
            </div>
          </div>
        )}
      </div>

      {/* SQL Migration Script Box */}
      <div className="bg-white rounded-2xl border border-[#DCEBE4] p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode className="w-5 h-5 text-[#087F5B]" />
            <h3 className="font-serif text-base font-bold text-[#142B25]">
              Supabase SQL Schema & RLS Policies
            </h3>
          </div>
          <button
            onClick={handleCopySql}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-[#087F5B] bg-[#F7FAF8] border border-[#DCEBE4] rounded-xl hover:border-[#00E6A0] transition-all"
          >
            {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSql ? 'Copied' : 'Copy Migration SQL'}</span>
          </button>
        </div>

        <p className="text-xs text-[#71817A] leading-relaxed">
          The following SQL commands create the <code className="font-bold text-[#087F5B]">public.properties</code> and <code className="font-bold text-[#087F5B]">public.enquiries</code> tables with verified column constraints and Row Level Security.
        </p>

        <pre className="p-4 bg-[#142B25] text-emerald-300 rounded-xl text-[11px] font-mono overflow-x-auto max-h-72 border border-emerald-950">
          {sqlSample}
        </pre>
      </div>

      {/* Seed Confirmation Modal */}
      {showSeedConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#DCEBE4]">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#087F5B] flex items-center justify-center mx-auto">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-serif text-lg font-bold text-[#142B25]">
                Seed 300 Properties to Supabase?
              </h3>
              <p className="text-xs text-[#71817A] leading-relaxed">
                This will upload all 300 properties (10 public advertised + 290 benchmark synthetic plots) into your Supabase PostgreSQL database.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowSeedConfirm(false)}
                className="flex-1 py-2.5 px-4 text-xs font-bold text-[#71817A] bg-white border border-[#DCEBE4] rounded-xl hover:bg-[#F7FAF8]"
              >
                Cancel
              </button>
              <button
                onClick={handleSeedSupabase}
                className="flex-1 py-2.5 px-4 text-xs font-bold text-white bg-[#087F5B] hover:bg-[#066346] rounded-xl transition-all shadow-sm"
              >
                Start Seeding
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#DCEBE4]">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-serif text-lg font-bold text-[#142B25]">
                Reset Dataset to CSV Baseline?
              </h3>
              <p className="text-xs text-[#71817A] leading-relaxed">
                This will restore all 300 properties from <span className="font-mono">acrelyn_land_dataset_300.csv</span>. Any manually edited plot details will be restored to their original values.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2.5 px-4 text-xs font-bold text-[#71817A] bg-white border border-[#DCEBE4] rounded-xl hover:bg-[#F7FAF8]"
              >
                Cancel
              </button>
              <button
                onClick={handleResetDataset}
                className="flex-1 py-2.5 px-4 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 rounded-xl transition-all shadow-sm"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
