"use client";
import React from "react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { ArrowRight, Menu, Rocket, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const menuItems = [
  { name: "Features", href: "#" },
  { name: "Solution", href: "#" },
  { name: "Pricing", href: "#" },
  { name: "About", href: "#" },
];

export default function HeroSection() {
  const [menuState, setMenuState] = React.useState(false);

  return (
    <>
      <header>
        <nav
          data-state={menuState && "active"}
          className="fixed z-20 w-full bg-white border-b border-dashed backdrop-blur md:relative dark:bg-zinc-950/50 lg:dark:bg-transparent"
        >
          <div className="max-w-5xl px-6 m-auto">
            <div className="flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
              <div className="flex justify-between w-full lg:w-auto">
                <Link
                  href="/"
                  aria-label="home"
                  className="flex items-center space-x-2"
                >
                  <Logo />
                </Link>

                <button
                  onClick={() => setMenuState(!menuState)}
                  aria-label={menuState == true ? "Close Menu" : "Open Menu"}
                  className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"
                >
                  <Menu className="in-data-[state=active]:rotate-180 in-data-[state=active]:scale-0 in-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                  <X className="in-data-[state=active]:rotate-0 in-data-[state=active]:scale-100 in-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
                </button>
              </div>

              <div className="bg-background in-data-[state=active]:block lg:in-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
                <div className="lg:pr-4">
                  <ul className="space-y-6 text-base lg:flex lg:gap-8 lg:space-y-0 lg:text-sm">
                    {menuItems.map((item, index) => (
                      <li key={index}>
                        <Link
                          href={item.href}
                          className="block duration-150 text-muted-foreground hover:text-accent-foreground"
                        >
                          <span>{item.name}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-col w-full space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit lg:border-l lg:pl-6">
                  <Button asChild variant="outline" size="sm">
                    <Link href="#">
                      <span>Login</span>
                    </Link>
                  </Button>
                  <Button asChild size="sm">
                    <Link href="#">
                      <span>Login</span>
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </header>
      <main className="overflow-hidden">
        <section>
          <div className="relative pt-24">
            <div className="px-6 mx-auto max-w-7xl">
              <div className="max-w-3xl text-center sm:mx-auto lg:mr-auto lg:mt-0 lg:w-4/5">
                <Link
                  href="/"
                  className="rounded-(--radius) mx-auto flex w-fit items-center gap-2 border p-1 pr-3 rounded-sm"
                >
                  <span className="bg-muted rounded-[calc(var(--radius)-0.25rem)] px-2 py-1 text-xs">
                    New
                  </span>
                  <span className="text-sm">Introduction Tailus UI Html</span>
                  <span className="bg-(--color-border) block h-4 w-px"></span>

                  {/* <Separator /> */}
                  <ArrowRight className="size-4" />
                </Link>

                <h1 className="mt-8 text-balance text-4xl font-semibold md:text-5xl xl:text-6xl xl:[line-height:1.125]">
                  Modern Software testing reimagined
                </h1>
                <p className="hidden max-w-2xl mx-auto mt-8 text-lg text-wrap sm:block">
                  Tailwindcss highly customizable components for building modern
                  websites and applications that look and feel the way you mean
                  it.
                </p>
                <p className="max-w-2xl mx-auto mt-6 text-wrap sm:hidden">
                  Highly customizable components for building modern websites
                  and applications, with your personal spark.
                </p>

                <div className="mt-8">
                  <Button size="lg" asChild>
                    <Link href="#">
                      <Rocket className="relative size-4" />
                      <span className="text-nowrap">Start Building</span>
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
            <div className="relative mt-16">
              <div
                aria-hidden
                className="bg-linear-to-b to-background absolute inset-0 z-10 from-transparent from-35%"
              />
              <div className="relative max-w-6xl px-4 mx-auto overflow-hidden">
                {/* Shows up in dark mode */}
                <Image
                  className="relative hidden border z-2 border-border/25 rounded-2xl dark:block"
                  src="/worm1-dark.png"
                  alt="app screen"
                  width={2796}
                  height={2008}
                />
                <Image
                  className="relative border z-2 border-border/25 rounded-2xl dark:hidden"
                  src="/worm1.png"
                  alt="app screen"
                  width={2796}
                  height={2008}
                />
              </div>
            </div>
          </div>
        </section>
        <section className="relative z-10 pt-10 pb-16 bg-background">
          <div className="max-w-5xl px-6 m-auto">
            <h2 className="text-lg font-medium text-center">
              Your favorite companies are our partners.
            </h2>
            <div className="flex flex-wrap items-center justify-center max-w-4xl mx-auto mt-12 gap-x-12 gap-y-8 sm:gap-x-16 sm:gap-y-12">
              <img
                className="h-5 w-fit dark:invert"
                src="https://html.tailus.io/blocks/customers/nvidia.svg"
                alt="Nvidia Logo"
                height="20"
                width="auto"
              />
              <img
                className="h-4 w-fit dark:invert"
                src="https://html.tailus.io/blocks/customers/column.svg"
                alt="Column Logo"
                height="16"
                width="auto"
              />
              <img
                className="h-4 w-fit dark:invert"
                src="https://html.tailus.io/blocks/customers/github.svg"
                alt="GitHub Logo"
                height="16"
                width="auto"
              />
              <img
                className="h-5 w-fit dark:invert"
                src="https://html.tailus.io/blocks/customers/nike.svg"
                alt="Nike Logo"
                height="20"
                width="auto"
              />
              <img
                className="h-4 w-fit dark:invert"
                src="https://html.tailus.io/blocks/customers/laravel.svg"
                alt="Laravel Logo"
                height="16"
                width="auto"
              />
              <img
                className="h-7 w-fit dark:invert"
                src="https://html.tailus.io/blocks/customers/lilly.svg"
                alt="Lilly Logo"
                height="28"
                width="auto"
              />
              <img
                className="h-5 w-fit dark:invert"
                src="https://html.tailus.io/blocks/customers/lemonsqueezy.svg"
                alt="Lemon Squeezy Logo"
                height="20"
                width="auto"
              />
              <img
                className="h-6 w-fit dark:invert"
                src="https://html.tailus.io/blocks/customers/openai.svg"
                alt="OpenAI Logo"
                height="24"
                width="auto"
              />
              <img
                className="h-4 w-fit dark:invert"
                src="https://html.tailus.io/blocks/customers/tailwindcss.svg"
                alt="Tailwind CSS Logo"
                height="16"
                width="auto"
              />
              <img
                className="h-5 w-fit dark:invert"
                src="https://html.tailus.io/blocks/customers/vercel.svg"
                alt="Vercel Logo"
                height="20"
                width="auto"
              />
              <img
                className="h-5 w-fit dark:invert"
                src="https://html.tailus.io/blocks/customers/zapier.svg"
                alt="Zapier Logo"
                height="20"
                width="auto"
              />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
