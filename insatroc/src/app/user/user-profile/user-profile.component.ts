import { Component, OnInit } from '@angular/core';
import {NgForm, FormControl, Validators, FormGroup} from '@angular/forms';
import { AuthService } from '../../auth.service';
import {HttpService } from '../../http.service';
import { UserModel } from '../user_model';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import {Inject} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Router} from "@angular/router";

export interface DialogData {
  password: string;
}

export interface PasswordDialogData {
  oldPassword: string;
  newPassword1: string;
  newPassword2: string;
}

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
  password: string;
  oldPassword: string;
  newPassword1: string;
  newPassword2: string;

  constructor(public httpService:HttpService, private authService: AuthService, public dialog: MatDialog) {}

  openDialog(): void {
    const dialogRef = this.dialog.open(DeleteAccountDialog, {
      width: '400px',
      data: {password: this.password}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      // if(result!=undefined){
      //   this.authService.deleteAccount(result);
      // }
    });
  }

  openPasswordDialog(): void {
    const dialogRef = this.dialog.open(ChangePasswordDialog, {
      width: '350px',
      data: {oldPassword: this.oldPassword, newPassword1: this.newPassword1, newPassword2: this.newPassword2},
      panelClass: 'change-password-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

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
      this.authService.modifyUserInfo(form.value.first_name, form.value.last_name, form.value.username, form.value.email, form.value.password);
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
  }

}



@Component({
  selector: 'delete-account-dialog',
  templateUrl: 'delete-account-dialog.html',
})
export class DeleteAccountDialog {
  hide = true;
  requiredError = false;
  wrongPassword = false;

  constructor(
    public dialogRef: MatDialogRef<DeleteAccountDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    public authService: AuthService,
    public router: Router,
    private _snackBar: MatSnackBar) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  deleteAccount(password){
    console.log(password);
    if(password!=undefined){
      this.authService.deleteAccount(password).subscribe(
        (response) => {console.log(response);
                        this.authService.deleteUserInfo();
                        this.router.navigate(['']);
                        this.dialogRef.close();
                        this._snackBar.open("Votre compte a bien été supprimé.","X", {duration: 3500});},
        (error) => {console.log(error);
                    if(error.error.message==("incorrect password")){
                      this.wrongPassword = true;
                    }},
      );
    }
    else{this.requiredError=true; console.log(this.requiredError)}
  }

  closeDialog(){
    this.dialogRef.close();
  }

  disabled(){
    if(this.data.password==undefined || this.data.password==''){
      return true;
    }
    return false;
  }

}








@Component({
  selector: 'change-password-dialog',
  templateUrl: 'change-password-dialog.html',
})
export class ChangePasswordDialog {
  hide1 = true;
  hide2 = true;
  hide3 = true;
  wrongPassword = false;

  constructor(
    public dialogRef: MatDialogRef<ChangePasswordDialog>,
    @Inject(MAT_DIALOG_DATA) public data: PasswordDialogData,
    public authService: AuthService,
    private _snackBar: MatSnackBar) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  changePassword(oldPassword, newPassword){
    console.log(oldPassword);
    this.authService.changePassword(oldPassword, newPassword).subscribe(
      (response) => {console.log(response);
                    this.dialogRef.close();
                    this._snackBar.open("Mot de passe changé avec succès","X", {duration: 2000});
                  },
      (error) => {console.log(error);
                  if(error.error.message=="Incorrect Password"){
                    this.wrongPassword = true;
                  }},
    );
  }

  closeDialog(){
    this.dialogRef.close();
  }

  disabled(){
    if(this.data.oldPassword==undefined || this.data.oldPassword==''
    || this.data.newPassword1==undefined || this.data.newPassword1==''
    || this.data.newPassword2==undefined || this.data.newPassword2==''
    || this.data.newPassword1!=this.data.newPassword2
    || this.passwordValidator(this.data.newPassword1) || this.passwordValidator(this.data.newPassword2)){
      return true;
    }
    return false;
  }

  passwordValidator(password: string){
    if(password==undefined || password==''){
      return null;
    }
    else if(password.length<5){
      return "Doit contenir au moins 5 caractères";
    }
    else if(password.length>25){
      return "Ne doit pas contenir plus de 25 caractères";
    }
    else{
      return null;
    }
  }

}
