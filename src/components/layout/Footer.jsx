function Footer() {
  return (
    <footer className="border-t border-white/5 mt-16">
      <div className="container mx-auto px-4 py-8 text-center text-sm text-surface-500">
        <p>
          © {new Date().getFullYear()} GuideUs · Crafted with{" "}
          <span className="gradient-text font-semibold">React & Appwrite</span>
        </p>
      </div>
    </footer>
  );
}

export default Footer;
