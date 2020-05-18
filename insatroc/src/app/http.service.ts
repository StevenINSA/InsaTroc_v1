import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {PostModel} from './annonces/post_model';
import { Subject } from 'rxjs';
import { stringify } from 'querystring';
import { HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': 'my-auth-token'
  })
};


@Injectable({
  providedIn: 'root'
})
export class HttpService {
  private posts: PostModel[]= []
  public themeUpdater = new Subject<String>();

  constructor(private http: HttpClient, private router:Router) { }

  myMethod(){
    console.log('Hey, what\'s up?');
    // this.http.get('http://localhost:3000');
    this.http.get<{response:string}>('http://localhost:3000/').subscribe(
      (response) => { console.log(response)},
      (error) => {console.log(error)},
      // rediriger vers "/annonce/:id", id "étant l'ID de l'annonce qui est renvoyé par le serveur une fois qu'il l'a mise dans la DB"

    );
  }

  getPost2(id){
    console.log(this.posts);
    for(let k =0; k<this.posts.length; k++){
      if (id == this.posts[k]._id){
        return this.posts[k];
      }
    }
  }

  getPost(id: number){
    //return this.http.get('https://api.openbrewerydb.org/breweries')
    // return this.http.get('http://localhost:3000/post_viewer');
    this.http.get('http://localhost:3000/getPost/'+ id).subscribe(
      (response) => {console.log(response)},
      (error) => {console.log(error)},
    );
  }

  addPost(post:PostModel){
    //requete post http vers backend pour stocker post dans BD
    // this.posts.push(post);
    console.log(post);
    this.http.post('http://localhost:3000/addPost',post).subscribe(
      (response) => { console.log(response)
        // var postID = response.postID;
        this.router.navigate(['/annonce'],{queryParams:{bid:response['postID'] as string}});
        this.posts.push({_id: response['postID'], title: post.title, description: post.description, category: post.category, price: post.price, urls: post.urls, date: post.date, views: post.views, username: post.username});
      },
      (error) => {console.log(error)},
      // rediriger vers "/annonce/:id", id "étant l'ID de l'annonce qui est renvoyé par le serveur une fois qu'il l'a mise dans la DB"
    );
    // console.log(this.posts.length);
  }

  getAllPosts(){
    //requete get http vers backend pour récuperer les annonces depuis la BD
    // this.http.get<{response:string, posts:PostModel []}>('http://localhost:3000/posts').subscribe(
    this.posts = [];
    this.http.get('http://localhost:3000/posts').subscribe(
    (data)=>{
      console.log("data");
      console.log(data);
      for(var i in data){
        this.posts.push(data[i]);
      }
      console.log(this.posts);
    })
    return(this.posts);
  }

  getUserPosts(){
    this.posts = [];
    this.http.get('http://localhost:3000/getUserPosts').subscribe(
    (data)=>{
      console.log("data");
      console.log(data);
      for(var i in data){
        this.posts.push(data[i]);
      }
      console.log(this.posts);
    })
    return(this.posts);
  }


  onThemeUpdate(){
    return(this.themeUpdater.asObservable())
  }
  changetheme(theme?:String){
    this.themeUpdater.next(theme)

  }

  // attributeCategory(categoryID: number){
  //   var category = [];

  //   // for(let i in categoryID){
  //     switch (categoryID){
  //       case 1:
  //       category.push("Chambre");
  //       break;

  //       case 2:
  //       category.push("Cuisine");
  //       break;

  //       case 3:
  //       category.push("Salle de bain");
  //       break;

  //       case 4:
  //       category.push("Bureau");
  //       break;

  //       case 5:
  //       category.push("Loisirs/Sport");
  //       break;

  //       case 6:
  //       category.push("Autre");
  //       break;
  //       }
  //   // }
  //   return category;
  // }
}
