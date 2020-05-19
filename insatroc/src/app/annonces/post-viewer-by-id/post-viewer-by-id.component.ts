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
  free: boolean;
  slideIndex = 0;
  post : PostModel;

  constructor(public httpService:HttpService,private router :Router, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.post = (this.httpService.getPost2(params.bid));
      console.log("this.post");
      console.log(this.post);
      console.log(this.post.description);
      this.httpService.incrPostViews(this.post._id);
      //incr v
    })
  }

  PlusSlides(n) {
    this.slideIndex+=n;
    console.log("plusslides");
  }

  currentSlide(n) {
    this.slideIndex = n;
  }

}
