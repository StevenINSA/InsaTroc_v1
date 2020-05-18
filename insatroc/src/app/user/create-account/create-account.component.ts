import { Component, OnInit } from '@angular/core';
import {NgForm, FormControl, Validators, FormGroup} from '@angular/forms';
import {HttpService } from '../../http.service';
import { AuthService } from '../../auth.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-create-account',
  templateUrl: './create-account.component.html',
  styleUrls: ['./create-account.component.css']
})
export class CreateAccountComponent implements OnInit {
  form: FormGroup;
  hide = true;
  error = false;
  private authSub : Subscription;


  constructor(public httpService:HttpService, private authService: AuthService, private router: Router) { }

  Register(form: FormGroup){
    this.authService.register(form.value.first_name, form.value.last_name, form.value.username, form.value.email, form.value.password)/*.subscribe(
      (response) => {console.log(response);
                    this.authService.setUserInfo(response['token'], response['username']);
                    this.router.navigate(['mon-profil']);},
      (error) => {console.log(error)
        console.log(error.error.message);
                  if(error.error.message == "username or password already exists"){
                    this.error = true;
                    this.form.patchValue({
                      username: '',
                      email: '',
                      password: '',
                    })
                  }
                },
    );*/
  }

  ngOnInit(): void {
    this.form = new FormGroup({
      first_name: new FormControl(),
      last_name: new FormControl(),
      username: new FormControl(),
      email: new FormControl('', [Validators.email]),
      password: new FormControl('', []),
    })
    this.authSub=this.authService.onAuthUpdate().subscribe(
      (res)=>{
        if(!res){
          this.error=true;
          this.form.patchValue({
            username:'',
            email:'',
            password:''
          })
        }
      }
    )
  }
  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.authSub.unsubscribe();
  }

}
