import { Component, OnInit } from '@angular/core';
import {NgForm, FormControl, Validators, FormGroup} from '@angular/forms';
import { HeaderComponent } from '../header/header.component';
import {HttpService } from '../http.service';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-connection',
  templateUrl: './connection.component.html',
  styleUrls: ['./connection.component.css']
})
export class ConnectionComponent implements OnInit {
  form: FormGroup;
  // email = new FormControl('', [Validators.email]);
  // password = new FormControl('', []);
  hide=true;

  constructor(public httpService:HttpService, private authService: AuthService, private router: Router) { }

  // getEmailErrorMessage() {
  //   if (this.form.value.email.hasError('required')) {
  //     return 'Veuillez remplir ce champ';
  //   }
  //   return this.form.value.email.hasError('email') ? 'Email non valide' : '';
  // }
  // getPasswordErrorMessage() {
  //   if (this.form.value.password.hasError('required')) {
  //     return 'Veuillez remplir ce champ';
  //   }
  //   if (this.form.value.password.hasError('minlength')) {
  //     return 'Doit contenir au moins 5 caractères';
  //   }
  //   if (this.form.value.password.hasError('maxlength')) {
  //     return 'Ne doit pas contenir plus de 25 caractères';
  //   }

  // }

  Login(form: FormGroup){

    this.authService.validate(form.value.email, form.value.password).subscribe(
      (response) => {console.log(response);
                    this.authService.setUserInfo({'user' : response['user']});
                    this.router.navigate(['']);},
      (error) => {console.log(error)},
    );

    // this.authService.validate(form.value.email, form.value.password)
    // .then((response) => {
    //  this.authService.setUserInfo({'user' : response['user']});
    //  this.router.navigate(['']);
    // })

  }

  ngOnInit(): void {
    this.form = new FormGroup({
      email: new FormControl('', [Validators.email]),
      password: new FormControl('', [])
    })
  }

}
