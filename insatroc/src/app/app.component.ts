import { Component, Injectable, Host, HostBinding,OnInit } from '@angular/core';
import { OverlayContainer} from '@angular/cdk/overlay';


import {HttpService} from './http.service';
import { AuthService } from './auth.service';
import { MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

constructor(public httpservice: HttpService, public authservice: AuthService, private matIconRegister : MatIconRegistry, private domsan :DomSanitizer){}
  title='insatroc';
  theme ;

  ngOnInit(): void {
    this.matIconRegister.addSvgIcon(
      'rhino',
      this.domsan.bypassSecurityTrustResourceUrl("../assets/rhino.svg")
    )
    this.theme = localStorage.getItem('theme');
    this.httpservice.onThemeUpdate().subscribe(
      (a) => {
        localStorage.setItem("theme",a as string);
        this.theme = a

        console.log(a);

      }
    )
    this.authservice.autoAuth();
  }
}
  