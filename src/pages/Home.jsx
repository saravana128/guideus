import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Button from "../components/common/Button";

const features = [
  {
    icon: "🎓",
    title: "Courses & Progress",
    text: "Group tasks into courses and watch completion percentages climb with animated progress rings.",
    tint: "from-violet-500 to-fuchsia-500",
  },
  {
    icon: "👥",
    title: "Assign & Collaborate",
    text: "Create tasks and assign them to anyone on your team — or keep them for yourself.",
    tint: "from-sky-500 to-indigo-500",
  },
  {
    icon: "💬",
    title: "Live Course Chat",
    text: "Every course has a realtime comment stream so your team stays in sync.",
    tint: "from-emerald-500 to-teal-400",
  },
  {
    icon: "⚡",
    title: "Inline Editing",
    text: "Change status and due dates right from the task list — no extra clicks.",
    tint: "from-amber-500 to-orange-500",
  },
];

function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="py-10 md:py-16">
      <div className="max-w-4xl mx-auto text-center">
        <div className="animate-fade-in-up">
          <span className="badge bg-primary-500/15 text-primary-300 border-primary-400/25 !px-4 !py-1.5 !text-sm">
            ✨ Collaborative Task Management
          </span>
        </div>

        <h1
          className="font-display text-4xl sm:text-6xl font-bold text-white mt-6 mb-6 leading-tight animate-fade-in-up"
          style={{ animationDelay: "80ms" }}
        >
          Navigate your work with <span className="gradient-text">GuideUs</span>
        </h1>

        <p
          className="text-lg md:text-xl text-surface-400 mb-10 max-w-2xl mx-auto animate-fade-in-up"
          style={{ animationDelay: "160ms" }}
        >
          Organize tasks into courses, assign work to teammates, track progress
          with beautiful visuals, and chat in realtime — all in one place.
        </p>

        <div
          className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up"
          style={{ animationDelay: "240ms" }}
        >
          {isAuthenticated ? (
            <Link to="/dashboard">
              <Button size="lg" className="w-full sm:w-auto">
                Go to Dashboard →
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Get Started — it&apos;s free
                </Button>
              </Link>
              <Link to="/login">
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  Sign In
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
        {features.map((feature, i) => (
          <div
            key={feature.title}
            className="card hover:border-white/20 hover:-translate-y-1 hover:shadow-glow-lg transition-all duration-300 animate-fade-in-up"
            style={{ animationDelay: `${300 + i * 90}ms` }}
          >
            <div
              className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${feature.tint} flex items-center justify-center text-2xl shadow-glow mb-4`}
            >
              {feature.icon}
            </div>
            <h3 className="font-display text-lg font-semibold text-white mb-2">
              {feature.title}
            </h3>
            <p className="text-sm text-surface-400">{feature.text}</p>
          </div>
        ))}
      </div>

      <div
        className="mt-16 max-w-3xl mx-auto card text-center animate-fade-in-up"
        style={{ animationDelay: "680ms" }}
      >
        <h2 className="font-display text-2xl font-bold text-white mb-3">
          Ready to get your team on track?
        </h2>
        <p className="text-surface-400 mb-6">
          Create an account in seconds and start organizing.
        </p>
        {!isAuthenticated && (
          <Link to="/register">
            <Button size="lg">Create Free Account ✨</Button>
          </Link>
        )}
      </div>
    </div>
  );
}

export default Home;
