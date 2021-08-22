import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-hangman',
  templateUrl: './hangman.component.html',
  styleUrls: ['./hangman.component.css'],
})
export class HangmanComponent implements OnInit {
  word?: string;

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
}
