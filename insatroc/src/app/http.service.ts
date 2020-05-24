import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {PostModel} from './annonces/post_model';
import { Subject } from 'rxjs';
import { stringify } from 'querystring';
import { HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from "rxjs/";
import {MatSnackBar} from '@angular/material/snack-bar';
import { toBase64String } from '@angular/compiler/src/output/source_map';

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
  public ImagesUpdater = new Subject<any>();
  public PostsUpdater = new Subject<PostModel[]>();

  private users = [];

  constructor(private http: HttpClient, private router:Router, private _snackBar: MatSnackBar) { }

  myMethod(){
    this.http.get<{response:string}>('http://localhost:3000/').subscribe(
      (response) => { console.log(response)},
      (error) => {console.log(error)},
    );
  }

  // Ne marche pas si on réactualise la page
  // getPost2(id) : PostModel{
  //   console.log(this.posts);
  //   if(this.posts.length!=0){
  //     for(let k =0; k<this.posts.length; k++){
  //       if (id == this.posts[k]._id){
  //         return this.posts[k];
  //       }
  //     }
  //   }
  //   else{
  //     // return(this.getPost(id));

  //     this.getPost(id).subscribe(
  //       (response) => {console.log(response);
  //                     return response;},
  //       (error) => {console.log(error)}
  //     );
  //   }
  // }

  // Requête pour afficher une annonce spécifique
  getPost3(id){
    console.log(this.posts);
    if(this.posts.length!=0){
      for(let k =0; k<this.posts.length; k++){
        if (id == this.posts[k]._id){
          console.log("blablabla");
          return this.makeObservableFromPost(k);
        }
      }
    }
    else{
      return(this.getPost(id));
    }
  }

  makeObservableFromPost(id){
    var post = [];
    post.push({"AnnounceID":this.posts[id]._id, "Titre":this.posts[id].title, "categoryids": this.posts[id].category, "Prix":this.posts[id].price, "Description": this.posts[id].description, "DateDePublication": this.posts[id].date, "NombreDeVues": this.posts[id].views, "Username": this.posts[id].username, "NumTelephone": this.users[id].numTel, "Adresse": this.users[id].contactInfo});
    console.log("observable");
    console.log(post);
    const myObservable = new Observable((observer) => {
      observer.next(post);
      observer.complete()
    })
    return myObservable;
  }

// Requête pour afficher une annonce spécifique
  getPost(id: number){
    return(this.http.get('http://localhost:3000/getPost/'+ id));
  }

// Requête pour ajouter une annonce
  addPost(post:PostModel){
    console.log(post);
    this.http.post('http://localhost:3000/addPost',post).subscribe(
      (response) => { console.log(response)
        this.router.navigate(['/annonce'],{queryParams:{bid:response['postID'] as string}});
        this.posts.push({_id: response['postID'], title: post.title, description: post.description, category: post.category, price: post.price, urls: post.urls, date: post.date, views: post.views, username: post.username});
        this.users.push({"contactInfo": response['contact'], "numTel": response['phoneNb']});
      },
      (error) => {console.log(error)},
    );
  }

// Requête pour afficher toutes les annonces

  getAllPosts(){
    //requete get http vers backend pour récuperer les annonces depuis la BD
    // this.http.get<{response:string, posts:PostModel []}>('http://localhost:3000/posts').subscribe(
    this.posts = [];
    this.users = [];
    this.http.get('http://localhost:3000/posts').subscribe(
    (data)=>{
      console.log("data");
      console.log(data);
      var urls = []
      for(var i in data){
        this.posts.push({_id:data[i].AnnounceID, title: data[i].Titre, category: data[i].categoryids, price: data[i].Prix, description: data[i].Description, urls: data[i].urls, date: data[i].DateDePublication, views: data[i].NombreDeVues, username: data[i].Username});
        this.users.push({"contactInfo": data[i].Adresse, "numTel": data[i].NumTelephone});
      }
      this.PostsUpdater.next([...this.posts]);

      console.log(this.posts);
      console.log(this.users);
    })
    return({"posts": this.posts, "postUsers": this.users});
  }

  getPostsImages(id){
    const q ="?bid="+id
    this.http.get<{message : []}>('http://localhost:3000/images'+q).subscribe(
      (rep)=>{
        console.log("yeah");
        this.ImagesUpdater.next(rep)
        console.log(rep);
      }
    )
  }

// Incrémentation du nombre de vues d'une annonce quand un utilisateur clique dessus
  incrPostViews(bid:string){
    this.http.patch<{response:string}>('http://localhost:3000/incrview',{id:bid}).subscribe(
      (Resp)=>{
        console.log(Resp);
      }
    )
  }

// Requête pour récupérer toutes les annonces d'un utilisateur
  getUserPosts(){
    this.posts = [];
    this.http.get('http://localhost:3000/getUserPosts').subscribe(
    (data)=>{
      console.log("data");
      console.log(data);
      for(var i in data){
        this.posts.push({_id:data[i].AnnounceID, title: data[i].Titre, category: data[i].categoryids, price: data[i].Prix, description: data[i].Description, urls: null, date: data[i].DateDePublication, views: data[i].NombreDeVues, username: data[i].Username});
        this.users.push({"contactInfo": data[i].Adresse, "numTel": data[i].NumTelephone});
      }
      this.PostsUpdater.next([...this.posts])
      console.log(this.posts);
      console.log(this.users);
    })
    return(this.posts);
  }

// Requête pour rechercher une annonce par mot-clé
  getSearchResult(words){
    console.log("getSearchResult");
    console.log(words);
    this.posts = [];
    this.users = [];
    this.http.post('http://localhost:3000/search', {arg:words}).subscribe(
    (data)=>{
      console.log("data");
      console.log(data);
      for(var i in data){
        this.posts.push({_id:data[i].AnnounceID, title: data[i].Titre, category: data[i].categoryids, price: data[i].Prix, description: data[i].Description, urls: null, date: data[i].DateDePublication, views: data[i].NombreDeVues, username: data[i].Username});
        this.users.push({"contactInfo": data[i].Adresse, "numTel": data[i].NumTelephone});
      }
      this.PostsUpdater.next([...this.posts]);
      console.log(this.posts);
      console.log(this.users);
    })
    return({"posts": this.posts, "postUsers": this.users});
  }

  deletePost(postID){
    console.log(postID);
    this.http.post('http://localhost:3000/deletePost', {postID:postID}).subscribe(
      (response) => {console.log(response);
                    this.router.navigate(['mes-annonces']);
                    this._snackBar.open("Annonce supprimée","X", {duration: 2000});},
      (error) => {console.log(error)},
    );
  }

  onThemeUpdate(){
    return(this.themeUpdater.asObservable())
  }
  onImagesUpdate(){
    return(this.ImagesUpdater.asObservable())
  }
  onPostsUpdate(){
    return(this.PostsUpdater.asObservable())
  }
  changetheme(theme?:String){
    this.themeUpdater.next(theme)

  }
}
