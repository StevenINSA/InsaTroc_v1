import { Component, OnInit } from '@angular/core';
import {HttpService} from '../http.service';
import {AuthService} from '../auth.service';
import {Router} from "@angular/router";
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  slidetoggle = false;
  loggedin = false;
  themetoggle = false;
  search;

  constructor(public httpService: HttpService, public authService: AuthService, private router: Router) { }

  log (status) {
    console.log(status)
  }

  Search(words){
    // faire une recherche
    this.router.navigate(['/search'],{queryParams:{arg:words as string}});
    console.log("recherche :");
    console.log(this.search);
  }

  Disconnect(){
    this.loggedin = false;
    this.authService.disconnect();
    this.authService.logout().subscribe(
      (response) => {console.log(response);
                    this.authService.deleteUserInfo();
                    this.router.navigate(['']);},
      (error) => {console.log(error);},
    );

  }
  changetheme() {
    if (this.slidetoggle) {
      this.httpService.changetheme('');
      this.slidetoggle = false;
    }else{
      this.httpService.changetheme('alternative');
      console.log("ehemmm");
      this.slidetoggle = true;
    }

  }
  test(){}

  ngOnInit(): void {
    if (localStorage.getItem('theme')=="alternative"){
      this.slidetoggle=true;
    }
    this.loggedin=this.authService.getAuthStatus();
    this.authService.onAuthUpdate().subscribe(
      (resp)=>{
        console.log("header : "+resp);
        this.loggedin=resp;
      }
    )
  }

}
