"use client";
import Link from 'next/link';
import { ArrowRight, Video, BrainCircuit, Activity, BarChart3, Users } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';

export default function LandingPage() {
  const { t } = useLanguage();

  return (
    <div className="bg-white flex flex-col flex-1">
      {/* Hero Section */}
      <div className="relative bg-slate-50 overflow-hidden isolate">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#3b82f6] to-[#0ea5e9] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 pb-24 pt-20 sm:pb-32 lg:flex lg:px-8 lg:py-40">
          <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl lg:flex-shrink-0 lg:pt-8 text-center lg:text-left">
            <div className="mt-24 sm:mt-32 lg:mt-16">
              <span className="rounded-full bg-blue-100/80 px-3 py-1 text-sm font-semibold leading-6 text-blue-700 ring-1 ring-inset ring-blue-700/10">
                {t('dpg')}
              </span>
            </div>
            <h1 className="mt-10 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-6xl">
              {t('heroVoice')}<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">{t('heroAI')}</span><br />
              {t('heroActionable')}
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              {t('heroSub')}
            </p>
            <div className="mt-10 flex items-center justify-center lg:justify-start gap-x-6">
              <Link href="/report" className="rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 flex items-center gap-2 transition-all">
                <Video className="w-5 h-5" />
                {t('reportAction')}
              </Link>
              <Link href="/dashboard" className="text-sm font-semibold leading-6 text-gray-900 flex items-center gap-2 group hover:text-blue-600 transition-colors">
                {t('exploreDashboard')} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
          <div className="mx-auto mt-16 lg:ml-10 lg:mt-0 flex-1 max-w-2xl lg:max-w-none">
            <div className="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none">
              <div className="rounded-2xl bg-gray-900/5 p-4 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-3xl lg:p-4 shadow-xl">
                 <div className="rounded-xl bg-white overflow-hidden shadow-2xl ring-1 ring-gray-900/10 h-[500px] flex items-center justify-center bg-gradient-to-br from-blue-50 to-white relative">
                   {/* Abstract Dashboard/Graphic */}
                   <div className="absolute inset-0 flex flex-col p-8 opacity-80 pointer-events-none">
                     <div className="flex items-center gap-4 mb-8">
                       <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center"><BrainCircuit className="text-blue-600" /></div>
                       <div className="h-2 w-32 bg-gray-200 rounded-full"></div>
                     </div>
                     <div className="grid grid-cols-2 gap-6">
                       <div className="h-32 bg-gray-50 border border-gray-100 rounded-2xl p-4 shadow-sm">
                         <div className="h-2 w-20 bg-blue-200 rounded-full mb-4"></div>
                         <div className="h-8 w-16 bg-blue-600 rounded-lg mb-4"></div>
                         <div className="h-2 w-full bg-gray-200 rounded-full"></div>
                       </div>
                       <div className="h-32 bg-gray-50 border border-gray-100 rounded-2xl p-4 shadow-sm">
                         <div className="h-2 w-20 bg-emerald-200 rounded-full mb-4"></div>
                         <div className="h-8 w-16 bg-emerald-500 rounded-lg mb-4"></div>
                         <div className="h-2 w-4/5 bg-gray-200 rounded-full"></div>
                       </div>
                     </div>
                     <div className="mt-6 flex-1 bg-slate-50 border border-gray-100 rounded-2xl p-6 shadow-sm overflow-hidden flex relative">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                          <Activity className="w-32 h-32 text-blue-100 animate-pulse" strokeWidth={1} />
                        </div>
                     </div>
                   </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Section */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24 sm:py-32">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-blue-600">{t('infrastructureIntel')}</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {t('infrastructureSub')}
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            We don't just collect complaints. The JanSetu AI platform demonstrates how Digital Public Infrastructure can convert unstructured feedback into actionable policies.
          </p>
        </div>
        
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            <div className="flex flex-col">
              <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-blue-600/10">
                  <BrainCircuit className="h-6 w-6 text-blue-600" />
                </div>
                Multimodal AI Processing
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                <p className="flex-auto">Analyzes voice, video, and text to extract the exact issue category, severity, and location confidence without human intervention.</p>
              </dd>
            </div>
            <div className="flex flex-col">
              <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-emerald-600/10">
                  <Users className="h-6 w-6 text-emerald-600" />
                </div>
                Smart Routing & Priority
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                <p className="flex-auto">Calculates an explainable priority score based on population impact and severity, automatically routing to the correct government department.</p>
              </dd>
            </div>
            <div className="flex flex-col">
              <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-purple-600/10">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
                Policy Intelligence
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                <p className="flex-auto">Aggregates duplicate reports into infrastructure hotspots, providing policymakers with data-driven recommendations for budget allocation.</p>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
