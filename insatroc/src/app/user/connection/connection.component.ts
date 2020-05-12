import { Component, OnInit } from '@angular/core';
import {NgForm, FormControl, Validators, FormGroup} from '@angular/forms';
import { HeaderComponent } from '../../header/header.component';
import {HttpService } from '../../http.service';
import { AuthService } from '../../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-connection',
  templateUrl: './connection.component.html',
  styleUrls: ['./connection.component.css']
})
export class ConnectionComponent implements OnInit {
  form: FormGroup;
  login_validated = true;
  hide=true;

  constructor(public httpService:HttpService, private authService: AuthService, private router: Router) { }

  Login(form: FormGroup){

    this.authService.validate(form.value.email, form.value.password).subscribe(
      (response) => {console.log(response);
                    this.authService.setUserInfo(response['user'], response['username']);
                    this.router.navigate(['']);},
      (error) => {console.log(error);
                  this.login_validated = false;
                  this.form.reset();
                },
    );

  }

  ngOnInit(): void {
    this.form = new FormGroup({
      email: new FormControl('', [Validators.email]),
      password: new FormControl('', [])
    })
  }

}
