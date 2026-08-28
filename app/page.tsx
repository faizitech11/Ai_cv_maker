"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Home() {
  const { data: session, status } = useSession();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Background glow effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-3xl" />
      </div>

      {/* Navigation Bar */}
      <header className="relative z-10 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-400 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
              CV
            </div>
            <span className="text-xl font-extrabold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              AI CV Maker
            </span>
          </Link>

          <div className="flex items-center gap-4">
            {status === "authenticated" ? (
              <>
                <span className="hidden sm:inline text-sm text-slate-400">
                  Welcome, <strong className="text-slate-200">{session.user?.name || session.user?.email}</strong>
                </span>
                <Link
                  href="/dashboard"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition shadow-lg shadow-indigo-600/30 hover:shadow-indigo-500/50"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="px-4 py-2.5 rounded-xl border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-sm font-medium transition"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-900 text-sm font-medium transition"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-medium text-sm transition shadow-lg shadow-indigo-600/30 hover:shadow-indigo-500/50"
                >
                  Get Started Free
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10">
        <section className="pt-24 pb-20 px-6 max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-8 animate-pulse">
            <span>✨ Powered by Next.js & AI Intelligence</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-5xl mx-auto leading-tight">
            Build ATS-Ready Resumes & CVs with{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent">
              AI Precision
            </span>
          </h1>

          <p className="mt-8 text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Create, edit, and optimize professional CVs in minutes. Import existing PDFs/Word documents, auto-extract details, customize modern templates, and export seamlessly.
          </p>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-5">
            <Link
              href={status === "authenticated" ? "/cv/new" : "/register"}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-base shadow-xl shadow-indigo-500/25 transition hover:scale-[1.02] flex items-center justify-center gap-3"
            >
              <span>Create New CV</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>

            <Link
              href={status === "authenticated" ? "/cv/upload" : "/login"}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 text-slate-200 font-semibold text-base transition hover:border-slate-700 flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <span>Upload Existing Resume</span>
            </Link>
          </div>

          {/* Quick Metrics */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto pt-10 border-t border-slate-900">
            <div>
              <div className="text-3xl font-bold text-white">4+</div>
              <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Curated Templates</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-indigo-400">Instant</div>
              <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider">PDF & DOCX Parsing</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-cyan-400">Live</div>
              <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Interactive Preview</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">100%</div>
              <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Free & Secure</div>
            </div>
          </div>
        </section>

        {/* Feature Highlights Grid */}
        <section className="py-20 px-6 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Everything You Need for a Winning CV
            </h2>
            <p className="mt-4 text-slate-400 max-w-2xl mx-auto">
              Designed with simplicity and power to help you stand out to employers and pass applicant tracking systems.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl border border-slate-800 bg-slate-900/40 hover:bg-slate-900/80 transition duration-300 group">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
                🧠
              </div>
              <h3 className="text-xl font-bold text-white mb-3">AI Content Enhancer</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Transform rough drafts into crisp, professional summaries and bullet points tailored for hiring managers.
              </p>
            </div>

            <div className="p-8 rounded-3xl border border-slate-800 bg-slate-900/40 hover:bg-slate-900/80 transition duration-300 group">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
                ⚡
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Smart Upload & Parsing</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Already have a CV? Upload PDF, DOCX, or images to auto-populate your details into structured sections instantly.
              </p>
            </div>

            <div className="p-8 rounded-3xl border border-slate-800 bg-slate-900/40 hover:bg-slate-900/80 transition duration-300 group">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
                🎨
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Live Preview & Export</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Switch seamlessly between Modern, Classic, Professional, and Minimal layouts with real-time dynamic previewing.
              </p>
            </div>
          </div>
        </section>

        {/* Template Section */}
        <section className="py-20 px-6 max-w-7xl mx-auto border-t border-slate-900">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Choose from Sleek Templates
            </h2>
            <p className="mt-4 text-slate-400">
              Select the design that best highlights your career story.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "Modern", tag: "Popular", desc: "Clean header with vibrant accent colors" },
              { name: "Classic", tag: "Traditional", desc: "Elegant serif typography for executive roles" },
              { name: "Professional", tag: "Corporate", desc: "Structured border layout for corporate profiles" },
              { name: "Minimal", tag: "Minimalist", desc: "Sleek, lightweight layout putting content first" },
            ].map((tmpl, idx) => (
              <div key={idx} className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-indigo-500/50 transition">
                <div className="h-44 rounded-xl bg-slate-800/80 flex items-center justify-center mb-5 text-4xl border border-slate-700/50">
                  📄
                </div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-lg text-white">{tmpl.name}</h3>
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {tmpl.tag}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{tmpl.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-12 px-6 text-center text-xs text-slate-500 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} AI CV Maker. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/login" className="hover:text-slate-300 transition">Login</Link>
            <Link href="/register" className="hover:text-slate-300 transition">Register</Link>
            <Link href="/dashboard" className="hover:text-slate-300 transition">Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
