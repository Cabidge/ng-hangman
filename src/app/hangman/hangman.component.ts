import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';

function charOrWordLengthValidator(word: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const inputLength = control.value ? (control.value.length as number) : 0;

    return inputLength == 1 || inputLength == word.length
      ? null
      : { invalidLength: { value: control.value } };
  };
}

function alreadyGuessedValidator(guessedLetters: string[]): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value || control.value.length != 1) return null;

    const guess = control.value.toLowerCase();
    return guessedLetters.includes(guess)
      ? { alreadyGuessed: { value: control.value } }
      : null;
  };
}

@Component({
  selector: 'app-hangman',
  templateUrl: './hangman.component.html',
  styleUrls: ['./hangman.component.css'],
})
export class HangmanComponent implements OnInit {
  word = '';
  guessedLetters = [] as string[];
  correctChars = [] as boolean[];

  shownErrors = null as ValidationErrors | null;
  guessControl = new FormControl('', [
    Validators.pattern(/^[a-zA-Z]+$/),
    alreadyGuessedValidator(this.guessedLetters),
  ]);

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http
      .get('http://localhost:4200/assets/words.txt', {
        responseType: 'text',
      })
      .subscribe((data) => {
        const words = data.split(/\r?\n/);
        this.word = words[~~(Math.random() * words.length)];
        this.correctChars = Array(this.word.length).fill(false);
        this.guessControl.addValidators(charOrWordLengthValidator(this.word));
        console.log(this.word);
      });
  }

  hint() {
    return this.correctChars
      .map((correct, i) => (correct ? this.word[i] : '-'))
      .join('');
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
      alert('Correct guess');
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
      alert('Incorrect guess');
    }
  }
}
