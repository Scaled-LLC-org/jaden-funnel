/** Server component — shared dark footer. Pass `children` to override the default disclaimer line. */
export function SiteFooter({ children }: { children?: React.ReactNode }) {
  return (
    <footer style={{ background: "var(--ink)", padding: "40px 0 32px" }}>
      <div className="am-wrap" style={{ textAlign: "center" }}>
        <p className="am-eyebrow" style={{ color: "var(--on-dark)", marginBottom: 10 }}>Aesthetic Mastery</p>
        {children ?? (
          <p style={{ fontSize: 11.5, color: "var(--on-dark-soft)", margin: 0 }}>
            &copy; {new Date().getFullYear()} Jaden Levin. Results vary. Not medical advice.
          </p>
        )}
      </div>
    </footer>
  );
}
