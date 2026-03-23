export function Footer() {
  return (
    <footer className="border-t border-[#e5e7eb] bg-white py-8">
      <div className="container mx-auto px-4 text-center">
        <div className="mb-4">
          <a
            href="http://buymeacoffee.com/aungmyokyaw"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-md transition-opacity hover:opacity-80"
          >
            <img
              src="https://img.shields.io/badge/Buy%20Me%20A%20Coffee-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black"
              alt="Buy Me A Coffee"
              width={200}
              height={50}
              className="rounded-md"
            />
          </a>
        </div>
        <p className="text-sm text-[#6b7280]">
          Powered by Gemini API &bull; Built for modern product teams
        </p>
      </div>
    </footer>
  );
}
