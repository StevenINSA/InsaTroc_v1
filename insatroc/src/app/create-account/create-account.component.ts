import { Component, OnInit } from '@angular/core';
import {NgForm, FormControl, Validators, FormGroup} from '@angular/forms';
import {HttpService } from '../http.service';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-account',
  templateUrl: './create-account.component.html',
  styleUrls: ['./create-account.component.css']
})
export class CreateAccountComponent implements OnInit {
  form: FormGroup;
  hide = true;

  constructor(public httpService:HttpService, private authService: AuthService, private router: Router) { }

  // getFirstNameErrorMessage() {
  //   if (this.first_name.hasError('required')) {
  //     return 'Veuillez remplir ce champ';
  //   }
  // }
  // getLastNameErrorMessage() {
  //   if (this.last_name.hasError('required')) {
  //     return 'Veuillez remplir ce champ';
  //   }
  // }
  // getEmailErrorMessage() {
  //   if (this.email.hasError('required')) {
  //     return 'Veuillez remplir ce champ';
  //   }
  //   return this.email.hasError('email') ? 'Email non valide' : '';
  // }
  // getPasswordErrorMessage() {
  //   if (this.password.hasError('required')) {
  //     return 'Veuillez remplir ce champ';
  //   }
  //   if (this.password.hasError('minlength')) {
  //     return 'Doit contenir au moins 5 caractères';
  //   }
  //   if (this.password.hasError('maxlength')) {
  //     return 'Ne doit pas contenir plus de 25 caractères';
  //   }

  // }

  Register(form: FormGroup){
    this.authService.register(form.value.first_name, form.value.last_name, form.value.email, form.value.password).subscribe(
      (response) => {console.log(response);
                    this.authService.setUserInfo({'user' : response['user']});
                    this.router.navigate(['']);},
      (error) => {console.log(error)},
    );
  }

  ngOnInit(): void {
    this.form = new FormGroup({
      first_name: new FormControl(),
      last_name: new FormControl(),
      email: new FormControl('', [Validators.email]),
      password: new FormControl('', []),
    })
  }

}
