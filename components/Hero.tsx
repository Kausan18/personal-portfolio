"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Download } from "lucide-react";

export default function Hero() {
  const [description, setDescription] = useState("Loading...");
  const [resumeExists, setResumeExists] = useState(false);

  const fetchData = () => {
    fetch("/api/hero")
      .then((res) => res.json())
      .then((data) => {
        if (data?.description) {
          setDescription(data.description);
        }
      })
      .catch(() => {
        setDescription(
          "Motivated and detail-oriented Computer Science student with a strong interest in Artificial Intelligence and Machine Learning, and a keen aptitude for building impactful, data-driven solutions."
        );
      });

    fetch("/api/resume")
      .then((res) => res.json())
      .then((data) => {
        if (typeof data?.exists === "boolean") {
          setResumeExists(data.exists);
        }
      })
      .catch(() => {
        setResumeExists(false);
      });
  };

  useEffect(() => {
    fetchData();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  return (
    <section className="min-h-screen flex items-center px-6 pt-20 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center w-full">
        {/* Left: Text */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <p className="text-violet-400 font-mono text-sm tracking-widest uppercase mb-3">
            Hello, I&apos;m
          </p>
          <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
            <span className="text-violet-400">Kaustubh</span>
            <br />
            <span className="text-white font-mono">Shandilya</span>
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed mb-8 max-w-lg">
            {description}
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() =>
                document
                  .getElementById("projects")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
            >
              View Projects
            </button>
            <button
              onClick={() =>
                document
                  .getElementById("contact")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="px-6 py-3 border border-white/20 hover:border-violet-500 text-white rounded-xl font-semibold transition-all duration-200 hover:scale-105"
            >
              Contact Me
            </button>
            {resumeExists && (
              <a
                href="/resume.pdf"
                download
                className="flex items-center gap-2 px-6 py-3 border border-white/20 text-white rounded-xl font-semibold transition-all duration-200 hover:bg-white/5"
              >
                <Download size={16} />
                Resume
              </a>
            )}
          </div>
        </motion.div>

        {/* Right: Photo */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="flex justify-center"
        >
          <div className="relative w-72 h-80 md:w-80 md:h-96">
            {/* Glow ring */}
            <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-violet-600/40 to-indigo-600/20 blur-2xl scale-110" />
            <div className="relative w-full h-full rounded-2xl overflow-hidden border border-violet-500/30 bg-[#12122a]">
              <Image src="/photo.jpg" alt="Kaustubh Shandilya" fill className="object-cover" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}