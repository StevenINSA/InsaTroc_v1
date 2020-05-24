import { Component, OnInit } from '@angular/core';
import { PostModel } from '../post_model';
import {HttpService } from '../../http.service';
import {Router, ActivatedRoute} from "@angular/router";
import {AuthService} from '../../auth.service';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Inject} from '@angular/core';

export interface DialogData {
  postID: number;
}

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
  postID: string;
  userColor;

  constructor(public httpService:HttpService, private router :Router, private route: ActivatedRoute, public authService: AuthService, public dialog: MatDialog) { }

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
          this.postID = this.post._id;
          this.userColor = this.getRandomColor();
          this.httpService.incrPostViews(this.post._id);

          this.httpService.getPostsImages(this.post._id);
          this.httpService.onImagesUpdate().subscribe(
            (res) => {console.log(res);
              this.post.urls = res[this.post._id];
            console.log(this.post.urls)}
          )

        },
        (error) => {console.log(error)}
      );
    })
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(DeletePostDialog, {
      width: '350px',
      data: {postID: this.postID}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  PlusSlides(n: number) {
    this.slideIndex+=n;
    console.log("plusslides");
  }

  currentSlide(n: number) {
    this.slideIndex = n;
  }

  getRandomColor(){
    var color = Math.floor(0x1000000 * Math.random()).toString(16);
    return '#' + ('000000' + color).slice(-6);
  }

}







@Component({
  selector: 'delete-post-dialog',
  templateUrl: 'delete-post-dialog.html',
})
export class DeletePostDialog {
  postID;

  constructor(
    public dialogRef: MatDialogRef<DeletePostDialog>,
    public authService: AuthService,
    private _snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: DeletePostDialog,
    public httpService:HttpService) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  DeletePost(postID){
    console.log(postID);
    this.httpService.deletePost(postID);
    this.dialogRef.close();
  }

}
