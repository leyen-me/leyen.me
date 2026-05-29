import Refractor from "react-refractor";
import type { RefractorSyntax } from "refractor";
import bash from "refractor/lang/bash";
import c from "refractor/lang/c";
import cpp from "refractor/lang/cpp";
import csharp from "refractor/lang/csharp";
import css from "refractor/lang/css";
import dart from "refractor/lang/dart";
import diff from "refractor/lang/diff";
import docker from "refractor/lang/docker";
import go from "refractor/lang/go";
import graphql from "refractor/lang/graphql";
import ini from "refractor/lang/ini";
import java from "refractor/lang/java";
import javascript from "refractor/lang/javascript";
import json from "refractor/lang/json";
import jsx from "refractor/lang/jsx";
import kotlin from "refractor/lang/kotlin";
import less from "refractor/lang/less";
import lua from "refractor/lang/lua";
import makefile from "refractor/lang/makefile";
import markdown from "refractor/lang/markdown";
import markup from "refractor/lang/markup";
import nginx from "refractor/lang/nginx";
import php from "refractor/lang/php";
import python from "refractor/lang/python";
import r from "refractor/lang/r";
import ruby from "refractor/lang/ruby";
import rust from "refractor/lang/rust";
import scss from "refractor/lang/scss";
import sql from "refractor/lang/sql";
import swift from "refractor/lang/swift";
import toml from "refractor/lang/toml";
import tsx from "refractor/lang/tsx";
import typescript from "refractor/lang/typescript";
import yaml from "refractor/lang/yaml";
import zig from "refractor/lang/zig";

const LANGUAGE_MODULES: RefractorSyntax[] = [
  markup,
  markdown,
  javascript,
  typescript,
  jsx,
  tsx,
  sql,
  bash,
  css,
  scss,
  less,
  python,
  java,
  kotlin,
  swift,
  go,
  rust,
  ruby,
  php,
  csharp,
  cpp,
  c,
  lua,
  dart,
  r,
  graphql,
  json,
  yaml,
  toml,
  docker,
  nginx,
  makefile,
  diff,
  ini,
  zig,
];

export const REFRACTOR_REGISTERED_LANGUAGES = new Set<string>();

for (const language of LANGUAGE_MODULES) {
  Refractor.registerLanguage(language);
  REFRACTOR_REGISTERED_LANGUAGES.add(language.displayName);
}

export { Refractor };
