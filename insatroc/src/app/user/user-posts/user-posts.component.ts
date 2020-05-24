import { Component, OnInit } from '@angular/core';
import {HttpService } from '../../http.service'
import { Router } from '@angular/router';
import { PostModel } from '../../annonces/post_model';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { DeletePostDialog } from 'src/app/annonces/post-viewer-by-id/post-viewer-by-id.component';

@Component({
  selector: 'app-user-posts',
  templateUrl: './user-posts.component.html',
  styleUrls: ['./user-posts.component.css']
})
export class UserPostsComponent implements OnInit {
  Annonces :PostModel[]= [];

  constructor(public httpservice: HttpService, private router:Router, public dialog: MatDialog) { }

  onDisplayPost(id){
    for (let k=0 ; k<this.Annonces.length;k++){
      if(id == this.Annonces[k]._id){
        this.router.navigate(['/annonce'],{queryParams:{bid:id as string}});
      }
    }
  }

  ngOnInit(): void {
    // this.Annonces = this.httpservice.getUserPosts();
    // console.log(this.Annonces);


    this.httpservice.getUserPosts();
    this.httpservice.onPostsUpdate().subscribe(
      (res)=>{
        this.Annonces=res;
        for(let k=0 ;k<res.length;k++){
          this.httpservice.getPostsImages(res[k]._id);
        }
      }
    )
    this.httpservice.onImagesUpdate().subscribe(
      (res)=>{
        for(let k=0;k<this.Annonces.length;k++){
          if(this.Annonces[k]._id == Object.keys(res)[0]){
            this.Annonces[k].urls=res[this.Annonces[k]._id];
          }
        }
      }
    )
    for(let k= 0; k<this.Annonces.length;k++){
      this.httpservice.getPostsImages(this.Annonces[k]._id);
    }
    this.httpservice.getPostsImages(1);










  }

}
