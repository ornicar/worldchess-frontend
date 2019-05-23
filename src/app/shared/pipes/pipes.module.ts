import {NgModule} from '@angular/core';
import {WcBgUrlPipe} from './bg-url.pipe';
import {ToIterablePipe} from './to-iterable.pipe';
import {GroupByPipe} from './group-by.pipe';
import {RemoveFigureNotationPipe} from './remove-figure-notation.pipe';
import {DurationPipe} from './duration.pipe';
import {SafeUrlPipe} from './safe-url.pipe';
import {HtmlSanitizerPipe} from './html-sanitizer.pipe';
import {NumberToWorlds} from './number-to-words.pipe';
import { WordsFirstLettersPipe } from './words-first-letters.pipe';
import { ReplacePipe } from './replace.pipe';
import { ProfileBirthdayPipe } from './profile-birthday.pipe';

@NgModule({
  declarations: [
    ToIterablePipe,
    GroupByPipe,
    RemoveFigureNotationPipe,
    DurationPipe,
    SafeUrlPipe,
    WcBgUrlPipe,
    HtmlSanitizerPipe,
    NumberToWorlds,
    WordsFirstLettersPipe,
    ReplacePipe,
    ProfileBirthdayPipe
  ],
  providers: [
    DurationPipe
  ],
  exports: [
    ToIterablePipe,
    GroupByPipe,
    RemoveFigureNotationPipe,
    DurationPipe,
    SafeUrlPipe,
    WcBgUrlPipe,
    HtmlSanitizerPipe,
    NumberToWorlds,
    WordsFirstLettersPipe,
    ReplacePipe,
    ProfileBirthdayPipe
  ]
})
export class PipesModule { }
