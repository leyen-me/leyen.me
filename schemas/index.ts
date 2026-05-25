import job from "./job";
import profile from "./profile";
import project from "./project";
import post from "./post";
import author from "./author";
import { youtube } from "./youtube";
import { table } from "./table";
import blockContent from "./blockContent";
import quiz from "./quiz";
import { movie } from "./movie";
import { quote } from "./quote";
import { interviewQuestion } from "./interviewQuestion";
import passwordVault from "./passwordVault";
import passwordEntry from "./passwordEntry";
import { englishSettings } from "./englishSettings";
import { englishWord } from "./englishWord";
import { englishDailyLog } from "./englishDailyLog";

export const schemaTypes = [
  profile,
  job,
  project,
  post,
  author,
  movie,
  quote,
  interviewQuestion,
  passwordVault,
  passwordEntry,
  englishSettings,
  englishWord,
  englishDailyLog,

  // Reference types
  blockContent,
  youtube,
  table,
  quiz,
];
