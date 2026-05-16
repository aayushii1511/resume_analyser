import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
      <h1 className="text-5xl font-bold">
        AI Skill Gap Analyzer
      </h1>

      <p className="mt-4 text-gray-400">
        Your AI-powered career roadmap platform
      </p>

      <div className="mt-8 flex gap-4">
        <Link
          href="/login"
          className="rounded-lg bg-white px-6 py-3 text-black font-semibold"
        >
          Login
        </Link>

        <Link
          href="/register"
          className="rounded-lg border border-white px-6 py-3"
        >
          Register
        </Link>
      </div>
    </div>
  );
}