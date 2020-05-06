import { Component, Injectable, Host, HostBinding,OnInit } from '@angular/core';
import { OverlayContainer} from '@angular/cdk/overlay';


import {HttpService} from './http.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

constructor(public httpservice: HttpService){}
  title='insatroc';
  theme ;

  ngOnInit(): void {
    this.httpservice.onThemeUpdate().subscribe(
      (a) => {
        this.theme = a

        console.log(a);

      }
    )
  }
}
  