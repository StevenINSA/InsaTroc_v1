import { Component, OnInit } from '@angular/core';
import {NgForm, FormControl, Validators} from '@angular/forms';

@Component({
  selector: 'app-create-account',
  templateUrl: './create-account.component.html',
  styleUrls: ['./create-account.component.css']
})
export class CreateAccountComponent implements OnInit {
  first_name = new FormControl();
  last_name = new FormControl();
  email = new FormControl('', [Validators.email]);
  password = new FormControl('', []);
  hide = true;

  constructor() { }

  getFirstNameErrorMessage() {
    if (this.first_name.hasError('required')) {
      return 'Veuillez remplir ce champ';
    }
  }
  getLastNameErrorMessage() {
    if (this.last_name.hasError('required')) {
      return 'Veuillez remplir ce champ';
    }
  }
  getEmailErrorMessage() {
    if (this.email.hasError('required')) {
      return 'Veuillez remplir ce champ';
    }
    return this.email.hasError('email') ? 'Email non valide' : '';
  }
  getPasswordErrorMessage() {
    if (this.password.hasError('required')) {
      return 'Veuillez remplir ce champ';
    }
    if (this.password.hasError('minlength')) {
      return 'Doit contenir au moins 5 caractères';
    }
    if (this.password.hasError('maxlength')) {
      return 'Ne doit pas contenir plus de 25 caractères';
    }

  }

  Login(form){}

  ngOnInit(): void {
  }

}
