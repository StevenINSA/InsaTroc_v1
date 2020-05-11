import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http : HttpClient) { }

  public isAuthenticated() : Boolean {
    let userData = localStorage.getItem('userInfo')
    if(userData && JSON.parse(userData)){
      return true;
    }
    return false;
  }

  // localStorage ou sessionStorage

  public setUserInfo(user){
    localStorage.setItem('userInfo', JSON.stringify(user));
  }

  public validate(email, password) {
    return this.http.post('http://localhost:3000/authenticate', {'email' : email, 'password' : password});
    // stocker la valeur de retour (token) pour le mettre
  }

  public register(firstname, lastname, username, email, password){
    return this.http.post('http://localhost:3000/register', {'first_name' : firstname, 'last_name' : lastname, 'username' : username, 'email' : email, 'password' : password});
  }
}
