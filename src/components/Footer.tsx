export default function Footer() {
  return (
    <footer className="border-t border-[#1e1e2e] py-8 px-6 text-center">
      <p className="font-mono text-xs text-[#334155]">
        © {new Date().getFullYear()} Kerem Alkan — Built with{" "}
        <span className="text-[#7C3AED]">Next.js</span> &amp; ☕
      </p>
    </footer>
  );
}
