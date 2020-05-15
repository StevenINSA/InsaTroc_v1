import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http : HttpClient) { }

  public isAuthenticated() : Boolean {
    let token = localStorage.getItem('token');
    if(token){
      return true;
    }
    return false;
  }

  // localStorage ou sessionStorage

  public setUserInfo(token, username){
    localStorage.setItem('token', token);
    localStorage.setItem('username', username);
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
    return this.http.post('http://localhost:3000/authenticate', {'email' : email, 'password' : password});
    // stocker la valeur de retour (token) pour le mettre
  }

  public register(firstname, lastname, username, email, password){
    this.deleteUserInfo();
    return this.http.post('http://localhost:3000/register', {'first_name' : firstname, 'last_name' : lastname, 'username' : username, 'email' : email, 'password' : password});
  }

  public modifyUserInfo(firstname, lastname, username, email, password){

  }

  public logout(){
    return this.http.get('http://localhost:3000/logout/');
  }
}
