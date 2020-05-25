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
    return this.http.get('http://localhost:3000/checkUserContactInfo');
  }

  // se connecter
  public validate(email, password) {
    this.http.post<{token:string,username:string}>('http://localhost:3000/authenticate', {'email' : email, 'password' : password}).subscribe(
      (response)=>{
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
    );
  }

  // modifier les infos d'un utilisateur
  public modifyUserInfo(firstname, lastname, username, phone, other, questionID1, answer1, questionID2, answer2){
    this.http.post('http://localhost:3000/modifyUserInfo', {'firstname' : firstname, 'lastname' : lastname, 'username' : username, 'phone':phone, 'other':other,  'question1': questionID1, 'answer1': answer1, 'question2': questionID2, 'answer2': answer2}).subscribe(
      (response) => {console.log(response);
                      localStorage.setItem('username', username);
                      this._snackBar.open("Votre profil a bien été modifié.","x", {duration: 4000});},
      (error) => {console.log(error);
                  if(error.error.message =="username already exists"){
                    this.authUpdater.next(false)
                  }},
    );
  }

  // se déconnecter
  public logout(){
    return this.http.get('http://localhost:3000/logout/');
  }

  // supprimer son compte
  public deleteAccount(password){
    return (this.http.post('http://localhost:3000/deleteUserAccount', {'password' : password}));
  }

  // modifier son mot de passe
  public changePassword(oldPassword, newPassword){
    return (this.http.post('http://localhost:3000/modifyPassword', {"oldPassword": oldPassword, "newPassword": newPassword}));
  }

  // modifier ses questions secrètes
  public changeSecretQuestions(oldPassword, questionID1, answer1, questionID2, answer2){
    return (this.http.post('http://localhost:3000/modifySecretQuestions', {"oldPassword": oldPassword, "question1": questionID1, "answer1": answer1, "question2": questionID2, "answer2": answer2}));
  }

  // récupérer les questions secrètes d'un utilisateur à partir de son email quand il a oublié son mot de passe
  public getSecretQuestions(email){
    return this.http.post('http://localhost:3000/getUserSecretQuestions', {email: email});
  }

  // vérifier si ses réponses aux questions secrètes sont correctes
  public checkSecretQuestions(answer1, answer2,email){
    return this.http.post('http://localhost:3000/forgotPassword', {answer1: answer1, answer2: answer2, email:email});
  }

  // réinitialiser son mot de passe
  public resetPassword(email, password){
    this.http.post('http://localhost:3000/resetPassword', {email: email, password: password}).subscribe(
      (response)=>{
        this.setUserInfo(response['token'],response['username']);
        this.isAuhenticated2();
        this.router.navigate(['mon-profil']);
        this.setTimer(this.timeLeft());
        this._snackBar.open("Mot de passe changé avec succès","X", {duration: 2000});
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
      if (life>0){
        this.setTimer(life);
        this.isAuhenticated2();
      }else{
        console.log("Token Expired");
        this.deleteUserInfo();
        this.isAuthenticated();
      }
    }catch (err){
      this.deleteUserInfo();
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
      this.authUpdater.next(false);
      this.authStatus = false;
      console.log("expired");
    },time)

  }

  public disconnect(){
    this.authStatus=false;
  }
}
