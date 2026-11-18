/**
 * Logos for skills and project tools, from the devicon package (MIT).
 * Keyed by the exact display name used in skills.ts and projects.ts.
 *
 * To add a skill's logo: find it at https://devicon.dev, import its
 * "-original.svg" here, and add one line to `techIcons`. Use `mono: true` for
 * logos that are black by brand, so they follow the text color in dark mode.
 * Names with no entry get a neutral fallback glyph.
 */

import type { StaticImageData } from "next/image";

import bootstrap from "devicon/icons/bootstrap/bootstrap-original.svg";
import canva from "devicon/icons/canva/canva-original.svg";
import csharp from "devicon/icons/csharp/csharp-original.svg";
import css from "devicon/icons/css3/css3-original.svg";
import express from "devicon/icons/express/express-original.svg";
import figma from "devicon/icons/figma/figma-original.svg";
import git from "devicon/icons/git/git-original.svg";
import github from "devicon/icons/github/github-original.svg";
import html from "devicon/icons/html5/html5-original.svg";
import java from "devicon/icons/java/java-original.svg";
import javascript from "devicon/icons/javascript/javascript-original.svg";
import laravel from "devicon/icons/laravel/laravel-original.svg";
import mysql from "devicon/icons/mysql/mysql-original.svg";
import nextjs from "devicon/icons/nextjs/nextjs-plain.svg"; // plain = N cut out of the disc, for the mono mask
import nodejs from "devicon/icons/nodejs/nodejs-original.svg";
import postgresql from "devicon/icons/postgresql/postgresql-original.svg";
import python from "devicon/icons/python/python-original.svg";
import react from "devicon/icons/react/react-original.svg";
import reactrouter from "devicon/icons/reactrouter/reactrouter-original.svg";
import sass from "devicon/icons/sass/sass-original.svg";
import supabase from "devicon/icons/supabase/supabase-original.svg";
import tailwindcss from "devicon/icons/tailwindcss/tailwindcss-original.svg";
import typescript from "devicon/icons/typescript/typescript-original.svg";
import vercel from "devicon/icons/vercel/vercel-original.svg";
import visualstudio from "devicon/icons/visualstudio/visualstudio-original.svg";
import vscode from "devicon/icons/vscode/vscode-original.svg";

/**
 * A static .svg import: a URL string under Turbopack, an image object under webpack.
 * `mono`: black-by-brand logo, drawn in the text color.
 * `darkBacking`: dark brand color that needs a light tile in dark mode to stay visible.
 */
export type TechIconData = { src: StaticImageData | string; mono?: boolean; darkBacking?: boolean };

export const techIcons: Record<string, TechIconData> = {
  // Languages
  Python: { src: python },
  JavaScript: { src: javascript },
  TypeScript: { src: typescript },
  Java: { src: java },
  "C#": { src: csharp },
  HTML: { src: html },
  CSS: { src: css },
  // Frameworks and libraries
  "Next.js": { src: nextjs, mono: true },
  React: { src: react },
  "React Router": { src: reactrouter },
  "Tailwind CSS": { src: tailwindcss },
  Bootstrap: { src: bootstrap },
  "Sass (SCSS)": { src: sass },
  // Backend and databases
  MySQL: { src: mysql, darkBacking: true },
  PostgreSQL: { src: postgresql },
  Supabase: { src: supabase },
  "Node.js": { src: nodejs },
  Express: { src: express, mono: true },
  Laravel: { src: laravel },
  // Hosting, tools, design
  Vercel: { src: vercel, mono: true },
  Git: { src: git },
  GitHub: { src: github, mono: true },
  "Visual Studio": { src: visualstudio },
  "VS Code": { src: vscode },
  Figma: { src: figma },
  Canva: { src: canva },
  // Project services (OpenRouter, Spotify Web API, Cloudflare Turnstile) deliberately have
  // no logo: they all use the neutral service glyph explained by the Projects page legend.
};

/** Names without a devicon logo that are databases get a database glyph; others a neutral one. */
export const databaseGlyph = new Set(["SQL", "Turso (libSQL)"]);
