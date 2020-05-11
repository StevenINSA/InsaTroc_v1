import { Component, OnInit } from '@angular/core';
import { HttpService } from '../http.service';
import {AuthService} from '../auth.service';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})
export class HomepageComponent implements OnInit {

  brews: Object;

  constructor(private _http: HttpService, private authService: AuthService) { }

  ngOnInit(): void {
    // this._http.getBeer().subscribe(data => {
    //   this.brews = data
    //   console.log(this.brews);
    // });
    console.log("homepage :");
    console.log(this.authService.isAuthenticated());
    console.log(localStorage);
    this._http.myMethod();
  }

}
