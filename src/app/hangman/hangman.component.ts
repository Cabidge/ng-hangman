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

@Component({
  selector: 'app-hangman',
  templateUrl: './hangman.component.html',
  styleUrls: ['./hangman.component.css'],
})
export class HangmanComponent implements OnInit {
  word = '';
  guessedLetters = [] as string[];
  remainingIndices = [] as number[];

  shownErrors = null as ValidationErrors | null;
  guessControl = new FormControl('', [Validators.pattern(/^[a-zA-Z]+$/)]);

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http
      .get('http://localhost:4200/assets/words.txt', {
        responseType: 'text',
      })
      .subscribe((data) => {
        const words = data.split(/\r?\n/);
        this.word = words[~~(Math.random() * words.length)];
        this.remainingIndices = [...Array(this.word.length).keys()];
        this.guessControl.addValidators(charOrWordLengthValidator(this.word));
      });
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

    const newRemaining = this.remainingIndices.filter(
      (idx) => this.word[idx] != chr
    );

    if (newRemaining.length == this.remainingIndices.length) {
      alert('Incorrect guess!');
    }

    this.remainingIndices = newRemaining;
  }
}
