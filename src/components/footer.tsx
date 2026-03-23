export function Footer() {
  return (
    <footer className="border-t-4 border-black bg-white py-8">
      <div className="container mx-auto px-4 text-center">
        <div className="mb-4">
          <a
            href="http://buymeacoffee.com/aungmyokyaw"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block border-2 border-black transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_#000]"
          >
            <img
              src="https://img.shields.io/badge/Buy%20Me%20A%20Coffee-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black"
              alt="Buy Me A Coffee"
              width={200}
              height={50}
              className="border-2 border-black"
            />
          </a>
        </div>
        <p className="text-sm font-bold text-black">
          Powered by Gemini API • Built for modern product teams
        </p>
      </div>
    </footer>
  );
}
