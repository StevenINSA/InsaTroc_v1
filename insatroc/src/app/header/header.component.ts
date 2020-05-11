import { Component, OnInit } from '@angular/core';
import {HttpService} from '../http.service';
import {AuthService} from '../auth.service';
import {Router} from "@angular/router";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  sidetoggle = false;
  loggedin = true;
  themetoggle = false;


  constructor(public httpService: HttpService, public authService: AuthService, private router: Router) { }

  log (status) {
    console.log(status)
  }

  Disconnect(){
    this.loggedin = false;
    this.authService.logout().subscribe(
      (response) => {console.log(response);
                    this.authService.deleteUserInfo();
                    this.router.navigate(['']);},
      (error) => {console.log(error);},
    );

  }
  changetheme() {
    if (this.themetoggle) {
      this.httpService.changetheme('');
      this.themetoggle = !this.themetoggle;
    }else{
      this.httpService.changetheme('alternative');
      this.themetoggle = !this.themetoggle;
    }

  }
  test(){}

  ngOnInit(): void {
  }

}
