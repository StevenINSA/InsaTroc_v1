import { Component, OnInit } from '@angular/core';
import {NgForm, FormControl, Validators, FormGroup} from '@angular/forms';
import { AuthService } from '../../auth.service';
import {HttpService } from '../../http.service';
import { UserModel } from '../user_model';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  form: FormGroup;
  user: UserModel;
  hide = true;
  readonly = true;

  constructor(public httpService:HttpService, private authService: AuthService) { }

  ModifyUserInfo(form: FormGroup){
    if(this.readonly){
      this.readonly = false;
    }
    else {
      // this.authService.modifyUserInfo(form.value.first_name, form.value.last_name, form.value.username, form.value.email, form.value.password).subscribe(
      //   (response) => {console.log(response);
      //                 this.authService.setUserInfo({'user' : response['user']}, {'username' : response['username']});},
      //   (error) => {console.log(error)},
      // );
      this.readonly = true;
    }
  }

  ngOnInit(): void {
    this.form = new FormGroup({
      first_name: new FormControl(),
      last_name: new FormControl(),
      username: new FormControl(),
      email: new FormControl('', [Validators.email]),
      phone_number: new FormControl(),
      contact: new FormControl(),
      password: new FormControl('', []),
    });

    // this.form.disable();

    this.authService.getUserInfo().subscribe(
      (response) => { this.form.patchValue({
        first_name: response['first_name'],
        last_name: response['last_name'],
        username: response['username'],
        email: response['email'],
        phone_number: response['phone_number'],
        contact: response['contact_info'],
      })},
      (error) => {console.log(error)}
    );

      // console.log(this.user.last_name);
    // this.form.patchValue({
    //   first_name: "Pénélope",
    //   last_name: "Roullot"
    // });

    // this.form.disable();
  }

}
