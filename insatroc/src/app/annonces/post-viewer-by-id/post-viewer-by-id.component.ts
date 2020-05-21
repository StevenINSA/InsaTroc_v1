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
  user;

  constructor(public httpService:HttpService,private router :Router, private route: ActivatedRoute) { }

  ngOnInit(): void {

    // this.route.queryParams.subscribe(params => {
    //   this.post = (this.httpService.getPost2(params.bid));
    //   console.log("this.post");
    //   console.log(this.post);
    //   console.log(this.post.description);
    //   this.httpService.incrPostViews(this.post._id);
    // })

    // this.route.queryParams.subscribe(params => {
    //   this.httpService.getPost3(params.bid).subscribe(
    //     (response) => {console.log(response);
    //                   var res = response as JSON;
    //                   this.post = res['post'] as PostModel;
    //                   this.user = res['user'];
    //                 this.httpService.incrPostViews(this.post._id);},
    //     (error) => {console.log(error)}
    //   );
    // })

    this.route.queryParams.subscribe(params => {
      this.post = null;
      this.user = null;
      this.httpService.getPost3(params.bid).subscribe(
        (data)=>{
          console.log("data");
          console.log(data);
          var i = 0;
          this.post = {_id:data[i].AnnounceID, title: data[i].Titre, category: data[i].categoryids, price: data[i].Prix, description: data[i].Description, urls: null, date: data[i].DateDePublication, views: data[i].NombreDeVues, username: data[i].Username};
          this.user = {"contactInfo": data[i].Adresse, "numTel": data[i].NumTelephone};
          console.log(this.post);
          console.log(this.user);
          this.httpService.incrPostViews(this.post._id);
        },
        (error) => {console.log(error)}
      );
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
