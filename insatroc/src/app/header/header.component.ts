import { Component, OnInit } from '@angular/core';
import {HttpService} from '../http.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  sidetoggle = false;
  loggedin = true;
  themetoggle = false;


  constructor(public httpService: HttpService) { }

  log (status) {
    console.log(status)
  }

  Disconnect(){
    this.loggedin = false;
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
