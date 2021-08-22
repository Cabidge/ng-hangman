import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-hangman',
  templateUrl: './hangman.component.html',
  styleUrls: ['./hangman.component.css'],
})
export class HangmanComponent implements OnInit {
  word?: string;
  guessControl = new FormControl('');

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http
      .get('http://localhost:4200/assets/words.txt', {
        responseType: 'text',
      })
      .subscribe((data) => {
        const words = data.split(/\r?\n/);
        this.word = words[~~(Math.random() * words.length)];
      });
  }

  onSubmit(e: Event) {
    e.preventDefault();

    const guess = (this.guessControl.value as string).toLowerCase();
    if (guess.length === 1) {
      this.guessChar(guess);
    } else if (guess == this.word) {
      alert('Correct guess');
    }

    this.guessControl.reset();
  }

  guessChar(chr: string) {
    alert(`You guess the letter ${chr.toUpperCase()}`);
  }
}
