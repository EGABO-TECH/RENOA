"use client";

import { useState } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import BookingModal from "@/components/BookingModal";
import WhatsAppButton from "@/components/WhatsAppButton";
import { INSIGHT_ARTICLES, InsightArticle } from "@/data/insights";
import { Clock, ArrowRight, CheckCircle2, Search, Sparkles } from "lucide-react";

const CATEGORIES = ["All", "Fintech & Payments", "AI Engineering", "Product Strategy"] as const;

export default function InsightsPage() {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeArticle, setActiveArticle] = useState<InsightArticle | null>(null);

  const filtered = INSIGHT_ARTICLES.filter((art) => {
    const matchesCat = selectedCategory === "All" || art.category === selectedCategory;
    const matchesSearch =
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#fdfdfd] text-[#111827]">
      <Nav onOpenBooking={() => setBookingOpen(true)} />

      <main className="pt-32 pb-24">
        <div className="wrapper max-w-[1160px]">
          {/* Header */}
          <div className="max-w-3xl mb-14 space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono text-[#9ca3af]">
              <Link href="/" className="hover:text-[#111] transition-colors">HOME</Link>
              <span>/</span>
              <span className="text-[var(--accent)] font-bold uppercase">INSIGHTS & PLAYBOOKS</span>
            </div>

            <span className="label">ENGINEERING PLAYBOOKS & RESEARCH</span>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-[#111]">
              Knowledge from the trenches.
            </h1>
            <p className="text-base md:text-lg text-[var(--text-secondary)] leading-relaxed">
              Technical post-mortems, architectural patterns, and commercial playbooks on building software,
              payment rails, and localized AI in East Africa.
            </p>
          </div>

          {/* Filter and Search Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 pb-6 border-b border-[#0000000d]">
            {/* Category Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium font-mono transition-all ${
                    selectedCategory === cat
                      ? "bg-[#111] text-white shadow-xs"
                      : "bg-[#f3f4f6] text-[#4b5563] hover:bg-[#e5e7eb] hover:text-[#111]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9ca3af]" />
              <input
                type="text"
                placeholder="Search playbooks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-[#fafafa] border border-[#e5e7eb] rounded-full text-xs text-[#111] placeholder-[#9ca3af] focus:outline-none focus:border-[var(--accent)] transition-all"
              />
            </div>
          </div>

          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
            {filtered.map((article) => (
              <article
                key={article.slug}
                className="group flex flex-col justify-between rounded-2xl border border-[#0000000d] bg-white p-8 shadow-xs hover:border-[var(--accent)] hover:shadow-lg transition-all duration-300"
              >
                <div>
                  {/* Category & Meta */}
                  <div className="flex items-center justify-between mb-4 text-xs font-mono">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--accent)]">
                      {article.category}
                    </span>
                    <span className="text-[#9ca3af] flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[var(--accent)]" /> {article.readTime}
                    </span>
                  </div>

                  {/* Title */}
                  <h2
                    onClick={() => setActiveArticle(article)}
                    className="text-2xl font-bold text-[#111] mb-3 group-hover:text-[var(--accent)] transition-colors cursor-pointer"
                  >
                    {article.title}
                  </h2>

                  {/* Excerpt */}
                  <p className="text-sm leading-relaxed text-[var(--text-secondary)] mb-6">
                    {article.excerpt}
                  </p>

                  {/* Key Takeaways Box */}
                  <div className="rounded-xl border border-[#00000008] bg-[#f9fafb] p-4 mb-6 space-y-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#9ca3af] font-semibold block">
                      Key Takeaways:
                    </span>
                    <ul className="space-y-1 text-xs text-[#374151]">
                      {article.keyTakeaways.slice(0, 2).map((takeaway, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent)] shrink-0 mt-0.5" />
                          <span>{takeaway}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Footer with Author and Read Button */}
                <div className="pt-4 border-t border-[#0000000d] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center font-bold text-xs">
                      {article.author.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#111] leading-tight">{article.author.name}</p>
                      <p className="text-[10px] text-[#9ca3af] leading-tight font-mono">{article.author.role}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveArticle(article)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent)] group-hover:underline"
                  >
                    Read playbook
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </article>
            ))}
          </div>

          {/* Advisory & Sprint CTA Card */}
          <div className="rounded-3xl border border-[var(--accent)]/20 bg-gradient-to-br from-[#2563EB]/10 via-[#60A5FA]/8 to-transparent p-8 md:p-14 text-center max-w-3xl mx-auto space-y-6">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-mono font-semibold text-[var(--accent)] border border-[#2563EB]/15 shadow-xs">
              <Sparkles className="w-3.5 h-3.5" /> Discovery Sprint · 2 Weeks
            </span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#111]">
              Need help architecting your product?
            </h2>
            <p className="text-sm md:text-base text-[var(--text-secondary)] leading-relaxed max-w-xl mx-auto">
              Skip months of trial and error. We partner with founders and engineering leaders for 2-week architectural
              audits, MoMo payment integrations, and constitutional AI pipelines.
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <button
                onClick={() => setBookingOpen(true)}
                className="inline-flex min-h-[46px] items-center gap-2 rounded-xl bg-[var(--accent)] px-7 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-[var(--accent-hover)]"
              >
                Book a technical consultation
                <ArrowRight className="w-4 h-4" />
              </button>
              <Link
                href="/contact"
                className="inline-flex min-h-[46px] items-center gap-2 rounded-xl border border-[#00000015] bg-white px-7 text-sm font-medium text-[#111] hover:bg-[#fafafa] transition-colors"
              >
                Send project brief
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Reader Modal */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="relative my-8 max-w-2xl w-full rounded-2xl bg-white border border-[#00000015] p-7 md:p-10 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setActiveArticle(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-900 transition-colors text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-lg bg-gray-50"
              aria-label="Close article"
            >
              ×
            </button>

            {/* Meta */}
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="text-[var(--accent)] font-bold uppercase">{activeArticle.category}</span>
                <span className="text-[#9ca3af]">·</span>
                <span className="text-[#9ca3af]">{activeArticle.readTime}</span>
                <span className="text-[#9ca3af]">·</span>
                <span className="text-[#9ca3af]">{activeArticle.date}</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-[#111] leading-tight">
                {activeArticle.title}
              </h2>
              <p className="text-xs text-[#6b7280]">
                By <strong className="text-[#111]">{activeArticle.author.name}</strong>, {activeArticle.author.role}
              </p>
            </div>

            {/* Key Takeaways */}
            <div className="rounded-xl border border-[#2563EB]/15 bg-[#EAF2FF]/50 p-5 space-y-2">
              <span className="text-xs font-bold font-mono text-[var(--accent)] uppercase tracking-wider block">
                Key Principles & Takeaways
              </span>
              <ul className="space-y-1.5 text-xs text-[#1f2937]">
                {activeArticle.keyTakeaways.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] shrink-0 mt-1.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Main Article Body */}
            <div className="space-y-6 text-sm text-[var(--text-secondary)] leading-relaxed border-t border-[#0000000d] pt-6">
              <p className="text-base text-[#111] font-medium leading-relaxed">
                {activeArticle.content.intro}
              </p>

              {activeArticle.content.sections.map((sec, idx) => (
                <div key={idx} className="space-y-2">
                  <h3 className="text-base font-bold text-[#111]">{sec.heading}</h3>
                  <p>{sec.body}</p>
                </div>
              ))}

              <div className="rounded-xl border border-[#0000000d] bg-[#f9fafb] p-5">
                <p className="font-medium text-[#111]">{activeArticle.content.conclusion}</p>
              </div>
            </div>

            {/* Modal CTA */}
            <div className="pt-4 border-t border-[#0000000d] flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-[#6b7280]">Building a system like this?</span>
              <button
                onClick={() => {
                  setActiveArticle(null);
                  setBookingOpen(true);
                }}
                className="w-full sm:w-auto inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-6 text-xs font-semibold text-white transition-colors hover:bg-[var(--accent-hover)]"
              >
                Discuss with engineering team
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
      <WhatsAppButton />
      <BookingModal isOpen={bookingOpen} onClose={() => setBookingOpen(false)} />
    </div>
  );
}
