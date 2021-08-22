import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import { State } from '../models/state.model';

@Component({
  selector: 'app-hangman',
  templateUrl: './hangman.component.html',
  styleUrls: ['./hangman.component.css'],
})
export class HangmanComponent implements OnInit {
  StateEnum = State;
  state = State.Active;

  static readonly MAX_LIVES = 6;
  lives = HangmanComponent.MAX_LIVES;
  word = '';
  guessedLetters = [] as string[];
  correctChars = [] as boolean[];

  shownErrors = null as ValidationErrors | null;
  guessControl = new FormControl('', [
    Validators.pattern(/^[a-zA-Z]+$/),
    this.alreadyGuessedValidator(),
    this.charOrWordLengthValidator(),
  ]);

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.updateRandomWord();
  }

  updateRandomWord() {
    this.http
      .get('http://localhost:4200/assets/words.txt', {
        responseType: 'text',
      })
      .subscribe((data) => {
        const words = data.split(/\r?\n/);
        this.word = words[~~(Math.random() * words.length)];
        console.log(this.word);

        this.correctChars = Array(this.word.length).fill(false);
      });
  }

  reset() {
    this.updateRandomWord();
    this.lives = HangmanComponent.MAX_LIVES;
    this.guessedLetters = [];
    this.state = State.Active;
  }

  hint() {
    return this.correctChars
      .map((correct, i) => (correct ? this.word[i] : '-'))
      .join('');
  }

  livesDisplay() {
    return `${this.lives}/${HangmanComponent.MAX_LIVES}`;
  }

  onSubmit(e: Event) {
    e.preventDefault();

    if (this.guessControl.invalid) {
      this.shownErrors = this.guessControl.errors;
      return;
    }
    this.shownErrors = null;

    const guess = ((this.guessControl.value ?? '') as string).toLowerCase();

    if (guess.length === 1) {
      this.guessChar(guess);
    } else if (guess == this.word) {
      this.win();
    } else {
      this.lose();
    }

    this.guessControl.reset();
  }

  guessChar(chr: string) {
    this.guessedLetters.push(chr);

    let anyCorrect = false;
    this.correctChars = this.correctChars.map((correct, i) => {
      if (this.word[i] == chr) {
        correct = true;
        anyCorrect = true;
      }
      return correct;
    });

    if (!anyCorrect) {
      if (--this.lives <= 0) {
        this.lose();
      }
    } else if (this.correctChars.every((correct) => correct)) {
      this.win();
    }
  }

  win() {
    this.state = State.Win;
  }

  lose() {
    this.state = State.Loss;
  }

  charOrWordLengthValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const inputLength = control.value ? (control.value.length as number) : 0;

      return inputLength == 1 || inputLength == this.word.length
        ? null
        : { invalidLength: { value: control.value } };
    };
  }

  alreadyGuessedValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value || control.value.length != 1) return null;

      const guess = control.value.toLowerCase();
      return this.guessedLetters.includes(guess)
        ? { alreadyGuessed: { value: control.value } }
        : null;
    };
  }
}
