import { FileIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { codeToHtml } from "shiki";

interface CodeComparisonProps {
  beforeCode: string;
  afterCode: string;
  language: string;
  filename: string;
  lightTheme: string;
  darkTheme: string;
}

export function CodeComparison({
  beforeCode,
  afterCode,
  language,
  filename,
  lightTheme,
  darkTheme,
}: CodeComparisonProps) {
  const { theme, systemTheme } = useTheme();
  const [highlightedBefore, setHighlightedBefore] = useState("");
  const [highlightedAfter, setHighlightedAfter] = useState("");

  useEffect(() => {
    const currentTheme = theme === "system" ? systemTheme : theme;
    const selectedTheme = currentTheme === "dark" ? darkTheme : lightTheme;

    async function highlightCode() {
      const before = await codeToHtml(beforeCode, {
        lang: language,
        theme: selectedTheme,
      });
      const after = await codeToHtml(afterCode, {
        lang: language,
        theme: selectedTheme,
      });
      setHighlightedBefore(before);
      setHighlightedAfter(after);
    }

    highlightCode();
  }, [
    theme,
    systemTheme,
    beforeCode,
    afterCode,
    language,
    lightTheme,
    darkTheme,
  ]);

  const renderCode = (code: string, highlighted: string) => {
    if (highlighted) {
      return (
        <div
          className="h-full overflow-auto bg-background font-mono text-xs [&>pre]:h-full [&>pre]:!bg-transparent [&>pre]:p-4 [&_code]:break-all"
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      );
    } else {
      return (
        <pre className="h-full p-4 overflow-auto font-mono text-xs break-all bg-background text-foreground">
          {code}
        </pre>
      );
    }
  };
  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="relative w-full overflow-hidden border rounded-xl border-border">
        <div className="relative grid md:grid-cols-2 md:divide-x md:divide-border">
          <div>
            <div className="flex items-center p-2 text-sm bg-accent text-foreground">
              <FileIcon className="w-4 h-4 mr-2" />
              {filename}
              <span className="ml-auto">before</span>
            </div>
            {renderCode(beforeCode, highlightedBefore)}
          </div>
          <div>
            <div className="flex items-center p-2 text-sm bg-accent text-foreground">
              <FileIcon className="w-4 h-4 mr-2" />
              {filename}
              <span className="ml-auto">after</span>
            </div>
            {renderCode(afterCode, highlightedAfter)}
          </div>
        </div>
        <div className="absolute flex items-center justify-center w-8 h-8 text-xs -translate-x-1/2 -translate-y-1/2 rounded-md left-1/2 top-1/2 bg-accent text-foreground">
          VS
        </div>
      </div>
    </div>
  );
}

/* import { CodeComparison } from "@/components/ui/code-comparism";

const beforeCode = `import { NextRequest } from 'next/server';

export const middleware = async (req: NextRequest) => {
  let user = undefined;
  let team = undefined;
  const token = req.headers.get('token');

  if(req.nextUrl.pathname.startsWith('/auth')) {
    user = await getUserByToken(token);

    if(!user) {
      return NextResponse.redirect('/login');
    }
  }

  if(req.nextUrl.pathname.startsWith('/team')) {
    user = await getUserByToken(token);

    if(!user) {
      return NextResponse.redirect('/login');
    }

    const slug = req.nextUrl.query.slug;
    team = await getTeamBySlug(slug);

    if(!team) {
      return NextResponse.redirect('/');
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/|_static|_vercel|[\\w-]+\\.\\w+).*)'],
};`;

const afterCode = `import { createMiddleware, type MiddlewareFunctionProps } from '@app/(auth)/auth/_middleware';
import { auth } from '@app/(auth)/auth/_middleware';
import { team } from '@app/(team)/team/_middleware';

const middlewares = {
  '/auth{/:path?}': auth,
  '/team{/:slug?}': [ auth, team ],
};

export const middleware = createMiddleware(middlewares);

export const config = {
  matcher: ['/((?!_next/|_static|_vercel|[\\w-]+\\.\\w+).*)'],
};`;

export function CodeComparisonDemo() {
  return (
    <CodeComparison
      beforeCode={beforeCode}
      afterCode={afterCode}
      language="typescript"
      filename="middleware.ts"
      lightTheme="github-light"
      darkTheme="github-dark"
    />
  );
} */
