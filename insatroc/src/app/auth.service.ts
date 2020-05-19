import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private token :string;
  public authUpdater = new Subject<boolean>();


  constructor(private http : HttpClient,private router:Router, public dialog: MatDialog) { }

  public isAuthenticated() : Boolean {
    let token = localStorage.getItem('token');
    if(token){
      return true;
    }
    return false;
  }
  isAuhenticated2(){
    const token = localStorage.getItem('token');

    if(token){
      this.authUpdater.next(true)
    }else{
      this.authUpdater.next(false);
    }

  }
  onAuthUpdate(){
    return this.authUpdater.asObservable();
  }

  // localStorage ou sessionStorage

  public setUserInfo(token, username){
    localStorage.setItem('token', token);
    localStorage.setItem('username', username);
    const now = new Date();
    console.log(now);
    const expDate = new Date(now.getTime()+(this.getTokenData(token,0)*1000));
    console.log(this.getTokenData(token,0));
    console.log(expDate);
    localStorage.setItem("expiration",expDate.toISOString());
  }

  public deleteUserInfo(){
    localStorage.clear();
  }

  public getUsername(){
    if(this.isAuthenticated()){
      return (localStorage.getItem('username'));
    }
    else{
      return null;
    }
  }

  public getUserInfo(){
    return this.http.post('http://localhost:3000/getUserInfo', {'username' : this.getUsername()});
  }

  public validate(email, password) {
    this.http.post<{token:string,username:string}>('http://localhost:3000/authenticate', {'email' : email, 'password' : password}).subscribe(
      (response)=>{
        console.log(atob(response.token.split('.')[1]));
        this.setUserInfo(response.token,response.username);
        this.isAuhenticated2();
        this.router.navigate(['/']);


      },
      (error)=>{
        this.authUpdater.next(false);

      }

    )
    // stocker la valeur de retour (token) pour le mettre
  }

  public register(firstname, lastname, username, email, password){
    this.deleteUserInfo();
    this.http.post<{token:string,username:string}>('http://localhost:3000/register', {'first_name' : firstname, 'last_name' : lastname, 'username' : username, 'email' : email, 'password' : password}).subscribe(
      (response)=>{
        console.log(response);
        this.setUserInfo(response.token,response.username);
        this.router.navigate(['mon-profil']);
      },
      (error)=>{
        console.log("error register:"+error);
        if(error.error.message =="username or password already exists"){
          console.log(999);
          this.authUpdater.next(false)
        }

      }
      /*(response) => {console.log(response);
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
    );
  }

  public modifyUserInfo(firstname, lastname, username, email, password){
    // this.deleteUserInfo();

    this.http.post('http://localhost:3000/modifyUserInfo', {'first_name' : firstname, 'last_name' : lastname, 'username' : username, 'email' : email, 'password' : password}).subscribe(
      (response) => {console.log(response);
                      // localStorage.removeItem('username');
                      localStorage.setItem('username', username);},
      (error) => {console.log(error)},
    );
  }

  public logout(){
    return this.http.get('http://localhost:3000/logout/');
  }

  public deleteAccount(password){
    this.http.post('http://localhost:3000/deleteUserAccount', {'password' : password}).subscribe(
      (response) => {console.log(response);
                      this.deleteUserInfo();
                      this.router.navigate(['']);
                      this.dialog.closeAll()},
      (error) => {console.log(error);},
    );
  }

  //handling the token
  private getTokenData(token:string,choice:number){
    const decodedtok = JSON.parse(atob(token.split('.')[1]));
    if (choice ==0){
      return decodedtok.exp-decodedtok.iat
    }
  }
}
