import { Component, OnInit } from '@angular/core';
import { PostModel } from '../post_model';
import {HttpService } from '../../http.service';
import {Router, ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-post-viewer-by-id',
  templateUrl: './post-viewer-by-id.component.html',
  styleUrls: ['./post-viewer-by-id.component.css']
})
export class PostViewerByIdComponent implements OnInit {

  post : PostModel = {
    _id: null,
    title: null,
    description: null,
    category: [],
    price: 0,
    urls: [],
    date: null,
    views: null,
    username: null,
  };



  constructor(public httpService:HttpService,private router :Router, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.post=this.httpService.getPost2(params.bid);
      console.log(this.post);
      //incr v
    })

  }

}
