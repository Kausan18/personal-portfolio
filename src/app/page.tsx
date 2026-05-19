import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Skills from "@/components/Skills";
import Projects from "@/components/Projects";
import Contact from "@/components/Contact";

export default function Home() {
  return (
    <main className="bg-[#080814] min-h-screen text-white">
      <Navbar />
      <Hero />
      <div className="border-t border-white/5" />
      <Skills />
      <div className="border-t border-white/5" />
      <Projects />
      <div className="border-t border-white/5" />
      <Contact />
    </main>
  );
}