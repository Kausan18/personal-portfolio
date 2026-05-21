"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";

interface Project {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  tags: string[];
  liveUrl: string;
  githubUrl: string;
  featured: boolean;
  images?: string[];
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((d) => setProjects(d.projects));
  }, []);

  return (
    <section id="projects" className="py-24 px-6 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7 }}
        className="text-center mb-16"
      >
        <h2 className="text-4xl md:text-5xl font-bold text-violet-400 font-mono mb-3">
          Projects
        </h2>
        <p className="text-gray-500 text-base">Things I&apos;ve built</p>
      </motion.div>

      {projects.length === 0 ? (
        <p className="text-center text-gray-600 font-mono">No projects yet. Add them from the admin panel.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
            >
              <Link href={`/projects/${project.id}`}>
                <div className="group bg-[#0d0d20] border border-white/8 rounded-2xl overflow-hidden hover:border-violet-500/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-900/20 cursor-pointer h-full">
                  {/* Card image placeholder */}
                  {project.images && project.images.length > 0 ? (
                    <div className="relative h-44 overflow-hidden border-b border-white/5">
                      <Image
                        src={project.images[0]}
                        alt={project.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-44 bg-[#0a0a1a] flex items-center justify-center border-b border-white/5">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-12 h-12 text-violet-800/60 group-hover:text-violet-600/80 transition-colors"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M16 3v4M8 3v4"
                        />
                      </svg>
                    </div>
                  )}

                  {/* Card body */}
                  <div className="p-5">
                    <h3 className="font-bold text-white text-lg font-mono mb-1">
                      {project.title}
                    </h3>
                    <p className="text-gray-500 text-sm mb-3">{project.subtitle}</p>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 bg-violet-900/30 border border-violet-700/30 text-violet-300 rounded text-xs font-mono"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <span className="text-violet-400 text-sm font-mono group-hover:text-violet-300 transition-colors flex items-center gap-1">
                      View Details
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}