"use client";

import { motion } from "motion/react";
import { ContactIcon } from "../icons";
import { Magnetic } from "../motion/Tilt";

const EASE = [0.22, 1, 0.36, 1] as const;

type Props = {
  name: string;
  role: string;
  intro: string;
  links: { label: string; href: string }[];
};

/**
 * The page's one orchestrated load moment: the name rises word by word from
 * behind a mask, then the role, intro, and links follow. With reduced motion,
 * CSS keeps the text in place (globals.css, [data-reveal]).
 */
export function HeroIntro({ name, role, intro, links }: Props) {
  const words = name.split(" ");
  const after = words.length * 0.12 + 0.2;

  return (
    <div className="max-w-3xl">
      <h1 id="home-heading" className="text-display">
        {words.map((word, i) => (
          // The space sits outside the masked word: inside an inline-block it would collapse.
          <span key={`${word}-${i}`}>
            <span className="inline-block overflow-hidden pb-1 align-bottom">
              <motion.span
                data-reveal
                className="inline-block"
                initial={{ y: "110%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 + i * 0.12, ease: EASE }}
              >
                {word}
              </motion.span>
            </span>
            {i < words.length - 1 && " "}
          </span>
        ))}
      </h1>

      <motion.div
        data-reveal
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: after, ease: EASE }}
      >
        <p className="mt-4 text-xl text-ink-muted sm:text-2xl">{role}</p>
        <p className="mt-6 max-w-prose text-lg">{intro}</p>
        <ul className="mt-6 flex flex-wrap gap-x-6">
          {links.map((link) => (
            <li key={link.label}>
              <Magnetic>
                <a
                  href={link.href}
                  className="group inline-flex min-h-11 items-center gap-2 font-semibold text-accent"
                >
                  <ContactIcon label={link.label} />
                  <span className="underline underline-offset-4 group-hover:no-underline">{link.label}</span>
                </a>
              </Magnetic>
            </li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
}
