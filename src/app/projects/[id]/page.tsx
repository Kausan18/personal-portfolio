import { getProjects } from "@/lib/data";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProjectPage({ params }: Props) {
  const { id } = await params;
  const { projects } = getProjects();
  const project = projects.find((p) => p.id === id);

  if (!project) return notFound();

  return (
    <main className="bg-[#080814] min-h-screen text-white px-6 py-16 max-w-3xl mx-auto">
      <Link
        href="/#projects"
        className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300 font-mono text-sm mb-10 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
        </svg>
        Back to Projects
      </Link>

      <div className="bg-[#0d0d20] border border-white/8 rounded-2xl p-8">
        <div className="flex flex-wrap gap-2 mb-4">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 bg-violet-900/30 border border-violet-700/30 text-violet-300 rounded text-xs font-mono"
            >
              {tag}
            </span>
          ))}
        </div>

        <h1 className="text-3xl font-bold font-mono text-white mb-2">{project.title}</h1>
        <p className="text-gray-500 text-sm mb-6">{project.subtitle}</p>

        <p className="text-gray-300 leading-relaxed mb-8">{project.description}</p>

        {project.images && project.images.length > 0 && (
          <div className="mb-8 space-y-4">
            <div className="overflow-x-auto flex gap-4 pb-2">
              {project.images.map((image) => (
                <div key={image} className="min-w-70 rounded-3xl overflow-hidden border border-white/10 bg-[#090918]">
                  <Image
                    src={image}
                    alt={`${project.title} image`}
                    width={560}
                    height={320}
                    className="object-cover w-full h-56"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-4">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-semibold text-sm transition-all hover:scale-105 flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Live Demo
            </a>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 border border-white/20 hover:border-violet-500 text-white rounded-xl font-semibold text-sm transition-all hover:scale-105 flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub Repo
            </a>
          )}
          {!project.liveUrl && !project.githubUrl && (
            <p className="text-gray-600 font-mono text-sm">No links added yet.</p>
          )}
        </div>
      </div>
    </main>
  );
}