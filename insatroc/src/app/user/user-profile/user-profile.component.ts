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

  constructor(public httpService:HttpService, private authService: AuthService) { }

  ModifyUserInfo(form: FormGroup){
    this.authService.modifyUserInfo(form.value.first_name, form.value.last_name, form.value.username, form.value.email, form.value.password).subscribe(
      (response) => {console.log(response);
                    this.authService.setUserInfo({'user' : response['user']}, {'username' : response['username']});},
      (error) => {console.log(error)},
    );
  }

  ngOnInit(): void {
    this.form = new FormGroup({
      first_name: new FormControl(),
      last_name: new FormControl(),
      username: new FormControl(),
      email: new FormControl('', [Validators.email]),
      password: new FormControl('', []),
    });

    // this.form.disable();

    // this.authService.getUserInfo().subscribe(
    //   (response) => {this.form.value.first_name.setValue(response['first_name']);
    //                 this.user.last_name = response['last_name'];
    //                 this.user.email = response['email'];
    //                 this.user.username = response['username'];
    //                 this.user.phone_number = response['phone_number'];
    //                 this.user.other_contact_info = response['contact_info'];},
    //   (error) => {console.log(error)}
    // );

      // console.log(this.user.last_name);
    // this.form.value.first_name.setValue("Pénélope");
  }

}
