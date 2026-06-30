import { useState } from "react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) setSubmitted(true);
  };

  return (
    <section className="bg-terracotta py-20 sm:py-24">
      <div className="mx-auto max-w-2xl px-5 text-center sm:px-8">
        <span className="text-xs tracking-[0.3em] text-cream/70 uppercase">Stay Connected</span>
        <h2 className="mt-3 font-serif text-3xl font-medium text-cream sm:text-4xl">
          Join the herviva circle
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-cream/80">
          Be the first to know about new arrivals, exclusive offers, and styling inspiration delivered to your inbox.
        </p>

        {submitted ? (
          <p className="mt-8 rounded-full bg-cream/15 px-6 py-4 text-sm text-cream backdrop-blur-sm">
            Welcome to the circle! Check your inbox for a little surprise.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-0">
            <input
              type="email"
              required
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 rounded-full border border-cream/30 bg-cream/10 px-6 py-3.5 text-sm text-cream placeholder:text-cream/50 outline-none backdrop-blur-sm focus:border-cream/60 sm:rounded-r-none"
            />
            <button
              type="submit"
              className="cursor-pointer rounded-full bg-cream px-8 py-3.5 text-sm font-medium tracking-wide text-terracotta transition-colors hover:bg-cream/90 sm:rounded-l-none"
            >
              Subscribe
            </button>
          </form>
        )}

        <p className="mt-4 text-[11px] text-cream/50">
          We respect your privacy. Unsubscribe anytime.
        </p>
      </div>
    </section>
  );
}
