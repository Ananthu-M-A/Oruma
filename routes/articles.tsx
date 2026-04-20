import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FloatingActions from '../components/FloatingActions';
import { LucideIcon } from '@site-builder/icons';

export const meta = {
  title: "Mental Health Articles | oruma.me",
  description: "Insightful articles on mental wellness, therapy, and self-care. Read the latest from Oruma's experts."
};

export default function ArticlesPage() {
  const articles = [
    {
      title: "Understanding Anxiety: More Than Just Worry",
      excerpt: "Anxiety is a complex emotional response. Learn how it affects the mind and body, and discover gentle ways to manage it daily.",
      category: "Mental Health",
      date: "May 12, 2026",
      img: "https://images.unsplash.com/photo-1621887348744-6b0444f8a058?auto=format&fit=crop&q=80&w=800",
      readTime: "5 min read"
    },
    {
      title: "The Gentle Art of Mindfulness in a Busy World",
      excerpt: "Mindfulness doesn't require hours of meditation. We explore simple, practical ways to stay grounded amidst the chaos of modern life.",
      category: "Self-Care",
      date: "May 08, 2026",
      img: "https://images.unsplash.com/photo-1499728603263-13726abce5fd?auto=format&fit=crop&q=80&w=800",
      readTime: "4 min read"
    },
    {
      title: "Why Kerala Needs a Youth-Led Mental Health Movement",
      excerpt: "The story behind Oruma and our mission to create an anonymous, safe sanctuary for the next generation's mental wellness.",
      category: "Community",
      date: "May 01, 2026",
      img: "https://images.unsplash.com/photo-1653130892581-7c0ae1f4e8e0?auto=format&fit=crop&q=80&w=800",
      readTime: "7 min read"
    },
    {
      title: "Healing Through Connection: The Role of Group Therapy",
      excerpt: "Discover how shared experiences can foster deeper healing and why community is a vital part of the recovery journey.",
      category: "Therapy",
      date: "April 25, 2026",
      img: "https://images.unsplash.com/photo-1646963558449-4f49a48af9e0?auto=format&fit=crop&q=80&w=800",
      readTime: "6 min read"
    }
  ];

  return (
    <main className="min-h-screen bg-white font-body text-[#2E3E3C] overflow-x-hidden">
      <Navbar />
      <FloatingActions />

      {/* Hero Section */}
      <section className="pt-32 md:pt-48 pb-16 bg-[#F5F8F7]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl">
            <div className="inline-block bg-[#0A7F7A] text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-6">Resources</div>
            <h1 className="text-5xl md:text-7xl font-heading font-black text-[#064F4B] mb-8 leading-tight">
              Healing Through <span className="text-[#0A7F7A]">Words</span>
            </h1>
            <p className="text-xl text-[#5F7F7A] font-medium leading-relaxed max-w-2xl">
              Our library of articles, guides, and stories designed to support your mental wellness journey with empathy and insight.
            </p>
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-12">
            {articles.map((article, idx) => (
              <a 
                key={idx} 
                href="#" 
                className="group flex flex-col md:flex-row gap-8 bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 hover:border-[#0A7F7A] transition-all hover:shadow-2xl hover:shadow-[#0A7F7A]/5 p-6"
              >
                <div className="w-full md:w-2/5 aspect-[4/3] rounded-[1.5rem] overflow-hidden shrink-0">
                  <img 
                    src={article.img} 
                    alt={article.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  />
                </div>
                <div className="flex flex-col justify-between py-2">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#0A7F7A] bg-[#0A7F7A]/10 px-3 py-1 rounded-full">
                        {article.category}
                      </span>
                      <span className="text-[10px] font-bold text-[#5F7F7A] uppercase tracking-widest">
                        {article.readTime}
                      </span>
                    </div>
                    <h2 className="text-2xl font-black text-[#064F4B] mb-4 leading-tight group-hover:text-[#0A7F7A] transition-colors">
                      {article.title}
                    </h2>
                    <p className="text-[#5F7F7A] leading-relaxed line-clamp-2 font-medium">
                      {article.excerpt}
                    </p>
                  </div>
                  <div className="mt-6 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#5F7F7A]">{article.date}</span>
                    <div className="w-10 h-10 rounded-full bg-[#F5F8F7] flex items-center justify-center text-[#0A7F7A] group-hover:bg-[#0A7F7A] group-hover:text-white transition-all">
                      <LucideIcon name="arrow-right" size={20} />
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>

          {/* Load More Button */}
          <div className="mt-20 text-center">
             <button className="px-12 py-5 bg-[#064F4B] text-white rounded-full font-black text-lg hover:scale-105 transition-all shadow-xl shadow-[#064F4B]/20 active:scale-95 uppercase tracking-widest">
               Load More Articles
             </button>
          </div>
        </div>
      </section>

      {/* Newsletter / Stay Updated */}
      <section className="py-24 bg-[#0A7F7A]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-white/10 backdrop-blur-md rounded-[3rem] p-12 md:p-20 border border-white/20 text-center relative overflow-hidden">
             <div className="absolute top-0 left-0 w-32 h-32 bg-[#B7C8A3] rounded-full blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2" />
             <div className="absolute bottom-0 right-0 w-48 h-48 bg-white rounded-full blur-3xl opacity-10 translate-x-1/3 translate-y-1/3" />
             
             <div className="relative z-10 max-w-2xl mx-auto">
                <LucideIcon name="mail-open" size={48} className="text-[#B7C8A3] mx-auto mb-8" />
                <h2 className="text-4xl md:text-5xl font-heading font-black text-white mb-6">Stay Centered</h2>
                <p className="text-xl text-white/80 font-medium mb-12 leading-relaxed">
                  Join our gentle community to receive mental wellness tips, expert advice, and gentle reminders directly in your inbox.
                </p>
                <div className="flex flex-col md:flex-row gap-4 items-stretch justify-center">
                   <input 
                    type="email" 
                    placeholder="Enter your email" 
                    className="flex-1 bg-white border-0 rounded-full px-8 py-5 text-[#064F4B] font-bold placeholder:text-[#5F7F7A] focus:ring-4 focus:ring-[#B7C8A3]/50 transition-all outline-none"
                   />
                   <button className="bg-[#B7C8A3] text-[#064F4B] px-10 py-5 rounded-full font-black text-lg hover:bg-white transition-all active:scale-95 uppercase tracking-widest">
                     Subscribe
                   </button>
                </div>
             </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
