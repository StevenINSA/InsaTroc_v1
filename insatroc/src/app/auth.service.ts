import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private token :string;
  public authUpdater = new Subject<boolean>();
  private authStatus = false;


  constructor(private http : HttpClient,private router:Router, public dialog: MatDialog, private _snackBar: MatSnackBar) { }

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
      this.authStatus = true;
    }else{
      this.authUpdater.next(false);
      this.authStatus = false;
    }

  }
  onAuthUpdate(){
    return this.authUpdater.asObservable();
  }
  getAuthStatus(){
    return this.authStatus;
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


/*********************************************************************
*                    REQUÊTES POUR LE BACKEND                        *
*********************************************************************/

  // récupérer les infos d'un utilisateur
  public getUserInfo(){
    return this.http.get('http://localhost:3000/getUserInfo');
  }

  // vérifier si un utilisateur a rempli ses infos de contact
  public checkUserContactInfo(){
    // console.log("checkUserInfo");
    // this.http.get('http://localhost:3000/checkUserContactInfo').subscribe(
    //   (response)=>{console.log(response);
    //               return true;},
    //   (error)=>{console.log(error);
    //             return false;}
    // )
    // // return false;
    return this.http.get('http://localhost:3000/checkUserContactInfo');
  }

  // se connecter
  public validate(email, password) {
    this.http.post<{token:string,username:string}>('http://localhost:3000/authenticate', {'email' : email, 'password' : password}).subscribe(
      (response)=>{
        console.log(atob(response.token.split('.')[1]));
        this.setUserInfo(response.token,response.username);
        this.isAuhenticated2();
        this.router.navigate(['/']);
        this.setTimer(this.timeLeft());
      },
      (error)=>{
        this.authUpdater.next(false);
      }
    )
  }

  // se créer un compte
  public register(firstname, lastname, username, email, password, question1, answer1, question2, answer2){
    this.deleteUserInfo();
    this.http.post<{token:string,username:string}>('http://localhost:3000/register', {'first_name' : firstname, 'last_name' : lastname, 'username' : username, 'email' : email, 'password' : password, 'question1': question1, 'answer1': answer1, 'question2': question2, 'answer2': answer2}).subscribe(
      (response)=>{
        console.log(response);
        this.setUserInfo(response.token,response.username);
        this.isAuhenticated2();
        this.router.navigate(['mon-profil']);
        this.setTimer(this.timeLeft());
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

  // modifier les infos d'un utilisateur
  public modifyUserInfo(firstname, lastname, username, phone, other){
    // this.deleteUserInfo();

    this.http.post('http://localhost:3000/modifyUserInfo', {'firstname' : firstname, 'lastname' : lastname, 'username' : username, 'phone':phone, 'other':other}).subscribe(
      (response) => {console.log(response);
                      // localStorage.removeItem('username');
                      localStorage.setItem('username', username);
                      this._snackBar.open("Votre profil a bien été modifié.","x", {duration: 4000});},
      (error) => {console.log(error)},
    );
  }

  // se déconnecter
  public logout(){
    return this.http.get('http://localhost:3000/logout/');
  }

  // supprimer son compte
  public deleteAccount(password){
    return (this.http.post('http://localhost:3000/deleteUserAccount', {'password' : password}));
    // this.http.post('http://localhost:3000/deleteUserAccount', {'password' : password}).subscribe(
    //   (response) => {console.log(response);
    //                   this.deleteUserInfo();
    //                   this.router.navigate(['']);
    //                   this.dialog.closeAll()},
    //   (error) => {console.log(error);},
    // );
  }

  // modifier son mot de passe
  public changePassword(oldPassword, newPassword){
    return (this.http.post('http://localhost:3000/modifyPassword', {"oldPassword": oldPassword, "newPassword": newPassword}));
  }

  public getSecretQuestions(email){
    return this.http.post('http://localhost:3000/getUserSecretQuestions', {email: email});
  }

  public checkSecretQuestions(answer1, answer2){
    return this.http.post('http://localhost:3000/forgotPassword', {answer1: answer1, answer2: answer2});
  }

  public resetPassword(email, password){
    this.http.post('http://localhost:3000/resetPassword', {email: email, password: password}).subscribe(
      (response)=>{
        console.log(response);
        this.setUserInfo(response['token'],response['username']);
        this.isAuhenticated2();
        this.router.navigate(['mon-profil']);
        this.setTimer(this.timeLeft());
      },
      (error)=>{
        console.log("error resetPassword:"+error);}
  )}


/*********************************************************************
*               Authentication and Token Management                  *
*********************************************************************/
  //handling the token
  private getTokenData(token:string,choice:number){
    const decodedtok = JSON.parse(atob(token.split('.')[1]));
    if (choice ==0){
      return decodedtok.exp-decodedtok.iat
    }
  }
  public autoAuth(){
    try {
      const life = this.timeLeft();
      console.log(life);
      if (life>0){
        this.setTimer(life);
        //this.isAuthenticated();
        this.isAuhenticated2();
      }else{
        console.log("TOKEN EXPIRED , RETURN TO THE VOOOOID");
        this.deleteUserInfo();
        this.isAuthenticated();
      }
    }catch (err){
      this.deleteUserInfo();
      //this.isAuthenticated();
      this.isAuhenticated2();
    }
  }
  private timeLeft(){
    const datee = new Date(localStorage.getItem("expiration"));
    const nowdate = new Date()
    return (datee.getTime()-nowdate.getTime())
  }
  private setTimer(time:number){
    setTimeout(()=>{
      //this.token=null;
      //this.isAuhenticated();
      this.authUpdater.next(false);
      this.authStatus = false;
      console.log("expired");
    },time)

  }

  public disconnect(){
    this.authStatus=false;
  }
}
