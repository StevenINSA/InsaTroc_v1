import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http : HttpClient) { }

  public isAuthenticated() : Boolean {
    let userEmail = localStorage.getItem('userEmail');
    if(userEmail && JSON.parse(userEmail)){
      return true;
    }
    return false;
  }

  // localStorage ou sessionStorage

  public setUserInfo(user, username){
    localStorage.setItem('userEmail', JSON.stringify(user));
    localStorage.setItem('username', JSON.stringify(username));
  }

  public deleteUserInfo(){
    localStorage.clear();
  }

  public getUsername(){
    if(this.isAuthenticated()){
      return (JSON.parse(localStorage.getItem('username')).username);
    }
    else{
      return null;
    }
  }

  public getUserInfo(){
    if(this.isAuthenticated()){
      return this.http.get('http://localhost:3000/getUserInfo');
    }
  }

  public validate(email, password) {
    return this.http.post('http://localhost:3000/authenticate', {'email' : email, 'password' : password});
    // stocker la valeur de retour (token) pour le mettre
  }

  public register(firstname, lastname, username, email, password){
    return this.http.post('http://localhost:3000/register', {'first_name' : firstname, 'last_name' : lastname, 'username' : username, 'email' : email, 'password' : password});
  }

  public modifyUserInfo(firstname, lastname, username, email, password){

  }

  public logout(){
    return this.http.get('http://localhost:3000/logout/');
  }
}
