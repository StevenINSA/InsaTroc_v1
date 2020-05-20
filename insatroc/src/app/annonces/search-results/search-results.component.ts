import { Component, OnInit } from '@angular/core';
import { PostModel } from '../post_model';
import {HttpService } from '../../http.service';
import {Router, ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.css']
})
export class SearchResultsComponent implements OnInit {
  posts : PostModel[] = [];

  constructor(public httpService:HttpService,private router :Router, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.posts = this.httpService.getSearchResult(params.arg);
      console.log("this.post");
      console.log(this.posts);
      //incr v
    })
  }

}
